import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ShieldCheck, ShieldAlert, GitCompare, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from './RiskBadge';

export default function CompareModal({ isOpen, onClose, initialScan1 = null, scans = [] }) {
  const [scanId1, setScanId1] = useState('');
  const [scanId2, setScanId2] = useState('');
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialScan1) {
      setScanId1(initialScan1);
    } else if (scans.length > 0 && !scanId1) {
      setScanId1(scans[0].id);
    }
    if (scans.length > 1 && !scanId2) {
      setScanId2(scans[1].id);
    }
  }, [initialScan1, scans]);

  if (!isOpen) return null;

  const handleCompare = async () => {
    if (!scanId1 || !scanId2) {
      setError('Please select two distinct scans to compare.');
      return;
    }
    if (scanId1 === scanId2) {
      setError('Please select two different scans.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await api.compareScans(scanId1, scanId2);
      setComparison(data);
    } catch (err) {
      setError(err.message || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Compare Two Security Audits</h2>
              <p className="text-xs text-slate-400">Evaluate risk differences, resolved items, and newly introduced issues.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scan Selector Controls */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/90 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Baseline Assessment (Scan A):</label>
            <select
              value={scanId1}
              onChange={(e) => setScanId1(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
            >
              {scans.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.module_type.toUpperCase()}] {s.target || 'Audit'} (Risk: {s.overall_risk_score}/100)
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Comparison Assessment (Scan B):</label>
            <select
              value={scanId2}
              onChange={(e) => setScanId2(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
            >
              {scans.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.module_type.toUpperCase()}] {s.target || 'Audit'} (Risk: {s.overall_risk_score}/100)
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              onClick={handleCompare}
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Comparing...' : 'Compare Scans'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-5 my-3 p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Comparison Results */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {comparison ? (
            <>
              {/* Score Delta */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <span className="text-xs text-slate-400 block mb-1">Scan A Risk</span>
                    <span className="text-3xl font-extrabold text-white">
                      {comparison.scan_1.overall_risk_score}
                    </span>
                    <div className="mt-1.5"><RiskBadge level={comparison.scan_1.risk_level} size="sm" /></div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-slate-600" />

                  <div className="text-center">
                    <span className="text-xs text-slate-400 block mb-1">Scan B Risk</span>
                    <span className="text-3xl font-extrabold text-white">
                      {comparison.scan_2.overall_risk_score}
                    </span>
                    <div className="mt-1.5"><RiskBadge level={comparison.scan_2.risk_level} size="sm" /></div>
                  </div>
                </div>

                <div>
                  {comparison.score_difference < 0 ? (
                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/50 px-4 py-2 rounded-xl border border-emerald-800/60 text-xs font-bold">
                      <TrendingDown className="w-4 h-4" />
                      <span>{Math.abs(comparison.score_difference)} Points Improvement</span>
                    </div>
                  ) : comparison.score_difference > 0 ? (
                    <div className="flex items-center gap-2 text-rose-400 bg-rose-950/50 px-4 py-2 rounded-xl border border-rose-800/60 text-xs font-bold">
                      <TrendingUp className="w-4 h-4" />
                      <span>+{comparison.score_difference} Points Increased Risk</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 text-xs font-medium">
                      <Minus className="w-4 h-4" />
                      <span>Identical Risk Score</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300">
                <span className="text-xs font-semibold text-cyan-400 block mb-1">Differential Summary:</span>
                <p className="leading-relaxed">{comparison.comparison_summary}</p>
              </div>

              {/* Resolved vs New Findings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                  <h4 className="text-xs font-bold text-emerald-400 mb-3 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Resolved Issues in Scan B ({comparison.resolved_findings.length})
                  </h4>
                  {comparison.resolved_findings.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No previous findings were resolved.</p>
                  ) : (
                    <div className="space-y-2">
                      {comparison.resolved_findings.map((f, i) => (
                        <div key={i} className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-200">{f.title}</span>
                            <RiskBadge level={f.severity} size="sm" />
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{f.explanation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4">
                  <h4 className="text-xs font-bold text-rose-400 mb-3 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    New Issues in Scan B ({comparison.new_findings.length})
                  </h4>
                  {comparison.new_findings.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No new risk indicators introduced.</p>
                  ) : (
                    <div className="space-y-2">
                      {comparison.new_findings.map((f, i) => (
                        <div key={i} className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-200">{f.title}</span>
                            <RiskBadge level={f.severity} size="sm" />
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{f.explanation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Select two assessments above and click "Compare Scans" to view the security differences.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
