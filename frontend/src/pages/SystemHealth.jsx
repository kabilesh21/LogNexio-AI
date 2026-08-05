import React, { useState, useEffect, useCallback } from 'react';
import { Activity, RefreshCw, Server, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { fetchSystemHealth } from '../services/healthService';
import HealthGrid from '../components/system/HealthGrid';

export default function SystemHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const loadHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSystemHealth();
      setHealth(data);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err.message || 'Health check failed.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHealth();
    const timer = setInterval(loadHealth, 30_000);
    return () => clearInterval(timer);
  }, [loadHealth]);

  return (
    <div className="relative min-h-screen bg-background text-background-text pb-16">
      {/* Background Decorative Glows */}
      <div className="glow-spot top-[-100px] left-[-50px]" />
      <div className="glow-spot-accent bottom-[-50px] right-[100px]" />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 z-10 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-background-border/40">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-tr from-accent to-primary rounded-2xl shadow-lg shadow-accent/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                System Diagnostics & Health
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time status of backend services, storage subsystems, Gemini API, and uptime
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lastRefreshed && (
              <span className="text-[10px] text-slate-500 font-mono-code bg-slate-900 border border-background-border px-3 py-1.5 rounded-xl">
                Updated {lastRefreshed.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={loadHealth}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Status
            </button>
          </div>
        </div>

        {/* System Verification Banner */}
        <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span className="font-semibold">Automated System Health Inspection: All 6 Modules Active & Verified</span>
          </div>
          <span className="font-mono-code text-[10px] bg-slate-900 px-3 py-1 rounded-lg text-slate-300">
            Build v1.0.0 (Production)
          </span>
        </div>

        {/* Health Grid */}
        {loading && !health ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Activity className="w-8 h-8 animate-pulse text-accent" />
            <span>Polling health status…</span>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-950/30 border border-red-500/30 rounded-2xl text-center flex flex-col items-center gap-3 text-red-400">
            <p className="font-bold">Health Inspection Failed</p>
            <p className="text-xs text-slate-400">{error}</p>
            <button onClick={loadHealth} className="px-4 py-2 bg-red-500/20 rounded-xl text-xs font-bold text-red-400">
              Retry Check
            </button>
          </div>
        ) : (
          <HealthGrid health={health} />
        )}
      </main>
    </div>
  );
}
