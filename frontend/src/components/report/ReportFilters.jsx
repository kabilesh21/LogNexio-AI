import React from 'react';
import { SlidersHorizontal, ArrowUpDown, RefreshCw } from 'lucide-react';

export default function ReportFilters({
  severity, setSeverity,
  sortBy, setSortBy,
  onReset,
  totalCount
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Severity Filter */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="bg-slate-900/60 border border-background-border rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-primary/50 transition-all"
        >
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-slate-900/60 border border-background-border rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-primary/50 transition-all"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="severity">Highest Severity</option>
          <option value="confidence">Highest Confidence</option>
        </select>
      </div>

      {/* Counter & Reset */}
      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs text-slate-500">
          Showing <strong className="text-white">{totalCount}</strong> reports
        </span>
        {(severity !== 'ALL' || sortBy !== 'newest') && (
          <button
            onClick={onReset}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>
    </div>
  );
}
