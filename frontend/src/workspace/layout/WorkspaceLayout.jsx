import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import api from '../../api'
import ProfileCompletionModal from '../../components/dashboard/ProfileCompletionModal'
import { Icon } from '../../components/dashboard/Icons'
import useDashboardRouteLoader from '../../hooks/useDashboardRouteLoader'
import { ROLES } from '../../constants/roles'
import {
	isProfileComplete,
	PROFILE_REMINDER_DISMISSED_KEY,
} from '../../utils/profileCompleteness'
import { formatDisplayName } from '../../utils/formatters'
import WorkspaceRouteLoader from '../components/WorkspaceRouteLoader'
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
	const [profileIncomplete, setProfileIncomplete] = useState(false)
	const [reminderDismissed, setReminderDismissed] = useState(
		() => sessionStorage.getItem(PROFILE_REMINDER_DISMISSED_KEY) === '1'
	)

	const topbarName = formatDisplayName(user?.name)
	const unreadCount = notifications.filter((n) => n.unread).length

	// Close mobile drawer on route change
	useEffect(() => {
		setNavOpen(false)
		setNotifOpen(false)
	}, [location.pathname])

	// Escape closes drawer / notifications
	useEffect(() => {
		if (!navOpen && !notifOpen) return undefined
		const onKeyDown = (event) => {
			if (event.key === 'Escape') {
				setNavOpen(false)
				setNotifOpen(false)
			}
		}
		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [navOpen, notifOpen])

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
		if (user?.role !== ROLES.USER || reminderDismissed) return undefined
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
	}, [location.pathname, user?.role, reminderDismissed])

	const showProfileModal =
		user?.role === ROLES.USER &&
		profileIncomplete &&
		!reminderDismissed &&
		location.pathname !== '/dashboard/profile'

	const handleDismissProfileReminder = () => {
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
					onLogout={onLogout}
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
								aria-label={navOpen ? 'Close navigation menu' : 'Open navigation menu'}
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
								<span className="ws-topbar-title">Tenancy Portal</span>
							</div>
						</div>
						<div className="ws-topbar-right">
							<div className="ws-topbar-notif" ref={notifRef}>
								<button
									type="button"
									className={`ws-topbar-icon-btn${notifOpen ? ' is-open' : ''}`}
									aria-label={
										unreadCount
											? `Notifications, ${unreadCount} unread`
											: 'Notifications'
									}
									aria-expanded={notifOpen}
									aria-haspopup="true"
									onClick={() => setNotifOpen((open) => !open)}
								>
									<Icon name="bell" className="ws-topbar-icon" />
									{unreadCount > 0 ? (
										<span className="ws-topbar-notif-badge" aria-hidden>
											{unreadCount > 9 ? '9+' : unreadCount}
										</span>
									) : null}
								</button>
								{notifOpen ? (
									<div className="ws-topbar-notif-panel" role="menu" aria-label="Notifications">
										<div className="ws-topbar-notif-head">
											<strong>Notifications</strong>
											{unreadCount > 0 ? (
												<button
													type="button"
													className="ws-topbar-notif-mark"
													onClick={markAllNotificationsRead}
												>
													Mark all read
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
										<p className="ws-topbar-notif-foot">Demo notifications for preview</p>
									</div>
								) : null}
							</div>
							<span className="ws-topbar-user">
								<span className="ws-topbar-user-name">{topbarName}</span>
							</span>
							<button
								type="button"
								className="ws-topbar-icon-btn ws-topbar-logout"
								onClick={onLogout}
								aria-label="Sign out"
								title="Sign out"
							>
								<Icon name="logout" className="ws-topbar-icon" />
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
