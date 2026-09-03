import React, { useState, useEffect } from 'react';
import { Sparkles, Lightbulb, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { VerificationSummary, EmailRecord } from '../types';

interface AiInsightsBannerProps {
  summary: VerificationSummary;
  records: EmailRecord[];
}

export const AiInsightsBanner: React.FC<AiInsightsBannerProps> = ({ summary, records }) => {
  const [loading, setLoading] = useState(false);
  const [aiReport, setAiReport] = useState<{
    executiveSummary: string;
    keyRecommendations: string[];
  } | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  const fetchAiAudit = async () => {
    if (summary.total === 0 || summary.untested > 0) return;

    setLoading(true);
    try {
      const sampleInvalid = records
        .filter((r) => r.verification?.status === 'invalid')
        .slice(0, 5)
        .map((r) => `${r.currentEmail}: ${r.verification?.reason}`);

      const res = await fetch('/api/ai-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total: summary.total,
          valid: summary.valid,
          risky: summary.risky,
          invalid: summary.invalid,
          topProviders: summary.topProviders.slice(0, 3),
          sampleInvalid,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiReport({
          executiveSummary:
            data.executiveSummary ||
            `Scanned ${summary.total} emails with an average deliverability score of ${summary.avgScore}%.`,
          keyRecommendations:
            data.keyRecommendations || [
              'Exclude invalid domains and disposable inboxes before sending your campaign.',
              'Verify sender authentication (SPF/DKIM) on your sending server to maximize inboxing.',
            ],
        });
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (summary.total > 0 && summary.untested === 0) {
      fetchAiAudit();
    }
  }, [summary.total, summary.untested]);

  if (!aiReport && !loading) return null;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl p-4 sm:p-5 mb-6 shadow-sm border border-slate-700/60 ring-1 ring-white/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Deliverability & Campaign Hygiene Audit
            </h3>
            <p className="text-xs text-slate-300 font-medium">
              Automated inbox placement and bounce risk assessment
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3.5 pt-3.5 border-t border-slate-700/60 text-xs space-y-2.5">
          {loading ? (
            <p className="text-slate-300 animate-pulse">
              Synthesizing deliverability insights and provider reputation recommendations...
            </p>
          ) : aiReport ? (
            <>
              <p className="text-slate-200 leading-relaxed font-normal">
                {aiReport.executiveSummary}
              </p>
              {aiReport.keyRecommendations && aiReport.keyRecommendations.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="font-bold text-blue-200 block">Key Takeaways:</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300">
                    {aiReport.keyRecommendations.map((rec, idx) => (
                      <li key={idx} className="leading-relaxed">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};
