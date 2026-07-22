import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage, ProtectedRoute } from '@/features/auth';

// Placeholder for Dashboard
const DashboardPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
      <p className="text-muted-foreground mt-4">Welcome to AssetFlow.</p>
    </div>
  );
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Default route redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};
