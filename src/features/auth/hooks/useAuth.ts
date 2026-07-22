import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../api/authService';
import { authKeys } from '../api/keys';
import { LoginCredentials } from '../types';

export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: authService.getCurrentUser,
    retry: false, // Don't retry if unauthorized (e.g., no cookie)
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      // Seed the cache with the current user upon login
      queryClient.setQueryData(authKeys.me(), data.user);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      // Clear the react-query cache and reset state
      queryClient.clear();
    },
  });
};
