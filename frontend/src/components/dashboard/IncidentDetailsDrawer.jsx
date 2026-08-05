import React, { useEffect } from 'react';
import {
  X, Brain, Target, Cpu, Building2, CheckCircle2,
  ShieldCheck, Tag, Clock, Percent, Copy, Check, ChevronDown, ChevronUp
} from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function IncidentDetailsDrawer({
  incident, onClose, onAnalyze, aiLoading, onCopy, copiedId
}) {
  const report = incident?.ai_summary;
  const isLoading = aiLoading?.[incident?.incident_id];

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!incident) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Incident Details"
        className="fixed inset-y-0 right-0 w-full sm:w-[520px] z-50 flex flex-col
          bg-slate-950/95 backdrop-blur-xl border-l border-background-border
          shadow-2xl shadow-black/40 animate-slide-in-right overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-background-border/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/15 border border-primary/30 rounded-xl">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Incident Details</p>
              <p className="text-[10px] text-slate-500 font-mono-code">
                {incident.incident_id.slice(0, 24)}…
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-background-border text-slate-400 hover:text-white transition-all"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5 scrollbar-thin">

          {/* Basic info */}
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge type="severity" value={incident.severity} />
            <StatusBadge type="ai" value={incident.ai_status} />
            <span className="text-[10px] font-mono-code text-slate-500 bg-slate-900 border border-background-border px-2.5 py-0.5 rounded-md">
              Line {incident.line_number}
            </span>
          </div>

          <div className="p-4 bg-slate-900/60 border border-background-border/50 rounded-xl">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-1">Error Type</p>
            <p className="text-sm font-bold text-white">{incident.error_type}</p>
          </div>

          {/* Error block preview */}
          {incident.error_block && incident.error_block.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Error Block</p>
              <div className="bg-red-950/20 border-l-2 border-red-500 rounded-r-xl p-3 font-mono-code text-[10px] text-slate-300 overflow-x-auto max-h-32">
                {incident.error_block.slice(0, 6).map((line, i) => (
                  <div key={i} className="whitespace-pre">{line}</div>
                ))}
                {incident.error_block.length > 6 && (
                  <div className="text-slate-600 mt-1">…{incident.error_block.length - 6} more lines</div>
                )}
              </div>
            </div>
          )}

          {/* AI report section */}
          {report ? (
            <>
              <DrawerSection icon={<Brain className="w-4 h-4 text-primary" />} title="Incident Summary" color="primary">
                <p className="text-sm text-slate-300 leading-relaxed">{report.incident_summary}</p>
              </DrawerSection>

              <DrawerSection icon={<Target className="w-4 h-4 text-red-400" />} title="Root Cause" color="red">
                <p className="text-sm text-slate-300 leading-relaxed">{report.root_cause}</p>
              </DrawerSection>

              <DrawerSection icon={<Cpu className="w-4 h-4 text-primary" />} title="Technical Explanation" color="primary">
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{report.technical_explanation}</p>
              </DrawerSection>

              <DrawerSection icon={<Building2 className="w-4 h-4 text-yellow-400" />} title="Business Impact" color="yellow">
                <p className="text-sm text-slate-300 leading-relaxed">{report.business_impact}</p>
              </DrawerSection>

              <DrawerSection icon={<CheckCircle2 className="w-4 h-4 text-accent" />} title="Resolution Steps" color="green">
                <ol className="flex flex-col gap-2">
                  {(report.resolution_steps || []).map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-accent/20 border border-accent/30 text-accent text-[10px] font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </DrawerSection>

              <DrawerSection icon={<ShieldCheck className="w-4 h-4 text-primary" />} title="Preventive Measures" color="primary">
                <ul className="flex flex-col gap-2">
                  {(report.preventive_measures || []).map((measure, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      {measure}
                    </li>
                  ))}
                </ul>
              </DrawerSection>

              {/* Meta row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900/60 border border-background-border/50 rounded-xl">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-1">
                    <Percent className="w-3 h-3" /> Confidence
                  </p>
                  <p className="text-lg font-bold text-white mt-0.5">{report.confidence}</p>
                </div>
                <div className="p-3 bg-slate-900/60 border border-background-border/50 rounded-xl">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Est. Fix Time
                  </p>
                  <p className="text-sm font-bold text-white mt-0.5">{report.estimated_fix_time}</p>
                </div>
              </div>

              {/* Keywords */}
              {report.keywords?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 items-center">
                  <Tag className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  {report.keywords.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 text-[10px] font-mono-code bg-slate-900 border border-background-border/60 text-slate-400 rounded">
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="p-5 border border-dashed border-slate-700 rounded-2xl text-center flex flex-col items-center gap-3">
              <Brain className="w-8 h-8 text-slate-700" />
              <div>
                <p className="text-sm font-semibold text-slate-400">No AI report yet</p>
                <p className="text-xs text-slate-600 mt-1">Click "Run AI Analysis" to generate a report</p>
              </div>
              <button
                onClick={() => onAnalyze(incident.incident_id)}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Analysing…' : 'Run AI Analysis'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-background-border/50 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => onCopy(incident.incident_id)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-background-border text-slate-400 hover:text-white transition-all"
            aria-label="Copy incident ID"
          >
            {copiedId === incident.incident_id
              ? <><Check className="w-3.5 h-3.5 text-accent" /> Copied!</>
              : <><Copy className="w-3.5 h-3.5" /> Copy ID</>
            }
          </button>

          {report && (
            <button
              onClick={() => onCopy(JSON.stringify(report, null, 2))}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 transition-all"
              aria-label="Copy AI report"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Report
            </button>
          )}

          <button
            onClick={() => onAnalyze(incident.incident_id)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-background-border text-slate-400 hover:border-primary/30 hover:text-primary transition-all disabled:opacity-40 ml-auto"
          >
            <Brain className="w-3.5 h-3.5" />
            {isLoading ? 'Running…' : report ? 'Re-analyse' : 'Analyse'}
          </button>
        </div>
      </aside>
    </>
  );
}

function DrawerSection({ icon, title, color, children }) {
  const [expanded, setExpanded] = React.useState(true);
  const colorMap = {
    primary: 'text-primary border-primary/20 bg-primary/5',
    red: 'text-red-400 border-red-500/20 bg-red-950/10',
    yellow: 'text-yellow-400 border-yellow-500/20 bg-yellow-950/10',
    green: 'text-emerald-400 border-emerald-500/20 bg-emerald-950/10',
  };
  const cls = colorMap[color] || colorMap.primary;

  return (
    <div className={`border rounded-xl overflow-hidden ${cls}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left"
        aria-expanded={expanded}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
          {icon} {title}
        </span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}
