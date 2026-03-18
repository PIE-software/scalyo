# Scalyo Translation Sources

## Translation Structure

Scalyo has translations in two files:

### 1. app.html - I18N Object (Application Interface)

**Location:** Lines 436-1515 in `app.html`

**Structure:**
```javascript
const I18N = {
  fr: { /* 375+ lines */ },
  en: { /* 308+ lines */ },
  kr: { /* 395+ lines */ }
};
```

**Usage:** `T(key, lang)` function at line 1517

**Content:** All application UI strings - dashboard, portfolio, settings, KPIs, etc.

**Key Examples:**
- `dashboard`, `portfolio`, `kpi`, `wellbeing`, `coach`, `planning`, `tasks`
- `save`, `saved`, `saving`, `cancel`, `close`, `edit`, `delete`
- `loginTitle`, `registerBtn`, `settingsTitle`
- Form labels, error messages, tooltips, etc.

### 2. index.html - Landing Page Translations

**Three separate objects:**

#### Object L (Main Landing) - Lines 1830-2786
```javascript
const L = {
  fr: { /* ~320 keys */ },
  en: { /* ~320 keys */ },
  kr: { /* ~320 keys */ }
};
```

**Content:** Landing page strings
- Navigation, hero section, features
- Statistics, pricing, FAQ
- Call-to-action buttons, proofs

**Key Examples:**
- `title`, `nav_features`, `hero_h1`, `hero_sub`
- `feat1_tag`, `feat1_h2`, `feat1_body`
- `pricing_h2`, `faq_q1`, `faq_a1`

#### Object MODAL_I18N (Modals) - Lines 3427-3454
```javascript
var MODAL_I18N = {
  fr: { /* ~15 keys */ },
  en: { /* ~15 keys */ },
  kr: { /* ~15 keys */ }
};
```

**Content:** Modal dialog strings
- Support modal, Privacy policy, Legal notices
- Contact form labels

**Key Examples:**
- `ms_title`, `ms_desc`, `lbl_name`, `lbl_email`
- `mr_title`, `ml_title`

#### Object T (Feature Modules) - Lines 3538-3641
```javascript
var T = {
  fr: { /* ~70 keys */ },
  en: { /* ~70 keys */ },
  kr: { /* ~70 keys */ }
};
```

**Content:** Feature modules page strings
- 8 modules descriptions
- Module-specific CTAs and labels

**Key Examples:**
- `back`, `trial`, `badge`, `chips_label`
- `c1` through `c8` (module names)
- `m1tag`, `m1h2`, `m1body` (module 1 content)

## Total Translation Keys

### app.html (I18N)
- **French:** ~270 keys
- **English:** ~270 keys
- **Korean:** ~270 keys

### index.html (L + MODAL_I18N + T)
- **French:** ~405 keys (320 + 15 + 70)
- **English:** ~405 keys
- **Korean:** ~405 keys

### Combined Total
- **Per Language:** ~675 keys
- **All Languages:** ~2,025 translation strings

## Extraction Method

To extract these translations into JSON:

### Manual Method
1. Read each language section from source files
2. Convert JavaScript object notation to JSON
3. Handle escaped quotes and special characters
4. Merge translations from both files

### Automated Method
```javascript
// For app.html
const I18N_FR = { /* copy lines 437-811 */ };
const I18N_EN = { /* copy lines 812-1119 */ };
const I18N_KR = { /* copy lines 1120-1514 */ };

// For index.html
const L_FR = { /* copy fr section from L */ };
const MODAL_FR = { /* copy fr section from MODAL_I18N */ };
const T_FR = { /* copy fr section from T */ };

// Merge
const FR_FINAL = { ...I18N_FR, ...L_FR, ...MODAL_FR, ...T_FR };
```

## Current State

Translation objects are embedded in the source HTML files. To use them in a modular setup:

1. Extract to separate JSON files (fr.json, en.json, kr.json)
2. Load via i18n system: `loadTranslations(lang)`
3. Access via helper: `T(key, lang)`

## Recommended Structure

```
refactored/i18n/
├── fr.json          # All French translations (app + landing)
├── en.json          # All English translations
├── kr.json          # All Korean translations
└── index.js         # i18n loader and T() function
```

## Notes

- Some keys exist in both files (e.g., `dashboard`, `portfolio`) - app.html version should take precedence
- Special characters: emojis, HTML entities, escaped quotes
- Format: Keys use snake_case (landing) and camelCase (app)
- Total file sizes: ~40-50KB per language when formatted as JSON
