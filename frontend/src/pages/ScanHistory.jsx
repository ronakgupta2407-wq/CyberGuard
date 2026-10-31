import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  Trash2,
  Eye,
  Filter,
  Search,
  RefreshCw,
  FileText,
  Activity,
  History,
} from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import PdfExportButton from '../components/PdfExportButton';
import CompareModal from '../components/CompareModal';
import { cleanDomain } from '../utils/formatters';

export default function ScanHistory({ onSelectScan }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [compareOpen, setCompareOpen] = useState(false);
  const [selectedScanForCompare, setSelectedScanForCompare] = useState(null);

  useEffect(() => {
    loadScans();
  }, [moduleFilter]);

  const loadScans = async () => {
    setLoading(true);
    try {
      const data = await api.getScans(moduleFilter === 'all' ? null : moduleFilter, 100);
      setScans(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scanId) => {
    if (!window.confirm('Delete this assessment record from your history?')) return;
    try {
      await api.deleteScan(scanId);
      setScans(scans.filter((s) => s.id !== scanId));
    } catch (e) {
      alert('Delete failed: ' + e.message);
    }
  };

  const filteredScans = scans.filter((s) => {
    const matchSearch =
      (s.target && s.target.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.summary && s.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchSearch;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* ── HEADER ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Audit History</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse previous assessments, revisit findings, and export reports for your records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedScanForCompare(scans[0]?.id || null);
              setCompareOpen(true);
            }}
            disabled={scans.length < 2}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <GitCompare className="w-3.5 h-3.5 text-cyan-400" />
            <span>Compare Two Scans</span>
          </button>
          <button
            onClick={loadScans}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
            title="Refresh history"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── FILTER & SEARCH BAR ─────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 mr-1.5 flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5 text-cyan-400" /> Filter:
          </span>
          {[
            { id: 'all', label: 'All Modules' },
            { id: 'tc', label: 'Terms' },
            { id: 'phishing', label: 'Email Phishing' },
            { id: 'website', label: 'Website' },
            { id: 'compliance', label: 'Compliance' },
            { id: 'unified', label: 'Multi-Vector' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setModuleFilter(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                moduleFilter === item.id
                  ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search target or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 placeholder:text-slate-600"
          />
        </div>
      </div>

      {/* ── TABLE ───────────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-12 text-xs text-slate-500">Loading scan history...</div>
        ) : filteredScans.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <History className="w-8 h-8 mx-auto text-slate-700 mb-2" />
            <p className="text-xs">No scan records match the current filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 text-xs font-medium border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Target Scope</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Executive Summary</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredScans.map((s) => {
                  const dateStr = s.created_at
                    ? new Date(s.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recent';

                  return (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/80 font-medium capitalize">
                          {s.module_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-200">
                        <span className="font-mono">{cleanDomain(s.target)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-200 font-bold">{s.overall_risk_score}</span>
                          <RiskBadge level={s.risk_level} size="sm" />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs max-w-[300px] truncate">
                        {s.summary}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-xs whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={async () => {
                              const full = await api.getScanById(s.id);
                              onSelectScan(full);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
                            title="View Full Findings"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <PdfExportButton scanId={s.id} variant="outline" label="PDF" />
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-500 hover:text-rose-400 border border-slate-700/80 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CompareModal
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
        initialScan1={selectedScanForCompare}
        scans={scans}
      />
    </div>
  );
}
