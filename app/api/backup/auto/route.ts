import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const copyFile = promisify(fs.copyFile);
const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);

const DB_PATH = path.join(process.cwd(), 'pharmacy.db');
const BACKUP_DIR = path.join(process.cwd(), 'backups');
const AUTO_BACKUP_NAME = 'auto_backup.db';
const AUTO_BACKUP_PATH = path.join(BACKUP_DIR, AUTO_BACKUP_NAME);

// Ensure backup directory exists
async function ensureBackupDir() {
    if (!fs.existsSync(BACKUP_DIR)) {
        await mkdir(BACKUP_DIR, { recursive: true });
    }
}

// POST: Trigger auto backup check/update
export async function POST() {
    try {
        await ensureBackupDir();

        // Check if source DB exists
        if (!fs.existsSync(DB_PATH)) {
            return NextResponse.json(
                { success: false, error: 'Source database not found' },
                { status: 404 }
            );
        }

        let shouldBackup = false;
        let status = 'skipped';

        if (!fs.existsSync(AUTO_BACKUP_PATH)) {
            shouldBackup = true;
            status = 'created';
        } else {
            const stats = await stat(AUTO_BACKUP_PATH);
            const lastModified = new Date(stats.mtime);
            const today = new Date();

            // Check if backup is from a different day
            if (
                lastModified.getDate() !== today.getDate() ||
                lastModified.getMonth() !== today.getMonth() ||
                lastModified.getFullYear() !== today.getFullYear()
            ) {
                shouldBackup = true;
                status = 'updated';
            }
        }

        if (shouldBackup) {
            // Copy source to auto_backup.db (overwriting if exists)
            await copyFile(DB_PATH, AUTO_BACKUP_PATH);
        }

        return NextResponse.json({
            success: true,
            status,
            message: shouldBackup
                ? 'Automatic backup updated successfully'
                : 'Automatic backup is already up to date'
        });

    } catch (error) {
        console.error('Error in auto backup:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to perform auto backup' },
            { status: 500 }
        );
    }
}
