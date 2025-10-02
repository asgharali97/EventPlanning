import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

export const useHostStatus = () => {
  const { user, updateUser } = useAuthStore();
  const { addToast } = useUIStore();
  return useQuery({
    queryKey: ['hostStatus'],
    queryFn: async () => {
      const { data } = await axios.get('/api/become-host/status');
      return data.isVerified;
    },
    refetchInterval: 5000, // Poll every 5s
    enabled: !!user?.depositHeld && !user?.isVerified,
    onSuccess: (isVerified) => {
      if (isVerified) {
        updateUser({ isVerified: true });
        addToast('Host verification complete!');
      }
    },
    onError: () => addToast('Failed to check host status', 'destructive'),
  });
};