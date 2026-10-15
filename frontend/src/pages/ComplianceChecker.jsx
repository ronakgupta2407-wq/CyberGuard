import React, { useState } from 'react';
import {
  Scale,
  Loader2,
  FileText,
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
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Privacy Compliance Checker
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Evaluate policy statements against statutory obligations under GDPR, CCPA/CPRA, and India's DPDP Act 2023.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-neutral-400 mr-1">Presets:</span>
          <button
            onClick={() => applyPreset('compliant')}
            className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors"
          >
            Compliant Sample
          </button>
          <button
            onClick={() => applyPreset('missing_gaps')}
            className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors"
          >
            Missing Gaps Sample
          </button>
        </div>
      </div>

      {/* Input Box */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
        <form onSubmit={handleAudit} className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Document Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Enterprise Privacy Policy"
                className="bg-neutral-950 border border-neutral-800 rounded-md px-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600 w-72 max-w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
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
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                        isChecked
                          ? 'bg-neutral-800 text-white border border-neutral-700'
                          : 'bg-neutral-950 text-neutral-500 border border-neutral-800 hover:text-neutral-300'
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
            <div className="p-2.5 bg-red-950/40 border border-red-800/60 rounded text-xs text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Policy Content
            </label>
            <textarea
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste policy text or select a preset to evaluate against legal checklists..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-3 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600 font-mono leading-relaxed"
            />
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="text-[11px] text-neutral-400">
              Evaluates statements against legal obligations (e.g. GDPR Art. 17, CCPA § 1798.120, DPDP Sec. 13)
            </span>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              <span>{loading ? 'Evaluating...' : 'Check Compliance'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-5">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-neutral-950 border border-neutral-800 flex flex-col items-center justify-center font-mono">
                <span className="text-xl font-bold text-white">{result.overall_risk_score}</span>
                <span className="text-[8px] text-neutral-400 uppercase">Risk Index</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-base font-semibold text-white">{result.target}</h2>
                  <RiskBadge level={result.risk_level} size="sm" />
                </div>
                <p className="text-xs text-neutral-300 max-w-2xl leading-relaxed">
                  {result.summary}
                </p>
              </div>
            </div>

            <PdfExportButton scanId={result.id} label="Export PDF" />
          </div>

          {/* Compliance Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
              <span className="text-[11px] text-neutral-400 font-medium block">Supported</span>
              <span className="text-xl font-semibold text-emerald-400 font-mono block mt-1">{supportedCount}</span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
              <span className="text-[11px] text-neutral-400 font-medium block">Potentially Missing</span>
              <span className="text-xl font-semibold text-amber-400 font-mono block mt-1">{missingCount}</span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
              <span className="text-[11px] text-neutral-400 font-medium block">Inconclusive</span>
              <span className="text-xl font-semibold text-neutral-300 font-mono block mt-1">{inconclusiveCount}</span>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
              <span className="text-[11px] text-neutral-400 font-medium block">Conflicting</span>
              <span className="text-xl font-semibold text-red-400 font-mono block mt-1">{conflictingCount}</span>
            </div>
          </div>

          {/* Legal Checklist Matrix */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                Statutory Requirement Matrix
              </h3>

              <div className="flex items-center gap-1 bg-neutral-950 p-0.5 rounded border border-neutral-800">
                {['ALL', ...selectedFrameworks].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-neutral-800 text-white'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950/70 text-neutral-400 text-[11px] font-medium border-b border-neutral-800">
                  <tr>
                    <th className="py-2.5 px-4">Framework</th>
                    <th className="py-2.5 px-4">Requirement</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Statutory Reference</th>
                    <th className="py-2.5 px-4">Analysis & Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80">
                  {filteredItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-neutral-800/40">
                      <td className="py-2.5 px-4 font-mono font-medium text-neutral-300">
                        {item.framework}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-neutral-200">
                        {item.requirement_title}
                      </td>
                      <td className="py-2.5 px-4">
                        <RiskBadge level={item.status} size="sm" />
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-neutral-400">
                        {item.citation}
                      </td>
                      <td className="py-2.5 px-4 text-neutral-300 text-[11px] max-w-sm">
                        {item.evidence && (
                          <p className="italic text-neutral-400 mb-0.5">"{item.evidence}"</p>
                        )}
                        <p className="text-neutral-400">{item.notes}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-neutral-950 border-t border-neutral-800/80 text-[11px] text-neutral-400 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
              <span>
                <strong>Authoritative Note:</strong> A missing policy statement represents a documentation gap, not an automatic statutory breach. Companies may maintain separate jurisdiction-specific notices or internal compliance controls.
              </span>
            </div>
          </div>

          {/* Actionable Recommendations */}
          {result.findings.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-100">
                Documentation Gaps & Next Steps ({result.findings.length})
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
