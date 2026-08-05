import React from 'react';
import { HardDrive, ShieldCheck, Database, Layout } from 'lucide-react';

export default function SystemStatus({ uploadsCount, totalLinesCount }) {
  return (
    <div className="glass-panel rounded-2xl border border-background-border p-6 shadow-xl relative overflow-hidden transition-all duration-300">
      <div className="flex flex-col gap-5">
        {/* Card Header */}
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">Workspace Status</h2>
          <p className="text-xs text-background-muted mt-0.5">Real-time Ingestion and pipeline metrics</p>
        </div>

        {/* Indicators Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pipeline Status Card */}
          <div className="border border-background-border/50 bg-slate-800/10 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg border bg-accent/10 border-accent/20 text-accent flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-background-muted font-medium uppercase tracking-wider">Pipeline Ingestion</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                <span className="text-xs font-bold text-white">Active & Ready</span>
              </div>
            </div>
          </div>

          {/* Upload Settings Card */}
          <div className="border border-background-border/50 bg-slate-800/10 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg border bg-primary/10 border-primary/20 text-primary flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-background-muted font-medium uppercase tracking-wider">Upload Limits</p>
              <p className="text-xs font-bold text-white mt-0.5">Max 50MB (.log/.txt)</p>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="border border-background-border/40 bg-slate-900/40 rounded-xl p-4 flex flex-col gap-3 font-mono-code text-[11px] text-background-muted">
          <div className="flex justify-between border-b border-background-border/20 pb-2">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Database className="w-3.5 h-3.5 text-slate-500" /> Active Session Files:
            </span>
            <span className="text-accent font-bold">{uploadsCount}</span>
          </div>
          <div className="flex justify-between border-b border-background-border/20 pb-2">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Database className="w-3.5 h-3.5 text-slate-500" /> Processed Log Lines:
            </span>
            <span className="text-primary font-bold">{totalLinesCount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Layout className="w-3.5 h-3.5 text-slate-500" /> Deployment Sandbox:
            </span>
            <span className="text-slate-300 font-bold">Air-gapped / Local</span>
          </div>
        </div>
      </div>
    </div>
  );
}
