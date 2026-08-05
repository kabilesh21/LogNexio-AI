import React from 'react';
import { Search, Filter, SortAsc } from 'lucide-react';

export default function SearchFilterSort({
  searchQuery,
  setSearchQuery,
  selectedSeverities,
  toggleSeverity,
  sortBy,
  setSortBy
}) {
  const severities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  return (
    <div className="glass-panel rounded-2xl border border-background-border p-6 shadow-md flex flex-col md:flex-row gap-4 items-center justify-between animate-fade-in">
      {/* Search Input */}
      <div className="relative w-full md:w-1/3">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-background-muted">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          placeholder="Search by UUID, type, message..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-background-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-all font-sans"
        />
      </div>

      {/* Filter Checkboxes */}
      <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
        <span className="text-xs text-background-muted flex items-center gap-1.5 font-medium select-none">
          <Filter className="w-3.5 h-3.5" /> Filter Severity:
        </span>
        <div className="flex gap-2 flex-wrap">
          {severities.map((sev) => {
            const isActive = selectedSeverities.includes(sev);
            let colorClasses = '';
            
            if (sev === 'CRITICAL') colorClasses = isActive ? 'bg-red-600/30 border-red-500 text-red-400' : 'bg-slate-900 border-background-border text-slate-500';
            else if (sev === 'HIGH') colorClasses = isActive ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-slate-900 border-background-border text-slate-500';
            else if (sev === 'MEDIUM') colorClasses = isActive ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'bg-slate-900 border-background-border text-slate-500';
            else colorClasses = isActive ? 'bg-slate-700/40 border-slate-500 text-slate-300' : 'bg-slate-900 border-background-border text-slate-500';

            return (
              <button
                key={sev}
                onClick={() => toggleSeverity(sev)}
                className={`px-3 py-1 border rounded-lg text-[10px] font-bold tracking-wider transition-all select-none hover:scale-95 ${colorClasses}`}
              >
                {sev}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort Selector */}
      <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
        <span className="text-xs text-background-muted flex items-center gap-1.5 font-medium select-none">
          <SortAsc className="w-3.5 h-3.5" /> Sort:
        </span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-slate-900 border border-background-border text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-primary transition-all font-sans cursor-pointer"
        >
          <option value="newest">Newest (Line Desc)</option>
          <option value="oldest">Oldest (Line Asc)</option>
          <option value="severity">Severity Rank</option>
        </select>
      </div>
    </div>
  );
}
