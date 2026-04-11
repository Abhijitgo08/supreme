// MedAuth AI - routes/upload.js - POST /api/upload (multer/pdf-parse)
const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

router.post('/', upload.array('documents', 5), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded' });
  }

  let fullExtractedText = '';
  const filenames = [];

  for (const file of req.files) {
    const memFilename = `memory_${Date.now()}_${file.originalname}`;
    filenames.push(memFilename);
    try {
      const dataBuffer = file.buffer;
      if (file.originalname.toLowerCase().endsWith('.txt')) {
        fullExtractedText += `\n--- Document: ${file.originalname} ---\n${dataBuffer.toString('utf8')}`;
      } else {
        const pdfData = await pdfParse(dataBuffer);
        fullExtractedText += `\n--- Document: ${file.originalname} ---\n${pdfData.text}`;
      }
    } catch (err) {
      console.error(`Failed to parse file ${file.originalname}:`, err.message);
      fullExtractedText += `\n--- Document: ${file.originalname} ---\n[Text Extraction Failed/Unsupported File]`;
    }
  }

  const uploadId = `upload_${Date.now()}`;

  res.json({
    success: true,
    uploadId,
    extractedText: fullExtractedText,
    fileCount: req.files.length,
    filenames
  });
});

module.exports = router;
