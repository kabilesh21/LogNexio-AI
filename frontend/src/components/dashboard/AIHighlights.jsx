import React from 'react';
import { Brain, Flame, Cpu, Key, BarChart2, Percent, Database } from 'lucide-react';

export default function AIHighlights({ highlights }) {
  if (!highlights) {
    return (
      <div className="glass-panel rounded-2xl border border-background-border p-6 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          AI Insights
        </h3>
        <div className="flex items-center justify-center h-32 text-slate-600 text-sm flex-col gap-2">
          <Brain className="w-8 h-8 text-slate-500" />
          <span>Run AI analysis on incidents to see insights</span>
        </div>
      </div>
    );
  }

  const items = [
    {
      icon: <Flame className="w-4 h-4 text-red-400" />,
      label: 'Most Common Exception',
      value: highlights.mostCommonException,
      color: 'text-red-400',
    },
    {
      icon: <Flame className="w-4 h-4 text-orange-400" />,
      label: 'Highest Severity',
      value: highlights.highestSeverity,
      color: 'text-orange-400',
    },
    {
      icon: <Cpu className="w-4 h-4 text-primary" />,
      label: 'Most Affected Component',
      value: highlights.mostAffectedComponent,
      color: 'text-primary',
    },
    {
      icon: <Key className="w-4 h-4 text-yellow-400" />,
      label: 'Top Keyword',
      value: highlights.topKeyword,
      color: 'text-yellow-400',
    },
    {
      icon: <BarChart2 className="w-4 h-4 text-emerald-400" />,
      label: 'AI Reports Generated',
      value: String(highlights.aiReportsCount),
      color: 'text-emerald-400',
    },
    {
      icon: <Percent className="w-4 h-4 text-primary" />,
      label: 'Average Confidence',
      value: highlights.avgConfidence,
      color: 'text-primary',
    },
    {
      icon: <Database className="w-4 h-4 text-slate-400" />,
      label: 'Cache Utilization',
      value: highlights.cacheUtilization,
      color: 'text-slate-300',
    },
  ];

  return (
    <div className="glass-panel rounded-2xl border border-background-border p-6 flex flex-col gap-4">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
        <Brain className="w-4 h-4 text-primary" />
        AI Insights
        <span className="ml-auto text-[10px] font-normal text-slate-500 normal-case tracking-normal bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full text-primary">
          Local computation
        </span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3.5 bg-slate-900/50 border border-background-border/50 rounded-xl hover:border-slate-700 transition-colors"
          >
            <div className="p-2 bg-slate-800 rounded-lg border border-background-border/50 shrink-0">
              {item.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                {item.label}
              </p>
              <p className={`text-xs font-bold truncate mt-0.5 ${item.color}`} title={item.value}>
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
