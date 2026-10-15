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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-neutral-400" />
            <div>
              <h2 className="text-sm font-semibold text-white">Compare Two Audits</h2>
              <p className="text-[11px] text-neutral-400">Evaluate risk differences, newly introduced flags, and resolved items.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scan Selector Controls */}
        <div className="p-4 border-b border-neutral-800 bg-neutral-900 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-5">
            <label className="block text-xs font-medium text-neutral-400 mb-1">Baseline (Scan A):</label>
            <select
              value={scanId1}
              onChange={(e) => setScanId1(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-neutral-600"
            >
              {scans.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.module_type.toUpperCase()}] {s.target || 'Audit'} ({s.overall_risk_score}/100)
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-5">
            <label className="block text-xs font-medium text-neutral-400 mb-1">Comparison (Scan B):</label>
            <select
              value={scanId2}
              onChange={(e) => setScanId2(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-neutral-600"
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
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-3 py-1.5 rounded-md transition-colors"
            >
              {loading ? 'Comparing...' : 'Compare'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-4 my-3 p-2.5 bg-red-950/40 border border-red-800/60 rounded text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Comparison Results */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {comparison ? (
            <>
              {/* Score Delta */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <span className="text-[11px] text-neutral-400 block mb-0.5">Scan A</span>
                    <span className="text-xl font-semibold font-mono text-neutral-100">
                      {comparison.scan_1.overall_risk_score}
                    </span>
                    <div className="mt-1"><RiskBadge level={comparison.scan_1.risk_level} size="sm" /></div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-neutral-600" />

                  <div className="text-center">
                    <span className="text-[11px] text-neutral-400 block mb-0.5">Scan B</span>
                    <span className="text-xl font-semibold font-mono text-neutral-100">
                      {comparison.scan_2.overall_risk_score}
                    </span>
                    <div className="mt-1"><RiskBadge level={comparison.scan_2.risk_level} size="sm" /></div>
                  </div>
                </div>

                <div>
                  {comparison.score_difference < 0 ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded border border-emerald-800/60 text-xs font-medium">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>{Math.abs(comparison.score_difference)} pts Improvement</span>
                    </div>
                  ) : comparison.score_difference > 0 ? (
                    <div className="flex items-center gap-1.5 text-red-400 bg-red-950/40 px-3 py-1 rounded border border-red-800/60 text-xs font-medium">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+{comparison.score_difference} pts Increased Risk</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-neutral-400 bg-neutral-800 px-3 py-1 rounded border border-neutral-700 text-xs font-medium">
                      <Minus className="w-3.5 h-3.5" />
                      <span>Identical Risk Score</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-neutral-900 border border-neutral-800 rounded p-3 text-xs text-neutral-300">
                <span className="font-semibold text-neutral-200 block mb-0.5">Comparison Summary:</span>
                <p>{comparison.comparison_summary}</p>
              </div>

              {/* Resolved vs New Findings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Resolved in Scan B ({comparison.resolved_findings.length})
                  </h4>
                  {comparison.resolved_findings.length === 0 ? (
                    <p className="text-xs text-neutral-500 italic">No previous findings were resolved.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {comparison.resolved_findings.map((f, i) => (
                        <div key={i} className="bg-neutral-900 p-2 rounded border border-neutral-800 text-xs">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-medium text-neutral-200">{f.title}</span>
                            <RiskBadge level={f.severity} size="sm" />
                          </div>
                          <p className="text-[11px] text-neutral-400 truncate">{f.explanation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3">
                  <h4 className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    New in Scan B ({comparison.new_findings.length})
                  </h4>
                  {comparison.new_findings.length === 0 ? (
                    <p className="text-xs text-neutral-500 italic">No new risk indicators introduced.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {comparison.new_findings.map((f, i) => (
                        <div key={i} className="bg-neutral-900 p-2 rounded border border-neutral-800 text-xs">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-medium text-neutral-200">{f.title}</span>
                            <RiskBadge level={f.severity} size="sm" />
                          </div>
                          <p className="text-[11px] text-neutral-400 truncate">{f.explanation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-neutral-500 text-xs">
              Select two scans above and click "Compare" to view differential risk metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
