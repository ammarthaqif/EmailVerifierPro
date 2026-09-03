import React, { useState, useRef } from 'react';
import {
  X,
  MessageSquare,
  Sparkles,
  Send,
  HelpCircle,
  Copy,
  Check,
  Smartphone,
  RotateCcw,
  Building2,
  User,
  Mail,
  MapPin,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { EmailRecord, ColumnMappings, WhatsAppTemplateConfig } from '../types';
import {
  PRESET_TEMPLATES,
  interpolateWhatsAppMessage,
  cleanPhoneNumber,
  generateWhatsAppUrl,
} from '../utils/whatsappHelper';

interface WhatsAppTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateText: string;
  onSaveTemplate: (newText: string, countryCode: string) => void;
  mappings: ColumnMappings;
  availableColumns: string[];
  records: EmailRecord[];
  defaultCountryCode: string;
}

const COMMON_COUNTRY_CODES = [
  { code: '60', label: 'Malaysia (+60)', flag: '🇲🇾' },
  { code: '65', label: 'Singapore (+65)', flag: '🇸🇬' },
  { code: '1', label: 'United States / Canada (+1)', flag: '🇺🇸' },
  { code: '44', label: 'United Kingdom (+44)', flag: '🇬🇧' },
  { code: '61', label: 'Australia (+61)', flag: '🇦🇺' },
  { code: '62', label: 'Indonesia (+62)', flag: '🇮🇩' },
  { code: '91', label: 'India (+91)', flag: '🇮🇳' },
  { code: '852', label: 'Hong Kong (+852)', flag: '🇭🇰' },
  { code: '971', label: 'UAE (+971)', flag: '🇦🇪' },
];

