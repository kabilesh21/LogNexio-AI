import React from 'react';
import { Server, Brain, FolderCheck, Database, HardDrive, ShieldCheck, Activity } from 'lucide-react';
import HealthCard from './HealthCard';

export default function HealthGrid({ health }) {
  if (!health) return null;

  const cards = [
    {
      name: 'FastAPI Backend Engine',
      status: health.backend,
      details: 'Core REST API & Streaming Log Parser',
      icon: <Server className="w-5 h-5 text-primary" />,
      subtext: `Uptime: ${health.uptime}`,
    },
    {
      name: 'Gemini AI Integration',
      status: health.gemini,
      details: 'Google GenAI SDK (gemini-3.1-flash-lite)',
      icon: <Brain className="w-5 h-5 text-emerald-400" />,
      subtext: 'API Key Configured & Ready',
    },
    {
      name: 'Upload File Storage',
      status: health.uploads,
      details: 'backend/uploads/ directory read/write access',
      icon: <FolderCheck className="w-5 h-5 text-accent" />,
      subtext: 'Writable Disk Storage',
    },
    {
      name: 'AI Report Cache Store',
      status: health.reports,
      details: 'backend/uploads/reports/ disk cache',
      icon: <Database className="w-5 h-5 text-yellow-400" />,
      subtext: 'O(1) Cached JSON Reports',
    },
    {
      name: 'Log Metadata Indexer',
      status: health.cache,
      details: 'backend/uploads/metadata/ index store',
      icon: <HardDrive className="w-5 h-5 text-blue-400" />,
      subtext: 'Parsed Incident Metadata',
    },
    {
      name: 'REST API Endpoints',
      status: 'healthy',
      details: 'Modules 1–6 Routes (Upload, Analysis, AI, Dashboard, Report, System)',
      icon: <ShieldCheck className="w-5 h-5 text-purple-400" />,
      subtext: 'v1.0.0 Production Build',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
      {cards.map((c, i) => (
        <HealthCard key={i} {...c} />
      ))}
    </div>
  );
}
