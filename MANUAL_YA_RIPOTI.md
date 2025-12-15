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
