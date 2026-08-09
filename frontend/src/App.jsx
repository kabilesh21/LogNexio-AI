import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import UploadCard from './components/UploadCard';
import RecentUploads from './components/RecentUploads';
import SystemStatus from './components/SystemStatus';
import SearchFilterSort from './components/SearchFilterSort';
import IncidentList from './components/IncidentList';
import Dashboard from './components/dashboard/Dashboard';
import ReportCenter from './pages/ReportCenter';
import Settings from './pages/Settings';
import About from './pages/About';
import DemoMode from './pages/DemoMode';
import LoginRegister from './components/auth/LoginRegister';

import ErrorBoundary from './components/system/ErrorBoundary';
import { NotificationProvider } from './components/system/NotificationProvider';
import ShortcutGuide from './components/system/ShortcutGuide';
import { Code, Cpu, Terminal, Loader2 } from 'lucide-react';
import { getSettings } from './services/settingsService';

export default function App() {
  const userSettings = getSettings();
  const [activeTab, setActiveTab] = useState(userSettings.preferredLandingPage || 'dashboard');
  const [uploads, setUploads] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // User Authentication State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('lognexio_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('lognexio_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('lognexio_user');
    localStorage.removeItem('lognexio_uploads');
    setUploads([]);
  };

  // Sync log count freshly if backend database is empty (clears stale local storage items)
  useEffect(() => {
    const syncWithBackend = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? '' : 'http://localhost:8000');
        const res = await fetch(`${API_BASE}/api/dashboard/summary`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.total_logs === 0) {
            localStorage.removeItem('lognexio_uploads');
            setUploads([]);
          }
        }
      } catch (err) {
        console.error('Failed to sync upload cache with backend:', err);
      }
    };
    syncWithBackend();
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Module 2 Analysis State
  const [analysisResult, setAnalysisResult] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverities, setSelectedSeverities] = useState(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);
  const [sortBy, setSortBy] = useState('newest');

  // Load uploaded files from localStorage on initial render
  useEffect(() => {
    try {
      const cached = localStorage.getItem('lognexio_uploads');
      if (cached) {
        setUploads(JSON.parse(cached));
      }
    } catch (e) {
      console.error('Failed to load uploads cache:', e);
    }
  }, []);

  const handleUploadSuccess = (metadata) => {
    const newUpload = {
      ...metadata,
      size: metadata.size || 0,
      date: new Date().toISOString(),
    };

    setUploads((prev) => {
      const filtered = prev.filter(item => item.file_id !== metadata.file_id);
      const updated = [newUpload, ...filtered];
      try {
        localStorage.setItem('lognexio_uploads', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to update uploads cache:', e);
      }
      return updated;
    });
  };

  const handleAnalysisComplete = (data) => {
    setAnalysisResult(data);
    setIncidents(data.errors || []);
  };

  const toggleSeverity = (severity) => {
    setSelectedSeverities((prev) =>
      prev.includes(severity)
        ? prev.filter((item) => item !== severity)
        : [...prev, severity]
    );
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(text);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Client-side filtering & sorting of incidents in workspace
  const filteredAndSortedIncidents = incidents
    .filter((incident) => {
      const matchesSeverity = selectedSeverities.includes(incident.severity.toUpperCase());
      const matchesSearch =
        searchQuery.trim() === '' ||
        incident.incident_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.error_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.error_block.some((line) =>
          line.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return matchesSeverity && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return b.line_number - a.line_number;
      if (sortBy === 'oldest') return a.line_number - b.line_number;
      if (sortBy === 'severity') {
        const rank = { CRITICAL: 4, FATAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        const rankA = rank[a.severity.toUpperCase()] || 0;
        const rankB = rank[b.severity.toUpperCase()] || 0;
        if (rankA !== rankB) return rankB - rankA;
        return a.line_number - b.line_number;
      }
      return 0;
    });

  const totalLines = uploads.reduce((acc, curr) => acc + (curr.total_lines || 0), 0);

  if (initialLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-background-text select-none">
        <div className="flex flex-col items-center gap-4 animate-pulse-slow">
          <img src="/logo.png" alt="LogNexio Logo" className="h-20 w-auto opacity-90" />
          <div className="flex items-center gap-2 mt-4 text-xs font-bold text-background-muted uppercase tracking-widest">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span>Initializing Platform...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginRegister onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <ErrorBoundary>
      <NotificationProvider>
        <div className="relative min-h-screen bg-background text-background-text">
          {/* Navigation Header with tab switcher */}
          <Navigation activeTab={activeTab} setActiveTab={setActiveTab} user={user} onLogout={handleLogout} />

          {/* Floating Keyboard Shortcut Listener & Guide */}
          <ShortcutGuide setActiveTab={setActiveTab} />

          {/* Page Routing */}
          {activeTab === 'dashboard' ? (
            <Dashboard />
          ) : activeTab === 'report-center' ? (
            <ReportCenter />
          ) : activeTab === 'demo' ? (
            <DemoMode setActiveTab={setActiveTab} onUploadSuccess={handleUploadSuccess} />
          ) : activeTab === 'settings' ? (
            <Settings />
          ) : activeTab === 'about' ? (
            <About />
          ) : (
            /* Workspace view (Modules 1-3) */
            <div className="relative min-h-screen overflow-hidden pb-12">
              <div className="glow-spot top-[-100px] left-[-50px]" />
              <div className="glow-spot-accent bottom-[-50px] right-[100px]" />

              <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 z-10">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-background-border/40 pb-6">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                      Pipeline Workspace
                    </h1>
                    <p className="text-xs md:text-sm text-background-muted mt-1.5">
                      Securely stream, register, and prepare logs for advanced AI parsing and anomaly detection.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    <UploadCard 
                      onUploadSuccess={handleUploadSuccess} 
                      onAnalysisComplete={handleAnalysisComplete}
                    />

                    {analysisResult && (
                      <>
                        <SearchFilterSort
                          searchQuery={searchQuery}
                          setSearchQuery={setSearchQuery}
                          selectedSeverities={selectedSeverities}
                          toggleSeverity={toggleSeverity}
                          sortBy={sortBy}
                          setSortBy={setSortBy}
                        />
                        <IncidentList
                          incidents={filteredAndSortedIncidents}
                          onCopyToClipboard={handleCopyToClipboard}
                          copiedId={copiedId}
                        />
                      </>
                    )}

                    <RecentUploads 
                      uploads={uploads} 
                      onCopyToClipboard={handleCopyToClipboard} 
                      copiedId={copiedId} 
                    />
                  </div>

                  <div className="flex flex-col gap-6">
                    <SystemStatus 
                      uploadsCount={uploads.length} 
                      totalLinesCount={totalLines} 
                    />

                    <div className="glass-panel rounded-2xl border border-background-border p-6 shadow-xl relative overflow-hidden">
                      <h3 className="text-sm font-bold text-white tracking-wider uppercase mb-3 flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-primary" />
                        Pipeline Integration Notes
                      </h3>
                      <div className="text-xs text-background-muted flex flex-col gap-3 font-sans leading-relaxed">
                        <p>
                          This workspace secures the log ingestion and stream preparation. Log lines are parsed, structured, and indexed locally on your system.
                        </p>
                        <p>
                          All processed records are analyzed by the AI engine locally, allowing you to monitor anomalies in the Operations Dashboard and export high-fidelity reports from the Report Center while maintaining full data confidentiality and air-gapped compliance.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          )}
        </div>
      </NotificationProvider>
    </ErrorBoundary>
  );
}
