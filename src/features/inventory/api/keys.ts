export const inventoryKeys = {
  all: ['inventory'] as const,
  items: () => [...inventoryKeys.all, 'items'] as const,
  item: (id: string) => [...inventoryKeys.items(), id] as const,
  categories: () => [...inventoryKeys.all, 'categories'] as const,
  stockLevels: (itemId: string) => [...inventoryKeys.item(itemId), 'stockLevels'] as const,
  stockLevel: (itemId: string, warehouseId: string) => [...inventoryKeys.stockLevels(itemId), warehouseId] as const,
  kpis: () => [...inventoryKeys.all, 'kpis'] as const,
  
  warehouses: () => ['warehouses'] as const,
  warehouse: (id: string) => [...inventoryKeys.warehouses(), id] as const,
  warehouseUtilization: () => [...inventoryKeys.warehouses(), 'utilization'] as const,

  transactions: (itemId: string) => [...inventoryKeys.item(itemId), 'transactions'] as const,
  cycleCounts: () => [...inventoryKeys.all, 'cycle-counts'] as const,
};
