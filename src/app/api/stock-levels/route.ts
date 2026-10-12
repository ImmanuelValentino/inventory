import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');
    const locationId = searchParams.get('location_id');

    let query = supabase
      .from('stock_levels')
      .select(`
        *,
        products:product_id(sku, name, category, unit),
        locations:location_id(code, description, warehouses:warehouse_id(name))
      `);

    if (productId) {
      query = query.eq('product_id', parseInt(productId));
    }
    if (locationId) {
      query = query.eq('location_id', parseInt(locationId));
    }

    const { data, error } = await query.order('stock_level_id', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
