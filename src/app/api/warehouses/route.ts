import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .order('warehouse_id', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, address, max_capacity, latitude, longitude } = await request.json();

    if (!name || !address || !max_capacity) {
      return NextResponse.json({ error: 'Field wajib: name, address, max_capacity' }, { status: 400 });
    }

    if (max_capacity <= 0) {
      return NextResponse.json({ error: 'max_capacity harus > 0' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('warehouses')
      .insert([{ name, address, max_capacity, latitude, longitude }])
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
