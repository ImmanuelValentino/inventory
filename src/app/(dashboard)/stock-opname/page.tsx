'use client';

import { useState, useEffect } from 'react';

export default function StockOpname() {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [stockData, setStockData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/warehouses').then(res => res.json()).then(data => setWarehouses(data.data || []));
  }, []);

  const handleWarehouseChange = (id: string) => {
    setSelectedWarehouse(id);
    fetch(`/api/locations?warehouse_id=${id}`).then(res => res.json()).then(data => setLocations(data.data || []));
  };

  const startOpname = async () => {
    if (!selectedLocation) return;
    setLoading(true);
    const res = await fetch(`/api/stock-levels?location_id=${selectedLocation}`);
    const data = await res.json();
    setStockData(data.data?.map((s: any) => ({ ...s, physical_qty: s.quantity })) || []);
    setLoading(false);
  };

  const handleQtyChange = (index: number, val: string) => {
    const newData = [...stockData];
    newData[index].physical_qty = parseInt(val) || 0;
    setStockData(newData);
  };

  const saveOpname = async () => {
    // Implementasi simpan opname via API stock-movements
    alert('Fitur simpan sedang dikembangkan');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Stock Opname</h1>
      <div className="flex gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Gudang</label>
          <select 
            className="border rounded p-2" 
            onChange={(e) => handleWarehouseChange(e.target.value)}
            value={selectedWarehouse}
          >
            <option value="">Pilih Gudang</option>
            {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Lokasi</label>
          <select 
            className="border rounded p-2"
            onChange={(e) => setSelectedLocation(e.target.value)}
            value={selectedLocation}
          >
            <option value="">Pilih Lokasi</option>
            {locations.map(l => <option key={l.location_id} value={l.location_id}>{l.code}</option>)}
          </select>
        </div>
        <button 
          onClick={startOpname}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Mulai
        </button>
      </div>

      {stockData.length > 0 && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left">SKU</th>
                <th className="p-3 text-left">Barang</th>
                <th className="p-3 text-left">Sistem</th>
                <th className="p-3 text-left">Fisik</th>
                <th className="p-3 text-left">Selisih</th>
              </tr>
            </thead>
            <tbody>
              {stockData.map((s, i) => {
                const diff = s.physical_qty - s.quantity;
                return (
                  <tr key={s.stock_id} className="border-b">
                    <td className="p-3">{s.products?.sku}</td>
                    <td className="p-3">{s.products?.name}</td>
                    <td className="p-3">{s.quantity}</td>
                    <td className="p-3">
                      <input 
                        type="number" 
                        className="border rounded w-20 p-1"
                        value={s.physical_qty}
                        onChange={(e) => handleQtyChange(i, e.target.value)}
                      />
                    </td>
                    <td className={`p-3 font-bold ${diff === 0 ? 'text-gray-500' : diff < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {diff}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="p-4 flex justify-end">
            <button 
              onClick={saveOpname}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Simpan Hasil Opname
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
