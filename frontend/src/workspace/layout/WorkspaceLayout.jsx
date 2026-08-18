import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react'
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
	PROFILE_REMINDER_NOTIF_ID,
} from '../../utils/profileCompleteness'
import { useLanguage } from '../../i18n'
import { useToast } from '../../context/ToastContext'
import { formatDisplayName, formatDisplayEmail } from '../../utils/formatters'
import WorkspaceRouteLoader from '../components/WorkspaceRouteLoader'
import CitizenDashboardSkeleton from '../pages/user/CitizenDashboardSkeleton'
import WorkspacePageSearch from '../components/WorkspacePageSearch'
import WorkspaceSidebar from './WorkspaceSidebar'
import { useWorkspaceNotifications } from '../hooks/useWorkspaceNotifications'
import { prefetchTenancyGeoLists } from '../../utils/tenancyGeoCache'
import '../styles/workspace.css'
import '../../styles/service-forms.css'

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
	const { showToast } = useToast()
	const routeLoading = useDashboardRouteLoader(true)
	const loaderLabel = workspaceLoaderLabel(location.pathname)
	const isCitizenHome =
		user?.role === ROLES.USER &&
		(location.pathname === '/dashboard' || location.pathname === '/dashboard/')
	const pageFallback = isCitizenHome ? (
		<CitizenDashboardSkeleton showActions />
	) : (
		<WorkspaceRouteLoader label={loaderLabel} />
	)
	const [navOpen, setNavOpen] = useState(false)
	const [notifOpen, setNotifOpen] = useState(false)
	const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
		try {
			return localStorage.getItem('ws-sidebar-collapsed') === '1'
		} catch {
			return false
		}
	})
	const { notifications, loading: notificationsLoading, markAllRead, markOneRead } =
		useWorkspaceNotifications(user)
	const notifRef = useRef(null)
	const topbarRef = useRef(null)
	const [profiles, setProfiles] = useState([])
	const [isSwitching, setIsSwitching] = useState(false)
	const [profilePickerOpen, setProfilePickerOpen] = useState(false)
	const [profileIncomplete, setProfileIncomplete] = useState(false)
	const [profileNotifRead, setProfileNotifRead] = useState(false)
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
	const displayNotifications = useMemo(() => {
		if (user?.role !== ROLES.USER || !profileIncomplete) return notifications
		const reminder = {
			id: PROFILE_REMINDER_NOTIF_ID,
			title: t('ws.profile.notifTitle'),
			body: t('ws.profile.notifBody'),
			time: t('ws.profile.notifTime'),
			unread: !profileNotifRead,
			to: '/dashboard/profile',
		}
		return [reminder, ...notifications.filter((item) => item.id !== PROFILE_REMINDER_NOTIF_ID)]
	}, [user?.role, profileIncomplete, notifications, profileNotifRead, t])
	const unreadCount = displayNotifications.filter((n) => n.unread).length

	const syncTopbarPanels = useCallback(() => {
		const topbar = topbarRef.current
		if (!topbar) return
		const rect = topbar.getBoundingClientRect()
		topbar.style.setProperty('--ws-topbar-offset', `${topbar.offsetHeight}px`)
		topbar.style.setProperty('--ws-topbar-bottom', `${rect.bottom}px`)
	}, [])

	// Keep dropdown panels aligned below the topbar (accounts for accessibility bar above)
	useEffect(() => {
		const topbar = topbarRef.current
		if (!topbar) return undefined

		syncTopbarPanels()
		const observer = new ResizeObserver(syncTopbarPanels)
		observer.observe(topbar)
		window.addEventListener('resize', syncTopbarPanels)
		window.addEventListener('scroll', syncTopbarPanels, true)

		return () => {
			observer.disconnect()
			window.removeEventListener('resize', syncTopbarPanels)
			window.removeEventListener('scroll', syncTopbarPanels, true)
		}
	}, [syncTopbarPanels])

	/* Warm UIN apply district/office lists so Apply UIN opens without an API wait */
	useEffect(() => {
		prefetchTenancyGeoLists()
	}, [])

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
			.catch(() => {
				setProfiles([])
			})
	}, [user?.id])

	const handleProfileSwitch = async (targetId) => {
		if (!targetId || String(targetId) === String(user.id) || isSwitching) return
		setIsSwitching(true)
		try {
			await api.post('/api/switch-profile', { user_id: targetId })
			window.location.href = '/dashboard'
		} catch {
			showToast(t('ws.profile.switchError'), 'error')
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

	const handleDismissProfileReminder = useCallback(() => {
		sessionStorage.setItem(PROFILE_REMINDER_DISMISSED_KEY, '1')
		setReminderDismissed(true)
	}, [])

	const handleCompleteProfile = () => {
		handleDismissProfileReminder()
		navigate('/dashboard/profile')
	}

	const markAllNotificationsRead = () => {
		setProfileNotifRead(true)
		markAllRead()
	}

	const openNotification = (item) => {
		if (item.id === PROFILE_REMINDER_NOTIF_ID) setProfileNotifRead(true)
		markOneRead(item.id)
		setNotifOpen(false)
		if (item.to) navigate(item.to)
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
					<header className="ws-topbar" ref={topbarRef}>
						<div className="ws-topbar-primary">
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
							</div>
							<div className="ws-topbar-right">
								<div className="ws-topbar-search-row">
							<WorkspacePageSearch user={user} onPanelOpen={syncTopbarPanels} />
						</div>

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
											syncTopbarPanels()
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
												{notificationsLoading && displayNotifications.length === 0 ? (
													<li className="ws-topbar-notif-empty">{t('ws.top.notifLoading')}</li>
												) : null}
												{!notificationsLoading && displayNotifications.length === 0 ? (
													<li className="ws-topbar-notif-empty">{t('ws.top.notifEmpty')}</li>
												) : null}
												{displayNotifications.map((item) => (
													<li key={item.id}>
														<button
															type="button"
															className={`ws-topbar-notif-item${item.unread ? ' is-unread' : ''}`}
															onClick={() => openNotification(item)}
														>
															<div className="ws-topbar-notif-item-title">{item.title}</div>
															<p className="ws-topbar-notif-item-body">{item.body}</p>
															<span className="ws-topbar-notif-item-time">{item.time}</span>
														</button>
													</li>
												))}
											</ul>
											<p className="ws-topbar-notif-foot">{t('ws.top.notifFoot')}</p>
										</div>
									) : null}
								</div>

								<button
									type="button"
									className={`ws-topbar-btn ws-topbar-btn--profile${profilePickerOpen ? ' is-open' : ''}`}
									aria-label={`${topbarName}, ${currentRoleLabel}`}
									aria-haspopup={profiles.length > 1 ? 'dialog' : undefined}
									aria-expanded={profiles.length > 1 ? profilePickerOpen : undefined}
									disabled={isSwitching}
									title={
										profiles.length > 1
											? `${topbarName} — ${t('ws.top.switchProfile')}`
											: `${topbarName} — ${t('ws.top.openProfile')}`
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
									onClick={(event) => {
										event.preventDefault()
										setNotifOpen(false)
										setProfilePickerOpen(false)
										onLogout?.()
									}}
								>
									<Icon name="logout" className="ws-topbar-btn-icon" />
									<span>{t('ws.top.signOut')}</span>
								</button>
							</div>
						</div>
					</header>
					<div
						className="ws-main"
						id="dashboard-primary-content"
						tabIndex={-1}
						aria-label="Workspace content"
					>
						{routeLoading ? pageFallback : null}
						{/* Catch page-chunk suspend here so App Suspense cannot unmount sidebar / a11y chrome */}
						<Suspense fallback={pageFallback}>
							<Outlet context={{ user, onLogout, onUserUpdate }} />
						</Suspense>
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
