import React, { useState } from 'react';
import { Play, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import StatusBadge from '../dashboard/StatusBadge';
import { runFullDemoPipeline } from '../../services/demoService';

export default function SampleLogCard({ sample, onPipelineSuccess }) {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleRunDemo = async () => {
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const metadata = await runFullDemoPipeline(sample.id);
      setSuccessMsg(`Uploaded ${metadata.original_name} & SRE report generated.`);
      if (onPipelineSuccess) onPipelineSuccess(metadata);
    } catch (err) {
      setErrorMsg(err.message || 'Demo run failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel border border-background-border rounded-2xl p-6 flex flex-col justify-between gap-4 hover:border-slate-600 transition-all duration-300">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary shrink-0" />
            <h4 className="text-sm font-bold text-white">{sample.title}</h4>
          </div>
          <StatusBadge type="severity" value={sample.severity} />
        </div>

        <p className="text-xs text-slate-400 leading-relaxed mt-1">
          {sample.description}
        </p>

        {/* Log content preview box */}
        <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-3 font-mono-code text-[10px] text-slate-400 overflow-x-auto max-h-28 mt-2">
          {sample.content.split('\n').slice(0, 5).map((line, i) => (
            <div key={i} className="whitespace-pre">{line}</div>
          ))}
        </div>
      </div>

      {successMsg && (
        <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-2.5 bg-red-950/40 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <button
        onClick={handleRunDemo}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-purewhite text-xs font-bold shadow-md shadow-primary/20 hover:opacity-95 transition-all disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-purewhite" />}
        {loading ? 'Running through Pipeline…' : 'Run 1-Click Pipeline Demo'}
      </button>
    </div>
  );
}
