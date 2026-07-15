import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Icon } from '../../components/dashboard/Icons'
import { formatDisplayEmail, formatDisplayName } from '../../utils/formatters'
import { getRoleLabel } from '../../constants/roleLabels'
import { ROLES } from '../../constants/roles'
import api from '../../api'
import { getWorkspaceNavigation } from '../config/navigation'

function WorkspaceSidebar({
	user,
	onLogout,
	open = false,
	onClose,
	collapsed = false,
	onToggleCollapse,
}) {
	const navGroups = getWorkspaceNavigation(user)
	const [profiles, setProfiles] = useState([])
	const [isSwitching, setIsSwitching] = useState(false)

	useEffect(() => {
		api.get('/api/user-profiles')
			.then((res) => {
				if (res.data.profiles && res.data.profiles.length > 1) {
					setProfiles(res.data.profiles)
				}
			})
			.catch((err) => console.error('Failed to fetch user profiles:', err))
	}, [])

	const handleProfileSwitch = async (e) => {
		const targetId = e.target.value
		if (!targetId || targetId === String(user.id)) return
		setIsSwitching(true)
		try {
			await api.post('/api/switch-profile', { user_id: targetId })
			window.location.href = '/dashboard'
		} catch (err) {
			console.error(err)
			setIsSwitching(false)
		}
	}
	const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
	const photoUrl = user?.passport_photo_url
	const photoPath = user?.passport_photo_path || user?.user_passport_photo_path
	const avatarUrl = photoUrl
		? photoUrl
		: photoPath
			? `${apiBaseUrl}/storage/${photoPath}`
			: null

	const linkClass = ({ isActive }) => `ws-nav-link${isActive ? ' active' : ''}`

	const handleNavClick = () => {
		onClose?.()
	}

	return (
		<aside
			className={`ws-sidebar${open ? ' is-open' : ''}${collapsed ? ' is-collapsed' : ''}`}
			aria-label="Workspace navigation"
		>
			<div className="ws-sidebar-brand">
				<div className="ws-sidebar-brand-text">
					<div className="ws-sidebar-title">Tenancy Portal</div>
					<div className="ws-sidebar-subtitle">Govt. of Assam</div>
				</div>
				{onToggleCollapse ? (
					<button
						type="button"
						className="ws-sidebar-collapse-btn"
						aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
						aria-expanded={!collapsed}
						title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
						onClick={onToggleCollapse}
					>
						<Icon name={collapsed ? 'panelOpen' : 'panelClose'} className="ws-sidebar-collapse-icon" />
					</button>
				) : null}
				{onClose ? (
					<button
						type="button"
						className="ws-sidebar-close"
						aria-label="Close navigation menu"
						onClick={onClose}
					>
						×
					</button>
				) : null}
			</div>

			<nav id="workspace-primary-nav" className="ws-sidebar-nav" aria-label="Primary">
				{navGroups.map((group) => (
					<div key={group.section} className="ws-nav-section">
						{group.section !== 'Workspace' ? (
							<div className="ws-nav-section-label">{group.section}</div>
						) : null}
						{group.items.map((item) => (
							<NavLink
								key={item.to}
								to={item.to}
								end={item.end}
								className={linkClass}
								title={collapsed ? item.label : undefined}
								onClick={handleNavClick}
							>
								<Icon name={item.icon} className="ws-nav-link-icon" />
								<span className="ws-nav-link-label">{item.label}</span>
							</NavLink>
						))}
					</div>
				))}
			</nav>

			<div className="ws-sidebar-footer">
				<div className="ws-sidebar-user" title={collapsed ? formatDisplayName(user?.name) : undefined}>
					{avatarUrl ? (
						<img src={avatarUrl} alt="" className="ws-sidebar-user-photo" />
					) : (
						<span className="ws-sidebar-user-fallback" aria-hidden>
							<Icon name="user" />
						</span>
					)}
					<div className="ws-sidebar-user-copy">
						<div className="ws-sidebar-user-name">{formatDisplayName(user?.name)}</div>
						<div className="ws-sidebar-user-email">
							{formatDisplayEmail(user?.email)}
						</div>
					</div>
				</div>
				{profiles.length > 1 && (
					<div className="ws-sidebar-profile-switcher">
						<label htmlFor="ws-role-switcher" className="ws-sidebar-profile-label">
							Switch Role
						</label>
						<select
							id="ws-role-switcher"
							value={user.id}
							onChange={handleProfileSwitch}
							disabled={isSwitching}
							title={collapsed ? 'Switch role' : undefined}
						>
							{profiles.map(p => (
								<option key={p.id} value={p.id}>
									{p.role === ROLES.USER ? 'Citizen' : getRoleLabel(p.role)}
								</option>
							))}
						</select>
					</div>
				)}
				<button
					type="button"
					className="ws-sidebar-logout"
					onClick={onLogout}
					title={collapsed ? 'Sign out' : undefined}
				>
					<Icon name="logout" className="ws-sidebar-logout-icon" />
					<span className="ws-sidebar-logout-label">Sign out</span>
				</button>
			</div>
		</aside>
	)
}

export default WorkspaceSidebar
