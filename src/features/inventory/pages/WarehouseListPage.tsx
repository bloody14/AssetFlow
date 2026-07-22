import { useWarehouses, useWarehouseUtilization } from '../hooks/useInventory';
import { Button } from '@/components/ui/Button';
import { Building2, Plus } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Badge } from '@/components/ui/Badge';

export const WarehouseListPage = () => {
  const { data: warehouses, isLoading: isLoadingWarehouses, isError } = useWarehouses();
  const { data: utilization, isLoading: isLoadingUtilization } = useWarehouseUtilization();

  if (isError) {
    return <ErrorState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Warehouses</h2>
          <p className="text-muted-foreground mt-2">
            Manage your physical storage locations and track utilization.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Warehouse
        </Button>
      </div>

      {(isLoadingWarehouses || isLoadingUtilization) ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-md" />)}
        </div>
      ) : !warehouses || warehouses.length === 0 ? (
        <EmptyState 
          title="No warehouses found" 
          description="Create your first warehouse location to start tracking inventory."
          actionLabel="Add Warehouse"
          onAction={() => {}}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {warehouses.map(w => {
            const wUtil = utilization?.find(u => u.warehouseId === w.id);
            return (
              <div key={w.id} className="border border-border bg-card rounded-lg p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold text-lg">{w.name}</h3>
                  </div>
                  <Badge variant={w.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {w.status}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Location: {w.location || 'Not specified'}</p>
                  <p>Manager: {w.managerId || 'Unassigned'}</p>
                </div>

                <div className="pt-4 border-t border-border flex justify-between text-sm">
                  <div>
                    <span className="font-medium text-foreground">{wUtil?.totalStockAvailable || 0}</span> items
                  </div>
                  <div>
                    <span className="font-medium text-foreground">{wUtil?.totalStockReserved || 0}</span> reserved
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  Manage Settings
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
