import { NavLink } from 'react-router-dom'
import { Icon } from '../../components/dashboard/Icons'
import { formatDisplayEmail, formatDisplayName } from '../../utils/formatters'
import { getWorkspaceNavigation } from '../config/navigation'

function WorkspaceSidebar({ user, onLogout }) {
	const navGroups = getWorkspaceNavigation(user)
	const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
	const photoUrl = user?.passport_photo_url
	const photoPath = user?.passport_photo_path || user?.user_passport_photo_path
	const avatarUrl = photoUrl
		? photoUrl
		: photoPath
			? `${apiBaseUrl}/storage/${photoPath}`
			: null

	const linkClass = ({ isActive }) => `ws-nav-link${isActive ? ' active' : ''}`

	return (
		<aside className="ws-sidebar" aria-label="Workspace navigation">
			<div className="ws-sidebar-brand">
				<div className="ws-sidebar-logo" aria-hidden>
					ATS
				</div>
				<div>
					<div className="ws-sidebar-title">Tenancy Portal</div>
					<div className="ws-sidebar-subtitle">Govt. of Assam</div>
				</div>
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
							>
								<Icon name={item.icon} className="ws-nav-link-icon" />
								{item.label}
							</NavLink>
						))}
					</div>
				))}
			</nav>

			<div className="ws-sidebar-footer">
				<div className="ws-sidebar-user">
					{avatarUrl ? (
						<img src={avatarUrl} alt="" className="ws-sidebar-user-photo" />
					) : (
						<span className="ws-sidebar-user-fallback" aria-hidden>
							<Icon name="user" />
						</span>
					)}
					<div>
						<div className="ws-sidebar-user-name">{formatDisplayName(user?.name)}</div>
						<div className="ws-sidebar-user-email">
							{formatDisplayEmail(user?.email)}
						</div>
					</div>
				</div>
				<button type="button" className="ws-sidebar-logout" onClick={onLogout}>
					Sign out
				</button>
			</div>
		</aside>
	)
}

export default WorkspaceSidebar
