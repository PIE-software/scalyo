/**
 * Check for duplicate keys in translation JSON files
 * Usage: node check_duplicate_keys.js
 */

const fs = require('fs');

function checkDuplicates(filePath) {
  console.log(`\n📄 Checking: ${filePath}`);

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const keys = [];
  const duplicates = [];
  const keyLines = {};

  let lineNumber = 0;
  for (const line of lines) {
    lineNumber++;
    // Match JSON key pattern: "key":
    const match = line.match(/^\s*"([^"]+)"\s*:/);
    if (match) {
      const key = match[1];

      if (keys.includes(key)) {
        duplicates.push({
          key: key,
          firstLine: keyLines[key],
          duplicateLine: lineNumber
        });
      } else {
        keys.push(key);
        keyLines[key] = lineNumber;
      }
    }
  }

  console.log(`  Total keys: ${keys.length}`);

  if (duplicates.length > 0) {
    console.log(`  ❌ Found ${duplicates.length} duplicate keys:`);
    for (const dup of duplicates) {
      console.log(`     - "${dup.key}"`);
      console.log(`       First occurrence: line ${dup.firstLine}`);
      console.log(`       Duplicate: line ${dup.duplicateLine}`);
    }
    return duplicates;
  } else {
    console.log(`  ✅ No duplicates found`);
    return [];
  }
}

console.log('🔍 Checking for duplicate keys in translation files...');

const frDuplicates = checkDuplicates('refactored/i18n/fr.json');
const enDuplicates = checkDuplicates('refactored/i18n/en.json');
const krDuplicates = checkDuplicates('refactored/i18n/kr.json');

const totalDuplicates = frDuplicates.length + enDuplicates.length + krDuplicates.length;

console.log('\n' + '═'.repeat(60));
console.log('📊 SUMMARY');
console.log('═'.repeat(60));
console.log(`French duplicates: ${frDuplicates.length}`);
console.log(`English duplicates: ${enDuplicates.length}`);
console.log(`Korean duplicates: ${krDuplicates.length}`);
console.log(`Total duplicates: ${totalDuplicates}`);

if (totalDuplicates === 0) {
  console.log('\n✅ All translation files are clean - no duplicate keys!');
} else {
  console.log('\n⚠️  Please remove duplicate keys to avoid unexpected behavior.');
  console.log('Note: In JSON, duplicate keys cause the last value to overwrite previous ones.');
}
