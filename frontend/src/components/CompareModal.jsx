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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl shadow-cyan-950/30 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Side-by-Side Scan Comparison</h2>
              <p className="text-xs text-slate-400">Measure risk progression, newly introduced vulnerabilities, and remediations</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scan Selector Controls */}
        <div className="p-5 border-b border-slate-800 bg-slate-900 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-5">
            <label className="block text-xs font-medium text-slate-400 mb-1">Baseline Scan (Scan A):</label>
            <select
              value={scanId1}
              onChange={(e) => setScanId1(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {scans.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.module_type.toUpperCase()}] {s.target || 'Audit'} ({s.overall_risk_score}/100)
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-5">
            <label className="block text-xs font-medium text-slate-400 mb-1">Comparison Scan (Scan B):</label>
            <select
              value={scanId2}
              onChange={(e) => setScanId2(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {scans.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.module_type.toUpperCase()}] {s.target || 'Audit'} ({s.overall_risk_score}/100)
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              onClick={handleCompare}
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs px-3 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950"
            >
              {loading ? 'Comparing...' : 'Compare'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-5 my-3 p-3 bg-rose-950/50 border border-rose-800/80 rounded-lg text-xs text-rose-300">
            {error}
          </div>
        )}

        {/* Comparison Results */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {comparison ? (
            <>
              {/* Score Delta Card */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <span className="text-[11px] text-slate-400 block mb-0.5">Scan A Score</span>
                    <span className="text-2xl font-bold font-mono text-slate-200">
                      {comparison.scan_1.overall_risk_score}
                    </span>
                    <div className="mt-1"><RiskBadge level={comparison.scan_1.risk_level} size="sm" /></div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-slate-600" />

                  <div className="text-center">
                    <span className="text-[11px] text-slate-400 block mb-0.5">Scan B Score</span>
                    <span className="text-2xl font-bold font-mono text-slate-200">
                      {comparison.scan_2.overall_risk_score}
                    </span>
                    <div className="mt-1"><RiskBadge level={comparison.scan_2.risk_level} size="sm" /></div>
                  </div>
                </div>

                {/* Score Difference Indicator */}
                <div className="flex items-center gap-2">
                  {comparison.score_difference < 0 ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-lg border border-emerald-800/80 text-sm font-semibold">
                      <TrendingDown className="w-4 h-4" />
                      <span>{Math.abs(comparison.score_difference)} pts Improvement</span>
                    </div>
                  ) : comparison.score_difference > 0 ? (
                    <div className="flex items-center gap-1.5 text-rose-400 bg-rose-950/80 px-3 py-1.5 rounded-lg border border-rose-800/80 text-sm font-semibold">
                      <TrendingUp className="w-4 h-4" />
                      <span>+{comparison.score_difference} pts Higher Risk</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-slate-400 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-sm font-semibold">
                      <Minus className="w-4 h-4" />
                      <span>No Score Change</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Description */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-4 text-xs text-slate-300">
                <span className="font-semibold text-cyan-400 block mb-1">Audit Difference Summary:</span>
                <p>{comparison.comparison_summary}</p>
              </div>

              {/* Two columns for Findings Diff */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Resolved Findings in Scan B */}
                <div className="bg-slate-950/80 border border-emerald-950/80 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-3">
                    <ShieldCheck className="w-4 h-4" />
                    Resolved in Scan B ({comparison.resolved_findings.length})
                  </h4>
                  {comparison.resolved_findings.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No previous findings were resolved.</p>
                  ) : (
                    <div className="space-y-2">
                      {comparison.resolved_findings.map((f, i) => (
                        <div key={i} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-200">{f.title}</span>
                            <RiskBadge level={f.severity} size="sm" />
                          </div>
                          <p className="text-[11px] text-slate-400">{f.explanation.slice(0, 90)}...</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* New Findings in Scan B */}
                <div className="bg-slate-950/80 border border-rose-950/80 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5 mb-3">
                    <ShieldAlert className="w-4 h-4" />
                    New Vulnerabilities in Scan B ({comparison.new_findings.length})
                  </h4>
                  {comparison.new_findings.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No new risk indicators introduced.</p>
                  ) : (
                    <div className="space-y-2">
                      {comparison.new_findings.map((f, i) => (
                        <div key={i} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-200">{f.title}</span>
                            <RiskBadge level={f.severity} size="sm" />
                          </div>
                          <p className="text-[11px] text-slate-400">{f.explanation.slice(0, 90)}...</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <GitCompare className="w-10 h-10 mx-auto text-slate-700 mb-2" />
              <p className="text-sm">Select two scans above and click "Compare" to inspect differential metrics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
