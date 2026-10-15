import React from 'react';
import { ArrowLeft, Shield, Calendar } from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import FindingCard from '../components/FindingCard';
import PdfExportButton from '../components/PdfExportButton';

export default function ScanDetail({ scan, onBack }) {
  if (!scan) return null;

  const dateStr = scan.created_at
    ? new Date(scan.created_at).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Recent Scan';

  const findings = scan.findings || [];
  const complianceItems = scan.compliance_items || [];

  return (
    <div className="space-y-6 pb-16">
      {/* Back button & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </button>

        <PdfExportButton scanId={scan.id} label="Download PDF Report" />
      </div>

      {/* Main Dossier Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-medium">
              {scan.module_type.toUpperCase()}
            </span>
            <div className="flex items-center gap-1 text-xs text-neutral-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{dateStr}</span>
            </div>
            <span className="text-xs text-neutral-500 font-mono">
              ID: {scan.id.slice(0, 8)}
            </span>
          </div>

          <RiskBadge level={scan.risk_level} size="md" />
        </div>

        <h1 className="text-lg font-semibold text-white mb-1.5">
          {scan.target || 'Audit Record'}
        </h1>
        <p className="text-xs text-neutral-300 leading-relaxed max-w-3xl">
          {scan.summary}
        </p>

        {/* Score indicator */}
        <div className="mt-5 pt-4 border-t border-neutral-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-neutral-950 border border-neutral-800 flex flex-col items-center justify-center font-mono">
            <span className="text-base font-bold text-white">{scan.overall_risk_score}</span>
            <span className="text-[8px] text-neutral-400 uppercase">Score</span>
          </div>
          <div>
            <span className="text-xs font-medium text-neutral-200 block">
              Calculated Risk Index ({scan.overall_risk_score} / 100)
            </span>
            <p className="text-[11px] text-neutral-400">
              Evaluated across {findings.length} findings and {complianceItems.length} checklist criteria.
            </p>
          </div>
        </div>
      </div>

      {/* Compliance Matrix if available */}
      {complianceItems.length > 0 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-neutral-800">
            <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
              Statutory Compliance Matrix ({complianceItems.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/70 text-neutral-400 text-[11px] font-medium border-b border-neutral-800">
                <tr>
                  <th className="py-2.5 px-4">Framework</th>
                  <th className="py-2.5 px-4">Requirement</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Statutory Reference</th>
                  <th className="py-2.5 px-4">Observations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80">
                {complianceItems.map((ci, i) => (
                  <tr key={i} className="hover:bg-neutral-800/40">
                    <td className="py-2.5 px-4 font-mono font-medium text-neutral-300">{ci.framework}</td>
                    <td className="py-2.5 px-4 font-medium text-neutral-200">{ci.requirement_title}</td>
                    <td className="py-2.5 px-4"><RiskBadge level={ci.status} size="sm" /></td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-neutral-400">{ci.citation}</td>
                    <td className="py-2.5 px-4 text-neutral-300 text-[11px] max-w-sm truncate">{ci.notes || ci.evidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Findings List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-neutral-100">
          Findings & Observations ({findings.length})
        </h3>

        {findings.length === 0 ? (
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-6 text-center text-xs text-neutral-400">
            No specific risk findings flagged in this record.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {findings.map((f, i) => (
              <FindingCard key={f.id || i} finding={f} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
