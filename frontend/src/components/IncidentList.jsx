import React, { useState } from 'react';
import {
  ChevronDown, ChevronUp, Copy, Check,
  Terminal, ShieldAlert, Cpu, Brain, Loader2, RefreshCw
} from 'lucide-react';
import AIReportPanel from './AIReportPanel';

const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? '' : 'http://localhost:8000');

export default function IncidentList({ incidents, onCopyToClipboard, copiedId }) {
  const [expandedIds, setExpandedIds] = useState([]);
  const [aiReports, setAiReports] = useState({});       // { incident_id: report }
  const [aiLoading, setAiLoading] = useState({});        // { incident_id: boolean }
  const [aiErrors, setAiErrors] = useState({});          // { incident_id: string }

  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // ── AI analysis handler ───────────────────────────────────────────
  const handleAnalyzeWithAI = async (e, incidentId) => {
    e.stopPropagation();

    // If already loaded, toggle the panel off (the parent expand controls visibility)
    if (aiReports[incidentId]) {
      setAiReports((prev) => {
        const next = { ...prev };
        delete next[incidentId];
        return next;
      });
      return;
    }

    setAiLoading((prev) => ({ ...prev, [incidentId]: true }));
    setAiErrors((prev) => { const n = { ...prev }; delete n[incidentId]; return n; });

    try {
      const res = await fetch(`${API_BASE}/api/ai/analyze/${incidentId}`, {
        method: 'POST',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.report) {
        setAiReports((prev) => ({ ...prev, [incidentId]: data.report }));
      } else {
        throw new Error('AI service returned an unexpected response structure.');
      }
    } catch (err) {
      setAiErrors((prev) => ({ ...prev, [incidentId]: err.message }));
    } finally {
      setAiLoading((prev) => ({ ...prev, [incidentId]: false }));
    }
  };

  // ── Severity badge ────────────────────────────────────────────────
  const getSeverityBadge = (severity) => {
    const baseClasses = "px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border";
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
      case 'FATAL':
        return <span className={`${baseClasses} bg-red-600/10 border-red-500/30 text-red-400`}>Critical</span>;
      case 'HIGH':
        return <span className={`${baseClasses} bg-orange-500/10 border-orange-500/30 text-orange-400`}>High</span>;
      case 'MEDIUM':
        return <span className={`${baseClasses} bg-yellow-500/10 border-yellow-500/30 text-yellow-400`}>Medium</span>;
      case 'LOW':
      case 'INFO':
        return <span className={`${baseClasses} bg-blue-500/10 border-blue-500/30 text-blue-400`}>Low</span>;
      default:
        return <span className={`${baseClasses} bg-slate-800 border-slate-700 text-slate-400`}>{severity}</span>;
    }
  };

  // Helper to highlight error lines with red background
  const shouldHighlightLine = (lineText) => {
    const upperText = lineText.upperCase ? lineText.upperCase() : lineText.toUpperCase();
    return upperText.includes('ERROR') || upperText.includes('FATAL') || upperText.includes('EXCEPTION');
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-primary" />
          Detected Incidents ({incidents.length})
        </h3>
      </div>

      {incidents.length === 0 ? (
        <div className="glass-panel border border-background-border rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-2">
          <Terminal className="w-10 h-10 text-slate-700" />
          <p className="text-sm font-semibold text-slate-400">No matching incidents found</p>
          <p className="text-xs text-background-muted max-w-[280px]">Adjust your filters or search query to find log incidents.</p>
        </div>
      ) : (
        incidents.map((incident) => {
          const isExpanded = expandedIds.includes(incident.incident_id);
          const isAnalyzing = aiLoading[incident.incident_id];
          const hasReport = !!aiReports[incident.incident_id];
          const aiError = aiErrors[incident.incident_id];

          return (
            <div
              key={incident.incident_id}
              className={`glass-panel border rounded-2xl transition-all duration-300 ${
                isExpanded
                  ? 'border-primary/30 shadow-lg shadow-primary/5 bg-slate-800/40'
                  : 'border-background-border hover:border-slate-600 hover:bg-slate-800/20'
              }`}
            >
              {/* Incident Summary Card Header */}
              <div
                onClick={() => toggleExpand(incident.incident_id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="p-2.5 bg-slate-900 border border-background-border rounded-xl flex items-center justify-center shrink-0">
                    <Terminal className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-sm text-white truncate max-w-[200px] sm:max-w-[300px]">
                        {incident.error_type}
                      </span>
                      {getSeverityBadge(incident.severity)}
                      <span className="text-[10px] text-background-muted bg-slate-900/60 border border-background-border/50 px-2 py-0.5 rounded font-mono-code">
                        Line: {incident.line_number}
                      </span>
                    </div>
                    {/* UUID Indicator */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[9px] font-mono-code text-slate-500">ID: {incident.incident_id}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopyToClipboard(incident.incident_id);
                        }}
                        className="text-slate-600 hover:text-white p-0.5 rounded transition-all"
                        title="Copy Incident ID"
                      >
                        {copiedId === incident.incident_id ? (
                          <Check className="w-3 h-3 text-accent" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right side: AI button + Expand Chevron */}
                <div className="flex justify-end items-center gap-3 sm:self-center" onClick={(e) => e.stopPropagation()}>
                  {/* AI Analyse Button */}
                  <button
                    id={`ai-analyze-btn-${incident.incident_id}`}
                    onClick={(e) => handleAnalyzeWithAI(e, incident.incident_id)}
                    disabled={isAnalyzing}
                    title={hasReport ? 'Hide AI Report' : 'Analyse with AI'}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-xl border transition-all duration-200 ${
                      hasReport
                        ? 'bg-primary/20 border-primary/40 text-primary hover:bg-primary/10'
                        : isAnalyzing
                        ? 'bg-slate-900 border-background-border text-slate-500 cursor-not-allowed'
                        : 'bg-slate-900 border-background-border text-slate-300 hover:bg-primary/10 hover:border-primary/40 hover:text-primary'
                    }`}
                  >
                    {isAnalyzing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : hasReport ? (
                      <Brain className="w-3.5 h-3.5" />
                    ) : (
                      <Brain className="w-3.5 h-3.5" />
                    )}
                    {isAnalyzing ? 'Analysing…' : hasReport ? 'AI Report ✓' : 'Analyse with AI'}
                  </button>

                  {/* Expand Chevron */}
                  <button
                    onClick={() => toggleExpand(incident.incident_id)}
                    className="p-2 bg-slate-900/50 hover:bg-slate-900 border border-background-border rounded-xl text-slate-400 transition-all hover:text-white"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Detail Code Context Panel */}
              {isExpanded && (
                <div className="border-t border-background-border/50 bg-slate-950/60 p-5 rounded-b-2xl font-mono-code text-[11px] leading-relaxed flex flex-col gap-4 animate-slide-up">
                  {/* Context Block Section */}
                  <div className="flex flex-col gap-0.5 overflow-x-auto select-text scrollbar-thin">

                    {/* Pre-Error Context */}
                    {incident.context_before.map((line, idx) => (
                      <div key={`before-${idx}`} className="text-slate-500 whitespace-pre py-0.5 px-3">
                        <span className="inline-block w-8 text-slate-600 text-right select-none pr-3">
                          {incident.line_number - incident.context_before.length + idx}
                        </span>
                        {line}
                      </div>
                    ))}

                    {/* Main Error Block Highlighted */}
                    <div className="border-l-2 border-red-500 bg-red-950/20 my-1 py-1">
                      {incident.error_block.map((line, idx) => {
                        const isHighlighted = shouldHighlightLine(line);
                        return (
                          <div
                            key={`error-${idx}`}
                            className={`whitespace-pre py-0.5 px-3 transition-colors ${
                              isHighlighted
                                ? 'bg-red-950/50 text-red-200 font-semibold'
                                : 'text-slate-300'
                            }`}
                          >
                            <span className="inline-block w-8 text-red-700 text-right select-none pr-3">
                              {incident.line_number + idx}
                            </span>
                            {line}
                          </div>
                        );
                      })}
                    </div>

                    {/* Post-Error Context */}
                    {incident.context_after.map((line, idx) => {
                      const startingLineNum = incident.line_number + incident.error_block.length;
                      return (
                        <div key={`after-${idx}`} className="text-slate-500 whitespace-pre py-0.5 px-3">
                          <span className="inline-block w-8 text-slate-600 text-right select-none pr-3">
                            {startingLineNum + idx}
                          </span>
                          {line}
                        </div>
                      );
                    })}
                  </div>

                  {/* AI Error Banner */}
                  {aiError && (
                    <div className="flex items-start gap-3 px-4 py-3 bg-red-950/30 border border-red-500/30 rounded-xl text-[11px] text-red-400">
                      <RefreshCw className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">AI Analysis Failed</p>
                        <p className="text-red-500/70 mt-0.5">{aiError}</p>
                        <p className="text-slate-500 mt-1">
                          Please verify your Gemini API key in <code className="text-slate-400">backend/config/gemini_config.py</code> and retry.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* AI Report Panel */}
                  {hasReport && (
                    <AIReportPanel report={aiReports[incident.incident_id]} />
                  )}

                  {/* Integration Metadata Card */}
                  <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-900 border border-background-border rounded-xl text-[10px] text-background-muted select-none">
                    <Cpu className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>
                      Module 3 Active: Click <strong className="text-slate-300">Analyse with AI</strong> to invoke{' '}
                      <code className="text-slate-300 font-mono-code font-bold">POST /api/ai/analyze/{incident.incident_id}</code>
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
