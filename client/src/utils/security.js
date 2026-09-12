/* ============================================================
   SECURITY UTILITIES
   DevTools Protection + Console Cleanup + Basic Anti-Tampering
   ============================================================ */

/* ---------- Console Cleanup (Production) ---------- */
export const initConsoleCleanup = () => {
  if (import.meta.env.PROD) {
    const noop = () => {};
    // eslint-disable-next-line no-console
    console.log = noop;
    // eslint-disable-next-line no-console
    console.info = noop;
    // eslint-disable-next-line no-console
    console.debug = noop;
    // eslint-disable-next-line no-console
    console.warn = noop;
    // Keep console.error for critical errors (but could be removed too)
    // console.error = noop;
  }
};

/* ---------- Basic DevTools Detection ---------- */
export const initDevToolsProtection = () => {
  if (!import.meta.env.PROD) return;

  const threshold = 160;
  let isOpen = false;

  const checkDevTools = () => {
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;

    const currentlyOpen = widthDiff > threshold || heightDiff > threshold;

    if (currentlyOpen !== isOpen) {
      isOpen = currentlyOpen;
      if (isOpen) {
        // Optional: Log silently (won't be visible if console cleaned)
        // Or block specific keyboard shortcuts below
      }
    }
  };

  // Check every 1 second (not too aggressive)
  setInterval(checkDevTools, 1000);
};

/* ---------- Block Common DevTools Shortcuts ---------- */
export const initKeyboardProtection = () => {
  if (!import.meta.env.PROD) return;

  document.addEventListener(
    'keydown',
    (e) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+I / Cmd+Opt+I (Inspect)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === 'I' || e.key === 'i')
      ) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+J / Cmd+Opt+J (Console)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === 'J' || e.key === 'j')
      ) {
        e.preventDefault();
        return false;
      }
      // Ctrl+U / Cmd+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+C / Cmd+Opt+C (Element Picker)
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === 'C' || e.key === 'c')
      ) {
        e.preventDefault();
        return false;
      }
    },
    { capture: true }
  );
};

/* ---------- Disable Right-Click Context Menu ---------- */
export const initContextMenuProtection = () => {
  if (!import.meta.env.PROD) return;

  document.addEventListener(
    'contextmenu',
    (e) => {
      e.preventDefault();
      return false;
    },
    { capture: true }
  );
};

/* ---------- Disable Text Selection (Optional) ---------- */
export const initSelectionProtection = () => {
  if (!import.meta.env.PROD) return;

  // Only disable selection on non-input elements
  document.addEventListener('selectstart', (e) => {
    const tag = e.target?.tagName?.toLowerCase();
    if (
      tag !== 'input' &&
      tag !== 'textarea' &&
      !e.target?.isContentEditable
    ) {
      // Allow selection but can be blocked if needed
      // e.preventDefault();
    }
  });
};

/* ---------- Initialize All Security ---------- */
export const initSecurity = () => {
  if (!import.meta.env.PROD) {
    // In development, only cleanup is minimal
    return;
  }

  initConsoleCleanup();
  initDevToolsProtection();
  initKeyboardProtection();
  initContextMenuProtection();
  initSelectionProtection();

  // Silently log (invisible in prod since console is disabled)
  console.error('🔒 Protected by StreamWeaver');
};

/* ---------- Sanitize User Input ---------- */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/* ---------- Safe Storage Wrapper ---------- */
export const safeStorage = {
  get(key, fallback = null) {
    try {
      const value = sessionStorage.getItem(key);
      return value === null ? fallback : value;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      sessionStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};

export const safeLocalStorage = {
  get(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      if (value === null) return fallback;
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};