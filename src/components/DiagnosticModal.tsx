import React from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Server,
  Globe,
  Mail,
  FileCode,
  Tag,
  AlertOctagon,
  Clock,
} from 'lucide-react';
import { EmailRecord } from '../types';

interface DiagnosticModalProps {
  record: EmailRecord | null;
  onClose: () => void;
  onFixTypo: (record: EmailRecord) => void;
}

export const DiagnosticModal: React.FC<DiagnosticModalProps> = ({
  record,
  onClose,
  onFixTypo,
}) => {
  if (!record) return null;

  const res = record.verification;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100/80 text-blue-600 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Email Diagnostics & Verification Report
              </h3>
              <p className="text-xs text-slate-500 font-mono">Row #{record.rowIndex}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Target Email & Status Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Target Address
              </span>
              <span className="text-base font-mono font-bold text-slate-900">
                {record.currentEmail}
              </span>
              {record.typoFixed && (
                <span className="ml-2 text-xs text-emerald-700 font-bold">
                  (Corrected from {record.originalEmail})
                </span>
              )}
            </div>

            {res && (
              <div className="flex items-center gap-2">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-xs ${
                    res.status === 'valid'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : res.status === 'risky'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {res.status === 'valid' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  {res.status === 'risky' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                  {res.status === 'invalid' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                  <span>{res.status.toUpperCase()} ({res.deliverabilityScore}%)</span>
                </div>
              </div>
            )}
          </div>

          {res ? (
            <>
              {/* Detailed Reason Explanation */}
              <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-slate-700">
                <strong className="text-blue-900 font-bold block mb-1">
                  Summary: {res.reason}
                </strong>
                <p className="text-slate-700 leading-relaxed font-normal">{res.explanation}</p>
              </div>

              {/* Typo Recommendation Alert */}
              {res.typoSuggestion && !record.typoFixed && (
                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs flex items-center justify-between gap-3 shadow-xs">
                  <div>
                    <strong className="text-amber-900 font-bold block">Domain Typo Detected</strong>
                    <span className="text-amber-800 font-medium">
                      Did you mean <code className="font-bold font-mono text-amber-950">{res.typoSuggestion}</code>?
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onFixTypo(record);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    Apply Fix
                  </button>
                </div>
              )}

              {/* Comprehensive Check Breakdown */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  Diagnostic Check Matrix
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Syntax Check */}
                  <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between shadow-2xs">
                    <span className="text-slate-600 font-medium">RFC 5322 Syntax Format</span>
                    <span className={`font-bold flex items-center gap-1 ${res.syntaxValid ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {res.syntaxValid ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                      {res.syntaxValid ? 'Valid' : 'Malformed'}
                    </span>
                  </div>

                  {/* MX Record Status */}
                  <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between shadow-2xs">
                    <span className="text-slate-600 font-medium">DNS MX Mail Servers</span>
                    <span className={`font-bold flex items-center gap-1 ${res.hasMxRecords ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {res.hasMxRecords ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                      {res.hasMxRecords ? 'Active MX Found' : 'No MX Found'}
                    </span>
                  </div>

                  {/* Disposable Check */}
                  <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between shadow-2xs">
                    <span className="text-slate-600 font-medium">Disposable / Burner Mailbox</span>
                    <span className={`font-bold flex items-center gap-1 ${res.isDisposable ? 'text-rose-700' : 'text-emerald-700'}`}>
                      {res.isDisposable ? <AlertOctagon className="w-3.5 h-3.5 text-rose-600" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      {res.isDisposable ? 'Disposable (Trap)' : 'Not Disposable'}
                    </span>
                  </div>

                  {/* Role Account Check */}
                  <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between shadow-2xs">
                    <span className="text-slate-600 font-medium">Role-Based Account</span>
                    <span className={`font-bold flex items-center gap-1 ${res.isRoleBased ? 'text-amber-700' : 'text-slate-700'}`}>
                      {res.isRoleBased ? <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      {res.isRoleBased ? 'Role / Department' : 'Personal / Named'}
                    </span>
                  </div>

                  {/* Mail Provider */}
                  <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between shadow-2xs">
                    <span className="text-slate-600 font-medium">Identified Provider</span>
                    <span className="font-bold text-slate-800">{res.provider}</span>
                  </div>

                  {/* Free vs Corporate */}
                  <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between shadow-2xs">
                    <span className="text-slate-600 font-medium">Domain Type</span>
                    <span className="font-bold text-slate-800">
                      {res.isFreeMail ? 'Free Webmail (Public)' : 'Custom / Corporate Domain'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Resolved MX Host Records */}
              {res.mxRecords && res.mxRecords.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-slate-500" />
                    <span>Resolved DNS MX Server Entries</span>
                  </h4>
                  <div className="bg-slate-900 text-slate-100 rounded-lg p-3 text-xs font-mono overflow-x-auto space-y-1 shadow-inner">
                    {res.mxRecords.map((mx, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4">
                        <span className="text-slate-300 font-medium">{mx.exchange}</span>
                        <span className="text-blue-400 font-semibold">Priority: {mx.priority}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm">
              <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p>This row has not been verified yet.</p>
            </div>
          )}

          {/* Original Row Data from Excel */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-slate-500" />
              <span>Original Excel Spreadsheet Data</span>
            </h4>
            <div className="bg-slate-50 border border-slate-200/90 rounded-lg p-3 text-xs space-y-1.5">
              {Object.entries(record.rawData).map(([key, val]) => (
                <div key={key} className="flex items-baseline justify-between border-b border-slate-200/50 pb-1 last:border-0 last:pb-0">
                  <span className="font-semibold text-slate-600">{key}:</span>
                  <span className="font-mono text-slate-800 text-right">{String(val || '')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50/90 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 active:bg-slate-400/70 text-slate-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
