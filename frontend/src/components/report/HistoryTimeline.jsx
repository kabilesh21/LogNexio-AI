import React, { useState, useEffect } from 'react';
import { Clock, Eye, ShieldAlert, GitBranch } from 'lucide-react';
import { fetchReportHistory } from '../../services/reportService';
import StatusBadge from '../dashboard/StatusBadge';

export default function HistoryTimeline({ onSelectReport }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchReportHistory();
        setHistory(data);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="glass-panel border border-background-border rounded-2xl p-6 flex flex-col gap-3 animate-pulse">
        <div className="h-5 w-40 bg-slate-800 rounded" />
        <div className="h-20 w-full bg-slate-800/50 rounded-xl" />
      </div>
    );
  }

  if (history.length === 0) return null;

  return (
    <div className="glass-panel border border-background-border rounded-2xl p-6 flex flex-col gap-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-primary" />
          Report Generation History
        </h3>
        <span className="text-[10px] text-slate-500">{history.length} timeline entries</span>
      </div>

      <div className="relative flex flex-col pl-3">
        {/* Line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-slate-800" />

        {history.map((item, idx) => (
          <div key={item.incident_id + idx} className="relative pl-8 pb-5 group">
            {/* Dot */}
            <div className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 bg-primary group-hover:scale-125 transition-transform" />

            <div
              onClick={() => onSelectReport(item.incident_id)}
              className="glass-panel border border-background-border/50 rounded-xl p-3.5 cursor-pointer hover:border-primary/40 hover:bg-slate-800/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs text-white truncate">{item.error_type}</span>
                  <StatusBadge type="severity" value={item.severity} />
                  <span className="text-[10px] text-slate-500 font-mono-code">ID: {item.incident_id.slice(0, 12)}…</span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-1">{item.incident_summary}</p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{item.formatted_date}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onSelectReport(item.incident_id); }}
                  className="p-1.5 rounded-lg bg-slate-900 border border-background-border text-slate-400 hover:text-primary transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
