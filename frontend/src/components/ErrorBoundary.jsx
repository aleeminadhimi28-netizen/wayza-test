import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, RefreshCw, Home } from "lucide-react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-center font-sans">
                    <div className="max-w-md w-full space-y-8 bg-white p-12 rounded-[48px] shadow-2xl border border-slate-100">
                        <div className="inline-flex p-4 bg-rose-50 rounded-3xl text-rose-500">
                            <Sparkles size={32} />
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-4xl font-bold text-slate-900 tracking-tighter uppercase leading-none">
                                Something went <br /><span className="text-rose-500 italic font-serif lowercase">unexpected.</span>
                            </h1>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em] leading-relaxed italic">
                                "The network encountered a synchronization anomaly."
                            </p>
                        </div>
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full h-16 bg-slate-900 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all active:scale-95"
                            >
                                <RefreshCw size={18} />
                                Re-Synchronize
                            </button>
                            <Link
                                to="/"
                                className="w-full h-16 bg-slate-50 text-slate-900 border border-slate-100 rounded-2xl font-bold uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-white transition-all active:scale-95"
                            >
                                <Home size={18} />
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
