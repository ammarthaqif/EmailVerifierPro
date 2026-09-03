import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw, Trash2, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearStorageAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 text-center animate-in fade-in">
            <div className="w-14 h-14 bg-rose-100 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xs">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h1 className="text-xl font-bold text-slate-900 mb-2">
              Application Encountered an Issue
            </h1>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              We detected an unexpected rendering error. Your data is safe. You can reload the application or reset local preferences below to restore normal operation.
            </p>

            {this.state.error && (
              <div className="text-left bg-slate-900 text-slate-200 rounded-xl p-3.5 mb-6 text-xs font-mono overflow-x-auto max-h-36 border border-slate-800">
                <span className="text-rose-400 font-bold block mb-1">
                  {this.state.error.name}: {this.state.error.message}
                </span>
                {this.state.error.stack && (
                  <pre className="text-[10px] text-slate-400 whitespace-pre-wrap">
                    {this.state.error.stack.split('\n').slice(0, 3).join('\n')}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleClearStorageAndReload}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-slate-500" />
                <span>Clear Cache & Reset</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
