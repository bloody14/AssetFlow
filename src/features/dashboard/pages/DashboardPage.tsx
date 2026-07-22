import { WidgetContainer } from '../components/WidgetContainer';
import { Package, ShoppingCart, MonitorSmartphone, AlertTriangle, ArrowRight, Building2 } from 'lucide-react';
import { useInventoryKPIs, useWarehouseUtilization } from '@/features/inventory/hooks/useInventory';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { ErrorState } from '@/components/ui/ErrorState';

export const DashboardPage = () => {
  const { data: kpis, isLoading: isLoadingKPIs, isError: isErrorKPIs, refetch: refetchKPIs } = useInventoryKPIs();
  const { data: utilization, isLoading: isLoadingUtilization, isError: isErrorUtilization, refetch: refetchUtilization } = useWarehouseUtilization();

  if (isErrorKPIs || isErrorUtilization) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory Dashboard</h2>
        </div>
        <ErrorState 
          title="Failed to load dashboard" 
          description="We couldn't connect to the inventory service. Please check your connection and try again."
          onRetry={() => {
            refetchKPIs();
            refetchUtilization();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Inventory Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Overview of your AssetFlow ERP system.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <WidgetContainer 
          title="Total Assets" 
          icon={MonitorSmartphone}
          isLoading={isLoadingKPIs}
        >
          <div className="text-2xl font-bold">{kpis?.totalItems || 0}</div>
          <p className="text-xs text-muted-foreground">Unique catalog items</p>
        </WidgetContainer>

        <WidgetContainer 
          title="Stock Available" 
          icon={Package}
          isLoading={isLoadingKPIs}
        >
          <div className="text-2xl font-bold">{kpis?.totalStockAvailable || 0}</div>
          <p className="text-xs text-muted-foreground">Physical units on hand</p>
        </WidgetContainer>

        <WidgetContainer 
          title="Low Stock Alerts" 
          icon={AlertTriangle}
          isLoading={isLoadingKPIs}
        >
          <div className={`text-2xl font-bold ${kpis?.lowStockItemsCount && kpis.lowStockItemsCount > 0 ? 'text-destructive' : ''}`}>
            {kpis?.lowStockItemsCount || 0}
          </div>
          <p className="text-xs text-muted-foreground">Require immediate action</p>
        </WidgetContainer>

        <WidgetContainer 
          title="Active Warehouses" 
          icon={Building2}
          isLoading={isLoadingUtilization}
        >
          <div className="text-2xl font-bold">{utilization?.length || 0}</div>
          <p className="text-xs text-muted-foreground">Operational locations</p>
        </WidgetContainer>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <WidgetContainer 
          title="Warehouse Utilization" 
          className="lg:col-span-4"
          isLoading={isLoadingUtilization}
        >
          <div className="space-y-4 mt-2">
            {!utilization?.length ? (
              <div className="text-center py-8 text-muted-foreground">No warehouse data available</div>
            ) : (
              utilization.map(w => (
                <div key={w.warehouseId} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
                  <div>
                    <div className="font-medium">{w.warehouseName}</div>
                    <div className="text-xs text-muted-foreground">{w.totalStockAvailable} items in stock</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{w.totalStockReserved} reserved</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </WidgetContainer>

        <WidgetContainer 
          title="Quick Actions" 
          className="lg:col-span-3"
        >
          <div className="space-y-4">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/inventory/items">
                <Package className="mr-2 h-4 w-4" />
                View Inventory
                <ArrowRight className="ml-auto h-4 w-4 opacity-50" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link to="/inventory/receive">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Receive Stock
                <ArrowRight className="ml-auto h-4 w-4 opacity-50" />
              </Link>
            </Button>
          </div>
        </WidgetContainer>
      </div>
    </div>
  );
};
