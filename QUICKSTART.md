# ⚡ PharmaCare Quick Start Guide

## Hatua za Haraka (Quick Steps)

### 1️⃣ Hakikisha XAMPP Inafanya Kazi
```
✅ Start MySQL
✅ Start Apache
```

### 2️⃣ Install Dependencies
```bash
npm install
```
**Subiri hadi iishe!** (Wait until finished!)

### 3️⃣ Setup Database
```bash
npm run setup-db
```

### 4️⃣ Run Application
```bash
npm run dev
```

### 5️⃣ Open Browser
```
http://localhost:3000
```

---

## 🔐 Login Info

```
Username: admin
Password: admin123
```

---

## 📋 Vipengele Vikuu (Main Features)

### 1. **Kusajiri Dawa** (Medicine Registration)
📍 **Medicines** page → Click **Add Medicine**

**Unaweza kuweka:**
- Jina la dawa
- Category
- Bei ya kununua (carton)
- Units kwa carton (automatic calculation)
- Bei za kuuza (Full/Half/Single dose)
- Idadi kwenye stock
- Magonjwa inayotibu
- Expiry date
- Na mengi zaidi!

### 2. **Kuuza Dawa** (Sales)
📍 **Sales** page

**Jinsi ya kuuza:**
1. Tafuta dawa kwa jina AU ugonjwa
2. Click dosage type (Full, Half, Single)
3. Items zitaongezeka kwenye cart
4. Jaza amount paid
5. Click **Complete Sale**
6. Print/Download invoice

### 3. **Analytics za Dawa** (Medicine Analytics)
📍 **Medicine Analytics** page

**Unaona:**
- Total medicines
- Low stock alerts
- Expiring medicines
- Category distribution
- Graphs & Charts
- Export to Excel

### 4. **Analytics za Mauzo** (Sales Analytics)
📍 **Sales Analytics** page

**Unaona:**
- Total revenue & profit
- Daily sales trends
- Top selling medicines
- Payment methods distribution
- Hourly sales patterns
- Export Excel & PDF

---

## 🎯 Muhimu Sana! (Very Important!)

### ⚠️ Alerts
Mfumo utakuambia automatic kama:
- Dawa ziko low stock
- Dawa zinaexpire (30 days kabla)
- Stock imeisha

### 💰 Profit Calculation
Bei ya kununua (cost) vs Bei ya kuuza (selling) = **Faida automatic!**

### 📊 Reports
- **Excel**: Kwa analysis
- **PDF**: Kwa printing

---

## 🚀 Pro Tips

1. **Sajiri dawa kabla ya kuuza** - Lazima iwe kwenye stock
2. **Set reorder levels** - Utapata alert mapema
3. **Check expiry dates** - Every week
4. **Backup database** - Mara kwa mara
5. **Review analytics** - Kila siku

---

## 🆘 Kama Kuna Tatizo

### Database Error?
```bash
# Check if MySQL is running
# Restart XAMPP MySQL
npm run setup-db
```

### Port 3000 Busy?
```bash
npm run dev -- -p 3001
```

### Can't Login?
```
Default password: admin123
Check if database is setup correctly
```

---

## 📞 Features Summary

| Feature | Location | Action |
|---------|----------|--------|
| Add Medicine | Medicines | Click "Add Medicine" |
| Sell Medicine | Sales | Search & Add to Cart |
| View Stock | Inventory | Auto-updated |
| Sales Report | Sales Analytics | Export Excel/PDF |
| Medicine Report | Medicine Analytics | Export Excel |
| Users | Users | Add/Manage Users |
| Settings | Settings | Configure System |

---

## 🎨 UI Features

✅ Modern & Clean Design
✅ Responsive (Mobile & Desktop)
✅ Real-time Updates
✅ SweetAlert Notifications
✅ Interactive Charts
✅ Collapsible Sidebar
✅ Search Everything

---

## 💡 Remember

- **Expired medicines** - Hazitauzwa automatic
- **Out of stock** - Haitaonekana kwenye sales
- **Invoice auto-generated** - Unique number kila sale
- **Stock auto-updated** - Baada ya sale

---

## 🎉 Karibu PharmaCare!

Mfumo umekamilika na uko ready kutumika!

**Next Steps:**
1. Sajiri dawa zako
2. Anza kuuza
3. Angalia analytics

**Happy Selling! 💊💰**
