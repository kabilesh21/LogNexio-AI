import React, { useState } from 'react';
import { Download, FileText, Code, FileCode, Copy, Check, Loader2 } from 'lucide-react';
import { triggerFileDownload } from '../../services/reportService';

export default function ExportMenu({ incidentId, report }) {
  const [downloading, setDownloading] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleDownload = async (format) => {
    setDownloading(format);
    try {
      const ext = format === 'markdown' ? 'md' : format;
      await triggerFileDownload(incidentId, format, `LogNexio_Incident_${incidentId.slice(0, 8)}.${ext}`);
    } catch (err) {
      console.error(`Export ${format} failed:`, err);
    } finally {
      setDownloading(null);
    }
  };

  const handleCopyReport = () => {
    if (!report) return;
    const text = typeof report === 'string' ? report : JSON.stringify(report, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* PDF Download */}
      <button
        onClick={() => handleDownload('pdf')}
        disabled={downloading === 'pdf'}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-all disabled:opacity-50"
      >
        {downloading === 'pdf' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
        Download PDF
      </button>

      {/* DOCX Download */}
      <button
        onClick={() => handleDownload('docx')}
        disabled={downloading === 'docx'}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 transition-all disabled:opacity-50"
      >
        {downloading === 'docx' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
        Download DOCX
      </button>

      {/* JSON Download */}
      <button
        onClick={() => handleDownload('json')}
        disabled={downloading === 'json'}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/25 transition-all disabled:opacity-50"
      >
        {downloading === 'json' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Code className="w-3.5 h-3.5" />}
        JSON
      </button>

      {/* Markdown Download */}
      <button
        onClick={() => handleDownload('markdown')}
        disabled={downloading === 'markdown'}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 hover:bg-purple-500/25 transition-all disabled:opacity-50"
      >
        {downloading === 'markdown' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileCode className="w-3.5 h-3.5" />}
        Markdown
      </button>

      {/* Copy Report */}
      {report && (
        <button
          onClick={handleCopyReport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 border border-background-border text-slate-300 hover:text-white hover:border-slate-700 transition-all"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy Report'}
        </button>
      )}
    </div>
  );
}
