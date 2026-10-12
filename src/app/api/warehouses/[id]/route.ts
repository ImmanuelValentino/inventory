import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('warehouses')
      .select('*')
      .eq('warehouse_id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Warehouse tidak ditemukan' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, address, max_capacity, latitude, longitude } = body;

    if (max_capacity !== undefined && max_capacity <= 0) {
      return NextResponse.json({ error: 'max_capacity harus > 0' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('warehouses')
      .update({ name, address, max_capacity, latitude, longitude })
      .eq('warehouse_id', params.id)
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Warehouse tidak ditemukan' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('warehouses')
      .delete()
      .eq('warehouse_id', params.id);

    if (error) throw error;

    return NextResponse.json({ message: 'Warehouse dihapus' });
  } catch (err: any) {
    if (err.code === '23503') {
      return NextResponse.json({ error: 'Warehouse masih digunakan di locations atau stock' }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
