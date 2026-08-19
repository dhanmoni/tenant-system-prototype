import { Navigate } from 'react-router-dom'

function WorkspaceNotFound() {
	return <Navigate to="/404" replace />
}

export default WorkspaceNotFound
