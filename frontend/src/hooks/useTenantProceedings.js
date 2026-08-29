import { useQuery } from '@tanstack/react-query';
import api from '../api';

export const useTenantProceedings = (formType, id) => {
  return useQuery({
    queryKey: ['tenant-proceedings', formType, id],
    queryFn: async () => {
      const res = await api.get(`/api/tenant-forms/${formType}/${id}/proceedings`);
      return res.data.proceedings || [];
    },
    enabled: !!id && !!formType,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
