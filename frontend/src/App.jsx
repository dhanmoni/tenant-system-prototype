import './App.css'
import './workspace/styles/workspace.css'
import { useEffect, useState } from 'react'
import bannerImage from './assets/img/banner.png'
import welcomeImage from './assets/img/img1.png'
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import api from './api'
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
import AdminApplicationDetails from './pages/dashboard/admin/AdminApplicationDetails'
import TenancyRecords from './pages/dashboard/admin/TenancyRecords'

import Login from './pages/Login'
import Register from './pages/Register'
import UserDetail from './pages/UserDetail'
import JoinApplication from './pages/JoinApplication'
import Policies from './pages/Policies'
import Contact from './pages/Contact'
import About from './pages/About'
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
import AccessibilityWidget from './components/landing/AccessibilityWidget'
import PortalLoadingScreen from './components/PortalLoadingScreen'
import { LANDING_A11Y_EVENT } from './utils/landingA11y'
import {
	getMainContentTargetId,
	handleSkipLinkClick,
	isPublicMarketingPath,
} from './utils/skipNavigation'
import emblem from './assets/img/emblem-dark.png'
import nicLogo from './assets/img/NIC.png'
import digitalIndiaLogo from './assets/img/digital-india.png'

function App() {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)
	const [portalEntering, setPortalEntering] = useState(false)
	const [loggingOut, setLoggingOut] = useState(false)
	const navigate = useNavigate()
	const [fontScale, setFontScale] = useState('normal')
	const [highContrast, setHighContrast] = useState(false)
	const [highlightLinks, setHighlightLinks] = useState(false)
	const [language, setLanguage] = useState('en')
	const slides = [
		{
			title: 'Housing & tenancy in one place',
			subtitle:
				'Register tenancies, manage landlord–tenant records, and access department services with a modern, citizen-friendly portal.',
			image: bannerImage,
		},
		{
			title: 'Digital Tenancy Registration',
			subtitle:
				'Apply for tenancy certificates online, track your application status in real-time, and download digitally signed documents — all from one portal.',
			image: welcomeImage,
		},
		{
			title: 'Property & tenancy records',
			subtitle:
				'Register properties, manage landlord–tenant records, and stay aligned with housing department guidelines — in one place.',
			image: '/TCP-Images/TCP-Office2.jpg',
		},
		{
			title: 'Transparent, accessible services',
			subtitle:
				'Citizen-centric workflows, status tracking, and digital records built for tenants, owners, and public authorities.',
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
	const isDashboardRoute = location.pathname.startsWith('/dashboard')
	const isJoinEntry = location.pathname === '/join'
	const isLandingHome =
		!user &&
		(location.pathname === '/' || location.pathname === '/login' || isJoinEntry)
	const isPublicMarketingPage = !user && isPublicMarketingPath(location.pathname)
	const usesLandingChrome = isLandingHome || isPublicMarketingPage
	const mainContentTargetId = getMainContentTargetId(location.pathname)
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
			const savedContrast = localStorage.getItem('a11y-high-contrast')
			if (savedScale === 'normal' || savedScale === 'large' || savedScale === 'xlarge') {
				setFontScale(savedScale)
			}
			if (savedContrast === '1') {
				setHighContrast(true)
			}
		} catch {
			// Ignore localStorage access errors.
		}
	}, [])

	useEffect(() => {
		try {
			localStorage.setItem('a11y-font-scale', fontScale)
			localStorage.setItem('a11y-high-contrast', highContrast ? '1' : '0')
		} catch {
			// Ignore localStorage access errors.
		}
	}, [fontScale, highContrast])

	useEffect(() => {
		const root = document.documentElement
		if (!root) return
		const nextSize = fontScale === 'xlarge' ? '20px' : fontScale === 'large' ? '18px' : '16px'
		root.style.fontSize = nextSize
		return () => {
			root.style.fontSize = ''
		}
	}, [fontScale])

	useEffect(() => {
		const body = document.body
		if (!body) return
		body.classList.toggle('a11y-contrast-high', highContrast)
		return () => {
			body.classList.remove('a11y-contrast-high')
		}
	}, [highContrast])

	useEffect(() => {
		const body = document.body
		if (!body) return
		body.classList.toggle('a11y-highlight-links', highlightLinks)
		return () => {
			body.classList.remove('a11y-highlight-links')
		}
	}, [highlightLinks])

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

	useEffect(() => {
		const onLandingA11y = (e) => {
			const action = e.detail
			if (action === 'increase') increaseFontScale()
			else if (action === 'decrease') decreaseFontScale()
			else if (action === 'reset') setFontScale('normal')
			else if (action === 'contrast') setHighContrast((prev) => !prev)
			else if (action === 'lang-en') setLanguage('en')
			else if (action === 'lang-as') setLanguage('as')
		}
		window.addEventListener(LANDING_A11Y_EVENT, onLandingA11y)
		return () => window.removeEventListener(LANDING_A11Y_EVENT, onLandingA11y)
	}, [])

	const handleLogout = async () => {
		setLoggingOut(true)
		try {
			await api.post('/api/logout')
		} catch {
			// Clear local session even if the request fails
		}
		setUser(null)
		setPortalEntering(false)
		navigate('/', { replace: true })
	}

	useEffect(() => {
		if (loggingOut && isLandingHome) {
			setLoggingOut(false)
		}
	}, [loggingOut, isLandingHome])

	const handleUserLogin = (nextUser) => {
		setPortalEntering(true)
		setUser(nextUser)
	}

	useEffect(() => {
		if (!portalEntering) return undefined
		const timer = setTimeout(() => setPortalEntering(false), 900)
		return () => clearTimeout(timer)
	}, [portalEntering, location.pathname])

	if (loading || portalEntering || loggingOut) {
		return (
			<PortalLoadingScreen
				title={
					loggingOut
						? 'Signing out'
						: portalEntering
							? 'Opening your dashboard'
							: 'Loading portal'
				}
				subtitle={
					loggingOut
						? 'Please wait while we return you to the home page.'
						: portalEntering
							? 'Please wait while we load your workspace.'
							: 'Please wait while we check your session.'
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
				Skip to content
			</a>
			{/* Accessibility Bar — hidden on landing home mobile (see LandingNav utility bar) */}
			<div
				id="accessibility-bar"
				className={`accessibility-bar${usesLandingChrome ? ' accessibility-bar--landing-mobile-hidden' : ''}`}
			>
				<div className="accessibility-bar-inner">
					<div className="accessibility-gov">
						<img className="accessibility-emblem" src={emblem} alt="" aria-hidden />
						<div className="accessibility-gov-text">
							<p className="accessibility-gov-line">
								<span>Government Of Assam</span>
							</p>
							<p className="accessibility-ministry">
								Housing &amp; Urban Affairs
							</p>
							<p className="accessibility-directorate">
								Directorate of Town and Country Planning
							</p>
						</div>
					</div>
					<div className="accessibility-toolbar" role="toolbar" aria-label="Accessibility options">
						<a
							className="accessibility-toolbar-link"
							href={`#${mainContentTargetId}`}
							onClick={(e) => handleSkipLinkClick(e, mainContentTargetId)}
						>
							Skip to content
						</a>
						<span className="accessibility-toolbar-divider" aria-hidden />
						<div className="accessibility-font-tools" role="group" aria-label="Font size">
							<button
								type="button"
								className="accessibility-toolbar-btn"
								onClick={increaseFontScale}
								title="Increase text size"
								aria-label="Increase text size"
							>
								A+
							</button>
							<button
								type="button"
								className={`accessibility-toolbar-btn${fontScale === 'normal' ? ' is-active' : ''}`}
								onClick={() => setFontScale('normal')}
								title="Reset text size"
								aria-label="Reset text size"
							>
								A
							</button>
							<button
								type="button"
								className="accessibility-toolbar-btn"
								onClick={decreaseFontScale}
								title="Decrease text size"
								aria-label="Decrease text size"
							>
								A-
							</button>
						</div>
						<span className="accessibility-toolbar-divider" aria-hidden />
						<div
							className="accessibility-lang-tools"
							role="group"
							aria-label="Language — English active; Assamese coming soon"
						>
							<button
								type="button"
								className={`accessibility-toolbar-btn${language === 'en' ? ' is-active' : ''}`}
								onClick={() => setLanguage('en')}
								aria-pressed={language === 'en'}
								aria-label="English"
								title="English"
							>
								EN
							</button>
							<button
								type="button"
								className="accessibility-toolbar-btn accessibility-toolbar-btn--soon"
								disabled
								aria-disabled="true"
								aria-label="Assamese — coming soon"
								title="Assamese translation coming soon (GIGW bilingual requirement)"
							>
								অসমীয়া
							</button>
						</div>
						<span className="accessibility-toolbar-divider" aria-hidden />
						<button
							type="button"
							className={`accessibility-toolbar-btn accessibility-toolbar-btn--text${highContrast ? ' is-active' : ''}`}
							onClick={() => setHighContrast((prev) => !prev)}
							title="Toggle high contrast"
							aria-pressed={highContrast}
						>
							High contrast
						</button>
					</div>
				</div>
			</div>

			{/* Header (emblem + directorate title) — public only; hidden after login */}
			{showLegacyPublicChrome ? (
				<header className="topbar">
					<div className="brand">
						<img className="emblem" src={emblem} alt="Indian national emblem" />
						<div className="brand-text">
							<span className="brand-title">
								DIRECTORATE OF TOWN AND COUNTRY PLANNING
							</span>
							<span className="brand-subtitle">
								Department of Housing And Urban Affairs
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
									<Link to="/">Home</Link>
									<Link to="/about">About us</Link>
									<Link to="/public-dashboard">Public dashboard</Link>
									<Link to="/#login">Login</Link>
									<Link to="/#register">Registration</Link>
									<div className="contact-link-with-logo">
										<Link to="/contact">Contact Us</Link>
										<img className="contact-link-logo" src={nicLogo} alt="NIC" />
									</div>
								</>
							) : (
								<>
									<span className="topbar-welcome">Welcome {user.name}</span>
									<div className="nav-actions">
										<button className="nav-link" type="button" onClick={handleLogout}>
											Logout
										</button>
									</div>
								</>
							)}
						</nav>
					</div>
				</div>
			)}

			{showLegacyPublicChrome ? (
				<section className="carousel carousel--rent-banner" aria-label="Tenant and owner highlights">
					<div className="carousel-banner">
						{slides.map((slide, index) => (
							<div
								key={slide.title}
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
										<p className="carousel-eyebrow">Highlights</p>
										<h2>{slide.title}</h2>
										<p className="carousel-subtitle">{slide.subtitle}</p>
										<div className="carousel-nav-row">
											<div className="carousel-dots" role="tablist">
												{slides.map((_, dotIndex) => (
													<button
														key={`dot-${dotIndex}`}
														type="button"
														className={`carousel-dot ${dotIndex === slideIndex ? 'active' : ''}`}
														onClick={() => setSlideIndex(dotIndex)}
														aria-label={`Go to slide ${dotIndex + 1}`}
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
							user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleUserLogin} />
						}
					/>
					<Route path="/login" element={<Login onLogin={handleUserLogin} />} />
					<Route path="/register" element={<Navigate to="/login" replace />} />
					<Route path="/policies" element={<Policies />} />
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
							element={
								<WorkspaceLegacyFrame title="Application" subtitle="Review details">
									<AdminApplicationDetails user={user} />
								</WorkspaceLegacyFrame>
							}
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
							path="admin/districts"
							element={
								<WorkspaceLegacyFrame title="Districts" subtitle="Manage district master data">
									<DistrictManagement user={user} />
								</WorkspaceLegacyFrame>
							}
						/>
						<Route
							path="join"
							element={
								<WorkspaceLegacyFrame title="Join application" subtitle="Second party registration">
									<JoinApplication user={user} />
								</WorkspaceLegacyFrame>
							}
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

			{!user ? (
				<AccessibilityWidget
					fontScale={fontScale}
					highContrast={highContrast}
					highlightLinks={highlightLinks}
					onIncreaseFont={increaseFontScale}
					onDecreaseFont={decreaseFontScale}
					onResetFont={() => setFontScale('normal')}
					onToggleContrast={() => setHighContrast((prev) => !prev)}
					onToggleHighlightLinks={() => setHighlightLinks((prev) => !prev)}
					mainContentTargetId={mainContentTargetId}
				/>
			) : null}
		</div>
	)
}

export default App
