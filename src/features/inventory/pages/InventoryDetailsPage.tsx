import { useParams, Link } from 'react-router-dom';
import { useInventoryItem, useItemTimeline } from '../hooks/useInventory';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  ArrowLeft,
  History, 
  Building2, 
  ArrowRightLeft, 
  Plus, 
  Minus 
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useState } from 'react';
import { StockTransactionModal } from '../components/StockTransactionModal';
import { TransferStockModal } from '../components/TransferStockModal';
import { format } from 'date-fns';

export const InventoryDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: item, isLoading: isLoadingItem, isError: isErrorItem, refetch: refetchItem } = useInventoryItem(id!);
  const { data: timeline, isLoading: isLoadingTimeline } = useItemTimeline(id!);

  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  if (isErrorItem) {
    return (
      <ErrorState 
        title="Failed to load item" 
        description="Could not connect to the inventory service." 
        onRetry={() => refetchItem()}
      />
    );
  }

  if (isLoadingItem) {
    return <div className="animate-pulse h-64 bg-muted rounded-md w-full" />;
  }

  if (!item) {
    return <EmptyState title="Item not found" description="The inventory item you are looking for does not exist." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center text-sm text-muted-foreground mb-1 hover:text-foreground">
            <ArrowLeft className="mr-1 h-4 w-4" />
            <Link to="/inventory/items">Back to Inventory</Link>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">{item.name}</h2>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{item.sku}</Badge>
            <Badge variant="secondary">{item.categoryId}</Badge>
            <Badge variant="outline">{item.unitOfMeasure}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsReceiveOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Receive
          </Button>
          <Button variant="outline" onClick={() => setIsIssueOpen(true)}>
            <Minus className="mr-2 h-4 w-4" />
            Issue
          </Button>
          <Button onClick={() => setIsTransferOpen(true)}>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Transfer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Details & Stock Levels */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h3 className="flex items-center text-lg font-semibold mb-4">
              <Building2 className="mr-2 h-5 w-5" />
              Stock Locations
            </h3>
            {!item.stockLevels || item.stockLevels.length === 0 ? (
              <p className="text-sm text-muted-foreground">No stock available in any warehouse.</p>
            ) : (
              <div className="space-y-4">
                {item.stockLevels.map((sl, idx) => (
                  <div key={idx} className="flex justify-between items-center pb-4 border-b border-border last:border-0 last:pb-0">
                    <div>
                      <div className="font-medium">{sl.warehouse?.name || sl.warehouseId}</div>
                      <div className="text-xs text-muted-foreground">Last updated: {format(new Date(sl.lastUpdated), 'PP')}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">{sl.quantityAvailable}</div>
                      <div className="text-xs text-muted-foreground">Reserved: {sl.quantityReserved}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h3 className="flex items-center text-lg font-semibold mb-4">
              <History className="mr-2 h-5 w-5" />
              Transaction Timeline
            </h3>
            {isLoadingTimeline ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-muted rounded w-full" />
                <div className="h-10 bg-muted rounded w-full" />
              </div>
            ) : !timeline || timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">No transactions recorded yet.</p>
            ) : (
              <div className="relative border-l border-muted ml-3 space-y-6 pb-4">
                {timeline.map((tx) => (
                  <div key={tx.id} className="relative pl-6">
                    <div className="absolute left-[-5px] top-1 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium capitalize">{tx.type.toLowerCase()}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {tx.quantity} units {tx.type === 'IN' ? 'received' : tx.type === 'OUT' ? 'issued' : tx.type === 'TRANSFER' ? 'transferred' : 'adjusted'}
                        </div>
                        {tx.notes && <div className="text-xs text-muted-foreground italic mt-1">"{tx.notes}"</div>}
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        {format(new Date(tx.createdAt), 'PP p')}
                        <div className="mt-1 font-mono">{tx.referenceId || 'System'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {id && (
        <>
          <StockTransactionModal 
            isOpen={isReceiveOpen} 
            onClose={() => setIsReceiveOpen(false)} 
            inventoryItemId={id} 
            type="RECEIVE" 
          />
          <StockTransactionModal 
            isOpen={isIssueOpen} 
            onClose={() => setIsIssueOpen(false)} 
            inventoryItemId={id} 
            type="ISSUE" 
          />
          <TransferStockModal 
            isOpen={isTransferOpen} 
            onClose={() => setIsTransferOpen(false)} 
            inventoryItemId={id} 
          />
        </>
      )}
    </div>
  );
};
