import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';
import { hashPassword } from '@/src/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password, role = 'Staff' } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 });
    }

    if (!['Admin', 'Manager', 'Staff'].includes(role)) {
      return NextResponse.json({ error: 'Role tidak valid' }, { status: 400 });
    }

    const password_hash = await hashPassword(password);

    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{ username, password_hash, role }])
      .select('user_id, username, role, created_at')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
