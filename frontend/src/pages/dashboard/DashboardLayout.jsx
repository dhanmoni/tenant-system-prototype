import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../../components/dashboard/Sidebar'
import PortalLoadingScreen from '../../components/PortalLoadingScreen'
import useDashboardRouteLoader from '../../hooks/useDashboardRouteLoader'

function dashboardLoaderCopy(pathname) {
	if (pathname.includes('/admin/role')) {
		return {
			title: 'Loading roles',
			subtitle: 'Please wait while we open role management.',
		}
	}
	if (pathname.startsWith('/dashboard/admin')) {
		return {
			title: 'Loading workspace',
			subtitle: 'Please wait while we open this section.',
		}
	}
	return {
		title: 'Loading',
		subtitle: 'Please wait.',
	}
}

function DashboardLayout({ user, onLogout, onUserUpdate }) {
	const location = useLocation()
	const routeLoading = useDashboardRouteLoader(true)
	const loaderCopy = dashboardLoaderCopy(location.pathname)

	return (
		<>
			{routeLoading ? (
				<PortalLoadingScreen
					overlay
					title={loaderCopy.title}
					subtitle={loaderCopy.subtitle}
				/>
			) : null}
			<section className="dashboard-layout">
				<Sidebar user={user} onLogout={onLogout} />
				<main className="dashboard-content">
					<Outlet context={{ user, onLogout, onUserUpdate }} />
				</main>
			</section>
		</>
	)
}

export default DashboardLayout
