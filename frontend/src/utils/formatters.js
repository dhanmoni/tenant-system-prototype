/** Title-case person name for display; handles generic demo placeholders. */
export const formatDisplayName = (name) => {
	if (!name || !String(name).trim()) return 'Portal user'
	const trimmed = String(name).trim()
	if (trimmed.toLowerCase() === 'user') return 'Citizen account'
	return trimmed
		.split(/\s+/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ')
}

/** Normalise email for readable display (not database SHOUTING). */
export const formatDisplayEmail = (email) => {
	if (!email) return ''
	return String(email).trim().toLowerCase()
}

export const formatDate = (value) => {
	if (!value) return '-'
	const parsed = new Date(value)
	if (Number.isNaN(parsed.getTime())) return '-'
	const day = String(parsed.getDate()).padStart(2, '0')
	const month = String(parsed.getMonth() + 1).padStart(2, '0')
	const year = parsed.getFullYear()
	return `${day}/${month}/${year}`
}

export const formatDateTime = (value) => {
	if (!value) return '-'
	const normalized =
		typeof value === 'string' && value.includes(' ') && !value.includes('T')
			? value.replace(' ', 'T')
			: value
	const parsed = new Date(normalized)
	if (Number.isNaN(parsed.getTime())) {
		return String(value)
	}
	const day = String(parsed.getDate()).padStart(2, '0')
	const month = String(parsed.getMonth() + 1).padStart(2, '0')
	const year = parsed.getFullYear()
	const hours = String(parsed.getHours()).padStart(2, '0')
	const minutes = String(parsed.getMinutes()).padStart(2, '0')
	const seconds = String(parsed.getSeconds()).padStart(2, '0')
	return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
}
