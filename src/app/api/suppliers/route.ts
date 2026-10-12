import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('supplier_id', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, contact_person, phone, email, address } = await request.json();

    if (!name || !contact_person || !phone) {
      return NextResponse.json({ error: 'Field wajib: name, contact_person, phone' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('suppliers')
      .insert([{ name, contact_person, phone, email, address }])
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
