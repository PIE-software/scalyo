/**
 * Scalyo Utils - Shared utility functions
 * Comprehensive collection of helper functions for the Scalyo application
 */
(function(window) {
  'use strict';

  // Initialize namespace
  window.Scalyo = window.Scalyo || {};

  // ══════════════════════════════════════════════════
  // CONSTANTS
  // ══════════════════════════════════════════════════

  /**
   * Currency configurations
   * @type {Object}
   */
  const CURRENCIES = {
    EUR: {symbol: "€", position: "after", name: "Euro"},
    USD: {symbol: "$", position: "before", name: "US Dollar"},
    GBP: {symbol: "£", position: "before", name: "British Pound"},
    CHF: {symbol: "CHF", position: "after", name: "Swiss Franc"},
    CAD: {symbol: "CA$", position: "before", name: "Canadian Dollar"},
    MAD: {symbol: "DH", position: "after", name: "Dirham marocain"},
    XOF: {symbol: "CFA", position: "after", name: "Franc CFA"},
    AED: {symbol: "AED", position: "before", name: "Dirham UAE"},
    SAR: {symbol: "SAR", position: "before", name: "Riyal saoudien"},
    KRW: {symbol: "₩", position: "before", name: "Won coréen"}
  };

  // ══════════════════════════════════════════════════
  // PARSING UTILITIES
  // ══════════════════════════════════════════════════

  /**
   * Parse items from various formats into an array
   * @param {*} items - Items to parse (can be array, JSON string, or null)
   * @returns {Array} Parsed array of items
   */
  const parseItems = items => {
    if (!items) return [];
    if (Array.isArray(items)) return items;
    try {
      return JSON.parse(items);
    } catch {
      return [];
    }
  };

  /**
   * Safely parse a value into a JSON array
   * Returns empty array if invalid
   * @param {*} v - Value to parse
   * @returns {Array} Parsed array or empty array
   */
  const safeParseArray = v => {
    if (Array.isArray(v)) return v;
    if (typeof v === "string" && v.trim().startsWith("[")) {
      try {
        return JSON.parse(v);
      } catch (_) {
        return [];
      }
    }
    return [];
  };

  // ══════════════════════════════════════════════════
  // FORMATTING UTILITIES
  // ══════════════════════════════════════════════════

  /**
   * Format a number with currency symbol
   * @param {number} num - Number to format
   * @param {string} cur - Currency code (default: "EUR")
   * @returns {string} Formatted currency string
   */
  const fmtCur = (num, cur = "EUR") => {
    const c = CURRENCIES[cur] || CURRENCIES.EUR;
    return c.position === "before" ? `${c.symbol}${num}` : `${num}${c.symbol}`;
  };

  /**
   * Format MRR (Monthly Recurring Revenue) with K suffix
   * @param {number} v - Value to format
   * @param {string} cur - Currency code (default: "EUR")
   * @returns {string} Formatted MRR string
   */
  const fmtMRR = (v, cur = "EUR") => {
    const num = v >= 10000 ? `${(v/1000).toFixed(0)}K` : `${(v/1000).toFixed(1)}K`;
    return fmtCur(num, cur);
  };

  /**
   * Format ARR (Annual Recurring Revenue) with K/M suffixes
   * @param {number} v - Value to format (monthly value, will be multiplied by 12)
   * @param {string} cur - Currency code (default: "EUR")
   * @returns {string} Formatted ARR string
   */
  const fmtARR = (v, cur = "EUR") => {
    const a = v * 12;
    let num;
    if (a >= 1000000) num = `${(a/1000000).toFixed(1)}M`;
    else if (a >= 1000) num = `${(a/1000).toFixed(0)}K`;
    else num = `${a}`;
    return fmtCur(num, cur);
  };

  /**
   * Get today's date formatted in specified language
   * @param {string} lang - Language code ("fr", "en", "kr")
   * @returns {string} Formatted date string
   */
  const todayFR = (lang = "fr") => new Date().toLocaleDateString(
    lang === "en" ? "en-US" : lang === "kr" ? "ko-KR" : "fr-FR",
    {
      weekday: "long",
      day: "numeric",
      month: "long"
    }
  );

  /**
   * Get color for risk level
   * @param {string} r - Risk level ("critical", "medium", or other)
   * @returns {string} Color value from global C object
   */
  const riskColor = r => r === "critical" ? C.red : r === "medium" ? C.amber : C.green;

  /**
   * Get localized label for risk level
   * @param {string} r - Risk level ("critical", "medium", or other)
   * @param {string} lang - Language code (default: "fr")
   * @returns {string} Localized risk label
   */
  const riskLabel = (r, lang = "fr") =>
    r === "critical"
      ? (lang === "en" ? "Critical" : lang === "kr" ? "위험" : "Critique")
      : r === "medium"
      ? (lang === "en" ? "Watch" : lang === "kr" ? "주의" : "Vigilance")
      : (lang === "en" ? "Healthy" : lang === "kr" ? "건강" : "Sain");

  /**
   * Get color for plan type
   * @param {string} p - Plan type ("Elite", "Growth", or other)
   * @returns {string} Color value from global C object
   */
  const planColor = p => p === "Elite" ? C.purple : p === "Growth" ? C.teal : C.blue;

  // ══════════════════════════════════════════════════
  // RENDERING UTILITIES
  // ══════════════════════════════════════════════════

  /**
   * Render text with bold formatting (**text**)
   * XSS-safe rendering without dangerouslySetInnerHTML
   * @param {string} text - Text to render with **bold** markers
   * @param {string} textColor - Optional color for bold text
   * @returns {Array} Array of React elements
   */
  const renderBoldText = (text, textColor) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1
        ? React.createElement("strong", {key: i, style: {color: textColor || C.teal, fontWeight: 800}}, part)
        : part
    );
  };

  // ══════════════════════════════════════════════════
  // TASK UTILITIES - LocalStorage
  // ══════════════════════════════════════════════════

  /**
   * Load tasks from localStorage
   * @returns {Array} Array of tasks or empty array if none/error
   */
  const getTasksFromLS = () => {
    try {
      const raw = localStorage.getItem("scalyo_tasks");
      return raw ? JSON.parse(raw) : [];
    } catch(e) {
      return [];
    }
  };

  /**
   * Save tasks to localStorage
   * @param {Array} tasks - Array of tasks to save
   */
  const saveTasksToLS = tasks => {
    try {
      localStorage.setItem("scalyo_tasks", JSON.stringify(tasks));
    } catch(e) {
      // Silent fail
    }
  };

  // ══════════════════════════════════════════════════
  // EVENT UTILITIES - LocalStorage & Calendar Export
  // ══════════════════════════════════════════════════

  /**
   * Load events from localStorage
   * @returns {Array} Array of events or empty array if none/error
   */
  const getEventsFromLS = () => {
    try {
      const r = localStorage.getItem("scalyo_events");
      return r ? JSON.parse(r) : [];
    } catch(e) {
      return [];
    }
  };

  /**
   * Save events to localStorage
   * @param {Array} evs - Array of events to save
   */
  const saveEventsToLS = evs => {
    try {
      localStorage.setItem("scalyo_events", JSON.stringify(evs));
    } catch(e) {
      // Silent fail
    }
  };

  /**
   * Convert date/time to ICS format (ISO 8601 basic format)
   * @param {string} dateStr - Date string (YYYY-MM-DD)
   * @param {string} timeStr - Time string (HH:MM)
   * @returns {string} ICS formatted date-time string
   */
  const toICSDate = (dateStr, timeStr) => {
    if (!dateStr) return "";
    const d = new Date(`${dateStr}T${timeStr || "00:00"}:00`);
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  /**
   * Build Google Calendar link for an event
   * @param {Object} ev - Event object with {title, date, time, endTime, note, account}
   * @returns {string} Google Calendar URL
   */
  const buildGoogleLink = ev => {
    const start = toICSDate(ev.date, ev.time);
    const end = toICSDate(ev.date, ev.endTime || ev.time);
    const p = new URLSearchParams({
      action: "TEMPLATE",
      text: ev.title,
      dates: `${start}/${end}`,
      details: [ev.note, ev.account ? `Client: ${ev.account}` : ""].filter(Boolean).join("\n")
    });
    return `https://www.google.com/calendar/render?${p.toString()}`;
  };

  /**
   * Build Outlook Calendar link for an event
   * @param {Object} ev - Event object with {title, date, time, endTime, note, account}
   * @returns {string} Outlook Calendar URL
   */
  const buildOutlookLink = ev => {
    const start = `${ev.date}T${ev.time || "09:00"}:00`;
    const end = `${ev.date}T${ev.endTime || ev.time || "10:00"}:00`;
    const p = new URLSearchParams({
      path: "/calendar/action/compose",
      rru: "addevent",
      subject: ev.title,
      startdt: start,
      enddt: end,
      body: [ev.note, ev.account ? `Client: ${ev.account}` : ""].filter(Boolean).join("\n")
    });
    return `https://outlook.live.com/calendar/0/deeplink/compose?${p.toString()}`;
  };

  /**
   * Export events to ICS file
   * @param {Array} evs - Array of events to export
   * @param {string} filename - Optional filename (default: "scalyo-planning.ics")
   */
  const exportICS = (evs, filename) => {
    filename = filename || "scalyo-planning.ics";

    const dtFmt = (ds, ts) => {
      if (!ds) return "";
      const [y, m, d] = ds.split("-");
      const [h, mi] = (ts || "09:00").split(":");
      return y + m + d + "T" + h + mi + "00";
    };

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Scalyo//FR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH"
    ];

    evs.forEach(function(ev) {
      lines.push("BEGIN:VEVENT");
      lines.push("UID:" + ev.id + "@scalyo");
      lines.push("DTSTAMP:" + dtFmt(new Date().toISOString().slice(0, 10), "00:00"));
      lines.push("DTSTART:" + dtFmt(ev.date, ev.time));
      lines.push("DTEND:" + dtFmt(ev.date, ev.endTime || ev.time));
      lines.push("SUMMARY:" + ev.title);
      if (ev.note) lines.push("DESCRIPTION:" + ev.note.replace(/\n/g, "\\n"));
      lines.push("END:VEVENT");
    });

    lines.push("END:VCALENDAR");

    const blob = new Blob([lines.join("\r\n")], {type: "text/calendar;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ══════════════════════════════════════════════════
  // NAVIGATION CONSTANTS
  // ══════════════════════════════════════════════════

  /**
   * Navigation items for Manager role
   * @param {string} lang - Language code
   * @returns {Array} Array of navigation items
   */
  const NAV_MANAGER = (lang) => [{
    id: "dashboard",
    label: T("dashboard", lang),
    icon: "📊"
  }, {
    id: "portfolio",
    label: T("portfolio", lang),
    icon: "💼"
  }, {
    id: "roadmap",
    label: lang === "en" ? "Roadmap 90D" : lang === "kr" ? "로드맵 90일" : "Roadmap 90J",
    icon: "🗺️"
  }, {
    id: "tasks",
    label: T("tasks", lang),
    icon: "🎯"
  }, {
    id: "planning",
    label: T("planning", lang),
    icon: "📅"
  }, {
    id: "kpi",
    label: T("kpi", lang),
    icon: "📈"
  }, {
    id: "wellbeing",
    label: T("wellbeing", lang),
    icon: "💚"
  }, {
    id: "coach",
    label: T("coach", lang),
    icon: "🤖"
  }, {
    id: "tips",
    label: T("tips", lang),
    icon: "🎓"
  }, {
    id: "resources",
    label: T("resources", lang),
    icon: "📚"
  }, {
    id: "quotes",
    label: T("quotes", lang),
    icon: "📄"
  }, {
    id: "email",
    label: T("email", lang),
    icon: "✉️"
  }];

  /**
   * Navigation items for CSM role
   * @param {string} lang - Language code
   * @returns {Array} Array of navigation items
   */
  const NAV_CSM = (lang) => [{
    id: "dashboard",
    label: T("dashboard", lang),
    icon: "📊"
  }, {
    id: "portfolio",
    label: T("myCsm", lang),
    icon: "💼"
  }, {
    id: "roadmap",
    label: lang === "en" ? "Roadmap 90D" : lang === "kr" ? "로드맵 90일" : "Roadmap 90J",
    icon: "🗺️"
  }, {
    id: "tasks",
    label: T("tasks", lang),
    icon: "🎯"
  }, {
    id: "planning",
    label: T("planning", lang),
    icon: "📅"
  }, {
    id: "kpi",
    label: T("kpi", lang),
    icon: "📈"
  }, {
    id: "wellbeing",
    label: T("wellbeing", lang),
    icon: "💚"
  }, {
    id: "coach",
    label: T("coach", lang),
    icon: "🤖"
  }, {
    id: "tips",
    label: T("tips", lang),
    icon: "🎓"
  }, {
    id: "quotes",
    label: T("quotes", lang),
    icon: "📄"
  }];

  // ══════════════════════════════════════════════════
  // EXPORTS
  // ══════════════════════════════════════════════════

  // Export all utilities to the Scalyo.utils namespace
  window.Scalyo.utils = {
    // Constants
    CURRENCIES,

    // Parsing
    parseItems,
    safeParseArray,

    // Formatting
    fmtCur,
    fmtMRR,
    fmtARR,
    todayFR,
    riskColor,
    riskLabel,
    planColor,

    // Rendering
    renderBoldText,

    // Task utilities
    getTasksFromLS,
    saveTasksToLS,

    // Event utilities
    getEventsFromLS,
    saveEventsToLS,
    toICSDate,
    buildGoogleLink,
    buildOutlookLink,
    exportICS,

    // Navigation
    NAV_MANAGER,
    NAV_CSM
  };

  // Export commonly used utilities to global scope for ES module access
  window.parseItems = parseItems;
  window.todayFR = todayFR;
  window.fmtMRR = fmtMRR;
  window.fmtARR = fmtARR;
  window.riskColor = riskColor;
  window.riskLabel = riskLabel;
  window.planColor = planColor;
  window.fmtCur = fmtCur;

})(window);
