import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BACKUP_DIR = path.join(process.cwd(), 'backups');

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const filename = searchParams.get('filename');

        if (!filename) {
            return NextResponse.json(
                { success: false, error: 'Filename is required' },
                { status: 400 }
            );
        }

        const filePath = path.join(BACKUP_DIR, filename);

        // Security check: Ensure file path is within BACKUP_DIR
        const resolvedPath = path.resolve(filePath);
        if (!resolvedPath.startsWith(path.resolve(BACKUP_DIR))) {
            return NextResponse.json(
                { success: false, error: 'Invalid file path' },
                { status: 403 }
            );
        }

        if (!fs.existsSync(filePath)) {
            return NextResponse.json(
                { success: false, error: 'File not found' },
                { status: 404 }
            );
        }

        const fileBuffer = fs.readFileSync(filePath);

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': fileBuffer.length.toString(),
            },
        });

    } catch (error: any) {
        console.error('Download error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to download file' },
            { status: 500 }
        );
    }
}
