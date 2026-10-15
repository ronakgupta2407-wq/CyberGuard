import React, { useState } from 'react';
import {
  Mail,
  Upload,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  ExternalLink,
  Link2,
  FileCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import FindingCard from '../components/FindingCard';
import RiskBadge from '../components/RiskBadge';
import PdfExportButton from '../components/PdfExportButton';

const SAMPLE_EMAILS = {
  bank_phish: {
    title: 'Chase Bank Impersonation (High Risk)',
    sender: 'Chase Security Alert <no-reply@chase-account-update.xyz>',
    replyTo: 'harvester-inbox@mail-server.top',
    subject: 'URGENT: Unauthorized Transaction Detected - Action Required Within 24 Hours',
    body: `Dear Chase Customer,

We have detected suspicious and unauthorized activity on your checking account ending in #4091. For your security, access has been temporarily restricted.

Immediate action is required: Failure to verify your login credentials and billing details within 24 hours will result in permanent account termination.

Please log in immediately to verify your identity:
http://chase-security-verify.xyz/login.php

Thank you,
Chase Fraud Prevention Department`,
  },
  ceo_giftcard: {
    title: 'Executive Wire / Gift Card Fraud (High Risk)',
    sender: 'Tim Cook <ceo.office.apple@company-executives.click>',
    replyTo: 'personal.timcook42@gmail.com',
    subject: 'Urgent task - Are you available right now?',
    body: `Hi,

I am currently in an urgent offsite board meeting and cannot take calls. I need you to handle a confidential task immediately. 

Please purchase 5 Apple Gift Cards of $200 each and email me the photos of the redemption codes on the back right away. I will reimburse you by tomorrow morning through payroll.

Treat this with utmost urgency and discretion.

Best regards,
Tim Cook
Chief Executive Officer`,
  },
  legit_notice: {
    title: 'GitHub Security Alert (Legitimate / Safe)',
    sender: 'GitHub <support@github.com>',
    replyTo: 'support@github.com',
    subject: '[GitHub] A new personal access token was generated',
    body: `Hi developer,

We wanted to let you know that a new personal access token (classic) was recently created on your GitHub account.

Token name: dev-laptop-cli
Created on: October 15, 2026

If you created this token, no further action is necessary. If you did not initiate this request, please visit https://github.com/settings/tokens to revoke it immediately.

Thanks,
The GitHub Team`,
  },
};

export default function PhishingAnalyzer({ onScanCompleted }) {
  const [mode, setMode] = useState('fields'); // 'fields' | 'eml'
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
    setError('');
    setLoading(true);
    try {
      const scan = await api.analyzePhishing({
        sender,
        replyTo,
        subject,
        body,
      });
      setResult(scan);
      if (onScanCompleted) onScanCompleted(scan);
    } catch (err) {
      setError(err.message || 'Phishing analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadEml = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select an .eml or raw email text file.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const scan = await api.uploadEmlFile(selectedFile);
      setResult(scan);
      if (onScanCompleted) onScanCompleted(scan);
    } catch (err) {
      setError(err.message || 'EML upload failed');
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (key) => {
    const p = SAMPLE_EMAILS[key];
    setSender(p.sender);
    setReplyTo(p.replyTo);
    setSubject(p.subject);
    setBody(p.body);
    setMode('fields');
    setError('');
  };

  const meta = result?.metadata || {};
  const inspectedUrls = meta.inspected_urls || [];

  return (
    <div className="space-y-8 pb-16">
      {/* Module Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-rose-950/80 border border-rose-800 flex items-center justify-center text-rose-400 shadow-md shadow-rose-950/50">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                  MODULE 02
                </span>
                <h1 className="text-xl font-bold text-white">Email Phishing & Threat Analyzer</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Inspect sender authenticity, header mismatches, spoofed display names, deceptive hyperlinks, and psychological coercion triggers.
              </p>
            </div>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium mr-1">Load Presets:</span>
            <button
              onClick={() => applyPreset('bank_phish')}
              className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/80 text-xs transition-colors"
            >
              Fake Bank Alert
            </button>
            <button
              onClick={() => applyPreset('ceo_giftcard')}
              className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/80 text-xs transition-colors"
            >
              CEO Gift Card Scam
            </button>
            <button
              onClick={() => applyPreset('legit_notice')}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/80 text-xs transition-colors"
            >
              Legitimate Notice
            </button>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-5 border-b border-slate-800 pb-4">
          <button
            onClick={() => setMode('fields')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'fields'
                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Header & Content</span>
          </button>
          <button
            onClick={() => setMode('eml')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'eml'
                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload .EML / Raw File</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-xs text-rose-300">
            {error}
          </div>
        )}

        {mode === 'fields' ? (
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  From (Sender Header):
                </label>
                <input
                  type="text"
                  placeholder='e.g. PayPal Support <support@paypaI-updates.com>'
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Reply-To (Optional Header):
                </label>
                <input
                  type="text"
                  placeholder='e.g. responses@malicious-box.xyz'
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Subject Line:
              </label>
              <input
                type="text"
                placeholder="e.g. Urgent Notice: Your account will be closed in 24 hours"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Body Text (or HTML):
              </label>
              <textarea
                rows={7}
                placeholder="Paste the email body content or full raw message text..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500 font-mono leading-relaxed"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold text-xs rounded-lg transition-all shadow-md shadow-rose-950/60 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                <span>{loading ? 'Inspecting Threat Vectors...' : 'Analyze Email For Phishing'}</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleUploadEml} className="space-y-4">
            <div className="border-2 border-dashed border-slate-800 hover:border-rose-700/70 rounded-xl p-8 text-center transition-colors">
              <Upload className="w-8 h-8 mx-auto text-slate-500 mb-2" />
              <p className="text-xs text-slate-300 mb-1 font-medium">
                {selectedFile ? selectedFile.name : 'Select a raw .EML or .MSG email export file'}
              </p>
              <p className="text-[11px] text-slate-500 mb-4">
                CyberGuard extracts headers, MIME attachments, and body parts safely without rendering active scripts.
              </p>
              <input
                type="file"
                accept=".eml,.msg,.txt"
                id="eml-file"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
              <label
                htmlFor="eml-file"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg cursor-pointer transition-colors inline-block"
              >
                Browse .EML Files
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold text-xs rounded-lg transition-all shadow-md shadow-rose-950/60 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                <span>{loading ? 'Parsing RFC 822 EML...' : 'Upload & Analyze .EML'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Result Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center font-mono">
                <span className="text-2xl font-bold text-white">{result.overall_risk_score}</span>
                <span className="text-[9px] text-slate-400 uppercase">Score / 100</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-white">{result.target || 'Email Phishing Assessment'}</h2>
                  <RiskBadge level={result.risk_level} size="md" />
                </div>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  {result.summary}
                </p>
              </div>
            </div>

            <PdfExportButton scanId={result.id} label="Download Threat PDF" />
          </div>

          {/* Hyperlinks Inspected Table (if any) */}
          {inspectedUrls.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2 mb-3">
                <Link2 className="w-4 h-4 text-cyan-400" />
                <span>Extracted Hyperlinks Safely Inspected ({inspectedUrls.length})</span>
              </h3>
              <p className="text-[11px] text-slate-400 mb-3">
                Notice: CyberGuard does not open email links automatically to prevent tracking beacon activation.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Inspected URL Target</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {inspectedUrls.map((u, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 text-cyan-300 truncate max-w-md">{u}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Findings Cards */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Phishing Indicators & Attack Vectors ({result.findings.length})</span>
            </h3>

            {result.findings.length === 0 ? (
              <div className="bg-slate-900/60 border border-emerald-900/60 rounded-xl p-8 text-center text-xs text-emerald-400">
                <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                No typical phishing markers, deceptive domains, or urgent demands detected in this email.
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
