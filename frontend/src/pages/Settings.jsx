import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import SettingsPanel from '../components/system/SettingsPanel';
import VersionInfo from '../components/system/VersionInfo';

export default function Settings() {
  return (
    <div className="relative min-h-screen bg-background text-background-text pb-16">
      {/* Background Decorative Glows */}
      <div className="glow-spot top-[-100px] left-[-50px]" />
      <div className="glow-spot-accent bottom-[-50px] right-[100px]" />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 z-10 flex flex-col gap-8">
        {/* Header */}
        <div className="pb-6 border-b border-background-border/40 flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-primary to-accent rounded-2xl shadow-lg shadow-primary/20">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Settings & Version Matrix
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize dashboard preferences, export formats, and view platform module verification
            </p>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <SettingsPanel />
          <VersionInfo />
        </div>
      </main>
    </div>
  );
}
