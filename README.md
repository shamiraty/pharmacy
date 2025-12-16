



# Mwongozo wa Matumizi na Uchambuzi wa Ripoti (Pharmacy System)

Hii ni hati ya maelezo (User Manual) inayoelezea namna mfumo unavyofanya kazi kwa lugha nyepesi. Lengo ni kukusaidia kuelewa namba zinazotokea kwenye ripoti zinatoka wapi, hasa kwenye swala la Faida na Thamani ya Mzigo.

---

## 1. Fomu ya Kusajili Dawa (Add Medicine Form)
Unapoongeza dawa mpya, kuna taarifa muhimu unajaza. Hapa chini nimefafanua kwa kina maana ya kila kipengele na jinsi kinavyoathiri hesabu zako.

| Uwanja (Field) | Maana Yake | Ufafanuzi wa Kina (Kwa Mfano) |
| :--- | :--- | :--- |
| **Name** | Jina la Dawa | Jina litakalotokea wakati wa kuuza (mfano: *Panadol Extra*). |
| **Generic Name** | Jina la Kitaalamu | Jina la kemikali (mfano: *Paracetamol*). Inasaidia wateja wakiuliza dawa kwa jina la asili. |
| **Category** | Kundi | Mfano: *Painkillers*, *Antibiotics*. Inatumika kuchuja ripoti (mfano: unataka kujua Antibiotics ngapi zimeuzwa). |
| **Purchase Price (Carton)** | Bei ya Kununua (Jumla) | Hapa unaandika **bei uliyonunulia mzigo wote mkubwa**. <br> *Mfano: Umenunua katoni moja ya dawa kwa **Shilingi 50,000**. Hiyo ndiyo unayoandika hapa.* |
| **Units Per Carton** | Idadi Kwenye Katoni | Hapa unaandika **ndani ya hilo box/katoni ulilonunua, kuna dawa (units) ngapi?** <br> *Mfano: Kwenye hiyo katoni ya 50,000, kuna vidonge au chupa **500**.* <br><br> **Kwanini ni muhimu?** Mfumo unachukua ile **50,000** unagawa kwa **500** kupata gharama halisi ya kidonge kimoja (**TZS 100**). Hii ndiyo "Cost Price" itakayotumika kukokotoa faida yako. |
| **Selling Price (Full)** | Bei ya Kuuza (Jumla) | Bei unayomuuzia mteja unit nzima (mfano: Strip nzima). |
| **Selling Price (Half)** | Bei ya Kuuza (Nusu) | Bei ya kuuza sehemu ya unit (mfano: Nusu Strip) kama unaruhusu kuvunja. |
| **Quantity in Stock** | Idadi Iliyopo | Jumla ya units zote ulizazo stoo kwa sasa (sio idadi ya katoni, bali vidonge/chupa moja-moja). |

---

## 2. Uhakiki wa Hesabu (Mfano Halisi)
Hapa tunatumia ule mfano wako wa **TZS 50,000** kuona jinsi mfumo unavyopiga hesabu nyuma ya pazia ili usichanganyike.

**Taarifa Ulizojaza (Setup):**
1.  **Purchase Price (Carton):** TZS 50,000 (Ulinunua box kwa bei hii).
2.  **Units Per Carton:** 500 (Ndani ya box kuna dawa 500).
3.  **Hesabu ya Mfumo:** Mfumo unagundua kuwa `50,000 / 500 = 100`. Kwahiyo, **Kila dawa moja ilikugharimu TZS 100**. (Hii ndiyo mtaji wako per item).
4.  **Stock:** Tuseme uliingiza dawa 100 stoo.

**Tukio la Mauzo (Transaction):**
*   Mteja amekuja, umeuza dawa **2**.
*   Umemuuzia kwa bei ya **TZS 500** kila moja.
*   Jumla mteja amelipa **TZS 1,000**.

### Jinsi Ripoti Zilivyopatikana:

#### A. Stock Value (Thamani ya Stoo) ni TZS 9,800. Imepatikana vipi?
Hii inakuonyesha **Mtaji Wako** uliobaki umelala stoo.
1.  **Mzigo Uliobaki:** `100 (mwanzo) - 2 (zimeuzwa) = 98`. Bado una dawa 98 kabatini.
2.  **Gharama ya Moja:** Turekjee hesabu yetu ya juu (`50,000 / 500 = 100`). Kila dawa moja mtaji wake ni **TZS 100**.
3.  **Jibu:** `98 (dawa zilizobaki) x 100 (mtaji wa kila moja) = TZS 9,800`.
*   *Hii inakusaidia kujua kwamba, hata kama hujaauza bado, una pesa taslimu **9,800** imelala stoo katika umbo la dawa.*

