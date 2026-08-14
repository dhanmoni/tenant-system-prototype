import { api } from './http'

export function fetchActivityLogs(params = {}) {
	return api.get('/api/activity-logs', { params }).then(({ data }) => data)
}
