import { Component, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Oops! Something went wrong
                </h1>
                <p className="text-gray-600">
                  We're sorry, but something unexpected happened. Please try refreshing the page.
                </p>
              </div>

              {this.state.error && (
                <div className="w-full p-4 bg-gray-50 rounded-lg text-left">
                  <p className="text-xs text-gray-500 font-mono break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <Button
                onClick={this.handleReset}
                className="mt-4 gap-2"
                size="lg"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