export const WhatsAppTemplateModal: React.FC<WhatsAppTemplateModalProps> = ({
  isOpen,
  onClose,
  templateText,
  onSaveTemplate,
  mappings,
  availableColumns,
  records,
  defaultCountryCode,
}) => {
  const [currentText, setCurrentText] = useState(templateText);
  const [countryCode, setCountryCode] = useState(defaultCountryCode || '60');
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!isOpen) return null;

  const previewRecord = records[selectedPreviewIndex] || records[0];

  // Interpolate message for the preview record
  const previewMessage = previewRecord
    ? interpolateWhatsAppMessage(currentText, previewRecord, mappings)
    : 'No record available to preview.';

  // Phone diagnostics for preview
  const rawPhone = previewRecord
    ? previewRecord.phoneNumber || (mappings.phoneColumn ? previewRecord.rawData[mappings.phoneColumn] : '')
    : '';
  const phoneStatus = cleanPhoneNumber(rawPhone, countryCode);

  // Insert parameter placeholder at current textarea cursor position
  const handleInsertTag = (tag: string) => {
    if (!textareaRef.current) {
      setCurrentText((prev) => `${prev} ${tag}`);
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = currentText.substring(0, start);
    const after = currentText.substring(end);

    const newContent = `${before}${tag}${after}`;
    setCurrentText(newContent);

    // Reposition cursor right after inserted tag
    setTimeout(() => {
      textarea.focus();
      const newPos = start + tag.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = PRESET_TEMPLATES.find((p) => p.id === presetId);
    if (preset) {
      setCurrentText(preset.content);
    }
  };

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(previewMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestWhatsAppLaunch = () => {
    if (!phoneStatus.isValid) return;
    const url = generateWhatsAppUrl(phoneStatus.digits, previewMessage);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSave = () => {
    onSaveTemplate(currentText, countryCode);
    onClose();
  };

  const coreTags = [
    { tag: '{owner_name}', label: 'Owner / Director Name', icon: <User className="w-3 h-3 text-blue-600" /> },
    { tag: '{company_name}', label: 'Company Name', icon: <Building2 className="w-3 h-3 text-indigo-600" /> },
    { tag: '{email}', label: 'Email Address', icon: <Mail className="w-3 h-3 text-amber-600" /> },
    { tag: '{phone}', label: 'Phone Number', icon: <Smartphone className="w-3 h-3 text-emerald-600" /> },
    { tag: '{registered_address}', label: 'Registered Address', icon: <MapPin className="w-3 h-3 text-rose-600" /> },
    { tag: '{email_status}', label: 'Email Validity Status', icon: <Sparkles className="w-3 h-3 text-purple-600" /> },
    { tag: '{email_issue}', label: 'Diagnosis / Reason', icon: <HelpCircle className="w-3 h-3 text-slate-600" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Draft Prescripted WhatsApp Message</span>
                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Automation
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Include dynamic parameters ({'{owner_name}'}, {'{company_name}'}, etc.) to automatically personalize messages for each row.
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

        {/* Content Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto flex-1">
          {/* Left Column: Template Editor & Parameters (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Presets & Country Code Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Load Template Preset:
                </label>
                <select
                  onChange={(e) => handleApplyPreset(e.target.value)}
                  defaultValue=""
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="" disabled>
                    Choose a ready-to-use template...
                  </option>
                  {PRESET_TEMPLATES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-48">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Default Country Code:
                </label>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {COMMON_COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Template Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">
                  Message Script Body:
                </label>
                <span className="text-[11px] text-slate-500 font-mono">
                  {currentText.length} characters
                </span>
              </div>
              <textarea
                ref={textareaRef}
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                rows={8}
                placeholder="Type your WhatsApp message here. Click any parameter tag below to insert..."
                className="w-full p-3 font-sans text-xs sm:text-sm bg-slate-50/70 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white text-slate-900 leading-relaxed shadow-2xs"
              />
            </div>

            {/* Dynamic Parameter Tags */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Click to Insert Standard Parameters:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {coreTags.map((item) => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => handleInsertTag(item.tag)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 text-slate-700 transition-all cursor-pointer shadow-2xs active:scale-95"
                    title={`Insert ${item.label}`}
                  >
                    {item.icon}
                    <span>{item.tag}</span>
                  </button>
                ))}
              </div>

              {/* Extra Columns detected from Excel */}
              {availableColumns.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-600 block mb-1">
                    Excel Custom Columns:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {availableColumns.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => handleInsertTag(`{${col}}`)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                        title={`Insert custom column {${col}}`}
                      >
                        <span>+{col}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live WhatsApp Simulation Preview (5 cols) */}
          <div className="lg:col-span-5 bg-slate-100/80 rounded-xl border border-slate-200/90 p-4 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Row selector for preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preview with Row Data:
                </label>
                <select
                  value={selectedPreviewIndex}
                  onChange={(e) => setSelectedPreviewIndex(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium truncate focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {records.map((rec, idx) => (
                    <option key={rec.id} value={idx}>
                      Row {rec.rowIndex}: {rec.ownerName || rec.rawData['Director Name'] || rec.rawData['Name'] || 'Contact'} (
                      {rec.companyName || rec.rawData['Company Name'] || 'Company'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Phone status */}
              <div className="bg-white rounded-lg p-2.5 border border-slate-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-slate-900 block truncate">
                      {phoneStatus.formatted || 'No Phone Detected'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Raw: {rawPhone || '(empty)'}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    phoneStatus.isValid
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {phoneStatus.isValid ? 'Valid WhatsApp No' : 'Missing/Short'}
                </span>
              </div>

              {/* WhatsApp Simulated Phone Bubble */}
              <div className="rounded-xl overflow-hidden border border-emerald-900/20 shadow-xs bg-[#EFEAE2]">
                {/* Chat Header */}
                <div className="bg-[#075E54] text-white px-3 py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-[10px]">
                      {(previewRecord?.ownerName || 'D')[0]}
                    </div>
                    <div className="truncate">
                      <p className="font-bold text-white truncate text-[11px]">
                        {previewRecord?.ownerName || 'Company Owner'}
                      </p>
                      <p className="text-[9px] text-emerald-200 truncate">
                        {previewRecord?.companyName || 'Corporate Contact'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-700/80 px-1.5 py-0.5 rounded text-emerald-100">
                    Online
                  </span>
                </div>

                {/* Chat Bubble Canvas */}
                <div className="p-3 min-h-[160px] max-h-[220px] overflow-y-auto space-y-2 flex flex-col justify-end">
                  <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-xs max-w-[90%] text-slate-900 text-xs leading-relaxed self-start border border-slate-200/80 relative">
                    <p className="whitespace-pre-wrap font-sans text-xs">
                      {previewMessage}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
                      <span>Just now</span>
                      <Check className="w-3 h-3 text-blue-500 inline" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Action Buttons */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleCopyPreview}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>

              <button
                type="button"
                onClick={handleTestWhatsAppLaunch}
                disabled={!phoneStatus.isValid}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-40 rounded-lg shadow-xs transition-colors cursor-pointer"
                title={phoneStatus.isValid ? 'Launch test WhatsApp chat in new tab' : 'Phone number is invalid or missing'}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Test WhatsApp URL</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Clicking WhatsApp on any row will inject that row's exact company & owner details into this template.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              id="btn-save-whatsapp-template"
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save & Apply Template</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
