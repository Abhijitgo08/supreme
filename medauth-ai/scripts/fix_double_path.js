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

  // Regex to match any variant of window.location.href/replace or navigateTo calls with arbitrary prefixes
  
  // Handing navigateTo(...) calls
  content = content.replace(/navigateTo\(\s*['"`](?:.*?\/)?([\w-]+\.html)['"`]\s*\)/g, 'navigateTo(\'$1\')');
  
  // Handling window.location.href = ... assignments
  content = content.replace(/window\.location\.href\s*=\s*['"`](?:.*?\/)?([\w-]+\.html)['"`]/g, 'navigateTo(\'$1\')');

  // Handling window.location.replace(...) calls
  content = content.replace(/window\.location\.replace\(\s*['"`](?:.*?\/)?([\w-]+\.html)['"`]\s*\)/g, 'navigateTo(\'$1\')');

  // Double check strict matches requested by user
  const strictReplacements = [
    '/client/pages/',
    'client/pages/',
    './pages/',
    'pages/',
    './',
    '/'
  ];
  
  strictReplacements.forEach(prefix => {
     ['landing.html', 'select-user.html', 'upload.html', 'processing.html', 'result.html', 'dashboard.html', 'patient-portal.html', 'doctor-portal.html', 'admin-portal.html'].forEach(page => {
         // Manual replacement just in case regex failed
         content = content.split(`navigateTo('${prefix}${page}')`).join(`navigateTo('${page}')`);
         content = content.split(`navigateTo("${prefix}${page}")`).join(`navigateTo('${page}')`);
         content = content.split(`navigateTo(\`${prefix}${page}\`)`).join(`navigateTo('${page}')`);
     });
  });

  fs.writeFileSync(filePath, content);
  console.log('Fixed paths:', file);
});
