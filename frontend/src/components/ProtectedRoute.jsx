import { Navigate, useLocation } from 'react-router-dom'

function ProtectedRoute({ user, authLoading = false, children }) {
	const location = useLocation()
	if (authLoading) {
		return (
			<div className="portal-status-page portal-status-page--boot" role="status" aria-live="polite">
				<div className="loader-spinner" style={{ marginBottom: '1rem' }} aria-hidden></div>
				<p className="portal-status-page__boot">Checking your session…</p>
			</div>
		)
	}
	if (!user) {
		return (
			<Navigate
				to={{ pathname: '/login', search: location.search }}
				state={{ from: location }}
				replace
			/>
		)
	}
	return children
}

export default ProtectedRoute
