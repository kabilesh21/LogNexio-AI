import React from 'react';

export default function MetricCard({ icon, label, value, sub, color = 'primary', animate = true }) {
  const colorMap = {
    primary: 'text-primary border-primary/20 bg-primary/5',
    red:     'text-red-400 border-red-500/20 bg-red-950/10',
    orange:  'text-orange-400 border-orange-500/20 bg-orange-950/10',
    yellow:  'text-yellow-400 border-yellow-500/20 bg-yellow-950/10',
    blue:    'text-blue-400 border-blue-500/20 bg-blue-950/10',
    green:   'text-emerald-400 border-emerald-500/20 bg-emerald-950/10',
    slate:   'text-slate-400 border-slate-600/20 bg-slate-900/30',
  };
  const cls = colorMap[color] || colorMap.primary;

  return (
    <div
      className={`glass-panel rounded-2xl border p-5 flex flex-col gap-3 transition-all duration-300
        hover:scale-[1.02] hover:shadow-lg ${cls} ${animate ? 'animate-fade-in' : ''}`}
    >
      <div className={`p-2.5 rounded-xl border w-fit ${cls}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-0.5">{label}</p>
        <p className="text-2xl font-extrabold text-white leading-none">{value ?? '—'}</p>
        {sub && <p className="text-[10px] text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}
