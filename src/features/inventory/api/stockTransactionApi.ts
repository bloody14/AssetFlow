import { api } from '@/lib/api';
import { 
  StockTransaction, 
  StockActionDTO, 
  TransferStockDTO 
} from '../types';

export const stockTransactionApi = {
  receiveStock: async (data: StockActionDTO) => {
    const response = await api.post<{ data: StockTransaction }>('/inventory/transactions/receive', data);
    return response.data.data;
  },

  consumeStock: async (data: StockActionDTO) => {
    const response = await api.post<{ data: StockTransaction }>('/inventory/transactions/consume', data);
    return response.data.data;
  },

  transferStock: async (data: TransferStockDTO) => {
    const response = await api.post<{ data: StockTransaction[] }>('/inventory/transactions/transfer', data);
    return response.data.data;
  },

  getTimeline: async (itemId: string) => {
    const response = await api.get<{ data: StockTransaction[] }>(`/inventory/items/${itemId}/timeline`);
    return response.data.data;
  },
};
