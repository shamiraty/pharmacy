PHARMACY INFORMATION SYSTEM

1. tengeneza mfumo wa phamacy  tumia React.js na next.js na mysql (tayari installed)
2. tengeneza panel ya kusajiri dawa, idadi yake, kundi lake,bei iliyonunuliwa (hapa zingatia anaweza nunua kwa katoni bei ya jumla lakini anaposajiri anaingiza tu quantity zipo ngapi kwahiyo angalia namna bei ya kununua utavyoiweka kumbuka pia baadae ikiuzwa  tutatafuta faida) magonjwa inayotibu, bei yake kwa dozi au nusu dozi  inategemea na ulivyosajiri, expire date, idadi kwenye stock nk  weka  field nyingi uwezavyo kuendana na uhalisia 
3. tengeneza advanced dashboard analytics  ya dawa
4. tengeneza panel ya kuuza dawa,  anaweza chagua from table, au kuandika ugonjwa  dawa zitakuja, idadi, bei kwa jumla kutegemea na ilivyosajiriwa iuzwe kwa dozi, nusu dozi, au moja moja  na iuzwe ambayo bado haijaexpire, alafu tengeneza invoice na aweze print na download,  
5. tengeneza panel ya dashboard analytics ya mauzo yenye kuonyesha kila kitu mauzo yalivyofanyika  na tengeneza ripoti ya kina sana  excel  na PDF na iwepo filter ya kibabe sana

NB

1. UI iwe nzuri sana na modern ya kuvutia
2. database tumia xampp na nimeshainstall nimeshastart  mysql na apache (user root, password="")
3. kuwe na sidenav na top nav za kibabe sana
4. iwe na realtime
5. tumia pia sweetalert  onesha graphs  kwenye analytics etc

----------------------
1. user management  
- add user na edit user hazifanyi kazi
- sidebar  sio mobile responsive

2. sidebar iki-collapse  inaonekana haina ushirikiano na top nav  kwani zinatengana
3. switch to dark mode  inabonyezeka ila haifanyi kazi
4. ukibonyeza link kufungua page, page inafunguka ila kimya kimya  hakuna loading wala transition yoyote  yani utadhani sio react
  
----------------------
1. FILTER YA JUU  MAANDISHI HAYAONEKANI
- http://localhost:3001/dashboard/medicines
- KWENYE TABLE, VIEW, EDIT NA DELETE HAZIFANYI KAZI
- TABLE HAINA PAGING

2. http://localhost:3001/dashboard/sales
- NIKIBONYEZA KUONGEZA ITEMS  HAIONESHI NI NGAPI,  TEXT NI WHITE
- TOTAL NA AMOUNT PAID NA PAYMENT METHOD  HAZIONEKANI TEXT NI WHITE

3. YANI KWA KIFUPI INPUT TYPE  ZOTE  DATA HAZIONEKANI TEXT NADHANI NI WHITE

4. http://localhost:3001/dashboard/purchase
VIEW   ACTION HAIFANYI KAZI

http://localhost:3001/dashboard/users
5. ADD USER WALA EDIT  HAZIFANYI KAZI



MENGINEYO

1. user management  
- add user na edit user hazifanyi kazi
- sidebar  sio mobile responsive

2. sidebar iki-collapse  inaonekana haina ushirikiano na top nav  kwani zinatengana
3. switch to dark mode  inabonyezeka ila haifanyi kazi
4. ukibonyeza link kufungua page, page inafunguka ila kimya kimya  hakuna loading wala transition yoyote  yani utadhani sio react
Show less
------------------------------------------------------------------------

1. Mbona  nafungua page tu hata kama sijalogin ?
2. http://localhost:3001/dashboard:   
- today haifanyi kazi 
- dashboard sio modern
3. http://localhost:3001/dashboard/medicines
-export na import buttons hazifanyi kazi
- boresha muonekano  UI

4. http://localhost:3001/dashboard/sales
- nikibonyeza "complete sale" haioneshi progress, yanikama inasuprise hivi  baadae sana unaona sweetalert ya success
- boresha muonekano
- invoice zote za mauzo tengeneza page yake kuzitunza, iwe modern, iwe na filter na niweze ipakua, 

5. http://localhost:3001/dashboard/purchase
- button ya "view" haifanyi kazi
- boresha muonekano

6. http://localhost:3001/dashboard/medicine-analytics
- boresha muonekano
- export iwe PDF excel au Word, achague

7. http://localhost:3001/dashboard/sales-analytics
- filter ina tarehe tu,  ongeza zaidi filter iwe na vingi
- boresha muonekano
- export iwe PDF excel au Word, achague

8. http://localhost:3001/dashboard/inventory
- boresha muonekano
- nikibonyeza "view" inioneshe kama ilishawai kuuzwa, lini, na nani,  na initengenezee excel report na PDF, 

9. when i create or edit user
Error
NOT NULL constraint failed: users.username
pia delete user haipo

10. pre-reload dialog progress kila page haipo



FANYA HAYA YOTE MAMBO KUMI, BILA KUHARIBU YALIYOPO
----------------------------

- KWENYE DASHBOARD ONDOA HII DIV "Karibu Dashboard" ONDOA CARD YOTE

- METRICS CARD PUNGUZA RANGI

- TUMIA ENGLISH






















