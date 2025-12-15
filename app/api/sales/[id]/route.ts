import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const saleId = params.id;

    // Get sale details
    const sales: any = query(
      `SELECT s.*, u.full_name as served_by_name
       FROM sales s
       LEFT JOIN users u ON s.served_by = u.id
       WHERE s.id = ?`,
      [saleId]
    );

    if (sales.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Sale not found' },
        { status: 404 }
      );
    }

    const sale = sales[0];

    // Get sale items
    const items = query(
      `SELECT * FROM sale_items WHERE sale_id = ?`,
      [saleId]
    );

    return NextResponse.json({
      success: true,
      data: {
        ...sale,
        items,
      },
    });
  } catch (error: any) {
    console.error('Error fetching sale details:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
