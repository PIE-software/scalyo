/**
 * Scalyo Design System - Theme & Design Tokens
 * Color schemes, theme switching, and currency definitions
 */

(function(window) {
  'use strict';

  // Initialize Scalyo namespace if it doesn't exist
  if (!window.Scalyo) {
    window.Scalyo = {};
  }

  // ─── DARK THEME (DEFAULT) ───
  const C_DARK = {
    bg: "#1C1A17",
    bg1: "#252320",
    bg2: "#2D2B27",
    bg3: "#35332E",
    surface: "rgba(250,247,242,0.04)",
    surfaceHi: "rgba(250,247,242,0.06)",
    border: "rgba(250,247,242,0.08)",
    borderHi: "rgba(250,247,242,0.14)",
    teal: "#9BB8CC",
    tealBg: "rgba(155,184,204,0.08)",
    tealBorder: "rgba(155,184,204,0.20)",
    tealGlow: "rgba(155,184,204,0.08)",
    red: "#D4958A",
    redBg: "rgba(212,149,138,0.08)",
    redBorder: "rgba(212,149,138,0.18)",
    amber: "#D4BA6E",
    amberBg: "rgba(212,186,110,0.08)",
    amberBorder: "rgba(212,186,110,0.20)",
    green: "#9BB8A8",
    greenBg: "rgba(155,184,168,0.08)",
    greenBorder: "rgba(155,184,168,0.20)",
    purple: "#B8A8D4",
    purpleBg: "rgba(184,168,212,0.08)",
    blue: "#8BA8C4",
    blueBg: "rgba(139,168,196,0.07)",
    text: "#E8E4DC",
    muted: "rgba(232,228,220,0.50)",
    faint: "rgba(232,228,220,0.14)"
  };

  // ─── LIGHT THEME ───
  const C_LIGHT = {
    bg: "#FFFFFF",
    bg1: "#F8F8F7",
    bg2: "#F0EFED",
    bg3: "#E6E5E3",
    surface: "rgba(30,30,30,0.05)",
    surfaceHi: "rgba(30,30,30,0.09)",
    border: "rgba(30,30,30,0.14)",
    borderHi: "rgba(30,30,30,0.22)",
    teal: "#0B6E60",
    tealBg: "rgba(11,110,96,0.08)",
    tealBorder: "rgba(11,110,96,0.28)",
    tealGlow: "rgba(11,110,96,0.08)",
    red: "#D32F2F",
    redBg: "rgba(211,47,47,0.08)",
    redBorder: "rgba(211,47,47,0.22)",
    amber: "#C66200",
    amberBg: "rgba(198,98,0,0.08)",
    amberBorder: "rgba(198,98,0,0.22)",
    green: "#0B6E60",
    greenBg: "rgba(11,110,96,0.08)",
    greenBorder: "rgba(11,110,96,0.22)",
    purple: "#5B2D99",
    purpleBg: "rgba(91,45,153,0.08)",
    blue: "#1A6DC2",
    blueBg: "rgba(26,109,194,0.08)",
    text: "#1A1A1A",
    muted: "rgba(30,30,30,0.72)",
    faint: "rgba(30,30,30,0.42)"
  };

  // Default to dark theme
  let C = Object.assign({}, C_DARK);

  // ─── CURRENCY DEFINITIONS ───
  const CURRENCIES = {
    EUR: { symbol: "€", position: "after", name: "Euro" },
    USD: { symbol: "$", position: "before", name: "US Dollar" },
    GBP: { symbol: "£", position: "before", name: "British Pound" },
    CHF: { symbol: "CHF", position: "after", name: "Swiss Franc" },
    CAD: { symbol: "CA$", position: "before", name: "Canadian Dollar" },
    MAD: { symbol: "DH", position: "after", name: "Dirham marocain" },
    XOF: { symbol: "CFA", position: "after", name: "Franc CFA" },
    AED: { symbol: "AED", position: "before", name: "Dirham UAE" },
    SAR: { symbol: "SAR", position: "before", name: "Riyal saoudien" },
    KRW: { symbol: "₩", position: "before", name: "Won coréen" }
  };

  // ─── THEME SWITCHING FUNCTION ───
  /**
   * Switch between light and dark themes
   * @param {string} theme - "light" or "dark"
   * @returns {object} The active color scheme
   */
  function setTheme(theme) {
    if (theme === "light") {
      C = Object.assign({}, C_LIGHT);
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      C = Object.assign({}, C_DARK);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    return C;
  }

  /**
   * Get the current theme name
   * @returns {string} "light" or "dark"
   */
  function getCurrentTheme() {
    const attr = document.documentElement.getAttribute('data-theme');
    return attr === 'light' ? 'light' : 'dark';
  }

  // ─── EXPORTS ───
  window.Scalyo.theme = {
    C: C,              // Current active theme colors
    C_DARK: C_DARK,    // Dark theme colors
    C_LIGHT: C_LIGHT,  // Light theme colors
    CURRENCIES: CURRENCIES,
    setTheme: setTheme,
    getCurrentTheme: getCurrentTheme
  };

  // For backward compatibility, also export C directly
  window.Scalyo.C = C;
  window.Scalyo.CURRENCIES = CURRENCIES;

  // Export to global scope for ES module access
  window.C = C;

})(window);
