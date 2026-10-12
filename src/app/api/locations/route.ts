import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get('warehouse_id');

    let query = supabase.from('locations').select('*');

    if (warehouseId) {
      query = query.eq('warehouse_id', parseInt(warehouseId));
    }

    const { data, error } = await query.order('location_id', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { warehouse_id, code, description } = await request.json();

    if (!warehouse_id || !code) {
      return NextResponse.json({ error: 'Field wajib: warehouse_id, code' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('locations')
      .insert([{ warehouse_id, code, description }])
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Location code sudah ada di warehouse ini' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
