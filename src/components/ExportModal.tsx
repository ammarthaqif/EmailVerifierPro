import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileText, CheckCircle2, ShieldCheck, Sparkles, Filter } from 'lucide-react';
import { ExportOptions } from '../utils/excelHelper';
import { VerificationSummary } from '../types';

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100/90 text-emerald-700 flex items-center justify-center shadow-xs">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Export Clean Dataset</h3>
              <p className="text-xs text-slate-500 font-medium">Source: {fileName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* File Format Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Choose File Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormat('xlsx')}
                id="btn-export-format-xlsx"
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  format === 'xlsx'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-600 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/50'
                }`}
              >
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <span className="text-xs">Excel (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('csv')}
                id="btn-export-format-csv"
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  format === 'csv'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-600 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/50'
                }`}
              >
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="text-xs">CSV (.csv)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('json')}
                id="btn-export-format-json"
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  format === 'json'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-600 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/50'
                }`}
              >
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="text-xs">JSON (.json)</span>
              </button>
            </div>
          </div>

          {/* Dataset Scope */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              2. Cleanliness Scope
            </label>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/80 cursor-pointer transition-colors shadow-2xs">
                <input
                  type="radio"
                  name="scope"
                  checked={scope === 'valid_only'}
                  onChange={() => setScope('valid_only')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Valid & Deliverable Only ({summary.valid} records)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Highest deliverability list. Excludes all bounces, disposable traps, and syntax errors.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/80 cursor-pointer transition-colors shadow-2xs">
                <input
                  type="radio"
                  name="scope"
                  checked={scope === 'valid_and_risky'}
                  onChange={() => setScope('valid_and_risky')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Valid + Low Risk ({summary.valid + summary.risky} records)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Includes valid emails plus corporate role-based accounts (info@, support@).
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/80 cursor-pointer transition-colors shadow-2xs">
                <input
                  type="radio"
                  name="scope"
                  checked={scope === 'filtered_view'}
                  onChange={() => setScope('filtered_view')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Current Active Filtered View ({filteredCount} records)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Exports exactly what is currently filtered and visible on your dashboard.
                  </span>
                </div>
              </label>

              {selectedCount > 0 && (
                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/80 cursor-pointer transition-colors shadow-2xs">
                  <input
                    type="radio"
                    name="scope"
                    checked={scope === 'selected_only'}
                    onChange={() => setScope('selected_only')}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Manually Selected Rows Only ({selectedCount} records)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Exports only the specific rows you checked in the table.
                    </span>
                  </div>
                </label>
              )}

              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/80 cursor-pointer transition-colors shadow-2xs">
                <input
                  type="radio"
                  name="scope"
                  checked={scope === 'all_with_diagnostics'}
                  onChange={() => setScope('all_with_diagnostics')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Full Dataset with Audit Columns ({summary.total} records)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Keeps all uploaded rows, appending Deliverability Score, MX Status, and Reason columns.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Additional Options */}
          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
            <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={includeVerificationColumns}
                onChange={(e) => setIncludeVerificationColumns(e.target.checked)}
                className="rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>Append Verification Columns (Status, Score, Provider, Reason)</span>
            </label>

            {summary.typoCount > 0 && (
              <label className="flex items-center gap-2 text-amber-900 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyTypoFixes}
                  onChange={(e) => setApplyTypoFixes(e.target.checked)}
                  className="rounded-sm border-amber-400 text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <span>Automatically replace detected domain typos with corrected versions</span>
              </label>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/90 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            id="btn-confirm-export"
            onClick={handleExportClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Clean {format.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
