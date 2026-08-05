import React from 'react';
import { AlertOctagon } from 'lucide-react';

export default function IncidentOverview({ incidents, loading }) {
  if (loading || !incidents) return null;

  const bySeverity = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  incidents.forEach((inc) => {
    const s = inc.severity?.toUpperCase();
    if (s === 'FATAL') bySeverity.CRITICAL++;
    else if (bySeverity[s] !== undefined) bySeverity[s]++;
    else bySeverity.LOW++;
  });

  const total = incidents.length;
  const analysed = incidents.filter((i) => i.ai_status === 'analysed').length;

  const bars = [
    { label: 'Critical', count: bySeverity.CRITICAL, color: 'bg-red-500', textColor: 'text-red-400' },
    { label: 'High',     count: bySeverity.HIGH,     color: 'bg-orange-500', textColor: 'text-orange-400' },
    { label: 'Medium',   count: bySeverity.MEDIUM,   color: 'bg-yellow-400', textColor: 'text-yellow-400' },
    { label: 'Low',      count: bySeverity.LOW,       color: 'bg-blue-500',   textColor: 'text-blue-400' },
  ];

  return (
    <div className="glass-panel rounded-2xl border border-background-border p-6 flex flex-col gap-4">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
        <AlertOctagon className="w-4 h-4 text-primary" />
        Incident Overview
      </h3>

      {/* Progress bars */}
      <div className="flex flex-col gap-3">
        {bars.map(({ label, count, color, textColor }) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={label} className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px]">
                <span className={`font-semibold ${textColor}`}>{label}</span>
                <span className="text-slate-500">{count} ({pct}%)</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* AI coverage */}
      <div className="pt-2 border-t border-background-border/50 flex items-center justify-between text-xs">
        <span className="text-slate-500">AI Coverage</span>
        <span className="font-bold text-emerald-400">
          {total > 0 ? Math.round((analysed / total) * 100) : 0}% ({analysed}/{total})
        </span>
      </div>
    </div>
  );
}
