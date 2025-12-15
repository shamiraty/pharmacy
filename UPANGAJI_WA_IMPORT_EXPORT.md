# Mpango wa Import na Export (System Documentation)

Hii ni nyaraka inayoelezea jinsi mfumo wa Import na Export unavyofanya kazi katika sehemu ya Dawa (Medicines).

## 1. Import ya Dawa (Kuingiza Dawa)

Mfumo unatumia faili la **CSV (Comma Separated Values)** kuingiza dawa nyingi kwa mpigo.

### Mtiririko wa Kazi (Workflow)
1.  **Chagua Faili:** Mtumiaji anachagua faili la `.csv`.
2.  **Hakiki (Validation):**
    -   Mfumo unasoma faili na kuangalia kama zimekidhi vigezo.
    -   Safu (Columns) zinazohitajika: `name`, `category`, `stock`, `price_full` (nyingine ni hiyari).
    -   Ukaguzi wa data:
        -   `stock` lazima iwe namba.
        -   `Expiry date` isiwe imepita au format mbovu.
3.  **Preview (Hakiki Kabla ya Kuhifadhi):**
    -   Mtumiaji anaonyeshwa jedwali la dawa zilizosomwa.
    -   Dawa zenye makosa zinawekewa alama nyekundu.
    -   Dawa sahihi zinawekewa tiki ya kijani.
4.  **Confirm Import (Kutuma Seva):**
    -   Mtumiaji akibonyeza "Confirm Import", data inatumwa kwa API (`/api/medicines/import`).

### Upsert Logic (Kuzuia Dawa Kujirudia)
Mfumo unatumia akili ya **"Upsert"** (Update or Insert) kuhakikisha hatutengenezi dawa mbili zenye jina moja.

*   **Vigezo vya Kulinganisha:** Tunalinganisha `name` (Jina la Dawa) na `category_id` (Kundi la Dawa).
*   **Kama Dawa Ipo (MATCH):**
    -   Tunachukua `quantity_in_stock` mpya na **KUJUMLISHA** na stock iliyopo.
        -   *Mfano:* Stock ya zamani = 10, Mpya = 50. Stock mpya itakuwa **60**.
    -   Bei na taarifa nyingine (Expiry, Manufacturer) **ZINABADILISHWA (OVERWRITE)** na kuwa mpya.
*   **Kama Dawa Haipo (NO MATCH):**
    -   Tunatengeneza rekodi mpya kabisa kwenye database.

---

## 2. Export ya Dawa (Kutoa Ripoti)

Mfumo unaruhusu kutoa orodha ya dawa katika format ya **Excel (.xlsx)** na **PDF**.

### Excel Export
Tunatumia library ya `xlsx` kutengeneza faili la Excel lenye mpangilio mzuri.

*   **Jina la Faili:** `Medicines_Inventory_[Tarehe].xlsx`
*   **Data Zinazotoka:**
    -   Jina la Dawa
    -   Generic Name
    -   Category
    -   Stock Iliyopo (Na Stock Status)
    -   Bei zote (Kununua, Kuuza Jumla, Rejareja)
    -   Tarehe ya Kuexpire
    -   Manufacturer
    -   Location (Shelf)

### PDF Export
Tunatumia `jspdf` na `jspdf-autotable` kutoa ripoti ya kuchapisha.

*   Inaonyesha jedwali safi lenye taarifa muhimu tu kwa ajili ya ukaguzi wa haraka.
*   Inaweka kichwa cha ripoti na tarehe ya kutolewa.

---

## 3. Best Practices (Mazingatio)

1.  **Data Integrity:** Kila mara tunahakikisha `stock` haiwezi kuwa `negative` isipokuwa kwa mauzo yasiyo ya kawaida.
2.  **Sales History:** Bei ikibadilika wakati wa Import, mauzo ya zamani **HAYABADILIKI**. Bei ya mauzo inahifadhiwa kwenye `sale_items` wakati wa kuuza (Snapshot), hivyo historia iko salama.
3.  **Filtration:** Export inazingatia filters ulizoweka. Ukichuja dawa za "Antibiotics" tu, basi Export itatoa Excel ya "Antibiotics" pekee.
