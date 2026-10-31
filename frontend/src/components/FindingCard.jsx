import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileCode, ShieldAlert, ExternalLink, Lightbulb, CheckCircle2 } from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function FindingCard({ finding, defaultExpanded = true }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!finding) return null;

  const severityBarColor = {
    Critical: 'border-l-rose-500 bg-rose-950/20',
    High: 'border-l-orange-500 bg-orange-950/20',
    Medium: 'border-l-amber-500 bg-amber-950/20',
    Low: 'border-l-cyan-500 bg-cyan-950/20',
  }[finding.severity] || 'border-l-slate-600 bg-slate-900/50';

  const categoryBadgeColor = {
    Privacy: 'text-purple-300 bg-purple-950/50 border-purple-800/60',
    Phishing: 'text-rose-300 bg-rose-950/50 border-rose-800/60',
    'Website Security': 'text-cyan-300 bg-cyan-950/50 border-cyan-800/60',
    'Legal Compliance': 'text-amber-300 bg-amber-950/50 border-amber-800/60',
  }[finding.category] || 'text-slate-300 bg-slate-900 border-slate-800';

  return (
    <div className={`rounded-xl border border-slate-800 border-l-4 ${severityBarColor} p-4 sm:p-5 transition-all shadow-sm`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${categoryBadgeColor}`}>
            {finding.category}
          </span>
          <RiskBadge level={finding.severity} size="sm" />
          {finding.source && (
            <span className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-0.5 rounded-lg border border-slate-800 font-sans">
              <ExternalLink className="w-3 h-3 text-cyan-400" />
              {finding.source}
            </span>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors font-medium p-1"
        >
          <span>{expanded ? 'Less' : 'Details'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Finding Title */}
      <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
        <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>{finding.title}</span>
      </h3>

      {expanded && (
        <div className="space-y-3 pt-1 text-xs">
          {/* Excerpt / Evidence */}
          {finding.evidence && (
            <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1.5 pb-1.5 border-b border-slate-900">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                  Exact Excerpt &amp; Evidence
                </span>
              </div>
              <p className="whitespace-pre-wrap italic text-slate-200">
                "{finding.evidence}"
              </p>
            </div>
          )}

          {/* Explanation */}
          <div className="bg-slate-900/80 border border-slate-800/70 rounded-xl p-3.5">
            <span className="text-xs font-semibold text-cyan-400 block mb-1 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" />
              Why this is concerning
            </span>
            <p className="text-slate-200 leading-relaxed text-xs">
              {finding.explanation}
            </p>
          </div>

          {/* Recommendation */}
          {finding.recommendation && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
              <span className="text-xs font-semibold text-emerald-400 block mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Recommended Action
              </span>
              <p className="text-slate-300 leading-relaxed text-xs">
                {finding.recommendation}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-sans">
            <span>Reference: {finding.clause_or_check_type || 'Security Standard / Legal Framework'}</span>
            <span className="text-cyan-400/90 font-medium">Confidence: {Math.round((finding.confidence || 0.85) * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
