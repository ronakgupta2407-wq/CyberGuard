import React, { useState } from 'react';
import {
  Mail,
  Upload,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  Link2
} from 'lucide-react';
import { api } from '../services/api';
import FindingCard from '../components/FindingCard';
import RiskBadge from '../components/RiskBadge';
import PdfExportButton from '../components/PdfExportButton';

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
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Email Phishing Analyzer
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Analyze sender headers, deceptive hyperlinks, brand impersonation, and urgency triggers.
          </p>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-neutral-400 mr-1">Presets:</span>
          <button
            onClick={() => applyPreset('bank_phish')}
            className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors"
          >
            Bank Alert
          </button>
          <button
            onClick={() => applyPreset('ceo_giftcard')}
            className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors"
          >
            CEO Gift Card
          </button>
          <button
            onClick={() => applyPreset('legit_notice')}
            className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors"
          >
            Legitimate Alert
          </button>
        </div>
      </div>

      {/* Input Box */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4 border-b border-neutral-800 pb-3">
          <button
            onClick={() => setMode('fields')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
              mode === 'fields'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Headers & Text</span>
          </button>
          <button
            onClick={() => setMode('eml')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
              mode === 'eml'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload .EML File</span>
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2.5 bg-red-950/40 border border-red-800/60 rounded text-xs text-red-300">
            {error}
          </div>
        )}

        {mode === 'fields' ? (
          <form onSubmit={handleAnalyze} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  From (Sender Header)
                </label>
                <input
                  type="text"
                  placeholder='e.g. PayPal Support <support@paypal-security.xyz>'
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Reply-To (Optional Header)
                </label>
                <input
                  type="text"
                  placeholder='e.g. response-inbox@mail-server.top'
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Subject Line
              </label>
              <input
                type="text"
                placeholder="e.g. Notice: Please verify account credentials"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Message Body
              </label>
              <textarea
                rows={7}
                placeholder="Paste the email body or full raw message text..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-3 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600 font-mono leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>{loading ? 'Inspecting indicators...' : 'Inspect Email'}</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleUploadEml} className="space-y-4">
            <div className="border border-dashed border-neutral-800 rounded-lg p-8 text-center">
              <Upload className="w-6 h-6 mx-auto text-neutral-500 mb-2" />
              <p className="text-xs text-neutral-300 mb-1 font-medium">
                {selectedFile ? selectedFile.name : 'Select a raw .EML or .MSG email export file'}
              </p>
              <p className="text-[11px] text-neutral-500 mb-3">
                Parses RFC 822 headers and MIME boundaries without executing scripts.
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
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded cursor-pointer transition-colors inline-block"
              >
                Browse .EML Files
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>{loading ? 'Parsing message...' : 'Upload & Analyze .EML'}</span>
              </button>
            </div>
          </form>
        )}
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
                  <h2 className="text-base font-semibold text-white">{result.target || 'Email Analysis Result'}</h2>
                  <RiskBadge level={result.risk_level} size="sm" />
                </div>
                <p className="text-xs text-neutral-300 max-w-2xl leading-relaxed">
                  {result.summary}
                </p>
              </div>
            </div>

            <PdfExportButton scanId={result.id} label="Export PDF" />
          </div>

          {/* Hyperlinks Inspected Table */}
          {inspectedUrls.length > 0 && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <h3 className="text-xs font-semibold text-neutral-200 flex items-center gap-2 mb-2">
                <Link2 className="w-4 h-4 text-neutral-400" />
                <span>Extracted Hyperlink Destinations ({inspectedUrls.length})</span>
              </h3>
              <p className="text-[11px] text-neutral-400 mb-3">
                Links are evaluated passively without making outbound connections.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-neutral-950 text-neutral-400 text-[10px] uppercase border-b border-neutral-800">
                    <tr>
                      <th className="py-2 px-3">Target URL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/80">
                    {inspectedUrls.map((u, i) => (
                      <tr key={i} className="hover:bg-neutral-800/40">
                        <td className="py-2 px-3 text-neutral-300 truncate max-w-md">{u}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Findings */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-neutral-400" />
              <span>Warning Signs & Indicators ({result.findings.length})</span>
            </h3>

            {result.findings.length === 0 ? (
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-6 text-center text-xs text-neutral-400">
                No typical phishing markers, sender spoofing, or deceptive links detected.
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
