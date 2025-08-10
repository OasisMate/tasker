'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { PALETTES, type ThemeKey } from './palettes';

type ThemeCtx = { theme: ThemeKey; setTheme: (t: ThemeKey) => void };
const ThemeContext = createContext<ThemeCtx | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeKey>('blue');

  useEffect(() => {
    const saved = (localStorage.getItem('theme') as ThemeKey | null) || 'blue';
    setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

/** Pretty gradient chip picker */
export function ThemePicker() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex items-center gap-2">
      {PALETTES.map((p) => {
        const selected = theme === p.key;
        return (
          <button
            key={p.key}
            type="button"
            aria-label={p.label}
            aria-pressed={selected}
            onClick={() => setTheme(p.key)}
            className={`h-7 w-7 rounded-full border transition focus:outline-none focus:ring-2`}
            style={{
              background: `linear-gradient(135deg, ${p.start}, ${p.end})`,
              borderColor: selected ? p.brand : 'rgba(0,0,0,0.08)',
              boxShadow: selected ? `0 0 0 2px ${p.brand}33` : 'none',
            }}
            title={p.label}
          />
        );
      })}
    </div>
  );
}
