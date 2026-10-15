import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Lightbulb, ExternalLink, Shield } from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function FindingCard({ finding }) {
  const [expanded, setExpanded] = useState(true);

  if (!finding) return null;

  const categoryColor = {
    Privacy: 'text-purple-400 bg-purple-950/60 border-purple-800/60',
    Phishing: 'text-rose-400 bg-rose-950/60 border-rose-800/60',
    'Website Security': 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60',
    'Legal Compliance': 'text-amber-400 bg-amber-950/60 border-amber-800/60',
  }[finding.category] || 'text-slate-300 bg-slate-800 border-slate-700';

  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg shadow-black/20 transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-xs px-2.5 py-0.5 rounded-md border font-mono font-medium ${categoryColor}`}>
            {finding.category}
          </span>
          <RiskBadge level={finding.severity} size="sm" />
          {finding.source && (
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
              <ExternalLink className="w-3 h-3 text-cyan-500" />
              {finding.source}
            </span>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-slate-100 mb-3 flex items-center gap-2">
        <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
        {finding.title}
      </h3>

      {expanded && (
        <div className="space-y-3.5 pt-1">
          {/* Evidence */}
          {finding.evidence && (
            <div className="bg-slate-950/80 rounded-lg p-3.5 border-l-2 border-cyan-500 text-xs font-mono text-slate-300">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">
                Detected Evidence / Text Excerpt:
              </span>
              <p className="whitespace-pre-wrap leading-relaxed italic">
                "{finding.evidence}"
              </p>
            </div>
          )}

          {/* Plain English Explanation */}
          <div className="bg-slate-800/60 rounded-lg p-3.5 border border-slate-700/60">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-300 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Plain English Analysis (Why it matters):
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {finding.explanation}
            </p>
          </div>

          {/* Actionable Recommendation */}
          <div className="bg-cyan-950/30 rounded-lg p-3.5 border border-cyan-900/50">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300 mb-1">
              <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
              Recommended Action:
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">
              {finding.recommendation}
            </p>
          </div>

          {/* Confidence footer */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
            <span>
              Confidence Estimate: <strong className="text-slate-300">{Math.round((finding.confidence || 0.85) * 100)}%</strong>
            </span>
            <span className="text-slate-400">CyberGuard Rule & AI Engine</span>
          </div>
        </div>
      )}
    </div>
  );
}
