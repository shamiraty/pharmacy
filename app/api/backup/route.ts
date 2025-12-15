import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const copyFile = promisify(fs.copyFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);

const DB_PATH = path.join(process.cwd(), 'pharmacy.db');
const BACKUP_DIR = path.join(process.cwd(), 'backups');

// Ensure backup directory exists
async function ensureBackupDir() {
    if (!fs.existsSync(BACKUP_DIR)) {
        await mkdir(BACKUP_DIR, { recursive: true });
    }
}

// GET: List all backups
export async function GET() {
    try {
        await ensureBackupDir();
        const files = await readdir(BACKUP_DIR);

        // Filter for .db files and get stats
        const backups = await Promise.all(
            files
                .filter(file => file.endsWith('.db'))
                .map(async (file) => {
                    const stats = await stat(path.join(BACKUP_DIR, file));
                    return {
                        name: file,
                        size: stats.size,
                        created: stats.birthtime.toISOString(),
                        path: path.join(BACKUP_DIR, file)
                    };
                })
        );

        // Sort by date desc (newest first)
        backups.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

        return NextResponse.json({ success: true, backups });
    } catch (error) {
        console.error('Error listing backups:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to list backups' },
            { status: 500 }
        );
    }
}

// POST: Create a new backup
export async function POST() {
    try {
        await ensureBackupDir();

        // Check if source DB exists
        if (!fs.existsSync(DB_PATH)) {
            return NextResponse.json(
                { success: false, error: 'Database file not found' },
                { status: 404 }
            );
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `backup_${timestamp}.db`;
        const backupPath = path.join(BACKUP_DIR, backupName);

        // Copy the file
        // Note: In high-concurrency SQLite WAL mode, might need more care, but for this file-based setup copy is usually sufficient if not writing heavily.
        await copyFile(DB_PATH, backupPath);

        const stats = await stat(backupPath);

        return NextResponse.json({
            success: true,
            backup: {
                name: backupName,
                size: stats.size,
                created: stats.birthtime.toISOString()
            },
            message: 'Backup created successfully'
        });
    } catch (error) {
        console.error('Error creating backup:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create backup' },
            { status: 500 }
        );
    }
}
