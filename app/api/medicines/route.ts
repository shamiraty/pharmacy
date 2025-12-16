import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const salesStartDate = searchParams.get('salesStartDate');
    const salesEndDate = searchParams.get('salesEndDate');

    // Base WHERE conditions
    let whereClause = `WHERE 1=1`;
    const params: any[] = [];

    // Sales Subquery Logic
    let salesDateCondition = "";
    const salesParams: any[] = [];

    // We need to join sales to filter by date reliably
    // Subquery constraint:
    // WHERE si.medicine_id = m.id AND EXISTS (SELECT 1 FROM sales s WHERE s.id = si.sale_id AND s.sale_date >= ? ...)

    if (salesStartDate) {
      salesDateCondition += " AND s.sale_date >= date(?)";
      salesParams.push(salesStartDate);
    }
    if (salesEndDate) {
      salesDateCondition += " AND s.sale_date <= date(?)";
      salesParams.push(salesEndDate);
    }

    // ... inside SQL ...
    // (SELECT COUNT(*) FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE si.medicine_id = m.id ${salesDateCondition})

    // Params construction:
    // query(sql, [...salesParams, ...salesParams, ...salesParams, ...filterParams])

    if (search) {
      whereClause += ` AND (m.name LIKE ? OR m.generic_name LIKE ? OR m.diseases_treated LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category) {
      whereClause += ` AND m.category_id = ?`;
      params.push(category);
    }

    // Price Filter (Selling Price Full)
    if (minPrice) {
      whereClause += ` AND m.selling_price_full >= ?`;
      params.push(minPrice);
    }
    if (maxPrice) {
      whereClause += ` AND m.selling_price_full <= ?`;
      params.push(maxPrice);
    }

    // Date Filters (Created At)
    if (startDate) {
      whereClause += ` AND date(m.created_at) >= date(?)`;
      params.push(startDate);
    }
    if (endDate) {
      whereClause += ` AND date(m.created_at) <= date(?)`;
      params.push(endDate);
    }

    // Month/Year Filter
    if (month) {
      // SQLite: strftime('%m', created_at)
      whereClause += ` AND cast(strftime('%m', m.created_at) as integer) = ?`;
      params.push(month);
    }
    if (year) {
      // SQLite: strftime('%Y', created_at)
      whereClause += ` AND cast(strftime('%Y', m.created_at) as integer) = ?`;
      params.push(year);
    }

    // Main Query
    let sql = `
      SELECT
        m.*,
        mc.name as category_name,
        (SELECT COUNT(*) FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE si.medicine_id = m.id ${salesDateCondition}) as times_sold,
        (SELECT COALESCE(SUM(si.quantity), 0) FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE si.medicine_id = m.id ${salesDateCondition}) as total_sold_qty,
        (SELECT COALESCE(SUM(si.total_price), 0) FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE si.medicine_id = m.id ${salesDateCondition}) as total_sold_value,
        CASE
          WHEN date(m.expiry_date) < date('now') THEN 'expired'
          WHEN date(m.expiry_date) <= date('now', '+30 days') THEN 'expiring_soon'
          WHEN m.quantity_in_stock <= m.reorder_level THEN 'low_stock'
          ELSE 'active'
        END as stock_status
      FROM medicines m
      LEFT JOIN medicine_categories mc ON m.category_id = mc.id
      ${whereClause}
    `;

    // Handle Status Filter (Computed Column)
    // We use HAVING for computed columns, or wrap in subquery. 
    // Since we are selecting all, HAVING is easiest but requires the CASE in GROUP BY or just standard SQL. 
    // SQLite allows HAVING on alias.
    if (status) {
      sql += ` HAVING stock_status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY m.created_at DESC`;

    const medicines: any[] = query(sql, [...salesParams, ...salesParams, ...salesParams, ...params]);

    // Calculate Summary Stats from the RESULT set (to respect all filters including status)
    // Calculating here in JS is roughly fine for typical inventory sizes (< 10k). 
    // For massive scale, we'd want a separate aggregated query.
    // Given the constraints and likely size, JS reduce is totally fine and robust.

    const summary = medicines.reduce((acc, med) => {
      const cost = med.purchase_price_per_carton && med.units_per_carton ? (med.purchase_price_per_carton / med.units_per_carton) : 0;

      acc.total_medicines += 1;
      acc.total_stock_value += (med.quantity_in_stock * cost);
      acc.total_selling_value += (med.quantity_in_stock * med.selling_price_full);
      acc.total_sold_qty += (med.total_sold_qty || 0);
      acc.total_sold_value += (med.total_sold_value || 0); // Revenue from this med
      return acc;
    }, {
      total_medicines: 0,
      total_stock_value: 0,
      total_selling_value: 0,
      total_sold_qty: 0,
      total_sold_value: 0
    });

    return NextResponse.json({ success: true, data: medicines, summary });
  } catch (error: any) {
    console.error('Error fetching medicines:', error);
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
      name,
      generic_name,
      category_id,
      manufacturer,
      purchase_price_per_carton,
      units_per_carton,
      selling_price_full,
      selling_price_half,
      selling_price_single,
      quantity_in_stock,
      reorder_level,
      diseases_treated,
      dosage_form,
      strength,
      usage_instructions,
      side_effects,
      manufacture_date,
      expiry_date,
      barcode,
      shelf_location,
    } = body;

    // Validate required fields
    if (!name || !expiry_date || !units_per_carton || !selling_price_full) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if exists (Upsert Logic matching Import)
    const existing: any = query(
      'SELECT * FROM medicines WHERE name = ? AND category_id = ?',
      [name, category_id]
    );

    if (existing && existing.length > 0) {
      // UPDATE EXISTING
      const currentStock = existing[0].quantity_in_stock;
      const addedStock = parseInt(quantity_in_stock || '0');
      const newStock = currentStock + addedStock;

      query(
        `UPDATE medicines SET 
          quantity_in_stock = ?,
          purchase_price_per_carton = ?,
          units_per_carton = ?,
          selling_price_full = ?,
          selling_price_half = ?,
          selling_price_single = ?,
          expiry_date = ?,
          manufacturer = ?,
          generic_name = ?,
          reorder_level = ?,
          diseases_treated = ?,
          dosage_form = ?,
          strength = ?,
          usage_instructions = ?,
          side_effects = ?,
          manufacture_date = ?,
          barcode = ?,
          shelf_location = ?
         WHERE id = ?`,
        [
          newStock,
          purchase_price_per_carton,
          units_per_carton,
          selling_price_full,
          selling_price_half,
          selling_price_single,
          expiry_date,
          manufacturer,
          generic_name,
          reorder_level || 10,
          diseases_treated,
          dosage_form,
          strength,
          usage_instructions,
          side_effects,
          manufacture_date,
          barcode,
          shelf_location,
          existing[0].id
        ]
      );

      return NextResponse.json({
        success: true,
        message: 'Medicine updated (Stock merged)',
        id: existing[0].id,
        isUpdate: true
      });

    } else {
      // INSERT NEW
      const sql = `
        INSERT INTO medicines (
          name, generic_name, category_id, manufacturer,
          purchase_price_per_carton, units_per_carton,
          selling_price_full, selling_price_half, selling_price_single,
          quantity_in_stock, reorder_level,
          diseases_treated, dosage_form, strength,
          usage_instructions, side_effects,
          manufacture_date, expiry_date,
          barcode, shelf_location
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const result: any = query(sql, [
        name,
        generic_name,
        category_id,
        manufacturer,
        purchase_price_per_carton,
        units_per_carton,
        selling_price_full,
        selling_price_half,
        selling_price_single,
        quantity_in_stock || 0,
        reorder_level || 10,
        diseases_treated,
        dosage_form,
        strength,
        usage_instructions,
        side_effects,
        manufacture_date,
        expiry_date,
        barcode,
        shelf_location,
      ]);

      return NextResponse.json({
        success: true,
        message: 'Medicine added successfully',
        id: result[0].insertId,
      });
    }

  } catch (error: any) {
    console.error('Error adding/updating medicine:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Medicine ID is required' },
        { status: 400 }
      );
    }

    const fields = Object.keys(updateData)
      .map((key) => `${key} = ?`)
      .join(', ');
    const values = Object.values(updateData);

    const sql = `UPDATE medicines SET ${fields} WHERE id = ?`;
    query(sql, [...values, id]);

    return NextResponse.json({
      success: true,
      message: 'Medicine updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating medicine:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Medicine ID is required' },
        { status: 400 }
      );
    }

    query('DELETE FROM medicines WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'Medicine deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting medicine:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
