'use client';

import { useEffect, useState } from 'react';

export default function StockAdjustment() {
  const [locations, setLocations] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    product_id: '',
    location_id: '',
    quantity_change: '',
    user_id: '1',
    reason: 'Rusak',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/locations').then(r => r.json()),
      fetch('/api/products').then(r => r.json())
    ]).then(([locRes, prodRes]) => {
      setLocations(locRes.data || []);
      setProducts(prodRes.data || []);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const quantity_change = formData.quantity_change.startsWith('-') 
      ? parseInt(formData.quantity_change) 
      : -Math.abs(parseInt(formData.quantity_change));

    const res = await fetch('/api/stock-movements/adjustment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, quantity_change })
    });

    const data = await res.json();
    if (res.ok) {
      setMessage(`✓ Adjustment berhasil. Qty baru: ${data.new_quantity}`);
      setFormData({ product_id: '', location_id: '', quantity_change: '', user_id: '1', reason: 'Rusak', notes: '' });
    } else {
      setMessage(`✗ ${data.error}`);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Adjustment Stok</h1>
      
      {message && (
        <div className={`p-4 rounded mb-6 ${message.includes('✓') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Barang</label>
          <select 
            name="product_id" 
            value={formData.product_id}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Pilih Barang</option>
            {products.map(p => <option key={p.product_id} value={p.product_id}>{p.sku} - {p.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Lokasi</label>
          <select 
            name="location_id" 
            value={formData.location_id}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Pilih Lokasi</option>
            {locations.map(l => <option key={l.location_id} value={l.location_id}>{l.code}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Alasan Koreksi</label>
          <select 
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="Rusak">Rusak</option>
            <option value="Hilang">Hilang</option>
            <option value="Expired">Expired</option>
            <option value="Selisih Opname">Selisih Opname</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Jumlah Pengurangan (akan disimpan negatif)</label>
          <input 
            type="number" 
            name="quantity_change"
            value={formData.quantity_change}
            onChange={handleChange}
            min="1"
            required
            className="w-full border rounded px-3 py-2"
            placeholder="Contoh: 5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Keterangan Tambahan</label>
          <textarea 
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700 disabled:bg-gray-400"
        >
          {loading ? 'Memproses...' : 'Kurangi Stok'}
        </button>
      </form>
    </div>
  );
}
