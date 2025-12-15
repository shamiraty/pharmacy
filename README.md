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
