import { Navigate, useLocation } from 'react-router-dom'

function ProtectedRoute({ user, authLoading = false, children }) {
	const location = useLocation()
	if (authLoading) {
		return null
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
