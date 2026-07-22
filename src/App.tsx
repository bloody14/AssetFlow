import React from 'react';

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
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary mb-4">AssetFlow Enterprise Platform</h1>
          <p className="text-muted-foreground text-lg">Phase 6.1 Initialization Complete.</p>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
