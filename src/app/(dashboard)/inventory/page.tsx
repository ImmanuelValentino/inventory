'use client';

import { useEffect, useState } from 'react';

export default function Inventory() {
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => setProducts(data.data || []));
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Daftar Produk & Stok</h1>
            <table className="w-full bg-white shadow rounded-lg overflow-hidden">
                <thead className="bg-gray-100 border-b">
                    <tr>
                        <th className="p-3 text-left">SKU</th>
                        <th className="p-3 text-left">Nama</th>
                        <th className="p-3 text-left">Kategori</th>
                        <th className="p-3 text-left">Harga Jual</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((p: any) => (
                        <tr key={p.product_id} className="border-b">
                            <td className="p-3">{p.sku}</td>
                            <td className="p-3">{p.name}</td>
                            <td className="p-3">{p.category}</td>
                            <td className="p-3">Rp {p.selling_price?.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
