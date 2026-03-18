/**
 * Scalyo i18n Wrapper
 * Provides a clean import interface for the global i18n system
 *
 * This module wraps the browser-based i18n system (shared/i18n.js)
 * and exposes it as importable functions for use in view components.
 *
 * Prerequisites:
 * - shared/i18n.js must be loaded in the page
 * - Scalyo.i18n.loadTranslations() must be called before rendering
 *
 * Usage in components:
 *   import { T } from '../shared/i18n-wrapper.js';
 *
 *   const MyComponent = ({ lang = 'fr' }) => {
 *     return <h1>{T('dashboard', lang)}</h1>;
 *   };
 */

/**
 * Translation helper function
 * Wraps the global Scalyo.T function
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
  // Check if global i18n system is available
  if (typeof window !== 'undefined' && window.Scalyo && window.Scalyo.T) {
    return window.Scalyo.T(key, lang);
  }

  // Fallback for server-side or if i18n not loaded
  console.warn('Scalyo i18n not loaded. Returning key:', key);
  return key;
}

/**
 * Load translations
 * Wraps the global loadTranslations function
 *
 * @returns {Promise} Resolves when translations are loaded
 */
export function loadTranslations() {
  if (typeof window !== 'undefined' && window.Scalyo && window.Scalyo.i18n) {
    return window.Scalyo.i18n.loadTranslations();
  }
  return Promise.reject(new Error('Scalyo i18n not available'));
}

/**
 * Check if translations are loaded
 *
 * @returns {boolean} True if translations are loaded
 */
export function isLoaded() {
  if (typeof window !== 'undefined' && window.Scalyo && window.Scalyo.i18n) {
    return window.Scalyo.i18n.isLoaded();
  }
  return false;
}

/**
 * Get all translations for a language
 *
 * @param {string} lang - Language code
 * @returns {object} Translation object
 */
export function getTranslations(lang = 'fr') {
  if (typeof window !== 'undefined' && window.Scalyo && window.Scalyo.i18n) {
    return window.Scalyo.i18n.getTranslations(lang);
  }
  return {};
}

export default { T, loadTranslations, isLoaded, getTranslations };
