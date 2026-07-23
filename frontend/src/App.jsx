import './App.css'
import './styles/service-forms.css'
import './workspace/styles/workspace.css'
import { useEffect, useState } from 'react'
import bannerImage from './assets/img/banner.png'
import welcomeImage from './assets/img/img1.png'
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import api from './api'
import { PROFILE_REMINDER_DISMISSED_KEY } from './utils/profileCompleteness'
import {
	WorkspaceLayout,
	WorkspaceHome,
	WorkspaceProfile,
	WorkspaceLegacyFrame,
	WorkspaceServices,
	WorkspaceUinStatus,
} from './workspace'
import ApplicationDetails from './pages/dashboard/ApplicationDetails'
import TenancyCertificate from './pages/dashboard/TenancyCertificate'
import FormPortal from './pages/dashboard/FormPortal'
// import StateManagement from './pages/dashboard/admin/StateManagement'
import DistrictManagement from './pages/dashboard/admin/DistrictManagement'
import OfficeManagement from './pages/dashboard/admin/OfficeManagement'
import UserManagement from './pages/dashboard/admin/UserManagement'
import RoleManagement from './pages/dashboard/admin/RoleManagement'
import DesignationManagement from './pages/dashboard/admin/DesignationManagement'
import ActivityLog from './pages/dashboard/admin/ActivityLog'
import ApplicationList from './pages/dashboard/admin/ApplicationList'
import AdminApplicationDetailsPage from './pages/dashboard/admin/AdminApplicationDetailsPage'
import TenancyRecords from './pages/dashboard/admin/TenancyRecords'

import Login from './pages/Login'
import Register from './pages/Register'
import UserDetail from './pages/UserDetail'
import JoinApplication from './pages/JoinApplication'
import Policies from './pages/Policies'
import Contact from './pages/Contact'
import About from './pages/About'
import Resources from './pages/Resources'
import Services from './pages/Services'
import PublicDashboard from './pages/PublicDashboard'
import Sitemap from './pages/Sitemap'
import Admin from './pages/Admin'
import ProtectedRoute from './components/ProtectedRoute'

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
import PortalLoadingScreen from './components/PortalLoadingScreen'
import {
	getMainContentTargetId,
	handleSkipLinkClick,
	isPublicMarketingPath,
} from './utils/skipNavigation'
import { useLanguage } from './i18n'
import tcpLogo from './assets/img/TCP logo.png'
import nicLogo from './assets/img/NIC.png'
import digitalIndiaLogo from './assets/img/digital-india.png'

