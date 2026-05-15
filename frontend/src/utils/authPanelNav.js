export function authHashForMode(mode) {
	return mode === 'register' ? '#register' : '#login'
}

export function modeFromHash(hash) {
	if (hash === '#register') return 'register'
	if (hash === '#login' || hash === '#auth-card-section') return 'login'
	return null
}

export function scrollToAuthPanel() {
	requestAnimationFrame(() => {
		document.getElementById('auth-card-section')?.scrollIntoView({
			behavior: 'smooth',
			block: 'start',
		})
	})
}
