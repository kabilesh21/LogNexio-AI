import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';

export default function HealthCard({ name, status, details, icon, subtext }) {
  const isHealthy = status === 'healthy';
  const isDegraded = status === 'degraded';

  return (
    <div className={`glass-panel border rounded-2xl p-5 flex flex-col justify-between gap-3 transition-all duration-300 ${
      isHealthy
        ? 'border-emerald-500/30 bg-emerald-950/10'
        : isDegraded
        ? 'border-yellow-500/30 bg-yellow-950/10'
        : 'border-red-500/30 bg-red-950/10'
    }`}>
      <div className="flex items-center justify-between">
        <div className="p-2.5 rounded-xl border border-background-border/50 bg-slate-900/60">
          {icon}
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
          isHealthy
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
            : isDegraded
            ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400'
            : 'bg-red-500/15 border-red-500/30 text-red-400'
        }`}>
          {isHealthy ? <CheckCircle2 className="w-3 h-3" /> : isDegraded ? <AlertTriangle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {status}
        </span>
      </div>

      <div>
        <h4 className="text-sm font-bold text-white">{name}</h4>
        <p className="text-xs text-slate-400 mt-0.5">{details}</p>
        {subtext && <p className="text-[10px] text-slate-500 mt-2 font-mono-code">{subtext}</p>}
      </div>
    </div>
  );
}
