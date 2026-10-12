
2. Entity Relationship Diagram (ERD)
   Model data terdiri dari 7 tabel; stok saat ini disimpan di STOCK_LEVELS, sedangkan semua perubahan (masuk, keluar, transfer, opname, adjustment) dicatat di STOCK_MOVEMENTS sebagai riwayat.

erDiagram
    WAREHOUSES ||--o{ LOCATIONS : memiliki
    LOCATIONS ||--o{ STOCK_LEVELS : menyimpan
    PRODUCTS ||--o{ STOCK_LEVELS : disimpan_di
    PRODUCTS ||--o{ STOCK_MOVEMENTS : memiliki_riwayat
    USERS ||--o{ STOCK_MOVEMENTS : mencatat
    SUPPLIERS |o--o{ STOCK_MOVEMENTS : sumber_barang
    LOCATIONS |o--o{ STOCK_MOVEMENTS : lokasi_asal
    LOCATIONS |o--o{ STOCK_MOVEMENTS : lokasi_tujuan
    USERS {
        int user_id PK
        varchar username
        varchar password_hash
        varchar role
        datetime created_at
    }
    SUPPLIERS {
        int supplier_id PK
        varchar name
        varchar contact_person
        varchar phone
        varchar email
        text address
    }
    WAREHOUSES {
        int warehouse_id PK
        varchar name
        text address
        int max_capacity
        double latitude
        double longitude
    }
    LOCATIONS {
        int location_id PK
        int warehouse_id FK
        varchar code
        text description
    }
    PRODUCTS {
        int product_id PK
        varchar sku
        varchar name
        varchar category
        varchar unit
        decimal cost_price
        decimal selling_price
        int minimum_stock_level
        text image_path
    }
    STOCK_LEVELS {
        int stock_id PK
        int product_id FK
        int location_id FK
        int quantity
        datetime last_updated_at
    }
    STOCK_MOVEMENTS {
        int movement_id PK
        int product_id FK
        int user_id FK
        int supplier_id FK
        int from_location_id FK
        int to_location_id FK
        varchar movement_type
        int quantity
        varchar reference
        text notes
        datetime movement_date
    }




### 2.1 Kamus data

| Tabel           | Kolom penting                                                              | Keterangan                                                  |
| --------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------- |
| USERS           | username (unik), password_hash (SHA-256), role                             | Admin / Manager / Staff                                     |
| SUPPLIERS       | name, contact_person, phone, email, address                                | Sumber barang masuk                                         |
| WAREHOUSES      | max_capacity, latitude, longitude                                          | Dasar status kapasitas dan Peta Distribusi                  |
| LOCATIONS       | warehouse_id, code                                                         | Rak/zona di dalam satu gudang                               |
| PRODUCTS        | sku (unik), category, unit, cost_price, selling_price, minimum_stock_level | Master barang                                               |
| STOCK_LEVELS    | product_id + location_id (unik), quantity ≥ 0                             | Saldo stok per barang per lokasi                            |
| STOCK_MOVEMENTS | movement_type, quantity, reference, from/to_location_id                    | Riwayat; reference menyimpan nomor PO, dokumen, atau alasan |



### 2.2 Aturan relasi dan integritas

* Satu gudang punya banyak lokasi; satu lokasi milik tepat satu gudang.
* STOCK_LEVELS adalah tabel penghubung barang × lokasi; pasangan (product_id, location_id) unik.
* supplier_id hanya terisi untuk IN; from_location_id hanya untuk OUT dan TRANSFER; to_location_id untuk IN dan TRANSFER.
* Stock Opname dan Adjustment tidak punya tabel sendiri di ERD asli; keduanya dicatat sebagai movement_type (OPNAME, ADJUSTMENT) dengan quantity bertanda (+/−) untuk selisih.
* Nilai movement_type yang saya pakai: IN, OUT, TRANSFER, OPNAME, ADJUSTMENT. Silakan ubah bila di kode VB Anda berbeda.
