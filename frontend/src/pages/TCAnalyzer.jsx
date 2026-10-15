import React, { useState } from 'react';
import {
  FileText,
  Upload,
  AlertCircle,
  CheckCircle2,
  Loader2,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';
import FindingCard from '../components/FindingCard';
import RiskBadge from '../components/RiskBadge';
import PdfExportButton from '../components/PdfExportButton';

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
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Terms & Policy Analyzer
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Detect unilateral modifications, indefinite retention, liability waivers, arbitration, and extract plain explanations.
          </p>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-neutral-400 mr-1">Presets:</span>
          <button
            onClick={() => applyPreset('invasive')}
            className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors"
          >
            Invasive App
          </button>
          <button
            onClick={() => applyPreset('predatory_saas')}
            className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors"
          >
            Auto-Renewal SaaS
          </button>
          <button
            onClick={() => applyPreset('privacy_friendly')}
            className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors"
          >
            Privacy-First SaaS
          </button>
        </div>
      </div>

      {/* Input Box */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
        {/* Mode Switcher */}
        <div className="flex items-center gap-2 mb-4 border-b border-neutral-800 pb-3">
          <button
            onClick={() => setActiveMode('paste')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeMode === 'paste'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Policy Text</span>
          </button>
          <button
            onClick={() => setActiveMode('upload')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
              activeMode === 'upload'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File (PDF / DOCX)</span>
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2.5 bg-red-950/40 border border-red-800/60 rounded text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {activeMode === 'paste' ? (
          <form onSubmit={handleAnalyzeText} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Document / Service Label
              </label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. Terms of Service"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Policy Content
              </label>
              <textarea
                rows={9}
                value={policyText}
                onChange={(e) => setPolicyText(e.target.value)}
                placeholder="Paste the Terms of Service, User Agreement, or Privacy Policy text here..."
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
                <span>{loading ? 'Analyzing clauses...' : 'Analyze Terms'}</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleUploadFile} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Document Label (Optional)
              </label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. MobileApp_EULA_2026.pdf"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-neutral-600"
              />
            </div>

            <div className="border border-dashed border-neutral-800 rounded-lg p-8 text-center">
              <Upload className="w-6 h-6 mx-auto text-neutral-500 mb-2" />
              <p className="text-xs text-neutral-300 mb-1 font-medium">
                {selectedFile ? selectedFile.name : 'Select a PDF, DOCX, or TXT file to analyze'}
              </p>
              <p className="text-[11px] text-neutral-500 mb-3">
                Text is processed locally using pypdf and python-docx.
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
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded cursor-pointer transition-colors inline-block"
              >
                Browse Files
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>{loading ? 'Processing file...' : 'Upload & Analyze'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Analysis Results */}
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
                  <h2 className="text-base font-semibold text-white">{result.target || 'T&C Analysis Result'}</h2>
                  <RiskBadge level={result.risk_level} size="sm" />
                </div>
                <p className="text-xs text-neutral-300 max-w-2xl leading-relaxed">
                  {result.summary}
                </p>
              </div>
            </div>

            <PdfExportButton scanId={result.id} label="Export PDF" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-neutral-400" />
                <span>Identified Clauses ({result.findings.length})</span>
              </h3>
              <span className="text-xs text-neutral-400">
                Sorted by severity
              </span>
            </div>

            {result.findings.length === 0 ? (
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-6 text-center text-xs text-neutral-400">
                No high-risk clauses or concerning terms flagged in the analyzed passage.
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
