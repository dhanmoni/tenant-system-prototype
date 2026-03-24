import './App.css'
import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import api from './api'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import UserDetail from './pages/UserDetail'
import JoinApplication from './pages/JoinApplication'
import Policies from './pages/Policies'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import ProtectedRoute from './components/ProtectedRoute'
import emblem from './assets/img/emblem-dark.png'
import nicLogo from './assets/img/NIC.png'
import digitalIndiaLogo from './assets/img/digital-india.png'
import propertiesImage from './assets/carousel/properties-img.png'
import tenantOwnerImage from './assets/carousel/tenant-owner.png'

function App() {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)
	const slides = [
		{
			title: 'Digital Tenancy Registration',
			subtitle: 'Apply for tenancy certificates online, track your application status in real-time, and download digitally signed documents — all from one portal.',
			image: tenantOwnerImage,
		},
		{
			title: 'Property Management',
			subtitle: 'Register properties, manage landlord-tenant records, and ensure compliance with the Department of Housing And Urban Affairs regulations.',
			image: propertiesImage,
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
		<div className="page">
			{/* Accessibility Bar */}
			<div className="accessibility-bar">
				<div className="accessibility-bar-inner">
					<div className="accessibility-gov">
						<span className="accessibility-goi">Government of India</span>
						<span className="accessibility-ministry">
							Department of Housing And Urban Affairs
						</span>
					</div>
				</div>
			</div>

			{/* Header */}
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
			</header>

			{/* Green Navigation Bar – hidden on dashboard (welcome & logout are in dashboard) */}
			{!(user && location.pathname === '/dashboard') && (
				<div className="globalnav">
					<div className="globalnav-inner">
						<nav className={user ? 'nav-auth' : undefined}>
							{!user ? (
								<>
									<Link to="/">Home</Link>
									<Link to="/#login">Login</Link>
									<Link to="/#register">Register</Link>
									{/*<Link to="/policies">Policies</Link>*/}
									<Link to="/contact">Contact Us</Link>
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
				<section className="carousel" aria-label="Tenant and owner highlights">
					<div className="carousel-card">
						<div className="carousel-copy">
							<p className="carousel-eyebrow">Highlights</p>
							<h2>{slides[slideIndex].title}</h2>
							<p className="carousel-subtitle">{slides[slideIndex].subtitle}</p>
							<div className="carousel-nav-row">
								<div className="carousel-dots" role="tablist">
									{slides.map((_, index) => (
										<button
											key={`dot-${index}`}
											type="button"
											className={`carousel-dot ${index === slideIndex ? 'active' : ''}`}
											onClick={() => setSlideIndex(index)}
											aria-label={`Go to slide ${index + 1}`}
										/>
									))}
								</div>
							</div>
						</div>
						<div className="carousel-image">
							<img src={slides[slideIndex].image} alt={slides[slideIndex].title} />
						</div>
					</div>
				</section>
			) : null}
			<main>
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
								<Dashboard user={user} onLogout={handleLogout} />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/users/:id"
						element={
							<ProtectedRoute user={user}>
								<UserDetail user={user} />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/join"
						element={
							<ProtectedRoute user={user}>
								<JoinApplication user={user} />
							</ProtectedRoute>
						}
					/>
				</Routes>
			</main>

			{/* Footer – hidden on dashboard */}
			{!(user && location.pathname === '/dashboard') && (
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
			)}
		</div>
	)
}

export default App
