import './App.css'
import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import api from './api'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import UserDetail from './pages/UserDetail'
import Policies from './pages/Policies'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import ProtectedRoute from './components/ProtectedRoute'
import emblem from './assets/img/emblem-dark.png'
import nicLogo from './assets/img/NIC.png'
import digitalIndiaLogo from './assets/img/digital-india.png'
import propertiesImage from './assets/carousel/properties-img.png'
import tenantOwnerImage from './assets/carousel/tenant-owner.png'

const buildSlideImage = (label, accent = '#1d4ed8') => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="540" viewBox="0 0 900 540">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f8fafc"/>
          <stop offset="100%" stop-color="#e2e8f0"/>
        </linearGradient>
      </defs>
      <rect width="900" height="540" rx="28" fill="url(#bg)"/>
      <rect x="40" y="40" width="820" height="460" rx="24" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
      <circle cx="120" cy="150" r="44" fill="${accent}" opacity="0.15"/>
      <rect x="190" y="120" width="460" height="26" rx="13" fill="${accent}" opacity="0.25"/>
      <rect x="190" y="160" width="320" height="20" rx="10" fill="#cbd5f5"/>
      <rect x="120" y="240" width="660" height="18" rx="9" fill="#e2e8f0"/>
      <rect x="120" y="276" width="520" height="18" rx="9" fill="#e2e8f0"/>
      <rect x="120" y="312" width="600" height="18" rx="9" fill="#e2e8f0"/>
      <rect x="120" y="360" width="200" height="44" rx="22" fill="${accent}" opacity="0.2"/>
      <text x="120" y="440" font-family="Inter, Arial, sans-serif" font-size="28" fill="#0f172a" font-weight="700">${label}</text>
    </svg>
  `
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const slides = [
    {
      title: 'Tenants & Owners',
      subtitle: 'Verified listings, digital leases, and fast support.',
      image: tenantOwnerImage,
    },
    {
      title: 'Properties',
      subtitle: 'Track occupancy, rent cycles, and performance at a glance.',
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
  const showCarousel = !user && location.pathname !== '/register'

  const handleLogout = async () => {
    await api.post('/api/logout')
    setUser(null)
  }

  if (loading) {
    return (
      <div className="page page-center">
        <div className="auth-card">
          <h1 className="loading-title">
            Loading…
            <span className="loading-spinner" aria-hidden="true" />
          </h1>
          <p className="muted">Checking your session.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
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
        <nav className={user ? 'nav-auth' : undefined}>
          {!user ? (
            <>
              <Link to="/">Home</Link>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : (
            <>
              <div className="nav-actions">
                <button className="nav-link" type="button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
              <span className="topbar-welcome">Welcome {user.name}</span>
            </>
          )}
        </nav>
      </header>
      {showCarousel ? (
        <section className="carousel" aria-label="Tenant and owner highlights">
          <div className="carousel-card">
            <div className="carousel-copy">
              <p className="carousel-eyebrow">Highlights</p>
              <h2>{slides[slideIndex].title}</h2>
              <p className="carousel-subtitle">{slides[slideIndex].subtitle}</p>
              <div className="carousel-controls">
                <button
                  type="button"
                  className="nav-link"
                  onClick={() =>
                    setSlideIndex((prev) => (prev - 1 + slides.length) % slides.length)
                  }
                  aria-label="Previous slide"
                >
                  Previous
                </button>
                <button
                  type="button"
                  className="nav-link"
                  onClick={() => setSlideIndex((prev) => (prev + 1) % slides.length)}
                  aria-label="Next slide"
                >
                  Next
                </button>
              </div>
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
          <Route path="/register" element={<Register onLogin={setUser} />} />
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
        </Routes>
      </main>
      <footer className="footer">
        <div className="footer-content">
          <div>
            <h3>Quick links</h3>
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
          This website belongs to Department of Housing And Urban Affairs, Govt.
          of Assam.
        </div>
      </footer>
    </div>
  )
}

export default App
