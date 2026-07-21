import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import api from '../../api'
import ProfileCompletionModal from '../../components/dashboard/ProfileCompletionModal'
import { Icon } from '../../components/dashboard/Icons'
import useDashboardRouteLoader from '../../hooks/useDashboardRouteLoader'
import { ROLES } from '../../constants/roles'
import { getRoleLabel } from '../../constants/roleLabels'
import {
	isProfileComplete,
	resolvePassportPhotoUrl,
	PROFILE_REMINDER_DISMISSED_KEY,
	PROFILE_REMINDER_SUPPRESSED_KEY,
} from '../../utils/profileCompleteness'
import { useLanguage } from '../../i18n'
import { formatDisplayName, formatDisplayEmail } from '../../utils/formatters'
import WorkspaceRouteLoader from '../components/WorkspaceRouteLoader'
import WorkspacePageSearch from '../components/WorkspacePageSearch'
import WorkspaceSidebar from './WorkspaceSidebar'
import '../styles/workspace.css'

const DEMO_NOTIFICATIONS = [
	{
		id: 1,
		title: 'Application received',
		body: 'Your UIN draft progress was saved successfully.',
		time: 'Just now',
		unread: true,
	},
	{
		id: 2,
		title: 'Document review',
		body: 'PAN card verification is pending with the Rent Authority.',
		time: '2 hours ago',
		unread: true,
	},
	{
		id: 3,
		title: 'Payment reminder',
		body: 'Complete the application fee to lodge your tenancy certificate.',
		time: 'Yesterday',
		unread: false,
	},
]

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
	const navigate = useNavigate()
	const { t } = useLanguage()
	const routeLoading = useDashboardRouteLoader(true)
	const loaderLabel = workspaceLoaderLabel(location.pathname)
	const [navOpen, setNavOpen] = useState(false)
	const [notifOpen, setNotifOpen] = useState(false)
	const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
		try {
			return localStorage.getItem('ws-sidebar-collapsed') === '1'
		} catch {
			return false
		}
	})
	const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS)
	const notifRef = useRef(null)
	const [profiles, setProfiles] = useState([])
	const [isSwitching, setIsSwitching] = useState(false)
	const [profilePickerOpen, setProfilePickerOpen] = useState(false)
	const [profileIncomplete, setProfileIncomplete] = useState(false)
	const [reminderDismissed, setReminderDismissed] = useState(
		() => sessionStorage.getItem(PROFILE_REMINDER_DISMISSED_KEY) === '1'
	)
	const [reminderSuppressed, setReminderSuppressed] = useState(
		() => localStorage.getItem(PROFILE_REMINDER_SUPPRESSED_KEY) === '1'
	)

	const topbarName = formatDisplayName(user?.name)
	const topbarAvatarUrl = resolvePassportPhotoUrl(user)
	const translateRole = (role) => {
		const key = `role.${role}`
		const translated = t(key)
		return translated === key ? getRoleLabel(role) : translated
	}
	const currentRoleLabel = translateRole(user?.role)
	const unreadCount = notifications.filter((n) => n.unread).length

	// Close mobile drawer / pickers on route change
	useEffect(() => {
		setNavOpen(false)
		setNotifOpen(false)
		setProfilePickerOpen(false)
	}, [location.pathname])

	useEffect(() => {
		api.get('/api/user-profiles')
			.then((res) => {
				if (res.data.profiles && res.data.profiles.length > 1) {
					setProfiles(res.data.profiles)
				} else {
					setProfiles([])
				}
			})
			.catch((err) => console.error('Failed to fetch user profiles:', err))
	}, [user?.id])

	const handleProfileSwitch = async (targetId) => {
		if (!targetId || String(targetId) === String(user.id) || isSwitching) return
		setIsSwitching(true)
		try {
			await api.post('/api/switch-profile', { user_id: targetId })
			window.location.href = '/dashboard'
		} catch (err) {
			console.error(err)
			setIsSwitching(false)
		}
	}

	// Escape closes drawer / notifications / profile picker
	useEffect(() => {
		if (!navOpen && !notifOpen && !profilePickerOpen) return undefined
		const onKeyDown = (event) => {
			if (event.key === 'Escape') {
				setNavOpen(false)
				setNotifOpen(false)
				setProfilePickerOpen(false)
			}
		}
		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [navOpen, notifOpen, profilePickerOpen])

	// Click outside closes notifications
	useEffect(() => {
		if (!notifOpen) return undefined
		const onPointerDown = (event) => {
			if (notifRef.current && !notifRef.current.contains(event.target)) {
				setNotifOpen(false)
			}
		}
		document.addEventListener('mousedown', onPointerDown)
		return () => document.removeEventListener('mousedown', onPointerDown)
	}, [notifOpen])

	// Lock body scroll while profile picker is open
	useEffect(() => {
		if (!profilePickerOpen) return undefined
		const prev = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = prev
		}
	}, [profilePickerOpen])

	// Check profile once per login — not on every page navigation
	useEffect(() => {
		setReminderDismissed(sessionStorage.getItem(PROFILE_REMINDER_DISMISSED_KEY) === '1')

		if (user?.role !== ROLES.USER) {
			setProfileIncomplete(false)
			return undefined
		}

		let active = true

		const checkProfile = async () => {
			try {
				const { data } = await api.get('/api/profile')
				if (!active) return
				setProfileIncomplete(!isProfileComplete(data?.user))
			} catch {
				if (active) setProfileIncomplete(false)
			}
		}

		checkProfile()
		return () => {
			active = false
		}
	}, [user?.id, user?.role])

	// After profile is saved, stop reminding without waiting for re-login
	useEffect(() => {
		if (user?.role !== ROLES.USER || reminderDismissed || reminderSuppressed) return undefined
		if (location.pathname === '/dashboard/profile') return undefined

		let active = true
		api.get('/api/profile').then(({ data }) => {
			if (!active) return
			setProfileIncomplete(!isProfileComplete(data?.user))
		}).catch(() => {
			if (active) setProfileIncomplete(false)
		})

		return () => {
			active = false
		}
	}, [location.pathname, user?.role, reminderDismissed, reminderSuppressed])

	const showProfileModal =
		user?.role === ROLES.USER &&
		profileIncomplete &&
		!reminderDismissed &&
		!reminderSuppressed &&
		location.pathname !== '/dashboard/profile'

	const handleDismissProfileReminder = ({ suppressPermanent = false } = {}) => {
		if (suppressPermanent) {
			localStorage.setItem(PROFILE_REMINDER_SUPPRESSED_KEY, '1')
			setReminderSuppressed(true)
			return
		}
		sessionStorage.setItem(PROFILE_REMINDER_DISMISSED_KEY, '1')
		setReminderDismissed(true)
	}

	const handleCompleteProfile = () => {
		navigate('/dashboard/profile')
	}

	const markAllNotificationsRead = () => {
		setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
	}

	const toggleSidebarCollapsed = () => {
		setSidebarCollapsed((prev) => {
			const next = !prev
			try {
				localStorage.setItem('ws-sidebar-collapsed', next ? '1' : '0')
			} catch {
				/* ignore */
			}
			return next
		})
	}

	return (
		<div
			className={`ws-root${navOpen ? ' is-nav-open' : ''}${sidebarCollapsed ? ' is-sidebar-collapsed' : ''}`}
		>
			<div className="ws-shell">
				<button
					type="button"
					className="ws-nav-backdrop"
					aria-label="Close navigation menu"
					tabIndex={navOpen ? 0 : -1}
					onClick={() => setNavOpen(false)}
				/>
				<WorkspaceSidebar
					user={user}
					open={navOpen}
					onClose={() => setNavOpen(false)}
					collapsed={sidebarCollapsed}
					onToggleCollapse={toggleSidebarCollapsed}
				/>
				<div className="ws-main-column">
					<header className="ws-topbar">
						<div className="ws-topbar-left">
							<button
								type="button"
								className="ws-mobile-menu-btn"
								aria-label={navOpen ? t('ws.nav.closeMenu') : t('ws.nav.openMenu')}
								aria-expanded={navOpen}
								aria-controls="workspace-primary-nav"
								onClick={() => setNavOpen((open) => !open)}
							>
								{navOpen ? (
									<span className="ws-mobile-menu-close" aria-hidden>×</span>
								) : (
									<Icon name="menu" className="ws-mobile-menu-icon" />
								)}
							</button>
							<div className="ws-topbar-brand">
								<span className="ws-topbar-logo" aria-hidden>ATS</span>
								<span className="ws-topbar-title">{t('ws.brand.short')}</span>
							</div>
						</div>
						<div className="ws-topbar-right">
							<div className="ws-topbar-notif" ref={notifRef}>
								<button
									type="button"
									className={`ws-topbar-btn ws-topbar-btn--icon${notifOpen ? ' is-open' : ''}`}
									aria-label={
										unreadCount
											? t('ws.top.notificationsUnread', { count: unreadCount })
											: t('ws.top.notifications')
									}
									aria-expanded={notifOpen}
									aria-haspopup="true"
									onClick={() => {
										setProfilePickerOpen(false)
										setNotifOpen((open) => !open)
									}}
								>
									<Icon name="bell" className="ws-topbar-btn-icon" />
									{unreadCount > 0 ? (
										<span className="ws-topbar-notif-badge" aria-hidden>
											{unreadCount > 9 ? '9+' : unreadCount}
										</span>
									) : null}
								</button>
								{notifOpen ? (
									<div className="ws-topbar-notif-panel" role="menu" aria-label={t('ws.top.notifications')}>
										<div className="ws-topbar-notif-head">
											<strong>{t('ws.top.notifications')}</strong>
											{unreadCount > 0 ? (
												<button
													type="button"
													className="ws-topbar-notif-mark"
													onClick={markAllNotificationsRead}
												>
													{t('ws.top.markAllRead')}
												</button>
											) : null}
										</div>
										<ul className="ws-topbar-notif-list">
											{notifications.map((item) => (
												<li
													key={item.id}
													className={`ws-topbar-notif-item${item.unread ? ' is-unread' : ''}`}
												>
													<div className="ws-topbar-notif-item-title">{item.title}</div>
													<p className="ws-topbar-notif-item-body">{item.body}</p>
													<span className="ws-topbar-notif-item-time">{item.time}</span>
												</li>
											))}
										</ul>
										<p className="ws-topbar-notif-foot">{t('ws.top.notifDemo')}</p>
									</div>
								) : null}
							</div>

							<WorkspacePageSearch user={user} />

							<button
								type="button"
								className={`ws-topbar-btn ws-topbar-btn--profile${profilePickerOpen ? ' is-open' : ''}`}
								aria-haspopup={profiles.length > 1 ? 'dialog' : undefined}
								aria-expanded={profiles.length > 1 ? profilePickerOpen : undefined}
								disabled={isSwitching}
								title={
									profiles.length > 1
										? t('ws.top.switchProfile')
										: t('ws.top.openProfile')
								}
								onClick={() => {
									setNotifOpen(false)
									if (profiles.length > 1) {
										setProfilePickerOpen(true)
									} else {
										navigate('/dashboard/profile')
									}
								}}
							>
								<span
									className={`ws-topbar-profile-avatar${topbarAvatarUrl ? ' has-photo' : ''}`}
									aria-hidden
								>
									{topbarAvatarUrl ? (
										<img
											src={topbarAvatarUrl}
											alt=""
											className="ws-topbar-profile-avatar-img"
										/>
									) : (
										(topbarName || 'U').charAt(0).toUpperCase()
									)}
								</span>
								<span className="ws-topbar-profile-text">
									<span className="ws-topbar-profile-name">{topbarName}</span>
									<span className="ws-topbar-profile-role">
										{currentRoleLabel}
										{profiles.length > 1 ? ` · ${t('ws.top.switch')}` : ''}
									</span>
								</span>
								{profiles.length > 1 ? (
									<Icon name="chevron" className="ws-topbar-profile-chevron" />
								) : null}
							</button>

							<button
								type="button"
								className="ws-topbar-btn ws-topbar-btn--logout"
								onClick={onLogout}
							>
								<Icon name="logout" className="ws-topbar-btn-icon" />
								<span>{t('ws.top.signOut')}</span>
							</button>
						</div>
					</header>
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

			{profilePickerOpen && profiles.length > 1 ? (
				<div
					className="ws-profile-picker-overlay"
					role="presentation"
					onClick={() => !isSwitching && setProfilePickerOpen(false)}
				>
					<div
						className="ws-profile-picker"
						role="dialog"
						aria-modal="true"
						aria-labelledby="ws-profile-picker-title"
						onClick={(e) => e.stopPropagation()}
					>
						<header className="ws-profile-picker-head">
							<div>
								<h2 id="ws-profile-picker-title" className="ws-profile-picker-title">
									{t('ws.picker.title')}
								</h2>
								<p className="ws-profile-picker-lead">
									{t('ws.picker.lead')}
								</p>
							</div>
							<button
								type="button"
								className="ws-profile-picker-close"
								aria-label={t('ws.picker.close')}
								disabled={isSwitching}
								onClick={() => setProfilePickerOpen(false)}
							>
								×
							</button>
						</header>

						<div className="ws-profile-picker-list" role="list">
							{profiles.map((profile) => {
								const isCurrent = String(profile.id) === String(user.id)
								const roleLabel = translateRole(profile.role)
								const displayName = formatDisplayName(profile.name)
								const initial = (displayName || 'U').charAt(0).toUpperCase()
								const avatarUrl = resolvePassportPhotoUrl(profile)
								const email = formatDisplayEmail(profile.email)
								const districtName =
									profile.district?.name ||
									profile.district_name ||
									null

								return (
									<button
										key={profile.id}
										type="button"
										role="listitem"
										className={`ws-profile-picker-card${isCurrent ? ' is-current' : ''}`}
										disabled={isSwitching || isCurrent}
										aria-current={isCurrent ? 'true' : undefined}
										onClick={() => handleProfileSwitch(profile.id)}
									>
										<span
											className={`ws-profile-picker-avatar${avatarUrl ? ' has-photo' : ''}`}
											aria-hidden
										>
											{avatarUrl ? (
												<img
													src={avatarUrl}
													alt=""
													className="ws-profile-picker-avatar-img"
												/>
											) : (
												initial
											)}
										</span>
										<span className="ws-profile-picker-copy">
											<span className="ws-profile-picker-name">{displayName}</span>
											<span className="ws-profile-picker-role">{roleLabel}</span>
											{email ? (
												<span className="ws-profile-picker-meta">{email}</span>
											) : null}
											{districtName ? (
												<span className="ws-profile-picker-meta">
													{districtName}
												</span>
											) : null}
										</span>
										{isCurrent ? (
											<span className="ws-profile-picker-badge">{t('ws.picker.current')}</span>
										) : (
											<span className="ws-profile-picker-action">
												{isSwitching ? t('ws.picker.switching') : t('ws.picker.use')}
											</span>
										)}
									</button>
								)
							})}
						</div>
					</div>
				</div>
			) : null}

			{user?.role === ROLES.USER ? (
				<ProfileCompletionModal
					open={showProfileModal}
					onComplete={handleCompleteProfile}
					onDismiss={handleDismissProfileReminder}
				/>
			) : null}
		</div>
	)
}

export default WorkspaceLayout
