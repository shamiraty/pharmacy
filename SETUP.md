# Jinsi ya Kuanzisha Mfumo wa PharmaCare

## Hatua za Kuanzisha

### 1. Hakikisha XAMPP Inafanya Kazi

1. Fungua XAMPP Control Panel
2. Click **Start** kwa MySQL
3. Click **Start** kwa Apache
4. Hakikisha buttons zimegeuka green (running)

### 2. Install Dependencies

Fungua Command Prompt/Terminal kwenye folder hii na run:

```bash
npm install
```

**Subiri mpaka installation iishe kabisa!** Inaweza kuchukua dakika 2-5.

### 3. Setup Database

Baada ya npm install kumaliza, run:

```bash
npm run setup-db
```

Hii itatengeneza:
- Database ya `pharmacy_system`
- Tables zote zinazohitajika
- Default admin user
- Medicine categories

### 4. Anzisha Application

```bash
npm run dev
```

### 5. Fungua Browser

Nenda kwenye: `http://localhost:3000`

## Kuingia kwa Mara ya Kwanza

```
Username: admin
Email: admin@pharmacy.com
Password: admin123
```

## Matatizo na Masuluhisho

### Kama database haijasetup:

1. Hakikisha MySQL inafanya kazi kwenye XAMPP
2. Run tena: `npm run setup-db`

### Kama port 3000 ina shida:

```bash
npm run dev -- -p 3001
```

Kisha fungua: `http://localhost:3001`

### Kama kuna error ya MySQL connection:

1. Hakikisha MySQL password ni empty (default ya XAMPP)
2. Check file `.env.local` - hakikisha:
   ```
   DATABASE_HOST=localhost
   DATABASE_USER=root
   DATABASE_PASSWORD=
   DATABASE_NAME=pharmacy_system
   ```

## Vipengele vya Mfumo

### 1. Kusajiri Dawa
- Nenda **Medicines** kwenye sidebar
- Click **Add Medicine**
- Jaza taarifa zote
- Click **Add Medicine**

### 2. Kuuza Dawa
- Nenda **Sales** kwenye sidebar
- Tafuta dawa kwa jina au ugonjwa
- Click dosage type (Full, Half, au Single)
- Jaza taarifa za customer (optional)
- Jaza amount paid
- Click **Complete Sale**
- Print au download invoice

### 3. Kuangalia Analytics
- **Medicine Analytics**: Stock levels, expiring medicines, low stock
- **Sales Analytics**: Revenue, profit, top sellers, reports

### 4. Kupiga Ripoti
- **Excel**: Click "Export Excel" kwenye analytics pages
- **PDF**: Click "PDF" button kwenye sales analytics

## Muhimu!

1. Backup database mara kwa mara
2. Monitor expiring medicines
3. Check low stock alerts
4. Review sales analytics kila siku

## Msaada

Kama una swali au tatizo, check README.md kwa taarifa zaidi.

---

**Furahia kutumia PharmaCare! 🎉**
