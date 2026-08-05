import {
  Terminal, LayoutDashboard, FileText, Cpu, Layers, Play, Activity, Settings as SettingsIcon, Info
} from 'lucide-react';

export default function Navigation({ activeTab = 'dashboard', setActiveTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4 text-primary" /> },
    { id: 'report-center', label: 'Report Center', icon: <FileText className="w-4 h-4 text-emerald-400" /> },
    { id: 'workspace', label: 'Workspace', icon: <Layers className="w-4 h-4 text-accent" /> },
    { id: 'demo', label: 'Demo Mode', icon: <Play className="w-4 h-4 text-amber-500" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4 text-blue-400" /> },
    { id: 'about', label: 'About', icon: <Info className="w-4 h-4 text-purple-400" /> },
  ];

  // Get dynamic indicator properties based on the active tab
  const getTabIndicator = (tabId) => {
    switch (tabId) {
      case 'dashboard':
        return {
          label: 'Operations Dashboard',
          icon: <LayoutDashboard className="w-3.5 h-3.5 text-primary" />,
          colorClass: 'bg-primary/10 border-primary/20 text-primary'
        };
      case 'report-center':
        return {
          label: 'Report Center',
          icon: <FileText className="w-3.5 h-3.5 text-emerald-400" />,
          colorClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        };
      case 'workspace':
        return {
          label: 'Pipeline Workspace',
          icon: <Layers className="w-3.5 h-3.5 text-accent" />,
          colorClass: 'bg-accent/10 border-accent/20 text-accent'
        };
      case 'demo':
        return {
          label: 'Demo Mode',
          icon: <Play className="w-3.5 h-3.5 text-amber-500" />,
          colorClass: 'bg-amber-500/10 border-amber-500/20 text-amber-400'
        };
      case 'settings':
        return {
          label: 'Settings',
          icon: <SettingsIcon className="w-3.5 h-3.5 text-blue-400" />,
          colorClass: 'bg-blue-500/10 border-blue-500/20 text-blue-400'
        };
      case 'about':
        return {
          label: 'About LogNexio',
          icon: <Info className="w-3.5 h-3.5 text-purple-400" />,
          colorClass: 'bg-purple-500/10 border-purple-500/20 text-purple-400'
        };
      default:
        return {
          label: 'System Diagnostics Dashboard',
          icon: <Activity className="w-3.5 h-3.5 text-primary" />,
          colorClass: 'bg-primary/10 border-primary/20 text-primary'
        };
    }
  };

  const indicator = getTabIndicator(activeTab);

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-background-border px-6 py-3.5 flex flex-col xl:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 shrink-0">
        <img src="/logo_icon.png" alt="LogNexio Logo" className="h-9 w-9 object-contain" />
        <span className="text-xl font-extrabold text-primary-light tracking-tight">LogNexio AI</span>
      </div>

      {/* Tabs Bar */}
      {setActiveTab && (
        <div className="flex flex-wrap items-center justify-center gap-1 p-1 bg-slate-900/80 border border-background-border rounded-2xl">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border ${
                  active
                    ? 'bg-slate-800 text-slate-50 border-slate-700 shadow-sm'
                    : 'border-transparent text-slate-400 hover:text-slate-50 hover:bg-slate-900/50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Indicators */}
      <div className="flex items-center gap-3 shrink-0">
        <div className={`hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${indicator.colorClass}`}>
          {indicator.icon}
          <span>{indicator.label}</span>
        </div>
      </div>
    </nav>
  );
}
