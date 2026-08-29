import { useQuery } from '@tanstack/react-query';
import api from '../api';

function parseList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export const useMasterData = (endpoint) => {
  return useQuery({
    queryKey: ['master-data', endpoint],
    queryFn: async () => {
      if (!endpoint) return [];
      const { data } = await api.get(endpoint, { params: { all: true } });
      return parseList(data);
    },
    enabled: !!endpoint,
    staleTime: 1000 * 60 * 60, // 1 hour, master data rarely changes
  });
};
