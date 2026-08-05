import React from 'react';
import { Terminal, Cpu, ShieldCheck, Zap, Layers, Play, FileText, CheckCircle2 } from 'lucide-react';
 
export default function About() {
  return (
    <div className="relative min-h-screen bg-background text-background-text pb-16">
      {/* Background Decorative Glows */}
      <div className="glow-spot top-[-100px] left-[-50px]" />
      <div className="glow-spot-accent bottom-[-50px] right-[100px]" />
 
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 z-10 flex flex-col gap-10">
        {/* Header Banner */}
        <div className="glass-panel border border-background-border rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex flex-col gap-3 max-w-2xl">
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/20 border border-primary/40 rounded-full w-fit text-xs text-primary font-bold">
              <span>Enterprise AI Log Intelligence</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              LogNexio AI Platform
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              An enterprise-grade, production-ready AI incident analysis platform designed to stream, detect, classify, analyze, and visualize complex multi-line software stack traces and log anomalies.
            </p>
          </div>
          <div className="w-28 h-28 md:w-36 md:h-36 shrink-0 bg-slate-900/60 p-1 border border-background-border/40 rounded-3xl flex items-center justify-center shadow-xl shadow-primary/5 overflow-hidden">
            <img src="/logo_icon.png" alt="LogNexio Icon" className="w-full h-full object-contain p-2" />
          </div>

        </div>
 
        {/* Specialization Section */}
        <div className="flex flex-col gap-5">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" /> Engineering Specialization Areas
          </h2>
 
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <SpecializationCard 
              icon={<Terminal className="w-5 h-5 text-primary" />} 
              title="Log Anomaly Parsing" 
              desc="Ingests raw application streams, parsing line-by-line using high-performance patterns to isolate exception tracebacks and extract active context blocks." 
            />
            <SpecializationCard 
              icon={<Cpu className="w-5 h-5 text-primary" />} 
              title="AI Incident Analysis" 
              desc="Harnesses Google Gemini large language models configured with specialized site reliability engineer personas to construct structured analysis reports." 
            />
            <SpecializationCard 
              icon={<FileText className="w-5 h-5 text-primary" />} 
              title="Incident Diagnostics" 
              desc="Visualizes active server diagnostics, log timeline intervals, and error severity distributions in clean, high-performance charts." 
            />
          </div>
        </div>
 
        {/* Features Highlights */}
        <div className="flex flex-col gap-5">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" /> Core Features Available
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureBox icon={<Play className="w-5 h-5 text-yellow-400" />} title="1-Click Pipeline Demo" desc="Test out sample stack trace runs representing Java NPEs, Database connection exhaustion, and OOM issues in one click." />
            <FeatureBox icon={<Zap className="w-5 h-5 text-primary" />} title="Idempotent Report Cache" desc="Persists SRE analysis files on disk to prevent redundant external API calls, optimizing response rates and API usage." />
            <FeatureBox icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />} title="Enterprise Security Gateway" desc="Shields internal API keys through backend FastAPI mediation, ensuring external services are never exposed directly to client browsers." />
          </div>
        </div>
      </main>
    </div>
  );
}
 
function SpecializationCard({ icon, title, desc }) {
  return (
    <div className="glass-panel border border-background-border rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-900/50 rounded-xl border border-background-border/50 w-fit">{icon}</div>
        <h3 className="font-bold text-sm text-white">{title}</h3>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}
 
function FeatureBox({ icon, title, desc }) {
  return (
    <div className="glass-panel border border-background-border/50 rounded-2xl p-6 flex flex-col gap-3 font-sans">
      <div className="p-2.5 bg-slate-900 rounded-xl border border-background-border/50 w-fit">{icon}</div>
      <h3 className="font-bold text-sm text-white">{title}</h3>
      <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}
