import React from 'react';

const SEVERITY_CONFIG = {
  CRITICAL: { bg: 'bg-red-600/15', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-500' },
  FATAL:    { bg: 'bg-red-600/15', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-500' },
  HIGH:     { bg: 'bg-orange-500/15', border: 'border-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-500' },
  MEDIUM:   { bg: 'bg-yellow-500/15', border: 'border-yellow-500/30', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  LOW:      { bg: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-400', dot: 'bg-blue-500' },
  INFO:     { bg: 'bg-slate-700/30', border: 'border-slate-600/30', text: 'text-slate-400', dot: 'bg-slate-500' },
};

const AI_STATUS_CONFIG = {
  analysed: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400', label: 'Analysed' },
  pending:  { bg: 'bg-slate-700/30',   border: 'border-slate-600/30',   text: 'text-slate-400',   label: 'Pending' },
};

export default function StatusBadge({ type = 'severity', value = '' }) {
  const upper = value?.toUpperCase() || '';

  if (type === 'severity') {
    const cfg = SEVERITY_CONFIG[upper] || SEVERITY_CONFIG.INFO;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {upper === 'FATAL' ? 'CRITICAL' : upper}
      </span>
    );
  }

  if (type === 'ai') {
    const cfg = AI_STATUS_CONFIG[value] || AI_STATUS_CONFIG.pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
        {cfg.label}
      </span>
    );
  }

  return null;
}
