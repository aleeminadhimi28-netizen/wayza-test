import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  componentDidMount() {
    sessionStorage.removeItem('wayzza_chunk_reload');
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);

    if (
      error?.message?.match(/Failed to fetch dynamically imported module/i) ||
      error?.message?.match(/Importing a module script failed/i)
    ) {
      const hasReloaded = sessionStorage.getItem('wayzza_chunk_reload');
      if (!hasReloaded) {
        sessionStorage.setItem('wayzza_chunk_reload', 'true');
        window.location.reload(true);
      }
    }
  }

  render() {
    if (this.state.hasError) {
      sessionStorage.removeItem('wayzza_chunk_reload');
      return (
        <div
          className="min-h-screen flex flex-col items-center justify-center p-6 text-center font-sans dash-transition"
          style={{ background: 'var(--dash-bg)', color: 'var(--dash-text-1)' }}
        >
          <div
            className="max-w-md w-full p-8 rounded-2xl border space-y-6"
            style={{ background: 'var(--dash-card)', borderColor: 'var(--dash-card-border)' }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
            >
              <AlertCircle size={24} />
            </div>
            <div className="space-y-2">
              <h1
                className="text-lg font-semibold tracking-tight"
                style={{ color: 'var(--dash-text-1)' }}
              >
                Something went wrong
              </h1>
              <p className="text-xs" style={{ color: 'var(--dash-text-3)' }}>
                An unexpected error occurred while loading this section.
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full h-10 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-98"
                style={{ background: 'var(--dash-accent-500)', color: '#050a08' }}
              >
                <RefreshCw size={14} />
                Reload Page
              </button>
              <Link
                to="/"
                className="w-full h-10 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-98"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--dash-divider)',
                  color: 'var(--dash-text-2)',
                }}
              >
                <Home size={14} />
                Return Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
