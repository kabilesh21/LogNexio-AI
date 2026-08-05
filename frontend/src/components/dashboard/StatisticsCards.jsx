import React from 'react';
import {
  FileText, AlignLeft, ShieldAlert, Flame, AlertTriangle,
  Info, Minus, Brain, Database, Timer
} from 'lucide-react';
import MetricCard from './MetricCard';

export default function StatisticsCards({ summary }) {
  if (!summary) return null;

  const cards = [
    {
      icon: <FileText className="w-5 h-5" />,
      label: 'Total Logs',
      value: summary.total_logs.toLocaleString(),
      sub: 'Uploaded log files',
      color: 'primary',
    },
    {
      icon: <AlignLeft className="w-5 h-5" />,
      label: 'Total Lines',
      value: summary.total_lines.toLocaleString(),
      sub: 'Lines parsed',
      color: 'slate',
    },
    {
      icon: <ShieldAlert className="w-5 h-5" />,
      label: 'Total Incidents',
      value: summary.total_incidents.toLocaleString(),
      sub: 'Across all files',
      color: 'orange',
    },
    {
      icon: <Flame className="w-5 h-5" />,
      label: 'Critical',
      value: summary.critical.toLocaleString(),
      sub: 'Critical severity',
      color: 'red',
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      label: 'High',
      value: summary.high.toLocaleString(),
      sub: 'High severity',
      color: 'orange',
    },
    {
      icon: <Minus className="w-5 h-5" />,
      label: 'Medium',
      value: summary.medium.toLocaleString(),
      sub: 'Medium severity',
      color: 'yellow',
    },
    {
      icon: <Info className="w-5 h-5" />,
      label: 'Low',
      value: summary.low.toLocaleString(),
      sub: 'Low severity',
      color: 'blue',
    },
    {
      icon: <Brain className="w-5 h-5" />,
      label: 'AI Reports',
      value: summary.ai_reports.toLocaleString(),
      sub: 'Reports generated',
      color: 'green',
    },
    {
      icon: <Database className="w-5 h-5" />,
      label: 'Cache Hits',
      value: summary.cache_hits.toLocaleString(),
      sub: 'Saved API calls',
      color: 'primary',
    },
    {
      icon: <Timer className="w-5 h-5" />,
      label: 'Avg AI Time',
      value: summary.average_ai_time,
      sub: 'Per incident',
      color: 'slate',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
      {cards.map((card, idx) => (
        <MetricCard key={idx} {...card} animate />
      ))}
    </div>
  );
}
