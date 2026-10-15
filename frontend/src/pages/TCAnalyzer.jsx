import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  FileCheck,
  Loader2,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import FindingCard from '../components/FindingCard';
import RiskBadge from '../components/RiskBadge';
import PdfExportButton from '../components/PdfExportButton';

const SAMPLE_POLICIES = {
  invasive: {
    title: 'Invasive Social Media App (High Risk)',
    text: `TERMS OF SERVICE AND PRIVACY AGREEMENT:
1. UNILATERAL MODIFICATIONS: We reserve the right to modify, amend, or alter these terms at any time without prior notice at our sole discretion. Your continued use of the platform shall constitute binding acceptance of all changes.
2. DATA RETENTION: We retain your personal data, location history, and device telemetry indefinitely as long as we deem necessary for commercial purposes, even after your account is deleted.
3. DATA MONETIZATION: We may sell, share, transfer, and monetize your browsing habits, demographic profiles, and personal information to third parties, commercial advertisers, and affiliate data brokers.
4. MANDATORY ARBITRATION: All disputes, controversies, and claims must be resolved solely by binding individual arbitration administered by AAA. You expressly waive your right to a trial by jury or to initiate or participate in a class action lawsuit.
5. IP TRANSFER: You grant us a perpetual, irrevocable, worldwide, royalty-free, fully transferable license to use, reproduce, modify, and distribute any content, feedback, or media you post.
6. WARRANTY DISCLAIMER: The services are provided strictly "as is" and "as available". In no event shall our aggregate liability exceed $50 or the total fees paid in the preceding month.`,
  },
  predatory_saas: {
    title: 'Predatory Subscription SaaS (Medium Risk)',
    text: `SUBSCRIPTION AND LICENSE TERMS:
1. AUTO-RENEWAL AND BILLING: Your subscription automatically renews for consecutive 12-month periods unless cancelled strictly within 3 days prior to expiration. All recurring fees and charges are non-refundable under any circumstances.
2. TRACKING AND BEHAVIORAL PROFILING: We employ cross-site tracking pixels, device fingerprinting, and behavioral telemetry to monitor your activity across other websites and applications.
3. ACCOUNT TERMINATION: We reserve the right to suspend or terminate your account at any time without cause and without prior notice or refund.`,
  },
  privacy_friendly: {
    title: 'Privacy-First Secure Cloud (Safe / Low Risk)',
    text: `PRIVACY POLICY:
1. DATA MINIMIZATION: We only collect the minimal personal information required to deliver the synchronization service (email and hashed authentication token).
2. NO DATA SELLING: We will never sell, lease, or monetize your personal information to third-party data brokers or advertisers.
3. RIGHT TO DELETION: You possess the right to request deletion of your personal data at any time under GDPR Article 17. All data is purged within 30 days of account closure.
4. TRANSPARENCY: Any material changes to this policy will be communicated via email at least 30 days before taking effect.`,
  },
};

export default function TCAnalyzer({ onScanCompleted }) {
  const [activeMode, setActiveMode] = useState('paste'); // 'paste' | 'upload'
  const [policyText, setPolicyText] = useState('');
  const [docTitle, setDocTitle] = useState('Terms of Service Analysis');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleAnalyzeText = async (e) => {
    e.preventDefault();
    if (!policyText.trim()) {
      setError('Please paste policy text or select a preset sample.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const scan = await api.analyzeTC(policyText, docTitle);
      setResult(scan);
      if (onScanCompleted) onScanCompleted(scan);
    } catch (err) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFile = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a PDF, DOCX, or TXT file to upload.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const scan = await api.uploadTCDocument(selectedFile, docTitle);
      setResult(scan);
      if (onScanCompleted) onScanCompleted(scan);
    } catch (err) {
      setError(err.message || 'File analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (key) => {
    const preset = SAMPLE_POLICIES[key];
    setDocTitle(preset.title);
    setPolicyText(preset.text);
    setActiveMode('paste');
    setError('');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Module Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-950/50">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  MODULE 01
                </span>
                <h1 className="text-xl font-bold text-white">AI Terms & Conditions Analyzer</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Paste contract clauses or upload document files to extract hidden risks, auto-renewals, arbitration waivers, and plain-English translations.
              </p>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium mr-1">Load Presets:</span>
            <button
              onClick={() => applyPreset('invasive')}
              className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/80 text-xs transition-colors"
            >
              Invasive Social App
            </button>
            <button
              onClick={() => applyPreset('predatory_saas')}
              className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/80 text-xs transition-colors"
            >
              Auto-Renewal SaaS
            </button>
            <button
              onClick={() => applyPreset('privacy_friendly')}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/80 text-xs transition-colors"
            >
              Privacy-First SaaS
            </button>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        {/* Mode Switcher */}
        <div className="flex items-center gap-2 mb-5 border-b border-slate-800 pb-4">
          <button
            onClick={() => setActiveMode('paste')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMode === 'paste'
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Policy Text</span>
          </button>
          <button
            onClick={() => setActiveMode('upload')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMode === 'upload'
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document (PDF / DOCX / TXT)</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {activeMode === 'paste' ? (
          <form onSubmit={handleAnalyzeText} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Document / Service Title:
              </label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. Acme Cloud Terms of Service"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Policy & Terms Content:
              </label>
              <textarea
                rows={9}
                value={policyText}
                onChange={(e) => setPolicyText(e.target.value)}
                placeholder="Paste the Terms of Service, User Agreement, or Privacy Policy text here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono leading-relaxed"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-semibold text-xs rounded-lg transition-all shadow-md shadow-cyan-950/60 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{loading ? 'Analyzing Clauses & Risks...' : 'Run T&C Analysis'}</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleUploadFile} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Document / Service Title (Optional):
              </label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. MobileApp_EULA_2026.pdf"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="border-2 border-dashed border-slate-800 hover:border-cyan-700/70 rounded-xl p-8 text-center transition-colors">
              <Upload className="w-8 h-8 mx-auto text-slate-500 mb-2" />
              <p className="text-xs text-slate-300 mb-1 font-medium">
                {selectedFile ? selectedFile.name : 'Choose a PDF, DOCX, or TXT file to analyze'}
              </p>
              <p className="text-[11px] text-slate-500 mb-4">
                Extracted with PyPDF and python-docx without uploading to unverified third parties.
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
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg cursor-pointer transition-colors inline-block"
              >
                Browse Files
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-semibold text-xs rounded-lg transition-all shadow-md shadow-cyan-950/60 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{loading ? 'Processing Document...' : 'Upload & Analyze Document'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Analysis Results */}
      {result && (
        <div className="space-y-6">
          {/* Result Banner Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center font-mono">
                <span className="text-2xl font-bold text-white">{result.overall_risk_score}</span>
                <span className="text-[9px] text-slate-400 uppercase">Score / 100</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-white">{result.target || 'T&C Analysis Result'}</h2>
                  <RiskBadge level={result.risk_level} size="md" />
                </div>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  {result.summary}
                </p>
              </div>
            </div>

            <PdfExportButton scanId={result.id} label="Download PDF Report" />
          </div>

          {/* Findings List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Detected Concerning Clauses ({result.findings.length})</span>
              </h3>
              <span className="text-xs text-slate-400">
                Sorted by severity & contractual risk impact
              </span>
            </div>

            {result.findings.length === 0 ? (
              <div className="bg-slate-900/60 border border-emerald-900/60 rounded-xl p-8 text-center text-xs text-emerald-400">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                No concerning clauses or red-flag conditions detected in the analyzed passage!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
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
