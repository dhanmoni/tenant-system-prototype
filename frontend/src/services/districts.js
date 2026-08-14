import { api, parseList } from './http'

export function fetchDistricts({ all = true, publicOnly = false } = {}) {
	const url = publicOnly ? '/api/public/districts' : '/api/districts'
	const config = publicOnly
		? { skipAuthRedirect: true }
		: { params: { all: true } }
	if (!all && !publicOnly) config.params = {}
	return api.get(url, config).then(({ data }) => parseList(data))
}

export function createDistrict(payload) {
	return api.post('/api/districts', payload).then(({ data }) => data)
}

export function toggleDistrictActive(id, body = {}) {
	return api.post(`/api/districts/${id}/toggle-active`, body).then(({ data }) => data)
}
