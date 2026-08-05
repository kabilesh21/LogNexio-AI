import React, { useState, useEffect } from 'react';
import { X, GitCompare, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { compareReports } from '../../services/reportService';
import StatusBadge from '../dashboard/StatusBadge';

export default function ReportComparison({ incidentIds, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await compareReports(incidentIds);
        if (res.success) setData(res);
        else throw new Error(res.summary_insight || 'Failed to compare reports.');
      } catch (err) {
        setError(err.message || 'Comparison failed.');
      } finally {
        setLoading(false);
      }
    }
    if (incidentIds && incidentIds.length >= 2) {
      load();
    }
  }, [incidentIds]);

  if (!incidentIds || incidentIds.length < 2) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel border border-background-border rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="px-6 py-5 border-b border-background-border/50 flex items-center justify-between gap-4 bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/15 border border-primary/30 rounded-2xl">
              <GitCompare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Side-by-Side Report Comparison</h2>
              <p className="text-xs text-slate-400">Comparing {incidentIds.length} incident reports</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 border border-background-border text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scrollbar-thin">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span>Comparing reports…</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 p-4 bg-red-950/30 border border-red-500/30 rounded-2xl text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : data ? (
            <>
              {/* Insight banner */}
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-2xl text-xs text-primary font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{data.summary_insight}</span>
              </div>

              {/* Matrix Table */}
              <div className="overflow-x-auto border border-background-border rounded-2xl">
                <table className="w-full text-left text-xs" role="table">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-background-border">
                      <th className="py-3.5 px-4 font-bold text-slate-400 uppercase tracking-wider w-44">Attribute</th>
                      {data.compared_incidents.map((id) => {
                        const rep = data.reports[id];
                        return (
                          <th key={id} className="py-3.5 px-4 font-bold text-white border-l border-background-border min-w-[240px]">
                            <div className="flex flex-col gap-1">
                              <span className="truncate">{rep?.error_type || 'Unknown'}</span>
                              <span className="font-mono-code text-[10px] text-slate-500">ID: {id.slice(0, 12)}…</span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-background-border/40 bg-slate-950/40">
                    {data.differences.map((diff, idx) => (
                      <tr key={idx} className={diff.is_different ? 'bg-yellow-500/5' : ''}>
                        <td className="py-3 px-4 font-semibold text-slate-300 bg-slate-900/40 flex items-center justify-between">
                          <span>{diff.field_name}</span>
                          {diff.is_different && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 uppercase">
                              Differs
                            </span>
                          )}
                        </td>
                        {data.compared_incidents.map((id) => {
                          const val = diff.values[id] || '—';
                          return (
                            <td key={id} className="py-3 px-4 border-l border-background-border/40 text-slate-300 leading-relaxed">
                              {diff.field_name === 'Severity Level' ? (
                                <StatusBadge type="severity" value={val} />
                              ) : (
                                val
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
