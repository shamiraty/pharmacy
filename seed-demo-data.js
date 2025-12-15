const Database = require('better-sqlite3');
const path = require('path');

function seedDemoData() {
  console.log('🌱 Starting demo data seeding...\n');

  try {
    const dbPath = path.join(__dirname, 'pharmacy.db');
    const db = new Database(dbPath);
    db.pragma('foreign_keys = ON');

    console.log('📊 Fetching categories...');
    const categories = db.prepare('SELECT * FROM medicine_categories').all();
    console.log(`✅ Found ${categories.length} categories\n`);

    // Real medicine data from Tanzania
    const medicines = [
      // Analgesics (Pain relievers)
      { name: 'Panadol', generic: 'Paracetamol', category: 'Analgesics', manufacturer: 'GSK', diseases: 'Headache, Fever, Body pain', form: 'Tablet', strength: '500mg', cartonPrice: 15000, unitsPerCarton: 100, fullPrice: 500, halfPrice: 300, singlePrice: 200, stock: 500, reorder: 50 },
      { name: 'Panadol Extra', generic: 'Paracetamol + Caffeine', category: 'Analgesics', manufacturer: 'GSK', diseases: 'Severe headache, Migraine', form: 'Tablet', strength: '500mg+65mg', cartonPrice: 18000, unitsPerCarton: 100, fullPrice: 600, halfPrice: 350, singlePrice: 250, stock: 300, reorder: 30 },
      { name: 'Brufen', generic: 'Ibuprofen', category: 'Analgesics', manufacturer: 'Abbott', diseases: 'Inflammation, Pain, Fever', form: 'Tablet', strength: '400mg', cartonPrice: 20000, unitsPerCarton: 100, fullPrice: 700, halfPrice: 400, singlePrice: 300, stock: 400, reorder: 40 },
      { name: 'Aspirin', generic: 'Acetylsalicylic Acid', category: 'Analgesics', manufacturer: 'Bayer', diseases: 'Pain, Fever, Blood clotting prevention', form: 'Tablet', strength: '300mg', cartonPrice: 12000, unitsPerCarton: 100, fullPrice: 400, halfPrice: 250, singlePrice: 150, stock: 350, reorder: 35 },
      { name: 'Diclofenac', generic: 'Diclofenac Sodium', category: 'Analgesics', manufacturer: 'Novartis', diseases: 'Arthritis, Joint pain, Muscle pain', form: 'Tablet', strength: '50mg', cartonPrice: 16000, unitsPerCarton: 100, fullPrice: 550, halfPrice: 300, singlePrice: 200, stock: 280, reorder: 30 },
      { name: 'Nurofen', generic: 'Ibuprofen', category: 'Analgesics', manufacturer: 'Reckitt', diseases: 'Pain, Fever, Inflammation', form: 'Tablet', strength: '200mg', cartonPrice: 22000, unitsPerCarton: 100, fullPrice: 750, halfPrice: 450, singlePrice: 300, stock: 320, reorder: 30 },
      { name: 'Piriton', generic: 'Chlorpheniramine', category: 'Analgesics', manufacturer: 'GSK', diseases: 'Allergies, Itching, Cold symptoms', form: 'Tablet', strength: '4mg', cartonPrice: 14000, unitsPerCarton: 100, fullPrice: 450, halfPrice: 250, singlePrice: 180, stock: 270, reorder: 25 },
      { name: 'Voltaren', generic: 'Diclofenac', category: 'Analgesics', manufacturer: 'Novartis', diseases: 'Muscle pain, Joint pain, Arthritis', form: 'Tablet', strength: '50mg', cartonPrice: 25000, unitsPerCarton: 100, fullPrice: 850, halfPrice: 500, singlePrice: 350, stock: 200, reorder: 20 },

      // Antibiotics
      { name: 'Amoxil', generic: 'Amoxicillin', category: 'Antibiotics', manufacturer: 'GSK', diseases: 'Bacterial infections, Pneumonia, UTI', form: 'Capsule', strength: '500mg', cartonPrice: 30000, unitsPerCarton: 100, fullPrice: 1000, halfPrice: 600, singlePrice: 400, stock: 450, reorder: 50 },
      { name: 'Augmentin', generic: 'Amoxicillin + Clavulanic Acid', category: 'Antibiotics', manufacturer: 'GSK', diseases: 'Resistant bacterial infections', form: 'Tablet', strength: '625mg', cartonPrice: 45000, unitsPerCarton: 100, fullPrice: 1500, halfPrice: 900, singlePrice: 600, stock: 300, reorder: 30 },
      { name: 'Azithromycin', generic: 'Azithromycin', category: 'Antibiotics', manufacturer: 'Pfizer', diseases: 'Respiratory infections, STDs', form: 'Tablet', strength: '500mg', cartonPrice: 50000, unitsPerCarton: 100, fullPrice: 1700, halfPrice: 1000, singlePrice: 700, stock: 250, reorder: 25 },
      { name: 'Ciprofloxacin', generic: 'Ciprofloxacin', category: 'Antibiotics', manufacturer: 'Bayer', diseases: 'UTI, GI infections, Respiratory infections', form: 'Tablet', strength: '500mg', cartonPrice: 35000, unitsPerCarton: 100, fullPrice: 1200, halfPrice: 700, singlePrice: 500, stock: 380, reorder: 40 },
      { name: 'Doxycycline', generic: 'Doxycycline', category: 'Antibiotics', manufacturer: 'Pfizer', diseases: 'Malaria prevention, STDs, Acne', form: 'Capsule', strength: '100mg', cartonPrice: 28000, unitsPerCarton: 100, fullPrice: 950, halfPrice: 550, singlePrice: 400, stock: 320, reorder: 30 },
      { name: 'Erythromycin', generic: 'Erythromycin', category: 'Antibiotics', manufacturer: 'Abbott', diseases: 'Respiratory infections, Skin infections', form: 'Tablet', strength: '250mg', cartonPrice: 32000, unitsPerCarton: 100, fullPrice: 1100, halfPrice: 650, singlePrice: 450, stock: 280, reorder: 30 },
      { name: 'Metronidazole', generic: 'Metronidazole', category: 'Antibiotics', manufacturer: 'Sanofi', diseases: 'Bacterial vaginosis, Dental infections', form: 'Tablet', strength: '400mg', cartonPrice: 18000, unitsPerCarton: 100, fullPrice: 600, halfPrice: 350, singlePrice: 250, stock: 400, reorder: 40 },
      { name: 'Septrin', generic: 'Cotrimoxazole', category: 'Antibiotics', manufacturer: 'GSK', diseases: 'UTI, Respiratory infections, Prevention in HIV', form: 'Tablet', strength: '480mg', cartonPrice: 20000, unitsPerCarton: 100, fullPrice: 700, halfPrice: 400, singlePrice: 300, stock: 450, reorder: 50 },
      { name: 'Ceftriaxone', generic: 'Ceftriaxone', category: 'Antibiotics', manufacturer: 'Roche', diseases: 'Severe bacterial infections, Gonorrhea', form: 'Injection', strength: '1g', cartonPrice: 80000, unitsPerCarton: 50, fullPrice: 5500, halfPrice: null, singlePrice: 2800, stock: 150, reorder: 20 },
      { name: 'Penicillin', generic: 'Benzylpenicillin', category: 'Antibiotics', manufacturer: 'Sandoz', diseases: 'Strep throat, Syphilis, Bacterial infections', form: 'Injection', strength: '5 million IU', cartonPrice: 60000, unitsPerCarton: 50, fullPrice: 4000, halfPrice: null, singlePrice: 2000, stock: 180, reorder: 20 },

      // Antimalarials
      { name: 'Malaraquin', generic: 'Chloroquine', category: 'Antimalarials', manufacturer: 'Shelys', diseases: 'Malaria', form: 'Tablet', strength: '250mg', cartonPrice: 25000, unitsPerCarton: 100, fullPrice: 800, halfPrice: 500, singlePrice: 350, stock: 600, reorder: 60 },
      { name: 'Coartem', generic: 'Artemether + Lumefantrine', category: 'Antimalarials', manufacturer: 'Novartis', diseases: 'Malaria (first-line treatment)', form: 'Tablet', strength: '20mg+120mg', cartonPrice: 55000, unitsPerCarton: 100, fullPrice: 1800, halfPrice: 1100, singlePrice: 750, stock: 500, reorder: 50 },
      { name: 'Fansidar', generic: 'Sulfadoxine + Pyrimethamine', category: 'Antimalarials', manufacturer: 'Roche', diseases: 'Malaria prevention in pregnancy', form: 'Tablet', strength: '500mg+25mg', cartonPrice: 30000, unitsPerCarton: 100, fullPrice: 1000, halfPrice: 600, singlePrice: 400, stock: 400, reorder: 40 },
      { name: 'Quinine', generic: 'Quinine Sulphate', category: 'Antimalarials', manufacturer: 'Various', diseases: 'Severe malaria', form: 'Tablet', strength: '300mg', cartonPrice: 35000, unitsPerCarton: 100, fullPrice: 1200, halfPrice: 700, singlePrice: 500, stock: 350, reorder: 35 },
      { name: 'Artesunate', generic: 'Artesunate', category: 'Antimalarials', manufacturer: 'Guilin', diseases: 'Severe malaria', form: 'Injection', strength: '60mg', cartonPrice: 90000, unitsPerCarton: 50, fullPrice: 6000, halfPrice: null, singlePrice: 3000, stock: 120, reorder: 15 },
      { name: 'Lariago', generic: 'Chloroquine Phosphate', category: 'Antimalarials', manufacturer: 'IPCA', diseases: 'Malaria prophylaxis', form: 'Tablet', strength: '250mg', cartonPrice: 22000, unitsPerCarton: 100, fullPrice: 750, halfPrice: 450, singlePrice: 300, stock: 380, reorder: 40 },

      // Antihypertensives
      { name: 'Amlodipine', generic: 'Amlodipine', category: 'Antihypertensives', manufacturer: 'Pfizer', diseases: 'Hypertension, Angina', form: 'Tablet', strength: '5mg', cartonPrice: 28000, unitsPerCarton: 100, fullPrice: 950, halfPrice: 550, singlePrice: 400, stock: 300, reorder: 30 },
      { name: 'Atenolol', generic: 'Atenolol', category: 'Antihypertensives', manufacturer: 'AstraZeneca', diseases: 'Hypertension, Heart disease', form: 'Tablet', strength: '50mg', cartonPrice: 25000, unitsPerCarton: 100, fullPrice: 850, halfPrice: 500, singlePrice: 350, stock: 280, reorder: 30 },
      { name: 'Enalapril', generic: 'Enalapril', category: 'Antihypertensives', manufacturer: 'Merck', diseases: 'Hypertension, Heart failure', form: 'Tablet', strength: '5mg', cartonPrice: 30000, unitsPerCarton: 100, fullPrice: 1000, halfPrice: 600, singlePrice: 400, stock: 260, reorder: 25 },
      { name: 'Losartan', generic: 'Losartan', category: 'Antihypertensives', manufacturer: 'Merck', diseases: 'Hypertension, Diabetic nephropathy', form: 'Tablet', strength: '50mg', cartonPrice: 35000, unitsPerCarton: 100, fullPrice: 1200, halfPrice: 700, singlePrice: 500, stock: 240, reorder: 25 },
      { name: 'Nifedipine', generic: 'Nifedipine', category: 'Antihypertensives', manufacturer: 'Bayer', diseases: 'Hypertension, Angina', form: 'Tablet', strength: '10mg', cartonPrice: 26000, unitsPerCarton: 100, fullPrice: 900, halfPrice: 550, singlePrice: 380, stock: 270, reorder: 25 },
      { name: 'Hydrochlorothiazide', generic: 'Hydrochlorothiazide', category: 'Antihypertensives', manufacturer: 'Various', diseases: 'Hypertension, Edema', form: 'Tablet', strength: '25mg', cartonPrice: 18000, unitsPerCarton: 100, fullPrice: 600, halfPrice: 350, singlePrice: 250, stock: 320, reorder: 30 },

      // Antidiabetics
      { name: 'Metformin', generic: 'Metformin', category: 'Antidiabetics', manufacturer: 'Bristol-Myers', diseases: 'Type 2 Diabetes', form: 'Tablet', strength: '500mg', cartonPrice: 35000, unitsPerCarton: 100, fullPrice: 1200, halfPrice: 700, singlePrice: 500, stock: 400, reorder: 40 },
      { name: 'Glibenclamide', generic: 'Glibenclamide', category: 'Antidiabetics', manufacturer: 'Sanofi', diseases: 'Type 2 Diabetes', form: 'Tablet', strength: '5mg', cartonPrice: 30000, unitsPerCarton: 100, fullPrice: 1000, halfPrice: 600, singlePrice: 400, stock: 350, reorder: 35 },
      { name: 'Insulin', generic: 'Human Insulin', category: 'Antidiabetics', manufacturer: 'Novo Nordisk', diseases: 'Type 1 & 2 Diabetes', form: 'Injection', strength: '100IU/ml', cartonPrice: 180000, unitsPerCarton: 10, fullPrice: 60000, halfPrice: null, singlePrice: 18500, stock: 80, reorder: 10 },
      { name: 'Gliclazide', generic: 'Gliclazide', category: 'Antidiabetics', manufacturer: 'Servier', diseases: 'Type 2 Diabetes', form: 'Tablet', strength: '80mg', cartonPrice: 38000, unitsPerCarton: 100, fullPrice: 1300, halfPrice: 750, singlePrice: 550, stock: 280, reorder: 30 },
      { name: 'Amaryl', generic: 'Glimepiride', category: 'Antidiabetics', manufacturer: 'Sanofi', diseases: 'Type 2 Diabetes', form: 'Tablet', strength: '2mg', cartonPrice: 42000, unitsPerCarton: 100, fullPrice: 1450, halfPrice: 850, singlePrice: 600, stock: 250, reorder: 25 },

      // Vitamins & Supplements
      { name: 'Vitamin C', generic: 'Ascorbic Acid', category: 'Vitamins & Supplements', manufacturer: 'Various', diseases: 'Immune boost, Scurvy prevention', form: 'Tablet', strength: '500mg', cartonPrice: 15000, unitsPerCarton: 100, fullPrice: 500, halfPrice: 300, singlePrice: 200, stock: 600, reorder: 60 },
      { name: 'Multivitamin', generic: 'Multivitamin Complex', category: 'Vitamins & Supplements', manufacturer: 'Centrum', diseases: 'Nutritional deficiency', form: 'Tablet', strength: 'Various', cartonPrice: 45000, unitsPerCarton: 100, fullPrice: 1500, halfPrice: 900, singlePrice: 600, stock: 400, reorder: 40 },
      { name: 'Vitamin B Complex', generic: 'B Vitamins', category: 'Vitamins & Supplements', manufacturer: 'Various', diseases: 'Energy, Nerve health', form: 'Tablet', strength: 'Various', cartonPrice: 20000, unitsPerCarton: 100, fullPrice: 700, halfPrice: 400, singlePrice: 300, stock: 500, reorder: 50 },
      { name: 'Folic Acid', generic: 'Folic Acid', category: 'Vitamins & Supplements', manufacturer: 'Various', diseases: 'Anemia prevention, Pregnancy', form: 'Tablet', strength: '5mg', cartonPrice: 12000, unitsPerCarton: 100, fullPrice: 400, halfPrice: 250, singlePrice: 150, stock: 550, reorder: 55 },
      { name: 'Calcium', generic: 'Calcium Carbonate', category: 'Vitamins & Supplements', manufacturer: 'Various', diseases: 'Bone health, Osteoporosis', form: 'Tablet', strength: '500mg', cartonPrice: 18000, unitsPerCarton: 100, fullPrice: 600, halfPrice: 350, singlePrice: 250, stock: 450, reorder: 45 },
      { name: 'Iron Tablets', generic: 'Ferrous Sulphate', category: 'Vitamins & Supplements', manufacturer: 'Various', diseases: 'Iron deficiency anemia', form: 'Tablet', strength: '200mg', cartonPrice: 16000, unitsPerCarton: 100, fullPrice: 550, halfPrice: 300, singlePrice: 200, stock: 480, reorder: 50 },
      { name: 'Vitamin D3', generic: 'Cholecalciferol', category: 'Vitamins & Supplements', manufacturer: 'Various', diseases: 'Bone health, Immune support', form: 'Capsule', strength: '1000IU', cartonPrice: 25000, unitsPerCarton: 100, fullPrice: 850, halfPrice: 500, singlePrice: 350, stock: 380, reorder: 40 },
      { name: 'Zinc Tablets', generic: 'Zinc Sulphate', category: 'Vitamins & Supplements', manufacturer: 'Various', diseases: 'Immune support, Wound healing', form: 'Tablet', strength: '20mg', cartonPrice: 14000, unitsPerCarton: 100, fullPrice: 480, halfPrice: 280, singlePrice: 200, stock: 420, reorder: 40 },

      // Cough & Cold
      { name: 'Actifed', generic: 'Triprolidine + Pseudoephedrine', category: 'Cough & Cold', manufacturer: 'GSK', diseases: 'Cold, Flu, Nasal congestion', form: 'Syrup', strength: '120ml', cartonPrice: 35000, unitsPerCarton: 20, fullPrice: 5500, halfPrice: 3000, singlePrice: 1800, stock: 150, reorder: 20 },
      { name: 'Benylin', generic: 'Diphenhydramine + Ammonium Chloride', category: 'Cough & Cold', manufacturer: 'Pfizer', diseases: 'Cough, Cold symptoms', form: 'Syrup', strength: '100ml', cartonPrice: 30000, unitsPerCarton: 20, fullPrice: 4800, halfPrice: 2500, singlePrice: 1500, stock: 180, reorder: 20 },
      { name: 'Strepsils', generic: 'Amylmetacresol + Dichlorobenzyl', category: 'Cough & Cold', manufacturer: 'Reckitt', diseases: 'Sore throat, Mouth infections', form: 'Lozenge', strength: '24s', cartonPrice: 25000, unitsPerCarton: 50, fullPrice: 2000, halfPrice: 1200, singlePrice: 600, stock: 300, reorder: 30 },
      { name: 'Vicks VapoRub', generic: 'Camphor + Menthol + Eucalyptus Oil', category: 'Cough & Cold', manufacturer: 'P&G', diseases: 'Cough, Congestion, Cold', form: 'Ointment', strength: '50g', cartonPrice: 40000, unitsPerCarton: 30, fullPrice: 4500, halfPrice: null, singlePrice: 1400, stock: 200, reorder: 25 },
      { name: 'Sinarest', generic: 'Paracetamol + Chlorpheniramine + Pseudoephedrine', category: 'Cough & Cold', manufacturer: 'Centaur', diseases: 'Cold, Flu, Sinusitis', form: 'Tablet', strength: '500mg', cartonPrice: 22000, unitsPerCarton: 100, fullPrice: 750, halfPrice: 450, singlePrice: 300, stock: 350, reorder: 35 },

      // Gastrointestinal
      { name: 'Omeprazole', generic: 'Omeprazole', category: 'Gastrointestinal', manufacturer: 'AstraZeneca', diseases: 'Ulcers, GERD, Heartburn', form: 'Capsule', strength: '20mg', cartonPrice: 32000, unitsPerCarton: 100, fullPrice: 1100, halfPrice: 650, singlePrice: 450, stock: 320, reorder: 30 },
      { name: 'Ranitidine', generic: 'Ranitidine', category: 'Gastrointestinal', manufacturer: 'GSK', diseases: 'Ulcers, Heartburn, GERD', form: 'Tablet', strength: '150mg', cartonPrice: 25000, unitsPerCarton: 100, fullPrice: 850, halfPrice: 500, singlePrice: 350, stock: 380, reorder: 40 },
      { name: 'Buscopan', generic: 'Hyoscine Butylbromide', category: 'Gastrointestinal', manufacturer: 'Boehringer', diseases: 'Abdominal cramps, IBS', form: 'Tablet', strength: '10mg', cartonPrice: 28000, unitsPerCarton: 100, fullPrice: 950, halfPrice: 550, singlePrice: 400, stock: 280, reorder: 30 },
      { name: 'Loperamide', generic: 'Loperamide', category: 'Gastrointestinal', manufacturer: 'Janssen', diseases: 'Diarrhea', form: 'Capsule', strength: '2mg', cartonPrice: 20000, unitsPerCarton: 100, fullPrice: 700, halfPrice: 400, singlePrice: 300, stock: 350, reorder: 35 },
      { name: 'ORS', generic: 'Oral Rehydration Salts', category: 'Gastrointestinal', manufacturer: 'WHO', diseases: 'Dehydration, Diarrhea', form: 'Sachet', strength: '20.5g', cartonPrice: 8000, unitsPerCarton: 100, fullPrice: 300, halfPrice: 200, singlePrice: 100, stock: 800, reorder: 100 },
      { name: 'Mebendazole', generic: 'Mebendazole', category: 'Gastrointestinal', manufacturer: 'Janssen', diseases: 'Worm infections', form: 'Tablet', strength: '500mg', cartonPrice: 18000, unitsPerCarton: 100, fullPrice: 600, halfPrice: 350, singlePrice: 250, stock: 400, reorder: 40 },
      { name: 'Dulcolax', generic: 'Bisacodyl', category: 'Gastrointestinal', manufacturer: 'Boehringer', diseases: 'Constipation', form: 'Tablet', strength: '5mg', cartonPrice: 22000, unitsPerCarton: 100, fullPrice: 750, halfPrice: 450, singlePrice: 300, stock: 280, reorder: 30 },

      // Antihistamines
      { name: 'Cetrizine', generic: 'Cetirizine', category: 'Antihistamines', manufacturer: 'UCB', diseases: 'Allergies, Hay fever, Urticaria', form: 'Tablet', strength: '10mg', cartonPrice: 20000, unitsPerCarton: 100, fullPrice: 700, halfPrice: 400, singlePrice: 300, stock: 400, reorder: 40 },
      { name: 'Loratadine', generic: 'Loratadine', category: 'Antihistamines', manufacturer: 'Schering', diseases: 'Allergies, Hay fever', form: 'Tablet', strength: '10mg', cartonPrice: 22000, unitsPerCarton: 100, fullPrice: 750, halfPrice: 450, singlePrice: 300, stock: 350, reorder: 35 },
      { name: 'Promethazine', generic: 'Promethazine', category: 'Antihistamines', manufacturer: 'Sanofi', diseases: 'Allergies, Motion sickness, Nausea', form: 'Tablet', strength: '25mg', cartonPrice: 18000, unitsPerCarton: 100, fullPrice: 600, halfPrice: 350, singlePrice: 250, stock: 320, reorder: 30 },
      { name: 'Avil', generic: 'Pheniramine', category: 'Antihistamines', manufacturer: 'Sanofi', diseases: 'Allergies, Itching', form: 'Tablet', strength: '25mg', cartonPrice: 16000, unitsPerCarton: 100, fullPrice: 550, halfPrice: 300, singlePrice: 200, stock: 380, reorder: 40 },

      // Dermatological
      { name: 'Clotrimazole Cream', generic: 'Clotrimazole', category: 'Dermatological', manufacturer: 'Bayer', diseases: 'Fungal skin infections', form: 'Cream', strength: '1% 20g', cartonPrice: 30000, unitsPerCarton: 50, fullPrice: 2200, halfPrice: null, singlePrice: 650, stock: 200, reorder: 25 },
      { name: 'Betnovate', generic: 'Betamethasone', category: 'Dermatological', manufacturer: 'GSK', diseases: 'Eczema, Psoriasis, Dermatitis', form: 'Cream', strength: '0.1% 30g', cartonPrice: 45000, unitsPerCarton: 30, fullPrice: 5000, halfPrice: null, singlePrice: 1600, stock: 150, reorder: 20 },
      { name: 'Acyclovir Cream', generic: 'Acyclovir', category: 'Dermatological', manufacturer: 'GSK', diseases: 'Herpes, Cold sores', form: 'Cream', strength: '5% 5g', cartonPrice: 35000, unitsPerCarton: 40, fullPrice: 3500, halfPrice: null, singlePrice: 950, stock: 180, reorder: 20 },
      { name: 'Gentamicin Cream', generic: 'Gentamicin', category: 'Dermatological', manufacturer: 'Various', diseases: 'Bacterial skin infections', form: 'Cream', strength: '0.1% 15g', cartonPrice: 25000, unitsPerCarton: 50, fullPrice: 1800, halfPrice: null, singlePrice: 550, stock: 220, reorder: 25 },
      { name: 'Hydrocortisone Cream', generic: 'Hydrocortisone', category: 'Dermatological', manufacturer: 'Various', diseases: 'Skin inflammation, Itching', form: 'Cream', strength: '1% 15g', cartonPrice: 20000, unitsPerCarton: 50, fullPrice: 1500, halfPrice: null, singlePrice: 450, stock: 250, reorder: 25 },

      // Additional realistic medicines
      { name: 'Albendazole', generic: 'Albendazole', category: 'Gastrointestinal', manufacturer: 'GSK', diseases: 'Worm infections', form: 'Tablet', strength: '400mg', cartonPrice: 22000, unitsPerCarton: 100, fullPrice: 750, halfPrice: 450, singlePrice: 300, stock: 380, reorder: 40 },
      { name: 'Prednisolone', generic: 'Prednisolone', category: 'Analgesics', manufacturer: 'Pfizer', diseases: 'Inflammation, Allergies, Asthma', form: 'Tablet', strength: '5mg', cartonPrice: 25000, unitsPerCarton: 100, fullPrice: 850, halfPrice: 500, singlePrice: 350, stock: 280, reorder: 30 },
      { name: 'Salbutamol', generic: 'Salbutamol', category: 'Cough & Cold', manufacturer: 'GSK', diseases: 'Asthma, Bronchospasm', form: 'Inhaler', strength: '100mcg', cartonPrice: 60000, unitsPerCarton: 20, fullPrice: 12000, halfPrice: null, singlePrice: 3200, stock: 120, reorder: 15 },
      { name: 'Fluconazole', generic: 'Fluconazole', category: 'Antibiotics', manufacturer: 'Pfizer', diseases: 'Fungal infections, Candidiasis', form: 'Capsule', strength: '150mg', cartonPrice: 40000, unitsPerCarton: 100, fullPrice: 1400, halfPrice: 850, singlePrice: 580, stock: 250, reorder: 25 },
      { name: 'Carbamazepine', generic: 'Carbamazepine', category: 'Analgesics', manufacturer: 'Novartis', diseases: 'Epilepsy, Nerve pain', form: 'Tablet', strength: '200mg', cartonPrice: 35000, unitsPerCarton: 100, fullPrice: 1200, halfPrice: 700, singlePrice: 500, stock: 200, reorder: 20 },
      { name: 'Tramadol', generic: 'Tramadol', category: 'Analgesics', manufacturer: 'Various', diseases: 'Moderate to severe pain', form: 'Capsule', strength: '50mg', cartonPrice: 38000, unitsPerCarton: 100, fullPrice: 1300, halfPrice: 750, singlePrice: 550, stock: 220, reorder: 25 },
      { name: 'Morphine', generic: 'Morphine Sulphate', category: 'Analgesics', manufacturer: 'Various', diseases: 'Severe pain', form: 'Injection', strength: '10mg/ml', cartonPrice: 150000, unitsPerCarton: 20, fullPrice: 25000, halfPrice: null, singlePrice: 7800, stock: 50, reorder: 10 },
      { name: 'Warfarin', generic: 'Warfarin', category: 'Antihypertensives', manufacturer: 'Bristol-Myers', diseases: 'Blood clot prevention', form: 'Tablet', strength: '5mg', cartonPrice: 32000, unitsPerCarton: 100, fullPrice: 1100, halfPrice: 650, singlePrice: 450, stock: 180, reorder: 20 },
      { name: 'Simvastatin', generic: 'Simvastatin', category: 'Antihypertensives', manufacturer: 'Merck', diseases: 'High cholesterol', form: 'Tablet', strength: '20mg', cartonPrice: 40000, unitsPerCarton: 100, fullPrice: 1400, halfPrice: 850, singlePrice: 580, stock: 220, reorder: 25 },
      { name: 'Atorvastatin', generic: 'Atorvastatin', category: 'Antihypertensives', manufacturer: 'Pfizer', diseases: 'High cholesterol', form: 'Tablet', strength: '10mg', cartonPrice: 45000, unitsPerCarton: 100, fullPrice: 1500, halfPrice: 900, singlePrice: 600, stock: 200, reorder: 20 },
      { name: 'Captopril', generic: 'Captopril', category: 'Antihypertensives', manufacturer: 'Bristol-Myers', diseases: 'Hypertension, Heart failure', form: 'Tablet', strength: '25mg', cartonPrice: 22000, unitsPerCarton: 100, fullPrice: 750, halfPrice: 450, singlePrice: 300, stock: 260, reorder: 25 },
      { name: 'Furosemide', generic: 'Furosemide', category: 'Antihypertensives', manufacturer: 'Sanofi', diseases: 'Edema, Hypertension', form: 'Tablet', strength: '40mg', cartonPrice: 18000, unitsPerCarton: 100, fullPrice: 600, halfPrice: 350, singlePrice: 250, stock: 300, reorder: 30 },
      { name: 'Spironolactone', generic: 'Spironolactone', category: 'Antihypertensives', manufacturer: 'Pfizer', diseases: 'Edema, Heart failure', form: 'Tablet', strength: '25mg', cartonPrice: 28000, unitsPerCarton: 100, fullPrice: 950, halfPrice: 550, singlePrice: 400, stock: 240, reorder: 25 },
      { name: 'Digoxin', generic: 'Digoxin', category: 'Antihypertensives', manufacturer: 'GSK', diseases: 'Heart failure, Atrial fibrillation', form: 'Tablet', strength: '0.25mg', cartonPrice: 30000, unitsPerCarton: 100, fullPrice: 1000, halfPrice: 600, singlePrice: 400, stock: 180, reorder: 20 },
      { name: 'Levothyroxine', generic: 'Levothyroxine', category: 'Vitamins & Supplements', manufacturer: 'Merck', diseases: 'Hypothyroidism', form: 'Tablet', strength: '100mcg', cartonPrice: 35000, unitsPerCarton: 100, fullPrice: 1200, halfPrice: 700, singlePrice: 500, stock: 200, reorder: 20 },
      { name: 'Prednisone', generic: 'Prednisone', category: 'Analgesics', manufacturer: 'Pfizer', diseases: 'Inflammation, Allergies, Autoimmune', form: 'Tablet', strength: '5mg', cartonPrice: 24000, unitsPerCarton: 100, fullPrice: 820, halfPrice: 480, singlePrice: 340, stock: 270, reorder: 30 },
      { name: 'Allopurinol', generic: 'Allopurinol', category: 'Analgesics', manufacturer: 'GSK', diseases: 'Gout, High uric acid', form: 'Tablet', strength: '300mg', cartonPrice: 26000, unitsPerCarton: 100, fullPrice: 900, halfPrice: 550, singlePrice: 380, stock: 240, reorder: 25 },
      { name: 'Colchicine', generic: 'Colchicine', category: 'Analgesics', manufacturer: 'Various', diseases: 'Gout attacks', form: 'Tablet', strength: '0.6mg', cartonPrice: 32000, unitsPerCarton: 100, fullPrice: 1100, halfPrice: 650, singlePrice: 450, stock: 180, reorder: 20 },
      { name: 'Ciproflox Eye Drops', generic: 'Ciprofloxacin', category: 'Dermatological', manufacturer: 'Alcon', diseases: 'Eye infections', form: 'Drops', strength: '0.3% 5ml', cartonPrice: 35000, unitsPerCarton: 40, fullPrice: 3500, halfPrice: null, singlePrice: 950, stock: 200, reorder: 25 },
      { name: 'Chloramphenicol Eye Drops', generic: 'Chloramphenicol', category: 'Dermatological', manufacturer: 'Various', diseases: 'Eye infections', form: 'Drops', strength: '0.5% 10ml', cartonPrice: 25000, unitsPerCarton: 50, fullPrice: 2000, halfPrice: null, singlePrice: 550, stock: 250, reorder: 30 },
    ];

    console.log('💊 Inserting medicines...');

    const insertMedicine = db.prepare(`
      INSERT INTO medicines (
        name, generic_name, category_id, manufacturer,
        purchase_price_per_carton, units_per_carton,
        selling_price_full, selling_price_half, selling_price_single,
        quantity_in_stock, reorder_level,
        diseases_treated, dosage_form, strength,
        expiry_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let medicineCount = 0;
    medicines.forEach((med) => {
      const category = categories.find((c) => c.name === med.category);
      if (category) {
        // Random expiry date between 6 months and 3 years from now
        const expiryMonths = Math.floor(Math.random() * 30) + 6;
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + expiryMonths);

        insertMedicine.run(
          med.name,
          med.generic,
          category.id,
          med.manufacturer,
          med.cartonPrice,
          med.unitsPerCarton,
          med.fullPrice,
          med.halfPrice,
          med.singlePrice,
          med.stock,
          med.reorder,
          med.diseases,
          med.form,
          med.strength,
          expiryDate.toISOString().split('T')[0],
          'active'
        );
        medicineCount++;
      }
    });

    console.log(`✅ Inserted ${medicineCount} medicines\n`);

    // Create some demo sales
    console.log('💰 Creating demo sales...');

    const allMedicines = db.prepare('SELECT * FROM medicines WHERE quantity_in_stock > 10').all();

    const insertSale = db.prepare(`
      INSERT INTO sales (
        invoice_number, customer_name, customer_phone,
        total_amount, amount_paid, change_amount,
        payment_method, sale_date, served_by, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertSaleItem = db.prepare(`
      INSERT INTO sale_items (
        sale_id, medicine_id, medicine_name,
        quantity, unit_type, unit_price, total_price, cost_price
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const updateStock = db.prepare(`
      UPDATE medicines SET quantity_in_stock = quantity_in_stock - ? WHERE id = ?
    `);

    const customerNames = [
      'Juma Ally', 'Fatuma Hassan', 'Mohamed Salim', 'Amina Said',
      'Hassan Juma', 'Zaina Mohamed', 'Ali Khamis', 'Mwanaidi Hamad',
      'Salim Abdalla', 'Halima Rashid', 'Hamisi Omar', 'Rehema Seif',
      'Walk-in Customer', 'Rashid Ali', 'Mariam Juma', 'Bakari Hassan'
    ];

    const paymentMethods = ['cash', 'card', 'mobile_money'];

    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const saleDate = new Date();
      saleDate.setDate(saleDate.getDate() - daysAgo);
      saleDate.setHours(Math.floor(Math.random() * 12) + 8); // 8 AM to 8 PM

      const invoiceNumber = `INV-${Date.now() + i}`;
      const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
      const customerPhone = Math.random() > 0.5 ? `+255${Math.floor(Math.random() * 900000000 + 100000000)}` : null;
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

      // Select 1-5 random medicines
      const numItems = Math.floor(Math.random() * 4) + 1;
      let totalAmount = 0;
      const items = [];

      for (let j = 0; j < numItems; j++) {
        const medicine = allMedicines[Math.floor(Math.random() * allMedicines.length)];
        const unitTypes = ['full', 'half', 'single'];
        const unitType = unitTypes[Math.floor(Math.random() * unitTypes.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;

        let unitPrice = medicine.selling_price_full;
        if (unitType === 'half' && medicine.selling_price_half) {
          unitPrice = medicine.selling_price_half;
        } else if (unitType === 'single' && medicine.selling_price_single) {
          unitPrice = medicine.selling_price_single;
        }

        const itemTotal = unitPrice * quantity;
        totalAmount += itemTotal;

        items.push({
          medicine_id: medicine.id,
          medicine_name: medicine.name,
          quantity,
          unit_type: unitType,
          unit_price: unitPrice,
          total_price: itemTotal,
          cost_price: medicine.purchase_price_per_unit || 0
        });
      }

      const amountPaid = totalAmount + Math.floor(Math.random() * 5000);
      const changeAmount = amountPaid - totalAmount;

      const result = insertSale.run(
        invoiceNumber,
        customerName,
        customerPhone,
        totalAmount,
        amountPaid,
        changeAmount,
        paymentMethod,
        saleDate.toISOString(),
        1, // admin user
        'completed'
      );

      const saleId = result.lastInsertRowid;

      items.forEach((item) => {
        insertSaleItem.run(
          saleId,
          item.medicine_id,
          item.medicine_name,
          item.quantity,
          item.unit_type,
          item.unit_price,
          item.total_price,
          item.cost_price
        );

        updateStock.run(item.quantity, item.medicine_id);
      });
    }

    console.log('✅ Created 50 demo sales\n');

    console.log('🎉 Demo data seeding complete!\n');
    console.log('📊 Summary:');
    console.log(`   - ${medicineCount} medicines added`);
    console.log(`   - 50 sales transactions created`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Ready to use!\n`);

    db.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding demo data:', error.message);
    console.error(error);
    process.exit(1);
  }
}

seedDemoData();
