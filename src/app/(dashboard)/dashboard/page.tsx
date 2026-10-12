'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/warehouses')
      .then(res => res.json())
      .then(data => setWarehouses(data.data || []));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard Warehouse</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {warehouses.map((w: any) => {
          const usage = (w.current_stock / w.max_capacity) * 100;
          const color = usage > 90 ? 'bg-red-500' : usage > 70 ? 'bg-yellow-500' : 'bg-green-500';
          return (
            <div key={w.warehouse_id} className="bg-white p-6 rounded-lg shadow">
              <h2 className="font-bold text-lg">{w.name}</h2>
              <p className="text-sm text-gray-600 mb-4">{w.address}</p>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div className={`${color} h-4 rounded-full`} style={{ width: `${Math.min(usage, 100)}%` }}></div>
              </div>
              <p className="text-sm font-medium">{usage.toFixed(1)}% Kapasitas Terisi</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
