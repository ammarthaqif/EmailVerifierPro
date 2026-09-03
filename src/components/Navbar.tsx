import React, { useState } from 'react';
import {
  MailCheck,
  Sparkles,
  FileSpreadsheet,
  RefreshCw,
  MessageSquare,
  BookOpen,
  Menu,
  X,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ThemeSelector } from './ThemeSelector';

interface NavbarProps {
  onLoadSample: () => void;
  onReset: () => void;
  hasData: boolean;
  isVerifying: boolean;
  totalRecords: number;
  onOpenWhatsAppTemplate?: () => void;
  onOpenUserGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onLoadSample,
  onReset,
  hasData,
  isVerifying,
  totalRecords,
  onOpenWhatsAppTemplate,
  onOpenUserGuide,
}) => {
  const { isDark, themeConfig } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className={`border-b sticky top-0 z-30 shadow-xs transition-colors backdrop-blur-md ${
        isDark ? 'border-slate-800 bg-slate-900/95 text-slate-100' : 'border-slate-200 bg-white/95 text-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand & Signature */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
            style={{ backgroundColor: themeConfig.accentColor }}
          >
            <MailCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="font-bold text-sm sm:text-lg tracking-tight truncate">
                MailVerify Studio
              </span>
              <span
                className={`text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase px-1.5 sm:px-2 py-0.5 rounded-md border ${
                  isDark
                    ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                    : 'bg-blue-50 text-blue-700 border-blue-200/80'
                }`}
              >
                Excel & WhatsApp
              </span>
              <span
                className={`text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-md border hidden md:inline-flex items-center gap-1 ${
                  isDark
                    ? 'bg-slate-800 text-slate-300 border-slate-700'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                Developed by{' '}
                <strong className={isDark ? 'text-white' : 'text-slate-900'}>Ammar Thaqif</strong>
              </span>
            </div>
            <p
              className={`text-[11px] sm:text-xs truncate hidden sm:block ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Email DNS verification, director contact ingestion & WhatsApp automation
            </p>
          </div>
        </div>

        {/* Desktop / Tablet Action Controls */}
        <div className="hidden md:flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Theme Selector */}
          <ThemeSelector />

          {/* User Guide Button */}
          {onOpenUserGuide && (
            <button
              onClick={onOpenUserGuide}
              id="btn-nav-user-guide"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer min-h-[38px] ${
                isDark
                  ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="Open User Guide & Manual"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <span>User Guide</span>
            </button>
          )}

          {!hasData && (
            <button
              onClick={onLoadSample}
              id="btn-nav-load-sample"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white rounded-lg shadow-xs transition-colors cursor-pointer min-h-[38px]"
              style={{ backgroundColor: themeConfig.accentColor }}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Load Sample Data</span>
            </button>
          )}

          {hasData && (
            <>
              {onOpenWhatsAppTemplate && (
                <button
                  onClick={onOpenWhatsAppTemplate}
                  id="btn-nav-whatsapp-template"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer min-h-[38px]"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Template</span>
                </button>
              )}

              <button
                onClick={onReset}
                id="btn-nav-reset"
                disabled={isVerifying}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors disabled:opacity-50 cursor-pointer min-h-[38px] ${
                  isDark
                    ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Upload New</span>
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger & Theme Toggle Button */}
        <div className="flex md:hidden items-center gap-1.5">
          <ThemeSelector />

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-800 text-slate-200 border-slate-700'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden px-4 py-3 border-t space-y-2 animate-in fade-in duration-150 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          {onOpenUserGuide && (
            <button
              onClick={() => {
                onOpenUserGuide();
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-800 text-slate-200 border-slate-700'
                  : 'bg-white text-slate-700 border-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span>User Manual & Guide</span>
            </button>
          )}

          {!hasData ? (
            <button
              onClick={() => {
                onLoadSample();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer"
              style={{ backgroundColor: themeConfig.accentColor }}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Load Sample Corporate Excel</span>
            </button>
          ) : (
            <div className="space-y-2">
              {onOpenWhatsAppTemplate && (
                <button
                  onClick={() => {
                    onOpenWhatsAppTemplate();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Configure WhatsApp Template</span>
                </button>
              )}

              <button
                onClick={() => {
                  onReset();
                  setMobileMenuOpen(false);
                }}
                disabled={isVerifying}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 text-slate-200 border-slate-700'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                <RefreshCw className="w-4 h-4 text-slate-400" />
                <span>Upload New Excel File</span>
              </button>
            </div>
          )}

          <div
            className={`pt-2 border-t text-center text-[11px] ${
              isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
            }`}
          >
            Developed by <strong className={isDark ? 'text-white' : 'text-slate-800'}>Ammar Thaqif</strong>
          </div>
        </div>
      )}
    </header>
  );
};
