import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Icon } from '../../components/dashboard/Icons'
import { formatDisplayEmail, formatDisplayName } from '../../utils/formatters'
import { getRoleLabel } from '../../constants/roleLabels'
import { ROLES } from '../../constants/roles'
import api from '../../api'
import { getWorkspaceNavigation } from '../config/navigation'

function WorkspaceSidebar({ user, onLogout }) {
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
				{profiles.length > 1 && (
					<div className="ws-sidebar-profile-switcher" style={{ padding: '0 16px 12px' }}>
						<label htmlFor="ws-role-switcher" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Switch Role</label>
						<select
							id="ws-role-switcher"
							value={user.id}
							onChange={handleProfileSwitch}
							disabled={isSwitching}
							style={{ width: '100%', padding: '6px', borderRadius: '4px', fontSize: '0.85rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
						>
							{profiles.map(p => (
								<option key={p.id} value={p.id}>
									{p.role === ROLES.USER ? 'Citizen' : getRoleLabel(p.role)}
								</option>
							))}
						</select>
					</div>
				)}
				<button type="button" className="ws-sidebar-logout" onClick={onLogout}>
					Sign out
				</button>
			</div>
		</aside>
	)
}

export default WorkspaceSidebar
