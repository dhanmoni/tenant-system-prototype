import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { APPLICATION_TYPES } from '../constants/application';

export const useTenancyRecords = ({ page, filters }) => {
  return useQuery({
    queryKey: ['tenancy-records', page, filters],
    queryFn: async () => {
      const params = { page, per_page: 15 };
      if (filters?.search) params.search = filters.search;
      if (filters?.status) params.status = filters.status;
      if (filters?.district_id) params.district_id = filters.district_id;

      const { data } = await api.get('/api/admin/tenancy-records', { params });
      
      const uinOnly = (data.records || [])
        .map((row) => ({
          ...row,
          form_type: row.form_type || APPLICATION_TYPES.TENANCY_CERTIFICATE,
        }))
        .filter((row) => row.form_type === APPLICATION_TYPES.TENANCY_CERTIFICATE);

      return {
        records: uinOnly,
        paginationInfo: data.pagination || null,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
