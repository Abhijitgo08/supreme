const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../test_documents');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function createCardiologyPDF() {
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(fs.createWriteStream(path.join(outDir, 'patient_rahul_cardiology_record.pdf')));

  // Header
  doc.font('Helvetica-Bold').fontSize(20).text('MEMORIAL CARDIAC INSTITUTE', { align: 'center' });
  doc.fontSize(12).text('100 Medical Plaza, Suite 400 | New York, NY 10001', { align: 'center' });
  doc.text('Phone: (555) 123-4567 | Fax: (555) 123-4568', { align: 'center' });
  doc.moveDown(2);

  // Patient Info Frame
  doc.rect(50, 130, 500, 70).stroke();
  doc.font('Helvetica-Bold').fontSize(11).text('PATIENT INFORMATION', 60, 140);
  doc.font('Helvetica').fontSize(10);
  doc.text('Name: Rahul Kumar', 60, 155);
  doc.text('DOB: 12/04/1975', 60, 170);
  doc.text('Gender: Male', 60, 185);

  doc.text('MRN: 883920-C', 300, 155);
  doc.text('Insurance ID: INS-2024-8742', 300, 170);
  doc.text('Date of Encounter: Oct 10, 2026', 300, 185);

  doc.moveDown(4);

  // Clinical Rationale
  doc.font('Helvetica-Bold').fontSize(12).text('ATTENDING PHYSICIAN:', 50, 230);
  doc.font('Helvetica').text('Dr. Priya Sharma, MD, FACC (Cardiology)', 200, 230);
  doc.moveDown(2);

  doc.font('Helvetica-Bold').text('CLINICAL PRESENTATION & RATIONALE:', 50);
  doc.moveDown(0.5);
  doc.font('Helvetica').text(
    'Patient presents with worsening typical exertional angina (Class III CCS) over the past 3 weeks. Symptoms are no longer responsive to maximum tolerated medical therapy including Beta-blockers, Nitrates, and Calcium Channel Blockers.\n\n' +
    'Recent stress echocardiogram (dated 10/10/2026) revealed reversible ischemia in the anteroseptal territory. The patient has a known history of hypertension (controlled) and hyperlipidemia. Due to the high risk of impending myocardial infarction and failure of conservative management, an urgent cardiac catheterization space is highly recommended.',
    { align: 'justify', width: 500 }
  );

  doc.moveDown(2);
  doc.font('Helvetica-Bold').text('REQUESTED PROCEDURES & DIAGNOSIS:');
  doc.moveDown(0.5);
  
  // Table-like structure
  doc.font('Helvetica-Bold').text('Procedure:', 50);
  doc.font('Helvetica').text('Left Heart Catheterization (Coronary Angiography)', 180, doc.y - 12);
  
  doc.font('Helvetica-Bold').text('CPT Code:', 50);
  doc.font('Helvetica').text('93452', 180, doc.y - 12);
  
  doc.font('Helvetica-Bold').text('Primary Diagnosis:', 50);
  doc.font('Helvetica').text('Angina pectoris, unspecified', 180, doc.y - 12);
  
  doc.font('Helvetica-Bold').text('ICD-10 Code:', 50);
  doc.font('Helvetica').text('I20.9', 180, doc.y - 12);

  doc.moveDown(3);
  doc.font('Helvetica-Oblique').text('Electronically signed by Priya Sharma, MD on 10/11/2026 09:42 AMEST');

  doc.end();
}

