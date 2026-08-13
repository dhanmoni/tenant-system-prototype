export const HASH_SCROLL_ALIASES = {
	login: 'auth-card-section',
	register: 'auth-card-section',
	uin: 'uin-registration',
}

export function resolveHashId(hash) {
	const rawId = decodeURIComponent(String(hash || '').replace(/^#/, ''))
	if (!rawId) return ''
	return HASH_SCROLL_ALIASES[rawId] || rawId
}

export function scrollToHashTarget(hash) {
	const id = resolveHashId(hash)
	if (!id) return false
	const el = document.getElementById(id)
	if (!el) return false
	el.scrollIntoView({ block: 'start', behavior: 'auto' })
	return true
}

export function highlightServiceTo(itemId) {
	const hash = itemId === 'uin' ? 'uin-registration' : itemId
	return { pathname: '/services', hash: `#${hash}` }
}
