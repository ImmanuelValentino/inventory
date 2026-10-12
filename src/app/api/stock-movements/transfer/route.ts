import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function POST(request: Request) {
  try {
    const { product_id, from_location_id, to_location_id, quantity, user_id, notes } = await request.json();

    if (!product_id || !from_location_id || !to_location_id || !quantity || !user_id) {
      return NextResponse.json({ error: 'Field wajib: product_id, from_location_id, to_location_id, quantity, user_id' }, { status: 400 });
    }

    if (from_location_id === to_location_id) {
      return NextResponse.json({ error: 'Lokasi asal dan tujuan tidak boleh sama' }, { status: 400 });
    }

    if (quantity <= 0) {
      return NextResponse.json({ error: 'Quantity harus > 0' }, { status: 400 });
    }

    // 1. Cek stok asal
    const { data: sourceStock, error: sourceError } = await supabase
      .from('stock_levels')
      .select('*')
      .eq('product_id', product_id)
      .eq('location_id', from_location_id)
      .single();

    if (sourceError || !sourceStock || sourceStock.quantity < quantity) {
      return NextResponse.json({ error: 'Stok di lokasi asal tidak mencukupi' }, { status: 400 });
    }

    // 2. Kurangi stok asal
    const { error: reduceError } = await supabase
      .from('stock_levels')
      .update({ quantity: sourceStock.quantity - quantity, last_updated_at: new Date().toISOString() })
      .eq('stock_id', sourceStock.stock_id);

    if (reduceError) throw reduceError;

    // 3. Tambah / Upsert stok tujuan
    const { data: destStock, error: destFetchError } = await supabase
      .from('stock_levels')
      .select('*')
      .eq('product_id', product_id)
      .eq('location_id', to_location_id)
      .single();

    if (destFetchError && destFetchError.code !== 'PGRST116') throw destFetchError;

    if (destStock) {
      const { error: updateDestError } = await supabase
        .from('stock_levels')
        .update({ quantity: destStock.quantity + quantity, last_updated_at: new Date().toISOString() })
        .eq('stock_id', destStock.stock_id);
      if (updateDestError) throw updateDestError;
    } else {
      const { error: insertDestError } = await supabase
        .from('stock_levels')
        .insert([{ product_id, location_id: to_location_id, quantity }]);
      if (insertDestError) throw insertDestError;
    }

    // 4. Catat movement
    const { error: movError } = await supabase
      .from('stock_movements')
      .insert([{
        product_id,
        user_id,
        from_location_id,
        to_location_id,
        movement_type: 'TRANSFER',
        quantity,
        notes: notes || 'Transfer antar lokasi'
      }]);

    if (movError) throw movError;

    return NextResponse.json({ message: 'Transfer stok berhasil' }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
