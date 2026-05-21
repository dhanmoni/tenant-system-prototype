import { CheckCircle2, Phone } from 'lucide-react'

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

function AuthField({ label, optional, children }) {
	return (
		<label className="auth-panel-field block">
			<span className="auth-panel-label">
				{label}
				{optional ? <span className="font-normal text-slate-400"> (optional)</span> : null}
			</span>
			{children}
		</label>
	)
}

function StepPills({ steps, current }) {
	return (
		<ol className="mb-6 flex items-center gap-2" aria-label="Progress">
			{steps.map((step, index) => {
				const isActive = index === current
				const isDone = index < current
				return (
					<li key={step.id} className="flex flex-1 items-center gap-2">
						<span
							className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
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
							className={`hidden text-xs font-semibold sm:inline ${
								isActive ? 'text-slate-800' : 'text-slate-500'
							}`}
						>
							{step.label}
						</span>
						{index < steps.length - 1 ? (
							<span className="mx-1 hidden h-px flex-1 bg-slate-200 sm:block" aria-hidden />
						) : null}
					</li>
				)
			})}
		</ol>
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
	const loginStep = otpSent ? 1 : 0
	const regStepIndex = regStep === 'otp' ? 1 : 0

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
			className="auth-panel auth-panel--get-started overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg ring-1 ring-slate-200/80"
		>
			<div className="p-4 sm:p-5">
				<div
					className="mb-5 flex rounded-lg bg-slate-100 p-1"
					role="tablist"
					aria-label="Sign in or register"
				>
					<button
						type="button"
						role="tab"
						aria-selected={mode === 'login'}
						className={`auth-panel-tab flex-1 rounded-md py-2.5 text-sm font-bold transition ${
							mode === 'login'
								? 'bg-white text-landing shadow-sm'
								: 'text-slate-600 hover:text-slate-800'
						}`}
						onClick={switchToLogin}
					>
						Log in
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={mode === 'register'}
						className={`auth-panel-tab flex-1 rounded-md py-2.5 text-sm font-bold transition ${
							mode === 'register'
								? 'bg-white text-landing shadow-sm'
								: 'text-slate-600 hover:text-slate-800'
						}`}
						onClick={switchToRegister}
					>
						Register
					</button>
				</div>

				{mode === 'login' ? (
					<>
						<StepPills
							steps={[
								{ id: 'phone', label: 'Phone' },
								{ id: 'otp', label: 'Verify OTP' },
							]}
							current={loginStep}
						/>
						<h2 className="auth-panel-title">Log in to your account</h2>
						<p className="auth-panel-lead mb-4">Use your registered mobile number and OTP.</p>

						<AuthAlert type="success">{otpMessage}</AuthAlert>
						<AuthAlert type="error">{loginError}</AuthAlert>

						<form onSubmit={onLoginSubmit} className="auth-panel-form space-y-4">
							{!otpSent ? (
								<>
									<AuthField label="Mobile number">
										<div className="auth-panel-phone-wrap">
											<span className="auth-panel-phone-prefix" aria-hidden>
												+91
											</span>
											<input
												type="tel"
												name="phone"
												className="auth-panel-input"
												value={loginForm.phone}
												onChange={onLoginChange}
												placeholder="10-digit mobile number"
												autoComplete="tel"
												inputMode="numeric"
												pattern="[0-9]{10}"
												maxLength={10}
												title="Enter a 10-digit mobile number"
												required
											/>
										</div>
									</AuthField>
									<button
										type="button"
										className="auth-panel-btn-primary w-full"
										onClick={onSendOtp}
										disabled={loginLoading}
									>
										{loginLoading ? 'Please wait…' : 'Send OTP'}
									</button>
								</>
							) : (
								<>
									<div className="auth-panel-phone-display">
										<div className="flex items-center gap-2">
											<Phone className="h-4 w-4 text-landing" aria-hidden />
											<div>
												<p className="text-xs text-slate-500">OTP sent to</p>
												<p className="font-bold text-slate-800">+91 {loginForm.phone}</p>
											</div>
										</div>
										<button
											type="button"
											className="auth-panel-link"
											onClick={onEditPhone}
										>
											Change
										</button>
									</div>
									<AuthField label="Enter 6-digit OTP">
										<input
											type="text"
											name="otp"
											className="auth-panel-input auth-panel-input-otp"
											value={loginForm.otp}
											onChange={onLoginChange}
											maxLength={6}
											placeholder="······"
											inputMode="numeric"
											autoComplete="one-time-code"
											autoFocus
											required
										/>
									</AuthField>
									<div className="text-center text-sm text-slate-600">
										{resendTimer > 0 ? (
											<span>Resend OTP in {resendTimer}s</span>
										) : (
											<button type="button" className="auth-panel-link" onClick={onSendOtp}>
												Resend OTP
											</button>
										)}
									</div>
									<button
										type="submit"
										className="auth-panel-btn-primary w-full"
										disabled={loginLoading}
									>
										{loginLoading ? 'Signing in…' : 'Log in'}
									</button>
								</>
							)}
						</form>
					</>
				) : regStep === 'details' ? (
					<>
						<StepPills
							steps={[
								{ id: 'details', label: 'Your details' },
								{ id: 'otp', label: 'Verify OTP' },
							]}
							current={regStepIndex}
						/>
						<h2 className="auth-panel-title">Create your account</h2>
						<p className="auth-panel-lead mb-4">
							Register with your details. We will send an OTP to your mobile.
						</p>

						<AuthAlert type="error">{regError}</AuthAlert>

						<form onSubmit={onRegSubmit} className="auth-panel-form space-y-4">
							<AuthField label="Full name">
								<input
									type="text"
									name="name"
									className="auth-panel-input"
									value={regForm.name}
									onChange={onRegChange}
									placeholder="As per official ID"
									required
								/>
							</AuthField>
							<AuthField label="Email">
								<input
									type="email"
									name="email"
									className="auth-panel-input"
									value={regForm.email}
									onChange={onRegChange}
									placeholder="you@example.com"
									autoComplete="email"
									required
								/>
							</AuthField>
							<AuthField label="Mobile number">
								<div className="auth-panel-phone-wrap">
									<span className="auth-panel-phone-prefix" aria-hidden>
										+91
									</span>
									<input
										type="tel"
										name="phone"
										className="auth-panel-input"
										value={regForm.phone}
										onChange={onRegChange}
										placeholder="10-digit mobile number"
										autoComplete="tel"
										inputMode="numeric"
										pattern="[0-9]{10}"
										maxLength={10}
										title="Enter a 10-digit mobile number"
										required
									/>
								</div>
							</AuthField>
							<AuthField label="District">
								<select
									name="district_id"
									className="auth-panel-input auth-panel-select"
									value={regForm.district_id}
									onChange={onRegChange}
									required
								>
									<option value="">Select district</option>
									{filteredDistricts.map((d) => (
										<option key={d.id} value={d.id}>
											{d.name}
										</option>
									))}
								</select>
							</AuthField>
							<div className="flex gap-4">
								<div className="flex-1">
									<AuthField label="Gender">
										<select
											name="gender"
											className="auth-panel-input auth-panel-select"
											value={regForm.gender}
											onChange={onRegChange}
											required
										>
											<option value="">Select gender</option>
											<option value="Male">Male</option>
											<option value="Female">Female</option>
											<option value="Other">Other</option>
										</select>
									</AuthField>
								</div>
								<div className="flex-1">
									<AuthField label="Date of Birth">
										<input
											type="date"
											name="date_of_birth"
											className="auth-panel-input"
											value={regForm.date_of_birth}
											onChange={onRegChange}
											max={new Date().toISOString().split('T')[0]}
											required
										/>
									</AuthField>
								</div>
							</div>
							<button type="submit" className="auth-panel-btn-primary w-full" disabled={regLoading}>
								{regLoading ? 'Processing…' : 'Create account & send OTP'}
							</button>
						</form>
					</>
				) : (
					<>
						<StepPills
							steps={[
								{ id: 'details', label: 'Your details' },
								{ id: 'otp', label: 'Verify OTP' },
							]}
							current={1}
						/>
						<h2 className="auth-panel-title">Verify your mobile</h2>
						<p className="auth-panel-lead mb-4">Enter the OTP sent to +91 {regPendingPhone}.</p>

						<AuthAlert type="success">{regOtpMessage}</AuthAlert>
						<AuthAlert type="error">{regError}</AuthAlert>

						<form onSubmit={onRegVerifyOtp} className="auth-panel-form space-y-4">
							<div className="auth-panel-phone-display">
								<div>
									<p className="text-xs text-slate-500">Verifying</p>
									<p className="font-bold text-slate-800">+91 {regPendingPhone}</p>
								</div>
								<button
									type="button"
									className="auth-panel-link"
									onClick={() => onSetRegStep('details')}
								>
									Change
								</button>
							</div>
							<AuthField label="Enter 6-digit OTP">
								<input
									type="text"
									name="regOtp"
									className="auth-panel-input auth-panel-input-otp"
									value={regOtp}
									onChange={(e) => onSetRegOtp(e.target.value)}
									maxLength={6}
									placeholder="······"
									inputMode="numeric"
									autoComplete="one-time-code"
									autoFocus
									required
								/>
							</AuthField>
							<div className="text-center text-sm text-slate-600">
								{resendTimer > 0 ? (
									<span>Resend OTP in {resendTimer}s</span>
								) : (
									<button type="button" className="auth-panel-link" onClick={onRegSendOtp}>
										Resend OTP
									</button>
								)}
							</div>
							<button type="submit" className="auth-panel-btn-primary w-full" disabled={regLoading}>
								{regLoading ? 'Verifying…' : 'Verify & log in'}
							</button>
						</form>
					</>
				)}

				<p className="mt-5 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
					For your security, a one-time password is sent via SMS to your registered mobile number.
				</p>
			</div>
		</div>
	)
}

export default AuthPanel
