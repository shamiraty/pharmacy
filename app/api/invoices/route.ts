import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');

    let sql = `
      SELECT id, invoice_number, customer_name, customer_phone,
             total_amount, amount_paid, payment_method,
             sale_date, status
      FROM sales
      WHERE 1=1
    `;
    const params: any[] = [];

    if (startDate) {
      sql += ` AND date(sale_date) >= date(?)`;
      params.push(startDate);
    }

    if (endDate) {
      sql += ` AND date(sale_date) <= date(?)`;
      params.push(endDate);
    }

    if (search) {
      sql += ` AND (invoice_number LIKE ? OR customer_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY sale_date DESC`;

    const invoices: any = query(sql, params);

    return NextResponse.json({
      success: true,
      data: invoices,
    });
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
