import React from 'react';
import { ArrowLeft, Shield, Calendar, ShieldAlert } from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import FindingCard from '../components/FindingCard';
import PdfExportButton from '../components/PdfExportButton';
import ExecutiveSummary from '../components/ExecutiveSummary';
import { cleanDomain } from '../utils/formatters';

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
    <div className="space-y-6 pb-20">
      {/* ── ACTIONS ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Past Scans</span>
        </button>

        <PdfExportButton scanId={scan.id} label="Download Security PDF" />
      </div>

      {/* ── MAIN DOSSIER HEADER ─────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700 font-semibold capitalize">
              {scan.module_type === 'tc' ? 'Terms & Conditions' :
               scan.module_type === 'phishing' ? 'Email Threat' :
               scan.module_type === 'website' ? 'Website Security' :
               scan.module_type === 'compliance' ? 'Privacy Compliance' : scan.module_type}
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{dateStr}</span>
            </div>
          </div>

          <RiskBadge level={scan.risk_level} size="md" />
        </div>

        <div className="mb-3">
          <h1 className="text-xl font-bold text-white tracking-tight">
            {cleanDomain(scan.target)}
          </h1>
          {scan.target && (scan.target.startsWith('http://') || scan.target.startsWith('https://')) && (
            <span className="text-xs text-slate-500 font-mono mt-0.5 block truncate max-w-xl">
              {scan.target}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          {scan.summary}
        </p>

        {/* Score Indicator Banner */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-cyan-400">{scan.overall_risk_score}</span>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Risk Score</span>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200 block">
              Overall Risk Score ({scan.overall_risk_score} / 100)
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluated across {findings.length} findings and {complianceItems.length} compliance checklist items.
            </p>
          </div>
        </div>
      </div>

      <ExecutiveSummary scan={scan} />

      {/* ── COMPLIANCE MATRIX ───────────────────────────────────── */}
      {complianceItems.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Statutory Compliance Checklist ({complianceItems.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 text-xs font-medium border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Framework</th>
                  <th className="py-2.5 px-4">Requirement</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Reference</th>
                  <th className="py-2.5 px-4">Observations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {complianceItems.map((ci, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-purple-400">{ci.framework}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-200">{ci.requirement_title}</td>
                    <td className="py-2.5 px-4"><RiskBadge level={ci.status} size="sm" /></td>
                    <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">{ci.citation}</td>
                    <td className="py-2.5 px-4 text-slate-300 text-xs max-w-sm truncate">{ci.notes || ci.evidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── FINDINGS LIST ───────────────────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <span>Discovered Vulnerabilities &amp; Warnings</span>
          <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-medium">{findings.length}</span>
        </h3>

        {findings.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
            No specific risk findings flagged in this record. Clean assessment.
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
