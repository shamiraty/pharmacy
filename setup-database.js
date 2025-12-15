const Database = require('better-sqlite3');
const path = require('path');

async function setupDatabase() {
  console.log('🚀 Starting SQLite database setup...\n');

  try {
    // Create database
    const dbPath = path.join(__dirname, 'pharmacy.db');
    const db = new Database(dbPath);

    console.log('✅ Connected to SQLite database');

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT DEFAULT 'cashier' CHECK(role IN ('admin', 'pharmacist', 'cashier')),
        phone TEXT,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Medicine categories table
    db.exec(`
      CREATE TABLE IF NOT EXISTS medicine_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Medicines table
    db.exec(`
      CREATE TABLE IF NOT EXISTS medicines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        generic_name TEXT,
        category_id INTEGER,
        manufacturer TEXT,
        purchase_price_per_carton REAL,
        units_per_carton INTEGER NOT NULL DEFAULT 1,
        purchase_price_per_unit REAL GENERATED ALWAYS AS (purchase_price_per_carton / units_per_carton) STORED,
        selling_price_full REAL NOT NULL,
        selling_price_half REAL,
        selling_price_single REAL,
        quantity_in_stock INTEGER NOT NULL DEFAULT 0,
        reorder_level INTEGER DEFAULT 10,
        diseases_treated TEXT,
        dosage_form TEXT,
        strength TEXT,
        usage_instructions TEXT,
        side_effects TEXT,
        manufacture_date DATE,
        expiry_date DATE NOT NULL,
        barcode TEXT,
        shelf_location TEXT,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'expired')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES medicine_categories(id) ON DELETE SET NULL
      )
    `);

    // Create indexes for medicines
    db.exec(`CREATE INDEX IF NOT EXISTS idx_expiry_date ON medicines(expiry_date)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_name ON medicines(name)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_category ON medicines(category_id)`);

    // Purchases table
    db.exec(`
      CREATE TABLE IF NOT EXISTS purchases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        medicine_id INTEGER NOT NULL,
        supplier_name TEXT,
        quantity_cartons INTEGER NOT NULL,
        quantity_units INTEGER NOT NULL,
        price_per_carton REAL,
        total_cost REAL NOT NULL,
        purchase_date DATE NOT NULL,
        batch_number TEXT,
        expiry_date DATE,
        notes TEXT,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_purchase_date ON purchases(purchase_date)`);

    // Sales table
    db.exec(`
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoice_number TEXT UNIQUE NOT NULL,
        customer_name TEXT,
        customer_phone TEXT,
        total_amount REAL NOT NULL,
        amount_paid REAL NOT NULL,
        change_amount REAL DEFAULT 0,
        payment_method TEXT DEFAULT 'cash' CHECK(payment_method IN ('cash', 'card', 'mobile_money')),
        sale_date DATETIME NOT NULL,
        served_by INTEGER,
        notes TEXT,
        status TEXT DEFAULT 'completed' CHECK(status IN ('completed', 'cancelled', 'pending')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (served_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_invoice ON sales(invoice_number)`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_sale_date ON sales(sale_date)`);

    // Sale items table
    db.exec(`
      CREATE TABLE IF NOT EXISTS sale_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER NOT NULL,
        medicine_id INTEGER NOT NULL,
        medicine_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_type TEXT NOT NULL CHECK(unit_type IN ('full', 'half', 'single')),
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL,
        cost_price REAL,
        profit REAL GENERATED ALWAYS AS (total_price - (cost_price * quantity)) STORED,
        batch_number TEXT,
        expiry_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
        FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE RESTRICT
      )
    `);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_sale_id ON sale_items(sale_id)`);

    // Stock adjustments table
    db.exec(`
      CREATE TABLE IF NOT EXISTS stock_adjustments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        medicine_id INTEGER NOT NULL,
        adjustment_type TEXT NOT NULL CHECK(adjustment_type IN ('addition', 'reduction', 'damage', 'expired', 'return')),
        quantity INTEGER NOT NULL,
        reason TEXT,
        adjusted_by INTEGER,
        adjustment_date DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (medicine_id) REFERENCES medicines(id) ON DELETE CASCADE,
        FOREIGN KEY (adjusted_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_adjustment_date ON stock_adjustments(adjustment_date)`);

    console.log('✅ Database tables created successfully');

    // Insert default admin user (password: admin123)
    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (username, email, password, full_name, role)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertUser.run(
      'admin',
      'admin@pharmacy.com',
      '$2a$10$xQHzGvVqN0Qw1jF7aQJbxuJYZXgXZ9F7hPbKjGN0aLvKjF7aQJbxu',
      'System Administrator',
      'admin'
    );

    console.log('✅ Default admin user created');

    // Insert default categories
    const insertCategory = db.prepare(`
      INSERT OR IGNORE INTO medicine_categories (name, description)
      VALUES (?, ?)
    `);

    const categories = [
      ['Analgesics', 'Pain relievers and anti-inflammatory drugs'],
      ['Antibiotics', 'Antibacterial medications'],
      ['Antihistamines', 'Allergy medications'],
      ['Antihypertensives', 'Blood pressure medications'],
      ['Antidiabetics', 'Diabetes medications'],
      ['Antimalarials', 'Malaria treatment and prevention'],
      ['Vitamins & Supplements', 'Nutritional supplements'],
      ['Cough & Cold', 'Respiratory medications'],
      ['Gastrointestinal', 'Digestive system medications'],
      ['Dermatological', 'Skin medications'],
    ];

    categories.forEach((cat) => {
      insertCategory.run(cat[0], cat[1]);
    });

    console.log('✅ Medicine categories added\n');

    console.log('📊 Database Setup Complete!');
    console.log('\n🔐 Default Login Credentials:');
    console.log('   Username: admin');
    console.log('   Email: admin@pharmacy.com');
    console.log('   Password: admin123\n');

    console.log('📁 Database file created: pharmacy.db\n');
    console.log('🎉 You can now start the application with: npm run dev');

    db.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  }
}

setupDatabase();
