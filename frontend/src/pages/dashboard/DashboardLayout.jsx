import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/dashboard/Sidebar'

function DashboardLayout({ user, onLogout, onUserUpdate }) {
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

	const toggleSidebar = () => {
		setSidebarCollapsed((prev) => !prev)
	}

	return (
		<section className={`dashboard-layout ${sidebarCollapsed ? 'collapsed' : ''}`}>
			<Sidebar 
				user={user} 
				sidebarCollapsed={sidebarCollapsed} 
				toggleSidebar={toggleSidebar} 
				onLogout={onLogout}
			/>
			<main className="dashboard-content">
				<Outlet context={{ user, onLogout, onUserUpdate }} />
			</main>
		</section>
	)
}

export default DashboardLayout