#### B. Profit (Faida) ni TZS 800. Imepatikana vipi?
Faida ni `Mapato - Gharama`.
1.  **Pesa Iliyoingia (Mapato):** Mteja katoa **TZS 1,000** (kwa dawa na mbili na 500).
2.  **Gharama ya Mzigo Uliotoka:** Hizo dawa mbili ulizompa mteja, wewe ulizinunua shilingi ngapi jumla?
    *   `2 (dawa) x 100 (ile bei yetu ya kununulia) = TZS 200`.
3.  **Faida Halisi:** `1,000 (Uliyoingiza) - 200 (Uliyoteketeza kununua mzigo) = TZS 800`.

#### C. Frequency (Freq) ni 1. Hii ni nini?
1.  Hii haimaanishi idadi ya dawa zilizouzwa (Quantity).
2.  Inamaanisha **Dawa hii imetokea mara ngapi?**
3.  Kwasababu umefanya mauzo mara moja tu kwa mteja mmoja, Frequency ni **1**.
4.  Akija mteja mwingine kesho akanunua dawa hii hii (hata kama ni 50), Freq itakuwa **2**. Inakusaidia kujua dawa gani inapendwa na wateja wengi (Traffic).

---

## 3. Ufafanuzi wa Ripoti (Zinavyosoma)

### A. Transactions Report (Ripoti ya Risiti)
Hii inaonyesha mapato kulingana na risiti.

*   **Total Bill:** Jumla ya pesa yote kwenye risiti (Jumla ya bei za kuuzia).
*   **Paid:** Pesa mteja aliotoa taslimu/simu.
*   **Change/Debt:** Ukiona `-` (hasi), mteja anadaiwa. Ukiona chanya, ni chenji kapewa.

### B. Sold Items Report (Bidhaa Zilizotoka)
*   **Qty Sold:** Idadi halisi ya vidonge/chupa zilizotoka.
*   **Item Total:** Pesa taslimu iliyoingia kutokana na dawa hiyo (`Bei ya Kuuza x Qty`).
*   **Stock Left:** Unazo ngapi zimebaki stoo sasa hivi.
*   **Stock Value:** `Stock Left (Zilizobaki) x 100 (Mtaji wa moja)`. Inakuonyesha kiasi cha pesa ya mtaji ulichonacho stoo.

### C. Top Medicines Report (Dawa Zinazouzika Sana)
*   **Revenue:** Jumla ya mauzo yote ya dawa hii.
*   **Profit:** `Revenue (Mapato) - Gharama (Mtaji uliotumika)`. Hii inakuonyesha dawa gani inakupa faida kubwa zaidi, sio tu mapato makubwa.
*   **Freq:** Inaonyesha dawa ipi inatafutwa na watu wengi zaidi.

---

*Hati hii imeandaliwa ili uweze kurejea wakati wowote unapotaka kuelewa namba za biashara yako zinatoka wapi.*


# PharmaCare - Pharmacy Management System

Comprehensive pharmacy management and inventory system built with Next.js, React, and MySQL.

## Features

### 🏥 Medicine Management
- Complete medicine registration with detailed information
- Category management
- Stock tracking and alerts
- Expiry date monitoring
- Barcode support
- Multiple pricing options (full dose, half dose, single unit)

### 💰 Sales Management
- Point of Sale (POS) system
- Search medicines by name or disease
- Multiple payment methods (Cash, Card, Mobile Money)
- Invoice generation (Print & PDF download)
- Real-time stock updates

### 📊 Advanced Analytics

#### Medicine Analytics
- Stock level monitoring
- Low stock alerts
- Expiring medicines tracking
- Category distribution
- Inventory value calculation
- Excel export functionality

#### Sales Analytics
- Daily sales trends
- Revenue and profit tracking
- Top selling medicines
- Payment method distribution
- Hourly sales patterns
- Comprehensive Excel & PDF reports
- Advanced filtering by date range

### 🎨 Modern UI/UX
- Responsive design
- Clean and intuitive interface
- Real-time updates
- SweetAlert2 notifications
- Interactive charts and graphs (Recharts)
- Collapsible sidebar navigation
- Modern top navigation bar

