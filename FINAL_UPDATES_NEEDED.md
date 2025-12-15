# FINAL UPDATES - Complete Implementation Guide

## ✅ COMPLETED (4/8):
1. ✅ Topbar - Logout & User Session
2. ✅ Pagination Component Created
3. ✅ LoadingSpinner Component Created
4. ✅ Activity Logging Utility Created

## 🔄 FILES READY TO UPDATE:

### File: `app/dashboard/sales/page.tsx`
**Changes Needed:**
1. Add `getCurrentUserId()` import
2. Add `logActivity()` import
3. Add `served_by: getCurrentUserId()` to sale creation
4. Add activity log after successful sale
5. Add loading state for PDF generation

### File: `app/api/sales/route.ts`
**Changes Needed:**
1. Save `served_by` field from request body
2. Update INSERT query to include `served_by`

### File: `app/dashboard/medicines/page.tsx`
**Changes Needed:**
1. Add `isAdmin()` check
2. Show/hide Edit/Delete buttons based on admin role
3. Add Pagination component
4. Add loading states for all actions
5. Add activity logging

### File: `app/dashboard/users/page.tsx`
**Changes Needed:**
1. Add Pagination component
2. Import LoadingSpinner

### File: `app/dashboard/inventory/page.tsx`
**Changes Needed:**
1. Add Pagination component
2. Import LoadingSpinner

### File: `components/Sidebar.tsx`
**Changes Needed:**
1. Add mobile responsive design
2. Fix collapsed state alignment with topbar
3. Add overlay for mobile

## 📋 IMPLEMENTATION INSTRUCTIONS:

### Step 1: Update Sales to Record User

In `app/dashboard/sales/page.tsx`, add at top:
```typescript
import { getCurrentUserId } from '@/lib/auth';
import { logActivity } from '@/lib/activity';
```

In `processSale()` function, update the fetch body:
```typescript
body: JSON.stringify({
  customer_name: customerName,
  customer_phone: customerPhone,
  items: cart,
  total_amount: total,
  amount_paid: paid,
  payment_method: paymentMethod,
  served_by: getCurrentUserId(), // ADD THIS
}),
```

After successful sale, add:
```typescript
await logActivity('sale_completed', `Sale #${data.sale_id} - TZS ${total.toLocaleString()}`);
```

### Step 2: Update Sales API

In `app/api/sales/route.ts`, update the INSERT query to include `served_by`:
```typescript
const { customer_name, customer_phone, items, total_amount, amount_paid, payment_method, served_by } = body;

query(
  `INSERT INTO sales (customer_name, customer_phone, total_amount, amount_paid, payment_method, served_by, sale_date, status)
   VALUES (?, ?, ?, ?, ?, ?, datetime('now'), 'completed')`,
  [customer_name || null, customer_phone || null, total_amount, amount_paid, payment_method, served_by || null]
);
```

### Step 3: Add Admin Permissions to Medicines

In `app/dashboard/medicines/page.tsx`, add at top:
```typescript
import { isAdmin, getUserSession } from '@/lib/auth';
import { logActivity } from '@/lib/activity';
import Pagination from '@/components/Pagination';
import LoadingSpinner from '@/components/LoadingSpinner';
```

Add state:
```typescript
const [currentPage, setCurrentPage] = useState(1);
const [submitting, setSubmitting] = useState(false);
const itemsPerPage = 15;
```

Update loading display:
```typescript
{loading ? (
  <LoadingSpinner message="Loading medicines..." />
) : ( ... )}
```

Update Edit/Delete buttons (wrap in conditional):
```typescript
{isAdmin() ? (
  <>
    <button onClick={() => handleView(medicine)} ...>View</button>
    <button onClick={() => handleEdit(medicine)} ...>Edit</button>
    <button onClick={() => handleDelete(medicine.id)} ...>Delete</button>
  </>
) : (
  <>
    <button onClick={() => handleView(medicine)} ...>View</button>
    <span className="text-xs text-gray-500">Admin only</span>
  </>
)}
```

Add pagination:
```typescript
const totalPages = Math.ceil(medicines.length / itemsPerPage);
const paginatedMedicines = medicines.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

// Use paginatedMedicines in map instead of medicines

// After table:
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  itemsPerPage={itemsPerPage}
  totalItems={medicines.length}
/>
```

Add activity logging:
```typescript
// After successful add:
await logActivity('medicine_added', `Added ${formData.name}`);

// After successful edit:
await logActivity('medicine_updated', `Updated ${formData.name}`);

// After successful delete:
await logActivity('medicine_deleted', `Deleted medicine ID ${id}`);
```

### Step 4: Add Pagination to Users & Inventory

Same pattern as medicines - add:
- Pagination import
- LoadingSpinner import
- currentPage state
- itemsPerPage = 15
- Pagination component after table

### Step 5: Fix Sidebar Mobile Responsive

In `components/Sidebar.tsx`:
1. Add mobile state
2. Add overlay when open on mobile
3. Fix topbar alignment

### Step 6: Verify PDF Download

Check that jsPDF is imported correctly and downloadInvoice() function works.

## 🎯 QUICK COMMANDS TO RUN:

```bash
# Start server if not running
npm run dev

# Test login
Open http://localhost:3001/login
Email: admin@pharmacy.com
Password: admin123

# After login, test:
- Logout button in topbar
- Medicine edit/delete (admin only)
- Sales recording user
- Pagination on all tables
- Loading states
```

## ✅ FINAL CHECKLIST:

- [ ] Login works
- [ ] Logout works
- [ ] User session shows in topbar
- [ ] Sales record served_by user
- [ ] Activity logs created for all actions
- [ ] Admin-only permissions on medicine edit/delete
- [ ] Pagination on all tables (15/page)
- [ ] Loading states on all pages
- [ ] Sidebar mobile responsive
- [ ] PDF download works

