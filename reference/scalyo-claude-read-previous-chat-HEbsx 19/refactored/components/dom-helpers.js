/**
 * Scalyo DOM Helper Utilities
 * Lightweight wrappers for common DOM operations
 */

(function(window) {
  'use strict';

  // Initialize Scalyo namespace if it doesn't exist
  if (!window.Scalyo) {
    window.Scalyo = {};
  }

  /**
   * Get element by ID
   * @param {string} id - Element ID
   * @returns {HTMLElement|null}
   */
  function _el(id) {
    return document.getElementById(id);
  }

  /**
   * Query selector (single element)
   * @param {string} sel - CSS selector
   * @returns {HTMLElement|null}
   */
  function _qs(sel) {
    return document.querySelector(sel);
  }

  /**
   * Query selector all (multiple elements)
   * @param {string} sel - CSS selector
   * @returns {NodeList}
   */
  function _qsa(sel) {
    return document.querySelectorAll(sel);
  }

  /**
   * Set element innerHTML by ID
   * @param {string} id - Element ID
   * @param {string} html - HTML content
   */
  function _set(id, html) {
    const el = _el(id);
    if (el) el.innerHTML = html;
  }

  /**
   * Set element textContent by ID
   * @param {string} id - Element ID
   * @param {string} txt - Text content
   */
  function _setText(id, txt) {
    const el = _el(id);
    if (el) el.textContent = txt;
  }

  /**
   * Set element innerHTML by selector
   * @param {string} sel - CSS selector
   * @param {string} html - HTML content
   */
  function _qsSet(sel, html) {
    const el = _qs(sel);
    if (el) el.innerHTML = html;
  }

  /**
   * Add event listener to multiple elements
   * @param {string} selector - CSS selector or array of elements
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   */
  function _on(selector, event, handler) {
    const elements = typeof selector === 'string' ? _qsa(selector) : selector;
    elements.forEach(el => el.addEventListener(event, handler));
  }

  /**
   * Toggle class on element
   * @param {string} selector - CSS selector or element
   * @param {string} className - Class name
   */
  function _toggleClass(selector, className) {
    const el = typeof selector === 'string' ? _qs(selector) : selector;
    if (el) el.classList.toggle(className);
  }

  /**
   * Add class to element
   * @param {string} selector - CSS selector or element
   * @param {string} className - Class name
   */
  function _addClass(selector, className) {
    const el = typeof selector === 'string' ? _qs(selector) : selector;
    if (el) el.classList.add(className);
  }

  /**
   * Remove class from element
   * @param {string} selector - CSS selector or element
   * @param {string} className - Class name
   */
  function _removeClass(selector, className) {
    const el = typeof selector === 'string' ? _qs(selector) : selector;
    if (el) el.classList.remove(className);
  }

  /**
   * Check if element has class
   * @param {string} selector - CSS selector or element
   * @param {string} className - Class name
   * @returns {boolean}
   */
  function _hasClass(selector, className) {
    const el = typeof selector === 'string' ? _qs(selector) : selector;
    return el ? el.classList.contains(className) : false;
  }

  /**
   * Smooth scroll to element
   * @param {string} id - Element ID or selector
   * @param {number} offset - Offset from top (default: 80)
   */
  function _scrollTo(id, offset = 80) {
    const el = id.startsWith('#') ? _qs(id) : _el(id);
    if (!el) return;

    const y = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  // ─── EXPORTS ───
  window.Scalyo.dom = {
    // Core selectors
    _el,
    _qs,
    _qsa,

    // Content setters
    _set,
    _setText,
    _qsSet,

    // Event handling
    _on,

    // Class management
    _toggleClass,
    _addClass,
    _removeClass,
    _hasClass,

    // Navigation
    _scrollTo
  };

  // For backward compatibility, also export to global scope
  window._el = _el;
  window._qs = _qs;
  window._qsa = _qsa;
  window._set = _set;
  window._setText = _setText;
  window._qsSet = _qsSet;

})(window);
