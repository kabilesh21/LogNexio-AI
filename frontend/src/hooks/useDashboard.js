import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchDashboardSummary,
  fetchAllIncidents,
  analyzeIncident,
} from '../services/dashboardService';

const AUTO_REFRESH_MS = 30_000;

/**
 * useDashboard
 *
 * Centralises all dashboard state, data fetching, search/filter/sort, and
 * auto-refresh logic. Components consume this hook and never call the service
 * directly — preventing duplicated API calls.
 */
export function useDashboard() {
  const [summary, setSummary] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // Search / filter / sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState([]);   // [] = all
  const [filterAiStatus, setFilterAiStatus] = useState('all'); // 'all' | 'analysed' | 'pending'
  const [sortBy, setSortBy] = useState('newest');

  // AI loading state per incident
  const [aiLoading, setAiLoading] = useState({});
  const [aiError, setAiError] = useState({});

  // Selected incident drawer
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Prevent refresh from interrupting user interactions
  const isInteractingRef = useRef(false);

  // ── Core data load ─────────────────────────────────────────────────
  const loadData = useCallback(async (isBackground = false) => {
    if (isBackground && isInteractingRef.current) return;
    if (!isBackground) setLoading(true);
    setError(null);

    try {
      const [summaryData, incidentData] = await Promise.all([
        fetchDashboardSummary(),
        fetchAllIncidents(),
      ]);
      setSummary(summaryData);
      setIncidents(incidentData);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData(false);
  }, [loadData]);

  // Auto-refresh every 30 seconds (background, non-interrupting)
  useEffect(() => {
    const timer = setInterval(() => loadData(true), AUTO_REFRESH_MS);
    return () => clearInterval(timer);
  }, [loadData]);

  // ── AI Analysis trigger ────────────────────────────────────────────
  const triggerAiAnalysis = useCallback(async (incidentId) => {
    setAiLoading((prev) => ({ ...prev, [incidentId]: true }));
    setAiError((prev) => { const n = { ...prev }; delete n[incidentId]; return n; });

    try {
      const result = await analyzeIncident(incidentId);
      if (result.success && result.report) {
        // Update the incident in place with new AI status and summary
        setIncidents((prev) =>
          prev.map((inc) =>
            inc.incident_id === incidentId
              ? { ...inc, ai_status: 'analysed', ai_summary: result.report }
              : inc
          )
        );
        // Also refresh summary counts
        const newSummary = await fetchDashboardSummary();
        setSummary(newSummary);
        return result.report;
      }
    } catch (err) {
      setAiError((prev) => ({ ...prev, [incidentId]: err.message }));
    } finally {
      setAiLoading((prev) => ({ ...prev, [incidentId]: false }));
    }
    return null;
  }, []);

  // ── Interaction tracking (prevent refresh mid-interaction) ─────────
  const setInteracting = useCallback((val) => {
    isInteractingRef.current = val;
  }, []);

  // ── Derived: filtered + sorted incidents ───────────────────────────
  const severityRank = { CRITICAL: 4, FATAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, INFO: 0 };

  const filteredIncidents = incidents
    .filter((inc) => {
      if (filterSeverity.length > 0 && !filterSeverity.includes(inc.severity?.toUpperCase())) {
        return false;
      }
      if (filterAiStatus !== 'all' && inc.ai_status !== filterAiStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = inc.incident_id?.toLowerCase().includes(q);
        const matchType = inc.error_type?.toLowerCase().includes(q);
        const matchKw = inc.ai_summary?.keywords?.some((k) => k.toLowerCase().includes(q));
        const matchBlock = inc.error_block?.some((l) => l.toLowerCase().includes(q));
        if (!matchId && !matchType && !matchKw && !matchBlock) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return a.line_number - b.line_number;
        case 'newest':
          return b.line_number - a.line_number;
        case 'severity_high':
          return (severityRank[b.severity?.toUpperCase()] || 0) - (severityRank[a.severity?.toUpperCase()] || 0);
        case 'severity_low':
          return (severityRank[a.severity?.toUpperCase()] || 0) - (severityRank[b.severity?.toUpperCase()] || 0);
        case 'confidence':
          const ca = parseFloat(a.ai_summary?.confidence) || 0;
          const cb = parseFloat(b.ai_summary?.confidence) || 0;
          return cb - ca;
        default:
          return b.line_number - a.line_number;
      }
    });

  // ── AI Highlights (computed locally, no extra API call) ────────────
  const aiHighlights = (() => {
    const analysed = incidents.filter((i) => i.ai_status === 'analysed' && i.ai_summary);
    if (analysed.length === 0) return null;

    // Most common error type
    const typeCount = {};
    incidents.forEach((i) => {
      const t = i.error_type || 'Unknown';
      typeCount[t] = (typeCount[t] || 0) + 1;
    });
    const mostCommonException = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

    // Highest severity
    const sev = incidents.map((i) => i.severity?.toUpperCase()).filter(Boolean);
    const highestSeverity = ['CRITICAL', 'FATAL', 'HIGH', 'MEDIUM', 'LOW'].find((s) => sev.includes(s)) || '—';

    // Most affected component
    const compCount = {};
    analysed.forEach((i) => {
      const c = i.ai_summary?.affected_component || 'Unknown';
      compCount[c] = (compCount[c] || 0) + 1;
    });
    const mostAffectedComponent = Object.entries(compCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

    // Most repeated keyword
    const kwCount = {};
    analysed.forEach((i) => {
      (i.ai_summary?.keywords || []).forEach((k) => {
        kwCount[k] = (kwCount[k] || 0) + 1;
      });
    });
    const topKeyword = Object.entries(kwCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

    // Average confidence
    const confidences = analysed
      .map((i) => parseFloat(i.ai_summary?.confidence))
      .filter((c) => !isNaN(c));
    const avgConfidence =
      confidences.length > 0
        ? `${Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length)}%`
        : '—';

    const cacheUtilization =
      incidents.length > 0
        ? `${Math.round((analysed.length / incidents.length) * 100)}%`
        : '0%';

    return {
      mostCommonException,
      highestSeverity,
      mostAffectedComponent,
      topKeyword,
      aiReportsCount: analysed.length,
      avgConfidence,
      cacheUtilization,
    };
  })();

  return {
    // Data
    summary,
    incidents,
    filteredIncidents,
    aiHighlights,
    loading,
    error,
    lastRefreshed,
    // Search / Filter / Sort
    searchQuery, setSearchQuery,
    filterSeverity, setFilterSeverity,
    filterAiStatus, setFilterAiStatus,
    sortBy, setSortBy,
    // AI
    aiLoading,
    aiError,
    triggerAiAnalysis,
    // Drawer
    selectedIncident, setSelectedIncident,
    // Actions
    reload: () => loadData(false),
    setInteracting,
  };
}
