import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventoryApi';
import { warehouseApi } from '../api/warehouseApi';
import { stockTransactionApi } from '../api/stockTransactionApi';
import { inventoryKeys } from '../api/keys';

// --- Items ---
export const useInventoryItems = () => {
  return useQuery({
    queryKey: inventoryKeys.items(),
    queryFn: inventoryApi.getItems,
  });
};

export const useInventoryItem = (id: string) => {
  return useQuery({
    queryKey: inventoryKeys.item(id),
    queryFn: () => inventoryApi.getItem(id),
    enabled: !!id,
  });
};

// --- KPIs ---
export const useInventoryKPIs = () => {
  return useQuery({
    queryKey: inventoryKeys.kpis(),
    queryFn: inventoryApi.getKPIs,
    // KPIs can be polled frequently or refetched on focus
    refetchInterval: 30000, 
  });
};

export const useItemTimeline = (itemId: string) => {
  return useQuery({
    queryKey: inventoryKeys.transactions(itemId),
    queryFn: () => stockTransactionApi.getTimeline(itemId),
    enabled: !!itemId,
  });
};

// --- Warehouses ---
export const useWarehouses = () => {
  return useQuery({
    queryKey: inventoryKeys.warehouses(),
    queryFn: warehouseApi.getWarehouses,
  });
};

export const useWarehouseUtilization = () => {
  return useQuery({
    queryKey: inventoryKeys.warehouseUtilization(),
    queryFn: warehouseApi.getUtilization,
  });
};
