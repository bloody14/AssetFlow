import { api } from '@/lib/api';
import { 
  InventoryItem, 
  InventoryCategory, 
  InventoryKPIs, 
  CreateInventoryItemDTO, 
  StockLevel 
} from '../types';

export const inventoryApi = {
  // Items
  getItems: async () => {
    const response = await api.get<{ data: InventoryItem[] }>('/inventory/items');
    return response.data.data;
  },

  getItem: async (id: string) => {
    const response = await api.get<{ data: InventoryItem }>(`/inventory/items/${id}`);
    return response.data.data;
  },

  createItem: async (data: CreateInventoryItemDTO) => {
    const response = await api.post<{ data: InventoryItem }>('/inventory/items', data);
    return response.data.data;
  },

  // Categories
  getCategories: async () => {
    const response = await api.get<{ data: InventoryCategory[] }>('/inventory/categories');
    return response.data.data;
  },

  // Stock Levels
  getStockLevel: async (itemId: string, warehouseId: string) => {
    const response = await api.get<{ data: StockLevel }>(
      `/inventory/items/${itemId}/stock/${warehouseId}`
    );
    return response.data.data;
  },

  // Analytics
  getKPIs: async () => {
    const response = await api.get<{ data: InventoryKPIs }>('/inventory/analytics/kpis');
    return response.data.data;
  },

  runLowStockCheck: async () => {
    const response = await api.post('/inventory/analytics/low-stock-check');
    return response.data;
  },
};
