import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = params.id;

    const sales: any = query(
      `SELECT * FROM sales WHERE id = ?`,
      [id]
    );

    if (sales.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const items: any = query(
      `SELECT si.*, m.name as medicine_name
       FROM sale_items si
       JOIN medicines m ON si.medicine_id = m.id
       WHERE si.sale_id = ?`,
      [id]
    );

    return NextResponse.json({
      success: true,
      data: {
        ...sales[0],
        items,
      },
    });
  } catch (error: any) {
    console.error('Error fetching invoice details:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
