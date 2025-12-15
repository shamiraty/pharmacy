import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const logs: any = query(
      `SELECT
        al.id,
        al.user_id,
        al.action,
        al.details,
        al.ip_address,
        al.created_at,
        u.full_name as user_name,
        u.role as user_role
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const total: any = query('SELECT COUNT(*) as count FROM activity_logs');

    return NextResponse.json({
      success: true,
      data: logs,
      total: total[0].count,
    });
  } catch (error: any) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, action, details } = body;

    if (!user_id || !action) {
      return NextResponse.json(
        { success: false, error: 'user_id and action are required' },
        { status: 400 }
      );
    }

    query(
      `INSERT INTO activity_logs (user_id, action, details, ip_address)
       VALUES (?, ?, ?, ?)`,
      [
        user_id,
        action,
        details || '',
        request.headers.get('x-forwarded-for') || 'unknown',
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Activity logged',
    });
  } catch (error: any) {
    console.error('Error logging activity:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
