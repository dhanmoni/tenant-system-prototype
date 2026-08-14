import { api } from './http'

export function fetchPublicPortalStats() {
	return api.get('/api/public/portal-stats', { skipAuthRedirect: true }).then(({ data }) => data)
}
