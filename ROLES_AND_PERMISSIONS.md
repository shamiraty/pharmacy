# Roles and Permissions

## User Roles

### 1. Admin
The admin role has full system access and control.

**Permissions:**
- ✅ View dashboard and all statistics
- ✅ Make sales transactions
- ✅ View all invoices and sales history
- ✅ Add, edit, and delete medicines
- ✅ View and manage inventory
- ✅ Add, edit, and delete users
- ✅ Access all analytics and reports
- ✅ Export data (PDF, Excel, Word)
- ✅ Import medicines via file upload
- ✅ View and manage all system settings

### 2. Cashier
The cashier role is designed for front-desk staff who process sales.

**Permissions:**
- ✅ View dashboard and sales statistics
- ✅ Make sales transactions (POS)
- ✅ View all invoices
- ✅ View medicine inventory (read-only)
- ✅ Search medicines for sales
- ✅ Generate and download invoices
- ✅ View sales history
- ❌ Cannot add, edit, or delete medicines
- ❌ Cannot add, edit, or delete users
- ❌ Cannot import medicines
- ❌ Cannot modify system settings

### 3. Pharmacist (Future Implementation)
The pharmacist role will have permissions between cashier and admin.

**Planned Permissions:**
- ✅ View dashboard and all statistics
- ✅ Make sales transactions
- ✅ View all invoices
- ✅ View and edit medicine information
- ✅ Manage inventory levels
- ✅ View sales analytics
- ✅ Export reports
- ❌ Cannot add or delete medicines (admin only)
- ❌ Cannot add, edit, or delete users

## Implementation Details

### Medicine Management Restrictions
- **Add Medicine button**: Only visible to admin users
- **Edit/Delete buttons**: Only visible to admin users
- **Import function**: Only available to admin users

### User Management Restrictions
- **Add User button**: Only visible to admin users
- **Edit/Delete user actions**: Only visible to admin users
- **User list**: Visible to all authenticated users (view-only for cashiers)

### Sales & Invoices
- All roles can make sales and view invoices
- All roles can generate and download invoices
- Sales history is accessible to all roles

### Dashboard & Analytics
- All roles can view the dashboard
- All roles can access analytics pages
- All roles can export reports

## Default Credentials

**Admin Account:**
- Email: admin@pharmacy.com
- Password: admin123
- Role: admin

## Role Checking

The system uses the `isAdmin()` function from `lib/auth.ts` to check user permissions:

```typescript
import { isAdmin } from '@/lib/auth';

// Check if user is admin
if (isAdmin()) {
  // Show admin-only features
}
```

## Future Enhancements

1. **Role-based middleware**: Add server-side role checking in API routes
2. **Pharmacist role**: Implement the pharmacist role with appropriate permissions
3. **Audit logs**: Track who made changes to medicines, users, and sales
4. **Permission groups**: Allow custom permission configurations
5. **Multi-tenant support**: Support for multiple pharmacy branches with role inheritance
