import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';

const BACKUP_DIR = path.join(process.cwd(), 'backups');

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const filename = searchParams.get('filename');

        if (!filename) {
            return NextResponse.json({ success: false, error: 'Filename is required' }, { status: 400 });
        }

        // Security check
        if (!/^[a-zA-Z0-9_.-]+$/.test(filename) || filename.includes('..')) {
            return NextResponse.json({ success: false, error: 'Invalid filename' }, { status: 400 });
        }

        const filePath = path.join(BACKUP_DIR, filename);

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ success: false, error: 'Backup file not found' }, { status: 404 });
        }

        // Connect to the backup database in read-only mode
        const db = new Database(filePath, { readonly: true });

        try {
            // Run analytics queries
            // Use try-catch for individual queries in case tables don't exist (e.g. older backups)

            const getCount = (table: string) => {
                try {
                    const result = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as { count: number };
                    return result.count;
                } catch (e) {
                    return 0;
                }
            };

            const getSum = (table: string, column: string) => {
                try {
                    const result = db.prepare(`SELECT SUM(${column}) as total FROM ${table}`).get() as { total: number };
                    return result.total || 0;
                } catch (e) {
                    return 0;
                }
            };

            const stats = {
                users: getCount('users'),
                medicines: getCount('medicines'),
                sales: getCount('sales'),
                totalRevenue: getSum('sales', 'total_amount'),
                suppliers: getCount('suppliers'),
                purchases: getCount('purchases')
            };

            return NextResponse.json({ success: true, stats });

        } finally {
            db.close();
        }

    } catch (error) {
        console.error('Preview backup error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to analyze backup' },
            { status: 500 }
        );
    }
}
