
4. Design Requirements Document (DRD)
   Antarmuka dirancang untuk staf yang terbiasa mencatat di buku: layout form seragam, navigasi berikon, dan umpan balik visual langsung (warna) agar kesalahan input minimal.
   4.1 Prinsip desain
   • Konsisten: semua form transaksi memakai pola yang sama: header form, kolom input kiri, tabel/grid kanan atau bawah, tombol aksi di kanan bawah.
   • Berikon: setiap menu punya ikon yang relevan (kotak masuk untuk Barang Masuk, kotak keluar untuk Barang Keluar, panah dua arah untuk Transfer, dan seterusnya) di samping teks.
   • Cegah salah input: dropdown untuk barang, supplier, dan lokasi; angka hanya menerima digit; tombol Simpan nonaktif sampai input valid.
   • Umpan balik jelas: pesan sukses/gagal singkat setelah simpan; konfirmasi sebelum menghapus.
   4.2 Struktur navigasi (FormMain)
   Menu
   Isi
   Admin
   Manajer
   Staf
   Master Data
   Barang, Supplier, Gudang, Lokasi/Rak
   Ya
   Ya
   Tidak
   Transaksi
   Barang Masuk, Barang Keluar, Transfer Stok
   Ya
   Ya
   Ya
   Audit
   Stock Opname, Adjustment
   Tidak
   Ya
   Tidak
   Peta Distribusi
   Peta gudang (fase lanjutan)
   Ya
   Ya
   Tidak
   Laporan
   Stok terkini, riwayat, ekspor
   Ya
   Ya
   Ya
   Pengguna
   Kelola pengguna
   Ya
   Tidak
   Tidak
   FormMain memakai area konten MDI; form anak dibuka lewat menu atau toolbar ikon. Matriks akses mengikuti laporan (sensitif hanya untuk Manajer/Admin); detail Admin vs Manajer adalah asumsi saya.
   4.3 Daftar layar dan komponen
   Layar
   Komponen utama
   Aturan UI
   Login
   Username, password (masked), tombol Masuk
   Pesan error generik bila gagal
   Master Barang
   Grid + panel detail (SKU, nama, kategori, satuan, harga beli/jual, stok minimum, gambar)
   SKU unik; hapus perlu konfirmasi
   Master Supplier / Gudang / Lokasi
   Grid + form CRUD
   Gudang menyediakan lat/long dan kapasitas; lokasi dipilih dari gudang induk
   Barang Masuk
   Dropdown supplier, nomor PO, lokasi tujuan, grid item (barang, qty)
   Qty > 0; PO wajib
   Barang Keluar
   Dropdown lokasi asal, tujuan/keterangan, grid item
   Tampilkan stok tersedia; tolak bila melebihi
   Transfer Stok
   Gudang/lokasi asal dan tujuan, barang, qty
   Asal ≠ tujuan
   Stock Opname
   Pilih lokasi, Mulai, grid: barang, stok sistem, stok fisik (editable), selisih
   Selisih otomatis; baris selisih diwarnai
   Adjustment
   Pilih barang + lokasi, qty koreksi, alasan
   Hanya Manajer; alasan wajib
   Peta Distribusi
   Peta dengan marker per gudang, panel info kapasitas
   Hijau aman, kuning waspada, merah penuh/kritis
   Laporan
   Filter (gudang, kategori, zona, periode, tipe), grid hasil, tombol Ekspor CSV/Excel
   Hasil < 3 detik
   Kelola Pengguna
   Grid + form (username, password, peran)
   Password tidak pernah ditampilkan
   4.4 Wireframe Stock Opname (teks)
   +------------------------------------------------------------+
   | Stock Opname                                   [ikon] Tutup|
   | Gudang: [Jakarta v]  Lokasi: [A-01 v]          [ Mulai ]   |
   +------------------------------------------------------------+
   | SKU     | Nama barang | Stok sistem | Stok fisik | Selisih   |
   | BRG-001 | Kardus A    |     120     | [ 118 ]    |   -2  (merah)
   | BRG-002 | Lakban      |      50     | [  50 ]    |    0  (normal)
   +------------------------------------------------------------+
   |                          [ Batal ]   [ Simpan Hasil Opname ]|
   +------------------------------------------------------------+
   4.5 Warna dan status
   Konteks
   Warna
   Makna
   Marker/indikator kapasitas
   Hijau / Kuning / Merah
   Aman / Waspada / Penuh-Kritis
   Baris Opname
   Netral / Merah atau Kuning
   Cocok / Selisih (kurang / lebih)
   Stok < minimum
   Merah muda pada baris laporan
   Perlu restock
   Warna selalu disertai teks atau angka (misalnya nilai selisih) agar tetap terbaca oleh pengguna buta warna.
   4.6 Aksesibilitas dan kenyamanan
   • Urutan Tab logis dan tombol Enter menyimpan pada form input.
   • Ukuran font minimal 10 pt pada grid; kontras teks memadai.
   • Resolusi minimum 1366×768; form dapat diubah ukuran dan grid mengikuti.
5. SQL Query
   Skrip lengkap ada di file wms_inventaris.sql (dikirim terpisah di chat). Sudah diuji di MariaDB 10.11 dan kompatibel dengan MySQL 8: skema, data contoh, query transaksi, dan query laporan berjalan tanpa error, dan saldo akhir cocok dengan riwayat (100 − 30 − 20 + 18 − 5 = 63 di rak A-01).
   Bagian
   Isi
6. Schema
   7 tabel, foreign key, UNIQUE (sku, product+location), CHECK stok ≥ 0, indeks untuk laporan
7. Data contoh
   3 pengguna (password SHA-256), 2 supplier, 2 gudang, 3 lokasi, 2 barang
   3.1 Login
   Cocokkan username + SHA2(password,256)
   3.2 Barang Masuk
   Upsert stock_levels + INSERT movement IN dalam transaksi
   3.3 Barang Keluar
   FOR UPDATE, UPDATE bersyarat quantity >= @qty, movement OUT
   3.4 Transfer
   Kurangi asal, tambah tujuan, movement TRANSFER, atomik
   3.5–3.6 Stock Opname
   Tampilkan stok sistem; simpan fisik dan catat selisih bertanda
   3.7 Adjustment
   Koreksi negatif (rusak/hilang) dengan guard stok tidak negatif
   4.1 Laporan stok
   Filter gudang, kategori, zona + status RESTOCK/AMAN
   4.2 Riwayat
   Filter periode dan tipe pergerakan (dasar ekspor CSV)
   4.3 Peta Distribusi
   Persen kapasitas per gudang dan warna marker Hijau/Kuning/Merah
   4.4–4.6 Audit
   Barang di bawah minimum, rekap selisih opname/adjustment, cek konsistensi saldo vs riwayat
   Contoh pola transaksi inti (Barang Keluar):
   START TRANSACTION;
   SELECT quantity FROM stock_levels WHERE product_id=@p AND location_id=@loc FOR UPDATE;
   UPDATE stock_levels SET quantity = quantity - @qty
   WHERE product_id=@p AND location_id=@loc AND quantity >= @qty;
   -- ROW_COUNT() = 0 berarti stok tidak cukup: ROLLBACK
   INSERT INTO stock_movements (product_id, user_id, from_location_id, movement_type, quantity, reference)
   VALUES (@p, @uid, @loc, 'OUT', @qty, @ref);
   COMMIT;
