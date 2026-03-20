import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api, { csrf } from '../api'

function Login({ onLogin }) {
	const navigate = useNavigate()
	const location = useLocation()

	// Toggle between 'login' and 'register'
	const [mode, setMode] = useState('login')

	// Login form state
	const [loginForm, setLoginForm] = useState({ phone: '', password: '' })
	const [loginError, setLoginError] = useState('')
	const [loginLoading, setLoginLoading] = useState(false)

	// Register form state
	const [regForm, setRegForm] = useState({
		name: '',
		email: '',
		password: '',
		password_confirmation: '',
		phone: '',
		state_id: '',
		district_id: '',
	})
	const [regError, setRegError] = useState('')
	const [regLoading, setRegLoading] = useState(false)
	const [states, setStates] = useState([])
	const [districts, setDistricts] = useState([])

	// Load states & districts when register mode is active
	useEffect(() => {
		if (mode !== 'register') return
		if (states.length > 0) return // already loaded

		const loadStates = async () => {
			try {
				const { data } = await api.get('/api/public/states')
				setStates(data.states || [])
			} catch (err) {
				console.error('Failed to load states', err)
			}
		}
		const loadDistricts = async () => {
			try {
				const { data } = await api.get('/api/public/districts')
				setDistricts(data.districts || [])
			} catch (err) {
				console.error('Failed to load districts', err)
			}
		}
		loadStates()
		loadDistricts()
	}, [mode, states.length])

	// Listen to URL hash to switch modes and scroll
	useEffect(() => {
		if (location.hash === '#register') {
			switchMode('register')
			setTimeout(() => {
				document.getElementById('auth-card-section')?.scrollIntoView({ behavior: 'smooth' })
			}, 100)
		} else if (location.hash === '#login') {
			switchMode('login')
			setTimeout(() => {
				document.getElementById('auth-card-section')?.scrollIntoView({ behavior: 'smooth' })
			}, 100)
		}
	}, [location.hash])

	const filteredDistricts = regForm.state_id
		? districts.filter((d) => String(d.state_id ?? d.state?.id) === String(regForm.state_id))
		: []

	// Handlers
	const handleLoginChange = (e) => {
		setLoginForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
	}

	const handleLoginSubmit = async (e) => {
		e.preventDefault()
		setLoginError('')
		setLoginLoading(true)
		try {
			await csrf()
			const { data } = await api.post('/api/login', loginForm)
			onLogin(data.user)
			const from = location.state?.from?.pathname || '/dashboard'
			const search = location.state?.from?.search || ''
			navigate(from + search, { replace: true })
		} catch (err) {
			setLoginError(err?.response?.data?.message || 'Login failed')
		} finally {
			setLoginLoading(false)
		}
	}

	const handleRegChange = (e) => {
		setRegForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
	}

	const handleRegSubmit = async (e) => {
		e.preventDefault()
		setRegError('')
		setRegLoading(true)
		try {
			await csrf()
			const { data } = await api.post('/api/register', regForm)
			onLogin(data.user)
			const from = location.state?.from?.pathname || '/dashboard'
			const search = location.state?.from?.search || ''
			navigate(from + search, { replace: true })
		} catch (err) {
			setRegError(
				err?.response?.data?.message ||
				err?.response?.data?.errors?.phone?.[0] ||
				'Registration failed'
			)
		} finally {
			setRegLoading(false)
		}
	}

	const switchMode = (newMode) => {
		setLoginError('')
		setRegError('')
		setMode(newMode)
	}

	return (
		<section className="home">
			<div className="hero">
				<div className="hero-content">
					<p className="hero-eyebrow">Government of India Project</p>
					<h1>Tenancy Certificate Management System</h1>
					<p className="hero-subtitle">
						A unified portal for tenancy registration, certificate issuance,
						and property management. Built by NIC for the Department of
						Housing And Urban Affairs.
					</p>
					<div className="audience">
						<div className="audience-card">
							<h3>For Tenants</h3>
							<p>
								Apply for tenancy certificates, track application status, and
								manage your property records digitally.
							</p>
							<ul>
								<li>Digital certificate access</li>
								<li>Application status tracking</li>
								<li>24/7 online support</li>
							</ul>
						</div>
						<div className="audience-card">
							<h3>For Owners</h3>
							<p>
								Register properties, manage tenant records, and stay compliant
								with government regulations.
							</p>
							<ul>
								<li>Property portfolio dashboard</li>
								<li>Digital record management</li>
								<li>Compliance tracking</li>
							</ul>
						</div>
					</div>
				</div>
				<aside className="hero-card" id="auth-card-section">
					<div className="auth-card auth-card-compact">
						{mode === 'login' ? (
							<>
								<h2>Log In</h2>
								<p className="muted">Use your account credentials.</p>
								{loginError ? <div className="error">{loginError}</div> : null}
								<form onSubmit={handleLoginSubmit}>
									<label>
										Phone Number
										<input
											type="tel"
											name="phone"
											value={loginForm.phone}
											onChange={handleLoginChange}
											required
										/>
									</label>
									<label>
										Password
										<input
											type="password"
											name="password"
											value={loginForm.password}
											onChange={handleLoginChange}
											required
										/>
									</label>
									<button type="submit" disabled={loginLoading}>
										{loginLoading ? 'Signing in...' : 'Log In'}
									</button>
								</form>
								<p className="muted">
									No account?{' '}
									<a href="#" onClick={(e) => { e.preventDefault(); switchMode('register') }}>
										Create one
									</a>
								</p>
							</>
						) : (
							<>
								<h2>Create Account</h2>
								<p className="muted">Start your session in seconds.</p>
								{regError ? <div className="error">{regError}</div> : null}
								<form onSubmit={handleRegSubmit}>
									<label>
										Name
										<input type="text" name="name" value={regForm.name} onChange={handleRegChange} required />
									</label>
									<label>
										Email (Optional)
										<input type="email" name="email" value={regForm.email} onChange={handleRegChange} />
									</label>
									<label>
										Password
										<input type="password" name="password" value={regForm.password} onChange={handleRegChange} required />
									</label>
									<label>
										Confirm Password
										<input type="password" name="password_confirmation" value={regForm.password_confirmation} onChange={handleRegChange} required />
									</label>
									<label>
										Phone Number
										<input type="tel" name="phone" value={regForm.phone} onChange={handleRegChange} required />
									</label>
									<label>
										State
										<select
											name="state_id"
											value={regForm.state_id}
											onChange={(e) => {
												setRegForm((prev) => ({ ...prev, state_id: e.target.value, district_id: '' }))
											}}
											required
										>
											<option value="">---SELECT---</option>
											{states.map((s) => (
												<option key={s.id} value={s.id}>{s.name}</option>
											))}
										</select>
									</label>
									<label>
										District
										<select
											name="district_id"
											value={regForm.district_id}
											onChange={handleRegChange}
											required
											disabled={!regForm.state_id}
										>
											<option value="">---SELECT---</option>
											{filteredDistricts.map((d) => (
												<option key={d.id} value={d.id}>{d.name}</option>
											))}
										</select>
									</label>
									<button type="submit" disabled={regLoading}>
										{regLoading ? 'Creating...' : 'Create account'}
									</button>
								</form>
								<p className="muted">
									Already registered?{' '}
									<a href="#" onClick={(e) => { e.preventDefault(); switchMode('login') }}>
										Sign in
									</a>
								</p>
							</>
						)}
					</div>
				</aside>
			</div>
		</section>
	)
}

export default Login
