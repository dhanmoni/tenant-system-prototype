import { useQuery } from '@tanstack/react-query';
import api from '../api';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/api/users');
      return data.users || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
