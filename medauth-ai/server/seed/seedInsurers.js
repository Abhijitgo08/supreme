// MedAuth AI - seed/seedInsurers.js - Seed database with insurers and patients
const path = require('path');
require('dotenv').config({ 
  path: path.join(__dirname, '../.env') 
});
const mongoose = require('mongoose');
const Insurer = require('../models/Insurer');
const Patient = require('../models/Patient');

const insurersData = [
  {
    name: 'UnitedHealthcare',
    code: 'UHC',
    logo: 'uhc-logo.png', // Not used strictly but requested
    color: '#3b82f6', // blue
    rules: [
      { procedureCode: '70553', procedureName: 'MRI Brain with contrast', covered: true, requiresPriorAuth: true, policySection: '4.1', criteria: ['Neurological symptoms documented', 'Symptom duration > 6 weeks', 'Failed conservative treatment'] },
      { procedureCode: '27447', procedureName: 'Total Knee Replacement', covered: true, requiresPriorAuth: true, policySection: '4.2.1', criteria: ['X-ray confirming severe OA', 'BMI documented', '6 weeks physical therapy failed', 'Pain scale 7+'] },
      { procedureCode: 'J0135', procedureName: 'Adalimumab (Humira) injection', covered: true, requiresPriorAuth: true, policySection: '6.3', stepTherapyRequired: true, criteria: ['2 conventional DMARDs failed', 'Rheumatologist documented', 'TB test negative'] },
      { procedureCode: '93458', procedureName: 'Cardiac Catheterization', covered: true, requiresPriorAuth: true, policySection: '5.1', criteria: ['Stress test abnormal', 'Chest pain documented', 'Cardiologist referral'] },
      { procedureCode: '43239', procedureName: 'Upper GI Endoscopy', covered: true, requiresPriorAuth: true, policySection: '8.2', criteria: ['Persistent GERD > 8 weeks', 'Failed PPI therapy', 'Dysphagia present'] }
    ]
  },
  {
    name: 'Aetna',
    code: 'AETNA',
    logo: 'aetna-logo.png',
    color: '#7c6fcd', // purple
    rules: [
      { procedureCode: '70553', procedureName: 'MRI Brain with contrast', covered: true, requiresPriorAuth: false, policySection: '3.1', criteria: ['Physician order present', 'Clinical indication documented'] },
      { procedureCode: '33533', procedureName: 'Coronary Artery Bypass', covered: true, requiresPriorAuth: true, policySection: '5.4', criteria: ['3-vessel disease confirmed', 'Cardiologist recommendation', 'Failed medical management'] },
      { procedureCode: '43770', procedureName: 'Laparoscopic Gastric Banding', covered: true, requiresPriorAuth: true, policySection: '9.1', criteria: ['BMI >= 40 OR BMI >= 35 with comorbidity', '6-month supervised diet documented', 'Psych evaluation cleared', 'Surgeon board certified'] },
      { procedureCode: '90837', procedureName: 'Psychotherapy 60 min', covered: true, requiresPriorAuth: false, policySection: '10.1', criteria: ['Diagnosis code present', 'Treatment plan on file'] }
    ]
  },
  {
    name: 'Cigna',
    code: 'CIGNA',
    logo: 'cigna-logo.png',
    color: '#2dd4bf', // teal
    rules: [
      { procedureCode: '27447', procedureName: 'Total Knee Replacement', covered: true, requiresPriorAuth: true, policySection: '4.5', criteria: ['Conservative treatment failed min 3 months', 'Functional limitation documented', 'Orthopedic surgeon recommendation'] },
      { procedureCode: '95810', procedureName: 'Polysomnography (Sleep Study)', covered: true, requiresPriorAuth: false, policySection: '11.1', criteria: ['Sleep disorder symptoms documented'] },
      { procedureCode: 'G0297', procedureName: 'Low-dose CT Lung Screening', covered: true, requiresPriorAuth: true, policySection: '12.3', criteria: ['Age 50-80', '20+ pack-year smoking history', 'Current smoker or quit < 15 years'] },
      { procedureCode: '77520', procedureName: 'Proton Beam Therapy', covered: true, requiresPriorAuth: true, policySection: '14.1', criteria: ['Solid tumor diagnosis', 'Standard radiation contraindicated', 'Tumor board reviewed'] }
    ]
  }
];

const seedData = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('ERROR: MONGODB_URI environment variable not set');
      process.exit(1);
    }
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas successfully');

    const seededInsurers = {};

    // Upsert Insurers
    for (const insurer of insurersData) {
      const updated = await Insurer.findOneAndUpdate(
        { code: insurer.code },
        insurer,
        { upsert: true, new: true }
      );
      seededInsurers[insurer.code] = updated._id;
      console.log(`Upserted insurer: ${insurer.name}`);
    }

    // Patients Data
    const patientsData = [
      { name: 'Rahul Kumar', role: 'patient', insurerId: seededInsurers['UHC'], avatar: 'RK', dateOfBirth: '1980-05-12' },
      { name: 'Dr. Priya Sharma', role: 'doctor', insurerId: seededInsurers['AETNA'], avatar: 'PS', dateOfBirth: '1975-11-20' },
      { name: 'James Thornton', role: 'patient', insurerId: seededInsurers['CIGNA'], avatar: 'JT', dateOfBirth: '1962-08-30' },
      { name: 'Dr. Maria Lopez', role: 'doctor', insurerId: seededInsurers['UHC'], avatar: 'ML', dateOfBirth: '1982-03-15' },
      { name: 'Admin User', role: 'admin', insurerId: seededInsurers['UHC'], avatar: 'AU', dateOfBirth: '1990-01-01' }
      // The prompt says admin is "insurer: ALL" but our schema only supports a single insurerId reference. I'll just map it to UHC for seeding, or we can leave it null.
      // Wait, "role: admin, insurer: ALL". Better omit insurerId for Admin if it's meant to see all.
    ];
    
    // Correcting Admin
    patientsData[4].insurerId = null;

    // Upsert Patients
    const savedPatients = {};
    for (const patient of patientsData) {
      const saved = await Patient.findOneAndUpdate(
        { name: patient.name },
        patient,
        { upsert: true, new: true }
      );
      savedPatients[patient.name] = saved;
      console.log(`Upserted patient: ${patient.name}`);
    }

    // Assign Doctor-Patient relations explicitly
    if (savedPatients['Rahul Kumar'] && savedPatients['Dr. Priya Sharma']) {
       const rahul = savedPatients['Rahul Kumar'];
       const priya = savedPatients['Dr. Priya Sharma'];
       rahul.doctorId = priya._id;
       priya.patientIds = [rahul._id];
       await rahul.save();
       await priya.save();
       console.log('Linked Rahul Kumar to Dr. Priya Sharma');
    }
    
    if (savedPatients['James Thornton'] && savedPatients['Dr. Maria Lopez']) {
       const james = savedPatients['James Thornton'];
       const maria = savedPatients['Dr. Maria Lopez'];
       james.doctorId = maria._id;
       maria.patientIds = [james._id];
       await james.save();
       await maria.save();
       console.log('Linked James Thornton to Dr. Maria Lopez');
    }

    console.log('Seeding complete');
    await mongoose.disconnect();
    process.exit(0);

  } catch (err) {
    console.error('Seeding error:', err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedData();
