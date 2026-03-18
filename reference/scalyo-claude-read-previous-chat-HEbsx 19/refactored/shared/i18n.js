/**
 * Scalyo i18n System
 * Loads and manages translations for French, English, and Korean
 */

(function(window) {
  'use strict';

  // Initialize Scalyo namespace if it doesn't exist
  if (!window.Scalyo) {
    window.Scalyo = {};
  }

  // Cache for loaded translations
  let I18N = {
    fr: {},
    en: {},
    kr: {}
  };

  let isLoaded = false;
  let loadPromise = null;

  /**
   * Load translation files from JSON
   * @returns {Promise} Resolves when all translations are loaded
   */
  async function loadTranslations() {
    if (isLoaded) {
      return Promise.resolve(I18N);
    }

    if (loadPromise) {
      return loadPromise;
    }

    loadPromise = Promise.all([
      fetch('./i18n/fr.json').then(r => r.json()),
      fetch('./i18n/en.json').then(r => r.json()),
      fetch('./i18n/kr.json').then(r => r.json())
    ]).then(([fr, en, kr]) => {
      I18N.fr = fr;
      I18N.en = en;
      I18N.kr = kr;
      isLoaded = true;
      console.log('✅ Translations loaded successfully');
      return I18N;
    }).catch(err => {
      console.error('❌ Failed to load translations:', err);
      console.warn('Using fallback translations');
      // Return empty objects on failure but mark as loaded
      isLoaded = true;
      return I18N;
    });

    return loadPromise;
  }

  /**
   * Get translation for a key in the specified language
   * @param {string} key - Translation key
   * @param {string} lang - Language code ("fr", "en", or "kr")
   * @returns {string} Translated string or key if not found
   */
  function T(key, lang) {
    const targetLang = lang || "fr";
    const translations = I18N[targetLang] || I18N.fr;
    return translations[key] || I18N.fr[key] || key;
  }

  /**
   * Set translations directly (for testing or fallback)
   * @param {object} translations - Object with fr, en, kr properties
   */
  function setTranslations(translations) {
    if (translations.fr) I18N.fr = translations.fr;
    if (translations.en) I18N.en = translations.en;
    if (translations.kr) I18N.kr = translations.kr;
    isLoaded = true;
  }

  /**
   * Get all translations for a specific language
   * @param {string} lang - Language code
   * @returns {object} Translation object
   */
  function getTranslations(lang) {
    return I18N[lang] || I18N.fr;
  }

  /**
   * Check if translations are loaded
   * @returns {boolean}
   */
  function isTranslationsLoaded() {
    return isLoaded;
  }

  // ─── EXPORTS ───
  window.Scalyo.i18n = {
    loadTranslations: loadTranslations,
    T: T,
    setTranslations: setTranslations,
    getTranslations: getTranslations,
    isLoaded: isTranslationsLoaded
  };

  // For backward compatibility, also export T directly
  window.Scalyo.T = T;

})(window);
