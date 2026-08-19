import { Navigate, Outlet, useOutletContext } from 'react-router-dom'

/**
 * Nested dashboard gate: logged-in users whose role is not in `roles`
 * are sent to the dedicated forbidden page (not a silent redirect home).
 */
function RoleProtectedRoute({ roles = [] }) {
	const ctx = useOutletContext()
	const role = ctx?.user?.role

	if (!role || !roles.includes(role)) {
		return <Navigate to="/403" replace />
	}

	return <Outlet context={ctx} />
}

export default RoleProtectedRoute
