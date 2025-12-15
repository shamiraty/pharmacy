import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const unlink = promisify(fs.unlink);

const BACKUP_DIR = path.join(process.cwd(), 'backups');

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const filename = searchParams.get('filename');

        if (!filename) {
            return NextResponse.json({ success: false, error: 'Filename is required' }, { status: 400 });
        }

        // Security check: Ensure filename contains only safe characters and no path traversal
        if (!/^[a-zA-Z0-9_.-]+$/.test(filename) || filename.includes('..')) {
            return NextResponse.json({ success: false, error: 'Invalid filename' }, { status: 400 });
        }

        // Don't allow deleting the auto backup via this route (optional safety, but good to have)
        if (filename === 'auto_backup.db') {
            return NextResponse.json({ success: false, error: 'Cannot delete the automatic system backup' }, { status: 403 });
        }

        const filePath = path.join(BACKUP_DIR, filename);

        // Check if file exists within the backup folder
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
        }

        // Delete the file
        await unlink(filePath);

        return NextResponse.json({ success: true, message: 'Backup deleted successfully' });
    } catch (error) {
        console.error('Delete backup error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete backup' },
            { status: 500 }
        );
    }
}
