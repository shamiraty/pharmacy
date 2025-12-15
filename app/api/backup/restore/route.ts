import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const copyFile = promisify(fs.copyFile);
const stat = promisify(fs.stat);

const DB_PATH = path.join(process.cwd(), 'pharmacy.db');
const BACKUP_DIR = path.join(process.cwd(), 'backups');

// POST: Restore a backup
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { filename } = body;

        if (!filename) {
            return NextResponse.json(
                { success: false, error: 'Filename is required' },
                { status: 400 }
            );
        }

        const backupPath = path.join(BACKUP_DIR, filename);

        // Verify backup file exists
        if (!fs.existsSync(backupPath)) {
            return NextResponse.json(
                { success: false, error: 'Backup file not found' },
                { status: 404 }
            );
        }

        // Verify it's a valid file path to prevent traversal attacks
        // realpath ensures it's inside the backups directory
        const resolvedPath = await fs.realpathSync(backupPath);
        if (!resolvedPath.startsWith(path.resolve(BACKUP_DIR))) {
            return NextResponse.json(
                { success: false, error: 'Invalid backup filepath' },
                { status: 403 }
            );
        }

        // Attempt to restore
        // WARNING: This overwrites the live DB.
        // In some environments, we might need to close DB connections first.
        // Since we are using better-sqlite3 in Next.js, the implementation details of connection pooling
        // might cause "File is locked" errors on Windows if a query is active.
        // However, usually atomic copy replacement works or throws.

        await copyFile(backupPath, DB_PATH);

        return NextResponse.json({
            success: true,
            message: `Database restored from ${filename} successfully. You may need to refresh the page.`
        });
    } catch (error: any) {
        console.error('Error restoring backup:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.code === 'EBUSY'
                    ? 'Database is currently locked or in use. Please try again in a moment.'
                    : 'Failed to restore backup: ' + error.message
            },
            { status: 500 }
        );
    }
}
