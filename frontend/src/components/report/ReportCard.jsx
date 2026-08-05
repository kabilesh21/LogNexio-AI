import React from 'react';
import { Eye, Trash2, CheckSquare, Square, Download, Clock } from 'lucide-react';
import StatusBadge from '../dashboard/StatusBadge';

export default function ReportCard({
  report,
  onOpen,
  onDelete,
  onToggleCompare,
  isSelectedForCompare,
}) {
  return (
    <div
      className={`glass-panel border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-300
        hover:scale-[1.01] hover:shadow-xl ${
          isSelectedForCompare
            ? 'border-primary/50 bg-primary/10 shadow-lg shadow-primary/5'
            : 'border-background-border hover:border-slate-600 hover:bg-slate-800/30'
        }`}
    >
      {/* Top row: ID + Severity */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white truncate max-w-[200px]" title={report.error_type}>
              {report.error_type}
            </span>
            <StatusBadge type="severity" value={report.severity} />
          </div>
          <p className="text-[10px] text-slate-500 font-mono-code mt-1">
            ID: {report.incident_id.slice(0, 16)}…
          </p>
        </div>

        {/* Compare Checkbox Button */}
        <button
          onClick={() => onToggleCompare(report.incident_id)}
          className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
            isSelectedForCompare
              ? 'bg-primary/20 border-primary/50 text-primary font-bold'
              : 'bg-slate-900/60 border-background-border/60 text-slate-400 hover:text-white'
          }`}
          title={isSelectedForCompare ? 'Selected for comparison' : 'Compare this report'}
        >
          {isSelectedForCompare ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4" />}
        </button>
      </div>

      {/* Summary snippet */}
      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
        {report.incident_summary}
      </p>

      {/* Component & Confidence info */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 pt-2 border-t border-background-border/40 font-mono-code">
        <span>Component: <strong className="text-slate-200">{report.affected_component}</strong></span>
        <span>Fix Time: <strong className="text-slate-200">{report.estimated_fix_time}</strong></span>
      </div>

      {/* Footer: Quick Actions */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <Clock className="w-3 h-3" />
          <span>{report.created_at ? new Date(report.created_at).toLocaleDateString() : 'Recent'}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Delete */}
          <button
            onClick={() => onDelete(report.incident_id)}
            className="p-2 rounded-xl bg-slate-900 border border-background-border text-slate-500 hover:text-red-400 hover:border-red-500/30 transition-all"
            title="Delete saved report"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Open Full Report */}
          <button
            onClick={() => onOpen(report.incident_id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25 transition-all"
          >
            <Eye className="w-3.5 h-3.5" /> Open Report
          </button>
        </div>
      </div>
    </div>
  );
}
