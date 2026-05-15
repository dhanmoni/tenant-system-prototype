import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

const ADMIN_ROUTE_PREFIX = '/dashboard/admin'
const MIN_LOADER_MS = 480

export function isDashboardAdminRoute(pathname) {
	return pathname.startsWith(ADMIN_ROUTE_PREFIX)
}

export default function useDashboardRouteLoader(enabled = true) {
	const location = useLocation()
	const [loading, setLoading] = useState(false)
	const timerRef = useRef(null)

	useEffect(() => {
		if (!enabled || !isDashboardAdminRoute(location.pathname)) {
			setLoading(false)
			return undefined
		}

		setLoading(true)
		if (timerRef.current) clearTimeout(timerRef.current)
		timerRef.current = setTimeout(() => {
			setLoading(false)
			timerRef.current = null
		}, MIN_LOADER_MS)

		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current)
				timerRef.current = null
			}
		}
	}, [enabled, location.pathname, location.search])

	return loading
}
