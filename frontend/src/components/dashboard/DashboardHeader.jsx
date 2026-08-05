import React from 'react';
import { LayoutDashboard, RefreshCw, Clock } from 'lucide-react';

export default function DashboardHeader({ lastRefreshed, onReload, loading }) {
  const timeLabel = lastRefreshed
    ? lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-background-border/40">
      <div className="flex items-center gap-4">
        <div className="p-1 rounded-2xl shadow-lg shadow-primary/20 bg-slate-900 border border-background-border flex items-center justify-center w-12 h-12 shrink-0 overflow-hidden">
          <img src="/logo_icon.png" alt="LogNexio Icon" className="w-full h-full object-contain p-1" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex flex-wrap items-center gap-2">
            <span className="text-primary-light">LogNexio AI</span>
            <span className="text-slate-500 font-light text-xl md:text-2xl mx-1">—</span>
            <span>Operations Dashboard</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time incident monitoring & AI-powered analysis insights
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Last refreshed */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-background-border text-[10px] text-slate-500 font-mono-code">
          <Clock className="w-3 h-3" />
          <span>Updated {timeLabel}</span>
        </div>

        {/* Reload button */}
        <button
          onClick={onReload}
          disabled={loading}
          aria-label="Reload Dashboard"
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
    </div>
  );
}
