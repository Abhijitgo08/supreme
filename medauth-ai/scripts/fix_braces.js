const fs = require('fs');
const path = require('path');

const files = [
  'landing.html', 'select-user.html', 'patient-portal.html', 
  'doctor-portal.html', 'admin-portal.html', 'upload.html', 
  'processing.html', 'result.html', 'dashboard.html'
];

files.forEach(file => {
  const filePath = path.join(__dirname, '../client/pages', file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Strip the stray brace (with or without semicolon or extra parentheses) that is above the fetch
  content = content.replace(/[\s\}|);]+\s+fetch\('\.\.\/components\/navbar\.html'\)/, '\n\n    fetch(\'../components/navbar.html\')');
  
  fs.writeFileSync(filePath, content);
  console.log('Fixed stray brace in:', file);
});
