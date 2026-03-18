/**
 * Scalyo i18n System - ES6 Module Version
 * Centralized translation loader for use with import/export
 *
 * Usage:
 *   import { T } from '../shared/i18n-module.js';
 *
 *   const title = T('dashboard', 'fr');  // Returns "Dashboard"
 *   const title = T('dashboard', 'en');  // Returns "Dashboard"
 *   const title = T('dashboard', 'kr');  // Returns "대시보드"
 */

// Note: JSON imports require Node.js 17.5+ or appropriate bundler configuration
// For direct JSON import, you may need to adjust based on your build system

/**
 * Lazy-loaded translation cache
 * Translations are loaded on first access for each language
 */
const translationCache = {
  fr: null,
  en: null,
  kr: null
};

/**
 * Load a translation file
 * @param {string} lang - Language code ('fr', 'en', 'kr')
 * @returns {Promise<object>} Translation object
 */
async function loadTranslationFile(lang) {
  if (translationCache[lang]) {
    return translationCache[lang];
  }

  try {
    const response = await fetch(`../i18n/${lang}.json`);
    const data = await response.json();
    translationCache[lang] = data;
    return data;
  } catch (error) {
    console.error(`Failed to load ${lang} translations:`, error);
    return {};
  }
}

/**
 * Ensure translations are loaded for a language
 * @param {string} lang - Language code
 * @returns {Promise<void>}
 */
export async function ensureTranslationsLoaded(lang = 'fr') {
  if (!translationCache[lang]) {
    await loadTranslationFile(lang);
  }
}

/**
 * Translation helper function (async version)
 *
 * @param {string} key - Translation key to look up
 * @param {string} lang - Language code ('fr', 'en', 'kr'). Defaults to 'fr'
 * @returns {Promise<string>} Translated string or the key itself if not found
 *
 * @example
 * await TAsync('dashboard', 'fr')  // "Dashboard"
 */
export async function TAsync(key, lang = 'fr') {
  await ensureTranslationsLoaded(lang);
  await ensureTranslationsLoaded('fr'); // Always load French as fallback

  return translationCache[lang]?.[key] || translationCache.fr?.[key] || key;
}

/**
 * Translation helper function (synchronous version)
 * Use this after calling ensureTranslationsLoaded()
 *
 * @param {string} key - Translation key to look up
 * @param {string} lang - Language code ('fr', 'en', 'kr'). Defaults to 'fr'
 * @returns {string} Translated string or the key itself if not found
 *
 * @example
 * T('dashboard', 'fr')  // "Dashboard"
 * T('save', 'en')       // "Save"
 * T('settings', 'kr')   // "설정"
 */
export function T(key, lang = 'fr') {
  // Fallback chain: requested lang -> French -> key itself
  return translationCache[lang]?.[key] || translationCache.fr?.[key] || key;
}

/**
 * Get all translation keys for a specific language
 *
 * @param {string} lang - Language code ('fr', 'en', 'kr')
 * @returns {string[]} Array of all translation keys
 */
export function getTranslationKeys(lang = 'fr') {
  return Object.keys(translationCache[lang] || {});
}

/**
 * Check if a translation key exists
 *
 * @param {string} key - Translation key to check
 * @param {string} lang - Language code ('fr', 'en', 'kr')
 * @returns {boolean} True if the key exists
 */
export function hasTranslation(key, lang = 'fr') {
  return key in (translationCache[lang] || {});
}

/**
 * Set translations directly (for testing or SSR)
 * @param {string} lang - Language code
 * @param {object} translations - Translation object
 */
export function setTranslations(lang, translations) {
  translationCache[lang] = translations;
}

/**
 * Get the entire translation object for a language
 * @param {string} lang - Language code
 * @returns {object|null} Translation object or null if not loaded
 */
export function getTranslations(lang = 'fr') {
  return translationCache[lang];
}

export default {
  T,
  TAsync,
  ensureTranslationsLoaded,
  getTranslationKeys,
  hasTranslation,
  setTranslations,
  getTranslations
};
