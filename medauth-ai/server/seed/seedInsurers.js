// MedAuth AI — seed/seedInsurers.js — Atlas-safe seeder

const path = require('path');

// Load .env only in development — on Render vars come from dashboard
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
}

const mongoose = require('mongoose');

// Hardcode Atlas URI as fallback for build step reliability
// Render injects env vars but sometimes seed runs before they propagate
const MONGODB_URI = process.env.MONGODB_URI || 
  'mongodb+srv://db_user:zSJGYWnb15TKsLqo@cluster0.gaxkzvv.mongodb.net/medauth?retryWrites=true&w=majority&appName=Cluster0';

console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI set:', !!process.env.MONGODB_URI);
console.log('Connecting to:', MONGODB_URI.substring(0, 40) + '...');

async function seedData() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
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
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

seedData();

// NOTE: MongoDB Atlas Network Access must have 0.0.0.0/0 
// whitelisted to allow connections from Render's dynamic IPs.
// Go to Atlas → Network Access → Add IP → 0.0.0.0/0
