import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, ChevronDown } from 'lucide-react';
import { useTheme, THEME_CONFIGS } from '../context/ThemeContext';
import { DashboardTheme } from '../types';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themes: { id: DashboardTheme; name: string; color: string; isDark: boolean }[] = [
    { id: 'slate', name: 'Modern Slate', color: '#2563eb', isDark: false },
    { id: 'midnight', name: 'Midnight Dark', color: '#3b82f6', isDark: true },
    { id: 'emerald', name: 'Emerald Clean', color: '#059669', isDark: false },
    { id: 'sapphire', name: 'Sapphire Deep', color: '#6366f1', isDark: true },
    { id: 'amber', name: 'Warm Amber', color: '#d97706', isDark: false },
  ];

  const current = THEME_CONFIGS[theme] || THEME_CONFIGS.slate;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        id="btn-toggle-theme-selector"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer min-h-[38px] ${
          isDark
            ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
        }`}
        title="Change dashboard color theme"
      >
        <span
          className="w-3 h-3 rounded-full shrink-0 shadow-2xs border border-white/20"
          style={{ backgroundColor: current.accentColor }}
        />
        <Palette className="w-3.5 h-3.5 text-slate-400" />
        <span className="hidden sm:inline">{current.name}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-1.5 w-48 rounded-xl shadow-xl border p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Dashboard Themes
          </div>
          <div className="space-y-1">
            {themes.map((t) => {
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer min-h-[36px] ${
                    isSelected
                      ? isDark
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-900'
                      : isDark
                      ? 'hover:bg-slate-800/60 text-slate-300'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs border border-black/10"
                      style={{ backgroundColor: t.color }}
                    />
                    <span>{t.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
