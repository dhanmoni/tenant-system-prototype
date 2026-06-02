import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api, { csrf } from '../api'
import { AuthPanelNavigationContext } from '../context/AuthPanelNavigationContext'
import { authHashForMode, modeFromHash, scrollToAuthPanel } from '../utils/authPanelNav'
import { formatApiErrors } from '../utils/formatApiErrors'
import LandingNav from '../components/landing/LandingNav'
import LandingHero from '../components/landing/LandingHero'
import DailyUpdateTicker from '../components/landing/DailyUpdateTicker'
import PortalStatsBar from '../components/landing/PortalStatsBar'
import GetStartedSection from '../components/landing/GetStartedSection'
import PortalGuideSection from '../components/landing/PortalGuideSection'
import PortalServicesSection from '../components/landing/PortalServicesSection'
import PortalBenefitsSection from '../components/landing/PortalBenefitsSection'
import PortalFaqSection from '../components/landing/PortalFaqSection'
import NeedSupportSection from '../components/landing/NeedSupportSection'
import GovernmentLogosCarousel from '../components/landing/GovernmentLogosCarousel'
import LandingFooter from '../components/landing/LandingFooter'
import LandingFab from '../components/landing/LandingFab'

function Login({ onLogin }) {
	const navigate = useNavigate()
	const location = useLocation()

	const [mode, setMode] = useState('login')
	const [loginForm, setLoginForm] = useState({ phone: '', otp: '' })
	const [otpSent, setOtpSent] = useState(false)
	const [otpMessage, setOtpMessage] = useState('')
	const [loginError, setLoginError] = useState('')
	const [loginLoading, setLoginLoading] = useState(false)
	const [resendTimer, setResendTimer] = useState(0)
	const [showBackToTop, setShowBackToTop] = useState(false)

	const [regForm, setRegForm] = useState({
		name: '',
		email: '',
		phone: '',
		district_id: '',
		gender: '',
		date_of_birth: '',
	})
	const [regError, setRegError] = useState('')
	const [regLoading, setRegLoading] = useState(false)
	const [regStep, setRegStep] = useState('details')
	const [regOtpSent, setRegOtpSent] = useState(false)
	const [regOtp, setRegOtp] = useState('')
	const [regPendingPhone, setRegPendingPhone] = useState('')
	const [regOtpMessage, setRegOtpMessage] = useState('')
	const [districts, setDistricts] = useState([])

	useEffect(() => {
		if (resendTimer > 0) {
			const interval = setInterval(() => setResendTimer((t) => t - 1), 1000)
			return () => clearInterval(interval)
		}
	}, [resendTimer])

	useEffect(() => {
		if (mode !== 'register') return
		if (districts.length > 0) return

		const loadDistricts = async () => {
			try {
				const { data } = await api.get('/api/public/districts')
				setDistricts(data.districts || [])
			} catch (err) {
				console.error('Failed to load districts', err)
			}
		}
		loadDistricts()
	}, [mode, districts.length])

	useEffect(() => {
		const handleScroll = () => setShowBackToTop(window.scrollY > 420)
		handleScroll()
		window.addEventListener('scroll', handleScroll, { passive: true })
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	const sanitizeMobileInput = (value) => value.replace(/\D/g, '').slice(0, 10)

	const handleLoginChange = (e) => {
		const { name, value } = e.target
		const nextValue = name === 'phone' ? sanitizeMobileInput(value) : value
		setLoginForm((prev) => ({ ...prev, [name]: nextValue }))
		if (name === 'phone') {
			setOtpSent(false)
			setOtpMessage('')
		}
	}

	const handleSendOtp = () => {
		setLoginError('')
		setOtpMessage('')
		if (!/^\d{10}$/.test(loginForm.phone)) {
			setLoginError('Please enter a valid 10-digit mobile number')
			return
		}
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
			handleSendOtp()
			return
		}
		setLoginLoading(true)
		try {
			await csrf()
			const { data } = await api.post('/api/login', loginForm)
			onLogin(data.user)
			const fromPath = location.state?.from?.pathname || '/dashboard'
			const fromSearch = location.state?.from?.search || ''
			const finalTarget =
				fromPath.includes('/join') || fromPath.includes('/dashboard/join')
					? fromPath + fromSearch
					: '/dashboard'
			navigate(finalTarget, { replace: true })
		} catch (err) {
			setLoginError(formatApiErrors(err, 'Login failed'))
		} finally {
			setLoginLoading(false)
		}
	}

	const handleRegChange = (e) => {
		const { name, value } = e.target
		const nextValue = name === 'phone' ? sanitizeMobileInput(value) : value
		setRegForm((prev) => ({ ...prev, [name]: nextValue }))
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
		setResendTimer(60)
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
			const fromPath = location.state?.from?.pathname || '/dashboard'
			const fromSearch = location.state?.from?.search || ''
			const finalTarget =
				fromPath.includes('/join') || fromPath.includes('/dashboard/join')
					? fromPath + fromSearch
					: '/dashboard'
			navigate(finalTarget, { replace: true })
		} catch (err) {
			setRegError(err?.response?.data?.message || 'OTP verification failed')
		} finally {
			setRegLoading(false)
		}
	}

	const validateRegForm = () => {
		if (!regForm.name?.trim()) return 'Please enter your full name.'
		if (!regForm.email?.trim()) return 'Please enter your email address.'
		if (!/^\d{10}$/.test(regForm.phone || '')) {
			return 'Please enter a valid 10-digit mobile number.'
		}
		if (!regForm.district_id) return 'Please select your district.'
		if (!regForm.gender) return 'Please select your gender.'
		if (!regForm.date_of_birth) return 'Please enter your date of birth.'
		return null
	}

	const handleRegSubmit = async (e) => {
		e.preventDefault()
		setRegError('')

		const validationMessage = validateRegForm()
		if (validationMessage) {
			setRegError(validationMessage)
			return
		}

		setRegLoading(true)
		try {
			await csrf()
			await api.post('/api/register', {
				name: regForm.name.trim(),
				email: regForm.email.trim(),
				phone: regForm.phone,
				gender: regForm.gender,
				date_of_birth: regForm.date_of_birth,
				district_id: Number(regForm.district_id),
			})
			setRegPendingPhone(regForm.phone)
			setRegStep('otp')
			setRegOtpSent(true)
			setResendTimer(60)
			setRegOtp('')
			setRegOtpMessage('Account created! OTP sent successfully.')
		} catch (err) {
			setRegError(formatApiErrors(err, 'Registration failed. Please check your details.'))
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

	const openAuthPanel = (targetMode) => {
		switchMode(targetMode)
		const hash = authHashForMode(targetMode)
		if (location.pathname !== '/' || location.hash !== hash) {
			navigate({ pathname: '/', hash })
		}
		scrollToAuthPanel()
	}

	useEffect(() => {
		const targetMode = modeFromHash(location.hash)
		if (!targetMode) return
		switchMode(targetMode)
		scrollToAuthPanel()
	}, [location.hash])

	const authNavValue = {
		openLogin: () => openAuthPanel('login'),
		openRegister: () => openAuthPanel('register'),
	}

	const authPanelProps = {
		mode,
		regStep,
		loginForm,
		otpSent,
		otpMessage,
		loginError,
		loginLoading,
		resendTimer,
		regForm,
		regError,
		regLoading,
		regOtp,
		regPendingPhone,
		regOtpMessage,
		filteredDistricts: districts,
		onLoginChange: handleLoginChange,
		onSendOtp: handleSendOtp,
		onEditPhone: handleEditPhone,
		onLoginSubmit: handleLoginSubmit,
		onRegChange: handleRegChange,
		onRegSubmit: handleRegSubmit,
		onRegVerifyOtp: handleRegVerifyOtp,
		onRegSendOtp: handleRegSendOtp,
		onSwitchMode: switchMode,
		onSetRegStep: setRegStep,
		onSetRegOtp: setRegOtp,
	}

	return (
		<AuthPanelNavigationContext.Provider value={authNavValue}>
			<div className="landing-page-home min-w-0 overflow-x-clip">
				<div className="relative landing-hero-wrap">
					<LandingHero navSlot={<LandingNav />} />
				</div>

				<DailyUpdateTicker />

				<div className="landing-body">
					<GetStartedSection authPanelProps={authPanelProps} />
					<PortalServicesSection />
					<PortalStatsBar />
					<PortalBenefitsSection />
					<PortalGuideSection />
					<PortalFaqSection />
					<NeedSupportSection />
					<GovernmentLogosCarousel />
					<LandingFooter />
				</div>

				<LandingFab
					showBackToTop={showBackToTop}
					onBackToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
				/>
			</div>
		</AuthPanelNavigationContext.Provider>
	)
}

export default Login
