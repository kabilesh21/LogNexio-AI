import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled rendering error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-background-text flex items-center justify-center p-6">
          <div className="glass-panel border border-red-500/30 rounded-3xl p-8 max-w-lg w-full flex flex-col items-center text-center gap-6 shadow-2xl animate-fade-in">
            <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-2xl">
              <AlertTriangle className="w-12 h-12 text-red-400" />
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-extrabold text-white">Something Went Wrong</h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                An unexpected UI rendering error occurred. The system has automatically isolated the fault to preserve your data.
              </p>
            </div>

            {this.state.error && (
              <div className="w-full p-3 bg-slate-950/80 border border-slate-900 rounded-xl font-mono-code text-[11px] text-red-400 text-left overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl bg-primary text-purewhite hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
              >
                <RefreshCw className="w-4 h-4" /> Reload Application
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl bg-slate-900 border border-background-border text-slate-300 hover:text-white transition-all"
              >
                <Home className="w-4 h-4" /> Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
