import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/dashboard/Sidebar'

function DashboardLayout({ user, onLogout, onUserUpdate }) {
	return (
		<section className="dashboard-layout">
			<Sidebar user={user} onLogout={onLogout} />
			<main className="dashboard-content">
				<Outlet context={{ user, onLogout, onUserUpdate }} />
			</main>
		</section>
	)
}

export default DashboardLayout
