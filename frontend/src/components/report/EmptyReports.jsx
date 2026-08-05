import React from 'react';
import { FileText, RefreshCw } from 'lucide-react';

export default function EmptyReports({ onReload }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 animate-fade-in text-center p-8">
      <div className="p-6 bg-slate-900/60 border border-background-border rounded-3xl shadow-xl">
        <FileText className="w-16 h-16 text-slate-700" strokeWidth={1.2} />
      </div>

      <div className="max-w-md flex flex-col gap-2">
        <h3 className="text-xl font-bold text-white">No Reports Generated Yet</h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          The Report Center displays all saved Gemini AI incident analyses.
          Run an AI analysis on any incident in the <strong className="text-white">Pipeline Workspace</strong> or <strong className="text-white">Operations Dashboard</strong> to see it here.
        </p>
      </div>

      {onReload && (
        <button
          onClick={onReload}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Reload Report Center
        </button>
      )}
    </div>
  );
}
