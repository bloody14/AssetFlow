import { api } from '@/lib/api';
import { 
  Warehouse, 
  WarehouseUtilization, 
  CreateWarehouseDTO, 
  UpdateWarehouseDTO 
} from '../types';

export const warehouseApi = {
  getWarehouses: async () => {
    const response = await api.get<{ data: Warehouse[] }>('/inventory/warehouses');
    return response.data.data;
  },

  getWarehouse: async (id: string) => {
    const response = await api.get<{ data: Warehouse }>(`/inventory/warehouses/${id}`);
    return response.data.data;
  },

  createWarehouse: async (data: CreateWarehouseDTO) => {
    const response = await api.post<{ data: Warehouse }>('/inventory/warehouses', data);
    return response.data.data;
  },

  updateWarehouse: async (id: string, data: UpdateWarehouseDTO) => {
    const response = await api.put<{ data: Warehouse }>(`/inventory/warehouses/${id}`, data);
    return response.data.data;
  },

  getUtilization: async () => {
    const response = await api.get<{ data: WarehouseUtilization[] }>('/inventory/analytics/warehouse-utilization');
    return response.data.data;
  },
};
