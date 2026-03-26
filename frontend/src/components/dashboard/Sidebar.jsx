import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Icon } from './Icons'

function Sidebar({ user, sidebarCollapsed, toggleSidebar }) {
	const [officeMenuOpen, setOfficeMenuOpen] = useState(false)
	const [userMenuOpen, setUserMenuOpen] = useState(false)
	const [servicesMenuOpen, setServicesMenuOpen] = useState(false)
	const [serviceGroupsOpen, setServiceGroupsOpen] = useState({
		revision: true,
		court: false,
		authority: false,
		appeals: false,
	})

	return (
		<aside className={`dashboard-menu ${sidebarCollapsed ? 'collapsed' : ''}`}>
			<div className="dashboard-menu-header">
				{!sidebarCollapsed && <h2>Menu</h2>}
				<button
					type="button"
					className="sidebar-toggle-btn"
					onClick={toggleSidebar}
					title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
				>
					<Icon name={sidebarCollapsed ? 'expand' : 'collapse'} className="sidebar-toggle-icon" />
				</button>
			</div>
			<nav className="dashboard-links">
				<NavLink
					to="/dashboard"
					end
					className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}
					title="Dashboard"
				>
					<Icon name="dashboard" className="dashboard-link-icon" />
					{!sidebarCollapsed && <span className="dashboard-link-text">Dashboard</span>}
				</NavLink>

				{user?.role === 'tenant owner' ? (
					<>
						<NavLink
							to="/dashboard/profile"
							className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}
							title="Profile"
						>
							<Icon name="user" className="dashboard-link-icon" />
							{!sidebarCollapsed && <span className="dashboard-link-text">Profile</span>}
						</NavLink>
						<a
							className={`dashboard-link dashboard-link-expandable ${servicesMenuOpen ? 'menu-open' : ''}`}
							href="#services-menu"
							onClick={(e) => {
								e.preventDefault()
								if (sidebarCollapsed) {
									toggleSidebar()
									setServicesMenuOpen(true)
								} else {
									setServicesMenuOpen((prev) => !prev)
								}
							}}
							title="Services"
						>
							<div className="dashboard-link-main">
								<Icon name="services" className="dashboard-link-icon" />
								{!sidebarCollapsed && <span className="dashboard-link-text">Services</span>}
							</div>
							{!sidebarCollapsed && (
								<Icon name="chevron" className={`dashboard-link-chevron ${servicesMenuOpen ? 'open' : ''}`} />
							)}
						</a>
						{servicesMenuOpen && !sidebarCollapsed ? (
							<div className="dashboard-submenu">
								<NavLink
									to="/dashboard/tenancy-certificate"
									className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}
								>
									Apply for Tenancy Certificate
								</NavLink>
								<NavLink
									to="/dashboard/status"
									className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}
								>
									Status
								</NavLink>
								
								<button
									type="button"
									className="dashboard-submenu-group-title dashboard-submenu-group-toggle"
									onClick={() =>
										setServiceGroupsOpen((prev) => ({
											...prev,
											revision: !prev.revision,
										}))
									}
								>
									<span>Revision of rent / charges</span>
									<Icon name="chevron" className={`dashboard-submenu-chevron ${serviceGroupsOpen.revision ? 'open' : ''}`} />
								</button>
								{serviceGroupsOpen.revision ? (
									<div className="dashboard-submenu-items">
										<NavLink
											to="/dashboard/form-i-rent-revision"
											className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}
										>
											Form I - Rent revision/fixation
										</NavLink>
										<NavLink
											to="/dashboard/form-i-a-other-charges-revision"
											className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}
										>
											Form I-A - Other charges revision
										</NavLink>
										<NavLink
											to="/dashboard/form-i-b-valuer-appointment"
											className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}
										>
											Form I-B - Valuer appointment
										</NavLink>
									</div>
								) : null}

								<button
									type="button"
									className="dashboard-submenu-group-title dashboard-submenu-group-toggle"
									onClick={() =>
										setServiceGroupsOpen((prev) => ({
											...prev,
											court: !prev.court,
										}))
									}
								>
									<span>Rent Court submissions</span>
									<Icon name="chevron" className={`dashboard-submenu-chevron ${serviceGroupsOpen.court ? 'open' : ''}`} />
								</button>
								{serviceGroupsOpen.court ? (
									<div className="dashboard-submenu-items">
										<NavLink
											to="/dashboard/form-4-rent-court-possession"
											className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}
										>
											Form 4 - Rent court possession
										</NavLink>
										<NavLink
											to="/dashboard/form-5-rent-court-filing"
											className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}
										>
											Form 5 - Application (Rent Court)
										</NavLink>
									</div>
								) : null}

								<button
									type="button"
									className="dashboard-submenu-group-title dashboard-submenu-group-toggle"
									onClick={() =>
										setServiceGroupsOpen((prev) => ({
											...prev,
											authority: !prev.authority,
										}))
									}
								>
									<span>Rent Authority</span>
									<Icon name="chevron" className={`dashboard-submenu-chevron ${serviceGroupsOpen.authority ? 'open' : ''}`} />
								</button>
								{serviceGroupsOpen.authority ? (
									<div className="dashboard-submenu-items">
										<NavLink
											to="/dashboard/form-6-rent-authority-filing"
											className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}
										>
											Form 6 - Application (Rent Authority)
										</NavLink>
									</div>
								) : null}

								<button
									type="button"
									className="dashboard-submenu-group-title dashboard-submenu-group-toggle"
									onClick={() =>
										setServiceGroupsOpen((prev) => ({
											...prev,
											appeals: !prev.appeals,
										}))
									}
								>
									<span>Appeals (Forms 7 / 8)</span>
									<Icon name="chevron" className={`dashboard-submenu-chevron ${serviceGroupsOpen.appeals ? 'open' : ''}`} />
								</button>
								{serviceGroupsOpen.appeals ? (
									<div className="dashboard-submenu-items">
										<NavLink
											to="/dashboard/form-7-rent-court-appeal"
											className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}
										>
											Form 7 - Appeal before Rent Court
										</NavLink>
										<NavLink
											to="/dashboard/form-8-rent-tribunal-appeal"
											className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}
										>
											Form 8 - Appeal before Rent Tribunal
										</NavLink>
									</div>
								) : null}
							</div>
						) : null}
					</>
				) : null}

				{user?.role !== 'tenant owner' && user?.role !== 'system_admin' ? (
					<>
						<NavLink
							to="/dashboard/status"
							className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}
							title="Application Status"
						>
							<Icon name="status" className="dashboard-link-icon" />
							{!sidebarCollapsed && <span className="dashboard-link-text">Application Status</span>}
						</NavLink>
						<NavLink
							to="/dashboard/admin/state"
							className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}
							title="State Management"
						>
							<Icon name="map" className="dashboard-link-icon" />
							{!sidebarCollapsed && <span className="dashboard-link-text">State Management</span>}
						</NavLink>
						<NavLink
							to="/dashboard/admin/district"
							className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}
							title="District Management"
						>
							<Icon name="building" className="dashboard-link-icon" />
							{!sidebarCollapsed && <span className="dashboard-link-text">District Management</span>}
						</NavLink>
						<a
							className={`dashboard-link dashboard-link-expandable ${userMenuOpen ? 'menu-open' : ''}`}
							href="#staff-user-menu"
							onClick={(e) => {
								e.preventDefault()
								if (sidebarCollapsed) {
									toggleSidebar()
									setUserMenuOpen(true)
								} else {
									setUserMenuOpen((prev) => !prev)
								}
							}}
							title="User Management"
						>
							<div className="dashboard-link-main">
								<Icon name="user" className="dashboard-link-icon" />
								{!sidebarCollapsed && <span className="dashboard-link-text">User Management</span>}
							</div>
							{!sidebarCollapsed && (
								<Icon name="chevron" className={`dashboard-link-chevron ${userMenuOpen ? 'open' : ''}`} />
							)}
						</a>
						{userMenuOpen && !sidebarCollapsed ? (
							<div className="dashboard-submenu">
								<NavLink
									to="/dashboard/admin/users?mode=office"
									className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}
								>
									Office user
								</NavLink>
								<NavLink
									to="/dashboard/admin/users?mode=tenant"
									className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}
								>
									User
								</NavLink>
							</div>
						) : null}
					</>
				) : null}

				{user?.role === 'system_admin' ? (
					<>
						<NavLink
							to="/dashboard/admin/state"
							className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}
							title="State Management"
						>
							<Icon name="map" className="dashboard-link-icon" />
							{!sidebarCollapsed && <span className="dashboard-link-text">State Management</span>}
						</NavLink>
						<NavLink
							to="/dashboard/admin/district"
							className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}
							title="District Management"
						>
							<Icon name="building" className="dashboard-link-icon" />
							{!sidebarCollapsed && <span className="dashboard-link-text">District Management</span>}
						</NavLink>
						<a
							className={`dashboard-link dashboard-link-expandable ${officeMenuOpen ? 'menu-open' : ''}`}
							href="#office-menu"
							onClick={(e) => {
								e.preventDefault()
								if (sidebarCollapsed) {
									toggleSidebar()
									setOfficeMenuOpen(true)
								} else {
									setOfficeMenuOpen((prev) => !prev)
								}
							}}
							title="Office Management"
						>
							<div className="dashboard-link-main">
								<Icon name="building" className="dashboard-link-icon" />
								{!sidebarCollapsed && <span className="dashboard-link-text">Office Management</span>}
							</div>
							{!sidebarCollapsed && (
								<Icon name="chevron" className={`dashboard-link-chevron ${officeMenuOpen ? 'open' : ''}`} />
							)}
						</a>
						{officeMenuOpen && !sidebarCollapsed ? (
							<div className="dashboard-submenu">
								<NavLink
									to="/dashboard/admin/office"
									className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}
								>
									Office
								</NavLink>
								<NavLink
									to="/dashboard/admin/designation"
									className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}
								>
									Designation
								</NavLink>
							</div>
						) : null}
						<NavLink
							to="/dashboard/admin/role"
							className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}
							title="Role Management"
						>
							<Icon name="settings" className="dashboard-link-icon" />
							{!sidebarCollapsed && <span className="dashboard-link-text">Role Management</span>}
						</NavLink>
						<a
							className={`dashboard-link dashboard-link-expandable ${userMenuOpen ? 'menu-open' : ''}`}
							href="#user-menu"
							onClick={(e) => {
								e.preventDefault()
								if (sidebarCollapsed) {
									toggleSidebar()
									setUserMenuOpen(true)
								} else {
									setUserMenuOpen((prev) => !prev)
								}
							}}
							title="User Management"
						>
							<div className="dashboard-link-main">
								<Icon name="user" className="dashboard-link-icon" />
								{!sidebarCollapsed && <span className="dashboard-link-text">User Management</span>}
							</div>
							{!sidebarCollapsed && (
								<Icon name="chevron" className={`dashboard-link-chevron ${userMenuOpen ? 'open' : ''}`} />
							)}
						</a>
						{userMenuOpen && !sidebarCollapsed ? (
							<div className="dashboard-submenu">
								<NavLink
									to="/dashboard/admin/users?mode=office"
									className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}
								>
									Office user
								</NavLink>
								<NavLink
									to="/dashboard/admin/users?mode=tenant"
									className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}
								>
									User
								</NavLink>
							</div>
						) : null}
						<NavLink
							to="/dashboard/admin/activity-log"
							className={({ isActive }) => `dashboard-link ${isActive ? 'active' : ''}`}
							title="User Activity Log"
						>
							<Icon name="activity" className="dashboard-link-icon" />
							{!sidebarCollapsed && <span className="dashboard-link-text">User Activity Log</span>}
						</NavLink>
					</>
				) : null}
			</nav>
		</aside>
	)
}

export default Sidebar
