import React, { useState } from 'react';
import { Play, Sparkles, Layers, LayoutDashboard, FileText, CheckCircle2 } from 'lucide-react';
import { SAMPLE_LOGS } from '../services/demoService';
import SampleLogCard from '../components/system/SampleLogCard';
import { useNotification } from '../components/system/NotificationProvider';

export default function DemoMode({ setActiveTab, onUploadSuccess }) {
  const { notifySuccess } = useNotification();
  const [lastUploaded, setLastUploaded] = useState(null);

  const handlePipelineSuccess = (metadata) => {
    setLastUploaded(metadata);
    notifySuccess(`Demo file '${metadata.original_name}' uploaded successfully (${metadata.total_lines} lines).`);
    if (onUploadSuccess) onUploadSuccess(metadata);
  };

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
              <Play className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Live Hackathon Demo Mode
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Run pre-packaged enterprise log samples through the full 6-module pipeline with 1 click
              </p>
            </div>
          </div>

          {lastUploaded && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-purewhite hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
              >
                <LayoutDashboard className="w-4 h-4" /> View in Operations Dashboard
              </button>
            </div>
          )}
        </div>

        {/* Banner notification after 1-click upload */}
        {lastUploaded && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-400 text-xs animate-slide-down">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>
                <strong>Sample Log Loaded!</strong> File ID: <code className="font-mono-code text-slate-200">{lastUploaded.file_id}</code>. Click below to analyze in Dashboard or Report Center.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('workspace')}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-slate-200 hover:text-white"
              >
                Go to Workspace
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
              >
                Open Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Sample Log Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(SAMPLE_LOGS).map((sample) => (
            <SampleLogCard
              key={sample.id}
              sample={sample}
              onPipelineSuccess={handlePipelineSuccess}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
