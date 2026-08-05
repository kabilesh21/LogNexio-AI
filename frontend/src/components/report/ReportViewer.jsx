import React, { useState, useEffect } from 'react';
import {
  X, Brain, Target, Cpu, Building2, CheckCircle2,
  ShieldCheck, Tag, Percent, Clock, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';
import StatusBadge from '../dashboard/StatusBadge';
import ExportMenu from './ExportMenu';
import { fetchReportById } from '../../services/reportService';

export default function ReportViewer({ incidentId, onClose }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchReportById(incidentId);
        if (isMounted) setReport(data);
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load report.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    if (incidentId) load();
    return () => { isMounted = false; };
  }, [incidentId]);

  // Handle ESC key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!incidentId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="glass-panel border border-background-border rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-background-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/15 border border-primary/30 rounded-2xl shrink-0">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-lg font-bold text-white">AI Incident Analysis Report</h2>
                {report && <StatusBadge type="severity" value={report.severity} />}
              </div>
              <p className="text-xs text-slate-400 font-mono-code mt-0.5">
                Incident ID: {incidentId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 border border-background-border text-slate-400 hover:text-white transition-all self-end sm:self-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scrollbar-thin">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <Brain className="w-8 h-8 animate-pulse text-primary" />
              <span>Loading report details…</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 p-4 bg-red-950/30 border border-red-500/30 rounded-2xl text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : report ? (
            <>
              {/* Export Toolbar Header */}
              <div className="p-4 bg-slate-900/40 border border-background-border/50 rounded-2xl flex flex-wrap items-center justify-between gap-4 shrink-0">
                <span className="text-xs font-semibold text-background-muted">Export Report Options:</span>
                <ExportMenu incidentId={incidentId} report={report} />
              </div>
 
              {/* Summary */}
              <ViewerSection icon={<Brain className="w-4 h-4 text-primary" />} title="Executive Summary" color="primary">
                <p className="text-sm text-background-text leading-relaxed font-medium">{report.incident_summary}</p>
              </ViewerSection>
 
              {/* Overview Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
                <MetricBox label="Error Type" value={report.error_type} />
                <MetricBox label="Affected Component" value={report.affected_component} />
                <MetricBox label="Est. Fix Time" value={report.estimated_fix_time} />
                <MetricBox label="AI Confidence" value={report.confidence} />
              </div>
 
              {/* Root Cause */}
              <ViewerSection icon={<Target className="w-4 h-4 text-red-400" />} title="Root Cause Analysis" color="red">
                <p className="text-sm text-background-muted leading-relaxed">{report.root_cause}</p>
              </ViewerSection>
 
              {/* Technical Explanation */}
              <ViewerSection icon={<Cpu className="w-4 h-4 text-primary" />} title="Technical Explanation" color="primary">
                <p className="text-sm text-background-muted leading-relaxed whitespace-pre-line">{report.technical_explanation}</p>
              </ViewerSection>
 
              {/* Business Impact */}
              <ViewerSection icon={<Building2 className="w-4 h-4 text-yellow-400" />} title="Business Impact & Risk" color="yellow">
                <p className="text-sm text-background-muted leading-relaxed">{report.business_impact}</p>
              </ViewerSection>
 
              {/* Resolution Steps */}
              <ViewerSection icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />} title="Actionable Resolution Steps" color="green">
                <ol className="flex flex-col gap-2.5">
                  {(report.resolution_steps || []).map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-background-muted">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </ViewerSection>
 
              {/* Preventive Measures */}
              <ViewerSection icon={<ShieldCheck className="w-4 h-4 text-primary" />} title="Recommended Preventive Measures" color="primary">
                <ul className="flex flex-col gap-2">
                  {(report.preventive_measures || []).map((measure, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-background-muted">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      <span className="leading-relaxed">{measure}</span>
                    </li>
                  ))}
                </ul>
              </ViewerSection>
 
              {/* Keywords */}
              {report.keywords?.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2 shrink-0">
                  <Tag className="w-3.5 h-3.5 text-background-muted shrink-0" />
                  {report.keywords.map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 text-xs font-mono-code bg-slate-900 border border-background-border text-slate-300 rounded-lg">
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ViewerSection({ icon, title, color, children }) {
  const [open, setOpen] = useState(true);
  const colors = {
    primary: 'border-primary/20 bg-primary/5 text-primary',
    red: 'border-red-500/20 bg-red-950/10 text-red-400',
    yellow: 'border-yellow-500/20 bg-yellow-950/10 text-yellow-400',
    green: 'border-emerald-500/20 bg-emerald-950/10 text-emerald-400',
  };
  const theme = colors[color] || colors.primary;

  return (
    <div className={`border rounded-2xl overflow-hidden shrink-0 ${theme}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-3 flex items-center justify-between text-left font-bold text-xs uppercase tracking-wider select-none"
      >
        <span className="flex items-center gap-2">{icon} {title}</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="px-5 pb-5 pt-1 border-t border-background-border/40">{children}</div>}
    </div>
  );
}

function MetricBox({ label, value }) {
  return (
    <div className="p-3 bg-slate-900/60 border border-background-border/50 rounded-xl">
      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{label}</p>
      <p className="text-xs font-bold text-white mt-1 truncate" title={value}>{value || '—'}</p>
    </div>
  );
}
