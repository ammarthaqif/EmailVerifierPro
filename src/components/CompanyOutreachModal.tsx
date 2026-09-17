import React from 'react';
import {
  X,
  Building2,
  Send,
  Mail,
  MessageSquare,
  Check,
  User,
  ExternalLink,
  Smartphone,
  PhoneCall,
  PhoneOff,
  Phone,
  AlertCircle,
} from 'lucide-react';
import { EmailRecord } from '../types';
import { useTheme } from '../context/ThemeContext';

interface CompanyOutreachModalProps {
  isOpen: boolean;
  companyName: string | null;
  records: EmailRecord[];
  onClose: () => void;
  onMarkCompanyContacted: (
    companyName: string,
    channel: 'whatsapp' | 'email' | 'both',
    status: boolean
  ) => void;
  onToggleWhatsAppSent?: (recordId: string, value?: boolean) => void;
  onToggleEmailSent?: (recordId: string, value?: boolean) => void;
  onSendEmail?: (record: EmailRecord) => void;
  onSendWhatsApp?: (record: EmailRecord) => void;
}

export const CompanyOutreachModal: React.FC<CompanyOutreachModalProps> = ({
  isOpen,
  companyName,
  records,
  onClose,
  onMarkCompanyContacted,
  onToggleWhatsAppSent,
  onToggleEmailSent,
  onSendEmail,
  onSendWhatsApp,
}) => {
  const { isDark, themeConfig } = useTheme();

  if (!isOpen || !companyName) return null;

  const normalizedTarget = companyName.trim().toLowerCase();
  const companyRecords = records.filter(
    (r) => (r.companyName || '').trim().toLowerCase() === normalizedTarget
  );

  const totalContacts = companyRecords.length;
  const whatsappSentCount = companyRecords.filter((r) => r.whatsappSent).length;
  const emailSentCount = companyRecords.filter((r) => r.emailSent).length;
  const allWhatsApp = totalContacts > 0 && whatsappSentCount === totalContacts;
  const allEmail = totalContacts > 0 && emailSentCount === totalContacts;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="company-outreach-title"
    >
      <div
        className={`rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border animate-in fade-in zoom-in-95 duration-150 ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`px-4 sm:px-6 py-4 border-b flex items-center justify-between ${
            isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-50/90 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: themeConfig.accentColor }}
            >
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 id="company-outreach-title" className="font-bold text-sm sm:text-base leading-tight">
                Company Outreach Manager
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                {companyName} ({totalContacts} contact{totalContacts === 1 ? '' : 's'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Progress Status Bar */}
          <div
            className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs ${
              isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="space-y-1">
              <span className="font-bold text-xs block text-slate-400 uppercase tracking-wider">
                Current Company Status:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold ${
                    whatsappSentCount > 0
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp: {whatsappSentCount} / {totalContacts}</span>
                </span>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold ${
                    emailSentCount > 0
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email: {emailSentCount} / {totalContacts}</span>
                </span>
              </div>
            </div>

            {/* Quick Bulk Actions for this company */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => onMarkCompanyContacted(companyName, 'whatsapp', !allWhatsApp)}
                id="btn-modal-mark-company-whatsapp"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer min-h-[34px] ${
                  allWhatsApp
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : isDark
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-900 hover:bg-emerald-900/60'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{allWhatsApp ? 'WhatsApp Marked' : 'Mark WhatsApp'}</span>
                {allWhatsApp && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => onMarkCompanyContacted(companyName, 'email', !allEmail)}
                id="btn-modal-mark-company-email"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer min-h-[34px] ${
                  allEmail
                    ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                    : isDark
                    ? 'bg-blue-950/40 text-blue-300 border-blue-900 hover:bg-blue-900/60'
                    : 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{allEmail ? 'Email Marked' : 'Mark Email'}</span>
                {allEmail && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => onMarkCompanyContacted(companyName, 'both', true)}
                id="btn-modal-mark-company-both"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors cursor-pointer min-h-[34px]"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Both</span>
              </button>

              <button
                type="button"
                onClick={() => onMarkCompanyContacted(companyName, 'both', false)}
                id="btn-modal-clear-company"
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline px-1 cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Company Contacts Roster */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-500" />
              <span>Associated Contacts & Outreach Status ({companyRecords.length})</span>
            </h4>

            <div className="space-y-2">
              {companyRecords.map((rec) => {
                return (
                  <div
                    key={rec.id}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs transition-colors ${
                      isDark ? 'bg-slate-800/40 border-slate-700/80' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="space-y-1 max-w-sm">
                      <div className="flex items-center gap-1.5 font-bold text-sm">
                        <span>{rec.ownerName || 'Unnamed Executive'}</span>
                        {rec.companyName && (
                          <span className="text-slate-400 text-xs font-normal">
                            ({rec.companyName})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-slate-400 text-xs flex-wrap">
                        <span className="text-blue-500 font-mono">{rec.currentEmail}</span>
                        {rec.phoneNumber && (
                          <span className="font-mono text-slate-400">
                            • {rec.phoneValidation?.formatted || rec.phoneNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Channels for this row */}
                    <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                      {/* WhatsApp Channel */}
                      <button
                        type="button"
                        onClick={() =>
                          onToggleWhatsAppSent && onToggleWhatsAppSent(rec.id, !rec.whatsappSent)
                        }
                        id={`btn-toggle-wa-${rec.id}`}
                        title={
                          rec.whatsappSent
                            ? `WhatsApp sent at ${rec.whatsappSentAt || 'recently'}. Click to toggle.`
                            : 'Click to mark WhatsApp sent'
                        }
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer min-h-[32px] ${
                          rec.whatsappSent
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : isDark
                            ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{rec.whatsappSent ? 'WA Sent' : 'Mark WA'}</span>
                        {rec.whatsappSent && <Check className="w-3 h-3" />}
                      </button>

                      {/* Email Channel */}
                      <button
                        type="button"
                        onClick={() =>
                          onToggleEmailSent && onToggleEmailSent(rec.id, !rec.emailSent)
                        }
                        id={`btn-toggle-em-${rec.id}`}
                        title={
                          rec.emailSent
                            ? `Email sent at ${rec.emailSentAt || 'recently'}. Click to toggle.`
                            : 'Click to mark Email sent'
                        }
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer min-h-[32px] ${
                          rec.emailSent
                            ? 'bg-blue-600 text-white border-blue-700'
                            : isDark
                            ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>{rec.emailSent ? 'Email Sent' : 'Mark Email'}</span>
                        {rec.emailSent && <Check className="w-3 h-3" />}
                      </button>

                      {/* Send Email directly */}
                      {onSendEmail && (
                        <button
                          type="button"
                          onClick={() => onSendEmail(rec)}
                          id={`btn-send-email-${rec.id}`}
                          title={`Compose and send email to ${rec.currentEmail}`}
                          className="p-1.5 rounded-lg border border-blue-200 dark:border-blue-800 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-4 sm:px-6 py-3.5 border-t flex items-center justify-between text-xs ${
            isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-50/90 border-slate-200'
          }`}
        >
          <span className="text-slate-400">
            Outreach statuses automatically persist and will be included in your clean Excel export.
          </span>
          <button
            onClick={onClose}
            className={`px-4 py-2 font-bold rounded-lg transition-colors cursor-pointer min-h-[36px] ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
            }`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
