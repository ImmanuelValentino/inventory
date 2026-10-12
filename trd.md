
3. Technical Requirements Document (TRD)
   Aplikasi web yang dihubungkan dengan database supabase; semua perubahan stok berjalan dalam satu transaksi database.
   3.1 Teknologi
   Komponen
   Pilihan
   Bahasa / UI
   JavaScript (nextjs / vue.js) salah satu
   Database
   MySQL (Suppabase)
   Konektor

Peta
GMap.NET (fase lanjutan; tile provider berbayar tidak dipakai di fase ini)
Keamanan
SHA-256 untuk password; RBAC di level form
Ekspor
CSV (dan Excel) dari hasil query laporan
3.2 Arsitektur
FormMain memegang user yang login dan membuka form anak (FormMasterProducts, FormMasterSupplier, FormMasterWarehouse, FormStockIn, FormStockOut, FormStockOpname, FormWarehouseMap, FormReportViewer). Setiap form membaca/menulis tabel melalui kelas akses data; entitas sama dengan 7 tabel di ERD.
Form
Tabel dibaca
Tabel diubah
FormMasterProducts / Supplier / Warehouse
tabel masternya
tabel masternya (CRUD)
FormStockIn
products, suppliers, locations
stock_levels (UPDATE), stock_movements (INSERT)
FormStockOut
stock_levels, products, locations
stock_levels (UPDATE), stock_movements (INSERT)
FormStockOpname
stock_levels
stock_levels, stock_movements
FormWarehouseMap
warehouses, SUM stock_levels
tidak ada
FormReportViewer
stock_levels, stock_movements
tidak ada
3.3 Integritas transaksi
Setiap Barang Masuk, Barang Keluar, Transfer, Opname, dan Adjustment memakai pola yang sama:

1. BEGIN transaksi.
2. Kunci baris saldo: SELECT ... FROM stock_levels WHERE product_id=? AND location_id=? FOR UPDATE.
3. Validasi (stok cukup, kuantitas > 0, PO valid).
4. UPDATE/INSERT stock_levels dan INSERT stock_movements.
5. COMMIT; bila ada error apa pun, ROLLBACK.
   Constraint database CHECK (quantity >= 0) pada stock_levels menjadi pengaman kedua bila validasi aplikasi terlewat.
   3.4 Keamanan
   • Password dihash SHA-256 sebelum disimpan; login membandingkan hash. Rekomendasi: tambahkan salt per pengguna (SHA-256 polos rentan terhadap rainbow table); ini penyimpangan dari laporan, mohon konfirmasi.
   • Semua query memakai parameter (@param), tidak menyambung string, untuk mencegah SQL injection.
   • RBAC: Admin dan Manajer melihat menu master/adjustment; Staf hanya transaksi harian. Pemeriksaan peran dilakukan saat form dibuka dan sebelum eksekusi aksi sensitif.
   • Akun database aplikasi diberi hak minimum (SELECT/INSERT/UPDATE/DELETE pada skema ini saja).
   3.5 Performa
   Skenario
   Target
   Cara
   Cari barang
   < 3 detik
   Indeks pada sku dan name
   Muat peta
   < 3 detik
   Satu query agregat SUM(quantity) per gudang
   Opname
   Instan
   Selisih dihitung di sisi klien saat input; simpan sekali di akhir
   Laporan
   < 3 detik
   Indeks movement_date, product_id, movement_type; filter di SQL
   3.6 Logika bisnis penting
   • Status kapasitas gudang: terisi% = total stok / max_capacity. Aman < 70%, Waspada 70–90%, Kritis/Penuh > 90% (hijau/kuning/merah). Ambang ini asumsi saya; laporan tidak menyebut angka.
   • Opname: selisih = stok fisik − stok sistem; bila tidak nol, baris diberi warna dan hasilnya disimpan sebagai pergerakan OPNAME.
   • Adjustment: alasan wajib diisi; kuantitas pengurangan (rusak/hilang) disimpan negatif otomatis.
   • Transfer: lokasi asal ≠ lokasi tujuan; asal dikurangi dan tujuan ditambah dalam satu transaksi.
