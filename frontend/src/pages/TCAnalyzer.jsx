import React, { useState } from 'react';
import {
  FileText,
  Upload,
  AlertCircle,
  Loader2,
  BookOpen,
  Shield,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import FindingCard from '../components/FindingCard';
import RiskBadge from '../components/RiskBadge';
import PdfExportButton from '../components/PdfExportButton';
import ExecutiveSummary from '../components/ExecutiveSummary';

const SAMPLE_POLICIES = {
  invasive: {
    title: 'Invasive Social Media App',
    text: `TERMS OF SERVICE AND PRIVACY AGREEMENT:
1. UNILATERAL MODIFICATIONS: We reserve the right to modify, amend, or alter these terms at any time without prior notice at our sole discretion. Your continued use of the platform shall constitute binding acceptance of all changes.
2. DATA RETENTION: We retain your personal data, location history, and device telemetry indefinitely as long as we deem necessary for commercial purposes, even after your account is deleted.
3. DATA MONETIZATION: We may sell, share, transfer, and monetize your browsing habits, demographic profiles, and personal information to third parties, commercial advertisers, and affiliate data brokers.
4. MANDATORY ARBITRATION: All disputes, controversies, and claims must be resolved solely by binding individual arbitration administered by AAA. You expressly waive your right to a trial by jury or to initiate or participate in a class action lawsuit.
5. IP TRANSFER: You grant us a perpetual, irrevocable, worldwide, royalty-free, fully transferable license to use, reproduce, modify, and distribute any content, feedback, or media you post.
6. WARRANTY DISCLAIMER: The services are provided strictly "as is" and "as available". In no event shall our aggregate liability exceed $50 or the total fees paid in the preceding month.`,
  },
  predatory_saas: {
    title: 'Subscription SaaS Agreement',
    text: `SUBSCRIPTION AND LICENSE TERMS:
1. AUTO-RENEWAL AND BILLING: Your subscription automatically renews for consecutive 12-month periods unless cancelled strictly within 3 days prior to expiration. All recurring fees and charges are non-refundable under any circumstances.
2. TRACKING AND BEHAVIORAL PROFILING: We employ cross-site tracking pixels, device fingerprinting, and behavioral telemetry to monitor your activity across other websites and applications.
3. ACCOUNT TERMINATION: We reserve the right to suspend or terminate your account at any time without cause and without prior notice or refund.`,
  },
  privacy_friendly: {
    title: 'Privacy-First Cloud Service',
    text: `PRIVACY POLICY:
1. DATA MINIMIZATION: We only collect the minimal personal information required to deliver the synchronization service (email and hashed authentication token).
2. NO DATA SELLING: We will never sell, lease, or monetize your personal information to third-party data brokers or advertisers.
3. RIGHT TO DELETION: You possess the right to request deletion of your personal data at any time under GDPR Article 17. All data is purged within 30 days of account closure.
4. TRANSPARENCY: Any material changes to this policy will be communicated via email at least 30 days before taking effect.`,
  },
};

export default function TCAnalyzer({ onScanCompleted }) {
  const [activeMode, setActiveMode] = useState('paste');
  const [policyText, setPolicyText] = useState('');
  const [docTitle, setDocTitle] = useState('Terms of Service Analysis');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleAnalyzeText = async (e) => {
    e.preventDefault();
    if (!policyText.trim()) { setError('Please paste policy text or select a preset sample.'); return; }
    setError(''); setLoading(true);
    try {
      const scan = await api.analyzeTC(policyText, docTitle);
      setResult(scan);
      if (onScanCompleted) onScanCompleted(scan);
    } catch (err) {
      setError(err.message || 'Analysis failed');
    } finally { setLoading(false); }
  };

  const handleUploadFile = async (e) => {
    e.preventDefault();
    if (!selectedFile) { setError('Please select a PDF, DOCX, or TXT file to upload.'); return; }
    setError(''); setLoading(true);
    try {
      const scan = await api.uploadTCDocument(selectedFile, docTitle);
      setResult(scan);
      if (onScanCompleted) onScanCompleted(scan);
    } catch (err) {
      setError(err.message || 'File analysis failed');
    } finally { setLoading(false); }
  };

  const applyPreset = (key) => {
    const preset = SAMPLE_POLICIES[key];
    setDocTitle(preset.title);
    setPolicyText(preset.text);
    setActiveMode('paste');
    setError('');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-cyan-400 border border-blue-500/20">
              Contract &amp; Policy Intelligence
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Groq AI Enabled
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Terms &amp; Policy Analyzer</h1>
          <p className="text-sm text-slate-400 mt-1">
            Identify clauses that could affect your rights—from unilateral changes and auto-renewals to data retention, liability limits, and dispute resolution.
          </p>
        </div>

        {/* Preset chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 mr-1 font-medium">Sample Policies:</span>
          {Object.entries({ invasive: 'Invasive App', predatory_saas: 'Auto-Renewal SaaS', privacy_friendly: 'Privacy-First' }).map(([key, label]) => (
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

      {/* ── INPUT PANEL ─────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {/* Mode tabs */}
        <div className="flex items-center gap-0 border-b border-slate-800 bg-slate-950/60 px-2">
          {[
            { mode: 'paste', icon: FileText, label: 'Paste Policy Text' },
            { mode: 'upload', icon: Upload, label: 'Upload Document (PDF / DOCX)' },
          ].map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setActiveMode(mode)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold transition-colors border-b-2 ${
                activeMode === mode
                  ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeMode === 'paste' ? (
            <form onSubmit={handleAnalyzeText} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Document or Service Name</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Terms of Service, User Agreement"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Policy Content</label>
                <textarea
                  rows={9}
                  value={policyText}
                  onChange={(e) => setPolicyText(e.target.value)}
                  placeholder="Paste the Terms of Service, User Agreement, or Privacy Policy text here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed placeholder:text-slate-600 resize-none font-sans"
                />
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                  <span>{loading ? 'Analyzing clauses...' : 'Analyze Terms'}</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleUploadFile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Document Label (Optional)</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. MobileApp_EULA_2026.pdf"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
                />
              </div>
              <div className="border border-dashed border-slate-800 hover:border-cyan-500/50 rounded-2xl p-10 text-center transition-colors bg-slate-950/40">
                <Upload className="w-8 h-8 mx-auto text-slate-500 mb-2.5" />
                <p className="text-sm text-slate-200 mb-1 font-semibold">
                  {selectedFile ? selectedFile.name : 'Upload PDF, DOCX, or TXT file'}
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  Extracted locally on your machine without third-party uploads.
                </p>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  id="tc-file"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
                <label
                  htmlFor="tc-file"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer transition-colors inline-block"
                >
                  Browse Files
                </label>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !selectedFile}
                  className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>{loading ? 'Processing Document...' : 'Upload & Analyze'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ── ANALYSIS RESULTS ────────────────────────────────────── */}
      {result && (
        <div className="space-y-5">
          {/* Result Header */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-cyan-400">{result.overall_risk_score}</span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Risk Score</span>
                </div>
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <h2 className="text-lg font-bold text-white">{result.target || 'T&C Analysis Result'}</h2>
                    <RiskBadge level={result.risk_level} size="sm" />
                  </div>
                  <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">{result.summary}</p>
                </div>
              </div>
              <PdfExportButton scanId={result.id} label="Download PDF Report" />
            </div>
          </div>

          <ExecutiveSummary scan={result} />

          {/* Findings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Identified Clauses &amp; Explanations</span>
                <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-medium">{result.findings.length}</span>
              </h3>
              <span className="text-xs text-slate-400">Sorted by Severity</span>
            </div>

            {result.findings.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
                No high-risk clauses or predatory terms detected in the analyzed text.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {result.findings.map((finding, idx) => (
                  <FindingCard key={finding.id || idx} finding={finding} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
