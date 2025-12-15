import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Get today's date for filtering
    const today = new Date().toISOString().split('T')[0];

    // Total Revenue (all time)
    const revenueResult: any = query(
      `SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM sales WHERE status = 'completed'`
    );

    // Total Sales Count
    const salesCountResult: any = query(
      `SELECT COUNT(*) as total_sales FROM sales WHERE status = 'completed'`
    );

    // Today's Sales Count
    const todaySalesResult: any = query(
      `SELECT COUNT(*) as today_sales, COALESCE(SUM(total_amount), 0) as today_revenue
       FROM sales
       WHERE status = 'completed' AND date(sale_date) = date('now')`
    );

    // Total Medicines
    const medicinesResult: any = query(
      `SELECT COUNT(*) as total_medicines FROM medicines`
    );

    // Low Stock Items (quantity <= reorder_level)
    const lowStockResult: any = query(
      `SELECT COUNT(*) as low_stock FROM medicines WHERE quantity_in_stock <= reorder_level`
    );

    // Expiring Soon (within 30 days)
    const expiringSoonResult: any = query(
      `SELECT COUNT(*) as expiring_soon
       FROM medicines
       WHERE date(expiry_date) BETWEEN date('now') AND date('now', '+30 days')`
    );

    // Get sales trend for last 7 days
    const salesTrend: any = query(
      `SELECT
        date(sale_date) as date,
        COUNT(*) as sales_count,
        SUM(total_amount) as revenue
       FROM sales
       WHERE status = 'completed' AND sale_date >= date('now', '-7 days')
       GROUP BY date(sale_date)
       ORDER BY date(sale_date)`
    );

    // Top selling medicines
    const topSelling: any = query(
      `SELECT
        m.name,
        SUM(si.quantity) as total_sold,
        SUM(si.total_price) as total_revenue
       FROM sale_items si
       JOIN medicines m ON si.medicine_id = m.id
       JOIN sales s ON si.sale_id = s.id
       WHERE s.status = 'completed'
       GROUP BY m.id, m.name
       ORDER BY total_sold DESC
       LIMIT 5`
    );

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: revenueResult[0]?.total_revenue || 0,
        totalSales: salesCountResult[0]?.total_sales || 0,
        todaySales: todaySalesResult[0]?.today_sales || 0,
        todayRevenue: todaySalesResult[0]?.today_revenue || 0,
        totalMedicines: medicinesResult[0]?.total_medicines || 0,
        lowStock: lowStockResult[0]?.low_stock || 0,
        expiringSoon: expiringSoonResult[0]?.expiring_soon || 0,
        salesTrend,
        topSelling,
      },
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