## Tech Stack

- **Frontend**: React, Next.js 15, TypeScript
- **Styling**: Tailwind CSS
- **Database**: MySQL
- **Charts**: Recharts
- **PDF Generation**: jsPDF with autoTable
- **Excel Export**: XLSX
- **Notifications**: SweetAlert2
- **Icons**: Lucide React

## Installation

### Prerequisites
- Node.js (v18 or higher)
- XAMPP (MySQL & Apache)
- npm or yarn

### Setup Steps

1. **Start XAMPP**
   - Open XAMPP Control Panel
   - Start MySQL and Apache

2. **Create Database**
   ```bash
   # Open phpMyAdmin at http://localhost/phpmyadmin
   # Or use MySQL command line:
   mysql -u root -p
   ```

   Then run the SQL schema:
   ```bash
   mysql -u root < database/schema.sql
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Configure Environment**
   - Copy `.env.local` and update if needed
   - Default MySQL settings:
     - Host: localhost
     - User: root
     - Password: (empty)
     - Database: pharmacy_system

5. **Run Development Server**
   ```bash
   npm run dev
   ```

6. **Open Application**
   - Navigate to `http://localhost:3000`

## Default Login

- **Username**: admin
- **Email**: admin@pharmacy.com
- **Password**: admin123

## Database Schema

The system includes the following main tables:
- `users` - User accounts and authentication
- `medicine_categories` - Medicine categories
- `medicines` - Medicine inventory
- `purchases` - Purchase records
- `sales` - Sales transactions
- `sale_items` - Individual sale items
- `stock_adjustments` - Stock adjustment history

## Usage Guide

### Adding Medicines
1. Go to **Medicines** page
2. Click **Add Medicine**
3. Fill in the detailed form including:
   - Basic information (name, category, manufacturer)
   - Purchase information (carton price, units per carton)
   - Selling prices (full, half, single)
   - Stock levels
   - Medical information
   - Expiry dates

### Making Sales
1. Go to **Sales** page
2. Search for medicines by name or disease
3. Select dosage type (full, half, or single)
4. Add items to cart
5. Enter customer information (optional)
6. Enter payment amount
7. Complete sale
8. Print or download invoice

### Viewing Analytics
1. **Medicine Analytics**: View stock levels, expiring items, low stock alerts
2. **Sales Analytics**: View revenue, profit, top sellers, and generate reports

### Exporting Reports
- **Excel**: Click "Export Excel" button on analytics pages
- **PDF**: Click "PDF" button on sales analytics page

## Project Structure

```
phamacy/
├── app/
│   ├── api/              # API routes
│   │   ├── medicines/    # Medicine endpoints
│   │   ├── sales/        # Sales endpoints
│   │   ├── categories/   # Category endpoints
│   │   └── analytics/    # Analytics endpoints
│   ├── dashboard/        # Dashboard pages
│   │   ├── medicines/
│   │   ├── sales/
│   │   ├── medicine-analytics/
│   │   └── sales-analytics/
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/           # Reusable components
│   ├── Sidebar.tsx
│   └── Topbar.tsx
├── lib/                  # Utilities
│   └── db.ts            # Database connection
├── database/
│   └── schema.sql       # Database schema
└── public/              # Static files
```

## Key Features Explained

### Pricing System
The system supports flexible pricing:
- **Purchase Price per Carton**: Total cost when buying in bulk
- **Units per Carton**: Automatically calculates per-unit cost
- **Selling Prices**:
  - Full dose
  - Half dose (optional)
  - Single unit (optional)

### Profit Calculation
- Automatically calculates profit on each sale
- Tracks cost price vs selling price
- Shows profit margins in analytics

### Stock Management
- Real-time stock updates on sales
- Low stock alerts based on reorder levels
- Expiry date tracking
- Stock adjustment history

### Invoice System
- Auto-generated invoice numbers
- Professional invoice layout
- Print directly or download as PDF
- Includes all sale details and customer info

## Development

### Running in Development
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## Future Enhancements

- User authentication and authorization
- Multiple user roles (Admin, Pharmacist, Cashier)
- Supplier management
- Purchase order system
- SMS notifications for expiring medicines
- Barcode scanning integration
- Multi-branch support
- Cloud backup

## Support

For issues and questions, please check the documentation or contact support.

## License

© 2024 PharmaCare. All rights reserved.
