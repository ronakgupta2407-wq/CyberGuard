import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  FileText,
  Mail,
  Globe,
  Scale,
  ArrowRight,
  TrendingUp,
  Activity,
  Zap,
  Sparkles,
  Download,
  AlertTriangle
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
      setError('Please provide at least a website URL, policy passage, or email text to audit.');
      return;
    }
    setError('');
    setAuditing(true);
    try {
      const result = await api.runUnifiedAudit({
        url: unifiedInput.url,
        policyText: unifiedInput.policyText,
        emailText: unifiedInput.emailText,
        title: unifiedInput.url ? `Audit of ${unifiedInput.url}` : 'Multi-Vector Digital Audit',
      });
      onSelectScan(result);
    } catch (err) {
      setError(err.message || 'Unified audit failed');
    } finally {
      setAuditing(false);
    }
  };

  // Stats calculation
  const totalScans = scans.length;
  const criticalCount = scans.reduce((acc, s) => acc + (s.finding_counts?.Critical || 0), 0);
  const highCount = scans.reduce((acc, s) => acc + (s.finding_counts?.High || 0), 0);
  const avgScore = totalScans > 0 ? Math.round(scans.reduce((a, b) => a + b.overall_risk_score, 0) / totalScans) : 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-400 text-xs font-semibold mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>Autonomous Digital, Legal & Privacy Defense</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
            Unified Cyber & Legal Risk Intelligence
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            CyberGuard combines deterministic technical security checks with AI-assisted interpretation. Inspect live website certificates & headers, extract deceptive Terms & Conditions clauses, uncover phishing email traps, and verify compliance against GDPR, CCPA, and India's DPDP framework.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('tc')}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs tracking-wide shadow-md shadow-cyan-950 transition-colors flex items-center gap-2"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Analyze Terms & Conditions</span>
            </button>
            <button
              onClick={() => setActiveTab('phishing')}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold tracking-wide transition-colors flex items-center gap-2"
            >
              <Mail className="w-3.5 h-3.5 text-rose-400" />
              <span>Inspect Suspicious Email</span>
            </button>
            <button
              onClick={() => setActiveTab('website')}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold tracking-wide transition-colors flex items-center gap-2"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Website SSL & Headers</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Total Scans Conducted</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{totalScans}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Persisted in SQLite database</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Average Threat Score</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{avgScore}<span className="text-xs text-slate-400">/100</span></div>
          <span className="text-[11px] text-slate-400 mt-1 block">Composite cross-module index</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Critical Severity Flags</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">{criticalCount}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Immediate action recommended</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">High Risk Findings</span>
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-orange-400">{highCount}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Contractual or spoofing traps</span>
        </div>
      </div>

      {/* Module Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Module 1 */}
        <div
          onClick={() => setActiveTab('tc')}
          className="group bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-800 rounded-xl p-5 cursor-pointer transition-all shadow-lg hover:shadow-cyan-950/20 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                <FileText className="w-4 h-4" />
              </div>
              <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-cyan-400 transition-colors">
                MOD 01
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-100 mb-1.5 group-hover:text-cyan-300 transition-colors">
              AI Terms & Conditions Analyzer
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Detects unilateral modifications, indefinite retention, liability waivers, arbitration, and translates them to plain English.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-semibold pt-3 border-t border-slate-800">
            <span>Analyze Policy</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Module 2 */}
        <div
          onClick={() => setActiveTab('phishing')}
          className="group bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-rose-800 rounded-xl p-5 cursor-pointer transition-all shadow-lg hover:shadow-rose-950/20 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400">
                <Mail className="w-4 h-4" />
              </div>
              <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-rose-400 transition-colors">
                MOD 02
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-100 mb-1.5 group-hover:text-rose-300 transition-colors">
              Email Phishing Analyzer
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Inspects mismatched sender domains, display name spoofing, deceptive anchor hyperlinks, urgency coercion, and .eml files.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold pt-3 border-t border-slate-800">
            <span>Inspect Email</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Module 3 */}
        <div
          onClick={() => setActiveTab('website')}
          className="group bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-sky-800 rounded-xl p-5 cursor-pointer transition-all shadow-lg hover:shadow-sky-950/20 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400">
                <Globe className="w-4 h-4" />
              </div>
              <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-sky-400 transition-colors">
                MOD 03
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-100 mb-1.5 group-hover:text-sky-300 transition-colors">
              Website Security Checker
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              SSRF-safe DNS resolution, TLS certificate validity, HSTS, CSP, X-Frame-Options, Cookie security flags, and server leaks.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold pt-3 border-t border-slate-800">
            <span>Scan Domain</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Module 4 */}
        <div
          onClick={() => setActiveTab('compliance')}
          className="group bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-800 rounded-xl p-5 cursor-pointer transition-all shadow-lg hover:shadow-purple-950/20 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
                <Scale className="w-4 h-4" />
              </div>
              <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-purple-400 transition-colors">
                MOD 04
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-100 mb-1.5 group-hover:text-purple-300 transition-colors">
              Privacy Compliance Checker
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Maps clauses against versioned requirements of GDPR, CCPA/CPRA, and India's DPDP Act with citations and uncertainty indicators.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-purple-400 font-semibold pt-3 border-t border-slate-800">
            <span>Audit Compliance</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Quick Multi-Vector Audit Box */}
      <div className="bg-slate-900/90 border border-cyan-900/50 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h2 className="text-base font-bold text-white">Unified Multi-Vector Risk Audit (Module 05)</h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Audit an entire digital footprint in a single click by entering a website URL and optional policy text or email sample.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleRunUnified} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Website URL:</label>
              <input
                type="text"
                placeholder="https://example.com"
                value={unifiedInput.url}
                onChange={(e) => setUnifiedInput({ ...unifiedInput, url: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Terms or Privacy Policy Text (Optional):</label>
              <input
                type="text"
                placeholder="Paste policy excerpt or clause..."
                value={unifiedInput.policyText}
                onChange={(e) => setUnifiedInput({ ...unifiedInput, policyText: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Suspicious Email Text (Optional):</label>
              <input
                type="text"
                placeholder="From: ... Subject: ... Body: ..."
                value={unifiedInput.emailText}
                onChange={(e) => setUnifiedInput({ ...unifiedInput, emailText: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={auditing}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-semibold text-xs rounded-lg transition-all shadow-lg shadow-cyan-950/60 flex items-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{auditing ? 'Running Multi-Vector Audit...' : 'Execute Consolidated Risk Audit'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Recent Scans Feed */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Recent Analysis Activity (Module 06)</h2>
          </div>
          <button
            onClick={() => setActiveTab('history')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
          >
            <span>View All Scans & Compare</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-xs text-slate-400">Loading audit history...</div>
        ) : scans.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">No audits found yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Module</th>
                  <th className="py-2.5 px-4">Target / Scope</th>
                  <th className="py-2.5 px-4">Risk Rating</th>
                  <th className="py-2.5 px-4">Summary</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {scans.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-400 uppercase font-semibold">
                        {s.module_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-200 max-w-[200px] truncate">
                      {s.target || 'Digital Target'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-200">{s.overall_risk_score}</span>
                        <RiskBadge level={s.risk_level} size="sm" />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-[320px] truncate">
                      {s.summary}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={async () => {
                            const full = await api.getScanById(s.id);
                            onSelectScan(full);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
                        >
                          Details
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
