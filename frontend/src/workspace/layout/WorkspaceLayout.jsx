import { Outlet, useLocation } from 'react-router-dom'
import PortalLoadingScreen from '../../components/PortalLoadingScreen'
import useDashboardRouteLoader from '../../hooks/useDashboardRouteLoader'
import WorkspaceSidebar from './WorkspaceSidebar'
import '../styles/workspace.css'

function workspaceLoaderCopy(pathname) {
	if (pathname.includes('/admin/role')) {
		return { title: 'Loading roles', subtitle: 'Please wait while we open role management.' }
	}
	if (pathname.startsWith('/dashboard/admin')) {
		return { title: 'Loading workspace', subtitle: 'Please wait while we open this section.' }
	}
	return { title: 'Loading', subtitle: 'Please wait.' }
}

function WorkspaceLayout({ user, onLogout, onUserUpdate }) {
	const location = useLocation()
	const routeLoading = useDashboardRouteLoader(true)
	const loaderCopy = workspaceLoaderCopy(location.pathname)

	return (
		<div className="ws-root">
			{routeLoading ? (
				<PortalLoadingScreen
					overlay
					title={loaderCopy.title}
					subtitle={loaderCopy.subtitle}
				/>
			) : null}
			<div className="ws-shell">
				<WorkspaceSidebar user={user} onLogout={onLogout} />
				<div
					className="ws-main"
					id="dashboard-primary-content"
					tabIndex={-1}
					aria-label="Workspace content"
				>
					<Outlet context={{ user, onLogout, onUserUpdate }} />
				</div>
			</div>
		</div>
	)
}

export default WorkspaceLayout
