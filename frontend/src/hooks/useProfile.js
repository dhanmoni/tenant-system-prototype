import { useQuery } from '@tanstack/react-query';
import api from '../api';

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/api/profile');
      return data.user || {};
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
