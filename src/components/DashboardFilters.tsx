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
  Smartphone,
  PhoneCall,
  PhoneOff,
  Phone,
  Send,
  Mail,
  MessageSquare,
  Check,
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
  onBatchMarkContacted?: (channel: 'whatsapp' | 'email' | 'both', status: boolean) => void;
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
  onBatchMarkContacted,
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

        {/* Selection & Batch Contacted Controls */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 text-xs">
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

          {selectedCount > 0 && onBatchMarkContacted && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => onBatchMarkContacted('whatsapp', true)}
                id="btn-batch-mark-whatsapp"
                title="Mark selected contacts/companies as contacted via WhatsApp"
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold text-xs transition-colors cursor-pointer min-h-[30px] ${
                  isDark
                    ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                <MessageSquare className="w-3 h-3 text-emerald-600" />
                <span>Mark WhatsApp ({selectedCount})</span>
              </button>

              <button
                type="button"
                onClick={() => onBatchMarkContacted('email', true)}
                id="btn-batch-mark-email"
                title="Mark selected contacts/companies as contacted via Email"
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold text-xs transition-colors cursor-pointer min-h-[30px] ${
                  isDark
                    ? 'bg-blue-950/70 text-blue-300 border border-blue-800 hover:bg-blue-900'
                    : 'bg-blue-50 text-blue-800 border border-blue-300 hover:bg-blue-100'
                }`}
              >
                <Mail className="w-3 h-3 text-blue-600" />
                <span>Mark Email ({selectedCount})</span>
              </button>

              <button
                type="button"
                onClick={() => onBatchMarkContacted('both', false)}
                id="btn-batch-clear-contacted"
                title="Clear contacted status for selected"
                className={`p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded text-xs cursor-pointer min-h-[30px]`}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Phone Line Classification Filter Pills (Mobile vs Landline) */}
      <div
        className={`flex flex-wrap items-center gap-2 pt-2.5 mt-2.5 border-t text-xs ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}
      >
        <span
          className={`font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          <Phone className="w-3 h-3 text-blue-500" />
          <span>Telephony:</span>
        </span>

        <button
          type="button"
          onClick={() => onFilterChange({ phoneFilter: 'all' })}
          id="filter-phone-all"
          className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer text-xs ${
            !filters.phoneFilter || filters.phoneFilter === 'all'
              ? isDark
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
              : isDark
              ? 'text-slate-400 hover:bg-slate-800'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Phone Types
        </button>

        <button
          type="button"
          onClick={() => onFilterChange({ phoneFilter: 'mobile' })}
          id="filter-phone-mobile"
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-medium transition-colors cursor-pointer text-xs ${
            filters.phoneFilter === 'mobile'
              ? isDark
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold'
              : isDark
              ? 'text-emerald-400/90 hover:bg-slate-800'
              : 'text-emerald-700 hover:bg-emerald-50/60'
          }`}
          title="Filter only mobile numbers (WhatsApp outreach eligible)"
        >
          <Smartphone className="w-3 h-3 text-emerald-500" />
          <span>Mobile ({summary.mobilePhoneCount || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => onFilterChange({ phoneFilter: 'landline' })}
          id="filter-phone-landline"
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-medium transition-colors cursor-pointer text-xs ${
            filters.phoneFilter === 'landline'
              ? isDark
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                : 'bg-amber-50 text-amber-800 border border-amber-300 font-semibold'
              : isDark
              ? 'text-amber-400/90 hover:bg-slate-800'
              : 'text-amber-700 hover:bg-amber-50/60'
          }`}
          title="Filter fixed-line office & commercial landlines (Requires voice call, non-WhatsApp direct)"
        >
          <PhoneCall className="w-3 h-3 text-amber-500" />
          <span>Landline ({summary.landlinePhoneCount || 0})</span>
        </button>

        {Boolean(summary.invalidPhoneCount && summary.invalidPhoneCount > 0) && (
          <button
            type="button"
            onClick={() => onFilterChange({ phoneFilter: 'invalid' })}
            id="filter-phone-invalid"
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-medium transition-colors cursor-pointer text-xs ${
              filters.phoneFilter === 'invalid'
                ? isDark
                  ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                  : 'bg-rose-50 text-rose-800 border border-rose-300 font-semibold'
                : isDark
                ? 'text-rose-400/90 hover:bg-slate-800'
                : 'text-rose-700 hover:bg-rose-50/60'
            }`}
            title="Filter invalid or malformed telephone numbers"
          >
            <PhoneOff className="w-3 h-3 text-rose-500" />
            <span>Invalid Phone ({summary.invalidPhoneCount})</span>
          </button>
        )}
      </div>

      {/* Outreach & Contact Status Filter Pills */}
      <div
        className={`flex flex-wrap items-center gap-2 pt-2.5 mt-2.5 border-t text-xs ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}
      >
        <span
          className={`font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          <Send className="w-3 h-3 text-emerald-500" />
          <span>Outreach Status:</span>
        </span>

        <button
          type="button"
          onClick={() => onFilterChange({ outreachFilter: 'all' })}
          id="filter-outreach-all"
          className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer text-xs ${
            !filters.outreachFilter || filters.outreachFilter === 'all'
              ? isDark
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
              : isDark
              ? 'text-slate-400 hover:bg-slate-800'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All ({summary.total})
        </button>

        <button
          type="button"
          onClick={() => onFilterChange({ outreachFilter: 'contacted_any' })}
          id="filter-outreach-any"
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-medium transition-colors cursor-pointer text-xs ${
            filters.outreachFilter === 'contacted_any'
              ? isDark
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-semibold'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold'
              : isDark
              ? 'text-emerald-400/90 hover:bg-slate-800'
              : 'text-emerald-700 hover:bg-emerald-50/60'
          }`}
          title="Filter contacts/companies that have been contacted via either WhatsApp or Email"
        >
          <Check className="w-3 h-3 text-emerald-500" />
          <span>Any Contacted ({summary.contactedCount || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => onFilterChange({ outreachFilter: 'whatsapp_sent' })}
          id="filter-outreach-whatsapp"
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-medium transition-colors cursor-pointer text-xs ${
            filters.outreachFilter === 'whatsapp_sent'
              ? isDark
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-semibold'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold'
              : isDark
              ? 'text-emerald-400/90 hover:bg-slate-800'
              : 'text-emerald-700 hover:bg-emerald-50/60'
          }`}
          title="Filter contacts/companies contacted via WhatsApp"
        >
          <MessageSquare className="w-3 h-3 text-emerald-500" />
          <span>WhatsApp Sent ({summary.whatsappSentCount || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => onFilterChange({ outreachFilter: 'email_sent' })}
          id="filter-outreach-email"
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-medium transition-colors cursor-pointer text-xs ${
            filters.outreachFilter === 'email_sent'
              ? isDark
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 font-semibold'
                : 'bg-blue-50 text-blue-800 border border-blue-300 font-semibold'
              : isDark
              ? 'text-blue-400/90 hover:bg-slate-800'
              : 'text-blue-700 hover:bg-blue-50/60'
          }`}
          title="Filter contacts/companies contacted via Email"
        >
          <Mail className="w-3 h-3 text-blue-500" />
          <span>Email Sent ({summary.emailSentCount || 0})</span>
        </button>

        {Boolean(summary.bothContactedCount && summary.bothContactedCount > 0) && (
          <button
            type="button"
            onClick={() => onFilterChange({ outreachFilter: 'both_sent' })}
            id="filter-outreach-both"
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-medium transition-colors cursor-pointer text-xs ${
              filters.outreachFilter === 'both_sent'
                ? isDark
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 font-semibold'
                  : 'bg-purple-50 text-purple-800 border border-purple-300 font-semibold'
                : isDark
                ? 'text-purple-400/90 hover:bg-slate-800'
                : 'text-purple-700 hover:bg-purple-50/60'
            }`}
            title="Filter contacts/companies contacted via both WhatsApp and Email"
          >
            <Check className="w-3 h-3 text-purple-500" />
            <span>Both Channels ({summary.bothContactedCount})</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onFilterChange({ outreachFilter: 'not_contacted' })}
          id="filter-outreach-not-contacted"
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-medium transition-colors cursor-pointer text-xs ${
            filters.outreachFilter === 'not_contacted'
              ? isDark
                ? 'bg-slate-700 text-white border border-slate-600 font-semibold'
                : 'bg-slate-200 text-slate-900 border border-slate-300 font-semibold'
              : isDark
              ? 'text-slate-400 hover:bg-slate-800'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
          title="Filter uncontacted companies / records"
        >
          <span>Not Contacted ({summary.notContactedCount ?? (summary.total - (summary.contactedCount || 0))})</span>
        </button>
      </div>
    </div>
  );
};
