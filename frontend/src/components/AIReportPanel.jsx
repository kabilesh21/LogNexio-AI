import React from 'react';
import {
  Brain,
  AlertTriangle,
  Cpu,
  TrendingUp,
  ShieldCheck,
  Clock,
  Target,
  Lightbulb,
  CheckCircle2,
  Activity,
  Tag,
  Building2
} from 'lucide-react';

/**
 * AIReportPanel
 * 
 * Renders the full AI-generated incident analysis report inside an expandable
 * panel beneath the incident code context section. Receives a `report` object
 * matching the AIReport contract from Module 3's backend.
 */
export default function AIReportPanel({ report }) {
  if (!report) return null;

  const getSeverityStyle = (severity) => {
    switch ((severity || '').toUpperCase()) {
      case 'CRITICAL':
      case 'FATAL':
        return { badge: 'bg-red-600/15 border-red-500/30 text-red-400', bar: 'bg-red-500' };
      case 'HIGH':
        return { badge: 'bg-orange-500/15 border-orange-500/30 text-orange-400', bar: 'bg-orange-500' };
      case 'MEDIUM':
        return { badge: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400', bar: 'bg-yellow-400' };
      default:
        return { badge: 'bg-blue-500/15 border-blue-500/30 text-blue-400', bar: 'bg-blue-500' };
    }
  };

  const severityStyle = getSeverityStyle(report.severity);

  return (
    <div className="mt-4 border border-primary/20 rounded-2xl bg-slate-950/80 overflow-hidden animate-slide-up">
      {/* Panel Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-primary/10 bg-gradient-to-r from-primary/10 via-slate-900/50 to-slate-950/50">
        <div className="p-2 bg-primary/20 rounded-xl border border-primary/30">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white">AI Incident Analysis Report</p>
          <p className="text-[10px] text-background-muted">Powered by Gemini · Senior SRE Panel Analysis</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${severityStyle.badge}`}>
            {report.severity}
          </span>
          <span className="text-[10px] text-background-muted bg-slate-900 border border-background-border/60 px-2.5 py-0.5 rounded-full font-mono-code">
            {report.confidence} confidence
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-5">
        {/* Incident Summary */}
        <div className="p-4 bg-slate-900/60 border border-background-border/50 rounded-xl">
          <p className="text-[10px] text-background-muted uppercase tracking-widest font-semibold mb-1.5 flex items-center gap-1.5">
            <Activity className="w-3 h-3" /> Incident Summary
          </p>
          <p className="text-sm text-white font-medium leading-relaxed">{report.incident_summary}</p>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard icon={<AlertTriangle className="w-4 h-4 text-orange-400" />} label="Error Type" value={report.error_type} />
          <MetricCard icon={<Cpu className="w-4 h-4 text-primary" />} label="Component" value={report.affected_component} />
          <MetricCard icon={<Clock className="w-4 h-4 text-accent" />} label="Est. Fix Time" value={report.estimated_fix_time} />
          <MetricCard icon={<TrendingUp className="w-4 h-4 text-yellow-400" />} label="Confidence" value={report.confidence} />
        </div>

        {/* Root Cause */}
        <Section
          icon={<Target className="w-4 h-4 text-red-400" />}
          title="Root Cause"
          color="border-red-500/20 bg-red-950/10"
          titleColor="text-red-400"
        >
          <p className="text-sm text-slate-300 leading-relaxed">{report.root_cause}</p>
        </Section>

        {/* Technical Explanation */}
        <Section
          icon={<Cpu className="w-4 h-4 text-primary" />}
          title="Technical Explanation"
          color="border-primary/20 bg-primary/5"
          titleColor="text-primary"
        >
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {report.technical_explanation}
          </p>
        </Section>

        {/* Business Impact */}
        <Section
          icon={<Building2 className="w-4 h-4 text-yellow-400" />}
          title="Business Impact"
          color="border-yellow-500/20 bg-yellow-950/10"
          titleColor="text-yellow-400"
        >
          <p className="text-sm text-slate-300 leading-relaxed">{report.business_impact}</p>
        </Section>

        {/* Resolution + Prevention Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Resolution Steps */}
          <Section
            icon={<CheckCircle2 className="w-4 h-4 text-accent" />}
            title="Resolution Steps"
            color="border-accent/20 bg-accent/5"
            titleColor="text-accent"
          >
            <ol className="flex flex-col gap-2">
              {(report.resolution_steps || []).map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-accent/20 border border-accent/30 text-accent text-[10px] font-bold flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </Section>

          {/* Preventive Measures */}
          <Section
            icon={<ShieldCheck className="w-4 h-4 text-primary" />}
            title="Preventive Measures"
            color="border-primary/20 bg-primary/5"
            titleColor="text-primary"
          >
            <ul className="flex flex-col gap-2">
              {(report.preventive_measures || []).map((measure, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <Lightbulb className="w-3.5 h-3.5 text-primary shrink-0 mt-1" />
                  <span className="leading-relaxed">{measure}</span>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        {/* Keywords */}
        {report.keywords && report.keywords.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-background-muted shrink-0" />
            {report.keywords.map((kw, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 text-[10px] font-mono-code bg-slate-900 border border-background-border/60 text-slate-400 rounded-md"
              >
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-background-border/30">
          <p className="text-[9px] text-slate-600 font-mono-code">
            Incident ID: {report.incident_id}
          </p>
          <p className="text-[9px] text-slate-600">
            Module 4 contract ready · Dashboard visualization pending
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function MetricCard({ icon, label, value }) {
  return (
    <div className="flex flex-col gap-1.5 p-3 bg-slate-900/60 border border-background-border/50 rounded-xl">
      <div className="flex items-center gap-1.5 text-[10px] text-background-muted font-semibold uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <p className="text-xs text-white font-semibold leading-tight truncate" title={value}>
        {value || '—'}
      </p>
    </div>
  );
}

function Section({ icon, title, color, titleColor, children }) {
  return (
    <div className={`border rounded-xl p-4 ${color}`}>
      <p className={`text-[10px] uppercase tracking-widest font-bold mb-3 flex items-center gap-1.5 ${titleColor}`}>
        {icon}
        {title}
      </p>
      {children}
    </div>
  );
}
