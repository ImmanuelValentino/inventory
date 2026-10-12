-- Schema untuk Inventory Management System
-- Jalankan di Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Manager', 'Staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. SUPPLIERS table
CREATE TABLE suppliers (
    supplier_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT
);

-- 3. WAREHOUSES table
CREATE TABLE warehouses (
    warehouse_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    max_capacity INTEGER NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);

-- 4. LOCATIONS table
CREATE TABLE locations (
    location_id SERIAL PRIMARY KEY,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(warehouse_id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    UNIQUE(warehouse_id, code)
);

-- 5. PRODUCTS table
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(20),
    cost_price DECIMAL(15,2),
    selling_price DECIMAL(15,2),
    minimum_stock_level INTEGER DEFAULT 0,
    image_path TEXT
);

-- Create indexes for products (search performance)
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_name ON products(name);

-- 6. STOCK_LEVELS table
CREATE TABLE stock_levels (
    stock_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    location_id INTEGER NOT NULL REFERENCES locations(location_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, location_id)
);

-- 7. STOCK_MOVEMENTS table
CREATE TABLE stock_movements (
    movement_id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
    supplier_id INTEGER REFERENCES suppliers(supplier_id) ON DELETE SET NULL,
    from_location_id INTEGER REFERENCES locations(location_id) ON DELETE RESTRICT,
    to_location_id INTEGER REFERENCES locations(location_id) ON DELETE RESTRICT,
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('IN', 'OUT', 'TRANSFER', 'OPNAME', 'ADJUSTMENT')),
    quantity INTEGER NOT NULL,
    reference VARCHAR(100),
    notes TEXT,
    movement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for stock_movements (report performance)
CREATE INDEX idx_stock_movements_date ON stock_movements(movement_date);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Allow public access for custom auth/app flow
CREATE POLICY "Allow public access" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON warehouses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON locations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON stock_levels FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access" ON stock_movements FOR ALL USING (true) WITH CHECK (true);

-- Insert default admin user (password: admin123 - hashed with bcrypt)
-- Hash generated: $2a$10$rQZ9xWxGkL7YvZJvKsYJX.8nGg3TvdSJhT5FwOYtPvYGZhP9UWmDq
INSERT INTO users (username, password_hash, role) VALUES 
('admin', '$2a$10$rQZ9xWxGkL7YvZJvKsYJX.8nGg3TvdSJhT5FwOYtPvYGZhP9UWmDq', 'Admin');

-- Sample data untuk testing
INSERT INTO warehouses (name, address, max_capacity, latitude, longitude) VALUES
('Gudang Utama', 'Jl. Industri No. 1, Jakarta', 10000, -6.200000, 106.816666),
('Gudang Cabang', 'Jl. Raya No. 5, Bandung', 5000, -6.914744, 107.609810);

INSERT INTO locations (warehouse_id, code, description) VALUES
(1, 'A-01-01', 'Rak A, Baris 1, Kolom 1'),
(1, 'A-01-02', 'Rak A, Baris 1, Kolom 2'),
(1, 'B-01-01', 'Rak B, Baris 1, Kolom 1'),
(2, 'C-01-01', 'Rak C, Baris 1, Kolom 1');

INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES
('PT Supplier Utama', 'Budi Santoso', '021-1234567', 'budi@supplierutama.com', 'Jl. Supplier No. 10, Jakarta'),
('CV Supplier Cabang', 'Andi Wijaya', '022-7654321', 'andi@suppliercabang.com', 'Jl. Supplier No. 20, Bandung');

INSERT INTO products (sku, name, category, unit, cost_price, selling_price, minimum_stock_level) VALUES
('PRD-001', 'Laptop Dell XPS 15', 'Elektronik', 'Unit', 15000000, 18000000, 5),
('PRD-002', 'Mouse Logitech MX Master', 'Aksesoris', 'Unit', 1200000, 1500000, 10),
('PRD-003', 'Keyboard Mechanical RGB', 'Aksesoris', 'Unit', 800000, 1100000, 15);
