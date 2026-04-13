const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({ margin: 50 });

// Outputs to both client/samples and test_documents
const p1 = path.join(__dirname, '../client/samples/patient_rahul_cardiology_record.pdf');
const p2 = path.join(__dirname, '../test_documents/patient_rahul_cardiology_record.pdf');

// Pipe its output to two writable streams
const stream1 = fs.createWriteStream(p1);
const stream2 = fs.createWriteStream(p2);
doc.pipe(stream1);
doc.pipe(stream2);

// Header
doc.fontSize(20).text('CARDIOLOGY CONSULTATION REPORT', { align: 'center' });
doc.moveDown();
doc.moveTo(50, 90).lineTo(550, 90).stroke();
doc.moveDown();

// Patient Info
doc.fontSize(12).font('Helvetica-Bold').text('Patient Information:');
doc.font('Helvetica').indent(20)
   .text('Patient Name: Rahul Kumar')
   .text('DOB: 1980-05-12')
   .text('Role: Patient')
   .text('Insurer: UnitedHealthcare (UHC)')
   .text('Date of Service: ' + new Date().toISOString().split('T')[0]);
doc.moveDown();
doc.indent(0);

// Referring Physician
doc.font('Helvetica-Bold').text('Referring Provider:');
doc.font('Helvetica').indent(20)
   .text('Name: Dr. Priya Sharma')
   .text('Specialty: Cardiologist');
doc.indent(0).moveDown();

// Clinical Indication
doc.font('Helvetica-Bold').text('Clinical History & Encounters:');
doc.font('Helvetica').indent(20)
   .text('The patient is a 43-year-old male presenting with escalating chest pain over the past 4 weeks. He describes the pain as pressure-like, radiating to his left arm during exertion. Chest pain documented clearly by multiple care providers.')
   .moveDown()
   .text('Patient underwent a treadmill stress echocardiogram last week. The stress test was abnormal, showing reversible ischemia in the anterior wall.')
   .moveDown()
   .text('Patient has a strong family history of early coronary artery disease.')
doc.indent(0).moveDown();

// Assessment and Plan
doc.font('Helvetica-Bold').text('Assessment and Plan:');
doc.font('Helvetica').indent(20)
   .text('Given the abnormal stress test and documented chest pain, alongside a direct referral from a Cardiologist (Dr. Priya Sharma), the patient is at extremely high risk for an acute coronary event.')
   .moveDown()
   .text('I am requesting Prior Authorization for an urgent Cardiac Catheterization (Procedure Code: 93458) to assess the extent of coronary artery disease and potentially intervene. All conservative management has previously failed.')
doc.indent(0).moveDown();

// Footer / Signature
doc.moveDown(3);
doc.font('Helvetica-Italic').text('Electronically signed by: Priya Sharma, MD, FACC');

// Finalize the PDF
doc.end();

console.log('PDF generated successfully!');
