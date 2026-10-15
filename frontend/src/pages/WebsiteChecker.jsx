import React, { useState } from 'react';
import {
  Globe,
  Lock,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Server,
  KeyRound,
  ExternalLink,
  Shield
} from 'lucide-react';
import { api } from '../services/api';
import FindingCard from '../components/FindingCard';
import RiskBadge from '../components/RiskBadge';
import PdfExportButton from '../components/PdfExportButton';

const SAMPLE_WEBSITES = [
  { name: 'github.com (Modern Security)', url: 'https://github.com' },
  { name: 'google.com (Enterprise TLS)', url: 'https://google.com' },
  { name: 'cloudflare.com (Strict HSTS & CSP)', url: 'https://cloudflare.com' },
  { name: 'badssl.com (Test Expired TLS)', url: 'https://expired.badssl.com' },
];

export default function WebsiteChecker({ onScanCompleted }) {
  const [targetUrl, setTargetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!targetUrl.trim()) {
      setError('Please enter a website URL or hostname.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const scan = await api.checkWebsite(targetUrl);
      setResult(scan);
      if (onScanCompleted) onScanCompleted(scan);
    } catch (err) {
      setError(err.message || 'Website security audit failed');
    } finally {
      setLoading(false);
    }
  };

  const meta = result?.metadata || {};
  const tls = meta.tls_info || {};
  const checks = meta.technical_checks || [];

  return (
    <div className="space-y-8 pb-16">
      {/* Module Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-sky-950/80 border border-sky-800 flex items-center justify-center text-sky-400 shadow-md shadow-sky-950/50">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                  MODULE 03
                </span>
                <h1 className="text-xl font-bold text-white">Website Security & SSL/TLS Checker</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Inspect TLS certificate validity, HTTPS redirection, HSTS, CSP, X-Frame-Options, cookie security, and SSRF restrictions.
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium mr-1">Presets:</span>
            {SAMPLE_WEBSITES.map((w, i) => (
              <button
                key={i}
                onClick={() => {
                  setTargetUrl(w.url);
                  setError('');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors"
              >
                {w.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200">Inspect Target Hostname</span>
          </div>

          {/* SSRF Protection Pill */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-[10px] font-mono font-semibold">
            <Shield className="w-3 h-3" />
            <span>SSRF Guard: RFC1918 & Loopback Blocked</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-xs text-rose-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="e.g. https://github.com or example.com"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-semibold text-xs rounded-lg transition-all shadow-md shadow-sky-950/60 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>{loading ? 'Inspecting Infrastructure...' : 'Scan Website'}</span>
          </button>
        </form>

        <p className="text-[11px] text-slate-500 mt-3">
          Note: HTTPS alone does not prove that a website is trustworthy; TLS encryption must be coupled with strict transport policies and application hygiene.
        </p>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Result Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center font-mono">
                <span className="text-2xl font-bold text-white">{result.overall_risk_score}</span>
                <span className="text-[9px] text-slate-400 uppercase">Score / 100</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-white font-mono">{meta.hostname || result.target}</h2>
                  <RiskBadge level={result.risk_level} size="md" />
                </div>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  {result.summary}
                </p>
                {meta.resolved_ip && (
                  <div className="text-[11px] font-mono text-cyan-400 mt-1">
                    Resolved Public IP: <strong>{meta.resolved_ip}</strong> (Verified Safe)
                  </div>
                )}
              </div>
            </div>

            <PdfExportButton scanId={result.id} label="Download Security PDF" />
          </div>

          {/* Technical Checks Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider mb-4 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-sky-400" />
              <span>Technical Security Indicator Matrix</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Security Indicator</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Technical Observations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {checks.map((chk, i) => (
                    <tr key={i} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-semibold text-slate-200">
                        {chk.name}
                      </td>
                      <td className="py-3 px-4">
                        <RiskBadge level={chk.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                        {chk.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TLS Certificate Deep-Dive (if present) */}
          {tls.status === 'passed' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
              <h3 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>TLS Certificate Technical Profile</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block mb-1">Negotiated Protocol</span>
                  <span className="font-mono text-emerald-400 font-bold">{tls.tls_version || 'TLS 1.3'}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block mb-1">Certificate Issuer</span>
                  <span className="font-mono text-slate-200 truncate block">{tls.issuer || 'Trusted CA'}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block mb-1">Validity Remaining</span>
                  <span className="font-mono text-cyan-400 font-bold">{tls.days_remaining} Days</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block mb-1">Cipher Suite</span>
                  <span className="font-mono text-slate-300 text-[10px] truncate block">{tls.cipher || 'AEAD-GCM'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actionable Findings */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-sky-400" />
              <span>Remediation & Hardening Guidance ({result.findings.length})</span>
            </h3>

            {result.findings.length === 0 ? (
              <div className="bg-slate-900/60 border border-emerald-900/60 rounded-xl p-8 text-center text-xs text-emerald-400">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                Excellent hygiene! All inspected transport encryption and HTTP security headers passed cleanly.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {result.findings.map((f, i) => (
                  <FindingCard key={f.id || i} finding={f} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
