import { CheckCircle2, Phone } from 'lucide-react'
import { useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import OtpInput from './OtpInput'
import { easeOutExpo } from '../../utils/landingMotion'
import { useLanguage } from '../../i18n'

/** Login ↔ Register — soft crossfade */
const modeVariants = {
	enter: { opacity: 0, scale: 0.985 },
	center: {
		opacity: 1,
		scale: 1,
		transition: { duration: 0.28, ease: easeOutExpo },
	},
	exit: {
		opacity: 0,
		scale: 0.99,
		transition: { duration: 0.16, ease: easeOutExpo },
	},
}

function AuthAlert({ type, children }) {
	if (!children) return null
	const isError = type === 'error'
	return (
		<div
			className={`rounded-lg border px-3 py-2.5 text-sm ${
				isError
					? 'border-red-200 bg-red-50 text-red-800'
					: 'border-emerald-200 bg-emerald-50 text-emerald-800'
			}`}
			role={isError ? 'alert' : 'status'}
		>
			{children}
		</div>
	)
}

function AuthField({ label, optional, optionalLabel, className = '', children }) {
	return (
		<label className={`auth-panel-field block${className ? ` ${className}` : ''}`}>
			<span className="auth-panel-label">
				{label}
				{optional ? <span className="font-normal text-slate-400"> {optionalLabel}</span> : null}
			</span>
			{children}
		</label>
	)
}

function StepPills({ steps, current, progressLabel }) {
	return (
		<ol className="auth-panel-steps mb-6 flex items-center gap-2" aria-label={progressLabel}>
			{steps.map((step, index) => {
				const isActive = index === current
				const isDone = index < current
				return (
					<li key={step.id} className="auth-panel-steps__item flex flex-1 items-center gap-2">
						<span
							className={`auth-panel-steps__badge flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
								isActive
									? 'bg-landing text-white'
									: isDone
										? 'bg-landing/20 text-landing'
										: 'bg-slate-100 text-slate-500'
							}`}
						>
							{isDone ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : index + 1}
						</span>
						<span
							className={`auth-panel-steps__label inline text-[11px] font-semibold leading-none ${
								isActive ? 'text-slate-800' : 'text-slate-500'
							}`}
						>
							{step.label}
						</span>
						{index < steps.length - 1 ? (
							<span className="auth-panel-steps__rule mx-1 hidden h-px flex-1 bg-slate-200 sm:block" aria-hidden />
						) : null}
					</li>
				)
			})}
		</ol>
	)
}

/** Height resize only for Login ↔ Register — step 1 → 2 snaps with no bottom morph */
function AutoHeight({ reduceMotion, watchKey, children }) {
	const measureRef = useRef(null)
	const prevKeyRef = useRef(watchKey)
	const modeAnimRef = useRef(false)
	const [height, setHeight] = useState('auto')
	const [animate, setAnimate] = useState(false)

	useLayoutEffect(() => {
		const node = measureRef.current
		if (!node) return undefined

		const keyChanged = prevKeyRef.current !== watchKey
		prevKeyRef.current = watchKey

		if (keyChanged) {
			modeAnimRef.current = true
			setAnimate(true)
		}

		const update = () => {
			const next = node.offsetHeight
			setHeight(next)
			if (!modeAnimRef.current) {
				setAnimate(false)
			}
		}

		update()
		const ro = new ResizeObserver(update)
		ro.observe(node)

		let settleTimer
		if (keyChanged) {
			settleTimer = window.setTimeout(() => {
				modeAnimRef.current = false
				setAnimate(false)
				setHeight(node.offsetHeight)
			}, 380)
		}

		return () => {
			ro.disconnect()
			if (settleTimer) window.clearTimeout(settleTimer)
		}
	}, [watchKey])

	if (reduceMotion) {
		return <div className="auth-panel-views">{children}</div>
	}

	return (
		<motion.div
			className="auth-panel-views"
			initial={false}
			animate={{ height: height === 'auto' ? undefined : height }}
			transition={animate ? { duration: 0.35, ease: easeOutExpo } : { duration: 0 }}
			style={{ overflow: animate ? 'hidden' : 'visible' }}
		>
			<div ref={measureRef} className="auth-panel-views__measure">
				{children}
			</div>
		</motion.div>
	)
}

function AuthPanel({
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
	filteredDistricts,
	onLoginChange,
	onSendOtp,
	onEditPhone,
	onLoginSubmit,
	onRegChange,
	onRegSubmit,
	onRegVerifyOtp,
	onRegSendOtp,
	onSwitchMode,
	onSetRegStep,
	onSetRegOtp,
}) {
	const { t } = useLanguage()
	const reduceMotion = useReducedMotion()
	const loginStep = otpSent ? 1 : 0
	const regStepIndex = regStep === 'otp' ? 1 : 0
	const heightWatchKey = mode
	const dobMax = (() => {
		const d = new Date()
		d.setFullYear(d.getFullYear() - 18)
		return d.toISOString().split('T')[0]
	})()

	const switchToLogin = (e) => {
		e?.preventDefault?.()
		onSwitchMode('login')
	}

	const switchToRegister = (e) => {
		e?.preventDefault?.()
		onSwitchMode('register')
	}

	return (
		<div
			id="auth-card-section"
			className="auth-panel auth-panel--get-started auth-panel--modern"
		>
			<div className="auth-panel-card-inner">
				<div
					className="auth-panel-tabs flex"
					role="tablist"
					aria-label={t('auth.tabs')}
				>
					<button
						type="button"
						role="tab"
						aria-selected={mode === 'login'}
						className={`auth-panel-tab flex-1 py-2.5 text-sm font-bold transition ${
							mode === 'login' ? 'auth-panel-tab--active' : ''
						}`}
						onClick={switchToLogin}
					>
						{t('auth.logIn')}
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={mode === 'register'}
						className={`auth-panel-tab flex-1 py-2.5 text-sm font-bold transition ${
							mode === 'register' ? 'auth-panel-tab--active' : ''
						}`}
						onClick={switchToRegister}
					>
						{t('auth.register')}
					</button>
				</div>

				<AutoHeight reduceMotion={reduceMotion} watchKey={heightWatchKey}>
					<AnimatePresence mode="wait" initial={false}>
						{mode === 'login' ? (
							<motion.div
								key="login"
								className="auth-panel-body"
								role="tabpanel"
								variants={reduceMotion ? undefined : modeVariants}
								initial={reduceMotion ? false : 'enter'}
								animate={reduceMotion ? undefined : 'center'}
								exit={reduceMotion ? undefined : 'exit'}
							>
								<StepPills
									progressLabel={t('auth.progress')}
									steps={[
										{ id: 'phone', label: t('auth.stepPhone') },
										{ id: 'otp', label: t('auth.stepOtp') },
									]}
									current={loginStep}
								/>
								<h2 className="auth-panel-title">
									{otpSent ? t('auth.verifyOtp') : t('auth.welcomeBack')}
								</h2>
								<p className="auth-panel-lead">
									{otpSent ? t('auth.otpLead') : t('auth.loginLead')}
								</p>

								<AuthAlert type="success">{otpMessage}</AuthAlert>
								<AuthAlert type="error">{loginError}</AuthAlert>

								<form onSubmit={onLoginSubmit} className="auth-panel-form space-y-4">
									{!otpSent ? (
										<>
											<AuthField label={t('auth.mobileNumber')} className="auth-panel-field--phone">
												<div className="auth-panel-phone-wrap auth-panel-phone-wrap--entry">
													<span className="auth-panel-phone-prefix" aria-hidden>
														+91
													</span>
													<input
														id="login-phone"
														type="tel"
														name="phone"
														className="auth-panel-input auth-panel-input--phone"
														value={loginForm.phone}
														onChange={onLoginChange}
														placeholder={t('auth.mobilePlaceholder')}
														autoComplete="tel"
														inputMode="numeric"
														pattern="[0-9]{10}"
														maxLength={10}
														title={t('auth.mobileTitle')}
														required
													/>
												</div>
											</AuthField>
											<button
												type="button"
												className="auth-panel-btn-primary auth-panel-btn-primary--cta w-full"
												onClick={onSendOtp}
												disabled={loginLoading}
											>
												{loginLoading ? t('auth.pleaseWait') : t('auth.sendOtp')}
											</button>
										</>
									) : (
										<>
											<div className="auth-panel-phone-display auth-panel-phone-display--compact">
												<div className="auth-panel-phone-display__main">
													<Phone className="auth-panel-phone-display__icon" aria-hidden />
													<div>
														<p className="auth-panel-phone-display__label">{t('auth.otpSentTo')}</p>
														<p className="auth-panel-phone-display__number">
															+91 {loginForm.phone}
														</p>
													</div>
												</div>
												<button type="button" className="auth-panel-link" onClick={onEditPhone}>
													{t('auth.change')}
												</button>
											</div>
											<AuthField label={t('auth.enterOtp')}>
												<OtpInput
													id="login-otp"
													value={loginForm.otp}
													onChange={(next) =>
														onLoginChange({ target: { name: 'otp', value: next } })
													}
													autoFocus
												/>
											</AuthField>
											<div className="text-center text-sm text-slate-600">
												{resendTimer > 0 ? (
													<span>{t('auth.resendIn', { seconds: resendTimer })}</span>
												) : (
													<button type="button" className="auth-panel-link" onClick={onSendOtp}>
														{t('auth.resendOtp')}
													</button>
												)}
											</div>
											<button
												type="submit"
												className="auth-panel-btn-primary auth-panel-btn-primary--cta w-full"
												disabled={loginLoading}
											>
												{loginLoading ? t('auth.signingIn') : t('auth.logIn')}
											</button>
										</>
									)}
								</form>
							</motion.div>
						) : (
							<motion.div
								key="register"
								className="auth-panel-body"
								role="tabpanel"
								variants={reduceMotion ? undefined : modeVariants}
								initial={reduceMotion ? false : 'enter'}
								animate={reduceMotion ? undefined : 'center'}
								exit={reduceMotion ? undefined : 'exit'}
							>
								<StepPills
									progressLabel={t('auth.progress')}
									steps={[
										{ id: 'details', label: t('auth.stepDetails') },
										{ id: 'otp', label: t('auth.stepOtp') },
									]}
									current={regStepIndex}
								/>

								{regStep === 'details' ? (
									<>
										<h2 className="auth-panel-title">{t('auth.createAccount')}</h2>
										<p className="auth-panel-lead">{t('auth.registerLead')}</p>
										<AuthAlert type="error">{regError}</AuthAlert>

										<form onSubmit={onRegSubmit} className="auth-panel-form space-y-4">
											<div className="auth-panel-field-row">
												<AuthField label={t('auth.fullName')}>
													<input
														type="text"
														name="name"
														className="auth-panel-input"
														value={regForm.name}
														onChange={onRegChange}
														placeholder={t('auth.fullName')}
														required
													/>
												</AuthField>
												<AuthField label={t('auth.email')}>
													<input
														type="email"
														name="email"
														className="auth-panel-input"
														value={regForm.email}
														onChange={onRegChange}
														placeholder={t('auth.emailPlaceholder')}
														autoComplete="email"
														required
													/>
												</AuthField>
											</div>
											<AuthField label={t('auth.mobileNumber')} className="auth-panel-field--phone">
												<div className="auth-panel-phone-wrap auth-panel-phone-wrap--entry">
													<span className="auth-panel-phone-prefix" aria-hidden>
														+91
													</span>
													<input
														id="register-phone"
														type="tel"
														name="phone"
														className="auth-panel-input auth-panel-input--phone"
														value={regForm.phone}
														onChange={onRegChange}
														placeholder={t('auth.mobilePlaceholder')}
														autoComplete="tel"
														inputMode="numeric"
														pattern="[0-9]{10}"
														maxLength={10}
														title={t('auth.mobileTitle')}
														required
													/>
												</div>
											</AuthField>
											<AuthField label={t('auth.district')}>
												<select
													name="district_id"
													className="auth-panel-select"
													value={regForm.district_id}
													onChange={onRegChange}
													required
												>
													<option value="">{t('auth.selectDistrict')}</option>
													{filteredDistricts.map((d) => (
														<option key={d.id} value={d.id}>
															{d.name}
														</option>
													))}
												</select>
											</AuthField>
											<div className="auth-panel-field-row">
												<AuthField label={t('auth.gender')}>
													<select
														name="gender"
														className="auth-panel-select"
														value={regForm.gender}
														onChange={onRegChange}
														required
													>
														<option value="">{t('auth.selectGender')}</option>
														<option value="Male">{t('auth.male')}</option>
														<option value="Female">{t('auth.female')}</option>
														<option value="Other">{t('auth.other')}</option>
													</select>
												</AuthField>
												<AuthField label={t('auth.dob')}>
													<input
														type="date"
														name="date_of_birth"
														className="auth-panel-input"
														value={regForm.date_of_birth}
														onChange={onRegChange}
														max={dobMax}
														required
													/>
												</AuthField>
											</div>
											<button
												type="submit"
												className="auth-panel-btn-primary auth-panel-btn-primary--cta w-full"
												disabled={regLoading}
											>
												{regLoading ? t('auth.processing') : t('auth.createAccount')}
											</button>
										</form>
									</>
								) : (
									<>
										<h2 className="auth-panel-title">{t('auth.verifyMobile')}</h2>
										<p className="auth-panel-lead">
											{t('auth.verifyLead', { phone: regPendingPhone })}
										</p>
										<AuthAlert type="success">{regOtpMessage}</AuthAlert>
										<AuthAlert type="error">{regError}</AuthAlert>

										<form onSubmit={onRegVerifyOtp} className="auth-panel-form space-y-4">
											<div className="auth-panel-phone-display auth-panel-phone-display--compact">
												<div className="auth-panel-phone-display__main">
													<div>
														<p className="auth-panel-phone-display__label">{t('auth.verifying')}</p>
														<p className="auth-panel-phone-display__number">
															+91 {regPendingPhone}
														</p>
													</div>
												</div>
												<button
													type="button"
													className="auth-panel-link"
													onClick={() => onSetRegStep('details')}
												>
													{t('auth.change')}
												</button>
											</div>
											<AuthField label={t('auth.enterOtp')}>
												<OtpInput
													id="register-otp"
													value={regOtp}
													onChange={onSetRegOtp}
													autoFocus
												/>
											</AuthField>
											<div className="text-center text-sm text-slate-600">
												{resendTimer > 0 ? (
													<span>{t('auth.resendIn', { seconds: resendTimer })}</span>
												) : (
													<button type="button" className="auth-panel-link" onClick={onRegSendOtp}>
														{t('auth.resendOtp')}
													</button>
												)}
											</div>
											<button
												type="submit"
												className="auth-panel-btn-primary auth-panel-btn-primary--cta w-full"
												disabled={regLoading}
											>
												{regLoading ? t('auth.verifyingEllipsis') : t('auth.verifyAndLogin')}
											</button>
										</form>
									</>
								)}
							</motion.div>
						)}
					</AnimatePresence>
				</AutoHeight>

				<p className="auth-panel-footnote">{t('auth.footnote')}</p>
			</div>
		</div>
	)
}

export default AuthPanel
