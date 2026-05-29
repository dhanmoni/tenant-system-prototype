/**
 * Turn Laravel 422 validation responses into a readable message.
 */
export function formatApiErrors(err, fallback = 'Something went wrong. Please try again.') {
	const data = err?.response?.data
	if (!data) return fallback

	if (data.errors && typeof data.errors === 'object') {
		const messages = Object.values(data.errors).flat().filter(Boolean)
		if (messages.length > 0) return messages.join(' ')
	}

	const message = data.message
	if (message && message !== 'The given data was invalid.') {
		return message
	}

	return fallback
}
