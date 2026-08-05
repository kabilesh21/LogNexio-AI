import React from 'react';
import { BarChart2, RefreshCw, Upload } from 'lucide-react';

export default function EmptyDashboard({ onReload }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-fade-in">
      {/* Illustration */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
        <div className="relative p-8 bg-slate-900/60 border border-background-border rounded-3xl shadow-2xl">
          <BarChart2 className="w-20 h-20 text-slate-700" strokeWidth={1} />
        </div>
      </div>

      {/* Text */}
      <div className="text-center flex flex-col gap-2 max-w-md">
        <h2 className="text-xl font-bold text-white">No Data Available</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          The dashboard has no incidents to display yet. Upload a log file in the{' '}
          <strong className="text-white">Pipeline Workspace</strong> and run an analysis
          to see your data here.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onReload}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Reload Dashboard
        </button>
        <span className="text-xs text-slate-600">or</span>
        <div className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-slate-900 border border-background-border text-slate-400">
          <Upload className="w-4 h-4" />
          Upload a log file
        </div>
      </div>

      {/* Pipeline hint */}
      <div className="flex items-center gap-6 text-[10px] text-slate-600 uppercase tracking-widest font-semibold">
        <span>Upload</span>
        <span className="w-8 border-t border-slate-700" />
        <span>Analyse</span>
        <span className="w-8 border-t border-slate-700" />
        <span>AI Report</span>
        <span className="w-8 border-t border-slate-700" />
        <span className="text-primary">Dashboard</span>
      </div>
    </div>
  );
}
