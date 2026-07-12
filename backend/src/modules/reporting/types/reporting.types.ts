export interface DashboardSummaryDomain {
  totalAssets: number;
  availableAssets: number;
  assignedAssets: number;
  maintenanceAssets: number;
  activeAllocations: number;
  activeBookings: number;
  pendingMaintenance: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recentActivity: any[]; // Avoid complex deep imports
}

export interface AssetStatistic {
  categoryName: string;
  count: number;
}
