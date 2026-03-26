import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api, { csrf } from '../api'
import nicLogo from '../assets/img/NIC.png'

function Login({ onLogin }) {
	const navigate = useNavigate()
	const location = useLocation()

	// Toggle between 'login' and 'register'
	const [mode, setMode] = useState('login')

	// Login form state
	const [loginForm, setLoginForm] = useState({ phone: '', otp: '' })
	const [otpSent, setOtpSent] = useState(false)
	const [otpMessage, setOtpMessage] = useState('')
	const [loginError, setLoginError] = useState('')
	const [loginLoading, setLoginLoading] = useState(false)
	const [resendTimer, setResendTimer] = useState(0)

	// Timer effect
	useEffect(() => {
		if (resendTimer > 0) {
			const interval = setInterval(() => setResendTimer(t => t - 1), 1000)
			return () => clearInterval(interval)
		}
	}, [resendTimer])

	// Register form state
	const [regForm, setRegForm] = useState({
		name: '',
		email: '',
		phone: '',
		state_id: '',
		district_id: '',
	})
	const [regError, setRegError] = useState('')
	const [regLoading, setRegLoading] = useState(false)
	const [regStep, setRegStep] = useState('details') // 'details' -> 'otp'
	const [regOtpSent, setRegOtpSent] = useState(false)
	const [regOtp, setRegOtp] = useState('')
	const [regPendingPhone, setRegPendingPhone] = useState('')
	const [regOtpMessage, setRegOtpMessage] = useState('')
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
		const { name, value } = e.target
		setLoginForm((prev) => ({ ...prev, [name]: value }))
		if (name === 'phone') {
			setOtpSent(false)
			setOtpMessage('')
		}
	}

	const handleSendOtp = () => {
		setLoginError('')
		setOtpMessage('')
		if (!loginForm.phone.trim()) {
			setLoginError('Please enter phone number first')
			return
		}
		// Reset OTP and start timer
		setLoginForm((prev) => ({ ...prev, otp: '' }))
		setOtpSent(true)
		setResendTimer(60)
		setOtpMessage('OTP sent successfully.')
	}

	const handleEditPhone = () => {
		setOtpSent(false)
		setOtpMessage('')
		setResendTimer(0)
	}

	const handleLoginSubmit = async (e) => {
		e.preventDefault()
		setLoginError('')
		setOtpMessage('')
		if (!otpSent) {
			setLoginError('Please send OTP first')
			return
		}
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

	const handleRegSendOtp = () => {
		setRegError('')
		setRegOtpMessage('')
		if (!regPendingPhone?.trim()) {
			setRegError('Phone number is missing')
			return
		}
		setRegOtpSent(true)
		setRegOtp('')
		setResendTimer(60) // Reuse the same timer
		setRegOtpMessage('OTP sent successfully.')
	}

	const handleRegVerifyOtp = async (e) => {
		e.preventDefault()
		setRegError('')
		setRegOtpMessage('')

		if (!regOtpSent) {
			setRegError('Please send OTP first')
			return
		}

		if (!regOtp.trim()) {
			setRegError('Please enter OTP')
			return
		}

		setRegLoading(true)
		try {
			await csrf()
			const { data } = await api.post('/api/login', { phone: regPendingPhone, otp: regOtp })
			onLogin(data.user)
			const from = location.state?.from?.pathname || '/dashboard'
			const search = location.state?.from?.search || ''
			navigate(from + search, { replace: true })
		} catch (err) {
			setRegError(err?.response?.data?.message || 'OTP verification failed')
		} finally {
			setRegLoading(false)
		}
	}

	const handleRegSubmit = async (e) => {
		e.preventDefault()
		setRegError('')
		setRegLoading(true)
		try {
			await csrf()
			const { data } = await api.post('/api/register', regForm)

			// After account creation, require OTP verification before login.
			setRegPendingPhone(regForm.phone)
			setRegStep('otp')
			setRegOtpSent(true)
			setResendTimer(60)
			setRegOtp('')
			setRegOtpMessage('Account created! OTP sent successfully.')
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
		setOtpSent(false)
		setOtpMessage('')
		setLoginForm({ phone: '', otp: '' })
		setRegStep('details')
		setRegOtpSent(false)
		setRegOtp('')
		setRegPendingPhone('')
		setRegOtpMessage('')
		setResendTimer(0)
		setMode(newMode)
	}

	return (
		<section className="home">
			<div className="hero hero--rent-portal">
				<div className="hero-content">
					<p className="hero-eyebrow">Government of India · TCP</p>
					<h1>Tenancy Certificate Management System</h1>
					<p className="hero-subtitle">
						A unified portal for tenancy registration, certificate issuance,
						and property management — for the Department of Housing And Urban
						Affairs (prototype).
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
								<li>Online services round the clock</li>
							</ul>
						</div>
						<div className="audience-card">
							<h3>For Owners</h3>
							<p>
								Register properties, manage tenant records, and stay aligned
								with tenancy regulations.
							</p>
							<ul>
								<li>Property and application dashboard</li>
								<li>Digital record management</li>
								<li>Status and compliance visibility</li>
							</ul>
						</div>
					</div>
				</div>
				<aside className="hero-card" id="auth-card-section">
					<div className="auth-card auth-card-compact auth-card--rent-portal">
						{mode === 'login' ? (
							<>
								<h2>Log In</h2>
								<p className="muted">Use your phone number and OTP.</p>
								{otpMessage ? <div className="success">{otpMessage}</div> : null}
								{loginError ? <div className="error">{loginError}</div> : null}
								<form onSubmit={handleLoginSubmit} className="otp-form">
									{!otpSent ? (
										<>
											<label>
												Phone Number
												<input
													type="tel"
													name="phone"
													value={loginForm.phone}
													onChange={handleLoginChange}
													placeholder="Enter your registered phone"
													required
												/>
											</label>
											<button type="button" className="btn-send-otp" onClick={handleSendOtp} disabled={loginLoading}>
												Send OTP
											</button>
										</>
									) : (
										<>
											<div className="phone-display">
												<div className="phone-val">
													<strong>{loginForm.phone}</strong>
												</div>
												<button type="button" className="btn-edit-phone" onClick={handleEditPhone}>Change</button>
											</div>
											<label className="otp-label">
												Enter 6-digit OTP
												<input
													type="text"
													name="otp"
													value={loginForm.otp}
													onChange={handleLoginChange}
													maxLength={6}
													placeholder="······"
													autoFocus
													required
												/>
											</label>
											<div className="otp-resend">
												{resendTimer > 0 ? (
													<span className="timer">Resend in {resendTimer}s</span>
												) : (
													<button type="button" className="link-resend" onClick={handleSendOtp}>Resend OTP</button>
												)}
											</div>
											<button type="submit" className="btn-login-submit" disabled={loginLoading}>
												{loginLoading ? 'Signing in...' : 'Log In'}
											</button>
										</>
									)}
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
								{regStep === 'details' ? (
									<>
										<h2>Create Account</h2>
										<p className="muted">Complete your details to receive an OTP.</p>
										{regError ? <div className="error">{regError}</div> : null}
										<form onSubmit={handleRegSubmit}>
											<label>
												Name
												<input type="text" name="name" value={regForm.name} onChange={handleRegChange} placeholder="Enter full name" required />
											</label>
											<label>
												Email (Optional)
												<input type="email" name="email" value={regForm.email} onChange={handleRegChange} placeholder="Email address" />
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
												{regLoading ? 'Processing...' : 'Create Account & Send OTP'}
											</button>
										</form>
										<p className="muted">
											Already registered?{' '}
											<a href="#" onClick={(e) => { e.preventDefault(); switchMode('login') }}>
												Sign in
											</a>
										</p>
									</>
								) : (
									<>
										<h2>Verify OTP</h2>
										<p className="muted">Enter the OTP sent to {regPendingPhone}.</p>
										{regOtpMessage ? <div className="success">{regOtpMessage}</div> : null}
										{regError ? <div className="error">{regError}</div> : null}
										<form onSubmit={handleRegVerifyOtp} className="otp-form">
											<div className="phone-display">
												<div className="phone-val">
													<strong>{regPendingPhone}</strong>
												</div>
												<button type="button" className="btn-edit-phone" onClick={() => setRegStep('details')}>Change</button>
											</div>

											<label className="otp-label">
												Enter 6-digit OTP
												<input
													type="text"
													name="regOtp"
													value={regOtp}
													onChange={(e) => setRegOtp(e.target.value)}
													maxLength={6}
													placeholder="······"
													autoFocus
													required
												/>
											</label>
											<div className="otp-resend">
												{resendTimer > 0 ? (
													<span className="timer">Resend in {resendTimer}s</span>
												) : (
													<button type="button" className="link-resend" onClick={handleRegSendOtp}>Resend OTP</button>
												)}
											</div>

											<button type="submit" className="btn-login-submit" disabled={regLoading}>
												{regLoading ? 'Verifying...' : 'Verify & Log In'}
											</button>
										</form>
										<p className="muted">
											<a href="#" onClick={(e) => { e.preventDefault(); switchMode('login') }}>
												Back to sign in
											</a>
										</p>
									</>
								)}
							</>
						)}
					</div>
				</aside>
			</div>

			<section className="landing-section landing-about" aria-labelledby="landing-about-heading">
				<div className="landing-container">
					<h2 id="landing-about-heading">About the portal</h2>
					<p className="landing-lead">
						This prototype demonstrates online workflows for tenancy certificates and
						related services, similar in spirit to state rent-portal sites — with clear
						navigation, citizen services, and helpdesk information.
					</p>
					<Link className="landing-text-link" to="/policies">
						Read policies &amp; guidelines
					</Link>
				</div>
			</section>

			<section className="landing-section landing-services" aria-labelledby="landing-services-heading">
				<div className="landing-container">
					<h2 id="landing-services-heading">Citizen services</h2>
					<p className="landing-section-intro">
						Quick access to common actions (demo — links scroll to login or registration).
					</p>
					<div className="landing-service-grid">
						<Link className="landing-service-tile" to="/#register">
							<span className="landing-service-tile-icon" aria-hidden>
								<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
									<circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
									<path d="M19 8v6M22 11h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
								</svg>
							</span>
							<span className="landing-service-tile-title">New registration</span>
							<span className="landing-service-tile-desc">Create a citizen account</span>
						</Link>
						<Link className="landing-service-tile" to="/#login">
							<span className="landing-service-tile-icon" aria-hidden>
								<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
									<path d="M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
								</svg>
							</span>
							<span className="landing-service-tile-title">Login</span>
							<span className="landing-service-tile-desc">Access your dashboard</span>
						</Link>
						<Link className="landing-service-tile" to="/#login">
							<span className="landing-service-tile-icon" aria-hidden>
								<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
									<path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
								</svg>
							</span>
							<span className="landing-service-tile-title">Apply for certificate</span>
							<span className="landing-service-tile-desc">Sign in to submit applications</span>
						</Link>
						<Link className="landing-service-tile" to="/contact">
							<span className="landing-service-tile-icon" aria-hidden>
								<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" />
									<path d="m22 6-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
								</svg>
							</span>
							<span className="landing-service-tile-title">Contact &amp; help</span>
							<span className="landing-service-tile-desc">Reach the helpdesk</span>
						</Link>
					</div>
				</div>
			</section>

			<section className="landing-section landing-notices" aria-labelledby="landing-notices-heading">
				<div className="landing-container">
					<h2 id="landing-notices-heading">Notifications</h2>
					<ul className="landing-notice-list">
						<li>
							<span className="landing-notice-date">Demo</span>
							<span>Portal content is for demonstration; data and timelines are illustrative.</span>
						</li>
						<li>
							<span className="landing-notice-date">Demo</span>
							<span>Use official circulars and gazette notifications for legal reference.</span>
						</li>
					</ul>
				</div>
			</section>

			<section className="landing-section landing-external" aria-labelledby="landing-external-heading">
				<div className="landing-container">
					<h2 id="landing-external-heading">Important links</h2>
					<div className="landing-external-grid">
						<a className="landing-external-link" href="https://www.india.gov.in/" target="_blank" rel="noopener noreferrer">
							National portal — india.gov.in
						</a>
						<a className="landing-external-link" href="https://www.digitalindia.gov.in/" target="_blank" rel="noopener noreferrer">
							Digital India
						</a>
						<a className="landing-external-link" href="https://tcp.assam.gov.in/" target="_blank" rel="noopener noreferrer">
							TCP Assam (reference)
						</a>
						<a className="landing-external-link" href="https://www.tenancy.tn.gov.in/" target="_blank" rel="noopener noreferrer">
							Tamil Nadu tenancy portal (reference)
						</a>
					</div>
				</div>
			</section>

			<div className="landing-helpdesk" role="region" aria-label="Helpdesk">
				<div className="landing-container landing-helpdesk-inner">
					<div>
						<strong>Helpdesk (demo)</strong>
						<p>For assistance with this prototype, use the contact details in the top bar or visit Contact Us.</p>
					</div>
					<img className="landing-helpdesk-nic-logo" src={nicLogo} alt="NIC" />
					<Link className="landing-helpdesk-btn" to="/contact">
						Contact us
					</Link>
				</div>
			</div>
		</section>
	)
}

export default Login
