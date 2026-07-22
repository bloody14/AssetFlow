import { api } from '@/lib/api';
import { CycleCount } from '../types';

export interface CreateCycleCountDTO {
  warehouseId: string;
  inventoryItemIds: string[];
  notes?: string;
}

export interface RecordCountDTO {
  inventoryItemId: string;
  countedQuantity: number;
  adjustmentReason?: 'SHRINKAGE' | 'DAMAGE' | 'OBSOLESCENCE' | 'FOUND' | 'OTHER';
  notes?: string;
}

export const cycleCountApi = {
  startCycleCount: async (data: CreateCycleCountDTO) => {
    const response = await api.post<{ data: CycleCount }>('/inventory/cycle-counts', data);
    return response.data.data;
  },

  recordCount: async (id: string, data: RecordCountDTO) => {
    const response = await api.post<{ data: any }>(`/inventory/cycle-counts/${id}/count`, data);
    return response.data.data;
  },

  completeCycleCount: async (id: string) => {
    const response = await api.post<{ data: CycleCount }>(`/inventory/cycle-counts/${id}/complete`);
    return response.data.data;
  },
};
