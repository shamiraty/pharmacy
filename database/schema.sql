-- Pharmacy Management System Database Schema

CREATE DATABASE IF NOT EXISTS pharmacy_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE pharmacy_system;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role ENUM('admin', 'pharmacist', 'cashier') DEFAULT 'cashier',
    phone VARCHAR(20),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Medicine categories table
CREATE TABLE IF NOT EXISTS medicine_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Medicines table
CREATE TABLE IF NOT EXISTS medicines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(300) NOT NULL,
    generic_name VARCHAR(300),
    category_id INT,
    manufacturer VARCHAR(200),

    -- Purchase information
    purchase_price_per_carton DECIMAL(10, 2),
    units_per_carton INT NOT NULL DEFAULT 1,
    purchase_price_per_unit DECIMAL(10, 2) GENERATED ALWAYS AS (purchase_price_per_carton / units_per_carton) STORED,

    -- Selling prices
    selling_price_full DECIMAL(10, 2) NOT NULL,
    selling_price_half DECIMAL(10, 2),
    selling_price_single DECIMAL(10, 2),

    -- Stock information
    quantity_in_stock INT NOT NULL DEFAULT 0,
    reorder_level INT DEFAULT 10,

    -- Medical information
    diseases_treated TEXT,
    dosage_form VARCHAR(100),
    strength VARCHAR(100),
    usage_instructions TEXT,
    side_effects TEXT,

    -- Dates
    manufacture_date DATE,
    expiry_date DATE NOT NULL,

    -- Additional info
    barcode VARCHAR(100),
    shelf_location VARCHAR(100),
    status ENUM('active', 'inactive', 'expired') DEFAULT 'active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id) REFERENCES medicine_categories(id) ON DELETE SET NULL,
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_name (name),
    INDEX idx_category (category_id)
) ENGINE=InnoDB;

-- Purchase records table
CREATE TABLE IF NOT EXISTS purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_id INT NOT NULL,
    supplier_name VARCHAR(200),
    quantity_cartons INT NOT NULL,
    quantity_units INT NOT NULL,
    price_per_carton DECIMAL(10, 2),
    total_cost DECIMAL(12, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    batch_number VARCHAR(100),
    expiry_date DATE,
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_purchase_date (purchase_date)
) ENGINE=InnoDB;

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(200),
    customer_phone VARCHAR(20),
    total_amount DECIMAL(12, 2) NOT NULL,
    amount_paid DECIMAL(12, 2) NOT NULL,
    change_amount DECIMAL(12, 2) DEFAULT 0,
    payment_method ENUM('cash', 'card', 'mobile_money') DEFAULT 'cash',
    sale_date DATETIME NOT NULL,
    served_by INT,
    notes TEXT,
    status ENUM('completed', 'cancelled', 'pending') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (served_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_invoice (invoice_number),
    INDEX idx_sale_date (sale_date)
) ENGINE=InnoDB;

-- Sale items table
CREATE TABLE IF NOT EXISTS sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    medicine_id INT NOT NULL,
    medicine_name VARCHAR(300) NOT NULL,
    quantity INT NOT NULL,
    unit_type ENUM('full', 'half', 'single') NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    cost_price DECIMAL(10, 2),
    profit DECIMAL(12, 2) GENERATED ALWAYS AS (total_price - (cost_price * quantity)) STORED,
    batch_number VARCHAR(100),
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE RESTRICT,
    INDEX idx_sale_id (sale_id)
) ENGINE=InnoDB;

-- Stock adjustments table
CREATE TABLE IF NOT EXISTS stock_adjustments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medicine_id INT NOT NULL,
    adjustment_type ENUM('addition', 'reduction', 'damage', 'expired', 'return') NOT NULL,
    quantity INT NOT NULL,
    reason TEXT,
    adjusted_by INT,
    adjustment_date DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
    FOREIGN KEY (adjusted_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_adjustment_date (adjustment_date)
) ENGINE=InnoDB;

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password, full_name, role) VALUES
('admin', 'admin@pharmacy.com', '$2a$10$xQHzGvVqN0Qw1jF7aQJbxuJYZXgXZ9F7hPbKjGN0aLvKjF7aQJbxu', 'System Administrator', 'admin');

-- Insert default categories
INSERT INTO medicine_categories (name, description) VALUES
('Analgesics', 'Pain relievers and anti-inflammatory drugs'),
('Antibiotics', 'Antibacterial medications'),
('Antihistamines', 'Allergy medications'),
('Antihypertensives', 'Blood pressure medications'),
('Antidiabetics', 'Diabetes medications'),
('Antimalarials', 'Malaria treatment and prevention'),
('Vitamins & Supplements', 'Nutritional supplements'),
('Cough & Cold', 'Respiratory medications'),
('Gastrointestinal', 'Digestive system medications'),
('Dermatological', 'Skin medications');
