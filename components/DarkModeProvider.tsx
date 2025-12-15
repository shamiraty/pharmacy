'use client';

import { useEffect } from 'react';
import { initDarkMode } from '@/lib/theme';

export default function DarkModeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize dark mode on mount
    initDarkMode();
  }, []);

  return <>{children}</>;
}
