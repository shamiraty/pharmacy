
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pharmacy.db');

db.serialize(() => {
    // Check sale_items for 'shamir'
    db.all("SELECT * FROM sale_items WHERE medicine_name LIKE '%shamir%'", (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('Found items:', rows.length);
        console.log(rows);

        // If found, we need to decide if we delete the sale entirely or just the item.
        // User said "futa sales yenye item shamir", implying the whole sale transaction.
        if (rows.length > 0) {
            const saleIds = [...new Set(rows.map(r => r.sale_id))];
            console.log('Sale IDs to delete:', saleIds);

            // Query the sales to see them
            db.all(`SELECT * FROM sales WHERE id IN (${saleIds.join(',')})`, (err, sales) => {
                if (err) console.error(err);
                console.log('Sales to delete:', sales);
            });
        }
    });
});

db.close();
