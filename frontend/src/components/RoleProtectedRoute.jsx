import { Navigate, Outlet, useOutletContext } from 'react-router-dom'
import { useAuthSession } from '../context/AuthSessionContext'

/**
 * Nested dashboard gate: logged-in users whose role is not in `roles`
 * are sent to the dedicated forbidden page (not a silent redirect home).
 */
function RoleProtectedRoute({ roles = [] }) {
	const ctx = useOutletContext()
	const session = useAuthSession()
	const user = ctx?.user || session?.user
	const role = user?.role

	if (!role || !roles.includes(role)) {
		return <Navigate to="/403" replace />
	}

	return <Outlet context={ctx?.user ? ctx : { user, onLogout: session?.onLogout }} />
}

export default RoleProtectedRoute
