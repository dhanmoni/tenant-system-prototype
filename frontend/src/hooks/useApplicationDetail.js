import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { APPLICATION_TYPES } from '../constants/application';

const FORM_ENDPOINTS = {
	[APPLICATION_TYPES.TENANCY_CERTIFICATE]: '/api/tenancy-applications',
	[APPLICATION_TYPES.RENT_REVISION]: '/api/rent-revision-applications',
	[APPLICATION_TYPES.OTHER_CHARGES_REVISION]: '/api/other-charges-revision-applications',
	[APPLICATION_TYPES.VALUER_APPOINTMENT]: '/api/valuer-appointment-applications',
	[APPLICATION_TYPES.RENT_COURT_POSSESSION]: '/api/rent-court-possession-applications',
	[APPLICATION_TYPES.RENT_COURT_FILING]: '/api/rent-court-filing-applications',
	[APPLICATION_TYPES.RENT_AUTHORITY_FILING]: '/api/rent-authority-filing-applications',
	[APPLICATION_TYPES.RENT_COURT_APPEAL]: '/api/rent-court-appeal-applications',
	[APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL]: '/api/rent-tribunal-appeal-applications',
}

export const useApplicationDetail = (type, applicationNo) => {
  return useQuery({
    queryKey: ['application-detail', type, applicationNo],
    queryFn: async () => {
      if (!type || !applicationNo) return null;
      if (type === APPLICATION_TYPES.TENANCY_CERTIFICATE) {
        const { data } = await api.get(`/api/tenancy-applications/${applicationNo}`);
        return data.application || null;
      } else {
        const endpoint = FORM_ENDPOINTS[type] || '/api/forms';
        const { data } = await api.get(`${endpoint}/${applicationNo}`);
        return data.application || null;
      }
    },
    enabled: !!type && !!applicationNo,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
