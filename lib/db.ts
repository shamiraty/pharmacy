import Database from 'better-sqlite3';
import path from 'path';

// Create database file in the project root
const dbPath = path.join(process.cwd(), 'pharmacy.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function query<T = any>(sql: string, params: any[] = []): T[] {
  try {
    const stmt = db.prepare(sql);

    // Check if it's a SELECT query
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      return stmt.all(...params) as T[];
    } else {
      // For INSERT, UPDATE, DELETE
      const result = stmt.run(...params);
      return [{ insertId: result.lastInsertRowid, affectedRows: result.changes } as any] as T[];
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export function queryOne<T = any>(sql: string, params: any[] = []): T | null {
  const results = query<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}

export default db;
