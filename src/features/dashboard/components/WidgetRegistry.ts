import React from 'react';

export interface DashboardWidget {
  id: string;
  title: string;
  component: React.ComponentType;
  permission?: string;
  gridConfig?: {
    colSpan?: number;
    rowSpan?: number;
  };
}

// In the future, this registry will be populated dynamically or via a module registration system
export const dashboardWidgets: DashboardWidget[] = [];
