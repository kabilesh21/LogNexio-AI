import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

const SEVERITY_COLORS = {
  Critical: '#ef4444',
  High:     '#f97316',
  Medium:   '#eab308',
  Low:      '#3b82f6',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="glass-panel border border-background-border rounded-xl px-4 py-2.5 text-xs shadow-xl">
      <p className="font-bold text-white">{name}</p>
      <p className="text-slate-400">{value} incident{value !== 1 ? 's' : ''}</p>
    </div>
  );
};

const CustomLegend = ({ payload }) => (
  <div className="flex flex-wrap justify-center gap-3 mt-2">
    {payload.map((entry) => (
      <div key={entry.value} className="flex items-center gap-1.5 text-[11px] text-slate-400">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
        {entry.value}
      </div>
    ))}
  </div>
);

export default function SeverityChart({ summary }) {
  if (!summary) return null;

  const data = [
    { name: 'Critical', value: summary.critical },
    { name: 'High',     value: summary.high },
    { name: 'Medium',   value: summary.medium },
    { name: 'Low',      value: summary.low },
  ].filter((d) => d.value > 0);

  const hasData = data.length > 0;

  return (
    <div className="glass-panel rounded-2xl border border-background-border p-6 flex flex-col gap-4">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
        <PieIcon className="w-4 h-4 text-primary" />
        Severity Distribution
      </h3>

      {hasData ? (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={SEVERITY_COLORS[entry.name]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-60 flex items-center justify-center text-slate-600 text-sm">
          No severity data available yet
        </div>
      )}
    </div>
  );
}
