import { useMutation, useQueryClient } from '@tanstack/react-query';
import { stockTransactionApi } from '../api/stockTransactionApi';
import { inventoryKeys } from '../api/keys';
import { StockActionDTO, TransferStockDTO } from '../types';
import { useNotification } from '@/components/providers/NotificationProvider';

export const useStockTransactions = () => {
  const queryClient = useQueryClient();
  const { notify } = useNotification();

  const receiveStock = useMutation({
    mutationFn: (data: StockActionDTO) => stockTransactionApi.receiveStock(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.item(variables.inventoryItemId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockLevels(variables.inventoryItemId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transactions(variables.inventoryItemId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.kpis() });
      notify({ type: 'success', title: 'Stock Received', message: `Successfully received ${variables.quantity} units.` });
    },
    onError: () => {
      notify({ type: 'error', title: 'Transaction Failed', message: 'Failed to receive stock. Please try again.' });
    },
  });

  const consumeStock = useMutation({
    mutationFn: (data: StockActionDTO) => stockTransactionApi.consumeStock(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.item(variables.inventoryItemId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockLevels(variables.inventoryItemId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transactions(variables.inventoryItemId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.kpis() });
      notify({ type: 'success', title: 'Stock Issued', message: `Successfully issued ${variables.quantity} units.` });
    },
    onError: () => {
      notify({ type: 'error', title: 'Transaction Failed', message: 'Failed to issue stock. Please try again.' });
    },
  });

  const transferStock = useMutation({
    mutationFn: (data: TransferStockDTO) => stockTransactionApi.transferStock(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.item(variables.inventoryItemId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.stockLevels(variables.inventoryItemId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.transactions(variables.inventoryItemId) });
      notify({ type: 'success', title: 'Stock Transferred', message: `Successfully transferred ${variables.quantity} units.` });
    },
    onError: () => {
      notify({ type: 'error', title: 'Transfer Failed', message: 'Failed to transfer stock. Please try again.' });
    },
  });

  return {
    receiveStock,
    consumeStock,
    transferStock,
  };
};
