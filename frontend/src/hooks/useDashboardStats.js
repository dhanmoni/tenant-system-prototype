import { useQuery } from '@tanstack/react-query';
import api from '../api';

export const useDashboardStats = (url) => {
  return useQuery({
    queryKey: ['dashboard-stats', url],
    queryFn: async () => {
      if (!url) return null;
      const { data } = await api.get(url);
      return data;
    },
    enabled: !!url,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
