import React, { useState } from 'react';
import { Search, Loader2, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { VerificationResult } from '../types';
import { verifyEmailSafe } from '../utils/clientVerification';
import { useTheme } from '../context/ThemeContext';

export const SingleVerifyWidget: React.FC = () => {
  const { isDark, themeConfig } = useTheme();
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
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            isDark
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Active & Valid ({res.deliverabilityScore}%)
        </span>
      );
    }
    if (res.status === 'risky') {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            isDark
              ? 'bg-amber-950/80 text-amber-300 border-amber-800'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          Risky ({res.deliverabilityScore}%)
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
          isDark
            ? 'bg-rose-950/80 text-rose-300 border-rose-800'
            : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}
      >
        <XCircle className="w-3.5 h-3.5 text-rose-500" />
        Invalid / Undeliverable ({res.deliverabilityScore}%)
      </span>
    );
  };

  return (
    <div
      className={`rounded-xl border shadow-xs p-3.5 sm:p-5 mb-5 sm:mb-6 transition-colors ${
        isDark
          ? 'bg-slate-900/90 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200/90 text-slate-900'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3">
        <div>
          <h2 className="text-xs sm:text-sm font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span>Instant Live Email Tester</span>
          </h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
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
            type="email"
            id="single-email-input"
            value={inputEmail}
            onChange={(e) => setInputEmail(e.target.value)}
            placeholder="e.g. alex@google.com, satya@microsoft.com, or user@gmial.com"
            className={`w-full pl-9 pr-3 py-2.5 sm:py-2 text-xs sm:text-sm rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500'
                : 'bg-slate-50/80 border-slate-200 text-slate-900 placeholder:text-slate-400'
            }`}
          />
        </div>
        <button
          type="submit"
          id="btn-single-verify"
          disabled={loading || !inputEmail.trim()}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 shadow-xs shrink-0 cursor-pointer min-h-[42px]"
          style={{ backgroundColor: themeConfig.accentColor }}
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
        <div
          className={`mt-3.5 p-3 sm:p-3.5 rounded-lg border text-sm animate-in fade-in ${
            isDark
              ? 'bg-slate-800/80 border-slate-700 text-slate-200'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div
            className={`flex flex-wrap items-center justify-between gap-2 pb-2 border-b ${
              isDark ? 'border-slate-700' : 'border-slate-200/80'
            }`}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-semibold">{result.email}</span>
              {getStatusBadge(result)}
            </div>
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Provider: <span className="font-semibold text-slate-900 dark:text-slate-100">{result.provider}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              <strong className="font-semibold text-slate-900 dark:text-slate-100">{result.reason}:</strong>{' '}
              {result.explanation}
            </p>
            {result.typoSuggestion && (
              <span className="inline-flex items-center gap-1 text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-md font-medium border border-amber-200 dark:border-amber-800 shrink-0">
                Suggested Fix:{' '}
                <strong className="font-mono font-bold text-amber-900 dark:text-amber-200">
                  {result.typoSuggestion}
                </strong>
              </span>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-800 font-medium">
          Verification failed: {error}
        </div>
      )}
    </div>
  );
};

