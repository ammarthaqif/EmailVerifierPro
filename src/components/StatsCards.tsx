import React from 'react';
import { Mail, CheckCircle2, AlertTriangle, XCircle, Gauge } from 'lucide-react';
import { VerificationSummary } from '../types';
import { useTheme } from '../context/ThemeContext';

interface StatsCardsProps {
  summary: VerificationSummary;
  onFilterByStatus: (status: 'all' | 'valid' | 'risky' | 'invalid') => void;
  activeStatus: string;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  summary,
  onFilterByStatus,
  activeStatus,
}) => {
  const { isDark, themeConfig } = useTheme();

  const validPercentage = summary.total > 0 ? Math.round((summary.valid / summary.total) * 100) : 0;
  const riskyPercentage = summary.total > 0 ? Math.round((summary.risky / summary.total) * 100) : 0;
  const invalidPercentage = summary.total > 0 ? Math.round((summary.invalid / summary.total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3.5 mb-5 sm:mb-6">
      {/* Total Scanned */}
      <button
        type="button"
        onClick={() => onFilterByStatus('all')}
        id="stat-card-total"
        className={`text-left p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer min-h-[90px] ${
          activeStatus === 'all'
            ? isDark
              ? 'bg-slate-800 text-white border-blue-500 shadow-md ring-2 ring-blue-500/30'
              : 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
            : isDark
            ? 'bg-slate-900/90 text-slate-100 border-slate-800 hover:border-slate-700 shadow-xs'
            : 'bg-white text-slate-900 border-slate-200/90 hover:border-slate-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <span
            className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${
              activeStatus === 'all'
                ? isDark
                  ? 'text-blue-300'
                  : 'text-slate-300'
                : isDark
                ? 'text-slate-400'
                : 'text-slate-500'
            }`}
          >
            Total Records
          </span>
          <Mail
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              activeStatus === 'all'
                ? isDark
                  ? 'text-blue-300'
                  : 'text-slate-300'
                : isDark
                ? 'text-slate-400'
                : 'text-slate-400'
            }`}
          />
        </div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight mb-0.5 sm:mb-1">
          {summary.total}
        </div>
        <p
          className={`text-[10px] sm:text-[11px] font-medium truncate ${
            activeStatus === 'all'
              ? isDark
                ? 'text-blue-200'
                : 'text-slate-400'
              : isDark
              ? 'text-slate-400'
              : 'text-slate-500'
          }`}
        >
          {summary.untested > 0 ? `${summary.untested} awaiting test` : '100% processed'}
        </p>
      </button>

      {/* Valid & Active */}
      <button
        type="button"
        onClick={() => onFilterByStatus('valid')}
        id="stat-card-valid"
        className={`text-left p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer min-h-[90px] ${
          activeStatus === 'valid'
            ? 'bg-emerald-700 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
            : isDark
            ? 'bg-slate-900/90 text-slate-100 border-slate-800 hover:border-emerald-700/60 shadow-xs'
            : 'bg-white text-slate-900 border-slate-200/90 hover:border-emerald-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <span
            className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${
              activeStatus === 'valid'
                ? 'text-emerald-100'
                : isDark
                ? 'text-emerald-400'
                : 'text-emerald-700'
            }`}
          >
            Valid & Safe
          </span>
          <CheckCircle2
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              activeStatus === 'valid'
                ? 'text-emerald-100'
                : isDark
                ? 'text-emerald-400'
                : 'text-emerald-600'
            }`}
          />
        </div>
        <div className="flex items-baseline gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
          <span className="text-xl sm:text-2xl font-bold tracking-tight">{summary.valid}</span>
          <span
            className={`text-xs font-bold ${
              activeStatus === 'valid'
                ? 'text-emerald-200'
                : isDark
                ? 'text-emerald-400'
                : 'text-emerald-600'
            }`}
          >
            {validPercentage}%
          </span>
        </div>
        <p
          className={`text-[10px] sm:text-[11px] font-medium truncate ${
            activeStatus === 'valid'
              ? 'text-emerald-100'
              : isDark
              ? 'text-slate-400'
              : 'text-slate-500'
          }`}
        >
          Active MX verified
        </p>
      </button>

      {/* Risky */}
      <button
        type="button"
        onClick={() => onFilterByStatus('risky')}
        id="stat-card-risky"
        className={`text-left p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer min-h-[90px] ${
          activeStatus === 'risky'
            ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-500/20'
            : isDark
            ? 'bg-slate-900/90 text-slate-100 border-slate-800 hover:border-amber-700/60 shadow-xs'
            : 'bg-white text-slate-900 border-slate-200/90 hover:border-amber-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <span
            className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${
              activeStatus === 'risky'
                ? 'text-amber-100'
                : isDark
                ? 'text-amber-400'
                : 'text-amber-700'
            }`}
          >
            Risky / Typos
          </span>
          <AlertTriangle
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              activeStatus === 'risky'
                ? 'text-amber-100'
                : isDark
                ? 'text-amber-400'
                : 'text-amber-600'
            }`}
          />
        </div>
        <div className="flex items-baseline gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
          <span className="text-xl sm:text-2xl font-bold tracking-tight">{summary.risky}</span>
          <span
            className={`text-xs font-bold ${
              activeStatus === 'risky'
                ? 'text-amber-200'
                : isDark
                ? 'text-amber-400'
                : 'text-amber-600'
            }`}
          >
            {riskyPercentage}%
          </span>
        </div>
        <p
          className={`text-[10px] sm:text-[11px] font-medium truncate ${
            activeStatus === 'risky'
              ? 'text-amber-100'
              : isDark
              ? 'text-slate-400'
              : 'text-slate-500'
          }`}
        >
          {summary.typoCount} typo fixes available
        </p>
      </button>

      {/* Invalid */}
      <button
        type="button"
        onClick={() => onFilterByStatus('invalid')}
        id="stat-card-invalid"
        className={`text-left p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer min-h-[90px] ${
          activeStatus === 'invalid'
            ? 'bg-rose-700 text-white border-rose-700 shadow-md ring-2 ring-rose-600/20'
            : isDark
            ? 'bg-slate-900/90 text-slate-100 border-slate-800 hover:border-rose-700/60 shadow-xs'
            : 'bg-white text-slate-900 border-slate-200/90 hover:border-rose-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <span
            className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${
              activeStatus === 'invalid'
                ? 'text-rose-100'
                : isDark
                ? 'text-rose-400'
                : 'text-rose-700'
            }`}
          >
            Invalid / Dead
          </span>
          <XCircle
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
              activeStatus === 'invalid'
                ? 'text-rose-100'
                : isDark
                ? 'text-rose-400'
                : 'text-rose-600'
            }`}
          />
        </div>
        <div className="flex items-baseline gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
          <span className="text-xl sm:text-2xl font-bold tracking-tight">{summary.invalid}</span>
          <span
            className={`text-xs font-bold ${
              activeStatus === 'invalid'
                ? 'text-rose-200'
                : isDark
                ? 'text-rose-400'
                : 'text-rose-600'
            }`}
          >
            {invalidPercentage}%
          </span>
        </div>
        <p
          className={`text-[10px] sm:text-[11px] font-medium truncate ${
            activeStatus === 'invalid'
              ? 'text-rose-100'
              : isDark
              ? 'text-slate-400'
              : 'text-slate-500'
          }`}
        >
          {summary.disposableCount} burner, {summary.invalid - summary.disposableCount} bounces
        </p>
      </button>

      {/* Deliverability Quality Score (Spans 2 columns on mobile for optical balance) */}
      <div
        className={`col-span-2 sm:col-span-2 lg:col-span-1 p-3.5 sm:p-4 rounded-xl border shadow-xs flex flex-col justify-between ${
          isDark
            ? 'bg-slate-900/90 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200/90 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <span
            className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            List Health Score
          </span>
          <Gauge className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-xl sm:text-2xl font-bold tracking-tight">{summary.avgScore}%</span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${
              summary.avgScore >= 80
                ? isDark
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : summary.avgScore >= 50
                ? isDark
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                : isDark
                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {summary.avgScore >= 80 ? 'Healthy' : summary.avgScore >= 50 ? 'Moderate' : 'Low Quality'}
          </span>
        </div>
        <div
          className={`w-full rounded-full h-1.5 overflow-hidden mt-1 ${
            isDark ? 'bg-slate-800' : 'bg-slate-100'
          }`}
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              summary.avgScore >= 80
                ? 'bg-emerald-500'
                : summary.avgScore >= 50
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
            style={{ width: `${summary.avgScore}%` }}
          />
        </div>
      </div>
    </div>
  );
};
