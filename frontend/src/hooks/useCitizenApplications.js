import { useQuery } from '@tanstack/react-query';
import api from '../api';

export const useCitizenApplications = (endpoint, params) => {
  return useQuery({
    queryKey: ['citizen-applications', endpoint, params],
    queryFn: async () => {
      if (!endpoint) return null;
      const { data } = await api.get(endpoint, { params });
      return data;
    },
    enabled: !!endpoint,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
