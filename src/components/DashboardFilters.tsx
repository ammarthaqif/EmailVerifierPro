import React from 'react';
import { Search, Filter, Wand2, Download, CheckSquare, Square, RefreshCw, X } from 'lucide-react';
import { FilterState, VerificationSummary } from '../types';

interface DashboardFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  summary: VerificationSummary;
  onOpenExportModal: () => void;
  onFixAllTypos: () => void;
  onVerifyBatch: () => void;
  isVerifying: boolean;
  selectedCount: number;
  totalFilteredCount: number;
  onToggleSelectAllFiltered: () => void;
  allFilteredSelected: boolean;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filters,
  onFilterChange,
  summary,
  onOpenExportModal,
  onFixAllTypos,
  onVerifyBatch,
  isVerifying,
  selectedCount,
  totalFilteredCount,
  onToggleSelectAllFiltered,
  allFilteredSelected,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 mb-4">
      {/* Top Action Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            id="filter-search-input"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search email, domain, reason, or name..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white text-slate-900 placeholder:text-slate-400"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Global Batch Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {summary.untested > 0 && (
            <button
              onClick={onVerifyBatch}
              disabled={isVerifying}
              id="btn-verify-remaining"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? 'Verifying...' : `Verify ${summary.untested} Remaining`}</span>
            </button>
          )}

          {summary.typoCount > 0 && (
            <button
              onClick={onFixAllTypos}
              id="btn-fix-all-typos"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100/90 text-amber-900 border border-amber-300/90 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
              title="Automatically fix common domain typos (e.g. gmial.com -> gmail.com)"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Fix {summary.typoCount} Typos</span>
            </button>
          )}

          <button
            onClick={onOpenExportModal}
            id="btn-export-clean-data"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Clean Data</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Sub-controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => onFilterChange({ status: 'all' })}
            id="filter-tab-all"
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filters.status === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({summary.total})
          </button>
          <button
            onClick={() => onFilterChange({ status: 'valid' })}
            id="filter-tab-valid"
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filters.status === 'valid'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Valid ({summary.valid})
          </button>
          <button
            onClick={() => onFilterChange({ status: 'risky' })}
            id="filter-tab-risky"
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filters.status === 'risky'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            Risky ({summary.risky})
          </button>
          <button
            onClick={() => onFilterChange({ status: 'invalid' })}
            id="filter-tab-invalid"
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              filters.status === 'invalid'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            Invalid ({summary.invalid})
          </button>
          {summary.typoCount > 0 && (
            <button
              onClick={() => onFilterChange({ status: 'hasTypo' })}
              id="filter-tab-typos"
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filters.status === 'hasTypo'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
            >
              Has Typo ({summary.typoCount})
            </button>
          )}
        </div>

        {/* Selection & Provider Info */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <button
            onClick={onToggleSelectAllFiltered}
            id="btn-select-all-filtered"
            className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-semibold cursor-pointer"
          >
            {allFilteredSelected ? (
              <CheckSquare className="w-4 h-4 text-blue-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>
              {selectedCount > 0
                ? `${selectedCount} selected`
                : `Select all (${totalFilteredCount})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
