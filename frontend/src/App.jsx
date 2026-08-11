import './App.css'
import './styles/a11y-dark-mode.css'
import { useEffect, useState, lazy, Suspense } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import api from './api'
import { PROFILE_REMINDER_DISMISSED_KEY } from './utils/profileCompleteness'
import WorkspaceLayout from './workspace/layout/WorkspaceLayout'
import WorkspaceLegacyFrame from './workspace/pages/WorkspaceLegacyFrame'
import TenancyCertificate from './pages/dashboard/TenancyCertificate'
import WorkspaceServices from './workspace/pages/WorkspaceServices'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import Services from './pages/Services'
import Resources from './pages/Resources'
import Policies from './pages/Policies'
import Sitemap from './pages/Sitemap'
import PublicDashboard from './pages/PublicDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthSessionProvider } from './context/AuthSessionContext'
import PortalLoadingScreen from './components/PortalLoadingScreen'
import Ux4gTopbar from './components/a11y/Ux4gTopbar'
import {
	getMainContentTargetId,
	handleSkipLinkClick,
	isPublicMarketingPath,
} from './utils/skipNavigation'
import { useLanguage } from './i18n'
import tcpLogo from './assets/img/TCP logo.png'
import nicLogo from './assets/img/NIC.png'
import digitalIndiaLogo from './assets/img/digital-india.png'

/* Heavy dashboard pages — layout/shell stays eager so a11y + sidebar never unmount on nav */
const WorkspaceHome = lazy(() => import('./workspace/pages/WorkspaceHome'))
const WorkspaceProfile = lazy(() => import('./workspace/pages/WorkspaceProfile'))
const WorkspaceUinStatus = lazy(() => import('./workspace/pages/WorkspaceUinStatus'))
const ApplicationDetails = lazy(() => import('./pages/dashboard/ApplicationDetails'))
const FormPortal = lazy(() => import('./pages/dashboard/FormPortal'))
const DistrictManagement = lazy(() => import('./workspace/pages/admin/WorkspaceDistricts'))
const UserManagement = lazy(() => import('./pages/dashboard/admin/UserManagement'))
const ApplicationList = lazy(() => import('./pages/dashboard/admin/ApplicationList'))
const WorkspaceAdminApplicationDetails = lazy(
	() => import('./workspace/pages/admin/WorkspaceAdminApplicationDetails'),
)
const TenancyRecords = lazy(() => import('./pages/dashboard/admin/TenancyRecords'))
const UserDetail = lazy(() => import('./pages/UserDetail'))
const JoinApplication = lazy(() => import('./pages/JoinApplication'))
const Admin = lazy(() => import('./pages/Admin'))

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

