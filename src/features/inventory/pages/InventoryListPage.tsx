import { useInventoryItems } from '../hooks/useInventory';
import { DataTable } from '@/components/ui/DataTable';
import { inventoryColumns } from '../components/InventoryColumns';
import { Button } from '@/components/ui/Button';
import { Plus, Download } from 'lucide-react';
import { exportToCsv } from '@/lib/export';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';

export const InventoryListPage = () => {
  const { data: items, isLoading, isError, refetch } = useInventoryItems();

  const handleExport = () => {
    if (items && items.length > 0) {
      exportToCsv('inventory_items', items);
    }
  };

  if (isError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Inventory Items</h2>
        </div>
        <ErrorState 
          title="Failed to load inventory"
          description="Could not connect to the inventory service. Please verify your connection."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory Items</h2>
          <p className="text-muted-foreground mt-2">
            Manage your physical assets, stock levels, and item catalog.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport} disabled={!items?.length}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-12 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-24 w-full animate-pulse rounded-md bg-muted" />
          <div className="h-24 w-full animate-pulse rounded-md bg-muted" />
        </div>
      ) : !items || items.length === 0 ? (
        <EmptyState
          title="No items found"
          description="You haven't added any inventory items yet. Get started by creating your first item."
          actionLabel="Add Item"
          onAction={() => {}}
        />
      ) : (
        <DataTable
          columns={inventoryColumns}
          data={items}
          searchKey="name"
          searchPlaceholder="Search items by name..."
        />
      )}
    </div>
  );
};
