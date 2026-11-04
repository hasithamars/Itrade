import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Terminal } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Terminal runtime error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 font-sans">
          <div className="max-w-lg w-full bg-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  AlphaPulse AI Terminal Recovery
                </h1>
                <p className="text-xs text-slate-400 font-mono">
                  A client-side initialization issue was intercepted safely.
                </p>
              </div>
            </div>

            <div className="bg-black/50 border border-white/10 rounded-xl p-3 font-mono text-xs text-rose-300 overflow-x-auto max-h-40">
              {this.state.error?.message || 'Unexpected application error'}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition shadow-lg shadow-emerald-950/40"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Terminal</span>
              </button>
              <button
                type="button"
                onClick={this.handleResetAndReload}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 rounded-xl font-bold text-xs transition"
              >
                <Trash2 className="w-4 h-4 text-amber-400" />
                <span>Reset Cache &amp; Reload</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
