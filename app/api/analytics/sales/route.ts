import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Total sales and revenue
    let salesQuery = `
      SELECT
        COUNT(*) as total_sales,
        SUM(total_amount) as total_revenue,
        SUM(amount_paid - total_amount) as total_change,
        AVG(total_amount) as average_sale
      FROM sales
      WHERE status = 'completed'
    `;

    const params: any[] = [];

    if (startDate) {
      salesQuery += ` AND date(sale_date) >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      salesQuery += ` AND date(sale_date) <= ?`;
      params.push(endDate);
    }

    const salesStats: any = query(salesQuery, params);

    // Profit calculation
    let profitQuery = `
      SELECT
        SUM(si.profit) as total_profit
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      WHERE s.status = 'completed'
    `;

    if (startDate || endDate) {
      profitQuery += ' AND';
      if (startDate) {
        profitQuery += ` date(s.sale_date) >= '${startDate}'`;
        if (endDate) profitQuery += ' AND';
      }
      if (endDate) {
        profitQuery += ` date(s.sale_date) <= '${endDate}'`;
      }
    }

    const profitStats: any = query(profitQuery);

    // Daily sales trend
    let dailyTrendQuery = `
      SELECT
        date(sale_date) as date,
        COUNT(*) as sales_count,
        SUM(total_amount) as revenue
      FROM sales
      WHERE status = 'completed'
    `;

    if (startDate) {
      dailyTrendQuery += ` AND date(sale_date) >= ?`;
    }

    if (endDate) {
      dailyTrendQuery += ` AND date(sale_date) <= ?`;
    }

    dailyTrendQuery += ` GROUP BY date(sale_date) ORDER BY date DESC LIMIT 30`;

    const dailyTrend = query(dailyTrendQuery, params);

    // Top selling medicines
    let topMedicinesQuery = `
      SELECT
        si.medicine_name,
        SUM(si.quantity) as total_quantity,
        SUM(si.total_price) as total_revenue,
        SUM(si.profit) as total_profit,
        COUNT(DISTINCT si.sale_id) as times_sold
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      WHERE s.status = 'completed'
    `;

    if (startDate || endDate) {
      topMedicinesQuery += ' AND';
      if (startDate) {
        topMedicinesQuery += ` date(s.sale_date) >= '${startDate}'`;
        if (endDate) topMedicinesQuery += ' AND';
      }
      if (endDate) {
        topMedicinesQuery += ` date(s.sale_date) <= '${endDate}'`;
      }
    }

    topMedicinesQuery += `
      GROUP BY si.medicine_name
      ORDER BY total_revenue DESC
      LIMIT 10
    `;

    const topMedicines = query(topMedicinesQuery);

    // Payment method distribution
    let paymentQuery = `
      SELECT
        payment_method,
        COUNT(*) as count,
        SUM(total_amount) as total
      FROM sales
      WHERE status = 'completed'
    `;

    if (startDate || endDate) {
      paymentQuery += ' AND';
      if (startDate) {
        paymentQuery += ` date(sale_date) >= '${startDate}'`;
        if (endDate) paymentQuery += ' AND';
      }
      if (endDate) {
        paymentQuery += ` date(sale_date) <= '${endDate}'`;
      }
    }

    paymentQuery += ' GROUP BY payment_method';

    const paymentMethods = query(paymentQuery);

    // Hourly sales pattern
    let hourlyQuery = `
      SELECT
        CAST(strftime('%H', sale_date) AS INTEGER) as hour,
        COUNT(*) as sales_count,
        SUM(total_amount) as revenue
      FROM sales
      WHERE status = 'completed'
    `;

    if (startDate || endDate) {
      hourlyQuery += ' AND';
      if (startDate) {
        hourlyQuery += ` date(sale_date) >= '${startDate}'`;
        if (endDate) hourlyQuery += ' AND';
      }
      if (endDate) {
        hourlyQuery += ` date(sale_date) <= '${endDate}'`;
      }
    }

    hourlyQuery += ' GROUP BY strftime(\'%H\', sale_date) ORDER BY hour';

    const hourlySales = query(hourlyQuery);

    // Detailed All Sales Report
    let detailedSalesQuery = `
      SELECT
        s.sale_date,
        s.invoice_number,
        s.customer_name,
        si.medicine_name,
        si.quantity,
        si.total_price as item_total,
        s.total_amount as invoice_total,
        s.amount_paid,
        (s.amount_paid - s.total_amount) as change_amount,
        u.username as seller_name,
        m.quantity_in_stock as current_stock,
        (m.quantity_in_stock * (CASE WHEN m.units_per_carton > 0 THEN m.purchase_price_per_carton / m.units_per_carton ELSE 0 END)) as stock_value,
        (si.total_price - (si.quantity * (CASE WHEN si.cost_price > 0 THEN si.cost_price WHEN m.units_per_carton > 0 THEN m.purchase_price_per_carton / m.units_per_carton ELSE 0 END))) as item_profit
      FROM sale_items si
      JOIN sales s ON si.sale_id = s.id
      JOIN medicines m ON si.medicine_id = m.id
      LEFT JOIN users u ON s.served_by = u.id
      WHERE s.status = 'completed'
    `;

    if (startDate || endDate) {
      detailedSalesQuery += ' AND';
      if (startDate) {
        detailedSalesQuery += ` date(s.sale_date) >= '${startDate}'`;
        if (endDate) detailedSalesQuery += ' AND';
      }
      if (endDate) {
        detailedSalesQuery += ` date(s.sale_date) <= '${endDate}'`;
      }
    }

    detailedSalesQuery += ` ORDER BY s.sale_date DESC`;

    const detailedSales = query(detailedSalesQuery);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          ...salesStats[0],
          total_profit: profitStats[0]?.total_profit || 0,
        },
        dailyTrend,
        topMedicines,
        paymentMethods,
        hourlySales,
        detailedSales,
      },
    });
  } catch (error: any) {
    console.error('Error fetching sales analytics:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
