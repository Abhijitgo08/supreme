const fs = require('fs');
const path = require('path');

const files = [
  'landing.html', 'select-user.html', 'patient-portal.html', 
  'doctor-portal.html', 'admin-portal.html', 'upload.html', 
  'processing.html', 'result.html', 'dashboard.html'
];

files.forEach(file => {
  const filePath = path.join(__dirname, '../client/pages', file);
  let lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);

  let newLines = [];
  let inNavBlock = false;
  let inGsapBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Delete window.navigateTo or function navigateTo blocks (they are roughly 8-11 lines)
    if (line.includes('window.navigateTo =') || line.includes('function navigateTo(page)')) {
      inNavBlock = true;
      continue;
    }
    
    // Assuming the block ends at the line that just has `    }` or `    };`
    if (inNavBlock) {
      if (line.match(/^\s*\};?\s*$/)) {
        inNavBlock = false;
      }
      continue;
    }

    // Delete the GSAP pageshow blocks
    if (line.includes('if (typeof gsap !==') || (line.includes('window.addEventListener(\'pageshow\'') && !inGsapBlock)) {
      inGsapBlock = true;
      if (!line.includes('if (typeof gsap')) {
         // This is a 2 line block: pageshow + fromTo
         const nextLine = lines[i+1] || "";
         if (nextLine.includes('gsap.fromTo')) {
            i++; // skip next line too
         }
         inGsapBlock = false;
         continue;
      }
      continue;
    }

    if (inGsapBlock) {
      if (line.match(/^\s*\}\s*$/)) {
        inGsapBlock = false;
      }
      continue;
    }

    // If API_BASE is declared here with hardcoded or old logic
    if (line.includes('const API_BASE = ')) {
       newLines.push(line.replace(/const API_BASE = .*;/, 'var API_BASE = window.location.origin;'));
       continue;
    }

    // Replace the SSE URL
    if (line.includes('new EventSource(') && line.includes('stream')) {
       newLines.push("        const source = new EventSource(API_BASE + '/api/cases/' + caseId + '/stream');");
       continue;
    }

    // Catch the trailing navigateTo logic
    let modified = line;
    modified = modified.replace(/navigateTo\(['"`](?:.*?\/)?([\w-]+\.html)['"`]\)/g, "navigateTo('$1')");
    modified = modified.replace(/window\.navigateTo\(/g, "navigateTo(");
    modified = modified.replace(/window\.location\.href\s*=\s*['"`](?:.*?\/)?([\w-]+\.html)['"`]/g, "navigateTo('$1')");
    
    // Add nav.js correctly if not present
    if (modified.includes('<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>')) {
       newLines.push(modified);
       // check if nav.js is already in the file lines
       const hasNav = lines.some(l => l.includes('/client/assets/nav.js'));
       if (!hasNav) {
          newLines.push('  <script src="/client/assets/nav.js"></script>');
       }
       continue;
    }

    // remove duplicated nav.js
    if (modified.includes('<script src="/client/assets/nav.js"></script>')) {
       // if we already pushed it, skip
       if (newLines.some(l => l.includes('/client/assets/nav.js'))) {
          continue;
       }
    }

    newLines.push(modified);
  }

  fs.writeFileSync(filePath, newLines.join('\n'));
  console.log('Cleaned:', file);
});
