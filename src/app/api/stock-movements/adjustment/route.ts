import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function POST(request: Request) {
  try {
    const { product_id, location_id, quantity_change, user_id, reason, notes } = await request.json();

    if (!product_id || !location_id || quantity_change === undefined || !user_id || !reason) {
      return NextResponse.json({ 
        error: 'Field wajib: product_id, location_id, quantity_change, user_id, reason' 
      }, { status: 400 });
    }

    if (quantity_change === 0) {
      return NextResponse.json({ error: 'Perubahan quantity tidak boleh 0' }, { status: 400 });
    }

    // 1. Cek stok saat ini
    const { data: currentStock, error: fetchError } = await supabase
      .from('stock_levels')
      .select('*')
      .eq('product_id', product_id)
      .eq('location_id', location_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    const newQuantity = (currentStock?.quantity || 0) + quantity_change;
    if (newQuantity < 0) {
      return NextResponse.json({ error: 'Stok tidak boleh negatif' }, { status: 400 });
    }

    // 2. Update stock_levels
    if (currentStock) {
      const { error: updateError } = await supabase
        .from('stock_levels')
        .update({ quantity: newQuantity, last_updated_at: new Date().toISOString() })
        .eq('stock_id', currentStock.stock_id);
      if (updateError) throw updateError;
    } else if (newQuantity > 0) {
      const { error: insertError } = await supabase
        .from('stock_levels')
        .insert([{ product_id, location_id, quantity: newQuantity }]);
      if (insertError) throw insertError;
    }

    // 3. Catat movement (quantity disimpan negatif untuk pengurangan)
    const { error: movError } = await supabase
      .from('stock_movements')
      .insert([{
        product_id,
        user_id,
        to_location_id: location_id,
        movement_type: 'ADJUSTMENT',
        quantity: Math.abs(quantity_change),
        reference: reason,
        notes: `${reason}: ${notes || 'Koreksi stok'}`
      }]);

    if (movError) throw movError;

    return NextResponse.json({ 
      message: 'Adjustment stok berhasil',
      new_quantity: newQuantity 
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
