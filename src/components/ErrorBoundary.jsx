import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught React Runtime Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="bg-white border border-[#DDE5DF] rounded-lg p-8 max-w-md w-full space-y-4 shadow-sm text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-[#C62828]">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-extrabold text-[#17211B]">Unable to load this page</h2>
              <p className="text-xs text-[#64746A]">
                A runtime exception occurred while loading this view. You can reload to retry.
              </p>
            </div>
            {this.state.error?.message && (
              <div className="bg-[#F7F8F5] border border-[#DDE5DF] rounded p-3 text-[11px] font-mono text-[#C62828] text-left truncate">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="bg-[#087F5B] hover:bg-[#064E3B] text-white px-5 py-2.5 rounded-md text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2 mx-auto cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
