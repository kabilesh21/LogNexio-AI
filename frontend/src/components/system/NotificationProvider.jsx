import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Zap } from 'lucide-react';

const NotificationContext = createContext(null);

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within a NotificationProvider');
  return ctx;
}

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notifySuccess = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const notifyError = useCallback((msg) => addToast(msg, 'error'), [addToast]);
  const notifyInfo = useCallback((msg) => addToast(msg, 'info'), [addToast]);
  const notifyCacheHit = useCallback((msg) => addToast(msg, 'cache'), [addToast]);

  return (
    <NotificationContext.Provider value={{ addToast, notifySuccess, notifyError, notifyInfo, notifyCacheHit }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const types = {
    success: { icon: <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />, border: 'border-accent/40 bg-slate-900/90 text-white' },
    error:   { icon: <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />, border: 'border-red-500/40 bg-slate-900/90 text-white' },
    info:    { icon: <Info className="w-4 h-4 text-primary shrink-0" />, border: 'border-primary/40 bg-slate-900/90 text-white' },
    cache:   { icon: <Zap className="w-4 h-4 text-yellow-400 shrink-0" />, border: 'border-yellow-500/40 bg-slate-900/90 text-white' },
  };

  const cfg = types[toast.type] || types.info;

  return (
    <div className={`pointer-events-auto glass-panel border rounded-2xl p-4 shadow-xl flex items-start gap-3 animate-slide-up ${cfg.border}`}>
      {cfg.icon}
      <p className="text-xs font-medium leading-relaxed flex-1">{toast.message}</p>
      <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
