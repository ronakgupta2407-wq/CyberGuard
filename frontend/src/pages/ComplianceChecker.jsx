import React, { useState } from 'react';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  Loader2,
  FileText,
  Shield,
  ExternalLink,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import FindingCard from '../components/FindingCard';
import RiskBadge from '../components/RiskBadge';
import PdfExportButton from '../components/PdfExportButton';

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
    title: 'Policy with Documentation Gaps (Missing DPDP & CCPA)',
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
      if (selectedFrameworks.length === 1) return; // Keep at least one
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

  // Statistics
  const supportedCount = complianceItems.filter((i) => i.status === 'Supported').length;
  const missingCount = complianceItems.filter((i) => i.status === 'Potentially Missing').length;
  const conflictingCount = complianceItems.filter((i) => i.status === 'Conflicting').length;
  const inconclusiveCount = complianceItems.filter((i) => i.status === 'Inconclusive').length;

  return (
    <div className="space-y-8 pb-16">
      {/* Module Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-950/80 border border-purple-800 flex items-center justify-center text-purple-400 shadow-md shadow-purple-950/50">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                  MODULE 04
                </span>
                <h1 className="text-xl font-bold text-white">Privacy Compliance Checker</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Evaluate policy statements against statutory obligations under GDPR (EU), CCPA/CPRA (California), and India's DPDP Act 2023.
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium mr-1">Load Presets:</span>
            <button
              onClick={() => applyPreset('compliant')}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/80 text-xs transition-colors"
            >
              Multi-Compliant Policy
            </button>
            <button
              onClick={() => applyPreset('missing_gaps')}
              className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/80 text-xs transition-colors"
            >
              Policy with Missing Gaps
            </button>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <form onSubmit={handleAudit} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Policy Document Title:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Enterprise Privacy Policy v3.0"
                className="bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500 w-72 max-w-full"
              />
            </div>

            {/* Framework Selectors */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Regulatory Frameworks:
              </label>
              <div className="flex items-center gap-2">
                {['GDPR', 'CCPA', 'DPDP'].map((fw) => {
                  const isChecked = selectedFrameworks.includes(fw);
                  return (
                    <button
                      type="button"
                      key={fw}
                      onClick={() => toggleFramework(fw)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        isChecked
                          ? 'bg-purple-950 text-purple-300 border border-purple-700 shadow-sm shadow-purple-950'
                          : 'bg-slate-950 text-slate-500 border border-slate-800 hover:text-slate-300'
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
            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-xs text-rose-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Privacy Policy Text to Evaluate:
            </label>
            <textarea
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste policy text or select a preset to evaluate against legal checklists..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
            />
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="text-[11px] text-slate-400">
              Cites authoritative legal articles (e.g. GDPR Art. 17, CCPA § 1798.120, DPDP Sec. 13)
            </span>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-lg transition-all shadow-md shadow-purple-950/60 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scale className="w-4 h-4" />}
              <span>{loading ? 'Evaluating Regulatory Checklists...' : 'Run Compliance Audit'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Audit Results */}
      {result && (
        <div className="space-y-6">
          {/* Result Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center font-mono">
                <span className="text-2xl font-bold text-white">{result.overall_risk_score}</span>
                <span className="text-[9px] text-slate-400 uppercase">Risk Index</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-white">{result.target}</h2>
                  <RiskBadge level={result.risk_level} size="md" />
                </div>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  {result.summary}
                </p>
              </div>
            </div>

            <PdfExportButton scanId={result.id} label="Download Compliance PDF" />
          </div>

          {/* Legal Compliance Scorecard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-900/90 border border-emerald-900/60 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <span className="text-xl font-bold font-mono text-emerald-400">{supportedCount}</span>
                <span className="text-[11px] text-slate-300 block">Supported Requirements</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-amber-900/60 rounded-xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <span className="text-xl font-bold font-mono text-amber-400">{missingCount}</span>
                <span className="text-[11px] text-slate-300 block">Potentially Missing</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-slate-400 shrink-0" />
              <div>
                <span className="text-xl font-bold font-mono text-slate-300">{inconclusiveCount}</span>
                <span className="text-[11px] text-slate-300 block">Inconclusive / Ambiguous</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-rose-900/60 rounded-xl p-4 flex items-center gap-3">
              <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
              <div>
                <span className="text-xl font-bold font-mono text-rose-400">{conflictingCount}</span>
                <span className="text-[11px] text-slate-300 block">Directly Conflicting</span>
              </div>
            </div>
          </div>

          {/* Legal Matrix Breakdown Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Statutory Checklist Matrix</h3>
              </div>

              {/* Framework Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {['ALL', ...selectedFrameworks].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-purple-900/80 text-purple-200 border border-purple-700'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Framework</th>
                    <th className="py-2.5 px-3">Requirement</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Statutory Citation</th>
                    <th className="py-2.5 px-3">Policy Evidence & Legal Nuance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-mono">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-purple-400 font-bold">
                          {item.framework}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-200">
                        {item.requirement_title}
                      </td>
                      <td className="py-3 px-3">
                        <RiskBadge level={item.status} size="sm" />
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-cyan-400">
                        {item.citation}
                      </td>
                      <td className="py-3 px-3 text-slate-300 text-[11px] max-w-sm">
                        {item.evidence && (
                          <p className="italic text-slate-400 mb-1">"{item.evidence}"</p>
                        )}
                        <p className="text-slate-400">{item.notes}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Authoritative Notice:</strong> A policy document omission represents a documentation gap rather than a conclusive legal violation. Organizations may fulfill obligations via separate notices, consent banners, or jurisdictional addenda.
              </span>
            </div>
          </div>

          {/* Actionable Recommendations */}
          {result.findings.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Documentation Gaps & Action Items ({result.findings.length})</span>
              </h3>
              <div className="grid grid-cols-1 gap-4">
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
