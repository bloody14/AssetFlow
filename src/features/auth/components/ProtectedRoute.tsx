import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = () => {
  const { data: user, isLoading, isError } = useCurrentUser();
  const location = useLocation();

  // State 1: Loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background space-y-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-lg font-medium text-muted-foreground animate-pulse">
          Authenticating Session...
        </p>
      </div>
    );
  }

  // State 2: Unauthenticated
  if (isError || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // State 3: Authenticated
  return <Outlet />;
};
