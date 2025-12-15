const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'pharmacy.db');
const db = new Database(dbPath);

console.log('Adding activity_logs table...');

try {
  // Create activity_logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      action VARCHAR(100) NOT NULL,
      details TEXT,
      ip_address VARCHAR(45),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('✓ activity_logs table created successfully');

  // Add served_by column to sales table if it doesn't exist
  try {
    db.exec(`ALTER TABLE sales ADD COLUMN served_by INTEGER REFERENCES users(id)`);
    console.log('✓ served_by column added to sales table');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('✓ served_by column already exists');
    } else {
      throw error;
    }
  }

  console.log('\n✅ Database migration completed successfully!');
} catch (error) {
  console.error('❌ Error during migration:', error.message);
  process.exit(1);
} finally {
  db.close();
}
