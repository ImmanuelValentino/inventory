'use client';

import { useEffect, useState } from 'react';

export default function Reports() {
  const [reportType, setReportType] = useState('movements');
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    movement_type: ''
  });
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReport = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.movement_type) params.append('movement_type', filters.movement_type);

    const endpoint = reportType === 'movements' 
      ? `/api/stock-movements?${params}`
      : `/api/stock-levels`;

    const res = await fetch(endpoint);
    const result = await res.json();
    setData(result.data || []);
    setLoading(false);
  };

  const exportCSV = () => {
    const params = new URLSearchParams({ type: reportType });
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.movement_type) params.append('movement_type', filters.movement_type);

    window.open(`/api/reports/export?${params}`, '_blank');
  };

  useEffect(() => {
    loadReport();
  }, [reportType]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Laporan</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Jenis Laporan</label>
            <select 
              value={reportType}
              onChange={e => setReportType(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="movements">Riwayat Pergerakan Stok</option>
              <option value="stock">Stok Saat Ini</option>
            </select>
          </div>

          {reportType === 'movements' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Dari Tanggal</label>
                <input 
                  type="date"
                  value={filters.start_date}
                  onChange={e => setFilters({ ...filters, start_date: e.target.value })}
                  className="border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sampai Tanggal</label>
                <input 
                  type="date"
                  value={filters.end_date}
                  onChange={e => setFilters({ ...filters, end_date: e.target.value })}
                  className="border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipe</label>
                <select 
                  value={filters.movement_type}
                  onChange={e => setFilters({ ...filters, movement_type: e.target.value })}
                  className="border rounded px-3 py-2"
                >
                  <option value="">Semua</option>
                  <option value="IN">IN</option>
                  <option value="OUT">OUT</option>
                  <option value="TRANSFER">TRANSFER</option>
                  <option value="OPNAME">OPNAME</option>
                  <option value="ADJUSTMENT">ADJUSTMENT</option>
                </select>
              </div>
            </>
          )}

          <button 
            onClick={loadReport}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Refresh
          </button>
          <button 
            onClick={exportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Ekspor CSV
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-8">Loading...</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          {reportType === 'movements' ? (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 text-left">Tanggal</th>
                  <th className="p-3 text-left">Tipe</th>
                  <th className="p-3 text-left">SKU</th>
                  <th className="p-3 text-left">Barang</th>
                  <th className="p-3 text-left">Qty</th>
                  <th className="p-3 text-left">Dari</th>
                  <th className="p-3 text-left">Ke</th>
                  <th className="p-3 text-left">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {data.map((m: any) => (
                  <tr key={m.movement_id} className="border-b">
                    <td className="p-3 text-sm">{m.movement_date?.substring(0, 10)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        m.movement_type === 'IN' ? 'bg-green-100 text-green-800' :
                        m.movement_type === 'OUT' ? 'bg-red-100 text-red-800' :
                        m.movement_type === 'TRANSFER' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {m.movement_type}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{m.products?.sku}</td>
                    <td className="p-3">{m.products?.name}</td>
                    <td className="p-3 font-semibold">{m.quantity}</td>
                    <td className="p-3 text-sm">{m.from_locations?.code || '-'}</td>
                    <td className="p-3 text-sm">{m.to_locations?.code || '-'}</td>
                    <td className="p-3 text-sm text-gray-600">{m.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 text-left">SKU</th>
                  <th className="p-3 text-left">Barang</th>
                  <th className="p-3 text-left">Lokasi</th>
                  <th className="p-3 text-left">Qty</th>
                  <th className="p-3 text-left">Update Terakhir</th>
                </tr>
              </thead>
              <tbody>
                {data.map((s: any) => (
                  <tr key={s.stock_id} className="border-b">
                    <td className="p-3 text-sm">{s.products?.sku}</td>
                    <td className="p-3">{s.products?.name}</td>
                    <td className="p-3 text-sm">{s.locations?.code}</td>
                    <td className="p-3 font-semibold">{s.quantity}</td>
                    <td className="p-3 text-sm">{s.last_updated_at?.substring(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
