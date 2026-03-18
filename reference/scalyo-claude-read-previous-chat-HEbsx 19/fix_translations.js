const fs = require('fs');

// Read index.html
const content = fs.readFileSync('index.html', 'utf8').split('\n');

// Extract French (lines 1832-2151, skip "fr: {" line)
const frLines = content.slice(1831, 2151).join('\n');

// Extract English (lines 2155-2464, skip "en: {" line)
const enLines = content.slice(2154, 2464).join('\n');

// Extract Korean (lines 2468-2784, skip "kr: {" line)
const krLines = content.slice(2467, 2784).join('\n');

// Parse each one using eval (safe here as we control the source)
const frObj = eval('({' + frLines + '})');
const enObj = eval('({' + enLines + '})');
const krObj = eval('({' + krLines + '})');

// Write to files
fs.writeFileSync('refactored/i18n/fr.json', JSON.stringify(frObj, null, 2), 'utf8');
fs.writeFileSync('refactored/i18n/en.json', JSON.stringify(enObj, null, 2), 'utf8');
fs.writeFileSync('refactored/i18n/kr.json', JSON.stringify(krObj, null, 2), 'utf8');

console.log('French keys:', Object.keys(frObj).length);
console.log('English keys:', Object.keys(enObj).length);
console.log('Korean keys:', Object.keys(krObj).length);
console.log('\nFiles created successfully!');
