import React from 'react';
import { MailCheck, Sparkles, FileSpreadsheet, RefreshCw, MessageSquare } from 'lucide-react';

interface NavbarProps {
  onLoadSample: () => void;
  onReset: () => void;
  hasData: boolean;
  isVerifying: boolean;
  totalRecords: number;
  onOpenWhatsAppTemplate?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onLoadSample,
  onReset,
  hasData,
  isVerifying,
  totalRecords,
  onOpenWhatsAppTemplate,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs shadow-blue-500/20 ring-1 ring-blue-700/30">
            <MailCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                MailVerify Studio
              </span>
              <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/80">
                Excel & WhatsApp
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Email DNS verification, director contact ingestion & WhatsApp automation
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
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
