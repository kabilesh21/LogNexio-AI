import React from 'react';
import { Terminal, CheckCircle2 } from 'lucide-react';

export default function VersionInfo() {
  const modules = [
    { num: '1', name: 'Log Ingestion Engine & Metadata Store', status: 'Complete' },
    { num: '2', name: 'Streaming Multi-line Log Parser & Context Extractor', status: 'Complete' },
    { num: '3', name: 'Gemini AI Incident Analysis Engine', status: 'Complete' },
    { num: '4', name: 'Enterprise Operations Dashboard & Visualizations', status: 'Complete' },
    { num: '5', name: 'Incident Report Center & Multi-format Exporter', status: 'Complete' },
    { num: '6', name: 'Production Polish, Demo Mode & System Diagnostics', status: 'Complete' },
  ];

  return (
    <div className="glass-panel border border-background-border rounded-3xl p-6 sm:p-8 flex flex-col gap-6 max-w-2xl animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/15 border border-primary/30 rounded-2xl">
          <Terminal className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">LogNexio AI Enterprise v1.0.0</h3>
          <p className="text-xs text-slate-400">Pipeline Architecture & Verification Matrix</p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {modules.map((m) => (
          <div key={m.num} className="flex items-center justify-between p-3.5 bg-slate-900/60 border border-background-border/50 rounded-2xl text-xs">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 text-primary font-mono-code font-bold flex items-center justify-center text-[10px]">
                P{m.num}
              </span>
              <span className="font-semibold text-slate-200">{m.name}</span>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-accent bg-accent/10 border border-accent/20 px-2.5 py-0.5 rounded-full uppercase">
              <CheckCircle2 className="w-3 h-3" /> {m.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
