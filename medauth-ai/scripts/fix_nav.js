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

  // STEP A: Add nav.js
  if (!content.includes('/client/assets/nav.js')) {
    content = content.replace(
      '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>',
      '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>\n  <script src="/client/assets/nav.js"></script>'
    );
  }

  // STEP B: Delete navigateTo
  const targetNav = `    function navigateTo(page) {
      const base = window.location.origin;
      const url = base + '/client/pages/' + page;
      if (typeof gsap !== 'undefined') {
        gsap.to('body', {
          opacity: 0, y: -20, duration: 0.3, ease: 'power2.in',
          onComplete: () => { window.location.href = url; }
        });
      } else {
        window.location.href = url;
      }
    }`;
  content = content.replace(targetNav, '');

  const targetNavWindow = `    window.navigateTo = (url) => {
      gsap.to('body', {opacity: 0, y: -20, duration: 0.3, ease: 'power2.in', onComplete: () => {
        window.location.href = url;
      }});
    };`;
  content = content.replace(targetNavWindow, '');

  // STEP C: Delete page-in animation block
  const targetAnim1 = `        if (typeof gsap !== 'undefined') {
          window.addEventListener('pageshow', (e) => { if (e.persisted) gsap.set('body', {opacity: 1, y: 0, scale: 1}); });
          gsap.fromTo('body', {opacity: 0, y: 20}, {opacity: 1, y: 0, duration: 0.5, ease: 'power2.out'});
        }`;
  content = content.replace(targetAnim1, '');

  const targetAnim2 = `        if (typeof gsap !== 'undefined') {
          window.addEventListener('pageshow', (e) => { if (e.persisted) gsap.set('body', {opacity: 1, y: 0, scale: 1}); });
          gsap.fromTo('body', {opacity: 0, scale: 0.98}, {opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out'});
        }`;
  content = content.replace(targetAnim2, '');

  const targetAnim3 = `        window.addEventListener('pageshow', (e) => { if (e.persisted) gsap.set('body', {opacity: 1, y: 0, scale: 1}); });
        gsap.fromTo('body', {opacity: 0, y: 20}, {opacity: 1, y: 0, duration: 0.5, ease: 'power2.out'});`;
  content = content.replace(targetAnim3, '');
  
  const targetAnim4 = `        window.addEventListener('pageshow', (e) => { if (e.persisted) gsap.set('body', {opacity: 1, y: 0, scale: 1}); });
        gsap.fromTo('body', {opacity: 0, scale: 0.98}, {opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out'});`;
  content = content.replace(targetAnim4, '');

  // FIX 4: Replace API_BASE
  content = content.replace(/const API_BASE = window(?:[^;]+);/g, 'var API_BASE = window.location.origin;');

  // FIX 5: Processing SSE
  if (file === 'processing.html') {
    content = content.replace(/const source = new EventSource\([^)]*\);/, 'const source = new EventSource(API_BASE + \'/api/cases/\' + caseId + \'/stream\');');
  }

  // STEP D: Make sure all navigateTo patterns don't have paths
  content = content.replace(/navigateTo\(['"`](?:.*?\/)?([\w-]+\.html)['"`]\)/g, 'navigateTo(\'$1\')');
  content = content.replace(/window\.navigateTo\(/g, 'navigateTo(');
  content = content.replace(/window\.location\.href\s*=\s*['"`](?:.*?\/)?([\w-]+\.html)['"`]/g, 'navigateTo(\'$1\')');

  fs.writeFileSync(filePath, content);
  console.log('Fixed:', file);
});