function App() {
	const { t } = useLanguage()
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)
	const [portalEntering, setPortalEntering] = useState(false)
	const [loggingOut, setLoggingOut] = useState(false)
	const navigate = useNavigate()
	const [fontScale, setFontScale] = useState('normal')
	const [legacySlideImages, setLegacySlideImages] = useState(null)
	const [slideIndex, setSlideIndex] = useState(0)

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
	/* Marketing pages can paint while session checks; home/login/dashboard wait so logged-in reloads don't flash landing */
	const skipSessionBootLoader = loading && isPublicMarketingPath(location.pathname)
	/* Old marketing shell (carousel, topbar) — only on legacy public routes */
	const showLegacyPublicChrome =
		!user &&
		!usesLandingChrome &&
		!isDashboardRoute &&
		!loggingOut &&
		!isJoinEntry

	const slides = legacySlideImages
		? [
				{
					titleKey: 'carousel.slide1Title',
					subtitleKey: 'carousel.slide1Subtitle',
					image: legacySlideImages.banner,
				},
				{
					titleKey: 'carousel.slide2Title',
					subtitleKey: 'carousel.slide2Subtitle',
					image: legacySlideImages.welcome,
				},
				{
					titleKey: 'carousel.slide3Title',
					subtitleKey: 'carousel.slide3Subtitle',
					image: '/TCP-Images/TCP-Office2.jpg',
				},
				{
					titleKey: 'carousel.slide4Title',
					subtitleKey: 'carousel.slide4Subtitle',
					image: '/TCP-Images/TCP-Office3.jpg',
				},
			]
		: []

	useEffect(() => {
		if (!showLegacyPublicChrome) {
			setLegacySlideImages(null)
			return undefined
		}
		let cancelled = false
		Promise.all([
			import('./assets/img/banner.png'),
			import('./assets/img/img1.png'),
		]).then(([bannerMod, welcomeMod]) => {
			if (cancelled) return
			setLegacySlideImages({
				banner: bannerMod.default,
				welcome: welcomeMod.default,
			})
		})
		return () => {
			cancelled = true
		}
	}, [showLegacyPublicChrome])

	useEffect(() => {
		if (!showLegacyPublicChrome || slides.length === 0) return undefined
		const timer = setInterval(() => {
			setSlideIndex((prev) => (prev + 1) % slides.length)
		}, 5000)
		return () => clearInterval(timer)
	}, [showLegacyPublicChrome, slides.length])

	useEffect(() => {
		try {
			const savedScale = localStorage.getItem('a11y-font-scale')
			if (savedScale === 'normal' || savedScale === 'large' || savedScale === 'xlarge') {
				setFontScale(savedScale)
			}
		} catch {
			// Ignore localStorage access errors.
		}
	}, [])

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

	const handleLogout = async () => {
		setLoggingOut(true)
		try {
			await api.post('/api/logout')
		} catch {
			// Clear local session even if the request fails
		}
		sessionStorage.removeItem(PROFILE_REMINDER_DISMISSED_KEY)
		setUser(null)
		setPortalEntering(false)
		navigate('/login', { replace: true })
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

	useEffect(() => {
		if (loggingOut && isLandingHome) {
			setLoggingOut(false)
		}
	}, [loggingOut, isLandingHome])

	const handleUserLogin = (nextUser) => {
		sessionStorage.removeItem(PROFILE_REMINDER_DISMISSED_KEY)
		setPortalEntering(true)
		setUser(nextUser)
	}

	useEffect(() => {
		if (!portalEntering) return undefined
		const timer = setTimeout(() => setPortalEntering(false), 900)
		return () => clearTimeout(timer)
	}, [portalEntering, location.pathname])

	const showPortalBootLoader =
		(loading && !skipSessionBootLoader) || portalEntering || loggingOut

	useEffect(() => {
		const root = document.documentElement
		root.classList.toggle('portal-boot-loading', showPortalBootLoader)
		document.body.classList.toggle('portal-boot-loading', showPortalBootLoader)
		/* Reveal a11y chrome with the page — not from the CDN widget / alone first */
		if (showPortalBootLoader) {
			root.classList.remove('app-shell-ready')
		} else {
			root.classList.add('app-shell-ready')
		}
		return () => {
			root.classList.remove('portal-boot-loading')
			document.body.classList.remove('portal-boot-loading')
		}
	}, [showPortalBootLoader])

	if (showPortalBootLoader) {
		return (
			<PortalLoadingScreen
				overlay
				title={
					loggingOut
						? t('loading.signingOut')
						: portalEntering
							? t('loading.openingDashboard')
							: t('loading.loadingPortal')
				}
				subtitle={
					loggingOut
						? t('loading.signingOutSub')
						: portalEntering
							? t('loading.openingSub')
							: t('loading.sessionSub')
				}
			/>
		)
	}

	return (
		<AuthSessionProvider user={user} onLogout={handleLogout}>
		<div
			className={`page${usesLandingChrome || (!user && !isDashboardRoute) ? ' page-landing' : ''}${usesLandingChrome ? ' page-landing-home page-public-marketing' : ''}${user && isDashboardRoute ? ' page-dashboard' : ''}`}
		>
			<a
				className="skip-link"
				href={`#${mainContentTargetId}`}
				onClick={(e) => handleSkipLinkClick(e, mainContentTargetId)}
			>
				{t('a11y.skipToContent')}
			</a>
			{/* Official UX4G 3.0 accessibility / GoI utility topbar */}
			<Ux4gTopbar
				mainContentTargetId={mainContentTargetId}
				fontScale={fontScale}
				onIncreaseFont={increaseFontScale}
				onDecreaseFont={decreaseFontScale}
				onResetFont={() => setFontScale('normal')}
			/>

			{/* Header (emblem + directorate title) — public only; hidden after login */}
			{showLegacyPublicChrome ? (
				<header className="topbar">
					<div className="brand">
						<img className="emblem" src={tcpLogo} alt={t('gov.directorate')} />
						<div className="brand-text">
							<span className="brand-title">
								{t('gov.directorateShort')}
							</span>
							<span className="brand-subtitle">
								{t('gov.department')}
							</span>
						</div>
					</div>
					<div className="topbar-right-logo">
						<img src={digitalIndiaLogo} alt="Digital India" />
					</div>
				</header>
			) : null}

			{showLegacyPublicChrome ? <div className="landing-accent-stripe" aria-hidden /> : null}

			{/* Main navigation – rent-portal style on landing; hidden on dashboard */}
			{!usesLandingChrome && !isDashboardRoute && (
				<div className="globalnav">
					<div className="globalnav-inner">
						{!user ? (
							<span className="globalnav-portal-title"></span>
						) : null}
						<nav id="public-primary-nav" className={user ? 'nav-auth' : undefined}>
							{!user ? (
								<>
									<Link to="/">{t('nav.home')}</Link>
									<Link to="/about">{t('nav.about')}</Link>
									<Link to="/public-dashboard">{t('nav.publicDashboard')}</Link>
									<Link to="/#login">{t('nav.login')}</Link>
									<Link to="/#register">{t('nav.registration')}</Link>
									<div className="contact-link-with-logo">
										<Link to="/contact">{t('nav.contactUs')}</Link>
										<img className="contact-link-logo" src={nicLogo} alt="NIC" />
									</div>
								</>
							) : (
								<>
									<span className="topbar-welcome">{t('nav.welcome', { name: user.name })}</span>
									<div className="nav-actions">
										<button className="nav-link" type="button" onClick={handleLogout}>
											{t('nav.logout')}
										</button>
									</div>
								</>
							)}
						</nav>
					</div>
				</div>
			)}

			{showLegacyPublicChrome ? (
				<section className="carousel carousel--rent-banner" aria-label={t('carousel.aria')}>
					<div className="carousel-banner">
						{slides.map((slide, index) => (
							<div
								key={slide.titleKey}
								className={`carousel-banner-slide ${index === slideIndex ? 'is-active' : ''}`}
								aria-hidden={index !== slideIndex}
							>
								<div
									className="carousel-banner-bg"
									style={{ backgroundImage: `url(${slide.image})` }}
								/>
								<div className="carousel-banner-scrim" />
								<div className="carousel-banner-inner">
									<div className="carousel-banner-copy">
										<p className="carousel-eyebrow">{t('carousel.highlights')}</p>
										<h2>{t(slide.titleKey)}</h2>
										<p className="carousel-subtitle">{t(slide.subtitleKey)}</p>
										<div className="carousel-nav-row">
											<div className="carousel-dots" role="tablist">
												{slides.map((_, dotIndex) => (
													<button
														key={`dot-${dotIndex}`}
														type="button"
														className={`carousel-dot ${dotIndex === slideIndex ? 'active' : ''}`}
														onClick={() => setSlideIndex(dotIndex)}
														aria-label={t('carousel.goToSlide', { n: dotIndex + 1 })}
													/>
												))}
											</div>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</section>
			) : null}
			<main id="main-content">
				{/* fallback={null}: never show the branded boot screen on route chunks */}
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
						<Route
							path="/admin"
							element={
								<ProtectedRoute user={user} authLoading={loading}>
									<Admin user={user} />
								</ProtectedRoute>
							}
						/>
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
							<Route path="tenancy-certificate" element={<TenancyCertificate />} />
							<Route path="status" element={<WorkspaceUinStatus />} />
							<Route
								path="status/:type/:applicationNo"
								element={
									<WorkspaceLegacyFrame title="Application details" subtitle="View submission">
										<ApplicationDetails />
									</WorkspaceLegacyFrame>
								}
							/>
							<Route path="services" element={<WorkspaceServices />} />
							<Route
								path=":formType"
								element={
									<WorkspaceLegacyFrame title="Application form" subtitle="Complete and submit">
										<FormPortal />
									</WorkspaceLegacyFrame>
								}
							/>
							<Route
								path="admin/users"
								element={
									<WorkspaceLegacyFrame title="Users" subtitle="Staff and user management">
										<UserManagement user={user} />
									</WorkspaceLegacyFrame>
								}
							/>
							<Route
								path="admin/inbox"
								element={
									<WorkspaceLegacyFrame
										title={
											user?.role === 'valuer'
												? 'Valuation inbox'
												: 'Service Applications'
										}
										subtitle={
											user?.role === 'valuer'
												? 'Form I-B files assigned to you'
												: 'Verify and forward service applications for your office'
										}
									>
										<ApplicationList user={user} />
									</WorkspaceLegacyFrame>
								}
							/>
							<Route
								path="admin/applications"
								element={
									<WorkspaceLegacyFrame
										title="Service Applications"
										subtitle="Rent Authority, Court, and Tribunal forms"
									>
										<ApplicationList user={user} />
									</WorkspaceLegacyFrame>
								}
							/>
							<Route
								path="admin/applications/:applicationNo"
								element={<WorkspaceAdminApplicationDetails />}
							/>
							<Route
								path="admin/tenancy"
								element={
									<WorkspaceLegacyFrame
										title="Tenancy Applications"
										subtitle="UIN / tenancy certificate applications"
									>
										<TenancyRecords user={user} />
									</WorkspaceLegacyFrame>
								}
							/>
							<Route
								path="admin/tenancy/:applicationNo"
								element={<WorkspaceAdminApplicationDetails />}
							/>
							<Route
								path="admin/districts"
								element={<DistrictManagement />}
							/>
							<Route
								path="join"
								element={<JoinApplication user={user} />}
							/>
						</Route>
						<Route path="/join" element={<JoinEntryRedirect user={user} />} />
						<Route
							path="/users/:id"
							element={
								<ProtectedRoute user={user} authLoading={loading}>
									<UserDetail user={user} />
								</ProtectedRoute>
							}
						/>
					</Routes>
				</Suspense>
			</main>

			{/* Footer – hidden on dashboard */}
			{/* {!(user && location.pathname === '/dashboard') && (
				<footer className="footer">
					<div className="footer-content">
						<div>
							<h3>Quick Links</h3>
							<div className="footer-links">
								<Link to="/policies">Policies</Link>
								<Link to="/contact">Contact Us</Link>
								<Link to="/guidelines">Guidelines</Link>
								<Link to="/feedback">Feedback</Link>
								<Link to="/help-centre">Help Centre</Link>
								<Link to="/about">About Us</Link>
							</div>
						</div>
						<div className="footer-logos">
							<img src={nicLogo} alt="NIC logo" />
							<img src={digitalIndiaLogo} alt="Digital India logo" />
						</div>
					</div>
					<div className="footer-note">
						This website belongs to Department of{' '}
						<a href="#">Housing And Urban Affairs</a>,{' '}
						<a href="#">Ministry of Housing And Urban Affairs</a>,{' '}
						<a href="https://www.india.gov.in/">Govt. of India.</a>
					</div>
				</footer>
			)} */}

		</div>
		</AuthSessionProvider>
	)
}

export default App
