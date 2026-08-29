import './App.css'
import './styles/a11y-dark-mode.css'
import { useEffect, useLayoutEffect, useRef, useState, lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import api from './api'
import { PROFILE_REMINDER_DISMISSED_KEY } from './utils/profileCompleteness'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import Services from './pages/Services'
import Resources from './pages/Resources'
import Policies from './pages/Policies'
import Sitemap from './pages/Sitemap'
import PublicDashboard from './pages/PublicDashboard'
import Feedback from './pages/Feedback'
import AccessibilityStatement from './pages/AccessibilityStatement'
import HelpCentre from './pages/HelpCentre'
import NotFound from './pages/NotFound'
import Forbidden from './pages/Forbidden'
import ProtectedRoute from './components/ProtectedRoute'
import RoleProtectedRoute from './components/RoleProtectedRoute'
import { AuthSessionProvider } from './context/AuthSessionContext'
import { AuthPanelNavigationProvider } from './context/AuthPanelNavigationContext'
import { ToastProvider } from './context/ToastContext'
import Ux4gTopbar from './components/a11y/Ux4gTopbar'
import LandingNav from './components/landing/LandingNav'
import {
	getMainContentTargetId,
	getNavTargetId,
	handleSkipLinkClick,
	isPublicMarketingPath,
} from './utils/skipNavigation'
import { useLanguage } from './i18n'
import { scrollToHashTarget } from './utils/scrollToHash'
import {
	CITIZEN_ROLES,
	INBOX_STAFF_ROLES,
	OFFICE_ADMIN_ROLES,
	SERVICE_APPLICATION_ROLES,
	SUPER_ADMIN_ROLES,
	TENANCY_STAFF_ROLES,
} from './constants/roles'

const WorkspaceLayout = lazy(() => import('./workspace/layout/WorkspaceLayout'))
const TenancyCertificate = lazy(() => import('./pages/dashboard/TenancyCertificate'))
const WorkspaceServices = lazy(() => import('./workspace/pages/WorkspaceServices'))
const WorkspaceHome = lazy(() => import('./workspace/pages/WorkspaceHome'))
const WorkspaceProfile = lazy(() => import('./workspace/pages/WorkspaceProfile'))
const WorkspaceUinStatus = lazy(() => import('./workspace/pages/WorkspaceUinStatus'))
const WorkspaceApplicationDetails = lazy(
	() => import('./workspace/pages/WorkspaceApplicationDetails'),
)
const WorkspaceFormPortal = lazy(() => import('./workspace/pages/WorkspaceFormPortal'))
const DistrictManagement = lazy(() => import('./workspace/pages/admin/WorkspaceDistricts'))

const WorkspaceOffices = lazy(() => import('./workspace/pages/admin/WorkspaceOffices'))
const WorkspaceRoles = lazy(() => import('./workspace/pages/admin/WorkspaceRoles'))
const WorkspaceDesignations = lazy(() => import('./workspace/pages/admin/WorkspaceDesignations'))
const WorkspaceActivityLog = lazy(() => import('./workspace/pages/admin/WorkspaceActivityLog'))
const WorkspaceUsers = lazy(() => import('./workspace/pages/admin/WorkspaceUsers'))
const WorkspaceUserDetail = lazy(() => import('./workspace/pages/admin/WorkspaceUserDetail'))
const WorkspaceServiceApplications = lazy(
	() => import('./workspace/pages/admin/WorkspaceServiceApplications'),
)
const WorkspaceAdminApplicationDetails = lazy(
	() => import('./workspace/pages/admin/WorkspaceAdminApplicationDetails'),
)
const WorkspaceTenancyRecords = lazy(
	() => import('./workspace/pages/admin/WorkspaceTenancyRecords'),
)
const JoinApplication = lazy(() => import('./pages/JoinApplication'))
const LegacyFormRedirect = lazy(() => import('./workspace/pages/LegacyFormRedirect'))

/** Invite links: logged-in users → join form; others → new login (no legacy carousel flash). */
function JoinEntryRedirect({ user }) {
	const location = useLocation()
	const joinTarget = `/dashboard/join${location.search}`
	if (user) {
		return <Navigate to={joinTarget} replace />
	}
	return (
		<Navigate
			to={{ pathname: '/login', search: location.search }}
			state={{ from: { pathname: '/dashboard/join', search: location.search } }}
			replace
		/>
	)
}

function UserDetailRedirect() {
	const { id } = useParams()
	return <Navigate to={`/dashboard/admin/users/${id}`} replace />
}

function ScrollToTop() {
	const { pathname, hash } = useLocation()

	useLayoutEffect(() => {
		if (hash) return undefined
		window.scrollTo(0, 0)
		document.documentElement.scrollTop = 0
		document.body.scrollTop = 0
		return undefined
	}, [pathname, hash])

	useEffect(() => {
		if (!hash) return undefined
		if (scrollToHashTarget(hash)) return undefined
		let attempts = 0
		const timer = window.setInterval(() => {
			attempts += 1
			if (scrollToHashTarget(hash) || attempts >= 25) {
				window.clearInterval(timer)
			}
		}, 40)
		return () => window.clearInterval(timer)
	}, [pathname, hash])

	return null
}

function App() {
	const { t } = useLanguage()
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)
	const navigate = useNavigate()
	const [fontScale, setFontScale] = useState(() => {
		// Prevent nav/pill reflow: apply saved font scale before first paint.
		if (typeof window === 'undefined') return 'normal'
		try {
			const savedScale = localStorage.getItem('a11y-font-scale')
			if (savedScale === 'normal' || savedScale === 'large' || savedScale === 'xlarge') return savedScale
			return 'normal'
		} catch {
			return 'normal'
		}
	})

	useEffect(() => {
		let active = true
		const loadUser = async () => {
			try {
				const { data } = await api.get('/api/user', { skipAuthRedirect: true })
				if (active) setUser(data.user)
			} catch {
				if (active) setUser(null)
			} finally {
				if (active) setLoading(false)
			}
		}
		loadUser()
		return () => {
			active = false
		}
	}, [])

	const location = useLocation()
	const fromPath = location.state?.from?.pathname || ''
	const fromSearch = location.state?.from?.search || location.search
	let finalTarget = '/dashboard'

	// Bulletproof persistent redirect
	if (location.search.includes('ref=')) {
		localStorage.setItem('pendingJoinRef', location.search)
	}

	const pendingRef = localStorage.getItem('pendingJoinRef')

	if (fromPath.includes('/join') || fromPath.includes('/dashboard/join')) {
		finalTarget = fromPath + fromSearch
	} else if (location.search.includes('ref=')) {
		finalTarget = `/dashboard/join${location.search}`
	} else if (pendingRef) {
		finalTarget = `/dashboard/join${pendingRef}`
	}

	// We only clear pendingRef when they actually land on the dashboard route
	if (user && location.pathname.startsWith('/dashboard/join')) {
		localStorage.removeItem('pendingJoinRef')
	}

	const isDashboardRoute = location.pathname.startsWith('/dashboard')
	const isJoinEntry = location.pathname === '/join'
	const isLandingHome =
		!user &&
		(location.pathname === '/' || location.pathname === '/login' || isJoinEntry)
	/* Keep landing chrome on marketing pages even after login (no legacy welcome strip). */
	const isPublicMarketingPage = isPublicMarketingPath(location.pathname)
	const usesLandingChrome = isLandingHome || isPublicMarketingPage
	const mainContentTargetId = getMainContentTargetId(location.pathname)
	const navTargetId = getNavTargetId(location.pathname)

	useEffect(() => {
		try {
			localStorage.setItem('a11y-font-scale', fontScale)
		} catch {
			// Ignore localStorage access errors.
		}
	}, [fontScale])

	useEffect(() => {
		const root = document.documentElement
		if (!root) return
		root.classList.remove('a11y-font-normal', 'a11y-font-large', 'a11y-font-xlarge')
		root.classList.add(`a11y-font-${fontScale}`)
		return () => {
			root.classList.remove('a11y-font-normal', 'a11y-font-large', 'a11y-font-xlarge')
		}
	}, [fontScale])

	const increaseFontScale = () => {
		setFontScale((prev) => {
			if (prev === 'normal') return 'large'
			if (prev === 'large') return 'xlarge'
			return 'xlarge'
		})
	}

	const decreaseFontScale = () => {
		setFontScale((prev) => {
			if (prev === 'xlarge') return 'large'
			if (prev === 'large') return 'normal'
			return 'normal'
		})
	}

	const logoutLock = useRef(false)

	const handleLogout = async () => {
		if (logoutLock.current) return
		logoutLock.current = true
		sessionStorage.removeItem(PROFILE_REMINDER_DISMISSED_KEY)
		setUser(null)
		navigate('/login', { replace: true })
		try {
			await api.post('/api/logout', null, { skipAuthRedirect: true })
		} catch {
			// Local session is already cleared
		}
	}

	useEffect(() => {
		const handleUnauthorized = () => {
			sessionStorage.removeItem(PROFILE_REMINDER_DISMISSED_KEY)
			setUser(null)
			const path = window.location.pathname || ''
			/* Stay put on public marketing / auth pages — a guest session probe must not bounce About → home */
			if (
				path === '/' ||
				path === '/login' ||
				path === '/join' ||
				path === '/register' ||
				isPublicMarketingPath(path)
			) {
				return
			}
			navigate('/login', { replace: true })
		}
		window.addEventListener('auth:unauthorized', handleUnauthorized)
		return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
	}, [navigate])

	const handleUserLogin = (nextUser) => {
		logoutLock.current = false
		sessionStorage.removeItem(PROFILE_REMINDER_DISMISSED_KEY)
		setUser(nextUser)
	}

	useEffect(() => {
		const root = document.documentElement
		root.classList.add('app-shell-ready')
		root.classList.remove('portal-boot-loading')
		document.body.classList.remove('portal-boot-loading')
	}, [])

	return (
		<AuthSessionProvider user={user} onLogout={handleLogout}>
		<AuthPanelNavigationProvider>
		<ToastProvider>
		<div
			className={`page${usesLandingChrome || (!user && !isDashboardRoute) ? ' page-landing' : ''}${usesLandingChrome ? ' page-landing-home page-public-marketing' : ''}${isPublicMarketingPage ? ' page-public-inner' : ''}${user && isDashboardRoute ? ' page-dashboard' : ''}`}
		>
			<nav className="skip-links" aria-label={t('a11y.skipLinks')}>
				<a
					className="skip-link"
					href={`#${mainContentTargetId}`}
					onClick={(e) => handleSkipLinkClick(e, mainContentTargetId)}
				>
					{t('a11y.skipToContent')}
				</a>
				<a
					className="skip-link"
					href={`#${navTargetId}`}
					onClick={(e) => handleSkipLinkClick(e, navTargetId)}
				>
					{t('a11y.skipToNav')}
				</a>
			</nav>
			{/* Official UX4G 3.0 accessibility / GoI utility topbar */}
			<Ux4gTopbar
				mainContentTargetId={mainContentTargetId}
				fontScale={fontScale}
				onIncreaseFont={increaseFontScale}
				onDecreaseFont={decreaseFontScale}
				onResetFont={() => setFontScale('normal')}
			/>
			{usesLandingChrome ? <LandingNav variant="static" /> : null}

			<main id="main-content">
				<ScrollToTop />
				<Suspense fallback={null}>
					<Routes>
						<Route
							path="/"
							element={
								user ? <Navigate to={finalTarget} replace /> : <Login onLogin={handleUserLogin} />
							}
						/>
						<Route
							path="/login"
							element={
								user ? <Navigate to={finalTarget} replace /> : <Login onLogin={handleUserLogin} />
							}
						/>
						<Route path="/register" element={<Navigate to="/login" replace />} />
						<Route path="/policies" element={<Policies />} />
						<Route path="/resources" element={<Resources />} />
						<Route path="/about" element={<About />} />
						<Route path="/services" element={<Services />} />
						<Route path="/public-dashboard" element={<PublicDashboard />} />
						<Route path="/contact" element={<Contact />} />
						<Route path="/sitemap" element={<Sitemap />} />
						<Route path="/feedback" element={<Feedback />} />
						<Route path="/accessibility" element={<AccessibilityStatement />} />
						<Route path="/help-centre" element={<HelpCentre />} />
						<Route path="/guidelines" element={<Navigate to="/help-centre" replace />} />
						<Route path="/403" element={<Forbidden />} />
						<Route path="/404" element={<NotFound />} />
						<Route path="/admin" element={<Navigate to="/dashboard" replace />} />
						<Route
							path="/dashboard"
							element={
								<ProtectedRoute user={user} authLoading={loading}>
									<WorkspaceLayout user={user} onLogout={handleLogout} onUserUpdate={setUser} />
								</ProtectedRoute>
							}
						>
							<Route index element={<WorkspaceHome />} />
							<Route path="profile" element={<WorkspaceProfile />} />

							<Route element={<RoleProtectedRoute roles={CITIZEN_ROLES} />}>
								<Route path="tenancy-certificate" element={<TenancyCertificate />} />
								<Route path="status" element={<WorkspaceUinStatus />} />
								<Route
									path="status/:type/:applicationNo"
									element={<WorkspaceApplicationDetails />}
								/>
								<Route path="services" element={<WorkspaceServices />} />
								<Route path="forms/:formType" element={<WorkspaceFormPortal />} />
								<Route path="join" element={<JoinApplication user={user} />} />
							</Route>

							<Route element={<RoleProtectedRoute roles={TENANCY_STAFF_ROLES} />}>
								<Route path="admin/tenancy" element={<WorkspaceTenancyRecords />} />
								<Route
									path="admin/tenancy/:applicationNo"
									element={<WorkspaceAdminApplicationDetails />}
								/>
							</Route>

							<Route element={<RoleProtectedRoute roles={INBOX_STAFF_ROLES} />}>
								<Route path="admin/inbox" element={<WorkspaceServiceApplications />} />
							</Route>

							<Route element={<RoleProtectedRoute roles={SERVICE_APPLICATION_ROLES} />}>
								<Route path="admin/applications" element={<WorkspaceServiceApplications />} />
								<Route
									path="admin/applications/:applicationNo"
									element={<WorkspaceAdminApplicationDetails />}
								/>
							</Route>

							<Route element={<RoleProtectedRoute roles={OFFICE_ADMIN_ROLES} />}>
								<Route path="admin/users" element={<WorkspaceUsers />} />
								<Route path="admin/users/:id" element={<WorkspaceUserDetail />} />
							</Route>

							<Route element={<RoleProtectedRoute roles={SUPER_ADMIN_ROLES} />}>
								<Route path="admin/districts" element={<DistrictManagement />} />

								<Route path="admin/offices" element={<WorkspaceOffices />} />
								<Route path="admin/roles" element={<WorkspaceRoles />} />
								<Route path="admin/designations" element={<WorkspaceDesignations />} />
								<Route path="admin/activity-log" element={<WorkspaceActivityLog />} />
							</Route>

							<Route path="admin" element={<Navigate to="/dashboard" replace />} />
							<Route path=":formType" element={<LegacyFormRedirect />} />
							<Route path="*" element={<Navigate to="/404" replace />} />
						</Route>
						<Route path="/join" element={<JoinEntryRedirect user={user} />} />
						<Route path="/users/:id" element={<UserDetailRedirect />} />
						<Route path="*" element={<Navigate to="/404" replace />} />
					</Routes>
				</Suspense>
			</main>
		</div>
		</ToastProvider>
		</AuthPanelNavigationProvider>
		</AuthSessionProvider>
	)
}

export default App
