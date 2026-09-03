import { useQuery } from '@tanstack/react-query';
import api from '../api';

export const useDistrictBreakdown = (dateRange) => {
  return useQuery({
    queryKey: ['dashboard-district-breakdown', dateRange],
    queryFn: async () => {
      const params = {};
      if (dateRange?.from && dateRange?.to) {
        params.from = dateRange.from;
        params.to = dateRange.to;
      }
      const { data } = await api.get('/api/dashboard-stats/district-breakdown', { params });
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
