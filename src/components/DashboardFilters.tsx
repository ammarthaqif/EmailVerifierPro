import React from 'react';
import {
  Search,
  Filter,
  Wand2,
  Download,
  CheckSquare,
  Square,
  RefreshCw,
  X,
  LayoutGrid,
  Table as TableIcon,
} from 'lucide-react';
import { FilterState, VerificationSummary } from '../types';
import { useTheme } from '../context/ThemeContext';

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
  viewMode?: 'table' | 'cards';
  onViewModeChange?: (mode: 'table' | 'cards') => void;
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
  viewMode = 'table',
  onViewModeChange,
}) => {
  const { isDark, themeConfig } = useTheme();

  return (
    <div
      className={`rounded-xl border shadow-xs p-3 sm:p-4 mb-4 transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90'
      }`}
    >
      {/* Top Action Bar */}
      <div
        className={`flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pb-3 sm:pb-4 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}
      >
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
            className={`w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[40px] ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-500'
                : 'bg-slate-50/70 border-slate-200 text-slate-900 placeholder:text-slate-400'
            }`}
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer min-h-[40px]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Global Batch Controls & View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Switcher (Table vs Mobile Cards) */}
          {onViewModeChange && (
            <div
              className={`flex items-center p-0.5 rounded-lg border ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() => onViewModeChange('table')}
                id="btn-view-table"
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[34px] ${
                  viewMode === 'table'
                    ? isDark
                      ? 'bg-slate-700 text-white shadow-2xs'
                      : 'bg-white text-slate-800 shadow-2xs'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('cards')}
                id="btn-view-cards"
                className={`p-1.5 sm:px-2.5 sm:py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[34px] ${
                  viewMode === 'cards'
                    ? isDark
                      ? 'bg-slate-700 text-white shadow-2xs'
                      : 'bg-white text-slate-800 shadow-2xs'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Cards View (Optimized for Mobile)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>
          )}

          {summary.untested > 0 && (
            <button
              onClick={onVerifyBatch}
              disabled={isVerifying}
              id="btn-verify-remaining"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50 cursor-pointer min-h-[38px]"
              style={{ backgroundColor: themeConfig.accentColor }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? 'Verifying...' : `Verify ${summary.untested} Untested`}</span>
            </button>
          )}

          {summary.typoCount > 0 && (
            <button
              onClick={onFixAllTypos}
              id="btn-fix-all-typos"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer min-h-[38px]"
              title="Batch auto-correct suspected domain typos like gmial.com to gmail.com"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Auto-Fix {summary.typoCount} Typos</span>
            </button>
          )}

          <button
            onClick={onOpenExportModal}
            id="btn-open-export"
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer min-h-[38px] ${
              isDark
                ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Clean Data</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Selection bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => onFilterChange({ status: 'all' })}
            id="filter-tab-all"
            className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap min-h-[32px] ${
              filters.status === 'all'
                ? isDark
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'bg-slate-900 text-white shadow-xs'
                : isDark
                ? 'text-slate-400 hover:bg-slate-800'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({summary.total})
          </button>
          <button
            onClick={() => onFilterChange({ status: 'valid' })}
            id="filter-tab-valid"
            className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap min-h-[32px] ${
              filters.status === 'valid'
                ? 'bg-emerald-600 text-white shadow-xs'
                : isDark
                ? 'text-emerald-400 hover:bg-emerald-950/40'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Valid ({summary.valid})
          </button>
          <button
            onClick={() => onFilterChange({ status: 'risky' })}
            id="filter-tab-risky"
            className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap min-h-[32px] ${
              filters.status === 'risky'
                ? 'bg-amber-600 text-white shadow-xs'
                : isDark
                ? 'text-amber-400 hover:bg-amber-950/40'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            Risky ({summary.risky})
          </button>
          <button
            onClick={() => onFilterChange({ status: 'invalid' })}
            id="filter-tab-invalid"
            className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap min-h-[32px] ${
              filters.status === 'invalid'
                ? 'bg-rose-600 text-white shadow-xs'
                : isDark
                ? 'text-rose-400 hover:bg-rose-950/40'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            Invalid ({summary.invalid})
          </button>
          {summary.typoCount > 0 && (
            <button
              onClick={() => onFilterChange({ status: 'hasTypo' })}
              id="filter-tab-typos"
              className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap min-h-[32px] ${
                filters.status === 'hasTypo'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : isDark
                  ? 'text-purple-400 hover:bg-purple-950/40'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
            >
              Has Typo ({summary.typoCount})
            </button>
          )}
        </div>

        {/* Selection & Provider Info */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
          <button
            onClick={onToggleSelectAllFiltered}
            id="btn-select-all-filtered"
            className={`inline-flex items-center gap-1.5 font-semibold cursor-pointer min-h-[34px] ${
              isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            {allFilteredSelected ? (
              <CheckSquare className="w-4 h-4 text-blue-500" />
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
