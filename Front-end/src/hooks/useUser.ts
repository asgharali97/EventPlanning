import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import axios from '../lib/axios';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'host';
  isVerified: boolean;
  depositHeld: boolean;
  stripePaymentId?: string;
}

export const useUser = () => {
  const { isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const { addToast, setAppLoading } = useUIStore();

  const query = useQuery<User>({
    queryKey: ['user'],
    queryFn: async () => {
      setAppLoading(true);
      console.log('Fetching user...');
      try {
        const { data } = await axios.get('/auth/user');
        console.log('User data received:', data);
        return data;
      } catch (error: any) {
        setAppLoading(false);
        addToast(error.response?.data?.message || 'Failed to fetch user', 'destructive');
        if (error.response?.status === 401) {
          clearAuth();
          window.location.href = '/signin';
        }
        throw error;
      } finally {
        setAppLoading(false);
      }
    },
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (query.data) {
      console.log('Setting auth with user data:', query.data);
      setAuth(query.data);
    }
  }, [query.data, setAuth]);

  return query;
};