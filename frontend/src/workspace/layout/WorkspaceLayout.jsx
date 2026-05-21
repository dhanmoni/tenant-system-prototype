import { Outlet, useLocation } from 'react-router-dom'
import useDashboardRouteLoader from '../../hooks/useDashboardRouteLoader'
import WorkspaceRouteLoader from '../components/WorkspaceRouteLoader'
import WorkspaceSidebar from './WorkspaceSidebar'
import '../styles/workspace.css'

function workspaceLoaderLabel(pathname) {
	if (pathname.includes('/admin/role')) return 'Opening roles…'
	if (pathname.includes('/admin/users')) return 'Opening users…'
	if (pathname.includes('/admin/tenancy')) return 'Opening tenancy applications…'
	if (pathname.includes('/admin/applications')) return 'Opening service applications…'
	if (pathname.includes('/admin/inbox')) return 'Opening inbox…'
	if (pathname.includes('/admin/districts')) return 'Opening districts…'
	if (pathname.includes('/tenancy-certificate')) return 'Opening application…'
	if (pathname.includes('/status')) return 'Opening UIN status…'
	if (pathname.includes('/profile')) return 'Opening profile…'
	if (pathname.includes('/services')) return 'Opening services…'
	if (pathname === '/dashboard') return 'Opening dashboard…'
	return 'Loading…'
}

function WorkspaceLayout({ user, onLogout, onUserUpdate }) {
	const location = useLocation()
	const routeLoading = useDashboardRouteLoader(true)
	const loaderLabel = workspaceLoaderLabel(location.pathname)

	return (
		<div className="ws-root">
			<div className="ws-shell">
				<WorkspaceSidebar user={user} onLogout={onLogout} />
				<div
					className="ws-main"
					id="dashboard-primary-content"
					tabIndex={-1}
					aria-label="Workspace content"
				>
					{routeLoading ? <WorkspaceRouteLoader label={loaderLabel} /> : null}
					<Outlet context={{ user, onLogout, onUserUpdate }} />
				</div>
			</div>
		</div>
	)
}

export default WorkspaceLayout
