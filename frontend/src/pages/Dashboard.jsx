import React, { useState, useEffect } from 'react';
import {
  FileText,
  Mail,
  Globe,
  Scale,
  ArrowRight,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle,
  Plus,
  Search
} from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import PdfExportButton from '../components/PdfExportButton';

export default function Dashboard({ setActiveTab, onSelectScan }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unifiedInput, setUnifiedInput] = useState({
    url: '',
    policyText: '',
    emailText: '',
  });
  const [auditing, setAuditing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRecentScans();
  }, []);

  const loadRecentScans = async () => {
    try {
      setLoading(true);
      const data = await api.getScans(null, 10);
      setScans(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunUnified = async (e) => {
    e.preventDefault();
    if (!unifiedInput.url && !unifiedInput.policyText && !unifiedInput.emailText) {
      setError('Provide at least a website URL, policy text, or email content to audit.');
      return;
    }
    setError('');
    setAuditing(true);
    try {
      const result = await api.runUnifiedAudit({
        url: unifiedInput.url,
        policyText: unifiedInput.policyText,
        emailText: unifiedInput.emailText,
        title: unifiedInput.url ? `Audit: ${unifiedInput.url}` : 'Multi-Vector Audit',
      });
      onSelectScan(result);
    } catch (err) {
      setError(err.message || 'Audit failed');
    } finally {
      setAuditing(false);
    }
  };

  const totalScans = scans.length;
  const criticalCount = scans.reduce((acc, s) => acc + (s.finding_counts?.Critical || 0), 0);
  const highCount = scans.reduce((acc, s) => acc + (s.finding_counts?.High || 0), 0);
  const avgScore = totalScans > 0 ? Math.round(scans.reduce((a, b) => a + b.overall_risk_score, 0) / totalScans) : 0;

  return (
    <div className="space-y-6 pb-16">
      {/* Page Title & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Security & Compliance Overview
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Deterministic security verification and policy clause analysis across your digital footprint.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tc')}
            className="px-3 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-colors"
          >
            New Policy Scan
          </button>
          <button
            onClick={() => setActiveTab('website')}
            className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
          >
            Scan Website
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <span className="text-xs text-neutral-400 font-medium block">Total Scans Recorded</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white">{totalScans}</span>
            <span className="text-[11px] text-neutral-400">audits logged</span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <span className="text-xs text-neutral-400 font-medium block">Average Risk Index</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white">{avgScore}</span>
            <span className="text-[11px] text-neutral-400">/ 100 benchmark</span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <span className="text-xs text-neutral-400 font-medium block">High Severity Risks</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-orange-400">{highCount}</span>
            <span className="text-[11px] text-neutral-400">concerning clauses</span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
          <span className="text-xs text-neutral-400 font-medium block">Critical Threats</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-red-400">{criticalCount}</span>
            <span className="text-[11px] text-neutral-400">urgent actions</span>
          </div>
        </div>
      </div>

      {/* Module Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Module 1 */}
        <div
          onClick={() => setActiveTab('tc')}
          className="bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 rounded-lg p-4 cursor-pointer transition-colors flex flex-col justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center text-neutral-300 mb-3">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">
              Terms & Conditions
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Detect unilateral contract updates, arbitration waivers, auto-renewals, and liability disclaimers.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
            <span>Analyze text or PDF</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Module 2 */}
        <div
          onClick={() => setActiveTab('phishing')}
          className="bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 rounded-lg p-4 cursor-pointer transition-colors flex flex-col justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center text-neutral-300 mb-3">
              <Mail className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">
              Email Phishing
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Identify mismatched sender domains, deceptive link text, coercive deadlines, and credential harvesting.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
            <span>Inspect email or .eml</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Module 3 */}
        <div
          onClick={() => setActiveTab('website')}
          className="bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 rounded-lg p-4 cursor-pointer transition-colors flex flex-col justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center text-neutral-300 mb-3">
              <Globe className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">
              Website Security
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Verify SSL/TLS certificate validity, HSTS, CSP, and security headers with SSRF protection.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
            <span>Check hostname</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Module 4 */}
        <div
          onClick={() => setActiveTab('compliance')}
          className="bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 rounded-lg p-4 cursor-pointer transition-colors flex flex-col justify-between"
        >
          <div>
            <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center text-neutral-300 mb-3">
              <Scale className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">
              Privacy Compliance
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Audit policies against GDPR, CCPA/CPRA, and India's DPDP Act 2023 with statutory citations.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
            <span>Audit against rules</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Quick Multi-Vector Scanner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-white">Unified Digital Risk Audit</h2>
          <p className="text-xs text-neutral-400">Audit website infrastructure, privacy terms, and email artifacts simultaneously.</p>
        </div>

        {error && (
          <div className="mb-3 p-2.5 bg-red-950/40 border border-red-800/60 rounded text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleRunUnified} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Target Website URL</label>
              <input
                type="text"
                placeholder="https://example.com"
                value={unifiedInput.url}
                onChange={(e) => setUnifiedInput({ ...unifiedInput, url: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Policy Text (Optional)</label>
              <input
                type="text"
                placeholder="Paste terms excerpt..."
                value={unifiedInput.policyText}
                onChange={(e) => setUnifiedInput({ ...unifiedInput, policyText: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Suspicious Email (Optional)</label>
              <input
                type="text"
                placeholder="From, Subject, or email body..."
                value={unifiedInput.emailText}
                onChange={(e) => setUnifiedInput({ ...unifiedInput, emailText: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={auditing}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-md transition-colors disabled:opacity-50"
            >
              {auditing ? 'Scanning...' : 'Execute Audit'}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Scans Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-neutral-400" />
            <h2 className="text-sm font-semibold text-white">Recent Audits</h2>
          </div>
          <button
            onClick={() => setActiveTab('history')}
            className="text-xs text-neutral-400 hover:text-neutral-200 transition-colors flex items-center gap-1"
          >
            <span>Full audit log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-xs text-neutral-400">Loading audit history...</div>
        ) : scans.length === 0 ? (
          <div className="text-center py-8 text-xs text-neutral-400">No audits recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/70 text-neutral-400 text-[11px] font-medium border-b border-neutral-800">
                <tr>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Target</th>
                  <th className="py-2.5 px-4">Risk Level</th>
                  <th className="py-2.5 px-4">Observations</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80">
                {scans.map((s) => (
                  <tr key={s.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-medium">
                        {s.module_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-neutral-200 max-w-[200px] truncate">
                      {s.target || 'Digital Target'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-neutral-300 font-medium">{s.overall_risk_score}</span>
                        <RiskBadge level={s.risk_level} size="sm" />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-400 max-w-[320px] truncate">
                      {s.summary}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={async () => {
                            const full = await api.getScanById(s.id);
                            onSelectScan(full);
                          }}
                          className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
                        >
                          View
                        </button>
                        <PdfExportButton scanId={s.id} variant="outline" label="PDF" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
