import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const medicineId = params.id;

    // Fetch sales history for this medicine
    const salesHistory: any = query(
      `SELECT
        si.quantity,
        si.unit_price,
        si.total_price as subtotal,
        s.sale_date,
        s.invoice_number,
        s.customer_name,
        s.customer_phone,
        s.payment_method,
        u.full_name as served_by_name
       FROM sale_items si
       JOIN sales s ON si.sale_id = s.id
       LEFT JOIN users u ON s.served_by = u.id
       WHERE si.medicine_id = ?
       ORDER BY s.sale_date DESC`,
      [medicineId]
    );

    return NextResponse.json({
      success: true,
      data: salesHistory,
    });
  } catch (error: any) {
    console.error('Error fetching sales history:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
