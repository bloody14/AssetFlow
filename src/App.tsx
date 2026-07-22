import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AppRoutes } from './routes';

// A simple global error boundary for the top level app.
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-background text-destructive">
          <div className="text-center p-6 border border-border rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold mb-2">Something went wrong.</h1>
            <p className="text-muted-foreground">{this.state.error?.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Listen for global unauthorized events to reset state and redirect
    const handleUnauthorized = () => {
      queryClient.clear();
      // Only redirect if not already on login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    };

    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, [queryClient]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background font-sans antialiased">
        <AppRoutes />
      </div>
    </ErrorBoundary>
  );
}

export default App;
