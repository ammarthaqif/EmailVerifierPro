import React, { useState } from 'react';
import { Search, Loader2, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { VerificationResult } from '../types';
import { verifyEmailSafe } from '../utils/clientVerification';

export const SingleVerifyWidget: React.FC = () => {
  const [inputEmail, setInputEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputEmail.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await verifyEmailSafe(inputEmail.trim());
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Lookup error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (res: VerificationResult) => {
    if (res.status === 'valid') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Active & Valid ({res.deliverabilityScore}%)
        </span>
      );
    }
    if (res.status === 'risky') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          Risky ({res.deliverabilityScore}%)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
        Invalid / Undeliverable ({res.deliverabilityScore}%)
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-4 sm:p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Instant Live Email Tester
          </h2>
          <p className="text-xs text-slate-500">
            Verify any single email directly with real DNS MX query and RFC syntax checks
          </p>
        </div>
      </div>

      <form onSubmit={handleTest} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            id="single-email-input"
            value={inputEmail}
            onChange={(e) => setInputEmail(e.target.value)}
            placeholder="e.g. alex@google.com, satya@microsoft.com, or user@gmial.com"
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>
        <button
          type="submit"
          id="btn-single-verify"
          disabled={loading || !inputEmail.trim()}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 shadow-xs shrink-0 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying DNS...</span>
            </>
          ) : (
            <>
              <span>Verify Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Result Display */}
      {result && (
        <div className="mt-3.5 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-slate-900">{result.email}</span>
              {getStatusBadge(result)}
            </div>
            <div className="text-xs text-slate-500">
              Provider: <span className="font-semibold text-slate-700">{result.provider}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <p className="text-slate-600">
              <strong className="text-slate-900 font-semibold">{result.reason}:</strong> {result.explanation}
            </p>
            {result.typoSuggestion && (
              <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-md font-medium border border-amber-200 shrink-0">
                Suggested Fix: <strong className="font-mono font-bold text-amber-900">{result.typoSuggestion}</strong>
              </span>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200 font-medium">
          Verification failed: {error}
        </div>
      )}
    </div>
  );
};
