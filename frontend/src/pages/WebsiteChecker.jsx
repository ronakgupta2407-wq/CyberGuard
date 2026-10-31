import React, { useState } from 'react';
import {
  Globe,
  LockKeyhole,
  Loader2,
  AlertCircle,
  Shield,
  KeyRound,
  ShieldCheck,
  Radar,
} from 'lucide-react';
import { api } from '../services/api';
import FindingCard from '../components/FindingCard';
import RiskBadge from '../components/RiskBadge';
import PdfExportButton from '../components/PdfExportButton';
import ExecutiveSummary from '../components/ExecutiveSummary';
import { cleanDomain } from '../utils/formatters';

const SAMPLE_WEBSITES = [
  { name: 'github.com', url: 'https://github.com' },
  { name: 'cloudflare.com', url: 'https://cloudflare.com' },
  { name: 'google.com', url: 'https://google.com' },
  { name: 'badssl.com', url: 'https://expired.badssl.com' },
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
      setTargetUrl('');
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
  const hostname = meta.hostname || cleanDomain(result?.target);

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-800/80 pb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">Security tools</span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-white tracking-tight">Website security</h1>
          <p className="mt-1.5 text-sm text-slate-400">Assess TLS certificates, HTTPS enforcement, security headers, and other visible protections.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm sm:p-6">
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-800/60 bg-red-950/40 p-3 text-sm text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Globe className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              aria-label="Website address"
              placeholder="https://example.com"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="form-field h-12 pl-11"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="website-action-button inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            <span>{loading ? 'Checking website...' : 'Check website'}</span>
          </button>
        </form>

        {loading && (
          <div
            role="status"
            aria-live="polite"
            className="scan-loading-panel mt-5 overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5 sm:p-6"
          >
            <div className="flex items-center gap-4">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
                <Radar className="h-6 w-6 text-emerald-500" />
                <span className="absolute inset-0 rounded-2xl border border-emerald-400/60 scan-radar-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-200">
                  Checking website security
                </p>
                <p className="mt-1 truncate text-sm text-slate-500">
                  Reviewing {cleanDomain(targetUrl)} for connection and security settings…
                </p>
              </div>
              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-emerald-500" aria-hidden="true" />
            </div>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-emerald-500/10">
              <div className="scan-loading-bar h-full w-1/3 rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500">Try an example</span>
          {SAMPLE_WEBSITES.map((website) => (
            <button
              key={website.url}
              type="button"
              onClick={() => {
                setTargetUrl(website.url);
                setError('');
              }}
              className="rounded-full border border-slate-800 px-2.5 py-1 text-xs text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-200"
            >
              {website.name}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-sm">
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-transparent" />
            <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                  <ShieldCheck className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500">Website assessment</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-lg font-semibold text-white">{hostname}</h2>
                    <RiskBadge level={result.risk_level} size="sm" />
                  </div>
                  <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-300 line-clamp-2">{result.summary}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center justify-between gap-5 border-t border-slate-800 pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
                <div className="text-left sm:text-right">
                  <span className="block text-2xl font-semibold tabular-nums text-white">{result.overall_risk_score}</span>
                  <span className="text-xs text-slate-500">Risk score</span>
                </div>
                <PdfExportButton scanId={result.id} label="Export report" />
              </div>
            </div>
          </section>

          <ExecutiveSummary scan={result} />

          {checks.length > 0 && (
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-emerald-400">
                  <LockKeyhole className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Security checks</h3>
                  <p className="text-xs text-slate-500">Encryption and browser protections</p>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {checks.map((check, index) => (
                  <div key={`${check.name}-${index}`} className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm font-medium text-slate-200">{check.name}</span>
                      <RiskBadge level={check.status} size="sm" />
                    </div>
                    {check.details && (
                      <p className="mt-2 text-xs leading-relaxed text-slate-500 line-clamp-2">{check.details}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* TLS Certificate Profile */}
          {tls.status === 'passed' && (
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-cyan-400">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Certificate details</h3>
                  <p className="text-xs text-slate-500">Secure connection information</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'Protocol', value: tls.tls_version || 'TLS 1.3' },
                  { label: 'Certificate issuer', value: tls.issuer || 'Trusted CA' },
                  { label: 'Valid for', value: `${tls.days_remaining ?? '—'} days` },
                  { label: 'Cipher suite', value: tls.cipher || 'Standard AES-GCM' },
                ].map((detail) => (
                  <div key={detail.label} className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                    <span className="mb-1 block text-xs text-slate-500">{detail.label}</span>
                    <span className="block truncate text-sm font-medium text-slate-200" title={detail.value}>{detail.value}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Recommended improvements</h3>
                <p className="mt-0.5 text-xs text-slate-500">Practical steps to strengthen this website</p>
              </div>
              <span className="rounded-full border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-slate-400">
                {result.findings.length}
              </span>
            </div>
            {result.findings.length === 0 ? (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-900/60 bg-emerald-950/20 p-4">
                <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />
                <p className="text-sm text-emerald-100">No security issues were identified in this scan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {result.findings.map((finding, index) => (
                  <FindingCard key={finding.id || index} finding={finding} defaultExpanded={false} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
