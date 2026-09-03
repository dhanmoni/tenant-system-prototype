import { useQuery } from '@tanstack/react-query';
import api from '../api';

export const useUserDetail = (id) => {
  return useQuery({
    queryKey: ['user-detail', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.get(`/api/users/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
