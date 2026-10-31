import React, { useState } from 'react';
import {
  Scale,
  Loader2,
  FileText,
  Info,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import FindingCard from '../components/FindingCard';
import RiskBadge from '../components/RiskBadge';
import PdfExportButton from '../components/PdfExportButton';
import ExecutiveSummary from '../components/ExecutiveSummary';

const SAMPLE_COMPLIANCE_TEXTS = {
  compliant: {
    title: 'Multi-Framework Compliant Policy Example',
    text: `GLOBAL PRIVACY DISCLOSURES & REGULATORY COMPLIANCE:
1. LAWFUL BASIS: We process your personal data under legitimate interests and user consent as our lawful basis pursuant to GDPR Article 6.
2. RIGHT TO ACCESS & ERASURE: Data subjects possess the statutory right to request access, rectification, or deletion of their personal data ('right to be forgotten') under GDPR Articles 15-17.
3. DATA PROTECTION OFFICER: You may contact our designated EU Data Protection Officer at dpo@global-saas.com.
4. CALIFORNIA PRIVACY RIGHTS: Under CCPA / CPRA, we do not sell or share your personal information. California consumers can direct opt-out requests using our 'Do Not Sell My Info' mechanism. We will not discriminate against any consumer for exercising their rights.
5. INDIA DPDP ACT 2023: Notices are provided in clear and plain language prior to obtaining consent. You have the right to withdraw consent at any time via our Consent Manager. Under Section 13, our Indian Grievance Redressal Officer can be reached at grievance.officer@global-saas.in with responses within 30 days.
6. PROTECTION OF CHILDREN: We do not track or direct behavioral advertisements at minors under the age of 18 without verifiable parental consent.`,
  },
  missing_gaps: {
    title: 'Policy with Documentation Gaps',
    text: `GENERAL TERMS & PRIVACY NOTICE:
We collect your email address, device IP address, and cookie tokens when you access our website.
We retain your data for as long as necessary to provide services to you.
You may contact us at support@example.com if you have any questions regarding your account.
We may update these terms from time to time.`,
  },
};

export default function ComplianceChecker({ onScanCompleted }) {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('Multi-Framework Privacy Compliance Audit');
  const [selectedFrameworks, setSelectedFrameworks] = useState(['GDPR', 'CCPA', 'DPDP']);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const toggleFramework = (fw) => {
    if (selectedFrameworks.includes(fw)) {
      if (selectedFrameworks.length === 1) return;
      setSelectedFrameworks(selectedFrameworks.filter((f) => f !== fw));
    } else {
      setSelectedFrameworks([...selectedFrameworks, fw]);
    }
  };

  const handleAudit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Please paste policy text or load a preset sample.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const scan = await api.checkCompliance({
        text,
        frameworks: selectedFrameworks,
        title,
      });
      setResult(scan);
      if (onScanCompleted) onScanCompleted(scan);
    } catch (err) {
      setError(err.message || 'Compliance audit failed');
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (key) => {
    const p = SAMPLE_COMPLIANCE_TEXTS[key];
    setTitle(p.title);
    setText(p.text);
    setError('');
  };

  const complianceItems = result?.compliance_items || [];
  const filteredItems =
    activeTab === 'ALL'
      ? complianceItems
      : complianceItems.filter((i) => i.framework === activeTab);

  const supportedCount = complianceItems.filter((i) => i.status === 'Supported').length;
  const missingCount = complianceItems.filter((i) => i.status === 'Potentially Missing').length;
  const conflictingCount = complianceItems.filter((i) => i.status === 'Conflicting').length;
  const inconclusiveCount = complianceItems.filter((i) => i.status === 'Inconclusive').length;

  return (
    <div className="space-y-6 pb-20">
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/70 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
              Privacy standards
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Privacy Compliance Checker</h1>
          <p className="text-xs text-slate-400 mt-1">
            Compare privacy-policy disclosures with key obligations in the GDPR, CCPA/CPRA, and India’s DPDP Act 2023.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500 font-medium mr-1">Examples:</span>
          <button
            type="button"
            onClick={() => applyPreset('compliant')}
            className="compliance-sample-button"
          >
            Compliant policy
          </button>
          <button
            type="button"
            onClick={() => applyPreset('missing_gaps')}
            className="compliance-sample-button"
          >
            Policy with gaps
          </button>
        </div>
      </div>

      {/* ── INPUT PANEL ─────────────────────────────────────────── */}
      <div className="cyber-card rounded-lg p-5">
        <form onSubmit={handleAudit} className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                Document Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Enterprise Privacy Policy"
                className="bg-slate-950 border border-slate-700/60 rounded-md px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-violet-500/50 font-mono w-72 max-w-full"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                Applicable Frameworks
              </label>
              <div className="flex items-center gap-1.5">
                {['GDPR', 'CCPA', 'DPDP'].map((fw) => {
                  const isChecked = selectedFrameworks.includes(fw);
                  return (
                    <button
                      type="button"
                      key={fw}
                      onClick={() => toggleFramework(fw)}
                      aria-pressed={isChecked}
                      className={`compliance-framework-option ${
                        isChecked
                          ? 'compliance-framework-option--selected'
                          : ''
                      }`}
                    >
                      {fw === 'GDPR' && 'GDPR (EU)'}
                      {fw === 'CCPA' && 'CCPA (California)'}
                      {fw === 'DPDP' && 'DPDP (India 2023)'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-red-950/40 border border-red-700/50 rounded text-xs text-red-300 font-mono">
              {error}
            </div>
          )}

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-slate-400 mb-1">
              Policy Content
            </label>
            <textarea
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="// Paste privacy policy text or load a preset sample to verify legal checklist coverage..."
              className="w-full bg-slate-950 border border-slate-700/60 rounded-md p-3 text-xs text-slate-200 focus:outline-none focus:border-violet-500/50 font-mono leading-relaxed placeholder:text-slate-700 resize-none"
            />
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="text-[11px] font-mono text-slate-500">
              Evaluates statements against statutory provisions (GDPR Art. 17, CCPA § 1798.120, DPDP Sec. 13)
            </span>
            <button
              type="submit"
              disabled={loading}
              className="compliance-submit-button"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scale className="w-4 h-4" />}
              <span>{loading ? 'Reviewing policy...' : 'Review policy'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ── RESULTS ─────────────────────────────────────────────── */}
      {result && (
        <div className="space-y-5">
          {/* Header Card */}
          <div className="cyber-card rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-violet-500/10 to-transparent border-l-2 border-violet-500 px-5 py-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-violet-400">LEGAL_COMPLIANCE_SCORECARD</span>
            </div>
            <div className="p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-slate-950 border border-slate-700/60 flex flex-col items-center justify-center font-mono">
                  <span className="text-2xl font-bold text-violet-400">{result.overall_risk_score}</span>
                  <span className="text-[8px] text-slate-500 uppercase tracking-wider">GAP_IDX</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h2 className="text-base font-bold text-white font-mono">{result.target}</h2>
                    <RiskBadge level={result.risk_level} size="sm" />
                  </div>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">{result.summary}</p>
                </div>
              </div>

              <PdfExportButton scanId={result.id} label="Export PDF" />
            </div>
          </div>

          <ExecutiveSummary scan={result} />

          {/* Compliance Breakdown Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="cyber-card rounded-lg p-3">
              <span className="text-[10px] text-slate-500 uppercase block">SUPPORTED</span>
              <span className="text-xl font-bold text-emerald-400 block mt-1">{supportedCount}</span>
            </div>
            <div className="cyber-card rounded-lg p-3">
              <span className="text-[10px] text-slate-500 uppercase block">POTENTIALLY_MISSING</span>
              <span className="text-xl font-bold text-amber-400 block mt-1">{missingCount}</span>
            </div>
            <div className="cyber-card rounded-lg p-3">
              <span className="text-[10px] text-slate-500 uppercase block">INCONCLUSIVE</span>
              <span className="text-xl font-bold text-slate-300 block mt-1">{inconclusiveCount}</span>
            </div>
            <div className="cyber-card rounded-lg p-3">
              <span className="text-[10px] text-slate-500 uppercase block">CONFLICTING</span>
              <span className="text-xl font-bold text-red-400 block mt-1">{conflictingCount}</span>
            </div>
          </div>

          {/* Legal Checklist Matrix Table */}
          <div className="cyber-card rounded-lg overflow-hidden">
            <div className="cyber-panel-header px-5 py-3 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Statutory Requirement Matrix
              </h3>

              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800 font-mono">
                {['ALL', ...selectedFrameworks].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    aria-pressed={activeTab === tab}
                    className={`compliance-filter-option ${
                      activeTab === tab
                        ? 'compliance-filter-option--active'
                        : ''
                    }`}
                  >
                    {tab === 'ALL' ? 'All' : tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/80 border-b border-slate-800/60 text-slate-500 text-[10px] uppercase">
                  <tr>
                    <th className="py-2.5 px-4">Framework</th>
                    <th className="py-2.5 px-4">Requirement</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Citation</th>
                    <th className="py-2.5 px-4">Analysis &amp; Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {filteredItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-4 font-bold text-violet-400">{item.framework}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-200">{item.requirement_title}</td>
                      <td className="py-2.5 px-4"><RiskBadge level={item.status} size="sm" /></td>
                      <td className="py-2.5 px-4 text-slate-400 text-[11px]">{item.citation}</td>
                      <td className="py-2.5 px-4 text-slate-300 text-[11px] max-w-sm">
                        {item.evidence && (
                          <p className="italic text-slate-400 mb-0.5">"{item.evidence}"</p>
                        )}
                        <p className="text-slate-400">{item.notes}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                NOTE: A missing statement reflects a policy documentation gap. Companies may implement jurisdiction-specific appendices or internal governance mechanisms.
              </span>
            </div>
          </div>

          {/* Remediation Findings */}
          {result.findings.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-violet-400" />
                <span>Documentation Gaps &amp; Recommendations</span>
                <span className="font-mono text-[10px] text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{result.findings.length}</span>
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {result.findings.map((f, i) => (
                  <FindingCard key={f.id || i} finding={f} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
