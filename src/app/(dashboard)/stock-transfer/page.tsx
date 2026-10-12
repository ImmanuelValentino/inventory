'use client';

import { useEffect, useState } from 'react';

export default function StockTransfer() {
  const [locations, setLocations] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    product_id: '',
    from_location_id: '',
    to_location_id: '',
    quantity: '',
    user_id: '1',
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

    const res = await fetch('/api/stock-movements/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    if (res.ok) {
      setMessage('✓ Transfer stok berhasil');
      setFormData({ product_id: '', from_location_id: '', to_location_id: '', quantity: '', user_id: '1', notes: '' });
    } else {
      setMessage(`✗ ${data.error}`);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Transfer Stok</h1>
      
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
          <label className="block text-sm font-medium mb-1">Dari Lokasi</label>
          <select 
            name="from_location_id" 
            value={formData.from_location_id}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Pilih Lokasi Asal</option>
            {locations.map(l => <option key={l.location_id} value={l.location_id}>{l.code}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ke Lokasi</label>
          <select 
            name="to_location_id" 
            value={formData.to_location_id}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Pilih Lokasi Tujuan</option>
            {locations.map(l => <option key={l.location_id} value={l.location_id}>{l.code}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Quantity</label>
          <input 
            type="number" 
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Catatan (Opsional)</label>
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
          className="w-full bg-indigo-600 text-white py-2 rounded font-semibold hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {loading ? 'Memproses...' : 'Transfer'}
        </button>
      </form>
    </div>
  );
}
