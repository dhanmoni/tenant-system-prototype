export function getApiErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
	const apiErrors = err?.response?.data?.errors
	const firstField = apiErrors ? Object.values(apiErrors).flat().find(Boolean) : null
	return firstField || err?.response?.data?.message || err?.message || fallback
}
