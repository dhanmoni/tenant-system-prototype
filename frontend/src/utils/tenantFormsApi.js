/** Normalise /api/tenant-forms/my (paginated or array) into items + total. */
export function parseTenantFormsResponse(payload) {
	if (!payload) {
		return { items: [], total: 0 }
	}
	if (Array.isArray(payload)) {
		return { items: payload, total: payload.length }
	}
	const items = Array.isArray(payload.data) ? payload.data : []
	const total = Number(payload.total) || items.length
	return { items, total }
}
