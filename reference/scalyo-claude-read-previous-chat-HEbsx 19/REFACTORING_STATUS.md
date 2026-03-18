# Scalyo Refactoring Status

## Overview
This document tracks the refactoring progress of the Scalyo landing page from monolithic HTML files to a modular structure.

## Files to Refactor
- `index.html` (3,707 lines) - Landing page
- `app.html` (15,005 lines) - Main application

## Progress Summary

### ✅ Completed Tasks

#### 1. Shared Utilities (Previously Completed)
- ✅ `refactored/shared/i18n.js` - i18n system with translation loading
- ✅ `refactored/shared/persistence.js` - Supabase persistence layer
- ✅ `refactored/shared/theme.js` - Theme management (dark/light)
- ✅ `refactored/shared/utils.js` - Utility functions (formatting, parsing, etc.)

#### 2. Translation Extraction (Just Completed)
- ✅ `refactored/i18n/fr.json` (473 keys) - French translations
- ✅ `refactored/i18n/en.json` (472 keys) - English translations
- ✅ `refactored/i18n/kr.json` (470 keys) - Korean translations
- ✅ `extract_translations.py` - Automated extraction script

**Consolidation:** Successfully merged 3 JavaScript translation objects (L, MODAL_I18N, T) into clean JSON files.

### 🔄 In Progress

#### 3. JavaScript Functions Extraction
**Location:** `index.html` lines 2790-3660

**Functions Identified:**
- **DOM Utilities** (lines 2795-2800):
  - `_el(id)` - getElementById wrapper
  - `_qs(sel)` - querySelector wrapper
  - `_qsa(sel)` - querySelectorAll wrapper
  - `_set(id, html)` - Set innerHTML
  - `_setText(id, txt)` - Set textContent
  - `_qsSet(sel, html)` - Set query selector innerHTML

- **Language/i18n** (lines 2793, 2802-2960, 2963-3288, 3456-3475, 3650-3659):
  - `t(k)` - Translation helper
  - `applyLang()` - Apply main page translations
  - `applyDemoLang(l)` - Apply demo section translations
  - `applyModalLang(lang)` - Apply modal translations
  - `applyModuleLang(l)` - Apply feature module translations
  - `setLang(l)` - Change language

- **Modal Management** (lines 3304-3313):
  - `openSupport()` - Open support modal
  - `openRGPD()` - Open GDPR modal
  - `openLegal()` - Open legal modal
  - `closeAllModals()` - Close all modals
  - `submitContact()` - Handle contact form

- **UI Interactions** (lines 3477-3489):
  - `toggleFaq(btn)` - FAQ accordion toggle
  - `calcROI()` - ROI calculator (lines 3490-3510)
  - `closeMobile()` - Close mobile menu (line 3513)

- **Navigation** (lines 3644-3649):
  - `jumpTo(id)` - Smooth scroll to section

- **Initialization** (lines 3520-3534):
  - DOMContentLoaded event handler
  - Auto-detect Korean browser
  - Initialize ROI sliders
  - Apply translations on load

**Recommended Structure:**
```
refactored/
  components/
    landing-page.js      # Main landing page module
    dom-helpers.js       # DOM utility functions
    modals.js            # Modal management
    roi-calculator.js    # ROI calculation logic
    language-switcher.js # Language switching UI
```

### 📋 Remaining Tasks

#### 4. CSS Extraction
**Source:** `index.html` lines 12-1824 (embedded `<style>` tag)

**Breakdown:**
- Global styles & resets
- CSS variables (theme colors)
- Navigation styles
- Hero section
- Feature panels
- Stats bar
- Pricing cards
- FAQ section
- Footer
- Modal styles
- Responsive breakpoints

**Target:** `refactored/styles/landing.css`

#### 5. HTML Component Breakdown

**Sections to Extract:**
- Navigation (`<nav>`)
- Hero section
- Product screenshot demo
- Stats bar
- Feature panels (8 modules)
- ROI calculator
- Pricing section
- FAQ section
- Footer
- Modals (Support, RGPD, Legal)

**Target Structure:**
```
refactored/
  views/
    index-base.html           # Main template
  components/
    navigation.html           # Nav component
    hero.html                 # Hero section
    demo-screenshot.html      # Product demo
    stats-bar.html            # Statistics
    feature-panel.html        # Reusable feature card
    roi-calculator.html       # ROI tool
    pricing.html              # Pricing cards
    faq.html                  # FAQ accordion
    footer.html               # Footer
    modal-support.html        # Support modal
    modal-rgpd.html           # GDPR modal
    modal-legal.html          # Legal modal
```

#### 6. App.html Refactoring
**Status:** Not started
**Size:** 15,005 lines
**Priority:** High (after index.html completion)

**Initial Analysis Needed:**
- Identify React/Vue/vanilla JS framework
- Map out component tree
- Identify state management
- Extract routing logic
- Break down into view components

## Next Steps

### Immediate Actions
1. ✅ Complete JavaScript extraction from index.html
2. Extract CSS into separate stylesheet
3. Break HTML into reusable components
4. Create integration documentation

### Phase 2
1. Analyze app.html structure
2. Create refactoring plan for app.html
3. Extract app.html components
4. Consolidate duplicate code between index.html and app.html

## File Organization

### Current Structure
```
scalyo-claude-read-previous-chat-HEbsx 19/
├── index.html (3,707 lines) - monolithic
├── app.html (15,005 lines) - monolithic
├── extract_translations.py
└── refactored/
    ├── i18n/
    │   ├── fr.json (473 keys)
    │   ├── en.json (472 keys)
    │   └── kr.json (470 keys)
    └── shared/
        ├── i18n.js
        ├── persistence.js
        ├── theme.js
        └── utils.js
```

### Target Structure
```
scalyo-claude-read-previous-chat-HEbsx 19/
├── refactored/
    ├── components/        # Reusable JS modules
    ├── i18n/              # Translation files ✅
    ├── shared/            # Shared utilities ✅
    ├── styles/            # CSS files
    └── views/             # HTML templates
```

## Technical Debt & Considerations

### Issues Found
1. **Duplicate Translation Objects:** Original code had 3 separate translation objects (L, MODAL_I18N, T) - now consolidated
2. **Inline Styles:** Extensive CSS embedded in HTML
3. **No Module System:** All code in global scope
4. **Mixed Concerns:** HTML, CSS, JS tightly coupled

### Recommendations
1. Use ES6 modules for better code organization
2. Consider a build tool (Webpack/Vite) for bundling
3. Implement lazy loading for large components
4. Add TypeScript for type safety
5. Consider a component framework (React/Vue) for app.html

## Questions & Decisions Needed

1. **Module System:** Should we use ES6 modules or keep IIFE pattern?
2. **Build Process:** Do we need Webpack/Rollup/Vite?
3. **Component Framework:** Keep vanilla JS or migrate to React/Vue?
4. **CSS Approach:** Plain CSS, Sass, CSS Modules, or Tailwind?
5. **File Naming:** Kebab-case or camelCase for files?

## Notes
- Original conversation was blocked due to context limits
- Translation extraction automated via Python script
- All i18n JSON files use UTF-8 encoding
- Maintaining backward compatibility with existing Supabase integration
