import React, { useState } from 'react';
import {
  X,
  BookOpen,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Download,
  ShieldCheck,
  Zap,
  Sparkles,
  HelpCircle,
  Phone,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSample?: () => void;
}

type GuideTab = 'quickstart' | 'excel' | 'verification' | 'whatsapp' | 'export' | 'faq';

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  onLoadSample,
}) => {
  const [activeTab, setActiveTab] = useState<GuideTab>('quickstart');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      id="user-guide-modal"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  User Manual & Operational Guide
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Master email DNS verification, director data cleaning, and automated WhatsApp outreach
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            aria-label="Close user guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6 overflow-x-auto no-scrollbar gap-1 pt-2">
          <button
            onClick={() => setActiveTab('quickstart')}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'quickstart'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Quick Start</span>
          </button>

          <button
            onClick={() => setActiveTab('excel')}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'excel'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel & Mapping</span>
          </button>

          <button
            onClick={() => setActiveTab('verification')}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'verification'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Email DNS Verification</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Outreach</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'export'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Clean Data Export</span>
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'faq'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Tips & FAQs</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 text-slate-700 text-sm space-y-6">
          {/* TAB 1: QUICK START */}
          {activeTab === 'quickstart' && (
            <div className="space-y-6">
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start gap-3.5">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-blue-950 text-base">
                    Welcome to Email Verifier & Outreach Dashboard
                  </h3>
                  <p className="text-xs text-blue-900 mt-1 leading-relaxed">
                    This platform turns messy corporate spreadsheets into pristine, deliverable contact lists. Follow the 3-step lifecycle below to clean your emails and launch WhatsApp conversations in minutes.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center mb-3">
                    1
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm mb-1">
                    Upload Spreadsheet
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Drag and drop your <code>.xlsx</code> or <code>.csv</code> file. The smart mapping engine auto-detects columns for emails, names, phone numbers, and addresses.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center mb-3">
                    2
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm mb-1">
                    Verify & Fix Typos
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Watch the live verification bar query real DNS MX records, catch disposable emails, and 1-click correct domain typos like <code>@gnail.com</code>.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center mb-3">
                    3
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm mb-1">
                    Outreach & Export
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Launch prescripted WhatsApp messages with dynamic data tags (e.g. <code>&#123;&#123;OwnerName&#125;&#125;</code>) or export only 100% verified records to Excel.
                  </p>
                </div>
              </div>

              {onLoadSample && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h5 className="font-semibold text-slate-900 text-xs">Want to try it without a file?</h5>
                    <p className="text-xs text-slate-500">
                      Load a realistic corporate director spreadsheet with valid, risky, typo, and invalid test records.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onLoadSample();
                    }}
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer transition-colors shrink-0"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Load Sample Dataset</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EXCEL & COLUMN MAPPING */}
          {activeTab === 'excel' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-base">
                Spreadsheet Formats & Smart Column Mapping
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The application supports any structure of corporate leads or customer lists. You do not need to rename your columns before uploading.
              </p>

              <div className="space-y-3">
                <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
                  <h4 className="font-semibold text-slate-900 text-xs flex items-center gap-2 mb-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                    Supported File Types & Worksheets
                  </h4>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                    <li><strong>Microsoft Excel (.xlsx, .xls)</strong>: Full support for multi-tab workbooks. You can switch sheets using the dropdown in the Mapping Bar.</li>
                    <li><strong>Comma Separated Values (.csv)</strong>: Standard comma, semicolon, or tab-delimited text files.</li>
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
                  <h4 className="font-semibold text-slate-900 text-xs flex items-center gap-2 mb-1.5">
                    <Layers className="w-4 h-4 text-purple-600" />
                    Auto-Detected Fields
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <strong className="text-slate-900">Email Column:</strong>
                      <p className="text-slate-500 text-[11px] mt-0.5">Matched by headers like <code>Email</code>, <code>Mail</code>, <code>Contact_Email</code>.</p>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <strong className="text-slate-900">Phone / WhatsApp:</strong>
                      <p className="text-slate-500 text-[11px] mt-0.5">Matched by <code>Phone</code>, <code>Mobile</code>, <code>WhatsApp</code>, <code>Contact</code>.</p>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <strong className="text-slate-900">Owner / Director Name:</strong>
                      <p className="text-slate-500 text-[11px] mt-0.5">Matched by <code>Director</code>, <code>Name</code>, <code>Owner</code>, <code>Full_Name</code>.</p>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                      <strong className="text-slate-900">Company & Address:</strong>
                      <p className="text-slate-500 text-[11px] mt-0.5">Matched by <code>Company</code>, <code>Business</code>, <code>Address</code>, <code>HQ</code>.</p>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-3.5 bg-amber-50/60 border-amber-200">
                  <h4 className="font-semibold text-amber-900 text-xs flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Custom Header Mapping
                  </h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    If your spreadsheet uses non-standard header titles (e.g. <code>PIC_Contact</code> or <code>HQ_Street</code>), click <strong>&quot;Configure Field Mappings&quot;</strong> in the top mapping bar to manually pair any column. The entire dataset will immediately update.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VERIFICATION ENGINE */}
          {activeTab === 'verification' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-base">
                Multi-Layer Verification & DNS MX Validation
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The verification engine utilizes an enterprise-grade 5-stage validation pipeline to guarantee deliverability and safeguard your domain sender reputation.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
                  <div className="flex items-center gap-2 font-semibold text-slate-900 mb-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">1</span>
                    RFC 5322 Syntax Check
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Validates email grammar, local parts, domain labels, and invalid special characters according to internet standards.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
                  <div className="flex items-center gap-2 font-semibold text-slate-900 mb-1">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">2</span>
                    DNS MX Record Discovery
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Queries authoritative DNS servers for real Mail Exchange (MX) hostnames and priority levels. Domains without MX servers cannot receive email.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
                  <div className="flex items-center gap-2 font-semibold text-slate-900 mb-1">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[10px]">3</span>
                    Disposable & Burner Filter
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Detects temporary burner mail providers (e.g. Mailinator, GuerrillaMail, 10MinuteMail) that bounce shortly after collection.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
                  <div className="flex items-center gap-2 font-semibold text-slate-900 mb-1">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px]">4</span>
                    1-Click Typo Correction
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Identifies misspellings like <code>@yaho.com</code> or <code>@hotmial.com</code>. Click &quot;Fix All Typos&quot; to restore lost leads automatically.
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                <h4 className="font-semibold text-slate-900 text-xs mb-1.5">Deliverability Status Categories:</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-100 text-emerald-800">VALID</span>
                    <span className="text-slate-600">Passed syntax and verified active DNS MX mail servers. Safe to send.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-amber-100 text-amber-800">RISKY</span>
                    <span className="text-slate-600">Role-based address (info@, sales@) or typo detected. Review recommended.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-rose-100 text-rose-800">INVALID</span>
                    <span className="text-slate-600">No MX mail server, dead domain, or syntax malformed. Guaranteed bounce.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WHATSAPP OUTREACH */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-base">
                WhatsApp Direct Outreach & Dynamic Tags
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connect directly with company directors and owners via WhatsApp without typing messages manually or saving unknown numbers in your personal contact book.
              </p>

              <div className="space-y-3">
                <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
                  <h4 className="font-semibold text-slate-900 text-xs flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Available Dynamic Tags for Templates
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    <code className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-xs font-mono">
                      &#123;&#123;OwnerName&#125;&#125;
                    </code>
                    <code className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-xs font-mono">
                      &#123;&#123;CompanyName&#125;&#125;
                    </code>
                    <code className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-xs font-mono">
                      &#123;&#123;Email&#125;&#125;
                    </code>
                    <code className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-xs font-mono">
                      &#123;&#123;PhoneNumber&#125;&#125;
                    </code>
                    <code className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-xs font-mono">
                      &#123;&#123;Address&#125;&#125;
                    </code>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-2">
                    You can also inject ANY custom spreadsheet column into your template, e.g. <code>&#123;&#123;RegistrationNo&#125;&#125;</code> or <code>&#123;&#123;Industry&#125;&#125;</code>.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
                  <h4 className="font-semibold text-slate-900 text-xs flex items-center gap-2 mb-1.5">
                    <Phone className="w-4 h-4 text-blue-600" />
                    International Number Normalization
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Phone numbers formatted with spaces, dashes, or local leading zeroes (e.g. <code>012-345 6789</code>) are automatically parsed and prepended with your default Country Code (e.g. <code>+60</code> for Malaysia, <code>+1</code> for US, <code>+65</code> for Singapore).
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                  <h4 className="font-semibold text-slate-900 text-xs mb-1">Two Ways to Launch:</h4>
                  <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                    <li><strong>Direct 1-Click Launch:</strong> Click the green WhatsApp icon in any table row to immediately launch WhatsApp Web / Desktop with the interpolated message pre-filled.</li>
                    <li><strong>Preview & Edit Modal:</strong> Click the message preview icon to inspect the exact message, tweak specific wording for that recipient, and mark the conversation as contacted.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CLEAN DATA EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-base">
                Exporting Clean, Sanitized Datasets
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Download your cleaned data for import into HubSpot, Salesforce, Mailchimp, or cold email tools.
              </p>

              <div className="space-y-3">
                <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
                  <h4 className="font-semibold text-slate-900 text-xs mb-2">Export Capabilities:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <strong className="text-slate-900">Format Choices:</strong>
                      <p className="text-slate-500 text-[11px] mt-0.5">Choose between Excel (.xlsx) with styled header cells or Universal CSV.</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <strong className="text-slate-900">Selective Filtering:</strong>
                      <p className="text-slate-500 text-[11px] mt-0.5">Export only 100% Valid emails, exclude Disposables, or export filtered rows.</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <strong className="text-slate-900">Diagnostic Appending:</strong>
                      <p className="text-slate-500 text-[11px] mt-0.5">Optionally include MX records, deliverability scores, and reason codes.</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <strong className="text-slate-900">WhatsApp Tracking:</strong>
                      <p className="text-slate-500 text-[11px] mt-0.5">Includes columns indicating whether WhatsApp outreach was sent.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FAQS & BEST PRACTICES */}
          {activeTab === 'faq' && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-base mb-2">
                Frequently Asked Questions & Deliverability Tips
              </h3>

              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-1">
                <h4 className="font-semibold text-slate-900 text-xs">Does verifying an email send a test message to the recipient?</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  No. The verification process works at the DNS and SMTP protocol negotiation level. It checks domain mail records, syntax, and MX exchange servers without ever triggering an inbox notification or sending an email.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-1">
                <h4 className="font-semibold text-slate-900 text-xs">What is a good deliverability score before starting a campaign?</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Aim for a dataset with an average score above 80%. We strongly recommend filtering out all <strong>Invalid</strong> addresses, as bounce rates exceeding 2-3% can harm your domain&apos;s sender reputation.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-1">
                <h4 className="font-semibold text-slate-900 text-xs">How do I safely reach out via WhatsApp?</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Personalize each message using director and company tags. Avoid sending duplicate messages in rapid succession to ensure compliance with WhatsApp policies.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-3.5 bg-white space-y-1">
                <h4 className="font-semibold text-slate-900 text-xs">Is my spreadsheet data kept private?</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Yes. All spreadsheet processing, parsing, and WhatsApp link generation occurs locally in your browser. No lead records or phone numbers are sold or permanently stored on external servers.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Developer Signature */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Email Verifier & Director Outreach Suite</span>
            <span className="text-slate-300">•</span>
            <span className="font-medium text-slate-700">Developed by Ammar Thaqif</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-xs cursor-pointer transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
