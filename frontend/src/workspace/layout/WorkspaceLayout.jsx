import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import api from '../../api'
import ProfileCompletionModal from '../../components/dashboard/ProfileCompletionModal'
import useDashboardRouteLoader from '../../hooks/useDashboardRouteLoader'
import { ROLES } from '../../constants/roles'
import {
	isProfileComplete,
	PROFILE_REMINDER_DISMISSED_KEY,
} from '../../utils/profileCompleteness'
import WorkspaceRouteLoader from '../components/WorkspaceRouteLoader'
import WorkspaceSidebar from './WorkspaceSidebar'
import '../styles/workspace.css'

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
	const [profileIncomplete, setProfileIncomplete] = useState(false)
	const [reminderDismissed, setReminderDismissed] = useState(
		() => sessionStorage.getItem(PROFILE_REMINDER_DISMISSED_KEY) === '1'
	)

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

	return (
		<div className="ws-root">
			<div className="ws-shell">
				<WorkspaceSidebar user={user} onLogout={onLogout} />
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
