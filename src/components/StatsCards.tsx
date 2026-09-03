import React from 'react';
import { Mail, CheckCircle2, AlertTriangle, XCircle, Gauge, Sparkles } from 'lucide-react';
import { VerificationSummary } from '../types';

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
  const validPercentage = summary.total > 0 ? Math.round((summary.valid / summary.total) * 100) : 0;
  const riskyPercentage = summary.total > 0 ? Math.round((summary.risky / summary.total) * 100) : 0;
  const invalidPercentage = summary.total > 0 ? Math.round((summary.invalid / summary.total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
      {/* Total Scanned */}
      <button
        type="button"
        onClick={() => onFilterByStatus('all')}
        id="stat-card-total"
        className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
          activeStatus === 'all'
            ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
            : 'bg-white text-slate-900 border-slate-200/90 hover:border-slate-300 hover:shadow-xs shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${activeStatus === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
            Total Records
          </span>
          <Mail className={`w-4 h-4 ${activeStatus === 'all' ? 'text-slate-300' : 'text-slate-400'}`} />
        </div>
        <div className="text-2xl font-bold tracking-tight mb-1">{summary.total}</div>
        <p className={`text-[11px] font-medium ${activeStatus === 'all' ? 'text-slate-400' : 'text-slate-500'}`}>
          {summary.untested > 0 ? `${summary.untested} awaiting verification` : '100% processed'}
        </p>
      </button>

      {/* Valid & Active */}
      <button
        type="button"
        onClick={() => onFilterByStatus('valid')}
        id="stat-card-valid"
        className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
          activeStatus === 'valid'
            ? 'bg-emerald-700 text-white border-emerald-700 shadow-md ring-2 ring-emerald-600/20'
            : 'bg-white text-slate-900 border-slate-200/90 hover:border-emerald-300 hover:bg-emerald-50/20 hover:shadow-xs shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${activeStatus === 'valid' ? 'text-emerald-100' : 'text-emerald-700'}`}>
            Valid & Deliverable
          </span>
          <CheckCircle2 className={`w-4 h-4 ${activeStatus === 'valid' ? 'text-emerald-100' : 'text-emerald-600'}`} />
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-bold tracking-tight">{summary.valid}</span>
          <span className={`text-xs font-bold ${activeStatus === 'valid' ? 'text-emerald-200' : 'text-emerald-600'}`}>
            {validPercentage}%
          </span>
        </div>
        <p className={`text-[11px] font-medium ${activeStatus === 'valid' ? 'text-emerald-100' : 'text-slate-500'}`}>
          Active MX verified, high placement
        </p>
      </button>

      {/* Risky */}
      <button
        type="button"
        onClick={() => onFilterByStatus('risky')}
        id="stat-card-risky"
        className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
          activeStatus === 'risky'
            ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-500/20'
            : 'bg-white text-slate-900 border-slate-200/90 hover:border-amber-300 hover:bg-amber-50/20 hover:shadow-xs shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${activeStatus === 'risky' ? 'text-amber-100' : 'text-amber-700'}`}>
            Risky / Attention
          </span>
          <AlertTriangle className={`w-4 h-4 ${activeStatus === 'risky' ? 'text-amber-100' : 'text-amber-600'}`} />
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-bold tracking-tight">{summary.risky}</span>
          <span className={`text-xs font-bold ${activeStatus === 'risky' ? 'text-amber-200' : 'text-amber-600'}`}>
            {riskyPercentage}%
          </span>
        </div>
        <p className={`text-[11px] font-medium ${activeStatus === 'risky' ? 'text-amber-100' : 'text-slate-500'}`}>
          Role accounts & typos ({summary.typoCount} fixable)
        </p>
      </button>

      {/* Invalid */}
      <button
        type="button"
        onClick={() => onFilterByStatus('invalid')}
        id="stat-card-invalid"
        className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
          activeStatus === 'invalid'
            ? 'bg-rose-700 text-white border-rose-700 shadow-md ring-2 ring-rose-600/20'
            : 'bg-white text-slate-900 border-slate-200/90 hover:border-rose-300 hover:bg-rose-50/20 hover:shadow-xs shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${activeStatus === 'invalid' ? 'text-rose-100' : 'text-rose-700'}`}>
            Invalid / Bounces
          </span>
          <XCircle className={`w-4 h-4 ${activeStatus === 'invalid' ? 'text-rose-100' : 'text-rose-600'}`} />
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-bold tracking-tight">{summary.invalid}</span>
          <span className={`text-xs font-bold ${activeStatus === 'invalid' ? 'text-rose-200' : 'text-rose-600'}`}>
            {invalidPercentage}%
          </span>
        </div>
        <p className={`text-[11px] font-medium ${activeStatus === 'invalid' ? 'text-rose-100' : 'text-slate-500'}`}>
          {summary.disposableCount} disposable, {summary.invalid - summary.disposableCount} dead/syntax
        </p>
      </button>

      {/* Deliverability Quality Score */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 text-slate-900 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            List Health Score
          </span>
          <Gauge className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-bold tracking-tight text-slate-900">{summary.avgScore}%</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-md font-bold ${
              summary.avgScore >= 80
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : summary.avgScore >= 50
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {summary.avgScore >= 80 ? 'Healthy' : summary.avgScore >= 50 ? 'Moderate' : 'Low Quality'}
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1">
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
