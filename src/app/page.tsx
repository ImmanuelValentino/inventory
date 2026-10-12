import Link from "next/link";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Inventory Porto
                    </h1>
                    <p className="text-gray-600">
                        Sistem Manajemen Inventaris Warehouse
                    </p>
                </div>

                <div className="space-y-4">
                    <Link
                        href="/login"
                        className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg text-center transition"
                    >
                        Login
                    </Link>
                    <Link
                        href="/register"
                        className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-4 rounded-lg text-center transition"
                    >
                        Register
                    </Link>
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Fitur:</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                        <li>✓ Manajemen produk & supplier</li>
                        <li>✓ Monitoring kapasitas warehouse</li>
                        <li>✓ Tracking stok real-time</li>
                        <li>✓ Laporan pergerakan stok</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
