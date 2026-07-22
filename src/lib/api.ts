import axios from 'axios';

/**
 * Global API Client configured for AssetFlow.
 * Uses relative URLs relying on Vite proxy in development.
 */
export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Interceptor to handle global 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Dispatch custom event to trigger logout or redirect in the app shell
      window.dispatchEvent(new Event('unauthorized'));
    }
    return Promise.reject(error);
  }
);
