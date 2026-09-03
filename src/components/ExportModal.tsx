import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileText, CheckCircle2, ShieldCheck, Sparkles, Filter } from 'lucide-react';
import { ExportOptions } from '../utils/excelHelper';
import { VerificationSummary } from '../types';
import { useTheme } from '../context/ThemeContext';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  summary: VerificationSummary;
  selectedCount: number;
  filteredCount: number;
  fileName: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  summary,
  selectedCount,
  filteredCount,
  fileName,
}) => {
  const { isDark, themeConfig } = useTheme();
  const [format, setFormat] = useState<'xlsx' | 'csv' | 'json'>('xlsx');
  const [scope, setScope] = useState<ExportOptions['scope']>('valid_only');
  const [includeVerificationColumns, setIncludeVerificationColumns] = useState(true);
  const [applyTypoFixes, setApplyTypoFixes] = useState(true);

  if (!isOpen) return null;

  const handleExportClick = () => {
    onExport({
      format,
      scope,
      includeVerificationColumns,
      applyTypoFixes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className={`rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border animate-in fade-in zoom-in-95 duration-150 transition-colors ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
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
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Export Clean Dataset</h3>
              <p className={`text-xs font-medium truncate max-w-[200px] sm:max-w-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Source: {fileName}
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

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Format Selector */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              File Format
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setFormat('xlsx')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                  format === 'xlsx'
                    ? isDark
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                      : 'border-emerald-500 bg-emerald-50/80 text-emerald-800'
                    : isDark
                    ? 'border-slate-800 bg-slate-800/60 text-slate-400 hover:border-slate-700'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                <span className="text-xs font-bold">Excel (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                  format === 'csv'
                    ? isDark
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                      : 'border-emerald-500 bg-emerald-50/80 text-emerald-800'
                    : isDark
                    ? 'border-slate-800 bg-slate-800/60 text-slate-400 hover:border-slate-700'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <FileText className="w-5 h-5 text-blue-500" />
                <span className="text-xs font-bold">CSV (.csv)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                  format === 'json'
                    ? isDark
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                      : 'border-emerald-500 bg-emerald-50/80 text-emerald-800'
                    : isDark
                    ? 'border-slate-800 bg-slate-800/60 text-slate-400 hover:border-slate-700'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span className="text-xs font-bold">JSON (.json)</span>
              </button>
            </div>
          </div>

          {/* Scope Selector */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Export Target Records
            </label>
            <div className="space-y-2">
              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                  scope === 'valid_only'
                    ? isDark
                      ? 'border-blue-500 bg-blue-950/40'
                      : 'border-blue-500 bg-blue-50/70'
                    : isDark
                    ? 'border-slate-800 hover:bg-slate-800/60'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="scope"
                    checked={scope === 'valid_only'}
                    onChange={() => setScope('valid_only')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-xs font-bold block">100% Deliverable & Safe Only</span>
                    <span className={`text-[11px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Excludes invalid domains and bounced addresses
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-500">
                  {summary.valid} records
                </span>
              </label>

              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                  scope === 'valid_and_risky'
                    ? isDark
                      ? 'border-blue-500 bg-blue-950/40'
                      : 'border-blue-500 bg-blue-50/70'
                    : isDark
                    ? 'border-slate-800 hover:bg-slate-800/60'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="scope"
                    checked={scope === 'valid_and_risky'}
                    onChange={() => setScope('valid_and_risky')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-xs font-bold block">Deliverable + Accept-All (Risky)</span>
                    <span className={`text-[11px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Recommended for B2B catch-all corporate outreach
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-500">
                  {summary.valid + summary.risky} records
                </span>
              </label>

              <label
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                  scope === 'all_with_diagnostics'
                    ? isDark
                      ? 'border-blue-500 bg-blue-950/40'
                      : 'border-blue-500 bg-blue-50/70'
                    : isDark
                    ? 'border-slate-800 hover:bg-slate-800/60'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="scope"
                    checked={scope === 'all_with_diagnostics'}
                    onChange={() => setScope('all_with_diagnostics')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-xs font-bold block">All Processed Records</span>
                    <span className={`text-[11px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Complete spreadsheet with full audit trails
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {summary.total} records
                </span>
              </label>

              {selectedCount > 0 && (
                <label
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                    scope === 'selected_only'
                      ? isDark
                        ? 'border-blue-500 bg-blue-950/40'
                        : 'border-blue-500 bg-blue-50/70'
                      : isDark
                      ? 'border-slate-800 hover:bg-slate-800/60'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="scope"
                      checked={scope === 'selected_only'}
                      onChange={() => setScope('selected_only')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-xs font-bold block">Manually Selected Rows Only</span>
                      <span className={`text-[11px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Only rows with active checkboxes
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-500">
                    {selectedCount} records
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={applyTypoFixes}
                onChange={(e) => setApplyTypoFixes(e.target.checked)}
                className="rounded-xs text-blue-600 focus:ring-blue-500"
              />
              <span className="font-semibold">
                Apply corrected domain names (e.g. gmial.com → gmail.com)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={includeVerificationColumns}
                onChange={(e) => setIncludeVerificationColumns(e.target.checked)}
                className="rounded-xs text-blue-600 focus:ring-blue-500"
              />
              <span className="font-semibold">
                Append verification audit columns (Status, Score, MX Server, Provider, Phone)
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-4 sm:px-6 py-3.5 border-t flex items-center justify-end gap-2.5 ${
            isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-50/90 border-slate-200'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer min-h-[38px] ${
              isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExportClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer min-h-[38px]"
            style={{ backgroundColor: themeConfig.accentColor }}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Clean File</span>
          </button>
        </div>
      </div>
    </div>
  );
};
