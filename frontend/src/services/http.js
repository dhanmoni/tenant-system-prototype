import api, { csrf } from '../api'

export { api, csrf }

export function parseList(data) {
	if (Array.isArray(data)) return data
	if (Array.isArray(data?.data)) return data.data
	if (Array.isArray(data?.districts)) return data.districts
	return []
}
