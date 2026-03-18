/**
 * Automated View Refactoring Script
 * Replaces inline ternary translations with T() function calls
 *
 * Usage: node refactor_views_i18n.js
 */

const fs = require('fs');
const path = require('path');

// Load translation files
const fr = JSON.parse(fs.readFileSync('refactored/i18n/fr.json', 'utf8'));
const en = JSON.parse(fs.readFileSync('refactored/i18n/en.json', 'utf8'));
const kr = JSON.parse(fs.readFileSync('refactored/i18n/kr.json', 'utf8'));

const VIEWS_DIR = 'refactored/views';
const IMPORT_STATEMENT = "import { T } from '../shared/i18n-wrapper.js';\n\n";

// Statistics
const stats = {
  filesProcessed: 0,
  importsAdded: 0,
  replacementsMade: 0,
  unmatchedPatterns: []
};

/**
 * Find a translation key that matches the given text values
 * @param {string} frText - French text
 * @param {string} enText - English text (optional)
 * @param {string} krText - Korean text (optional)
 * @returns {string|null} Matching key or null
 */
function findMatchingKey(frText, enText = null, krText = null) {
  // Clean texts (remove quotes, trim)
  frText = frText?.replace(/['"]/g, '').trim();
  enText = enText?.replace(/['"]/g, '').trim();
  krText = krText?.replace(/['"]/g, '').trim();

  // Try exact match on all three languages
  for (const key in fr) {
    // Skip non-string values
    if (typeof fr[key] !== 'string' || typeof en[key] !== 'string' || typeof kr[key] !== 'string') {
      continue;
    }

    const frMatch = !frText || fr[key] === frText;
    const enMatch = !enText || en[key] === enText;
    const krMatch = !krText || kr[key] === krText;

    if (frMatch && enMatch && krMatch) {
      return key;
    }
  }

  // Try fuzzy match on French only (most reliable)
  if (frText) {
    for (const key in fr) {
      const value = fr[key];
      if (typeof value === 'string' && value.toLowerCase() === frText.toLowerCase()) {
        return key;
      }
    }
  }

  return null;
}

/**
 * Extract text from ternary expression
 * Handles various formats like "text", 'text', or complex expressions
 */
function extractText(expr) {
  expr = expr.trim();

  // Handle quoted strings
  const quotedMatch = expr.match(/^["'](.+?)["']$/);
  if (quotedMatch) {
    return quotedMatch[1];
  }

  // Handle simple text
  if (!expr.includes('?') && !expr.includes(':')) {
    return expr;
  }

  return null;
}

/**
 * Process a single JSX file
 * @param {string} filePath - Path to the JSX file
 */
function processFile(filePath) {
  console.log(`\n📄 Processing: ${path.basename(filePath)}`);

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const fileReport = {
    file: path.basename(filePath),
    replacements: 0,
    unmatched: []
  };

  // Step 1: Add import statement if not present
  if (!content.includes("import { T } from")) {
    // Find the position after the initial comment block
    const lines = content.split('\n');
    let insertIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('const ') ||
          lines[i].trim().startsWith('function ') ||
          lines[i].trim().startsWith('export ')) {
        insertIndex = i;
        break;
      }
    }

    if (insertIndex > 0) {
      lines.splice(insertIndex, 0, IMPORT_STATEMENT);
      content = lines.join('\n');
      stats.importsAdded++;
      modified = true;
      console.log('  ✅ Added import statement');
    }
  } else {
    console.log('  ℹ️  Import already exists');
  }

  // Step 2: Find and replace ternary patterns
  // Pattern: lang==="en" ? "English" : lang==="kr" ? "Korean" : "French"
  const ternaryRegex = /lang\s*===\s*["']en["']\s*\?\s*([^:]+)\s*:\s*lang\s*===\s*["']kr["']\s*\?\s*([^:]+)\s*:\s*([^}]+?)(?=[,\)])/g;

  let match;
  const replacements = [];

  while ((match = ternaryRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const enText = extractText(match[1]);
    const krText = extractText(match[2]);
    const frText = extractText(match[3]);

    // Try to find a matching translation key
    const key = findMatchingKey(frText, enText, krText);

    if (key) {
      replacements.push({
        original: fullMatch,
        replacement: `T('${key}', lang)`,
        key: key
      });
    } else {
      fileReport.unmatched.push({
        pattern: fullMatch.substring(0, 100),
        texts: { fr: frText, en: enText, kr: krText }
      });
    }
  }

  // Apply replacements
  for (const r of replacements) {
    content = content.replace(r.original, r.replacement);
    fileReport.replacements++;
    stats.replacementsMade++;
    modified = true;
  }

  if (fileReport.replacements > 0) {
    console.log(`  ✅ Made ${fileReport.replacements} replacements`);
  }

  if (fileReport.unmatched.length > 0) {
    console.log(`  ⚠️  ${fileReport.unmatched.length} patterns couldn't be matched`);
    stats.unmatchedPatterns.push(fileReport);
  }

  // Save modified file
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('  💾 File saved');
  } else {
    console.log('  ℹ️  No changes made');
  }

  stats.filesProcessed++;
}

/**
 * Process all JSX files in the views directory
 */
function processAllFiles() {
  console.log('🚀 Starting i18n refactoring...\n');
  console.log(`Translation keys loaded: ${Object.keys(fr).length} French, ${Object.keys(en).length} English, ${Object.keys(kr).length} Korean\n`);

  const files = fs.readdirSync(VIEWS_DIR)
    .filter(f => f.endsWith('.jsx'))
    .map(f => path.join(VIEWS_DIR, f));

  for (const file of files) {
    try {
      processFile(file);
    } catch (error) {
      console.error(`❌ Error processing ${path.basename(file)}:`, error.message);
    }
  }

  // Print final report
  console.log('\n' + '═'.repeat(60));
  console.log('📊 REFACTORING SUMMARY');
  console.log('═'.repeat(60));
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Imports added: ${stats.importsAdded}`);
  console.log(`Replacements made: ${stats.replacementsMade}`);
  console.log(`Files with unmatched patterns: ${stats.unmatchedPatterns.length}`);

  if (stats.unmatchedPatterns.length > 0) {
    console.log('\n⚠️  UNMATCHED PATTERNS REPORT:');
    for (const report of stats.unmatchedPatterns) {
      console.log(`\n  ${report.file}: ${report.unmatched.length} unmatched`);
      for (const u of report.unmatched.slice(0, 3)) { // Show first 3
        console.log(`    - ${u.pattern}...`);
        console.log(`      FR: "${u.texts.fr}" | EN: "${u.texts.en}" | KR: "${u.texts.kr}"`);
      }
      if (report.unmatched.length > 3) {
        console.log(`    ... and ${report.unmatched.length - 3} more`);
      }
    }
  }

  console.log('\n✅ Refactoring complete!\n');
}

// Run the script
processAllFiles();
