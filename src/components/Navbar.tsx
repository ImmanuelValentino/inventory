import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-indigo-700 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="text-xl font-bold">
            Inventory Porto
          </Link>
          
          <div className="flex gap-6">
            <Link href="/dashboard" className="hover:text-indigo-200 transition">
              Dashboard
            </Link>
            <Link href="/inventory" className="hover:text-indigo-200 transition">
              Produk
            </Link>
            <Link href="/stock-opname" className="hover:text-indigo-200 transition">
              Opname
            </Link>
            <Link href="/stock-transfer" className="hover:text-indigo-200 transition">
              Transfer
            </Link>
            <Link href="/stock-adjustment" className="hover:text-indigo-200 transition">
              Adjustment
            </Link>
            <Link href="/reports" className="hover:text-indigo-200 transition">
              Laporan
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
