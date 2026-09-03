import React from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Server,
  Globe,
  Mail,
  FileCode,
  Tag,
  AlertOctagon,
  Clock,
  Wand2,
} from 'lucide-react';
import { EmailRecord } from '../types';
import { useTheme } from '../context/ThemeContext';

interface DiagnosticModalProps {
  record: EmailRecord | null;
  onClose: () => void;
  onFixTypo: (record: EmailRecord) => void;
}

export const DiagnosticModal: React.FC<DiagnosticModalProps> = ({
  record,
  onClose,
  onFixTypo,
}) => {
  const { isDark, themeConfig } = useTheme();

  if (!record) return null;

  const res = record.verification;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className={`rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border animate-in fade-in zoom-in-95 duration-150 ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`px-4 sm:px-6 py-3.5 sm:py-4 border-b flex items-center justify-between ${
            isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-50/90 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: themeConfig.accentColor }}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm">
                Email Diagnostics & DNS Verification Report
              </h3>
              <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Row #{record.rowIndex}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Target Email & Status Card */}
          <div
            className={`p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
              isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200/90'
            }`}
          >
            <div>
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Tested Target Email
              </span>
              <div className="font-mono text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400 mt-0.5 break-all">
                {record.currentEmail}
              </div>
              {record.originalEmail !== record.currentEmail && (
                <p className="text-xs text-slate-400 line-through mt-0.5 font-mono">
                  Originally: {record.originalEmail}
                </p>
              )}
            </div>

            {res && (
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                    res.status === 'valid'
                      ? isDark
                        ? 'bg-emerald-950/90 text-emerald-300 border-emerald-800'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : res.status === 'risky'
                      ? isDark
                        ? 'bg-amber-950/90 text-amber-300 border-amber-800'
                        : 'bg-amber-50 text-amber-700 border-amber-300'
                      : isDark
                      ? 'bg-rose-950/90 text-rose-300 border-rose-800'
                      : 'bg-rose-50 text-rose-700 border-rose-300'
                  }`}
                >
                  {res.status === 'valid' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  {res.status === 'risky' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                  {res.status === 'invalid' && <XCircle className="w-4 h-4 text-rose-500" />}
                  <span className="capitalize">{res.status}</span>
                  <span className="font-mono">({res.deliverabilityScore}%)</span>
                </span>
              </div>
            )}
          </div>

          {/* Typo Correction Prompt */}
          {res?.typoSuggestion && !record.typoFixed && (
            <div
              className={`p-3 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDark
                  ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                  : 'bg-amber-50/80 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Wand2 className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold">Recommended Typo Correction</h4>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                    Domain appears misspelled. Replace with <strong className="font-mono font-bold text-amber-900 dark:text-amber-200">{res.typoSuggestion}</strong>?
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  onFixTypo(record);
                  onClose();
                }}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs shrink-0 min-h-[38px]"
              >
                Apply Correction
              </button>
            </div>
          )}

          {/* Technical Diagnostics */}
          {res ? (
            <>
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
                  <Server className="w-3.5 h-3.5 text-blue-500" />
                  <span>Technical Verification Attributes</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs">
                  <div className={`p-3 rounded-lg border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-slate-400 block text-[11px]">RFC Syntax Check</span>
                    <span className={`font-bold mt-1 inline-flex items-center gap-1 ${res.syntaxValid ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {res.syntaxValid ? 'Passed' : 'Failed'}
                    </span>
                  </div>

                  <div className={`p-3 rounded-lg border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-slate-400 block text-[11px]">Domain MX Server</span>
                    <span className={`font-bold mt-1 inline-flex items-center gap-1 ${res.hasMxRecords ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {res.hasMxRecords ? 'Active Records' : 'No MX Found'}
                    </span>
                  </div>

                  <div className={`p-3 rounded-lg border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-slate-400 block text-[11px]">Disposable / Burner</span>
                    <span className={`font-bold mt-1 inline-flex items-center gap-1 ${res.isDisposable ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {res.isDisposable ? 'Disposable' : 'Legitimate'}
                    </span>
                  </div>

                  <div className={`p-3 rounded-lg border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-slate-400 block text-[11px]">Role / Generic Account</span>
                    <span className={`font-bold mt-1 ${res.isRoleBased ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {res.isRoleBased ? 'Role Based' : 'Personal / Direct'}
                    </span>
                  </div>

                  <div className={`p-3 rounded-lg border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-slate-400 block text-[11px]">Free Webmail Provider</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 mt-1 block">
                      {res.isFreeMail ? 'Free Provider' : 'Corporate / Custom'}
                    </span>
                  </div>

                  <div className={`p-3 rounded-lg border ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-slate-400 block text-[11px]">Identified Provider</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-1 block truncate">
                      {res.provider}
                    </span>
                  </div>
                </div>
              </div>

              {/* Resolved MX Host Records */}
              {res.mxRecords && res.mxRecords.length > 0 && (
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
                    <Server className="w-3.5 h-3.5 text-slate-400" />
                    <span>Resolved DNS MX Server Entries</span>
                  </h4>
                  <div className="bg-slate-950 text-slate-100 rounded-lg p-3 text-xs font-mono overflow-x-auto space-y-1 shadow-inner border border-slate-800">
                    {res.mxRecords.map((mx, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4">
                        <span className="text-slate-300 font-medium">{mx.exchange}</span>
                        <span className="text-blue-400 font-semibold">Priority: {mx.priority}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm">
              <Clock className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p>This row has not been verified yet.</p>
            </div>
          )}

          {/* Original Row Data from Excel */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
              <FileCode className="w-3.5 h-3.5 text-slate-400" />
              <span>Original Excel Spreadsheet Data</span>
            </h4>
            <div className={`border rounded-lg p-3 text-xs space-y-1.5 ${isDark ? 'bg-slate-800/60 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200/90 text-slate-800'}`}>
              {Object.entries(record.rawData).map(([key, val]) => (
                <div key={key} className={`flex items-baseline justify-between border-b pb-1 last:border-0 last:pb-0 ${isDark ? 'border-slate-700/60' : 'border-slate-200/50'}`}>
                  <span className="font-semibold text-slate-500 dark:text-slate-400">{key}:</span>
                  <span className="font-mono text-right truncate max-w-[240px] sm:max-w-md">{String(val || '')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`px-4 sm:px-6 py-3.5 border-t flex justify-end ${isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-50/90 border-slate-200'}`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer min-h-[38px] ${
              isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
