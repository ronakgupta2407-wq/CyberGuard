import React, { useState } from 'react';
import {
  Mail,
  Upload,
  AlertTriangle,
  Loader2,
  Link2,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import FindingCard from '../components/FindingCard';
import RiskBadge from '../components/RiskBadge';
import PdfExportButton from '../components/PdfExportButton';
import ExecutiveSummary from '../components/ExecutiveSummary';
import { cleanDomain } from '../utils/formatters';

const SAMPLE_EMAILS = {
  bank_phish: {
    title: 'Bank Verification Notice',
    sender: 'Chase Support <no-reply@chase-account-update.xyz>',
    replyTo: 'harvester-inbox@mail-server.top',
    subject: 'Action Required: Verify Account Access Within 24 Hours',
    body: `Dear Chase Customer,

We have detected unusual activity on your checking account. For your protection, account access has been temporarily restricted.

Immediate action is required: Failure to verify your login credentials within 24 hours will result in permanent account suspension.

Please verify your identity using the link below:
http://chase-security-verify.xyz/login.php

Thank you,
Chase Security Team`,
  },
  ceo_giftcard: {
    title: 'Executive Wire / Gift Card Prompt',
    sender: 'Tim Cook <ceo.office.apple@company-executives.click>',
    replyTo: 'personal.timcook42@gmail.com',
    subject: 'Urgent task - Are you available right now?',
    body: `Hi,

I am currently in an offsite meeting and cannot take calls. I need you to handle a confidential task immediately.

Please purchase 5 Apple Gift Cards of $200 each and email me the photos of the redemption codes on the back right away. I will reimburse you by tomorrow morning through payroll.

Treat this with utmost urgency and discretion.

Best regards,
Tim Cook`,
  },
  legit_notice: {
    title: 'GitHub Security Notification',
    sender: 'GitHub <support@github.com>',
    replyTo: 'support@github.com',
    subject: '[GitHub] A new personal access token was generated',
    body: `Hi developer,

We wanted to let you know that a new personal access token was recently created on your GitHub account.

Token name: dev-laptop-cli
Created on: October 15, 2026

If you created this token, no further action is necessary. If you did not initiate this request, please visit https://github.com/settings/tokens to revoke it immediately.

Thanks,
The GitHub Team`,
  },
};

export default function PhishingAnalyzer({ onScanCompleted }) {
  const [mode, setMode] = useState('fields');
  const [sender, setSender] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!body.trim() && !subject.trim()) {
      setError('Please provide at least the email subject or body text.');
      return;
    }
    setError(''); setLoading(true);
    try {
      const scan = await api.analyzePhishing({ sender, replyTo, subject, body });
      setResult(scan);
      if (onScanCompleted) onScanCompleted(scan);
    } catch (err) {
      setError(err.message || 'Phishing analysis failed');
    } finally { setLoading(false); }
  };

  const handleUploadEml = async (e) => {
    e.preventDefault();
    if (!selectedFile) { setError('Please select an .eml or raw email text file.'); return; }
    setError(''); setLoading(true);
    try {
      const scan = await api.uploadEmlFile(selectedFile);
      setResult(scan);
      if (onScanCompleted) onScanCompleted(scan);
    } catch (err) {
      setError(err.message || 'EML upload failed');
    } finally { setLoading(false); }
  };

  const applyPreset = (key) => {
    const p = SAMPLE_EMAILS[key];
    setSender(p.sender); setReplyTo(p.replyTo);
    setSubject(p.subject); setBody(p.body);
    setMode('fields'); setError('');
  };

  const meta = result?.metadata || {};
  const inspectedUrls = meta.inspected_urls || [];

  return (
    <div className="space-y-6 pb-20">
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Email Threat Inspector</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Examine sender identity, reply-to mismatches, suspicious links, brand impersonation, and common social-engineering tactics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1 font-medium">Examples:</span>
            {Object.entries({ bank_phish: 'Bank Alert', ceo_giftcard: 'CEO Gift Card', legit_notice: 'Legitimate Notice' }).map(([key, label]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── INPUT PANEL ─────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {/* Mode tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-2 pr-4">
          <div className="flex items-center gap-0">
            {[
              { m: 'fields', icon: Mail, label: 'Email Headers & Text' },
              { m: 'eml', icon: Upload, label: 'Upload .EML File' },
            ].map(({ m, icon: Icon, label }) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold transition-colors border-b-2 ${
                  mode === m
                    ? 'border-rose-500 text-rose-400 bg-rose-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'fields' ? (
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Sender Email Address (From)</label>
                  <input
                    type="text"
                    placeholder="e.g. PayPal Support <support@paypal-security.xyz>"
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500 placeholder:text-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Reply-To Address (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. response-inbox@mail-server.top"
                    value={replyTo}
                    onChange={(e) => setReplyTo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500 placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Subject Line</label>
                <input
                  type="text"
                  placeholder="e.g. Action Required: Please verify your account access"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500 placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Body Content</label>
                <textarea
                  rows={8}
                  placeholder="Paste the email body or full raw message text..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 leading-relaxed placeholder:text-slate-600 resize-none font-sans"
                />
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-xs text-slate-500">
                  Evaluates brand impersonation, urgent deadlines, and malicious links via Groq LLM
                </span>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                  <span>{loading ? 'Inspecting email...' : 'Inspect Email'}</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleUploadEml} className="space-y-4">
              <div className="border border-dashed border-slate-800 hover:border-rose-500/50 rounded-2xl p-10 text-center transition-colors bg-slate-950/40">
                <Upload className="w-8 h-8 mx-auto text-slate-500 mb-2.5" />
                <p className="text-sm text-slate-200 mb-1 font-semibold">
                  {selectedFile ? selectedFile.name : 'Upload .EML or .MSG email export file'}
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  Parses RFC 822 email headers and attachments safely without executing scripts.
                </p>
                <input type="file" accept=".eml,.msg,.txt" id="eml-file" className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files[0])} />
                <label htmlFor="eml-file"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer transition-colors inline-block">
                  Browse .EML Files
                </label>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={loading || !selectedFile}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>{loading ? 'Parsing message...' : 'Upload & Analyze .EML'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ── RESULTS ─────────────────────────────────────────────── */}
      {result && (
        <div className="space-y-5">
          {/* Result Header */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-rose-400">{result.overall_risk_score}</span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Risk Score</span>
                </div>
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <h2 className="text-lg font-bold text-white">{cleanDomain(result.target) || 'Email Analysis Result'}</h2>
                    <RiskBadge level={result.risk_level} size="sm" />
                  </div>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">{result.summary}</p>
                </div>
              </div>
              <PdfExportButton scanId={result.id} label="Download PDF Report" />
            </div>
          </div>

          <ExecutiveSummary scan={result} />

          {/* URL Extraction Table */}
          {inspectedUrls.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">Extracted Hyperlink Destinations</span>
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-medium">{inspectedUrls.length}</span>
                </div>
                <span className="text-xs text-slate-500">Evaluated passively without making outbound connections</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                    <tr>
                      <th className="py-2 px-4 w-12">#</th>
                      <th className="py-2 px-4">Target Destination URL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {inspectedUrls.map((u, i) => (
                      <tr key={i} className="hover:bg-slate-800/40">
                        <td className="py-2 px-4 text-slate-500">{String(i + 1).padStart(2, '0')}</td>
                        <td className="py-2 px-4 text-slate-300 truncate max-w-xl">{u}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Findings */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Warning Signs &amp; Threat Indicators</span>
              <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-medium">{result.findings.length}</span>
            </h3>
            {result.findings.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
                No phishing indicators or deceptive patterns detected in this email.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {result.findings.map((f, i) => <FindingCard key={f.id || i} finding={f} />)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
