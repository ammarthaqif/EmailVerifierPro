import React from 'react';
import { Mail, CheckCircle2, AlertTriangle, XCircle, Gauge, Smartphone, PhoneCall, PhoneOff, Phone, Send, Check, MessageSquare } from 'lucide-react';
import { VerificationSummary, FilterState } from '../types';
import { useTheme } from '../context/ThemeContext';

interface StatsCardsProps {
  summary: VerificationSummary;
  onFilterByStatus: (status: 'all' | 'valid' | 'risky' | 'invalid') => void;
  activeStatus: string;
  onFilterByPhone?: (phoneFilter: 'all' | 'mobile' | 'landline' | 'invalid') => void;
  activePhoneFilter?: string;
  onFilterByOutreach?: (outreachFilter: FilterState['outreachFilter']) => void;
  activeOutreachFilter?: string;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  summary,
  onFilterByStatus,
  activeStatus,
  onFilterByPhone,
  activePhoneFilter,
  onFilterByOutreach,
  activeOutreachFilter,
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

      {/* Telephony Intelligence & Classification Bar */}
      {Boolean(summary.hasPhoneCount && summary.hasPhoneCount > 0) && (
        <div
          className={`col-span-2 sm:col-span-2 lg:col-span-5 px-3.5 py-2.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
            isDark
              ? 'bg-slate-900/60 border-slate-800/80 text-slate-300'
              : 'bg-slate-50/80 border-slate-200/80 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`p-1 rounded-md ${
                isDark ? 'bg-blue-950/70 text-blue-400' : 'bg-blue-100 text-blue-700'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
            </span>
            <span className="font-semibold text-xs">
              Telephony Breakdown ({summary.hasPhoneCount} numbers detected):
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onFilterByPhone ? (
              <>
                <button
                  type="button"
                  onClick={() => onFilterByPhone('mobile')}
                  id="stat-phone-mobile"
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    activePhoneFilter === 'mobile'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isDark
                      ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-900/50 hover:bg-emerald-900/50'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100/70'
                  }`}
                  title="Filter to mobile phones"
                >
                  <Smartphone className="w-3 h-3 text-emerald-500" />
                  <span>
                    <strong>{summary.mobilePhoneCount || 0}</strong> Mobile (WhatsApp Ready)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onFilterByPhone('landline')}
                  id="stat-phone-landline"
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    activePhoneFilter === 'landline'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : isDark
                      ? 'bg-amber-950/40 text-amber-300 border border-amber-900/50 hover:bg-amber-900/50'
                      : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100/70'
                  }`}
                  title="Filter to landline fixed lines"
                >
                  <PhoneCall className="w-3 h-3 text-amber-500" />
                  <span>
                    <strong>{summary.landlinePhoneCount || 0}</strong> Landline (Office Voice)
                  </span>
                </button>

                {Boolean(summary.invalidPhoneCount && summary.invalidPhoneCount > 0) && (
                  <button
                    type="button"
                    onClick={() => onFilterByPhone('invalid')}
                    id="stat-phone-invalid"
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      activePhoneFilter === 'invalid'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : isDark
                        ? 'bg-rose-950/40 text-rose-300 border border-rose-900/50 hover:bg-rose-900/50'
                        : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100/70'
                    }`}
                    title="Filter to invalid telephone numbers"
                  >
                    <PhoneOff className="w-3 h-3 text-rose-500" />
                    <span>
                      <strong>{summary.invalidPhoneCount}</strong> Invalid Numbers
                    </span>
                  </button>
                )}
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                  <Smartphone className="w-3 h-3" />
                  {summary.mobilePhoneCount || 0} Mobile
                </span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                  <PhoneCall className="w-3 h-3" />
                  {summary.landlinePhoneCount || 0} Landline
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Outreach & Contact Status Tracker Bar */}
      <div
        className={`col-span-2 sm:col-span-2 lg:col-span-5 px-3.5 py-2.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
          isDark
            ? 'bg-slate-900/60 border-slate-800/80 text-slate-300'
            : 'bg-slate-50/80 border-slate-200/80 text-slate-700'
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`p-1 rounded-md ${
              isDark ? 'bg-emerald-950/70 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </span>
          <span className="font-semibold text-xs">
            Outreach Progress ({(summary.contactedCount || 0)} of {summary.total} contacted):
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onFilterByOutreach ? (
            <>
              <button
                type="button"
                onClick={() =>
                  onFilterByOutreach(activeOutreachFilter === 'whatsapp_sent' ? 'all' : 'whatsapp_sent')
                }
                id="stat-outreach-whatsapp"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  activeOutreachFilter === 'whatsapp_sent'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : isDark
                    ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-900/50 hover:bg-emerald-900/50'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100/70'
                }`}
                title="Filter records contacted via WhatsApp"
              >
                <MessageSquare className="w-3 h-3 text-emerald-500" />
                <span>
                  <strong>{summary.whatsappSentCount || 0}</strong> WhatsApp Sent
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onFilterByOutreach(activeOutreachFilter === 'email_sent' ? 'all' : 'email_sent')
                }
                id="stat-outreach-email"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  activeOutreachFilter === 'email_sent'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isDark
                    ? 'bg-blue-950/40 text-blue-300 border border-blue-900/50 hover:bg-blue-900/50'
                    : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100/70'
                }`}
                title="Filter records contacted via Email"
              >
                <Mail className="w-3 h-3 text-blue-500" />
                <span>
                  <strong>{summary.emailSentCount || 0}</strong> Email Sent
                </span>
              </button>

              {Boolean(summary.bothContactedCount && summary.bothContactedCount > 0) && (
                <button
                  type="button"
                  onClick={() =>
                    onFilterByOutreach(activeOutreachFilter === 'both_sent' ? 'all' : 'both_sent')
                  }
                  id="stat-outreach-both"
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    activeOutreachFilter === 'both_sent'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : isDark
                      ? 'bg-purple-950/40 text-purple-300 border border-purple-900/50 hover:bg-purple-900/50'
                      : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100/70'
                  }`}
                  title="Filter records contacted via both WhatsApp and Email"
                >
                  <Check className="w-3 h-3 text-purple-500" />
                  <span>
                    <strong>{summary.bothContactedCount}</strong> WhatsApp & Email
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  onFilterByOutreach(activeOutreachFilter === 'not_contacted' ? 'all' : 'not_contacted')
                }
                id="stat-outreach-pending"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  activeOutreachFilter === 'not_contacted'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : isDark
                    ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-750'
                    : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                }`}
                title="Filter uncontacted companies / records"
              >
                <span>
                  <strong>{summary.notContactedCount ?? (summary.total - (summary.contactedCount || 0))}</strong> Pending
                </span>
              </button>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                <MessageSquare className="w-3 h-3" />
                {summary.whatsappSentCount || 0} WhatsApp
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 text-blue-600 font-medium">
                <Mail className="w-3 h-3" />
                {summary.emailSentCount || 0} Email
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
