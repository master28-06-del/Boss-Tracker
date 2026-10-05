import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error in Metin2 Boss Tracker:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#0b0c10] text-gray-200">
          <div className="max-w-md w-full p-6 bg-[#161b26] border border-red-700/60 rounded-2xl shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-xl bg-red-950/60 border border-red-500/40 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="font-metin text-xl font-bold text-gray-100">Błąd aplikacji (ErrorBoundary)</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Wystąpił nieoczekiwany problem podczas renderowania komponentu.
            </p>
            {this.state.error && (
              <pre className="p-3 rounded-lg bg-[#0e111a] border border-gray-800 text-[11px] text-rose-300 font-mono overflow-x-auto text-left">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Odśwież stronę</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
