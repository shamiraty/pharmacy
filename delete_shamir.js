
const Database = require('better-sqlite3');
const db = new Database('pharmacy.db');

try {
    // 1. Find items
    const items = db.prepare("SELECT * FROM sale_items WHERE medicine_name LIKE '%shamir%'").all();
    console.log(`Found ${items.length} items with 'shamir'`);

    if (items.length > 0) {
        const saleIds = [...new Set(items.map(i => i.sale_id))];
        console.log(`Associated Sale IDs: ${saleIds.join(', ')}`);

        // 2. Delete items
        const deleteItems = db.prepare(`DELETE FROM sale_items WHERE sale_id IN (${saleIds.join(',')})`);
        const itemsResult = deleteItems.run();
        console.log(`Deleted ${itemsResult.changes} sale items.`);

        // 3. Delete sales
        const deleteSales = db.prepare(`DELETE FROM sales WHERE id IN (${saleIds.join(',')})`);
        const salesResult = deleteSales.run();
        console.log(`Deleted ${salesResult.changes} sales.`);
    } else {
        console.log("No items found to delete.");
    }

} catch (err) {
    console.error("Error:", err);
} finally {
    db.close();
}
