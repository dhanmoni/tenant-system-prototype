import { useQuery } from '@tanstack/react-query';
import { fetchAdminApplication, fetchProceedings, fetchValuers } from '../services/adminApplications';
import { APPLICATION_TYPES } from '../constants/application';
import api from '../api';

export const useAdminApplicationDetail = (applicationNo) => {
  return useQuery({
    queryKey: ['admin-application', applicationNo],
    queryFn: () => fetchAdminApplication(applicationNo),
    enabled: !!applicationNo,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAdminProceedings = (formType, id) => {
  return useQuery({
    queryKey: ['admin-proceedings', formType, id],
    queryFn: async () => {
      const type = formType || APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL;
      // Depending on the service implementation, it might just be fetchProceedings(type, id)
      // Wait, original component had: await api.get(`/api/admin/applications/${formType}/${app.id}/proceedings`)
      // which returns res.data.proceedings
      const res = await fetchProceedings(type, id);
      return res.proceedings || res || [];
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useValuers = () => {
  return useQuery({
    queryKey: ['admin-valuers'],
    queryFn: async () => {
      const data = await fetchValuers();
      const users = data?.users?.data || data?.users || [];
      return users;
    },
    staleTime: 1000 * 60 * 60, // 1 hour for valuers since they rarely change
  });
};
