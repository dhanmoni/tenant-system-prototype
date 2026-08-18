import { useEffect, useRef, useState } from 'react'

/** Adds `is-offscreen` when the element leaves the viewport so CSS can pause animations. */
export function useOffscreenPause(rootMargin = '80px 0px') {
	const ref = useRef(null)
	const [offscreen, setOffscreen] = useState(false)

	useEffect(() => {
		const node = ref.current
		if (!node || typeof IntersectionObserver === 'undefined') return undefined

		const observer = new IntersectionObserver(
			([entry]) => {
				setOffscreen(!entry.isIntersecting)
			},
			{ root: null, rootMargin, threshold: 0 },
		)
		observer.observe(node)
		return () => observer.disconnect()
	}, [rootMargin])

	return { ref, offscreen }
}
