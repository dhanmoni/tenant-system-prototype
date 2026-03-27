import './App.css'
import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import api from './api'
import DashboardLayout from './pages/dashboard/DashboardLayout'
import DashboardHome from './pages/dashboard/DashboardHome'
import Profile from './pages/dashboard/Profile'
import ApplicationStatus from './pages/dashboard/ApplicationStatus'
import ApplicationDetails from './pages/dashboard/ApplicationDetails'
import TenancyCertificate from './pages/dashboard/TenancyCertificate'
import FormPortal from './pages/dashboard/FormPortal'

import StateManagement from './pages/dashboard/admin/StateManagement'
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
import emblem from './assets/img/emblem-dark.png'
import nicLogo from './assets/img/NIC.png'
import digitalIndiaLogo from './assets/img/digital-india.png'

function App() {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)
	const [fontScale, setFontScale] = useState('normal')
	const [highContrast, setHighContrast] = useState(false)
	const slides = [
		{
			title: 'Digital Tenancy Registration',
			subtitle:
				'Apply for tenancy certificates online, track your application status in real-time, and download digitally signed documents — all from one portal.',
			image: '/TCP-Images/TCP-Office.jpg',
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
		await api.post('/api/logout')
		setUser(null)
	}

	if (loading) {
		return (
			<div className="page page-center">
				<div className="full-page-loader">
					<div className="loader-spinner"></div>
					<h2 className="loader-text">Loading...</h2>
					<p className="muted">Please wait while we check your session.</p>
				</div>
			</div>
		)
	}

	return (
		<div
			className={`page${!user ? ' page-landing' : location.pathname.startsWith('/dashboard') ? ' page-dashboard' : ''}`}
		>
			<a className="skip-link" href="#main-content">Skip to main content</a>
			<a className="skip-link" href="#primary-nav">Skip to navigation</a>
			{/* Accessibility Bar */}
			<div className="accessibility-bar">
				<div className="accessibility-bar-inner">
					<div className="accessibility-gov">
						<span className="accessibility-goi">Government of India</span>
						<span className="accessibility-ministry">
							Department of Housing And Urban Affairs
						</span>
					</div>
					<div className="accessibility-bar-help" aria-label="Accessibility and help controls">
						<a className="accessibility-skip-btn" href="#main-content">
							Skip to main content
						</a>
						<button
							type="button"
							className="accessibility-control-btn"
							onClick={decreaseFontScale}
							title="Decrease text size"
							aria-label="Decrease text size"
						>
							A-
						</button>
						<button
							type="button"
							className="accessibility-control-btn"
							onClick={() => setFontScale('normal')}
							title="Reset text size"
							aria-label="Reset text size"
						>
							A
						</button>
						<button
							type="button"
							className="accessibility-control-btn"
							onClick={increaseFontScale}
							title="Increase text size"
							aria-label="Increase text size"
						>
							A+
						</button>
						<button
							type="button"
							className={`accessibility-control-btn ${highContrast ? 'active' : ''}`}
							onClick={() => setHighContrast((prev) => !prev)}
							title="Toggle high contrast"
							aria-pressed={highContrast}
							aria-label="Toggle high contrast mode"
						>
							High Contrast
						</button>
						<span>Helpdesk (demo): 1800-000-0000</span>
						<span className="accessibility-bar-help-sep">|</span>
						<span>helpdesk.tcms@nic.in</span>
					</div>
				</div>
			</div>

			{/* Header (emblem + directorate title) — public only; hidden after login */}
			{!user ? (
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

			{!user ? <div className="landing-accent-stripe" aria-hidden /> : null}

			{/* Main navigation – rent-portal style on landing; hidden on dashboard */}
			{!(user && location.pathname.startsWith('/dashboard')) && (
				<div className="globalnav">
					<div className="globalnav-inner">
						{!user ? (
							<span className="globalnav-portal-title">Tenancy Certificate — Rent Portal</span>
						) : null}
						<nav id="primary-nav" className={user ? 'nav-auth' : undefined}>
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

			{showCarousel ? (
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
							user ? <Navigate to="/dashboard" replace /> : <Login onLogin={setUser} />
						}
					/>
					<Route path="/login" element={<Login onLogin={setUser} />} />
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
						<Route path=":formType" element={<FormPortal />} />
						{/* Admin Routes */}
						<Route path="admin/state" element={<StateManagement />} />
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
		</div>
	)
}

export default App
