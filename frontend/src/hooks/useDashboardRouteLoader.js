import { useLocation } from 'react-router-dom'

const DASHBOARD_ROUTE_PREFIX = '/dashboard'

export function isDashboardWorkspaceRoute(pathname) {
	return pathname.startsWith(DASHBOARD_ROUTE_PREFIX)
}

/** @deprecated Use isDashboardWorkspaceRoute */
export function isDashboardAdminRoute(pathname) {
	return pathname.startsWith(`${DASHBOARD_ROUTE_PREFIX}/admin`)
}

/**
 * Artificial min-delay nav loader removed — it made every sidebar click feel slow
 * even when the page chunk was already cached. Real chunk waits use Suspense in WorkspaceLayout.
 */
export default function useDashboardRouteLoader(_enabled = true) {
	useLocation()
	return false
}
