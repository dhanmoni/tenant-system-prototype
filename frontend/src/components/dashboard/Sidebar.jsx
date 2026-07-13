import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { Icon } from './Icons'
import { tenantServiceGroups } from '../../data/tenantServices'
import { ROLES, ASSISTANT_ROLES, PRINCIPAL_ROLES, ADMIN_ROLES } from '../../constants/roles'
import { getRoleLabel } from '../../constants/roleLabels'
import { formatDisplayEmail, formatDisplayName } from '../../utils/formatters'
import api from '../../api'

const FLYOUT_CLOSE_DELAY_MS = 220

function TenantServicesFlyout({
	open,
	position,
	activeCategoryId,
	onCategoryEnter,
	onKeepOpen,
	onScheduleClose,
	onClose,
}) {
	const activeGroup =
		tenantServiceGroups.find((g) => g.id === activeCategoryId) || tenantServiceGroups[0]

	if (!open || !position) return null

	return createPortal(
		<div
			className="dashboard-services-flyout dashboard-services-flyout--minimal"
			style={{
				position: 'fixed',
				top: position.top,
				left: position.left,
				zIndex: 400,
			}}
			onMouseEnter={onKeepOpen}
			onMouseLeave={onScheduleClose}
			role="dialog"
			aria-label="Tenancy services"
		>
			<div className="dashboard-services-flyout-inner">
				<div className="dashboard-services-flyout-row">
					<ul className="dashboard-services-flyout-cats">
						{tenantServiceGroups.map((group) => (
							<li key={group.id}>
								<button
									type="button"
									className={`dashboard-services-flyout-cat${
										activeCategoryId === group.id ? ' is-active' : ''
									}`}
									onMouseEnter={() => onCategoryEnter(group.id)}
								>
									<span className="dashboard-services-flyout-cat-text">{group.title}</span>
									<span className="dashboard-services-flyout-cat-more" aria-hidden>
										›
									</span>
								</button>
							</li>
						))}
					</ul>
					<div className="dashboard-services-flyout-forms-col">
						<ul className="dashboard-services-flyout-form-list">
							{activeGroup.forms.map((form) => (
								<li key={form.to}>
									<NavLink
										to={form.to}
										className={({ isActive }) =>
											`dashboard-services-flyout-link${isActive ? ' active' : ''}`
										}
										onClick={onClose}
									>
										<span className="dashboard-services-flyout-link-stack">
											<span className="dashboard-services-flyout-link-name">
												{form.formName}
											</span>
											<span className="dashboard-services-flyout-link-line">
												{form.matter}
											</span>
											<span className="dashboard-services-flyout-link-rule">
												{form.rule}
											</span>
										</span>
									</NavLink>
								</li>
							))}
						</ul>
					</div>
				</div>
				<Link
					to="/dashboard/services"
					className="dashboard-services-flyout-all"
					onClick={onClose}
				>
					View all services
				</Link>
			</div>
		</div>,
		document.body
	)
}

