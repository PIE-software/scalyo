const fs = require('fs');

// Read app.html to extract I18N object
const appContent = fs.readFileSync('app.html', 'utf8').split('\n');

// Extract I18N translations (lines 437-1515)
// French: lines 438-810 (skip "  fr:{" on line 437, skip "}," on line 811)
// English: lines 813-1118 (skip "  en:{" on line 812, skip "}," on line 1119)
// Korean: lines 1121-1513 (skip "  kr:{" on line 1120, skip "}" on line 1514)

const frAppLines = appContent.slice(437, 810).join('\n');
const enAppLines = appContent.slice(812, 1118).join('\n');
const krAppLines = appContent.slice(1120, 1513).join('\n');

// Parse using eval (safe since we control the source)
const frAppObj = eval('({' + frAppLines + '})');
const enAppObj = eval('({' + enAppLines + '})');
const krAppObj = eval('({' + krAppLines + '})');

// Read existing JSON files from index.html
const frIndexObj = JSON.parse(fs.readFileSync('refactored/i18n/fr.json', 'utf8'));
const enIndexObj = JSON.parse(fs.readFileSync('refactored/i18n/en.json', 'utf8'));
const krIndexObj = JSON.parse(fs.readFileSync('refactored/i18n/kr.json', 'utf8'));

// Merge: app.html translations take precedence over index.html
const frFinal = { ...frIndexObj, ...frAppObj };
const enFinal = { ...enIndexObj, ...enAppObj };
const krFinal = { ...krIndexObj, ...krAppObj };

// Write merged files
fs.writeFileSync('refactored/i18n/fr.json', JSON.stringify(frFinal, null, 2), 'utf8');
fs.writeFileSync('refactored/i18n/en.json', JSON.stringify(enFinal, null, 2), 'utf8');
fs.writeFileSync('refactored/i18n/kr.json', JSON.stringify(krFinal, null, 2), 'utf8');

console.log('Merged translations:');
console.log('French keys:', Object.keys(frFinal).length);
console.log('English keys:', Object.keys(enFinal).length);
console.log('Korean keys:', Object.keys(krFinal).length);
console.log('\nFiles updated successfully!');
