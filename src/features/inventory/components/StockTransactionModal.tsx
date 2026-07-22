import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useStockTransactions } from '../hooks/useInventoryMutations';
import { useWarehouses } from '../hooks/useInventory';

const stockTransactionSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  referenceId: z.string().optional(),
  notes: z.string().optional(),
});

type StockTransactionForm = z.infer<typeof stockTransactionSchema>;

interface StockTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryItemId: string;
  type: 'RECEIVE' | 'ISSUE';
}

export function StockTransactionModal({
  isOpen,
  onClose,
  inventoryItemId,
  type,
}: StockTransactionModalProps) {
  const { receiveStock, consumeStock } = useStockTransactions();
  const { data: warehouses, isLoading: isLoadingWarehouses } = useWarehouses();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StockTransactionForm>({
    resolver: zodResolver(stockTransactionSchema),
  });

  const onSubmit = async (data: StockTransactionForm) => {
    const payload = {
      inventoryItemId,
      warehouseId: data.warehouseId,
      quantity: data.quantity,
      referenceId: data.referenceId,
      notes: data.notes,
    };

    if (type === 'RECEIVE') {
      await receiveStock.mutateAsync(payload);
    } else {
      await consumeStock.mutateAsync(payload);
    }
    
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === 'RECEIVE' ? 'Receive Stock' : 'Issue Stock'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="warehouseId">Warehouse</Label>
            {/* MVP: Native select for simplicity. */}
            <select
              id="warehouseId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('warehouseId')}
              disabled={isLoadingWarehouses}
            >
              <option value="">Select a warehouse</option>
              {warehouses?.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            {errors.warehouseId && (
              <p className="text-sm text-destructive">{errors.warehouseId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              {...register('quantity', { valueAsNumber: true })}
            />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="referenceId">Reference ID (PO Number, etc.)</Label>
            <Input id="referenceId" {...register('referenceId')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" {...register('notes')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : type === 'RECEIVE' ? 'Receive Stock' : 'Issue Stock'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
