import React, { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function PdfExportButton({ scanId, variant = 'primary', label = 'Export PDF' }) {
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
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs transition-colors ${
        isOutline
          ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
          : 'bg-neutral-100 hover:bg-white text-neutral-900 font-semibold shadow-sm'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title="Download PDF report"
    >
      {downloading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <FileText className="w-3.5 h-3.5" />
      )}
      <span>{downloading ? 'Preparing...' : label}</span>
      <Download className="w-3 h-3 ml-0.5 opacity-60" />
    </button>
  );
}
