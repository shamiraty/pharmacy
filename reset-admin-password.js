const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new Database('pharmacy.db');

// Hash password 'admin123'
const password = 'admin123';
const hashedPassword = bcrypt.hashSync(password, 10);

console.log('Resetting admin password...');
console.log('New password:', password);
console.log('Hashed:', hashedPassword);

// Update admin user password
const result = db.prepare(`
  UPDATE users
  SET password = ?
  WHERE email = 'admin@pharmacy.com'
`).run(hashedPassword);

console.log('Update result:', result);

// Verify the update
const admin = db.prepare('SELECT id, email, full_name, role FROM users WHERE email = ?').get('admin@pharmacy.com');
console.log('\nAdmin user after update:', admin);

db.close();
console.log('\n✅ Password reset complete! Try logging in with:');
console.log('Email: admin@pharmacy.com');
console.log('Password: admin123');
