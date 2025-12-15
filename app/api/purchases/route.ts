import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const purchases: any = query(
      `SELECT
        p.*,
        m.name as medicine_name
       FROM purchases p
       LEFT JOIN medicines m ON p.medicine_id = m.id
       ORDER BY p.purchase_date DESC`
    );

    return NextResponse.json({
      success: true,
      data: purchases,
    });
  } catch (error: any) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
