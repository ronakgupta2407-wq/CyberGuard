import React from 'react';
import { ArrowLeft, Shield, Calendar, Tag, ExternalLink, Activity } from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import FindingCard from '../components/FindingCard';
import PdfExportButton from '../components/PdfExportButton';

export default function ScanDetail({ scan, onBack }) {
  if (!scan) return null;

  const dateStr = scan.created_at
    ? new Date(scan.created_at).toLocaleString()
    : 'Recent Scan';

  const findings = scan.findings || [];
  const complianceItems = scan.compliance_items || [];
  const meta = scan.metadata || {};

  return (
    <div className="space-y-6 pb-16">
      {/* Back button and quick actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard / Scans</span>
        </button>

        <div className="flex items-center gap-2">
          <PdfExportButton scanId={scan.id} label="Download Forensic PDF Report" />
        </div>
      </div>

      {/* Main Dossier Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-cyan-400 font-bold uppercase">
              {scan.module_type}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Calendar className="w-3.5 h-3.5" />
              <span>{dateStr}</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              ID: #{scan.id.slice(0, 8)}
            </span>
          </div>

          <RiskBadge level={scan.risk_level} size="lg" />
        </div>

        <h1 className="text-2xl font-extrabold text-white mb-2">
          {scan.target || 'Digital Risk Audit Dossier'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          {scan.summary}
        </p>

        {/* Score Meter */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center font-mono">
            <span className="text-xl font-bold text-white">{scan.overall_risk_score}</span>
            <span className="text-[8px] text-slate-400 uppercase">Risk Index</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-200 block">
              Consolidated Risk Index Rating
            </span>
            <p className="text-[11px] text-slate-400">
              Evaluated across {findings.length} finding{findings.length !== 1 ? 's' : ''} and {complianceItems.length} compliance checklist items.
            </p>
          </div>
        </div>
      </div>

      {/* Compliance Matrix if available */}
      {complianceItems.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <span>Statutory Compliance Matrix ({complianceItems.length})</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Framework</th>
                  <th className="py-2.5 px-3">Requirement</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Statutory Citation</th>
                  <th className="py-2.5 px-3">Notes & Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {complianceItems.map((ci, i) => (
                  <tr key={i} className="hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-bold text-purple-400">{ci.framework}</td>
                    <td className="py-3 px-3 font-semibold text-slate-200">{ci.requirement_title}</td>
                    <td className="py-3 px-3"><RiskBadge level={ci.status} size="sm" /></td>
                    <td className="py-3 px-3 font-mono text-[11px] text-cyan-400">{ci.citation}</td>
                    <td className="py-3 px-3 text-slate-400 text-[11px] max-w-sm truncate">{ci.notes || ci.evidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Findings List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Detailed Risk Findings & Evidence ({findings.length})</span>
        </h3>

        {findings.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-400">
            No specific risk findings flagged in this scan record.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {findings.map((f, i) => (
              <FindingCard key={f.id || i} finding={f} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
