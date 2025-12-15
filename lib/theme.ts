// Theme management for dark mode
export function setDarkMode(isDark: boolean) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('darkMode', isDark.toString());
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}

export function getDarkMode(): boolean {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true';
  }
  return false;
}

export function initDarkMode() {
  if (typeof window !== 'undefined') {
    const isDark = getDarkMode();
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }
}
