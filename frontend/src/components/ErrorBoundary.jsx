import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React Application Error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 shadow-sm border border-amber-200">
            <AlertTriangle size={32} />
          </div>

          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Nimadir noto‘g‘ri ketdi / Что-то пошло не так
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
            Ilovani yangilash orqali sahifani qayta yuklashingiz mumkin.
            <br />
            Please reload the page to restore the application.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={this.handleReload}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
            >
              <RefreshCw size={14} />
              <span>Qayta yuklash / Reload</span>
            </button>

            <button
              onClick={this.handleReset}
              className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <Home size={14} />
              <span>Asosiy</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
