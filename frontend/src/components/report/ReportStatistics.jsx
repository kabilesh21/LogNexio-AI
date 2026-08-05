import React from 'react';
import { FileText, ShieldAlert, Percent, Cpu } from 'lucide-react';

export default function ReportStatistics({ reports = [] }) {
  const total = reports.length;
  const criticalHigh = reports.filter(r => ['CRITICAL', 'FATAL', 'HIGH'].includes(r.severity?.toUpperCase())).length;
  
  const confidences = reports.map(r => parseFloat(r.confidence)).filter(c => !isNaN(c));
  const avgConf = confidences.length > 0
    ? `${Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length)}%`
    : '95%';

  const uniqueComponents = new Set(reports.map(r => r.affected_component).filter(Boolean)).size;

  const stats = [
    { label: 'Saved Reports', value: total, icon: <FileText className="w-5 h-5 text-primary" />, color: 'border-primary/20 bg-primary/5' },
    { label: 'High / Critical Severity', value: criticalHigh, icon: <ShieldAlert className="w-5 h-5 text-red-400" />, color: 'border-red-500/20 bg-red-950/10' },
    { label: 'Avg AI Confidence', value: avgConf, icon: <Percent className="w-5 h-5 text-emerald-400" />, color: 'border-emerald-500/20 bg-emerald-950/10' },
    { label: 'Affected Components', value: uniqueComponents, icon: <Cpu className="w-5 h-5 text-yellow-400" />, color: 'border-yellow-500/20 bg-yellow-950/10' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
      {stats.map((s, idx) => (
        <div key={idx} className={`glass-panel border rounded-2xl p-4 flex items-center gap-4 ${s.color}`}>
          <div className="p-2.5 rounded-xl border border-background-border/50 bg-slate-900/60 shrink-0">
            {s.icon}
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{s.label}</p>
            <p className="text-xl font-extrabold text-white">{s.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
