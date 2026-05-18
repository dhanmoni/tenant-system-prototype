/** Resolve main-content skip target for current route. */
export function getMainContentTargetId(pathname = '') {
	return String(pathname || '').startsWith('/dashboard')
		? 'dashboard-primary-content'
		: 'main-content'
}

/** Resolve primary navigation skip target for current route. */
export function getNavTargetId(pathname = '', isLandingHome = false) {
	if (String(pathname || '').startsWith('/dashboard')) {
		return 'workspace-primary-nav'
	}
	if (isLandingHome) {
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
