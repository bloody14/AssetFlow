import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useStockTransactions } from '../hooks/useInventoryMutations';
import { useWarehouses } from '../hooks/useInventory';

const transferStockSchema = z.object({
  sourceWarehouseId: z.string().min(1, 'Source Warehouse is required'),
  destinationWarehouseId: z.string().min(1, 'Destination Warehouse is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  referenceId: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => data.sourceWarehouseId !== data.destinationWarehouseId, {
  message: "Source and Destination warehouses cannot be the same",
  path: ["destinationWarehouseId"],
});

type TransferStockForm = z.infer<typeof transferStockSchema>;

interface TransferStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryItemId: string;
}

export function TransferStockModal({
  isOpen,
  onClose,
  inventoryItemId,
}: TransferStockModalProps) {
  const { transferStock } = useStockTransactions();
  const { data: warehouses, isLoading: isLoadingWarehouses } = useWarehouses();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransferStockForm>({
    resolver: zodResolver(transferStockSchema),
  });

  const onSubmit = async (data: TransferStockForm) => {
    await transferStock.mutateAsync({
      inventoryItemId,
      sourceWarehouseId: data.sourceWarehouseId,
      destinationWarehouseId: data.destinationWarehouseId,
      quantity: data.quantity,
      referenceId: data.referenceId,
      notes: data.notes,
    });
    
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Stock</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          
          <div className="space-y-2">
            <Label htmlFor="sourceWarehouseId">Source Warehouse</Label>
            <select
              id="sourceWarehouseId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('sourceWarehouseId')}
              disabled={isLoadingWarehouses}
            >
              <option value="">Select a warehouse</option>
              {warehouses?.map((w) => (
                <option key={`src-${w.id}`} value={w.id}>{w.name}</option>
              ))}
            </select>
            {errors.sourceWarehouseId && (
              <p className="text-sm text-destructive">{errors.sourceWarehouseId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="destinationWarehouseId">Destination Warehouse</Label>
            <select
              id="destinationWarehouseId"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('destinationWarehouseId')}
              disabled={isLoadingWarehouses}
            >
              <option value="">Select a warehouse</option>
              {warehouses?.map((w) => (
                <option key={`dest-${w.id}`} value={w.id}>{w.name}</option>
              ))}
            </select>
            {errors.destinationWarehouseId && (
              <p className="text-sm text-destructive">{errors.destinationWarehouseId.message}</p>
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
            <Label htmlFor="referenceId">Reference ID (Optional)</Label>
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
              {isSubmitting ? 'Transferring...' : 'Transfer Stock'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
