import React, { useEffect, useState } from 'react';
import { Keyboard, X } from 'lucide-react';

export default function ShortcutGuide({ setActiveTab }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + Key shortcuts
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (key === 'd') {
          e.preventDefault();
          setActiveTab('dashboard');
        } else if (key === 'r') {
          e.preventDefault();
          setActiveTab('report-center');
        } else if (key === 'u') {
          e.preventDefault();
          setActiveTab('workspace');
        }
      }
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab]);

  const shortcuts = [
    { key: 'Ctrl + D', description: 'Open Operations Dashboard' },
    { key: 'Ctrl + R', description: 'Open Incident Report Center' },
    { key: 'Ctrl + U', description: 'Open Pipeline Workspace (Upload)' },

    { key: 'Shift + ?', description: 'Toggle Keyboard Shortcut Guide' },
    { key: 'Esc', description: 'Close any active modal or drawer' },
  ];

  return (
    <>
      {/* Trigger floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-40 p-2.5 rounded-full glass-panel border border-background-border text-slate-400 hover:text-white hover:border-primary/40 transition-all shadow-xl"
        title="Keyboard Shortcuts (?)"
      >
        <Keyboard className="w-4 h-4" />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel border border-background-border rounded-3xl p-6 max-w-md w-full flex flex-col gap-5 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-white font-bold text-base">
                <Keyboard className="w-5 h-5 text-primary" />
                <span>Keyboard Shortcuts</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {shortcuts.map((sc, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-900/60 border border-background-border/50 rounded-xl text-xs">
                  <span className="text-slate-300">{sc.description}</span>
                  <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-primary font-mono-code font-bold text-[10px]">
                    {sc.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
