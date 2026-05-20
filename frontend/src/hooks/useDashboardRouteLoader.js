import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

const DASHBOARD_ROUTE_PREFIX = '/dashboard'
const MIN_LOADER_MS = 380

export function isDashboardWorkspaceRoute(pathname) {
	return pathname.startsWith(DASHBOARD_ROUTE_PREFIX)
}

/** @deprecated Use isDashboardWorkspaceRoute */
export function isDashboardAdminRoute(pathname) {
	return pathname.startsWith(`${DASHBOARD_ROUTE_PREFIX}/admin`)
}

export default function useDashboardRouteLoader(enabled = true) {
	const location = useLocation()
	const [loading, setLoading] = useState(false)
	const timerRef = useRef(null)
	const isInitialMount = useRef(true)

	useEffect(() => {
		if (!enabled || !isDashboardWorkspaceRoute(location.pathname)) {
			setLoading(false)
			return undefined
		}

		if (isInitialMount.current) {
			isInitialMount.current = false
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
