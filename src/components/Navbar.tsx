import React from 'react';
import { MailCheck, Sparkles, FileSpreadsheet, RefreshCw, MessageSquare, BookOpen } from 'lucide-react';

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
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand & Signature */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs shadow-blue-500/20 ring-1 ring-blue-700/30 shrink-0">
            <MailCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                MailVerify Studio
              </span>
              <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80">
                Excel & WhatsApp
              </span>
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 hidden md:inline-flex items-center gap-1">
                Developed by <strong className="text-slate-800 font-semibold">Ammar Thaqif</strong>
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Email DNS verification, director contact ingestion & WhatsApp automation
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* User Guide Button */}
          {onOpenUserGuide && (
            <button
              onClick={onOpenUserGuide}
              id="btn-nav-user-guide"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50/70 border border-slate-200 rounded-lg transition-colors shadow-xs cursor-pointer"
              title="Open User Guide & Manual"
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">User Guide</span>
              <span className="sm:hidden">Guide</span>
            </button>
          )}

          {!hasData && (
            <button
              onClick={onLoadSample}
              id="btn-nav-load-sample"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100/80 active:bg-blue-100 rounded-lg border border-blue-200 transition-colors shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <span>Load Sample Corporate Excel</span>
            </button>
          )}

          {hasData && (
            <>
              {onOpenWhatsAppTemplate && (
                <button
                  onClick={onOpenWhatsAppTemplate}
                  id="btn-nav-whatsapp-template"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">WhatsApp Template</span>
                  <span className="sm:hidden">Template</span>
                </button>
              )}

              <button
                onClick={onReset}
                id="btn-nav-reset"
                disabled={isVerifying}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200/70 border border-slate-200 rounded-lg transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Upload New File</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
