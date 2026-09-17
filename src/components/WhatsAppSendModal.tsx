import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Building2,
  User,
  Smartphone,
  MapPin,
  Mail,
  Copy,
  Check,
  PhoneCall,
  PhoneOff,
  AlertTriangle,
  Edit3,
} from 'lucide-react';
import { EmailRecord, ColumnMappings } from '../types';
import {
  interpolateWhatsAppMessage,
  cleanPhoneNumber,
  generateWhatsAppUrl,
} from '../utils/whatsappHelper';
import { useTheme } from '../context/ThemeContext';

interface WhatsAppSendModalProps {
  record: EmailRecord | null;
  isOpen: boolean;
  onClose: () => void;
  templateText: string;
  mappings: ColumnMappings;
  defaultCountryCode: string;
  onMarkSent: (id: string) => void;
}

export const WhatsAppSendModal: React.FC<WhatsAppSendModalProps> = ({
  record,
  isOpen,
  onClose,
  templateText,
  mappings,
  defaultCountryCode,
  onMarkSent,
}) => {
  const { isDark } = useTheme();
  const [editableMessage, setEditableMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (record) {
      const generated = interpolateWhatsAppMessage(templateText, record, mappings);
      setEditableMessage(generated);
    }
  }, [record, templateText, mappings]);

  if (!isOpen || !record) return null;

  const rawPhone =
    record.phoneNumber || (mappings.phoneColumn ? record.rawData[mappings.phoneColumn] : '');
  const phoneInfo = record.phoneValidation
    ? {
        raw: record.phoneValidation.raw,
        formatted: record.phoneValidation.formatted,
        digits: record.phoneValidation.digits,
        isValid: record.phoneValidation.isValid,
        type: record.phoneValidation.type,
        typeLabel: record.phoneValidation.typeLabel,
        countryCode: record.phoneValidation.countryCode,
        countryName: record.phoneValidation.countryName,
        regionOrCity: record.phoneValidation.regionOrCity,
        isWhatsAppEligible: record.phoneValidation.isWhatsAppEligible,
        confidence: record.phoneValidation.confidence,
      }
    : cleanPhoneNumber(rawPhone, defaultCountryCode);

  const ownerName =
    record.ownerName ||
    (mappings.ownerNameColumn ? record.rawData[mappings.ownerNameColumn] : '') ||
    'Company Owner / Director';

  const companyName =
    record.companyName ||
    (mappings.companyNameColumn ? record.rawData[mappings.companyNameColumn] : '') ||
    'Registered Entity';

  const address =
    record.registeredAddress ||
    (mappings.addressColumn ? record.rawData[mappings.addressColumn] : '') ||
    '';

  const handleCopy = () => {
    navigator.clipboard.writeText(editableMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchWhatsApp = () => {
    if (!phoneInfo.isValid || !phoneInfo.isWhatsAppEligible) return;
    const url = generateWhatsAppUrl(phoneInfo.digits, editableMessage);
    window.open(url, '_blank', 'noopener,noreferrer');
    onMarkSent(record.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div
        className={`rounded-2xl border shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150 ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isDark ? 'border-slate-800 bg-emerald-950/40' : 'border-slate-200 bg-emerald-50/70'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <span>Send WhatsApp to Director</span>
                {record.whatsappSent && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                    Previously Contacted
                  </span>
                )}
              </h3>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {companyName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recipient Details Card */}
        <div className="p-5 space-y-4">
          <div
            className={`rounded-xl p-3.5 border text-xs space-y-2 ${
              isDark ? 'bg-slate-800/60 border-slate-700/80 text-slate-300' : 'bg-slate-50 border-slate-200/90 text-slate-700'
            }`}
          >
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="truncate font-semibold">{ownerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="truncate font-semibold">{companyName}</span>
              </div>
            </div>

            <div
              className={`grid grid-cols-2 gap-2 pt-1 border-t ${
                isDark ? 'border-slate-700/60' : 'border-slate-200/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-500 shrink-0" />
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-mono font-bold">
                    {phoneInfo.formatted || 'No Phone Detected'}
                  </span>
                  {phoneInfo.type === 'landline' ? (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      Landline ({phoneInfo.regionOrCity || 'Fixed Line'})
                    </span>
                  ) : phoneInfo.type === 'mobile' ? (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      Mobile
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="truncate font-mono">{record.currentEmail}</span>
              </div>
            </div>

            {address && (
              <div
                className={`flex items-start gap-2 pt-1 border-t text-[11px] ${
                  isDark ? 'border-slate-700/60 text-slate-400' : 'border-slate-200/60 text-slate-600'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{address}</span>
              </div>
            )}
          </div>

          {/* Landline Classification Notice */}
          {phoneInfo.type === 'landline' && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                isDark
                  ? 'bg-amber-950/40 border-amber-900/60 text-amber-200'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              <PhoneCall className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Landline Fixed Office Number Detected ({phoneInfo.regionOrCity || 'Local Exchange'})</p>
                <p className="text-[11px] mt-0.5 opacity-90 leading-relaxed">
                  Fixed-line landlines cannot receive direct WhatsApp messages. Please initiate a voice call or verify if a mobile number is available for this corporate officer.
                </p>
              </div>
            </div>
          )}

          {/* Invalid phone notice */}
          {(!phoneInfo.isValid || phoneInfo.type === 'invalid') && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                isDark
                  ? 'bg-rose-950/40 border-rose-900/60 text-rose-200'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              <PhoneOff className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Invalid Phone Number</p>
                <p className="text-[11px] opacity-90">
                  This row does not contain a valid telephone number (detected: "{rawPhone || 'empty'}"). You can copy the message or adjust the column in Column Mapping.
                </p>
              </div>
            </div>
          )}

          {/* Editable Prescripted Message */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                className={`text-xs font-bold flex items-center gap-1.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-800'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Personalized Message (Ready to Send):</span>
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className={`text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                  isDark ? 'text-slate-400 hover:text-emerald-400' : 'text-slate-600 hover:text-emerald-700'
                }`}
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <textarea
              rows={6}
              value={editableMessage}
              onChange={(e) => setEditableMessage(e.target.value)}
              className={`w-full p-3 font-sans text-xs rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed shadow-2xs border ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-5 py-4 border-t flex items-center justify-between ${
            isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-slate-50/80'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {phoneInfo.type === 'landline' ? (
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-amber-300 bg-amber-950/60 border border-amber-800/80 rounded-lg opacity-70 cursor-not-allowed"
              >
                <PhoneCall className="w-4 h-4 text-amber-400" />
                <span>Landline (WhatsApp Unavailable)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLaunchWhatsApp}
                disabled={!phoneInfo.isValid || !phoneInfo.isWhatsAppEligible}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-40 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Open in WhatsApp</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
