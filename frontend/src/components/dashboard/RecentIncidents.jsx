import React, { useState } from 'react';
import {
  Brain, Copy, Check, Eye, Loader2, RefreshCw, Terminal
} from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function RecentIncidents({
  incidents, onSelect, onAnalyze, aiLoading, aiError, onCopy, copiedId
}) {
  const displayed = incidents.slice(0, 15);

  if (displayed.length === 0) {
    return (
      <div className="glass-panel rounded-2xl border border-background-border p-6 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          Recent Incidents
        </h3>
        <div className="flex items-center justify-center h-32 text-slate-600 text-sm">
          No incidents to display
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl border border-background-border p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          Recent Incidents
        </h3>
        <span className="text-[10px] text-slate-500">
          Showing {displayed.length} of {incidents.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[11px]" role="table" aria-label="Recent incidents table">
          <thead>
            <tr className="border-b border-background-border/50">
              {['Incident ID', 'Error Type', 'Severity', 'AI Status', 'Line', 'Actions'].map((col) => (
                <th
                  key={col}
                  className="text-left py-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-background-border/30">
            {displayed.map((inc) => {
              const isLoading = aiLoading?.[inc.incident_id];
              const hasReport = inc.ai_status === 'analysed';
              return (
                <tr
                  key={inc.incident_id}
                  className="hover:bg-slate-800/30 transition-colors group"
                >
                  {/* Incident ID */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono-code text-slate-400">
                        {inc.incident_id.slice(0, 12)}…
                      </span>
                      <button
                        onClick={() => onCopy(inc.incident_id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-white transition-all"
                        aria-label="Copy incident ID"
                      >
                        {copiedId === inc.incident_id
                          ? <Check className="w-3 h-3 text-accent" />
                          : <Copy className="w-3 h-3" />
                        }
                      </button>
                    </div>
                  </td>

                  {/* Error Type */}
                  <td className="py-3 px-3">
                    <span className="text-white font-medium truncate max-w-[160px] block" title={inc.error_type}>
                      {inc.error_type}
                    </span>
                  </td>

                  {/* Severity */}
                  <td className="py-3 px-3">
                    <StatusBadge type="severity" value={inc.severity} />
                  </td>

                  {/* AI Status */}
                  <td className="py-3 px-3">
                    <StatusBadge type="ai" value={inc.ai_status} />
                  </td>

                  {/* Line */}
                  <td className="py-3 px-3">
                    <span className="font-mono-code text-slate-500">{inc.line_number}</span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSelect(inc)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-background-border/50 text-slate-400 hover:text-primary hover:border-primary/30 transition-all"
                        aria-label="View incident details"
                        title="View details"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onAnalyze(inc.incident_id)}
                        disabled={isLoading}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold transition-all ${
                          hasReport
                            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/50'
                            : 'bg-slate-900 border-background-border/50 text-slate-400 hover:border-primary/30 hover:text-primary'
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                        aria-label={hasReport ? 'Re-analyse' : 'Analyse with AI'}
                        title={hasReport ? 'Re-analyse' : 'Analyse with AI'}
                      >
                        {isLoading
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <Brain className="w-3 h-3" />
                        }
                        {isLoading ? 'Running…' : hasReport ? 'Re-run' : 'Analyse'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
