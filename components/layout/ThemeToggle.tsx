'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = stored === 'dark' || (!stored && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDark);
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200',
        'hover:bg-slate-100',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
      )}
      aria-label="Cambiar tema"
    >
      <Sun className={cn(
        'h-4 w-4 text-slate-600 transition-all duration-300',
        isDark ? 'opacity-0 scale-75 rotate-90 absolute' : 'opacity-100 scale-100 rotate-0'
      )} />
      <Moon className={cn(
        'h-4 w-4 text-slate-600 transition-all duration-300',
        isDark ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-90 absolute'
      )} />
    </button>
  );
}