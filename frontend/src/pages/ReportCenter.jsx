import React, { useState, useEffect, useCallback } from 'react';
import { FileText, GitCompare, RefreshCw, Layers } from 'lucide-react';
import { fetchAllReports, deleteReport } from '../services/reportService';
import ReportStatistics from '../components/report/ReportStatistics';
import ReportSearchBar from '../components/report/ReportSearchBar';
import ReportFilters from '../components/report/ReportFilters';
import ReportList from '../components/report/ReportList';
import ReportViewer from '../components/report/ReportViewer';
import ReportComparison from '../components/report/ReportComparison';
import HistoryTimeline from '../components/report/HistoryTimeline';
import EmptyReports from '../components/report/EmptyReports';
import ReportSkeleton from '../components/report/ReportSkeleton';

export default function ReportCenter() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  // Modals & Selection
  const [activeReportId, setActiveReportId] = useState(null);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllReports();
      setReports(data);
    } catch (err) {
      setError(err.message || 'Failed to load reports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleDeleteReport = async (incidentId) => {
    if (!window.confirm('Are you sure you want to delete this AI report from disk?')) return;
    try {
      await deleteReport(incidentId);
      setReports((prev) => prev.filter((r) => r.incident_id !== incidentId));
      setSelectedForCompare((prev) => prev.filter((id) => id !== incidentId));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const toggleCompareSelection = (incidentId) => {
    setSelectedForCompare((prev) =>
      prev.includes(incidentId)
        ? prev.filter((id) => id !== incidentId)
        : [...prev, incidentId]
    );
  };

  // Derived filtered & sorted list
  const filteredReports = reports
    .filter((r) => {
      if (severityFilter !== 'ALL' && r.severity.toUpperCase() !== severityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mId = r.incident_id.toLowerCase().includes(q);
        const mType = r.error_type.toLowerCase().includes(q);
        const mSum = r.incident_summary.toLowerCase().includes(q);
        const mComp = r.affected_component.toLowerCase().includes(q);
        const mKw = (r.keywords || []).some((k) => k.toLowerCase().includes(q));
        if (!mId && !mType && !mSum && !mComp && !mKw) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'severity') {
        const rank = { CRITICAL: 4, FATAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return (rank[b.severity] || 0) - (rank[a.severity] || 0);
      }
      if (sortBy === 'confidence') {
        return (parseFloat(b.confidence) || 0) - (parseFloat(a.confidence) || 0);
      }
      return 0;
    });

  return (
    <div className="relative min-h-screen bg-background text-background-text pb-16">
      {/* Background Decorative Glows */}
      <div className="glow-spot top-[-100px] left-[-50px]" />
      <div className="glow-spot-accent bottom-[-50px] right-[100px]" />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 z-10 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-background-border/40">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-tr from-primary to-accent rounded-2xl shadow-lg shadow-primary/20">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Incident Report Center
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Browse, search, compare, and export saved Gemini AI incident reports
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadReports}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Reports
            </button>
          </div>
        </div>

        {/* Comparison Trigger Bar (shows if >= 2 items selected) */}
        {selectedForCompare.length > 0 && (
          <div className="glass-panel border border-primary/40 bg-primary/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-slide-down">
            <div className="flex items-center gap-2 text-xs text-primary font-bold">
              <GitCompare className="w-4 h-4" />
              <span>{selectedForCompare.length} report(s) selected for side-by-side comparison</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedForCompare([])}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Clear Selection
              </button>
              <button
                onClick={() => setShowComparisonModal(true)}
                disabled={selectedForCompare.length < 2}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl bg-primary text-purewhite hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-primary/20"
              >
                <GitCompare className="w-3.5 h-3.5" />
                Compare Now ({selectedForCompare.length})
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {loading && reports.length === 0 ? (
          <ReportSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <p className="text-red-400 font-semibold">{error}</p>
            <button
              onClick={loadReports}
              className="px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-xl text-xs font-semibold"
            >
              Retry
            </button>
          </div>
        ) : reports.length === 0 ? (
          <EmptyReports onReload={loadReports} />
        ) : (
          <>
            {/* Report Statistics */}
            <ReportStatistics reports={reports} />

            {/* Search & Filter Toolbar */}
            <div className="glass-panel border border-background-border rounded-2xl p-4 flex flex-col gap-4">
              <ReportSearchBar query={searchQuery} setQuery={setSearchQuery} />
              <ReportFilters
                severity={severityFilter}
                setSeverity={setSeverityFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                onReset={() => { setSeverityFilter('ALL'); setSortBy('newest'); setSearchQuery(''); }}
                totalCount={filteredReports.length}
              />
            </div>

            {/* Saved Reports Grid */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" /> Saved Incident Reports ({filteredReports.length})
              </h3>
              {filteredReports.length === 0 ? (
                <div className="glass-panel border border-background-border rounded-2xl p-8 text-center text-slate-400 text-sm">
                  No reports match your current search or severity filters.
                </div>
              ) : (
                <ReportList
                  reports={filteredReports}
                  onOpenReport={(id) => setActiveReportId(id)}
                  onDeleteReport={handleDeleteReport}
                  selectedForCompare={selectedForCompare}
                  onToggleCompare={toggleCompareSelection}
                />
              )}
            </div>

            {/* History Timeline */}
            <HistoryTimeline onSelectReport={(id) => setActiveReportId(id)} />
          </>
        )}
      </main>

      {/* Report Viewer Modal */}
      {activeReportId && (
        <ReportViewer
          incidentId={activeReportId}
          onClose={() => setActiveReportId(null)}
        />
      )}

      {/* Report Comparison Modal */}
      {showComparisonModal && (
        <ReportComparison
          incidentIds={selectedForCompare}
          onClose={() => setShowComparisonModal(false)}
        />
      )}
    </div>
  );
}
