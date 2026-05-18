import './App.css'
import { useEffect, useState } from 'react'
import bannerImage from './assets/img/banner.png'
import welcomeImage from './assets/img/img1.png'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import api from './api'
import DashboardLayout from './pages/dashboard/DashboardLayout'
import DashboardHome from './pages/dashboard/DashboardHome'
import Profile from './pages/dashboard/Profile'
import ApplicationStatus from './pages/dashboard/ApplicationStatus'
import ApplicationDetails from './pages/dashboard/ApplicationDetails'
import TenancyCertificate from './pages/dashboard/TenancyCertificate'
import FormPortal from './pages/dashboard/FormPortal'
import TenantServices from './pages/dashboard/TenantServices'

// import StateManagement from './pages/dashboard/admin/StateManagement'
import DistrictManagement from './pages/dashboard/admin/DistrictManagement'
import OfficeManagement from './pages/dashboard/admin/OfficeManagement'
import UserManagement from './pages/dashboard/admin/UserManagement'
import RoleManagement from './pages/dashboard/admin/RoleManagement'
import DesignationManagement from './pages/dashboard/admin/DesignationManagement'
import ActivityLog from './pages/dashboard/admin/ActivityLog'

import Login from './pages/Login'
import Register from './pages/Register'
import UserDetail from './pages/UserDetail'
import JoinApplication from './pages/JoinApplication'
import Policies from './pages/Policies'
import Contact from './pages/Contact'
import Sitemap from './pages/Sitemap'
import Admin from './pages/Admin'
import ProtectedRoute from './components/ProtectedRoute'
import AccessibilityWidget from './components/landing/AccessibilityWidget'
import PortalLoadingScreen from './components/PortalLoadingScreen'
import { LANDING_A11Y_EVENT } from './utils/landingA11y'
import emblem from './assets/img/emblem-dark.png'
import nicLogo from './assets/img/NIC.png'
import digitalIndiaLogo from './assets/img/digital-india.png'

function App() {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)
	const [portalEntering, setPortalEntering] = useState(false)
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
	const showCarousel = !user
	const isLandingHome = !user && (location.pathname === '/' || location.pathname === '/login')

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
		await api.post('/api/logout')
		setUser(null)
		setPortalEntering(false)
	}

	const handleUserLogin = (nextUser) => {
		setPortalEntering(true)
		setUser(nextUser)
	}

	useEffect(() => {
		if (!portalEntering) return undefined
		const timer = setTimeout(() => setPortalEntering(false), 900)
		return () => clearTimeout(timer)
	}, [portalEntering, location.pathname])

	if (loading || portalEntering) {
		return (
			<PortalLoadingScreen
				title={portalEntering ? 'Opening your dashboard' : 'Loading portal'}
				subtitle={
					portalEntering
						? 'Please wait while we load your workspace.'
						: 'Please wait while we check your session.'
				}
			/>
		)
	}

	return (
		<div
			className={`page${!user ? ' page-landing' : ''}${isLandingHome ? ' page-landing-home' : ''}${location.pathname.startsWith('/dashboard') ? ' page-dashboard' : ''}`}
		>
			<a className="skip-link" href="#main-content">Skip to main content</a>
			<a
				className="skip-link"
				href={isLandingHome ? '#landing-primary-nav' : '#public-primary-nav'}
			>
				Skip to navigation
			</a>
			{/* Accessibility Bar — hidden on landing home mobile (see LandingNav utility bar) */}
			<div
				id="accessibility-bar"
				className={`accessibility-bar${isLandingHome ? ' accessibility-bar--landing-mobile-hidden' : ''}`}
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
						<a className="accessibility-toolbar-link" href="#main-content">
							Skip to main content
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
			{!user && !isLandingHome ? (
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

			{!user && !isLandingHome ? <div className="landing-accent-stripe" aria-hidden /> : null}

			{/* Main navigation – rent-portal style on landing; hidden on dashboard */}
			{!(user && location.pathname.startsWith('/dashboard')) && !isLandingHome && (
				<div className="globalnav">
					<div className="globalnav-inner">
						{!user ? (
							<span className="globalnav-portal-title"></span>
						) : null}
						<nav id="public-primary-nav" className={user ? 'nav-auth' : undefined}>
							{!user ? (
								<>
									<Link to="/">Home</Link>
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

			{showCarousel && !isLandingHome ? (
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
								<DashboardLayout user={user} onLogout={handleLogout} onUserUpdate={setUser} />
							</ProtectedRoute>
						}
					>
						<Route index element={<DashboardHome />} />
						<Route path="profile" element={<Profile />} />
						<Route path="tenancy-certificate" element={<TenancyCertificate />} />
						<Route path="status" element={<ApplicationStatus />} />
						<Route path="status/:type/:applicationNo" element={<ApplicationDetails />} />
						<Route path="services" element={<TenantServices />} />
						<Route path=":formType" element={<FormPortal />} />
						{/* Admin Routes */}
						{/* <Route path="admin/state" element={<StateManagement />} /> */}
						<Route path="admin/district" element={<DistrictManagement />} />
						<Route path="admin/office" element={<OfficeManagement />} />
						<Route path="admin/users" element={<UserManagement />} />
						<Route path="admin/role" element={<RoleManagement />} />
						<Route path="admin/designation" element={<DesignationManagement />} />
						<Route path="admin/activity-log" element={<ActivityLog />} />
						<Route path="join" element={<JoinApplication user={user} />} />
					</Route>
					<Route
						path="/join"
						element={<Navigate to={`/dashboard/join${location.search}`} replace />}
					/>
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
					navTargetId={isLandingHome ? 'landing-primary-nav' : 'public-primary-nav'}
				/>
			) : null}
		</div>
	)
}

export default App
