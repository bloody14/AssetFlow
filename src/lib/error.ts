import axios, { AxiosError } from 'axios';
import { ApiErrorResponse } from '../types';

/**
 * Normalizes backend validation and runtime errors into a standardized format
 * suitable for frontend consumption (e.g., displaying in toasts or forms).
 */
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    
    // Extract the unified error message from the backend response
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    
    // Fallback for network issues or 500s without a JSON payload
    return axiosError.message || 'An unexpected network error occurred.';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred.';
};