function createOrthopedicsPDF() {
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(fs.createWriteStream(path.join(outDir, 'patient_sarah_ortho_records.pdf')));

  // Page 1: Consult
  doc.font('Times-Bold').fontSize(22).text('VALLEY ORTHOPEDIC CENTER', { align: 'center' });
  doc.font('Times-Roman').fontSize(11).text('Excellence in Joint Reconstruction', { align: 'center' });
  doc.moveDown(2);

  doc.font('Times-Bold').fontSize(14).text('CLINICAL CONSULTATION NOTE', { underline: true });
  doc.moveDown();

  doc.font('Times-Bold').fontSize(11).text('Patient: ', { continued: true }).font('Times-Roman').text('Sarah Jenkins        ', { continued: true });
  doc.font('Times-Bold').text('DOB: ', { continued: true }).font('Times-Roman').text('08/22/1960        ', { continued: true });
  doc.font('Times-Bold').text('MRN: ', { continued: true }).font('Times-Roman').text('99402-B');
  doc.moveDown();

  doc.font('Times-Bold').text('Date of Visit: ', { continued: true }).font('Times-Roman').text('03/15/2026');
  doc.font('Times-Bold').text('Provider: ', { continued: true }).font('Times-Roman').text('Dr. Marcus Thorne, MD, FAAOS');
  doc.moveDown(1.5);

  doc.font('Times-Bold').text('CHIEF COMPLAINT:');
  doc.font('Times-Roman').text('Severe, unrelenting right knee pain limiting daily function.');
  doc.moveDown();

  doc.font('Times-Bold').text('HISTORY OF PRESENT ILLNESS:');
  doc.font('Times-Roman').text('The patient is a 65-year-old female presenting with a 5-year history of progressive right knee pain. She describes it as a deep ache that worsens with weight-bearing and limits her walking capacity to less than 1 block. Clicking, grinding (crepitus), and occasional buckling are frequently noted.', { align: 'justify' });
  doc.moveDown();

  doc.font('Times-Bold').text('CONSERVATIVE MANAGEMENT (FAILED):');
  doc.font('Times-Roman').list([
    'NSAIDs (Meloxicam) and Tylenol daily with minimal relief.',
    'Two distinct 6-week courses of Physical Therapy (last ended 01/2026) without mobility improvement.',
    'Intra-articular Corticosteroid injections x 3 (most recent Dec 2025). Relief strictly limited to <2 weeks.',
    'Hyaluronic acid injection series completed without sustained benefit.'
  ]);
  doc.moveDown();

  doc.font('Times-Bold').text('PHYSICAL EXAMINATION & DIAGNOSIS:');
  doc.font('Times-Roman').text('Right Knee: Apparent varus deformity. Joint effusion present. Palpation reveals severe medial joint line tenderness. ROM limited (5 to 105 degrees). Extreme crepitus throughout the arc of motion.', { align: 'justify' });
  doc.moveDown(0.5);
  doc.font('Times-Bold').text('Diagnosis: ', { continued: true }).font('Times-Roman').text('Primary osteoarthritis of right knee (ICD-10: M17.11)');
  doc.moveDown();

  doc.font('Times-Bold').text('PLAN:');
  doc.font('Times-Roman').text('Radiographs confirm end-stage tri-compartmental osteoarthritis (bone-on-bone). Conservative management has completely failed. I am strongly recommending a Right Total Knee Arthroplasty (TKA). The patient wishes to proceed with surgery.');
  doc.moveDown();
  
  doc.font('Times-Bold').text('REQUESTED PROCEDURE: ', { continued: true }).font('Times-Roman').text('Total Knee Arthroplasty (Right)');
  doc.font('Times-Bold').text('CPT CODE: ', { continued: true }).font('Times-Roman').text('27447');

  // Page 2: MRI Report
  doc.addPage();
  doc.font('Helvetica-Bold').fontSize(16).text('RADIOLOGY REPORT - MRI RIGHT KNEE', { align: 'center', underline: true });
  doc.moveDown(2);
  
  doc.font('Helvetica-Bold').fontSize(10).text('Date of Exam: ', { continued: true }).font('Helvetica').text('02/28/2026');
  doc.font('Helvetica-Bold').text('Referring Physician: ', { continued: true }).font('Helvetica').text('Dr. Thomas Aris, PCP');
  doc.moveDown(1.5);

  doc.font('Helvetica-Bold').text('INDICATION:');
  doc.font('Helvetica').text('Chronic right knee pain, evaluate for structural damage.');
  doc.moveDown();

  doc.font('Helvetica-Bold').text('FINDINGS:');
  doc.font('Helvetica').list([
    'Medial Compartment: Complete full-thickness cartilage loss with subchondral cystic changes and reactive bone marrow edema. Bone-on-bone articulation is visualized. Severe medial meniscal maceration.',
    'Patellofemoral Compartment: High-grade chondral wear predominantly involving the medial and central facets of the patella.',
    'Lateral Compartment: Moderate chondral thinning but preserved joint space.',
    'Ligaments: Cruciate and collateral ligaments are intact.'
  ]);
  doc.moveDown();

  doc.font('Helvetica-Bold').text('IMPRESSION:');
  doc.font('Helvetica').text('End-stage osteoarthritis heavily involving the medial and patellofemoral compartments with significant subchondral reactive changes and joint effusion.', { align: 'justify' });

  doc.end();
}

createCardiologyPDF();
createOrthopedicsPDF();
console.log('Successfully generated authentic PDF medical records in medauth-ai/test_documents/');
