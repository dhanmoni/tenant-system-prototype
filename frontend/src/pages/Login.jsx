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
import { useLanguage } from '../i18n'

function Login({ onLogin }) {
	const navigate = useNavigate()
	const location = useLocation()
	const { t } = useLanguage()

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
				const list = Array.isArray(data.districts) ? data.districts : []
				setDistricts(
					[...list].sort((a, b) =>
						(a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })
					)
				)
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

	const clearLoginMessages = () => {
		setLoginError('')
		setOtpMessage('')
	}

	const clearRegMessages = () => {
		setRegError('')
		setRegOtpMessage('')
	}

	const resetLoginOtpFlow = () => {
		setOtpSent(false)
		setOtpMessage('')
		setLoginError('')
		setLoginForm((prev) => ({ ...prev, otp: '' }))
		setResendTimer(0)
	}

	const resetRegOtpFlow = () => {
		setRegStep('details')
		setRegOtpSent(false)
		setRegOtp('')
		setRegPendingPhone('')
		setRegOtpMessage('')
		setRegError('')
		setResendTimer(0)
	}

	const handleLoginChange = (e) => {
		const { name, value } = e.target
		const nextValue = name === 'phone' ? sanitizeMobileInput(value) : value

		if (name === 'phone') {
			setLoginForm((prev) => ({ ...prev, phone: nextValue, otp: '' }))
			if (otpSent) {
				setOtpSent(false)
				setResendTimer(0)
			}
			clearLoginMessages()
			return
		}

		setLoginForm((prev) => ({ ...prev, [name]: nextValue }))
		// Keep "OTP sent" success visible while the user types the code
		if (name === 'otp') {
			setLoginError('')
			return
		}
		clearLoginMessages()
	}

	const handleSendOtp = () => {
		clearLoginMessages()
		if (!/^\d{10}$/.test(loginForm.phone)) {
			setLoginError(t('auth.invalidPhone'))
			return
		}
		setLoginForm((prev) => ({ ...prev, otp: '' }))
		setOtpSent(true)
		setResendTimer(60)
		setOtpMessage(t('auth.otpSent'))
	}

	const handleEditPhone = () => {
		resetLoginOtpFlow()
	}

	const handleLoginSubmit = async (e) => {
		e.preventDefault()
		clearLoginMessages()
		if (!otpSent) {
			handleSendOtp()
			return
		}
		if (!/^\d{6}$/.test(loginForm.otp || '')) {
			setLoginError(t('auth.enterOtpError'))
			return
		}
		setLoginLoading(true)
		try {
			await csrf()
			const { data } = await api.post('/api/login', loginForm)
			onLogin(data.user)
			const fromPath = location.state?.from?.pathname || ''
			const fromSearch = location.state?.from?.search || location.search
			const pendingRef = localStorage.getItem('pendingJoinRef')

			let finalTarget = '/dashboard'
			if (fromPath.includes('/join') || fromPath.includes('/dashboard/join')) {
				finalTarget = fromPath + fromSearch
			} else if (location.search.includes('ref=')) {
				finalTarget = `/dashboard/join${location.search}`
			} else if (pendingRef) {
				finalTarget = `/dashboard/join${pendingRef}`
			}
			navigate(finalTarget, { replace: true })
		} catch (err) {
			setLoginError(formatApiErrors(err, t('auth.loginFailed'), t))
		} finally {
			setLoginLoading(false)
		}
	}

	const handleRegChange = (e) => {
		const { name, value } = e.target
		const nextValue = name === 'phone' ? sanitizeMobileInput(value) : value
		setRegForm((prev) => ({ ...prev, [name]: nextValue }))
		clearRegMessages()
	}

	const handleRegSendOtp = () => {
		clearRegMessages()
		if (!regPendingPhone?.trim()) {
			setRegError(t('auth.phoneMissing'))
			return
		}
		setRegOtpSent(true)
		setRegOtp('')
		setResendTimer(60)
		setRegOtpMessage(t('auth.otpSent'))
	}

	const handleRegVerifyOtp = async (e) => {
		e.preventDefault()
		clearRegMessages()

		if (!regOtpSent) {
			setRegError(t('auth.sendOtpFirst'))
			return
		}
		if (!/^\d{6}$/.test(regOtp || '')) {
			setRegError(t('auth.enterOtpError'))
			return
		}

		setRegLoading(true)
		try {
			await csrf()
			const { data } = await api.post('/api/login', { phone: regPendingPhone, otp: regOtp })
			onLogin(data.user)
			const fromPath = location.state?.from?.pathname || ''
			const fromSearch = location.state?.from?.search || location.search
			const pendingRef = localStorage.getItem('pendingJoinRef')

			let finalTarget = '/dashboard'
			if (fromPath.includes('/join') || fromPath.includes('/dashboard/join')) {
				finalTarget = fromPath + fromSearch
			} else if (location.search.includes('ref=')) {
				finalTarget = `/dashboard/join${location.search}`
			} else if (pendingRef) {
				finalTarget = `/dashboard/join${pendingRef}`
			}
			navigate(finalTarget, { replace: true })
		} catch (err) {
			setRegError(formatApiErrors(err, t('auth.otpVerifyFailed'), t))
		} finally {
			setRegLoading(false)
		}
	}

	const validateRegForm = () => {
		if (!regForm.name?.trim()) return t('auth.enterFullName')
		if (!regForm.email?.trim()) return t('auth.enterEmail')
		if (!/^\d{10}$/.test(regForm.phone || '')) {
			return t('auth.invalidPhone')
		}
		if (!regForm.district_id) return t('auth.selectDistrictError')
		if (!regForm.gender) return t('auth.selectGenderError')
		if (!regForm.date_of_birth) return t('auth.enterDob')
		const dob = new Date(regForm.date_of_birth)
		const minAgeDate = new Date()
		minAgeDate.setFullYear(minAgeDate.getFullYear() - 18)
		if (dob > minAgeDate) return t('auth.minAgeError')
		return null
	}

	const handleRegSubmit = async (e) => {
		e.preventDefault()
		clearRegMessages()

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
			setRegError('')
			setRegOtpMessage(t('auth.accountCreatedOtp'))
		} catch (err) {
			setRegError(formatApiErrors(err, t('auth.registrationFailed'), t))
		} finally {
			setRegLoading(false)
		}
	}

	const handleSetRegOtp = (next) => {
		setRegOtp(next)
		// Keep "OTP sent" success visible while the user types the code
		setRegError('')
	}

	const handleSetRegStep = (step) => {
		if (step === 'details') {
			resetRegOtpFlow()
			return
		}
		setRegStep(step)
		clearRegMessages()
	}

	const switchMode = (newMode) => {
		clearLoginMessages()
		clearRegMessages()
		setOtpSent(false)
		setLoginForm({ phone: '', otp: '' })
		setLoginLoading(false)
		setRegLoading(false)
		resetRegOtpFlow()
		setResendTimer(0)
		setMode(newMode)
	}

	const openAuthPanel = (targetMode) => {
		switchMode(targetMode)
		const hash = authHashForMode(targetMode)
		navigate(
			{ pathname: location.pathname, search: location.search, hash },
			{ state: location.state, replace: true }
		)
		scrollToAuthPanel()
	}

	useEffect(() => {
		const previous = history.scrollRestoration
		history.scrollRestoration = 'manual'
		return () => {
			history.scrollRestoration = previous
		}
	}, [])

	useEffect(() => {
		if (!modeFromHash(location.hash)) {
			window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
		}
	}, [location.pathname, location.hash])

	useEffect(() => {
		const targetMode = modeFromHash(location.hash)
		if (!targetMode) return
		switchMode(targetMode)
		scrollToAuthPanel()
		requestAnimationFrame(() => {
			const focusId = targetMode === 'register' ? 'register-phone' : 'login-phone'
			document.getElementById(focusId)?.focus({ preventScroll: true })
		})
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
		onSetRegStep: handleSetRegStep,
		onSetRegOtp: handleSetRegOtp,
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
					<PortalBenefitsSection className="portal-benefits--after-stats" />
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
