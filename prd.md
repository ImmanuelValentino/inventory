
1. Product Requirements Document (PRD)
   Sistem Inventaris Gudang adalah aplikasi desktop (VB.NET + MySQL) untuk mengelola stok multi-gudang secara terpusat, dengan Stock Opname, Adjustment, dan Peta Distribusi. Dokumen ini diturunkan dari laporan analisis dan perancangan sistem (Farrel, Immanuel, Christoper; IBI Kwik Kian Gie).
   1.1 Masalah dan tujuan
   Stok tersebar di banyak gudang dicatat manual, sehingga lambat, rawan human error, dan selisih fisik vs catatan baru ketahuan terlambat.
   • Memusatkan data master barang, supplier, gudang, dan lokasi rak dalam satu database.
   • Menjaga akurasi stok lewat Stock Opname dan Adjustment.
   • Memberi visibilitas lokasi dan kapasitas gudang lewat Peta Distribusi dan laporan.
   1.2 Pengguna dan hak akses
   Peran dalam use case hanya "Manajer Gudang"; laporan dan kesimpulan menyebut tiga peran (Admin, Manajer, Staf Gudang). PRD ini memakai tiga peran tersebut.
   Peran
   Akses
   Admin
   Kelola pengguna, semua master data
   Manajer Gudang
   Master data, Stock Opname, Adjustment, laporan, peta, hapus master data
   Staf Gudang
   Input Barang Masuk, Barang Keluar, Transfer Stok; lihat laporan
   1.3 Ruang lingkup
   Dalam lingkup (fase ini): Login, Kelola Barang, Supplier, Gudang, Lokasi/Rak, Barang Masuk, Barang Keluar, Transfer Stok Antar Gudang, Stock Opname, Adjustment, Laporan Stok (filter + ekspor CSV/Excel), Kelola Pengguna.
   Peta Distribusi: ada di desain (GMap.NET, marker Hijau/Kuning/Merah), tetapi laporan menyatakan API peta berbayar sehingga tidak dikerjakan di fase pengembangan ini. Saya tandai sebagai fase lanjutan.
   1.4 Kebutuhan fungsional
   ID
   Fitur
   Kebutuhan
   Prioritas
   FR-01
   Otentikasi
   Login username + password; menu dibedakan per peran
   Must
   FR-02
   Master data
   CRUD Barang, Supplier, Gudang, Lokasi Rak (zone)
   Must
   FR-03
   Barang Masuk
   Catat penerimaan dari supplier, validasi nomor PO, tambah stok di lokasi dipilih
   Must
   FR-04
   Barang Keluar
   Kurangi stok real-time, tolak jika stok tidak cukup
   Must
   FR-05
   Transfer Stok
   Pindah stok antar gudang/lokasi; asal berkurang, tujuan bertambah, atomik
   Must
   FR-06
   Stock Opname
   Bandingkan stok sistem vs fisik, hitung selisih otomatis, tandai baris dengan warna
   Must
   FR-07
   Adjustment
   Koreksi stok manual dengan alasan (rusak/hilang), khusus Manajer
   Must
   FR-08
   Laporan Stok
   Stok terkini dan riwayat pergerakan; filter gudang, kategori, zona, periode, tipe; ekspor CSV/Excel
   Must
   FR-09
   Kelola Pengguna
   CRUD pengguna dan peran
   Must
   FR-10
   Peta Distribusi
   Peta lokasi gudang + status kapasitas
   Later (API berbayar)
   1.5 Kebutuhan non-fungsional
   ID
   Parameter
   Target
   NFR-01
   Response time
   Pencarian barang dan muat peta < 3 detik
   NFR-02
   Integrity
   Stok tidak boleh negatif; setiap perubahan stok punya jejak di riwayat pergerakan
   NFR-03
   Security
   RBAC; password disimpan hash SHA-256; Adjustment dan hapus master hanya Manajer
   NFR-04
   Ergonomics
   Layout form konsisten; navigasi berikon
   NFR-05
   Availability
   Dapat diakses tanpa downtime
   NFR-06
   Kalkulasi Opname
   Selisih dihitung instan saat stok fisik diisi, tanpa loading
   1.6 Kriteria penerimaan utama
   • Barang Keluar melebihi stok ditolak dan stok tidak berubah.
   • Gagal di tengah transaksi membatalkan seluruh perubahan (tidak ada selisih saldo vs riwayat).
   • Stock Opname menampilkan selisih = fisik − sistem, dengan indikator warna bila tidak nol.
   • Staf Gudang tidak melihat menu Adjustment, Hapus Master, dan Kelola Pengguna.
   • Laporan dapat difilter dan diekspor ke CSV.
