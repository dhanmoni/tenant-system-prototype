import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { csrf } from '../api'

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await csrf()
      const { data } = await api.post('/api/login', form)
      onLogin(data.user)
      navigate('/dashboard', { replace: true })
      window.history.replaceState(null, '', '/dashboard')
    } catch (err) {
      const message = err?.response?.data?.message || 'Login failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="home">
      <div className="hero">
        <div className="hero-content">
          <p className="hero-eyebrow">Property management</p>
          <h1>Everything tenants and owners need, in one place.</h1>
          <p className="hero-subtitle">
            A professional portal for payments, maintenance, and property
            performance. Built to keep everyone aligned.
          </p>
          <div className="audience">
            <div className="audience-card">
              <h3>For tenants</h3>
              <p>
                Browse verified listings, submit maintenance requests, and pay
                rent securely from one place.
              </p>
              <ul>
                <li>Digital lease access</li>
                <li>Payment history & receipts</li>
                <li>24/7 support ticketing</li>
              </ul>
            </div>
            <div className="audience-card">
              <h3>For owners</h3>
              <p>
                Track occupancy, automate rent collection, and stay ahead of
                property performance.
              </p>
              <ul>
                <li>Portfolio dashboard</li>
                <li>Automated rent reminders</li>
                <li>Vendor management</li>
              </ul>
            </div>
          </div>
        </div>
        <aside className="hero-card">
          <div className="auth-card auth-card-compact">
            <h2>Sign in</h2>
            <p className="muted">Use your account credentials.</p>
            {error ? <div className="error">{error}</div> : null}
            <form onSubmit={handleSubmit}>
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </label>
              <button type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
            <p className="muted">
              No account? <Link to="/register">Create one</Link>
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default Login
