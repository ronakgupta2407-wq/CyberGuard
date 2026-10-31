import { CheckCircle2, Lightbulb, ShieldAlert } from 'lucide-react';
import RiskBadge from './RiskBadge';

const MODULE_NAMES = {
  tc: 'Terms of Service',
  phishing: 'email',
  website: 'website',
  compliance: 'privacy policy',
  unified: 'security audit',
};

const SEVERITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3, Informational: 4 };

export default function ExecutiveSummary({ scan }) {
  if (!scan) return null;

  const findings = [...(scan.findings || scan.key_findings || [])].sort(
    (first, second) =>
      (SEVERITY_ORDER[first.severity] ?? 5) - (SEVERITY_ORDER[second.severity] ?? 5),
  );
  const moduleName = MODULE_NAMES[scan.module_type] || 'audit';
  const findingCount = scan.finding_count ?? findings.length;
  const topFindings = findings.slice(0, 3);
  const score = scan.overall_risk_score ?? 0;
  const riskLevel = scan.risk_level || 'Low';
  const shortSummary = findingCount > 0
    ? `${findingCount} issue${findingCount === 1 ? '' : 's'} flagged in this ${moduleName}. Overall risk: ${riskLevel} (${score}/100).${topFindings[0] ? ` Highest priority: ${topFindings[0].title} (${topFindings[0].severity}).` : ''}`
    : `No specific issues were detected in this ${moduleName}. Overall risk: ${riskLevel} (${score}/100).`;

  return (
    <section
      aria-label="Plain-language risk summary"
      className="rounded-2xl border border-cyan-900/60 bg-gradient-to-br from-cyan-950/30 via-slate-900 to-slate-900 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-300">
            In simple terms
          </p>
          <h3 className="mt-1 text-base font-semibold text-white">What this result means</h3>
          {scan.target && (
            <p className="mt-1 max-w-xl truncate text-xs text-slate-400" title={scan.target}>
              {scan.target}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2">
          <span className="text-sm font-bold tabular-nums text-white">
            {score}/100
          </span>
          <RiskBadge level={riskLevel} size="sm" />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-300">Short summary</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-200">{shortSummary}</p>
        {scan.summary && (
          <p className="mt-2 border-t border-slate-800 pt-2 text-xs leading-relaxed text-slate-400">
            {scan.summary}
          </p>
        )}
      </div>

      {topFindings.length > 0 && (
        <div className="mt-4 space-y-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Detailed summary · highest priority findings
          </p>
          {topFindings.map((finding, index) => (
            <div
              key={finding.id || `${finding.title}-${index}`}
              className="rounded-xl border border-slate-800/80 bg-slate-950/55 p-3.5"
            >
              <div className="flex items-start gap-2">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold leading-relaxed text-slate-200">
                    {finding.title}
                    <span className="ml-2 text-[10px] font-medium uppercase tracking-wide text-amber-300">
                      {finding.severity}
                    </span>
                  </p>
                  {finding.evidence && (
                    <div className="mt-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Evidence</p>
                      <p className="mt-0.5 whitespace-pre-wrap text-xs leading-relaxed text-slate-300">{finding.evidence}</p>
                    </div>
                  )}
                  {finding.explanation && (
                    <div className="mt-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Why it matters</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-300">{finding.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
              {finding.recommendation && (
                <div className="mt-3 flex items-start gap-2 border-t border-slate-800/80 pt-3">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">Recommended action</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-300">
                      {finding.recommendation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
          {findingCount > topFindings.length && (
            <p className="text-right text-[11px] text-slate-500">
              Showing the {topFindings.length} highest-risk issues. See the full report for all {findingCount}.
            </p>
          )}
        </div>
      )}

      {findingCount === 0 && (
        <p className="mt-3 flex items-center gap-2 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          No flagged findings in this scan. The detailed findings section has no issues to list.
        </p>
      )}
    </section>
  );
}
