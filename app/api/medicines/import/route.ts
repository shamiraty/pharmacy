
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { medicines } = await request.json();

        if (!Array.isArray(medicines) || medicines.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No medicine data provided' },
                { status: 400 }
            );
        }

        const results = {
            added: 0,
            updated: 0,
            failed: 0,
            errors: [] as string[]
        };

        // Use a transaction-like approach (looping for SQLite)
        for (const med of medicines) {
            try {
                // Validation (Basic)
                if (!med.name || !med.selling_price_full) {
                    results.failed++;
                    results.errors.push(`Skipped ${med.name || 'Unknown'}: Missing name or price`);
                    continue;
                }

                // Check if exists (Strict Match: Name + Category)
                let existing: any[] = [];
                if (med.category_id) {
                    existing = query('SELECT * FROM medicines WHERE name = ? AND category_id = ?', [med.name, med.category_id]);
                } else {
                    // Fallback to name-only if category not provided (or handle as new if strict?)
                    // User requested strict "name + category". If category is missing in import but exists in DB, it shouldn't match.
                    // But if category is missing in both, it should match.
                    existing = query('SELECT * FROM medicines WHERE name = ? AND category_id IS NULL', [med.name]);
                }

                const quantityToAdd = parseInt(med.quantity_in_stock || '0');
                const purchasePrice = parseFloat(med.purchase_price_per_carton || '0');
                const unitsPerCarton = parseInt(med.units_per_carton || '1');
                const sellingPriceFull = parseFloat(med.selling_price_full || '0');
                const sellingPriceHalf = parseFloat(med.selling_price_half || '0');
                const sellingPriceSingle = parseFloat(med.selling_price_single || '0');

                if (existing && existing.length > 0) {
                    // UPDATE: Add stock, update prices to latest
                    const currentStock = existing[0].quantity_in_stock;
                    const newStock = currentStock + quantityToAdd;

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
              category_id = ?
             WHERE id = ?`,
                        [
                            newStock,
                            purchasePrice,
                            unitsPerCarton,
                            sellingPriceFull,
                            sellingPriceHalf,
                            sellingPriceSingle,
                            med.expiry_date || existing[0].expiry_date,
                            med.manufacturer || existing[0].manufacturer,
                            med.generic_name || existing[0].generic_name,
                            med.category_id || existing[0].category_id,
                            existing[0].id
                        ]
                    );
                    results.updated++;
                } else {
                    // INSERT NEW
                    query(
                        `INSERT INTO medicines (
              name, generic_name, category_id, manufacturer,
              purchase_price_per_carton, units_per_carton,
              selling_price_full, selling_price_half, selling_price_single,
              quantity_in_stock, reorder_level, expiry_date, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 10, ?, 'active')`,
                        [
                            med.name,
                            med.generic_name || '',
                            med.category_id || null,
                            med.manufacturer || '',
                            purchasePrice,
                            unitsPerCarton,
                            sellingPriceFull,
                            sellingPriceHalf,
                            sellingPriceSingle,
                            quantityToAdd,
                            med.expiry_date || new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Default 1 year expiry
                        ]
                    );
                    results.added++;
                }
            } catch (err: any) {
                results.failed++;
                results.errors.push(`Error processing ${med.name}: ${err.message}`);
            }
        }

        return NextResponse.json({ success: true, results });

    } catch (error: any) {
        console.error('Import error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error during import' },
            { status: 500 }
        );
    }
}
