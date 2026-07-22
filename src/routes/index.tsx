import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage, ProtectedRoute } from '@/features/auth';
import { MainLayout } from '@/layouts/MainLayout';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';

import { InventoryListPage } from '@/features/inventory/pages/InventoryListPage';

// Placeholder for other modules
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-8">
    <h1 className="text-3xl font-bold">{title}</h1>
    <p className="text-muted-foreground mt-4">Module under construction.</p>
  </div>
);

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/inventory" element={<Navigate to="/inventory/items" replace />} />
          <Route path="/inventory/items" element={<InventoryListPage />} />
          <Route path="/procurement" element={<PlaceholderPage title="Procurement" />} />
          <Route path="/assets" element={<PlaceholderPage title="Assets" />} />
          <Route path="/notifications" element={<PlaceholderPage title="Notifications" />} />
          
          {/* Default route redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
};
