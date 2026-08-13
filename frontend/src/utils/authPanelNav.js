export function authHashForMode(mode) {
	return mode === 'register' ? '#register' : '#login'
}

export function modeFromHash(hash) {
	if (hash === '#register') return 'register'
	if (hash === '#login' || hash === '#auth-card-section') return 'login'
	return null
}

export function scrollToAuthPanel() {
	const run = () => {
		const el = document.getElementById('auth-card-section')
		if (!el) return false
		el.scrollIntoView({
			behavior: 'smooth',
			block: 'start',
		})
		return true
	}

	if (run()) return

	let attempts = 0
	const timer = window.setInterval(() => {
		attempts += 1
		if (run() || attempts >= 20) {
			window.clearInterval(timer)
		}
	}, 50)
}
