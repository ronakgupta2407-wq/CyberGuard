import React, { useState, useEffect } from 'react';
import {
  History,
  GitCompare,
  Download,
  Trash2,
  Eye,
  Filter,
  Search,
  RefreshCw,
  FileText,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import PdfExportButton from '../components/PdfExportButton';
import CompareModal from '../components/CompareModal';

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
    if (!window.confirm('Are you sure you want to delete this scan record?')) return;
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
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-950/50">
              <History className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  MODULE 06
                </span>
                <h1 className="text-xl font-bold text-white">Reports, Audit History & Comparison</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Access past analyses, download forensic PDF reports, and run side-by-side diff comparisons across scans.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedScanForCompare(scans[0]?.id || null);
                setCompareOpen(true);
              }}
              disabled={scans.length < 2}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-semibold text-xs rounded-lg transition-all shadow-md shadow-cyan-950 flex items-center gap-2 disabled:opacity-50"
            >
              <GitCompare className="w-4 h-4" />
              <span>Side-by-Side Compare</span>
            </button>
            <button
              onClick={loadScans}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Refresh scan history"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Module Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {[
            { id: 'all', label: 'All Modules' },
            { id: 'tc', label: 'Terms & Conditions' },
            { id: 'phishing', label: 'Email Phishing' },
            { id: 'website', label: 'Website Security' },
            { id: 'compliance', label: 'Compliance' },
            { id: 'unified', label: 'Unified Audits' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setModuleFilter(item.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                moduleFilter === item.id
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search target or summary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-xs text-slate-400">Loading audit history...</div>
        ) : filteredScans.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <FileText className="w-10 h-10 mx-auto text-slate-700 mb-2" />
            <p className="text-xs">No scan records match your filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Target Artifact / Scope</th>
                  <th className="py-3 px-4">Risk Rating</th>
                  <th className="py-3 px-4">Key Observations</th>
                  <th className="py-3 px-4">Scan Date</th>
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
                      <td className="py-3.5 px-4 font-mono">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-400 font-bold uppercase">
                          {s.module_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-100 max-w-[220px] truncate">
                        {s.target || 'Digital Target'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-200">{s.overall_risk_score}</span>
                          <RiskBadge level={s.risk_level} size="sm" />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 max-w-[280px] truncate">
                        {s.summary}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={async () => {
                              const full = await api.getScanById(s.id);
                              onSelectScan(full);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="View Full Findings & Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <PdfExportButton scanId={s.id} variant="outline" label="PDF" />
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-800 transition-colors"
                            title="Delete Scan Record"
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

      {/* Side-by-Side Comparison Modal */}
      <CompareModal
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
        initialScan1={selectedScanForCompare}
        scans={scans}
      />
    </div>
  );
}
