import React, { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function PdfExportButton({ scanId, variant = 'primary', label = 'Export PDF Report' }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!scanId) return;
    setDownloading(true);
    try {
      const url = api.getPdfUrl(scanId);
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('cyberguard_token') || 'guest'}`,
        },
      });

      if (!res.ok) throw new Error('PDF generation failed');

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `cyberguard_report_${scanId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      a.remove();
    } catch (err) {
      console.error(err);
      alert('Failed to download PDF report: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  const isOutline = variant === 'outline';

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium text-xs tracking-wide transition-all ${
        isOutline
          ? 'bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-800/60 hover:border-cyan-500'
          : 'bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white shadow-md shadow-cyan-950/50'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title="Download comprehensive ReportLab PDF risk dossier"
    >
      {downloading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <FileText className="w-3.5 h-3.5" />
      )}
      <span>{downloading ? 'Generating PDF...' : label}</span>
      <Download className="w-3 h-3 ml-0.5 opacity-70" />
    </button>
  );
}
