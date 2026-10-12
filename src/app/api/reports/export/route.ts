import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'movements';
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const movementType = searchParams.get('movement_type');

    let data: any[] = [];

    if (type === 'movements') {
      let query = supabase
        .from('stock_movements')
        .select(`
          movement_id,
          movement_date,
          movement_type,
          quantity,
          reference,
          notes,
          products(sku, name),
          users(username),
          suppliers(name),
          from_locations:from_location_id(code),
          to_locations:to_location_id(code)
        `);

      if (startDate) query = query.gte('movement_date', startDate);
      if (endDate) query = query.lte('movement_date', endDate);
      if (movementType) query = query.eq('movement_type', movementType);

      const { data: result, error } = await query.order('movement_date', { ascending: false });
      if (error) throw error;

      data = (result || []).map((m: any) => ({
        'Movement ID': m.movement_id,
        'Tanggal': m.movement_date?.substring(0, 10),
        'Tipe': m.movement_type,
        'SKU': m.products?.sku,
        'Barang': m.products?.name,
        'Qty': m.quantity,
        'User': m.users?.username,
        'Supplier': m.suppliers?.name,
        'Dari': m.from_locations?.code,
        'Ke': m.to_locations?.code,
        'Referensi': m.reference,
        'Catatan': m.notes
      }));
    }

    if (type === 'stock') {
      const { data: result, error } = await supabase
        .from('stock_levels')
        .select(`
          product_id,
          quantity,
          last_updated_at,
          products(sku, name, category, unit),
          locations(code)
        `);

      if (error) throw error;

      data = (result || []).map((s: any) => ({
        'SKU': s.products?.sku,
        'Barang': s.products?.name,
        'Kategori': s.products?.category,
        'Unit': s.products?.unit,
        'Lokasi': s.locations?.code,
        'Qty': s.quantity,
        'Update Terakhir': s.last_updated_at?.substring(0, 10)
      }));
    }

    const csv = convertToCSV(data);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="export-${type}-${new Date().toISOString().substring(0, 10)}.csv"`
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
