import React from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';

const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'severity_high', label: 'Highest Severity' },
  { value: 'severity_low', label: 'Lowest Severity' },
  { value: 'confidence', label: 'Highest Confidence' },
];

const SEV_COLORS = {
  CRITICAL: 'border-red-500/40 bg-red-500/10 text-red-400 data-[active]:bg-red-500/20',
  HIGH:     'border-orange-500/40 bg-orange-500/10 text-orange-400 data-[active]:bg-orange-500/20',
  MEDIUM:   'border-yellow-500/40 bg-yellow-500/10 text-yellow-400 data-[active]:bg-yellow-500/20',
  LOW:      'border-blue-500/40 bg-blue-500/10 text-blue-400 data-[active]:bg-blue-500/20',
};

export default function SearchToolbar({
  searchQuery, setSearchQuery,
  filterSeverity, setFilterSeverity,
  filterAiStatus, setFilterAiStatus,
  sortBy, setSortBy,
  resultCount,
}) {
  const toggleSeverity = (sev) => {
    setFilterSeverity((prev) =>
      prev.includes(sev) ? prev.filter((s) => s !== sev) : [...prev, sev]
    );
  };

  const clearAll = () => {
    setSearchQuery('');
    setFilterSeverity([]);
    setFilterAiStatus('all');
    setSortBy('newest');
  };

  const hasFilters = searchQuery || filterSeverity.length > 0 || filterAiStatus !== 'all' || sortBy !== 'newest';

  return (
    <div className="glass-panel rounded-2xl border border-background-border p-4 flex flex-col gap-3">
      {/* Row 1: Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            id="dashboard-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, error type, keyword…"
            aria-label="Search incidents"
            className="w-full bg-slate-900/60 border border-background-border rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <select
            id="dashboard-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort incidents"
            className="bg-slate-900/60 border border-background-border rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-primary/50 transition-all"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Severity + AI Status filters */}
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 shrink-0" />

        {SEVERITIES.map((sev) => {
          const active = filterSeverity.includes(sev);
          return (
            <button
              key={sev}
              onClick={() => toggleSeverity(sev)}
              data-active={active ? '' : undefined}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider transition-all
                ${SEV_COLORS[sev]} ${active ? 'ring-1 ring-current' : 'opacity-60 hover:opacity-100'}`}
              aria-pressed={active}
              aria-label={`Filter by ${sev} severity`}
            >
              {sev}
            </button>
          );
        })}

        <div className="w-px h-4 bg-slate-700 mx-1" />

        {/* AI Status */}
        {['all', 'analysed', 'pending'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterAiStatus(status)}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase tracking-wider transition-all ${
              filterAiStatus === status
                ? 'bg-primary/20 border-primary/40 text-primary'
                : 'bg-slate-900/40 border-background-border/50 text-slate-500 hover:text-slate-300'
            }`}
            aria-pressed={filterAiStatus === status}
          >
            {status === 'all' ? 'All' : status === 'analysed' ? 'AI Ready' : 'Pending'}
          </button>
        ))}

        {/* Result count + clear */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] text-slate-500">
            {resultCount} result{resultCount !== 1 ? 's' : ''}
          </span>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="text-[10px] text-slate-500 hover:text-white flex items-center gap-1 transition-colors"
              aria-label="Clear all filters"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
