import React, { useState } from 'react';
import {
  Globe,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield
} from 'lucide-react';
import { api } from '../services/api';
import FindingCard from '../components/FindingCard';
import RiskBadge from '../components/RiskBadge';
import PdfExportButton from '../components/PdfExportButton';

const SAMPLE_WEBSITES = [
  { name: 'github.com', url: 'https://github.com' },
  { name: 'cloudflare.com', url: 'https://cloudflare.com' },
  { name: 'google.com', url: 'https://google.com' },
  { name: 'badssl.com (Expired TLS)', url: 'https://expired.badssl.com' },
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
      setError(err.message || 'Website check failed');
    } finally {
      setLoading(false);
    }
  };

  const meta = result?.metadata || {};
  const tls = meta.tls_info || {};
  const checks = meta.technical_checks || [];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Website Security Checker
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Audit TLS/SSL certificate validity, automatic HTTPS redirection, and security headers.
          </p>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-neutral-400 mr-1">Presets:</span>
          {SAMPLE_WEBSITES.map((w, i) => (
            <button
              key={i}
              onClick={() => {
                setTargetUrl(w.url);
                setError('');
              }}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors"
            >
              {w.name}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-neutral-400" />
            <span className="text-xs font-semibold text-neutral-200">Inspect Target Hostname</span>
          </div>

          {/* SSRF Protection Badge */}
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[11px] font-mono">
            <Shield className="w-3 h-3 text-neutral-400" />
            <span>SSRF Protected (RFC1918 Blocked)</span>
          </div>
        </div>

        {error && (
          <div className="mb-3 p-2.5 bg-red-950/40 border border-red-800/60 rounded text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="e.g. https://github.com or example.com"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md pl-9 pr-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{loading ? 'Checking...' : 'Check Security'}</span>
          </button>
        </form>

        <p className="text-[11px] text-neutral-500 mt-2">
          Notice: HTTPS encryption alone does not prove that a website is trustworthy; operational hygiene and transport headers are required.
        </p>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-5">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-neutral-950 border border-neutral-800 flex flex-col items-center justify-center font-mono">
                <span className="text-xl font-bold text-white">{result.overall_risk_score}</span>
                <span className="text-[8px] text-neutral-400 uppercase">Score</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-base font-semibold text-white font-mono">{meta.hostname || result.target}</h2>
                  <RiskBadge level={result.risk_level} size="sm" />
                </div>
                <p className="text-xs text-neutral-300 max-w-2xl leading-relaxed">
                  {result.summary}
                </p>
                {meta.resolved_ip && (
                  <div className="text-[11px] font-mono text-neutral-400 mt-1">
                    Resolved IP: {meta.resolved_ip}
                  </div>
                )}
              </div>
            </div>

            <PdfExportButton scanId={result.id} label="Export PDF" />
          </div>

          {/* Technical Checks Table */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-neutral-800">
              <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                Technical Security Indicators
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950/70 text-neutral-400 text-[11px] font-medium border-b border-neutral-800">
                  <tr>
                    <th className="py-2.5 px-4">Indicator</th>
                    <th className="py-2.5 px-4">Result</th>
                    <th className="py-2.5 px-4">Technical Observations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80">
                  {checks.map((chk, i) => (
                    <tr key={i} className="hover:bg-neutral-800/40">
                      <td className="py-2.5 px-4 font-medium text-neutral-200">
                        {chk.name}
                      </td>
                      <td className="py-2.5 px-4">
                        <RiskBadge level={chk.status} size="sm" />
                      </td>
                      <td className="py-2.5 px-4 text-neutral-400 font-mono text-[11px]">
                        {chk.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TLS Certificate Summary */}
          {tls.status === 'passed' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <h3 className="text-xs font-semibold text-neutral-200 mb-2.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-neutral-400" />
                <span>Certificate Technical Profile</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block mb-0.5">TLS Protocol</span>
                  <span className="font-mono text-neutral-200 font-medium">{tls.tls_version || 'TLS 1.3'}</span>
                </div>
                <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block mb-0.5">Certificate Issuer</span>
                  <span className="font-mono text-neutral-200 truncate block">{tls.issuer || 'Trusted CA'}</span>
                </div>
                <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block mb-0.5">Validity Remaining</span>
                  <span className="font-mono text-neutral-200 font-medium">{tls.days_remaining} Days</span>
                </div>
                <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block mb-0.5">Cipher</span>
                  <span className="font-mono text-neutral-300 text-[10px] truncate block">{tls.cipher || 'Standard'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Remediation Findings */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-100">
              Hardening Recommendations ({result.findings.length})
            </h3>

            {result.findings.length === 0 ? (
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-6 text-center text-xs text-neutral-400">
                All inspected transport encryption and HTTP security headers passed cleanly.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
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
