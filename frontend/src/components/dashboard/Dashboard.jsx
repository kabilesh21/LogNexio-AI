import React, { useState, useCallback } from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import DashboardHeader from './DashboardHeader';
import StatisticsCards from './StatisticsCards';
import SeverityChart from './SeverityChart';
import IncidentTimeline from './IncidentTimeline';
import AIHighlights from './AIHighlights';
import RecentIncidents from './RecentIncidents';
import SearchToolbar from './SearchToolbar';
import IncidentDetailsDrawer from './IncidentDetailsDrawer';
import IncidentOverview from './IncidentOverview';
import DashboardSkeleton from './DashboardSkeleton';
import EmptyDashboard from './EmptyDashboard';

export default function Dashboard() {
  const {
    summary, filteredIncidents, incidents, aiHighlights,
    loading, error, lastRefreshed, reload,
    searchQuery, setSearchQuery,
    filterSeverity, setFilterSeverity,
    filterAiStatus, setFilterAiStatus,
    sortBy, setSortBy,
    aiLoading, aiError,
    triggerAiAnalysis,
    selectedIncident, setSelectedIncident,
    setInteracting,
  } = useDashboard();

  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(text);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }, []);

  const handleSelect = useCallback((incident) => {
    setSelectedIncident(incident);
    setInteracting(true);
  }, [setSelectedIncident, setInteracting]);

  const handleCloseDrawer = useCallback(() => {
    setSelectedIncident(null);
    setInteracting(false);
  }, [setSelectedIncident, setInteracting]);

  const handleAnalyze = useCallback(async (incidentId) => {
    const report = await triggerAiAnalysis(incidentId);
    // If drawer is open for this incident, update it with the new report
    if (selectedIncident?.incident_id === incidentId && report) {
      setSelectedIncident((prev) => ({
        ...prev,
        ai_status: 'analysed',
        ai_summary: report,
      }));
    }
  }, [triggerAiAnalysis, selectedIncident, setSelectedIncident]);

  // ── Loading state ──────────────────────────────────────────────────
  if (loading && !summary) {
    return (
      <div className="relative min-h-screen bg-background overflow-hidden text-background-text pb-12">
        <div className="glow-spot top-[-100px] left-[-50px]" />
        <div className="glow-spot-accent bottom-[-50px] right-[100px]" />
        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 z-10">
          <DashboardSkeleton />
        </main>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="relative min-h-screen bg-background text-background-text flex items-center justify-center">
        <div className="flex flex-col items-center gap-5 max-w-md text-center p-8">
          <div className="p-5 bg-red-950/30 border border-red-500/30 rounded-2xl">
            <AlertOctagon className="w-12 h-12 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Dashboard Unavailable</h2>
            <p className="text-sm text-slate-400 mt-2">{error}</p>
          </div>
          <button
            onClick={reload}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary/15 border border-primary/30 text-primary rounded-xl text-sm font-semibold hover:bg-primary/25 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────
  const isEmpty = !summary || summary.total_incidents === 0;

  if (isEmpty) {
    return (
      <div className="relative min-h-screen bg-background overflow-hidden text-background-text pb-12">
        <div className="glow-spot top-[-100px] left-[-50px]" />
        <div className="glow-spot-accent bottom-[-50px] right-[100px]" />
        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 z-10">
          <DashboardHeader lastRefreshed={lastRefreshed} onReload={reload} loading={loading} />
          <div className="mt-8">
            <EmptyDashboard onReload={reload} />
          </div>
        </main>
      </div>
    );
  }

  // ── Full dashboard ────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-background overflow-hidden text-background-text pb-16">
      {/* Background decorative glows */}
      <div className="glow-spot top-[-100px] left-[-50px]" />
      <div className="glow-spot-accent bottom-[-50px] right-[100px]" />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 z-10 flex flex-col gap-8">

        {/* ── Header ── */}
        <DashboardHeader lastRefreshed={lastRefreshed} onReload={reload} loading={loading} />

        {/* ── Statistics Cards ── */}
        <StatisticsCards summary={summary} />

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SeverityChart summary={summary} />
          <IncidentTimeline incidents={incidents} onSelect={handleSelect} />
        </div>

        {/* ── AI Highlights + Incident Overview ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AIHighlights highlights={aiHighlights} />
          <IncidentOverview incidents={incidents} loading={loading} />
        </div>

        {/* ── Search + Incidents Table ── */}
        <div className="flex flex-col gap-4">
          <SearchToolbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterSeverity={filterSeverity}
            setFilterSeverity={setFilterSeverity}
            filterAiStatus={filterAiStatus}
            setFilterAiStatus={setFilterAiStatus}
            sortBy={sortBy}
            setSortBy={setSortBy}
            resultCount={filteredIncidents.length}
          />
          <RecentIncidents
            incidents={filteredIncidents}
            onSelect={handleSelect}
            onAnalyze={handleAnalyze}
            aiLoading={aiLoading}
            aiError={aiError}
            onCopy={handleCopy}
            copiedId={copiedId}
          />
        </div>
      </main>

      {/* ── Incident Details Drawer ── */}
      {selectedIncident && (
        <IncidentDetailsDrawer
          incident={selectedIncident}
          onClose={handleCloseDrawer}
          onAnalyze={handleAnalyze}
          aiLoading={aiLoading}
          onCopy={handleCopy}
          copiedId={copiedId}
        />
      )}
    </div>
  );
}
