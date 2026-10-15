import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  Trash2,
  Eye,
  Filter,
  Search,
  RefreshCw,
  FileText
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
    if (!window.confirm('Delete this audit log record?')) return;
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Audit Log & History
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Access past assessments, export PDF reports, and compare differential metrics between scans.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedScanForCompare(scans[0]?.id || null);
              setCompareOpen(true);
            }}
            disabled={scans.length < 2}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare Audits</span>
          </button>
          <button
            onClick={loadScans}
            className="p-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-xs text-neutral-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {[
            { id: 'all', label: 'All' },
            { id: 'tc', label: 'Terms' },
            { id: 'phishing', label: 'Phishing' },
            { id: 'website', label: 'Website' },
            { id: 'compliance', label: 'Compliance' },
            { id: 'unified', label: 'Unified' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setModuleFilter(item.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                moduleFilter === item.id
                  ? 'bg-neutral-800 text-white'
                  : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Search target or summary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-md pl-8 pr-3 py-1 text-xs text-neutral-200 focus:outline-none focus:border-neutral-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-xs text-neutral-400">Loading audit history...</div>
        ) : filteredScans.length === 0 ? (
          <div className="text-center py-12 text-neutral-400">
            <FileText className="w-8 h-8 mx-auto text-neutral-600 mb-2" />
            <p className="text-xs">No audit records match the current filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/70 text-neutral-400 text-[11px] font-medium border-b border-neutral-800">
                <tr>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Target Scope</th>
                  <th className="py-2.5 px-4">Risk Level</th>
                  <th className="py-2.5 px-4">Summary</th>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/80">
                {filteredScans.map((s) => {
                  const dateStr = s.created_at
                    ? new Date(s.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recent';

                  return (
                    <tr key={s.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-2.5 px-4">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-medium">
                          {s.module_type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-medium text-neutral-200 max-w-[200px] truncate">
                        {s.target || 'Digital Target'}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-neutral-300 font-medium">{s.overall_risk_score}</span>
                          <RiskBadge level={s.risk_level} size="sm" />
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-neutral-400 max-w-[280px] truncate">
                        {s.summary}
                      </td>
                      <td className="py-2.5 px-4 text-neutral-400 text-[11px] whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={async () => {
                              const full = await api.getScanById(s.id);
                              onSelectScan(full);
                            }}
                            className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                            title="View Full Findings"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <PdfExportButton scanId={s.id} variant="outline" label="PDF" />
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-red-400 transition-colors"
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
