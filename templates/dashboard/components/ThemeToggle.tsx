'use client';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const t = mounted ? theme : 'light';
  return (
    <div className="theme-toggle" role="tablist" aria-label="Theme">
      <button className={t === 'light' ? 'active' : ''} onClick={() => setTheme('light')} title="Light" aria-label="Light theme"><Sun size={13} /></button>
      <button className={t === 'dark' ? 'active' : ''} onClick={() => setTheme('dark')} title="Dark" aria-label="Dark theme"><Moon size={13} /></button>
    </div>
  );
}
