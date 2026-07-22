import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useAuth';

export const ProtectedRoute = () => {
  const { data: user, isLoading, isError } = useCurrentUser();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-primary text-lg animate-pulse">Loading AssetFlow...</div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login and preserve the intended destination
  if (isError || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // User is authenticated, render child routes
  return <Outlet />;
};
