import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');
    const movementType = searchParams.get('movement_type');
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');

    let query = supabase
      .from('stock_movements')
      .select(`
        *,
        products:product_id(sku, name, unit),
        users:user_id(username),
        suppliers:supplier_id(name),
        from_locations:from_location_id(code, warehouses:warehouse_id(name)),
        to_locations:to_location_id(code, warehouses:warehouse_id(name))
      `);

    if (productId) {
      query = query.eq('product_id', parseInt(productId));
    }
    if (movementType) {
      query = query.eq('movement_type', movementType);
    }
    if (fromDate) {
      query = query.gte('movement_date', fromDate);
    }
    if (toDate) {
      query = query.lte('movement_date', toDate);
    }

    const { data, error } = await query.order('movement_date', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const {
      product_id,
      movement_type,
      quantity,
      user_id,
      supplier_id,
      from_location_id,
      to_location_id,
      notes
    } = await request.json();

    // Validasi field wajib
    if (!product_id || !movement_type || !quantity || !user_id) {
      return NextResponse.json({ error: 'Field wajib: product_id, movement_type, quantity, user_id' }, { status: 400 });
    }

    if (!['IN', 'OUT', 'TRANSFER', 'OPNAME', 'ADJUSTMENT'].includes(movement_type)) {
      return NextResponse.json({ error: 'movement_type tidak valid' }, { status: 400 });
    }

    // Validasi per tipe transaksi
    if (movement_type === 'IN') {
      if (!to_location_id) {
        return NextResponse.json({ error: 'IN butuh to_location_id' }, { status: 400 });
      }
      if (quantity <= 0) {
        return NextResponse.json({ error: 'Quantity harus > 0 untuk IN' }, { status: 400 });
      }
    }

    if (movement_type === 'OUT') {
      if (!from_location_id) {
        return NextResponse.json({ error: 'OUT butuh from_location_id' }, { status: 400 });
      }
      if (quantity <= 0) {
        return NextResponse.json({ error: 'Quantity harus > 0 untuk OUT' }, { status: 400 });
      }
    }

    if (movement_type === 'TRANSFER') {
      if (!from_location_id || !to_location_id) {
        return NextResponse.json({ error: 'TRANSFER butuh from_location_id dan to_location_id' }, { status: 400 });
      }
      if (quantity <= 0) {
        return NextResponse.json({ error: 'Quantity harus > 0 untuk TRANSFER' }, { status: 400 });
      }
    }

    if (movement_type === 'OPNAME' || movement_type === 'ADJUSTMENT') {
      if (!to_location_id) {
        return NextResponse.json({ error: `${movement_type} butuh to_location_id` }, { status: 400 });
      }
    }

    // Proses stock level updates
    if (movement_type === 'IN' || movement_type === 'OPNAME' || movement_type === 'ADJUSTMENT') {
      const { data: currentStock, error: fetchError } = await supabase
        .from('stock_levels')
        .select('*')
        .eq('product_id', product_id)
        .eq('location_id', to_location_id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const newQuantity = (currentStock?.quantity || 0) + quantity;
      if (newQuantity < 0) {
        return NextResponse.json({ error: 'Stok tidak boleh negatif' }, { status: 400 });
      }

      if (currentStock) {
        const { error: updateError } = await supabase
          .from('stock_levels')
          .update({ quantity: newQuantity, last_updated: new Date().toISOString() })
          .eq('stock_level_id', currentStock.stock_level_id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('stock_levels')
          .insert([{ product_id, location_id: to_location_id, quantity: newQuantity }]);

        if (insertError) throw insertError;
      }
    }

    if (movement_type === 'OUT') {
      const { data: currentStock, error: fetchError } = await supabase
        .from('stock_levels')
        .select('*')
        .eq('product_id', product_id)
        .eq('location_id', from_location_id)
        .single();

      if (fetchError) {
        return NextResponse.json({ error: 'Stok tidak ditemukan di lokasi ini' }, { status: 404 });
      }

      const newQuantity = currentStock.quantity - quantity;
      if (newQuantity < 0) {
        return NextResponse.json({ error: 'Stok tidak cukup' }, { status: 400 });
      }

      const { error: updateError } = await supabase
        .from('stock_levels')
        .update({ quantity: newQuantity, last_updated: new Date().toISOString() })
        .eq('stock_level_id', currentStock.stock_level_id);

      if (updateError) throw updateError;
    }

    if (movement_type === 'TRANSFER') {
      // Kurangi dari from_location
      const { data: fromStock, error: fromFetchError } = await supabase
        .from('stock_levels')
        .select('*')
        .eq('product_id', product_id)
        .eq('location_id', from_location_id)
        .single();

      if (fromFetchError) {
        return NextResponse.json({ error: 'Stok tidak ditemukan di lokasi asal' }, { status: 404 });
      }

      const newFromQuantity = fromStock.quantity - quantity;
      if (newFromQuantity < 0) {
        return NextResponse.json({ error: 'Stok tidak cukup di lokasi asal' }, { status: 400 });
      }

      const { error: fromUpdateError } = await supabase
        .from('stock_levels')
        .update({ quantity: newFromQuantity, last_updated: new Date().toISOString() })
        .eq('stock_level_id', fromStock.stock_level_id);

      if (fromUpdateError) throw fromUpdateError;

      // Tambah ke to_location
      const { data: toStock, error: toFetchError } = await supabase
        .from('stock_levels')
        .select('*')
        .eq('product_id', product_id)
        .eq('location_id', to_location_id)
        .single();

      if (toFetchError && toFetchError.code !== 'PGRST116') {
        throw toFetchError;
      }

      const newToQuantity = (toStock?.quantity || 0) + quantity;

      if (toStock) {
        const { error: toUpdateError } = await supabase
          .from('stock_levels')
          .update({ quantity: newToQuantity, last_updated: new Date().toISOString() })
          .eq('stock_level_id', toStock.stock_level_id);

        if (toUpdateError) throw toUpdateError;
      } else {
        const { error: toInsertError } = await supabase
          .from('stock_levels')
          .insert([{ product_id, location_id: to_location_id, quantity: newToQuantity }]);

        if (toInsertError) throw toInsertError;
      }
    }

    // Insert stock movement record
    const { data, error } = await supabase
      .from('stock_movements')
      .insert([{
        product_id,
        movement_type,
        quantity,
        user_id,
        supplier_id,
        from_location_id,
        to_location_id,
        notes,
        movement_date: new Date().toISOString()
      }])
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
