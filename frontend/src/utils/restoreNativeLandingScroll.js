/** Strip leftover Lenis / snap scroll state after experimental landing scroll was removed. */
const LENIS_HTML_CLASSES = ['lenis', 'lenis-smooth', 'lenis-stopped', 'lenis-scrolling']

export function restoreNativeLandingScroll() {
	const root = document.documentElement
	const { body } = document

	LENIS_HTML_CLASSES.forEach((className) => {
		root.classList.remove(className)
		body?.classList.remove(className)
	})

	if (window.lenis) {
		try {
			window.lenis.destroy?.()
		} catch {
			/* ignore stale instance */
		}
		delete window.lenis
	}

	;['height', 'overflow', 'scroll-behavior'].forEach((prop) => {
		root.style.removeProperty(prop)
		body?.style.removeProperty(prop)
	})

	root.style.scrollSnapType = ''
	body && (body.style.scrollSnapType = '')
}
