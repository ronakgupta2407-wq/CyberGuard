import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowUpRight } from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function FindingCard({ finding }) {
  const [expanded, setExpanded] = useState(true);

  if (!finding) return null;

  return (
    <div className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-lg p-4 transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-medium">
            {finding.category}
          </span>
          <RiskBadge level={finding.severity} size="sm" />
          {finding.source && (
            <span className="text-[11px] text-neutral-400 font-mono">
              {finding.source}
            </span>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1 transition-colors"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Finding Title */}
      <h3 className="text-sm font-semibold text-neutral-100 mb-2">
        {finding.title}
      </h3>

      {expanded && (
        <div className="space-y-3 pt-1 text-xs">
          {/* Evidence snippet */}
          {finding.evidence && (
            <div className="bg-neutral-950 border-l-2 border-neutral-600 rounded-r p-3 font-mono text-[11px] text-neutral-300 leading-relaxed">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-sans font-medium mb-1">
                Extracted Passage / Observation
              </span>
              <p className="whitespace-pre-wrap italic text-neutral-300">
                "{finding.evidence}"
              </p>
            </div>
          )}

          {/* Explanation */}
          <div>
            <span className="text-[11px] font-semibold text-neutral-400 block mb-1">
              Assessment
            </span>
            <p className="text-neutral-200 leading-relaxed">
              {finding.explanation}
            </p>
          </div>

          {/* Recommendation */}
          {finding.recommendation && (
            <div className="bg-neutral-800/40 border border-neutral-800 rounded p-3">
              <span className="text-[11px] font-semibold text-neutral-300 block mb-1">
                Suggested Action
              </span>
              <p className="text-neutral-300 leading-relaxed">
                {finding.recommendation}
              </p>
            </div>
          )}

          {/* Footer source note */}
          <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
            <span>Reference: {finding.source || 'Standard Security Baseline'}</span>
            <span className="text-neutral-400">Verified Rule</span>
          </div>
        </div>
      )}
    </div>
  );
}