function Sidebar({ user, onLogout }) {
	const location = useLocation()
	const servicesWrapRef = useRef(null)
	const closeTimerRef = useRef(null)

	const [flyoutOpen, setFlyoutOpen] = useState(false)
	const [flyoutPosition, setFlyoutPosition] = useState(null)
	const [activeCategoryId, setActiveCategoryId] = useState(tenantServiceGroups[0]?.id)
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

	const servicesNavActive =
		location.pathname === '/dashboard/services' ||
		location.pathname.startsWith('/dashboard/form-')

	const updateFlyoutPosition = useCallback(() => {
		const el = servicesWrapRef.current
		if (!el) return
		const rect = el.getBoundingClientRect()
		setFlyoutPosition({
			top: Math.max(8, rect.top),
			left: rect.right + 4,
		})
	}, [])

	const clearCloseTimer = useCallback(() => {
		if (closeTimerRef.current) {
			clearTimeout(closeTimerRef.current)
			closeTimerRef.current = null
		}
	}, [])

	const openFlyout = useCallback(() => {
		clearCloseTimer()
		const activeGroup = tenantServiceGroups.find((g) =>
			g.forms.some((f) => location.pathname === f.to)
		)
		if (activeGroup) setActiveCategoryId(activeGroup.id)
		updateFlyoutPosition()
		setFlyoutOpen(true)
	}, [clearCloseTimer, location.pathname, updateFlyoutPosition])

	const scheduleCloseFlyout = useCallback(() => {
		clearCloseTimer()
		closeTimerRef.current = setTimeout(() => setFlyoutOpen(false), FLYOUT_CLOSE_DELAY_MS)
	}, [clearCloseTimer])

	const closeFlyout = useCallback(() => {
		clearCloseTimer()
		setFlyoutOpen(false)
	}, [clearCloseTimer])

	useEffect(() => {
		if (!flyoutOpen) return undefined
		const onScrollOrResize = () => updateFlyoutPosition()
		const onKey = (e) => {
			if (e.key === 'Escape') closeFlyout()
		}
		window.addEventListener('scroll', onScrollOrResize, true)
		window.addEventListener('resize', onScrollOrResize)
		window.addEventListener('keydown', onKey)
		return () => {
			window.removeEventListener('scroll', onScrollOrResize, true)
			window.removeEventListener('resize', onScrollOrResize)
			window.removeEventListener('keydown', onKey)
		}
	}, [flyoutOpen, updateFlyoutPosition, closeFlyout])

	useEffect(() => () => clearCloseTimer(), [clearCloseTimer])

	const linkClass = ({ isActive }) => `dashboard-link${isActive ? ' active' : ''}`
	const isProfileRoute = location.pathname === '/dashboard/profile'
	const displayName = formatDisplayName(user?.name)
	const displayEmail = formatDisplayEmail(user?.email)
	const roleLabel =
		user?.role === ROLES.USER ? 'Citizen' : getRoleLabel(user?.role)

	return (
		<aside className="dashboard-menu" aria-label="Portal navigation">
			<div className="dashboard-menu-header">
				<div className="dashboard-menu-account-card">
					<div className="dashboard-menu-account-identity">
						{avatarUrl ? (
							<img
								src={avatarUrl}
								alt=""
								className="dashboard-menu-user-photo"
							/>
						) : (
							<span className="dashboard-menu-user-avatar-fallback" aria-hidden>
								<Icon name="user" className="dashboard-menu-user-icon" />
							</span>
						)}
						<div className="dashboard-menu-user-text">
							<span className="dashboard-menu-user-name">{displayName}</span>
							<span className="dashboard-menu-user-badge">{roleLabel}</span>
							{displayEmail ? (
								<span className="dashboard-menu-user-email">{displayEmail}</span>
							) : null}
						</div>
					</div>
				</div>
				<div className="dashboard-menu-account-actions" role="group" aria-label="Account actions">
					{profiles.length > 1 && (
						<div className="dashboard-menu-account-switcher" style={{ padding: '0 16px 8px' }}>
							<label htmlFor="role-switcher" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Switch Role</label>
							<select
								id="role-switcher"
								value={user.id}
								onChange={handleProfileSwitch}
								disabled={isSwitching}
								style={{ width: '100%', padding: '6px', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
							>
								{profiles.map(p => (
									<option key={p.id} value={p.id}>
										{p.role === ROLES.USER ? 'Citizen' : getRoleLabel(p.role)}
									</option>
								))}
							</select>
						</div>
					)}
					<NavLink
						to="/dashboard/profile"
						className={`dashboard-menu-account-btn${isProfileRoute ? ' active' : ''}`}
					>
						<Icon name="user" className="dashboard-menu-account-btn-icon" />
						Profile
					</NavLink>
					<button
						type="button"
						className="dashboard-menu-account-btn dashboard-menu-account-btn--logout"
						onClick={onLogout}
					>
						<Icon name="logout" className="dashboard-menu-account-btn-icon" />
						Logout
					</button>
				</div>
			</div>

			<nav className="dashboard-links">
				<NavLink to="/dashboard" end className={linkClass}>
					<Icon name="dashboard" className="dashboard-link-icon" />
					<span className="dashboard-link-text">Dashboard</span>
				</NavLink>

				{user?.role === ROLES.USER ? (
					<>
						<NavLink to="/dashboard/tenancy-certificate" className={linkClass}>
							<Icon name="documentPlus" className="dashboard-link-icon" />
							<span className="dashboard-link-text">Apply for UIN</span>
						</NavLink>

						<NavLink to="/dashboard/status" className={linkClass}>
							<Icon name="status" className="dashboard-link-icon" />
							<span className="dashboard-link-text">UIN Status</span>
						</NavLink>

						<div
							ref={servicesWrapRef}
							className={`dashboard-services-nav-wrap${flyoutOpen ? ' is-flyout-open' : ''}`}
							onMouseEnter={openFlyout}
							onMouseLeave={scheduleCloseFlyout}
							onFocus={openFlyout}
						>
							<NavLink
								to="/dashboard/services"
								className={({ isActive }) =>
									`dashboard-link${isActive || servicesNavActive ? ' active' : ''}`
								}
							>
								<Icon name="services" className="dashboard-link-icon" />
								<span className="dashboard-link-text">All services</span>
							</NavLink>
						</div>

						<TenantServicesFlyout
							open={flyoutOpen}
							position={flyoutPosition}
							activeCategoryId={activeCategoryId}
							onCategoryEnter={setActiveCategoryId}
							onKeepOpen={clearCloseTimer}
							onScheduleClose={scheduleCloseFlyout}
							onClose={closeFlyout}
						/>
					</>
				) : null}

				{user?.role !== ROLES.USER ? (
					<>
						{ADMIN_ROLES.includes(user.role) && (
							<NavLink
								to="/dashboard/admin/users"
								className={linkClass}
								title={
									user.role === ROLES.SUPER_ADMIN
										? 'User Management'
										: 'Staff Directory'
								}
							>
								<Icon name="users" className="dashboard-link-icon" />
								<span className="dashboard-link-text">
									{user.role === ROLES.SUPER_ADMIN
										? 'User Management'
										: 'Staff Directory'}
								</span>
							</NavLink>
						)}

						{PRINCIPAL_ROLES.includes(user.role) && (
							<NavLink to="/dashboard/admin/users" className={linkClass} title="Manage Assistants">
								<Icon name="users" className="dashboard-link-icon" />
								<span className="dashboard-link-text">Manage Assistants</span>
							</NavLink>
						)}

						{[...ASSISTANT_ROLES, ROLES.VALUER].includes(user.role) && (
							<NavLink
								to="/dashboard/admin/inbox"
								className={linkClass}
								title="Application Inbox"
							>
								<Icon name="list" className="dashboard-link-icon" />
								<span className="dashboard-link-text">Application Inbox</span>
							</NavLink>
						)}

						{[...PRINCIPAL_ROLES, ROLES.DISTRICT_ADMIN].includes(user.role) && (
							<NavLink
								to="/dashboard/admin/applications"
								className={linkClass}
								title="Service Applications"
							>
								<Icon name="services" className="dashboard-link-icon" />
								<span className="dashboard-link-text">Service Applications</span>
							</NavLink>
						)}

						{ADMIN_ROLES.includes(user.role) && (
							<NavLink
								to="/dashboard/admin/tenancy"
								className={linkClass}
								title="Tenancy Applications"
							>
								<Icon name="file" className="dashboard-link-icon" />
								<span className="dashboard-link-text">Tenancy Applications</span>
							</NavLink>
						)}
						{user.role === ROLES.DISTRICT_ADMIN && (
							<NavLink to="/dashboard/status" className={linkClass} title="UIN Status">
								<Icon name="status" className="dashboard-link-icon" />
								<span className="dashboard-link-text">UIN Status</span>
							</NavLink>
						)}

						{user.role === ROLES.SUPER_ADMIN && (
							<NavLink to="/dashboard/admin/districts" className={linkClass} title="Districts">
								<Icon name="map" className="dashboard-link-icon" />
								<span className="dashboard-link-text">Districts</span>
							</NavLink>
						)}
					</>
				) : null}
			</nav>
		</aside>
	)
}

export default Sidebar
