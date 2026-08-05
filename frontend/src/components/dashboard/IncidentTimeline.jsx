import React from 'react';
import { GitBranch, Eye } from 'lucide-react';
import StatusBadge from './StatusBadge';

const SEVERITY_BAR = {
  CRITICAL: 'bg-red-500', FATAL: 'bg-red-500',
  HIGH: 'bg-orange-500', MEDIUM: 'bg-yellow-400', LOW: 'bg-blue-500',
};

export default function IncidentTimeline({ incidents, onSelect }) {
  if (!incidents || incidents.length === 0) {
    return (
      <div className="glass-panel rounded-2xl border border-background-border p-6 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-primary" />
          Incident Timeline
        </h3>
        <div className="flex items-center justify-center h-40 text-slate-600 text-sm">
          No incidents detected yet
        </div>
      </div>
    );
  }

  // Show up to 8 most recent
  const displayed = incidents.slice(0, 8);

  return (
    <div className="glass-panel rounded-2xl border border-background-border p-6 flex flex-col gap-4">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
        <GitBranch className="w-4 h-4 text-primary" />
        Incident Timeline
        <span className="ml-auto text-[10px] font-normal text-slate-500 normal-case tracking-normal">
          Showing {displayed.length} of {incidents.length}
        </span>
      </h3>

      <div className="relative flex flex-col">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-0 bottom-0 w-px bg-slate-800" />

        {displayed.map((inc, idx) => {
          const barColor = SEVERITY_BAR[inc.severity?.toUpperCase()] || 'bg-slate-500';
          return (
            <div
              key={inc.incident_id}
              className="relative pl-8 pb-4 group"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Timeline dot */}
              <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center ${barColor}`}>
                <span className="w-2 h-2 rounded-full bg-white/60" />
              </div>

              <div
                onClick={() => onSelect(inc)}
                className="glass-panel border border-background-border/50 rounded-xl p-3.5 cursor-pointer
                  hover:border-primary/30 hover:bg-slate-800/40 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{inc.error_type}</p>
                    <p className="text-[10px] text-slate-500 font-mono-code mt-0.5">
                      Line {inc.line_number} · {inc.incident_id.slice(0, 12)}…
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge type="severity" value={inc.severity} />
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelect(inc); }}
                      className="p-1.5 rounded-lg bg-slate-900 border border-background-border/50 text-slate-500 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="View incident details"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
