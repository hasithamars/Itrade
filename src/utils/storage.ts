// Safe localStorage wrappers to prevent crash in sandboxed/restricted environments (e.g. GitHub Pages iframes, incognito)

export function safeGetItem(key: string, fallback: string = ''): string {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const val = window.localStorage.getItem(key);
      return val !== null ? val : fallback;
    }
  } catch {
    // Storage access restricted or disabled
  }
  return fallback;
}

export function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Storage access restricted or disabled
  }
}
