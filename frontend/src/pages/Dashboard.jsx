import React, { useState, useEffect } from 'react';
import {
  FileText,
  Mail,
  Globe,
  Scale,
  ArrowRight,
  Activity,
  AlertTriangle,
  Shield,
  BarChart2,
  TrendingUp,
  ExternalLink,
  ShieldAlert,
  Layers,
  RotateCcw,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import PdfExportButton from '../components/PdfExportButton';
import ExecutiveSummary from '../components/ExecutiveSummary';
import { cleanDomain, formatScanDate } from '../utils/formatters';

const MODULES = [
  {
    id: 'tc',
    icon: FileText,
    title: 'Terms & Privacy Review',
    desc: 'Uncover one-sided clauses, unclear renewals, and privacy terms that deserve a closer look.',
    action: 'Analyze Terms',
  },
  {
    id: 'phishing',
    icon: Mail,
    title: 'Email Threat Analysis',
    desc: 'Spot suspicious senders, deceptive links, and social-engineering signals before you respond.',
    action: 'Inspect Email',
  },
  {
    id: 'website',
    icon: Globe,
    title: 'Website Security Check',
    desc: 'Assess TLS certificates, HTTPS protections, security headers, and exposed server details.',
    action: 'Check Website',
  },
  {
    id: 'compliance',
    icon: Scale,
    title: 'Privacy Compliance Audit',
    desc: 'Compare privacy disclosures with key GDPR, CCPA/CPRA, and India DPDP requirements.',
    action: 'Audit Compliance',
  },
];

export default function Dashboard({ setActiveTab, onSelectScan, lastScan, onReset }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unifiedInput, setUnifiedInput] = useState({ url: '', policyText: '', emailText: '' });
  const [auditing, setAuditing] = useState(false);
  const [error, setError] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [latestAuditHidden, setLatestAuditHidden] = useState(
    () => localStorage.getItem('cyberguard_latest_audit_hidden') === 'true',
  );

  useEffect(() => {
    loadRecentScans();
  }, []);

  const loadRecentScans = async () => {
    try {
      setLoading(true);
      const data = await api.getScans(null, 50);
      setScans(data);
    } catch (e) {
      console.error('Failed to load dashboard scans:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunUnified = async (e) => {
    e.preventDefault();
    if (!unifiedInput.url && !unifiedInput.policyText && !unifiedInput.emailText) {
      setError('Please provide a website URL, policy text, or email content.');
      return;
    }
    setError('');
    setResetMessage('');
    setAuditing(true);
    try {
      const result = await api.runUnifiedAudit({
        url: unifiedInput.url,
        policyText: unifiedInput.policyText,
        emailText: unifiedInput.emailText,
        title: unifiedInput.url ? `Audit: ${cleanDomain(unifiedInput.url)}` : 'Multi-Vector Audit',
      });
      loadRecentScans();
      onSelectScan(result);
    } catch (err) {
      setError(err.message || 'Audit failed');
    } finally {
      setAuditing(false);
    }
  };

  const handleResetDashboard = async () => {
    if (!window.confirm('This permanently deletes all saved scan history and findings. Continue?')) return;

    setResetting(true);
    setResetError('');
    setResetMessage('');
    setError('');
    try {
      await api.deleteAllScans();
      setScans([]);
      setUnifiedInput({ url: '', policyText: '', emailText: '' });
      setError('');
      setResetMessage('Dashboard reset. All saved scan data has been deleted.');
      onReset();
    } catch (err) {
      setResetError(err.message || 'Failed to reset dashboard data.');
    } finally {
      setResetting(false);
    }
  };

  // Metrics
  const totalScans = scans.length;
  const criticalCount = scans.reduce((acc, s) => acc + (s.finding_counts?.Critical || 0), 0);
  const highCount = scans.reduce((acc, s) => acc + (s.finding_counts?.High || 0), 0);
  const medCount = scans.reduce((acc, s) => acc + (s.finding_counts?.Medium || 0), 0);
  const lowCount = scans.reduce((acc, s) => acc + (s.finding_counts?.Low || 0), 0);
  const avgScore = totalScans > 0
    ? Math.round(scans.reduce((a, b) => a + b.overall_risk_score, 0) / totalScans)
    : 0;

  const latestScan = lastScan || (scans.length > 0 ? scans[0] : null);
  const toggleLatestAudit = () => {
    setLatestAuditHidden((hidden) => {
      const nextHidden = !hidden;
      localStorage.setItem('cyberguard_latest_audit_hidden', String(nextHidden));
      return nextHidden;
    });
  };

  const moduleLastScans = MODULES.reduce((acc, mod) => {
    acc[mod.id] = scans.find(s => s.module_type === mod.id) || null;
    return acc;
  }, {});

  // Timeline chart data using cleanDomain
  const timelineData = [...scans].slice(0, 8).reverse().map((s, idx) => ({
    name: `#${idx + 1}`,
    domain: cleanDomain(s.target),
    score: s.overall_risk_score,
    level: s.risk_level,
  }));

  const severityData = [
    { name: 'Critical', count: criticalCount, color: '#ef4444' },
    { name: 'High', count: highCount, color: '#f97316' },
    { name: 'Medium', count: medCount, color: '#eab308' },
    { name: 'Low', count: lowCount, color: '#06b6d4' },
  ];

  return (
    <div className="dashboard-enter space-y-8 pb-16">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Your security, at a glance
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Review recent findings or launch a focused audit across websites, policies, and email.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleResetDashboard}
            disabled={resetting}
            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-300 text-sm font-medium border border-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{resetting ? 'Resetting...' : 'Reset Dashboard'}</span>
          </button>
          <button
            onClick={() => setActiveTab('website')}
            className="website-action-button px-3.5 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            <span>Check Website</span>
          </button>
          <button
            onClick={() => setActiveTab('phishing')}
            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-medium border border-slate-800 transition-colors flex items-center gap-2"
          >
            <Mail className="w-4 h-4 text-slate-400" />
            <span>Inspect Email</span>
          </button>
          <button
            onClick={() => setActiveTab('tc')}
            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-medium border border-slate-800 transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Audit Terms</span>
          </button>
        </div>
      </div>

      {(resetError || resetMessage) && (
        <p
          role={resetError ? 'alert' : 'status'}
          className={`-mt-5 text-sm ${resetError ? 'text-rose-400' : 'text-emerald-400'}`}
        >
          {resetError || resetMessage}
        </p>
      )}

      {/* ── LATEST SCAN ASSESSMENT HIGHLIGHT ────────────────────── */}
      {latestScan && !latestAuditHidden && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Latest Audit
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700 font-medium capitalize">
                {latestScan.module_type === 'tc' ? 'Terms & Policy' :
                 latestScan.module_type === 'phishing' ? 'Email Threat' :
                 latestScan.module_type === 'website' ? 'Website Security' :
                 latestScan.module_type === 'compliance' ? 'Privacy Compliance' : latestScan.module_type}
              </span>
              <span className="text-xs text-slate-500">
                {formatScanDate(latestScan.created_at)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleLatestAudit}
                aria-label="Hide latest audit"
                title="Hide latest audit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-cyan-500/40 hover:bg-slate-700 hover:text-cyan-200"
              >
                <EyeOff className="h-3.5 w-3.5" />
                <span>Hide</span>
              </button>
              <button
                onClick={async () => {
                  const full = await api.getScanById(latestScan.id);
                  onSelectScan(full);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5 border border-slate-700/80"
              >
                <span>Full Report</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <PdfExportButton scanId={latestScan.id} label="PDF" />
            </div>
          </div>

          <ExecutiveSummary scan={latestScan} />
        </div>
      )}
      {latestScan && latestAuditHidden && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
          <p className="text-xs text-slate-400">Latest audit is hidden from the dashboard. Your scan and report are unchanged.</p>
          <button
            type="button"
            onClick={toggleLatestAudit}
            className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-200 transition-colors hover:border-cyan-400/50 hover:bg-cyan-500/20"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Show latest audit</span>
          </button>
        </div>
      )}

      {/* ── KEY METRICS CARDS ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Audits', value: totalScans, sub: 'assessments', icon: Layers, color: 'text-white' },
          { label: 'Average Risk', value: `${avgScore}/100`, sub: 'fleet score', icon: Activity, color: 'text-cyan-400' },
          { label: 'High Priority', value: highCount, sub: 'issues flagged', icon: AlertTriangle, color: 'text-amber-400' },
          { label: 'Critical Threats', value: criticalCount, sub: 'urgent action', icon: ShieldAlert, color: 'text-rose-400' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">{label}</span>
              <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400">
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold tracking-tight ${color}`}>{value}</span>
              <span className="text-[11px] text-slate-500">{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── CHARTS ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Risk Score Trajectory Line Chart */}
        <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">
                Risk Trend
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">Lower is safer (0 - 100)</span>
          </div>

          <div className="h-48 w-full">
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="domain"
                    stroke="#64748b"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="#64748b"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090d16',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                    labelStyle={{ color: '#38bdf8' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ fill: '#06b6d4', r: 3.5 }}
                    activeDot={{ r: 5, fill: '#38bdf8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-500">
                No audit data logged yet.
              </div>
            )}
          </div>
        </div>

        {/* Severity Distribution Bar Chart */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">
                Severity Breakdown
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">Active Findings</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── SECURITY MODULES ─────────────────────────────────────── */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-4">
          <h3 className="text-lg font-semibold text-white">
            Security checks
          </h3>
          <span className="text-sm text-slate-500">          Select a focused assessment to get started</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {MODULES.map(({ id, icon: Icon, title, desc, action }) => {
            const last = moduleLastScans[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className="min-h-56 text-left bg-slate-900/80 border border-slate-800 hover:border-slate-600 hover:bg-slate-900 rounded-xl p-5 flex flex-col justify-between group transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/70 flex items-center justify-center text-slate-300 group-hover:text-blue-300 group-hover:border-blue-500/40 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    {last ? (
                      <RiskBadge level={last.risk_level} size="sm" />
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-medium">
                        No scans
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-semibold text-white mb-2">{title}</h4>
                  <p className="text-sm text-slate-400 leading-6">{desc}</p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-sm text-slate-300 group-hover:text-blue-300 transition-colors">
                  <span className="font-medium">{action}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── QUICK MULTI-VECTOR AUDIT ────────────────────────────── */}
      <section className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-semibold text-white">
              Combined audit
            </h3>
          </div>
          <span className="text-sm text-slate-500">Check a website, policy, and email together</span>
        </div>

        {error && (
          <div className="mb-3 p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRunUnified} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Website address</label>
              <input
                type="url"
                aria-label="Website address"
                placeholder="https://example.com"
                value={unifiedInput.url}
                onChange={(e) => setUnifiedInput({ ...unifiedInput, url: e.target.value })}
                className="form-field h-12"
              />
              <p className="mt-2 text-xs text-slate-500">Include the full link, or enter a domain name.</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Policy or terms <span className="font-normal text-slate-500">· optional</span></label>
              <textarea
                rows={5}
                aria-label="Policy or terms text"
                placeholder="Paste a privacy policy or terms excerpt here..."
                value={unifiedInput.policyText}
                onChange={(e) => setUnifiedInput({ ...unifiedInput, policyText: e.target.value })}
                className="form-field min-h-36 resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Email message <span className="font-normal text-slate-500">· optional</span></label>
              <textarea
                rows={5}
                aria-label="Email message"
                placeholder="Paste the email text you want to check..."
                value={unifiedInput.emailText}
                onChange={(e) => setUnifiedInput({ ...unifiedInput, emailText: e.target.value })}
                className="form-field min-h-36 resize-y"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={auditing}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-900/15 transition-all hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-md disabled:cursor-wait disabled:opacity-70"
            >
              {auditing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Running Audit...
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5" />
                  Run Audit
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* ── RECENT ASSESSMENTS TABLE ────────────────────────────── */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">
              Recent Assessments
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('history')}
            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1 font-medium"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-xs text-slate-500">Loading history...</div>
        ) : scans.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <p className="text-xs">No audits logged yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium">
                <tr>
                  <th className="py-2.5 px-4">Target Scope</th>
                  <th className="py-2.5 px-4">Module</th>
                  <th className="py-2.5 px-4">Risk Level</th>
                  <th className="py-2.5 px-4">Key Summary</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {scans.slice(0, 8).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      <span className="font-mono">{cleanDomain(s.target)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/80 font-medium capitalize">
                        {s.module_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-300 font-bold text-xs">{s.overall_risk_score}</span>
                        <RiskBadge level={s.risk_level} size="sm" />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-[280px] truncate">
                      {s.summary}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={async () => {
                            const full = await api.getScanById(s.id);
                            onSelectScan(full);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
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
