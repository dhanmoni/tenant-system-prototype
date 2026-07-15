const PUBLIC_MARKETING_PATHS = new Set([
	'/about',
	'/services',
	'/policies',
	'/resources',
	'/contact',
	'/public-dashboard',
	'/sitemap',
])

export function isPublicMarketingPath(pathname = '') {
	return PUBLIC_MARKETING_PATHS.has(String(pathname || ''))
}

/** Resolve main-content skip target for current route. */
export function getMainContentTargetId(pathname = '') {
	const path = String(pathname || '')
	if (path.startsWith('/dashboard')) return 'dashboard-primary-content'
	// Home landing: skip into Apply / Sign in (get started) section
	if (path === '/' || path === '') return 'portal-content'
	return 'main-content'
}

/** Resolve primary navigation skip target for current route. */
export function getNavTargetId(pathname = '', isLandingHome = false) {
	if (String(pathname || '').startsWith('/dashboard')) {
		return 'workspace-primary-nav'
	}
	if (isLandingHome || isPublicMarketingPath(pathname)) {
		return 'landing-primary-nav'
	}
	return 'public-primary-nav'
}

/**
 * Move keyboard focus to a skip target and scroll it into view.
 * For the dashboard pane, also resets internal scroll position.
 */
export function focusSkipTarget(targetId) {
	const id = String(targetId || '').replace(/^#/, '')
	if (!id) return false

	const el = document.getElementById(id)
	if (!el) return false

	if (!el.hasAttribute('tabindex')) {
		el.setAttribute('tabindex', '-1')
	}

	if (id === 'dashboard-primary-content' && typeof el.scrollTop === 'number') {
		el.scrollTop = 0
	}

	el.focus({ preventScroll: true })
	el.scrollIntoView({ behavior: 'smooth', block: 'start' })
	return true
}

export function handleSkipLinkClick(event, targetId) {
	event.preventDefault()
	focusSkipTarget(targetId)
}
