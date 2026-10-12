import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('product_id', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { sku, name, category, unit, cost_price, selling_price, minimum_stock_level } = await request.json();

    if (!sku || !name || !category || !unit || cost_price === undefined || selling_price === undefined) {
      return NextResponse.json({ error: 'Field wajib: sku, name, category, unit, cost_price, selling_price' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('products')
      .insert([{
        sku,
        name,
        category,
        unit,
        cost_price,
        selling_price,
        minimum_stock_level: minimum_stock_level || 0
      }])
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'SKU sudah ada' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