function App() {
	const { language, setLanguage, t } = useLanguage()
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)
	const [portalEntering, setPortalEntering] = useState(false)
	const [loggingOut, setLoggingOut] = useState(false)
	const navigate = useNavigate()
	const [fontScale, setFontScale] = useState('normal')
	const slides = [
		{
			titleKey: 'carousel.slide1Title',
			subtitleKey: 'carousel.slide1Subtitle',
			image: bannerImage,
		},
		{
			titleKey: 'carousel.slide2Title',
			subtitleKey: 'carousel.slide2Subtitle',
			image: welcomeImage,
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
	const [slideIndex, setSlideIndex] = useState(0)

	useEffect(() => {
		let active = true
		const loadUser = async () => {
			try {
				const { data } = await api.get('/api/user')
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

	useEffect(() => {
		if (!slides.length) return undefined
		const timer = setInterval(() => {
			setSlideIndex((prev) => (prev + 1) % slides.length)
		}, 5000)
		return () => clearInterval(timer)
	}, [slides.length])

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
	const isPublicMarketingPage = !user && isPublicMarketingPath(location.pathname)
	const usesLandingChrome = isLandingHome || isPublicMarketingPage
	const mainContentTargetId = getMainContentTargetId(location.pathname)
	/* Show homepage immediately on reload — session check runs in background */
	const skipSessionBootLoader =
		loading &&
		(location.pathname === '/' ||
			location.pathname === '/login' ||
			isJoinEntry ||
			isPublicMarketingPath(location.pathname))
	/* Old marketing shell (carousel, topbar) — only on legacy public routes */
	const showLegacyPublicChrome =
		!user &&
		!usesLandingChrome &&
		!isDashboardRoute &&
		!loggingOut &&
		!isJoinEntry

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

	if ((loading && !skipSessionBootLoader) || portalEntering || loggingOut) {
		return (
			<PortalLoadingScreen
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
		<div
			className={`page${!user && !isDashboardRoute ? ' page-landing' : ''}${usesLandingChrome ? ' page-landing-home page-public-marketing' : ''}${user && isDashboardRoute ? ' page-dashboard' : ''}`}
		>
			<a
				className="skip-link"
				href={`#${mainContentTargetId}`}
				onClick={(e) => handleSkipLinkClick(e, mainContentTargetId)}
			>
				{t('a11y.skipToContent')}
			</a>
			{/* Accessibility utility strip — india.gov.in style (skip, font size, language) */}
			<div id="accessibility-bar" className="accessibility-bar">
				<div className="accessibility-bar-inner">
					<div className="accessibility-gov">
						<img className="accessibility-emblem" src={tcpLogo} alt="" aria-hidden />
						<div className="accessibility-gov-text">
							<p className="accessibility-gov-line">
								<span>{t('gov.assam')}</span>
							</p>
							<p className="accessibility-ministry">
								{t('gov.housing')}
							</p>
							<p className="accessibility-directorate">
								{t('gov.directorate')}
							</p>
						</div>
					</div>
					<div className="accessibility-toolbar" role="toolbar" aria-label={t('a11y.options')}>
						<a
							className="accessibility-toolbar-link"
							href={`#${mainContentTargetId}`}
							onClick={(e) => handleSkipLinkClick(e, mainContentTargetId)}
						>
							{t('a11y.skipToMain')}
						</a>
						<span className="accessibility-toolbar-divider" aria-hidden />
						<div className="accessibility-toolbar-group" role="group" aria-label={t('a11y.fontSize')}>
							<span className="accessibility-toolbar-label">{t('a11y.fontSize')}</span>
							<div className="accessibility-font-tools">
								<button
									type="button"
									className="accessibility-toolbar-btn accessibility-toolbar-btn--font"
									onClick={increaseFontScale}
									disabled={fontScale === 'xlarge'}
									title={t('a11y.increaseText')}
									aria-label={t('a11y.increaseText')}
								>
									A+
								</button>
								<button
									type="button"
									className={`accessibility-toolbar-btn accessibility-toolbar-btn--font${fontScale === 'normal' ? ' is-active' : ''}`}
									onClick={() => setFontScale('normal')}
									title={t('a11y.resetText')}
									aria-label={t('a11y.resetText')}
								>
									A
								</button>
								<button
									type="button"
									className="accessibility-toolbar-btn accessibility-toolbar-btn--font"
									onClick={decreaseFontScale}
									disabled={fontScale === 'normal'}
									title={t('a11y.decreaseText')}
									aria-label={t('a11y.decreaseText')}
								>
									A-
								</button>
							</div>
						</div>
						<span className="accessibility-toolbar-divider" aria-hidden />
						<div className="accessibility-toolbar-group" role="group" aria-label={t('a11y.language')}>
							<span className="accessibility-toolbar-label">{t('a11y.language')}</span>
							<div className="accessibility-lang-tools">
								<button
									type="button"
									className={`accessibility-toolbar-btn${language === 'en' ? ' is-active' : ''}`}
									onClick={() => setLanguage('en')}
									aria-pressed={language === 'en'}
									aria-label={t('a11y.english')}
									title={t('a11y.english')}
								>
									EN
								</button>
								<button
									type="button"
									className={`accessibility-toolbar-btn${language === 'as' ? ' is-active' : ''}`}
									onClick={() => setLanguage('as')}
									aria-pressed={language === 'as'}
									aria-label={t('a11y.assamese')}
									title={t('a11y.assamese')}
								>
									অসমীয়া
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

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
							<ProtectedRoute user={user}>
								<Admin user={user} />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/dashboard"
						element={
							<ProtectedRoute user={user}>
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
								<WorkspaceLegacyFrame title="Application inbox" subtitle="Verify and forward service applications">
									<ApplicationList user={user} />
								</WorkspaceLegacyFrame>
							}
						/>
						<Route
							path="admin/applications"
							element={
								<WorkspaceLegacyFrame title="Service applications" subtitle="Rent Authority, Court, and Tribunal forms">
									<ApplicationList user={user} />
								</WorkspaceLegacyFrame>
							}
						/>
						<Route
							path="admin/applications/:applicationNo"
							element={<AdminApplicationDetailsPage />}
						/>
						<Route
							path="admin/tenancy"
							element={
								<WorkspaceLegacyFrame title="Tenancy applications" subtitle="UIN applications">
									<TenancyRecords user={user} />
								</WorkspaceLegacyFrame>
							}
						/>
						<Route
							path="admin/tenancy/:applicationNo"
							element={<AdminApplicationDetailsPage />}
						/>
						<Route
							path="admin/districts"
							element={
								<WorkspaceLegacyFrame title="Districts" subtitle="Manage district master data">
									<DistrictManagement user={user} />
								</WorkspaceLegacyFrame>
							}
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
							<ProtectedRoute user={user}>
								<UserDetail user={user} />
							</ProtectedRoute>
						}
					/>
				</Routes>
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
	)
}

export default App
