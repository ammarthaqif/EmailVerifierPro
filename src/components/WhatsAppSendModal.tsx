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
  ExternalLink,
  Edit3,
} from 'lucide-react';
import { EmailRecord, ColumnMappings } from '../types';
import {
  interpolateWhatsAppMessage,
  cleanPhoneNumber,
  generateWhatsAppUrl,
} from '../utils/whatsappHelper';

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
  const phoneInfo = cleanPhoneNumber(rawPhone, defaultCountryCode);

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
    if (!phoneInfo.isValid) return;
    const url = generateWhatsAppUrl(phoneInfo.digits, editableMessage);
    window.open(url, '_blank', 'noopener,noreferrer');
    onMarkSent(record.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-emerald-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span>Send WhatsApp to Director</span>
                {record.whatsappSent && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-300">
                    Previously Contacted
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                {companyName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recipient Details Card */}
        <div className="p-5 space-y-4">
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/90 text-xs space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-slate-700">
                <User className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate font-semibold">{ownerName}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="truncate font-semibold">{companyName}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
              <div className="flex items-center gap-2 text-slate-700">
                <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-mono font-bold text-slate-900">
                  {phoneInfo.formatted || 'No Phone Detected'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 truncate">
                <Mail className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="truncate font-mono">{record.currentEmail}</span>
              </div>
            </div>

            {address && (
              <div className="flex items-start gap-2 text-slate-600 pt-1 border-t border-slate-200/60 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{address}</span>
              </div>
            )}
          </div>

          {!phoneInfo.isValid && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
              <Smartphone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Invalid or Missing Phone Number</p>
                <p className="text-[11px] text-amber-700">
                  This row does not contain a valid phone number (detected: "{rawPhone || 'empty'}"). You can copy the message or adjust the phone column in Column Mapping.
                </p>
              </div>
            </div>
          )}

          {/* Editable Prescripted Message */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Personalized Message (Ready to Send):</span>
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-semibold text-slate-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <textarea
              rows={6}
              value={editableMessage}
              onChange={(e) => setEditableMessage(e.target.value)}
              className="w-full p-3 font-sans text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-900 leading-relaxed shadow-2xs"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLaunchWhatsApp}
              disabled={!phoneInfo.isValid}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-40 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Open in WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
