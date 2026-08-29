import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { ROLES, ASSISTANT_ROLES, PRINCIPAL_ROLES } from '../constants/roles';
import { SERVICE_APPLICATION_TYPES } from '../constants/application';

export const useAdminApplications = ({
  userRole,
  isInboxPage,
  page,
  filters,
  showFilters
}) => {
  return useQuery({
    queryKey: ['admin-applications', userRole, isInboxPage, page, filters, showFilters],
    queryFn: async () => {
      let endpoint = '/api/admin/applications/all';
      if (userRole === ROLES.VALUER) {
        endpoint = '/api/admin/applications/valuer-inbox';
      } else if (isInboxPage) {
        if (ASSISTANT_ROLES.includes(userRole)) {
          endpoint = '/api/admin/applications/inbox';
        } else if (PRINCIPAL_ROLES.includes(userRole)) {
          endpoint = '/api/admin/applications/principal-inbox';
        }
      }

      const params = { page, per_page: 15 };
      if (showFilters) {
        if (filters.search) params.search = filters.search;
        if (filters.status) params.status = filters.status;
        if (filters.form_type) params.form_type = filters.form_type;
        if (filters.district_id) params.district_id = filters.district_id;
      }

      const { data } = await api.get(endpoint, { params });
      
      // Filter out non-service applications
      const serviceOnly = (data.applications || []).filter((row) =>
        SERVICE_APPLICATION_TYPES.includes(row?.form_type)
      );

      return {
        applications: serviceOnly,
        paginationInfo: data.pagination || null,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    // keepPreviousData is removed in v5, placeholderData is the alternative but we can skip it for now
  });
};
