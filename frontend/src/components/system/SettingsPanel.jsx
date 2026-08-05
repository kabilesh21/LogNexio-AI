import React, { useState } from 'react';
import { Save, RefreshCw, CheckCircle2 } from 'lucide-react';
import { getSettings, saveSettings } from '../../services/settingsService';

export default function SettingsPanel() {
  const [settings, setSettings] = useState(getSettings());
  const [saved, setSaved] = useState(false);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={handleSave} className="glass-panel border border-background-border rounded-3xl p-6 sm:p-8 flex flex-col gap-6 max-w-2xl animate-fade-in">
      <h3 className="text-lg font-bold text-white border-b border-background-border/50 pb-4">
        Application Settings
      </h3>

      {/* Landing Page */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-300">Preferred Landing Page</label>
        <select
          value={settings.preferredLandingPage}
          onChange={(e) => handleChange('preferredLandingPage', e.target.value)}
          className="bg-slate-900 border border-background-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50"
        >
          <option value="dashboard">Operations Dashboard</option>
          <option value="report-center">Incident Report Center</option>
          <option value="workspace">Pipeline Workspace</option>
        </select>
      </div>

      {/* Dashboard Auto Refresh */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-300">Dashboard Auto-Refresh Interval</label>
        <select
          value={settings.autoRefreshInterval}
          onChange={(e) => handleChange('autoRefreshInterval', Number(e.target.value))}
          className="bg-slate-900 border border-background-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50"
        >
          <option value={15}>15 Seconds</option>
          <option value={30}>30 Seconds (Default)</option>
          <option value={60}>60 Seconds</option>
          <option value={0}>Disabled</option>
        </select>
      </div>

      {/* Default Export Format */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-300">Default Report Export Format</label>
        <select
          value={settings.defaultExportFormat}
          onChange={(e) => handleChange('defaultExportFormat', e.target.value)}
          className="bg-slate-900 border border-background-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary/50"
        >
          <option value="pdf">PDF Document (.pdf)</option>
          <option value="docx">Microsoft Word (.docx)</option>
          <option value="json">Raw JSON (.json)</option>
          <option value="markdown">GitHub Markdown (.md)</option>
        </select>
      </div>

      {/* Notifications Toggle */}
      <div className="flex items-center justify-between p-4 bg-slate-900/60 border border-background-border/50 rounded-2xl">
        <div>
          <p className="text-xs font-bold text-white">Enable Toast Notifications</p>
          <p className="text-[10px] text-slate-400">Show floating alerts for upload, analysis, and export actions</p>
        </div>
        <input
          type="checkbox"
          checked={settings.notificationsEnabled}
          onChange={(e) => handleChange('notificationsEnabled', e.target.checked)}
          className="w-4 h-4 accent-primary rounded cursor-pointer"
        />
      </div>



      {/* Save Button */}
      <div className="flex items-center justify-between pt-4 border-t border-background-border/50">
        {saved && (
          <span className="text-xs text-accent font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Settings Saved to localStorage!
          </span>
        )}
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-purewhite text-xs font-bold hover:bg-primary/90 transition-all ml-auto shadow-md shadow-primary/20"
        >
          <Save className="w-4 h-4" /> Save Settings
        </button>
      </div>
    </form>
  );
}
