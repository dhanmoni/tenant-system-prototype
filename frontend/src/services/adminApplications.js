import { api } from './http'

export function fetchAdminApplication(applicationNo) {
	return api.get(`/api/admin/applications/${applicationNo}`).then(({ data }) => data)
}

export function fetchValuers() {
	return api.get('/api/users', { params: { role: 'valuer' } }).then(({ data }) => data)
}

export function fetchProceedings(formType, id) {
	return api
		.get(`/api/admin/applications/${formType}/${id}/proceedings`)
		.then(({ data }) => data)
}

export function createProceeding(formType, id, formData) {
	return api
		.post(`/api/admin/applications/${formType}/${id}/proceedings`, formData)
		.then(({ data }) => data)
}

export function assignValuer(applicationId, valuerId) {
	return api
		.post(`/api/admin/applications/${applicationId}/assign-valuer`, { valuer_id: valuerId })
		.then(({ data }) => data)
}

export function removeValuer(applicationId) {
	return api.post(`/api/admin/applications/${applicationId}/remove-valuer`).then(({ data }) => data)
}

export function submitValuerReport(applicationId, report) {
	return api
		.post(`/api/admin/applications/${applicationId}/submit-valuer-report`, { report })
		.then(({ data }) => data)
}
