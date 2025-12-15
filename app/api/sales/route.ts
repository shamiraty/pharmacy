import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let sql = `
      SELECT
        s.*,
        u.full_name as served_by_name,
        COUNT(si.id) as total_items
      FROM sales s
      LEFT JOIN users u ON s.served_by = u.id
      LEFT JOIN sale_items si ON s.id = si.sale_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (startDate) {
      sql += ` AND date(s.sale_date) >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      sql += ` AND date(s.sale_date) <= ?`;
      params.push(endDate);
    }

    sql += ` GROUP BY s.id ORDER BY s.sale_date DESC`;

    const sales = query(sql, params);

    return NextResponse.json({ success: true, data: sales });
  } catch (error: any) {
    console.error('Error fetching sales:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      invoice_number,
      customer_name,
      customer_phone,
      items,
      total_amount,
      amount_paid,
      payment_method,
      served_by,
    } = body;

    if (!invoice_number || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Start transaction
    const change_amount = amount_paid - total_amount;

    // Insert sale
    const saleResult: any = query(
      `INSERT INTO sales (
        invoice_number, customer_name, customer_phone,
        total_amount, amount_paid, change_amount,
        payment_method, sale_date, served_by, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, 'completed')`,
      [
        invoice_number,
        customer_name,
        customer_phone,
        total_amount,
        amount_paid,
        change_amount,
        payment_method,
        served_by || null,
      ]
    );

    const saleId = saleResult[0].insertId;

    // Insert sale items and update stock
    for (const item of items) {
      // Insert sale item
      query(
        `INSERT INTO sale_items (
          sale_id, medicine_id, medicine_name, quantity,
          unit_type, unit_price, total_price, cost_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          saleId,
          item.medicine_id,
          item.medicine_name,
          item.quantity,
          item.unit_type,
          item.unit_price,
          item.total_price,
          item.cost_price || 0,
        ]
      );

      // Update medicine stock
      query(
        'UPDATE medicines SET quantity_in_stock = quantity_in_stock - ? WHERE id = ?',
        [item.quantity, item.medicine_id]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sale completed successfully',
      sale_id: saleId,
      invoice_number,
    });
  } catch (error: any) {
    console.error('Error creating sale:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
