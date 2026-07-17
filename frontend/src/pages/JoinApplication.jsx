import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, useNavigate, useOutletContext } from 'react-router-dom'
import api, { csrf } from '../api'
import DocumentUploadSlot from '../components/forms/DocumentUploadSlot'
import { cleanOptionalValue } from '../utils/tenancyDraft'
import { formatDate } from '../utils/formatters'

const JOIN_STEPS = [
	{ id: 1, label: 'Review application' },
	{ id: 2, label: 'Your details' },
	{ id: 3, label: 'Documents' },
	{ id: 4, label: 'Preview' },
	{ id: 5, label: 'Payment' },
]

function JoinApplication() {
	const { user } = useOutletContext()
	const [searchParams] = useSearchParams()
	const navigate = useNavigate()
	const refCode = searchParams.get('ref') || ''
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [saveToast, setSaveToast] = useState('')
	const [application, setApplication] = useState(null)
	const [submitting, setSubmitting] = useState(false)
	const [joinResult, setJoinResult] = useState(null)
	const [joinStep, setJoinStep] = useState(1)
	const [maxReachedStep, setMaxReachedStep] = useState(1)
	const saveToastTimerRef = useRef(null)

	// Second party form fields
	const [name, setName] = useState('')
	const [address, setAddress] = useState('')
	const [email, setEmail] = useState('')
	const [phone, setPhone] = useState('')
	const [pan, setPan] = useState('')
	const [aadhar, setAadhar] = useState('')
	const [previousTenancy, setPreviousTenancy] = useState('')
	const [photoFile, setPhotoFile] = useState(null)
	const [photoPreview, setPhotoPreview] = useState('')
	const [signatureFile, setSignatureFile] = useState(null)
	const [signaturePreview, setSignaturePreview] = useState('')
	const [panDocumentFile, setPanDocumentFile] = useState(null)
	const [declarationChecked, setDeclarationChecked] = useState(false)
	const [docPreview, setDocPreview] = useState(null)

	// Payment
	const [paymentComplete, setPaymentComplete] = useState(false)
	const [paymentSimulating, setPaymentSimulating] = useState(false)
	const [paymentGrn, setPaymentGrn] = useState('')

	const TOTAL_STEPS = JOIN_STEPS.length
	const maxReachableStep = Math.max(joinStep, maxReachedStep)

	const showSaveToast = useCallback((message = 'Progress saved.') => {
		if (saveToastTimerRef.current) clearTimeout(saveToastTimerRef.current)
		setSaveToast(message)
		saveToastTimerRef.current = setTimeout(() => {
			setSaveToast('')
			saveToastTimerRef.current = null
		}, 3500)
	}, [])

	useEffect(() => () => {
		if (saveToastTimerRef.current) clearTimeout(saveToastTimerRef.current)
	}, [])

	const feeAmount = (() => {
		if (!application?.apply_type) return 0
		const type = application.apply_type.toLowerCase()
		return type === 'joint' ? 50 : type === 'individual' ? 75 : 0
	})()

	const MOBILE_RE = /^\d{10}$/
	const PAN_RE = /^[A-Z]{5}\d{4}[A-Z]$/
	const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

	const fieldErrors = useMemo(() => {
		const errors = {}
		if (phone && !MOBILE_RE.test(String(phone).replace(/\D/g, ''))) {
			errors.phone = 'Must be exactly 10 digits'
		}
		if (email && !EMAIL_RE.test(email.trim())) {
			errors.email = 'Enter a valid email address'
		}
		if (pan && !PAN_RE.test(pan.trim().toUpperCase())) {
			errors.pan = 'Enter a valid PAN (e.g. ABCDE1234F)'
		}
		if (aadhar && aadhar.length > 0 && aadhar.length !== 12) {
			errors.aadhar = 'Aadhaar must be 12 digits'
		}

		if (application) {
			const otherPhone = cleanOptionalValue(
				application.second_party_role === 'LANDLORD'
					? application.tenant_phone
					: application.landlord_phone
			)
			const otherPan = cleanOptionalValue(
				application.second_party_role === 'LANDLORD'
					? application.tenant_pan
					: application.landlord_pan
			)
			const otherEmail = cleanOptionalValue(
				application.second_party_role === 'LANDLORD'
					? application.tenant_email
					: application.landlord_email
			)
			const myPhone = String(phone || '').replace(/\D/g, '')
			const theirPhone = String(otherPhone || '').replace(/\D/g, '')
			if (myPhone && theirPhone && myPhone === theirPhone) {
				errors.phone = 'Cannot match the other party’s mobile'
			}
			if (pan && otherPan && pan.trim().toUpperCase() === otherPan.toUpperCase()) {
				errors.pan = 'Cannot match the other party’s PAN'
			}
			if (email && otherEmail && email.trim().toLowerCase() === otherEmail.toLowerCase()) {
				errors.email = 'Cannot match the other party’s email'
			}
		}

		return errors
	}, [phone, email, pan, aadhar, application])

	const hasDetailsFieldErrors = Boolean(
		fieldErrors.phone || fieldErrors.email || fieldErrors.pan || fieldErrors.aadhar
	)

	const handleMockPayment = () => {
		setPaymentSimulating(true)
		setTimeout(() => {
			setPaymentSimulating(false)
			setPaymentComplete(true)
			setPaymentGrn(String(Math.floor(Math.random() * 1000000000)))
			showSaveToast('Payment completed.')
		}, 1500)
	}

	const scrollFormToTop = useCallback(() => {
		const main = document.getElementById('dashboard-primary-content')
		if (main?.scrollTo) {
			main.scrollTo({ top: 0, behavior: 'auto' })
		} else {
			window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
		}
	}, [])

	useEffect(() => {
		scrollFormToTop()
	}, [joinStep, scrollFormToTop])

	useEffect(() => {
		if (!refCode) {
			setError('No reference code provided.')
			setLoading(false)
			return
		}
		const lookup = async () => {
			try {
				const { data } = await api.get('/api/tenancy-applications/lookup', {
					params: { ref_code: refCode },
				})
				const appData = data.application
				setApplication(appData)

				const rolePrefix = appData.second_party_role === 'LANDLORD' ? 'landlord' : 'tenant'
				setName(appData[`${rolePrefix}_name`] || '')
				setAddress(appData[`${rolePrefix}_address`] || '')
				setEmail(appData[`${rolePrefix}_email`] || '')
				setPhone(appData[`${rolePrefix}_phone`] || '')
				setPan(appData[`${rolePrefix}_pan`] || '')
				setAadhar(appData[`${rolePrefix}_aadhar`] || '')
			} catch (err) {
				setError(err?.response?.data?.message || 'Failed to load application.')
			} finally {
				setLoading(false)
			}
		}
		lookup()
	}, [refCode, user])

	const goToStep = (stepId) => {
		if (stepId < 1 || stepId > TOTAL_STEPS) return
		if (stepId > maxReachableStep) return
		setJoinStep(stepId)
		setError('')
	}

	const isPdfFile = (file) => file?.type === 'application/pdf' || /\.pdf$/i.test(file?.name || '')

	const openDocPreview = (title, url, isPdf = false, revokeOnClose = false) => {
		if (!url) return
		setDocPreview({ title, url, isPdf, revokeOnClose })
	}

	const openFilePreview = (title, file) => {
		if (!file) return
		openDocPreview(title, URL.createObjectURL(file), isPdfFile(file), true)
	}

	const closeDocPreview = () => {
		if (docPreview?.revokeOnClose && docPreview?.url) {
			URL.revokeObjectURL(docPreview.url)
		}
		setDocPreview(null)
	}

	useEffect(() => {
		if (!docPreview) return undefined
		const onKeyDown = (event) => {
			if (event.key === 'Escape') closeDocPreview()
		}
		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [docPreview])

	const validateDetailsStep = () => {
		if (!name.trim() || !address.trim() || !phone.trim() || !pan.trim()) {
			setError('Please fill in all required fields before continuing.')
			return false
		}
		if (hasDetailsFieldErrors) {
			setError('')
			return false
		}
		return true
	}

	const validateDocumentsStep = () => {
		if (!panDocumentFile) {
			setError('Please upload your PAN card document before continuing.')
			return false
		}
		return true
	}

	const submitJoinApplication = async () => {
		setError('')
		setSubmitting(true)
		try {
			await csrf()
			const formData = new FormData()
			formData.append('ref_code', refCode)
			formData.append('name', name)
			formData.append('address', address)
			formData.append('email', email)
			formData.append('phone', phone)
			formData.append('pan', pan)
			if (aadhar) formData.append('aadhar', aadhar)
			if (application?.second_party_role === 'TENANT') {
				formData.append('previous_tenancy', previousTenancy || '')
			}
			if (photoFile) formData.append('photo', photoFile)
			if (signatureFile) formData.append('signature', signatureFile)
			if (panDocumentFile) formData.append('pan_document', panDocumentFile)

			const { data } = await api.post('/api/tenancy-applications/join', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})
			setJoinResult({
				application_no: data.application_no || application?.application_no,
				ref_code: data.ref_code,
				uid: data.uid,
				status: data.status,
				message: data.message,
				fee_amount: feeAmount,
				payment_grn: paymentGrn,
			})
			scrollFormToTop()
		} catch (err) {
			const data = err?.response?.data
			const errors = data?.errors
			let msg = data?.message || 'Failed to submit'
			if (errors && typeof errors === 'object') {
				const list = Object.entries(errors).flatMap(([field, messages]) =>
					(Array.isArray(messages) ? messages : [messages]).map((m) => `${field}: ${m}`)
				)
				if (list.length) msg = list.join('. ')
			}
			setError(msg)
		} finally {
			setSubmitting(false)
		}
	}

	const handleContinue = (e) => {
		e.preventDefault()
		setError('')

		if (joinStep === 1) {
			setJoinStep(2)
			setMaxReachedStep((prev) => Math.max(prev, 2))
			showSaveToast('Review completed.')
			return
		}
		if (joinStep === 2) {
			if (!validateDetailsStep()) return
			setJoinStep(3)
			setMaxReachedStep((prev) => Math.max(prev, 3))
			showSaveToast('Progress saved.')
			return
		}
		if (joinStep === 3) {
			if (!validateDocumentsStep()) return
			setJoinStep(4)
			setMaxReachedStep((prev) => Math.max(prev, 4))
			showSaveToast('Progress saved.')
			return
		}
		if (joinStep === 4) {
			if (!declarationChecked) {
				setError('You must accept the declaration to proceed to payment.')
				return
			}
			setJoinStep(5)
			setMaxReachedStep((prev) => Math.max(prev, 5))
			showSaveToast('Preview completed.')
			return
		}
		if (joinStep === 5) {
			if (!paymentComplete) {
				setError('You must complete the fee payment before submitting.')
				return
			}
			if (!declarationChecked) {
				setError('You must accept the declaration to submit.')
				return
			}
			submitJoinApplication()
		}
	}

	const openInPrintWindow = (html) => {
		const printWindow = window.open('', '_blank')
		if (!printWindow) return
		printWindow.document.write(html)
		printWindow.document.close()
	}

	const handleDownloadAcknowledgement = async () => {
		if (!joinResult?.application_no) return
		try {
			const res = await api.get(
				`/api/tenancy-applications/${joinResult.application_no}/acknowledgement?print=1`
			)
			openInPrintWindow(res.data)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to open acknowledgement')
		}
	}

	const handleDownloadApplication = async () => {
		if (!joinResult?.application_no) return
		try {
			const res = await api.get(
				`/api/tenancy-applications/${joinResult.application_no}/application-details?print=1`
			)
			openInPrintWindow(res.data)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to open application')
		}
	}

	if (loading) {
		return (
			<div className="ws-uin-apply-loading">Loading application…</div>
		)
	}

	if (error && !application) {
		const alreadyCompleted = /already been completed/i.test(error)
		return (
			<div className="ws-page ws-uin-apply tenancy-certificate-page">
				<div className="uin-confirm">
					<div className="uin-confirm-card">
						<div
							className={`uin-confirm-icon${alreadyCompleted ? ' uin-confirm-icon--info' : ' uin-confirm-icon--error'}`}
							aria-hidden
						>
							{alreadyCompleted ? '✓' : '!'}
						</div>
						<h1 className="uin-confirm-title">
							{alreadyCompleted ? 'Application already completed' : 'Unable to join application'}
						</h1>
						<p className="uin-confirm-lead">{error}</p>
						<div className="uin-confirm-actions">
							<button
								type="button"
								className="ws-btn ws-btn--primary"
								onClick={() => navigate('/dashboard')}
							>
								Back to dashboard
							</button>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (joinResult) {
		const isCompleted = String(joinResult.status || '').toUpperCase() === 'COMPLETED'
		return (
			<div className="ws-page ws-uin-apply tenancy-certificate-page">
				<div className="uin-confirm">
					<div className="uin-confirm-card">
						<div className="uin-confirm-icon" aria-hidden>✓</div>
						<h1 className="uin-confirm-title">
							{isCompleted ? 'Application completed successfully' : 'Details submitted successfully'}
						</h1>
						<p className="uin-confirm-lead">
							{joinResult.message ||
								'Your details have been submitted for this tenancy application.'}
						</p>

						<dl className="uin-confirm-meta">
							<div className="uin-confirm-meta-row">
								<dt>Application number</dt>
								<dd>{joinResult.application_no || '—'}</dd>
							</div>
							{joinResult.uid ? (
								<div className="uin-confirm-meta-row">
									<dt>Tenancy UID</dt>
									<dd>{joinResult.uid}</dd>
								</div>
							) : null}
							<div className="uin-confirm-meta-row">
								<dt>Fee paid</dt>
								<dd>
									₹{joinResult.fee_amount}
									{joinResult.payment_grn ? ` · GRN ${joinResult.payment_grn}` : ''}
								</dd>
							</div>
						</dl>

						{!isCompleted ? (
							<p className="uin-confirm-joint-note">
								Your part is complete. The application will be finalised once the other
								party has also submitted their details.
							</p>
						) : null}

						<div className="uin-confirm-actions">
							<button
								type="button"
								className="ws-btn ws-btn--primary"
								onClick={handleDownloadAcknowledgement}
							>
								Download acknowledgement
							</button>
							<button
								type="button"
								className="ws-btn ws-btn--secondary"
								onClick={handleDownloadApplication}
							>
								Download application
							</button>
							<button
								type="button"
								className="ws-btn ws-btn--outline"
								onClick={() => navigate('/dashboard')}
							>
								Back to dashboard
							</button>
						</div>

						{error ? (
							<div className="ws-alert ws-alert--error uin-confirm-alert">{error}</div>
						) : null}
					</div>
				</div>
			</div>
		)
	}

	if (!application) return null

	const secondRole = application.second_party_role
	const isLandlord = secondRole === 'LANDLORD'
	const roleLabel = isLandlord ? 'Landlord' : 'Tenant'
	const initiatorLabel =
		application.initiator_role === 'LANDLORD'
			? 'Landlord'
			: application.initiator_role === 'TENANT'
				? 'Tenant'
				: application.initiator_role || 'Initiator'

	const displayValue = (value) => {
		const cleaned = cleanOptionalValue(value)
		return cleaned || '—'
	}

	const locationParts = [
		application.district?.name,
		application.area_type,
		application.local_body,
		application.village_ward?.name,
		application.village_name,
	].filter(Boolean)
	const locationLabel = locationParts.length ? locationParts.join(' · ') : '—'

	const parseCharge = (value) => {
		if (value === '' || value == null) return 0
		const n = Number(value)
		return Number.isFinite(n) && n > 0 ? n : 0
	}
	const reviewRentTotal =
		parseCharge(application.property_rent_payable) +
		parseCharge(application.property_charge_electricity) +
		parseCharge(application.property_charge_water) +
		parseCharge(application.property_charge_furnishing) +
		parseCharge(application.property_charge_other_services)

	const hasManager = Boolean(cleanOptionalValue(application.manager_name))

	const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000'
	const storageUrl = (path) => (path ? `${apiBase}/storage/${path}` : '')

	// Merge initiator data with second-party form for full-form preview
	const previewLandlordName = isLandlord ? name : application.landlord_name
	const previewLandlordAddress = isLandlord ? address : application.landlord_address
	const previewLandlordEmail = isLandlord ? email : application.landlord_email
	const previewLandlordPhone = isLandlord ? phone : application.landlord_phone
	const previewLandlordPan = isLandlord ? pan : application.landlord_pan
	const previewLandlordAadhar = isLandlord ? aadhar : application.landlord_aadhar
	const previewLandlordPhoto = isLandlord ? photoPreview : storageUrl(application.landlord_photo_path)
	const previewLandlordSignature = isLandlord
		? signaturePreview
		: storageUrl(application.landlord_signature_path)

	const previewTenantName = isLandlord ? application.tenant_name : name
	const previewTenantAddress = isLandlord ? application.tenant_address : address
	const previewTenantEmail = isLandlord ? application.tenant_email : email
	const previewTenantPhone = isLandlord ? application.tenant_phone : phone
	const previewTenantPan = isLandlord ? application.tenant_pan : pan
	const previewTenantAadhar = isLandlord ? application.tenant_aadhar : aadhar
	const previewTenantPrevious = isLandlord ? application.tenant_previous_tenancy : previousTenancy
	const previewTenantPhoto = isLandlord ? storageUrl(application.tenant_photo_path) : photoPreview
	const previewTenantSignature = isLandlord
		? storageUrl(application.tenant_signature_path)
		: signaturePreview

	const managerPan = cleanOptionalValue(application.manager_pan)
	const managerAadhar = cleanOptionalValue(application.manager_aadhar)
	const managerPhone = cleanOptionalValue(application.manager_phone)
	const managerEmail = cleanOptionalValue(application.manager_email)
	const officeAddress = application.office?.name
		? `${application.office.name}${application.district?.name ? `, ${application.district.name}` : ''}`
		: '________________________'

	return (
		<div className="ws-page ws-uin-apply tenancy-certificate-page">
			{saveToast ? (
				<div className="ws-uin-progress-toast" role="status" aria-live="polite">
					<span className="ws-uin-progress-toast__icon" aria-hidden>✓</span>
					{saveToast}
				</div>
			) : null}
			<header className="ws-uin-apply-head">
				<h1 className="ws-uin-apply-title">Join Tenancy Application</h1>
				<p className="ws-uin-apply-lead">
					Complete each stage in order as <strong>{roleLabel}</strong> for application{' '}
					<strong>{application.application_no}</strong>.
				</p>
			</header>

			<nav
				className="ws-uin-h-stepper"
				aria-label="Join application stages"
				style={{
					'--ws-uin-progress': `${JOIN_STEPS.length <= 1 ? 0 : ((joinStep - 1) / (JOIN_STEPS.length - 1)) * 100}%`,
				}}
			>
				<div className="ws-uin-h-stepper__track" aria-hidden>
					<span className="ws-uin-h-stepper__progress" />
				</div>
				<ol className="ws-uin-h-stepper__list">
					{JOIN_STEPS.map((step) => {
						const done = joinStep > step.id || maxReachedStep >= step.id
						const active = joinStep === step.id
						const reachable = step.id <= maxReachableStep
						return (
							<li key={step.id}>
								<button
									type="button"
									className={`ws-uin-h-stepper__item${active ? ' is-active' : ''}${done && !active ? ' is-done' : ''}`}
									disabled={!reachable}
									aria-current={active ? 'step' : undefined}
									onClick={() => {
										if (reachable) goToStep(step.id)
									}}
								>
									<span className="ws-uin-h-stepper__num">{done && !active ? '✓' : step.id}</span>
									<span className="ws-uin-h-stepper__label">{step.label}</span>
								</button>
							</li>
						)
					})}
				</ol>
			</nav>

			<div className="ws-uin-apply-body-full">
				<div className="ws-uin-apply-main">
					{error ? <div className="ws-alert ws-alert--error">{error}</div> : null}

					<form
						className={`tenancy-form ws-uin-apply-form${joinStep === 3 ? ' ws-uin-apply-form--docs-step' : ''}${joinStep === 4 ? ' ws-uin-apply-form--preview-step' : ''}`}
						onSubmit={handleContinue}
					>
						{/* Step 1: Review initiator application */}
						{joinStep === 1 && (
							<div className="join-app-summary join-review">
								<header className="join-review__intro">
									<h2 className="tenancy-step-heading">Review application</h2>
									<p className="ws-uin-apply-lead">
										Review the details submitted by the <strong>{initiatorLabel}</strong> before
										entering your information as <strong>{roleLabel}</strong>.
									</p>
								</header>

								<section className="join-review__card">
									<header className="join-review__card-head">
										<span className="join-review__card-num">1</span>
										<div>
											<h3 className="join-review__card-title">Application overview</h3>
											<p className="join-review__card-lead">Registration and office details for this joint application.</p>
										</div>
									</header>
									<div className="join-review__grid">
										<div className="join-review__field">
											<span className="join-review__label">Application no.</span>
											<span className="join-review__value">{displayValue(application.application_no)}</span>
										</div>
										<div className="join-review__field">
											<span className="join-review__label">Application type</span>
											<span className="join-review__value">{displayValue(application.apply_type)}</span>
										</div>
										<div className="join-review__field">
											<span className="join-review__label">Agreement date</span>
											<span className="join-review__value">{formatDate(application.registration_date) || '—'}</span>
										</div>
										<div className="join-review__field">
											<span className="join-review__label">Initiated by</span>
											<span className="join-review__value">{initiatorLabel}</span>
										</div>
										<div className="join-review__field">
											<span className="join-review__label">Your role</span>
											<span className="join-review__value">{roleLabel}</span>
										</div>
										<div className="join-review__field">
											<span className="join-review__label">Circle office</span>
											<span className="join-review__value">{displayValue(application.office?.name)}</span>
										</div>
										<div className="join-review__field join-review__field--wide">
											<span className="join-review__label">Location</span>
											<span className="join-review__value">{locationLabel}</span>
										</div>
									</div>
								</section>

								<section className="join-review__card">
									<header className="join-review__card-head">
										<span className="join-review__card-num">2</span>
										<div>
											<h3 className="join-review__card-title">Landlord details</h3>
											<p className="join-review__card-lead">
												{application.initiator_role === 'LANDLORD'
													? 'Submitted by the initiator.'
													: 'Details provided for the landlord party.'}
											</p>
										</div>
									</header>
									<div className="join-review__grid">
										<div className="join-review__field">
											<span className="join-review__label">Name</span>
											<span className="join-review__value">{displayValue(application.landlord_name)}</span>
										</div>
										<div className="join-review__field">
											<span className="join-review__label">PAN</span>
											<span className="join-review__value">{displayValue(application.landlord_pan)}</span>
										</div>
										<div className="join-review__field">
											<span className="join-review__label">Mobile</span>
											<span className="join-review__value">{displayValue(application.landlord_phone)}</span>
										</div>
										<div className="join-review__field">
											<span className="join-review__label">Email</span>
											<span className="join-review__value">{displayValue(application.landlord_email)}</span>
										</div>
										<div className="join-review__field join-review__field--wide">
											<span className="join-review__label">Address</span>
											<span className="join-review__value">{displayValue(application.landlord_address)}</span>
										</div>
									</div>
								</section>

								<section className="join-review__card">
									<header className="join-review__card-head">
										<span className="join-review__card-num">3</span>
										<div>
											<h3 className="join-review__card-title">Tenant details</h3>
											<p className="join-review__card-lead">
												{application.initiator_role === 'TENANT'
													? 'Submitted by the initiator.'
													: 'Details provided for the tenant party.'}
											</p>
										</div>
									</header>
									<div className="join-review__grid">
										<div className="join-review__field">
											<span className="join-review__label">Name</span>
											<span className="join-review__value">{displayValue(application.tenant_name)}</span>
										</div>
										<div className="join-review__field">
											<span className="join-review__label">PAN</span>
											<span className="join-review__value">{displayValue(application.tenant_pan)}</span>
										</div>
										<div className="join-review__field">
											<span className="join-review__label">Mobile</span>
											<span className="join-review__value">{displayValue(application.tenant_phone)}</span>
										</div>
										<div className="join-review__field">
											<span className="join-review__label">Email</span>
											<span className="join-review__value">{displayValue(application.tenant_email)}</span>
										</div>
										<div className="join-review__field join-review__field--wide">
											<span className="join-review__label">Address</span>
											<span className="join-review__value">{displayValue(application.tenant_address)}</span>
										</div>
										{cleanOptionalValue(application.tenant_previous_tenancy) ? (
											<div className="join-review__field join-review__field--wide">
												<span className="join-review__label">Previous tenancy</span>
												<span className="join-review__value">{application.tenant_previous_tenancy}</span>
											</div>
										) : null}
									</div>
								</section>

								{hasManager ? (
									<section className="join-review__card">
										<header className="join-review__card-head">
											<span className="join-review__card-num">4</span>
											<div>
												<h3 className="join-review__card-title">Property manager details</h3>
												<p className="join-review__card-lead">Manager details recorded on this application.</p>
											</div>
										</header>
										<div className="join-review__grid">
											<div className="join-review__field">
												<span className="join-review__label">Name</span>
												<span className="join-review__value">{displayValue(application.manager_name)}</span>
											</div>
											<div className="join-review__field">
												<span className="join-review__label">PAN</span>
												<span className="join-review__value">{displayValue(application.manager_pan)}</span>
											</div>
											<div className="join-review__field">
												<span className="join-review__label">Mobile</span>
												<span className="join-review__value">{displayValue(application.manager_phone)}</span>
											</div>
											<div className="join-review__field">
												<span className="join-review__label">Email</span>
												<span className="join-review__value">{displayValue(application.manager_email)}</span>
											</div>
											<div className="join-review__field join-review__field--wide">
												<span className="join-review__label">Address</span>
												<span className="join-review__value">{displayValue(application.manager_address)}</span>
											</div>
										</div>
									</section>
								) : null}

								<section className="join-review__card">
									<header className="join-review__card-head">
										<span className="join-review__card-num">{hasManager ? '5' : '4'}</span>
										<div>
											<h3 className="join-review__card-title">Premises &amp; rent details</h3>
											<p className="join-review__card-lead">Property description, tenancy period, rent and charges.</p>
										</div>
									</header>
									<div className="join-review__grid">
										<div className="join-review__field join-review__field--wide">
											<span className="join-review__label">Description of premises</span>
											<span className="join-review__value">{displayValue(application.property_premises_description)}</span>
										</div>
										<div className="join-review__field">
											<span className="join-review__label">Possession date</span>
											<span className="join-review__value">
												{application.property_possession_date
													? formatDate(application.property_possession_date)
													: '—'}
											</span>
										</div>
										<div className="join-review__field">
											<span className="join-review__label">End date</span>
											<span className="join-review__value">
												{application.property_tenancy_end_date
													? formatDate(application.property_tenancy_end_date)
													: '—'}
											</span>
										</div>
										<div className="join-review__field">
											<span className="join-review__label">Duration</span>
											<span className="join-review__value">{displayValue(application.property_tenancy_duration)}</span>
										</div>
										<div className="join-review__field">
											<span className="join-review__label">Monthly rent</span>
											<span className="join-review__value rent-amount">
												₹{Number(application.property_rent_payable || 0).toLocaleString('en-IN')}
											</span>
										</div>
										<div className="join-review__field join-review__field--wide">
											<span className="join-review__label">Furniture / equipment</span>
											<span className="join-review__value">{displayValue(application.property_furniture_description)}</span>
										</div>
										<div className="join-review__field">
											<span className="join-review__label">Electricity</span>
											<span className="join-review__value">{displayValue(application.property_charge_electricity)}</span>
										</div>
										<div className="join-review__field">
											<span className="join-review__label">Water</span>
											<span className="join-review__value">{displayValue(application.property_charge_water)}</span>
										</div>
										<div className="join-review__field">
											<span className="join-review__label">Furnishing / fittings</span>
											<span className="join-review__value">{displayValue(application.property_charge_furnishing)}</span>
										</div>
										<div className="join-review__field">
											<span className="join-review__label">Other services</span>
											<span className="join-review__value">{displayValue(application.property_charge_other_services)}</span>
										</div>
										<div className="join-review__field join-review__field--wide join-review__total">
											<span className="join-review__label">Total monthly amount</span>
											<span className="join-review__value rent-amount">
												₹{reviewRentTotal.toLocaleString('en-IN')}
											</span>
										</div>
									</div>
								</section>
							</div>
						)}

						{/* Step 2: Your details */}
						{joinStep === 2 && (
							<div className="parties-container">
								<section className="tenancy-section">
									<div className="section-header">
										<h2>Your details</h2>
									</div>
									<div className="ws-uin-party-block">
										<header className="ws-uin-party-block__head">
											<span className="ws-uin-party-block__num">1</span>
											<div>
												<h3 className="ws-uin-party-block__title">{roleLabel} details</h3>
												<p className="ws-uin-party-block__lead">
													Confirm or update your details for this joint application.
												</p>
											</div>
										</header>
										<div className="ws-uin-party-fields">
											<label>
												<span className="label-text required">Full name</span>
												<input
													type="text"
													value={name}
													onChange={(e) => setName(e.target.value)}
													required
												/>
											</label>
											<label>
												<span className="label-text required">PAN no.</span>
												<input
													type="text"
													value={pan}
													onChange={(e) => {
														const next = e.target.value.toUpperCase()
														if (/^[A-Z0-9]*$/.test(next)) setPan(next.slice(0, 10))
													}}
													maxLength={10}
													required
													aria-invalid={Boolean(fieldErrors.pan)}
												/>
												{fieldErrors.pan ? (
													<span className="ws-uin-field-error">{fieldErrors.pan}</span>
												) : null}
											</label>
											<label>
												<span className="label-text required">Phone</span>
												<input
													type="tel"
													value={phone}
													readOnly
													className="readonly-input"
													title="Phone number cannot be changed"
													aria-invalid={Boolean(fieldErrors.phone)}
												/>
												{fieldErrors.phone ? (
													<span className="ws-uin-field-error">{fieldErrors.phone}</span>
												) : null}
											</label>
											<label>
												<span className="label-text">Email (optional)</span>
												<input
													type="email"
													value={email}
													onChange={(e) => setEmail(e.target.value)}
													aria-invalid={Boolean(fieldErrors.email)}
												/>
												{fieldErrors.email ? (
													<span className="ws-uin-field-error">{fieldErrors.email}</span>
												) : null}
											</label>
											<label>
												<span className="label-text">Aadhaar no. (optional)</span>
												<input
													type="text"
													inputMode="numeric"
													value={aadhar}
													onChange={(e) =>
														setAadhar(e.target.value.replace(/\D/g, '').slice(0, 12))
													}
													maxLength={12}
													aria-invalid={Boolean(fieldErrors.aadhar)}
												/>
												{fieldErrors.aadhar ? (
													<span className="ws-uin-field-error">{fieldErrors.aadhar}</span>
												) : null}
											</label>
											<label className="ws-uin-party-fields__full">
												<span className="label-text required">Address</span>
												<textarea
													value={address}
													onChange={(e) => setAddress(e.target.value)}
													required
													rows={3}
												/>
											</label>
											{!isLandlord ? (
												<label className="ws-uin-party-fields__full">
													<span className="label-text">Description of previous tenancy</span>
													<textarea
														value={previousTenancy}
														onChange={(e) => setPreviousTenancy(e.target.value)}
														rows={3}
													/>
												</label>
											) : null}
										</div>
									</div>
								</section>
							</div>
						)}

						{/* Step 3: Documents */}
						{joinStep === 3 && (
							<fieldset className="tenancy-fieldset tenancy-docs-fieldset">
								<div className="tenancy-docs-step">
									<header className="tenancy-docs-step__header">
										<h2 className="tenancy-docs-step__title">Upload required documents</h2>
										<p className="tenancy-docs-step__lead">
											All items below are mandatory. Use the preview icon after each upload to verify the file.
										</p>
										<p className="tenancy-docs-step__disclaimer" role="note">
											<strong>File upload guidelines:</strong> Accepted formats — PDF, JPG, JPEG, PNG.
											Maximum size — <strong>2 MB</strong> per file. Scanned copies must be clear and readable.
										</p>
										<ul className="tenancy-docs-step__checklist" aria-label="Required documents">
											<li>Passport-size photograph (JPG / JPEG / PNG, max 2 MB)</li>
											<li>Signature (JPG / JPEG / PNG, max 2 MB)</li>
											<li>PAN Card (PDF / JPG / JPEG / PNG, max 2 MB)</li>
										</ul>
									</header>

									<article className="tenancy-doc-card">
										<div className="tenancy-doc-card__head">
											<span className="tenancy-doc-card__num">1</span>
											<div>
												<h3 className="tenancy-doc-card__title">Your personal documents</h3>
												<p className="tenancy-doc-card__meta">
													Photograph, signature, and PAN card — JPG / JPEG / PNG / PDF (where allowed) · max 2 MB each
												</p>
											</div>
										</div>
										<div className="tenancy-doc-card__grid">
											<DocumentUploadSlot
												id="join-photo"
												label="Passport-size photograph"
												accept=".jpg,.jpeg,.png,image/jpeg,image/png"
												hint="Accepted: JPG, JPEG, PNG · Max size: 2 MB"
												required
												onChange={(e) => {
													const file = e.target.files?.[0] || null
													setPhotoFile(file)
													if (file) {
														const reader = new FileReader()
														reader.onload = () =>
															setPhotoPreview(reader.result?.toString() || '')
														reader.readAsDataURL(file)
													} else {
														setPhotoPreview('')
													}
												}}
												imagePreview={photoPreview}
												previewTitle="Passport-size photograph"
												onPreview={openDocPreview}
												onFilePreview={openFilePreview}
											/>
											<DocumentUploadSlot
												id="join-signature"
												label="Signature"
												accept=".jpg,.jpeg,.png,image/jpeg,image/png"
												hint="Accepted: JPG, JPEG, PNG · Max size: 2 MB"
												required
												onChange={(e) => {
													const file = e.target.files?.[0] || null
													setSignatureFile(file)
													if (file) {
														const reader = new FileReader()
														reader.onload = () =>
															setSignaturePreview(reader.result?.toString() || '')
														reader.readAsDataURL(file)
													} else {
														setSignaturePreview('')
													}
												}}
												imagePreview={signaturePreview}
												previewTitle="Signature"
												onPreview={openDocPreview}
												onFilePreview={openFilePreview}
											/>
											<DocumentUploadSlot
												id="join-pan"
												label="PAN card document"
												accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
												hint="Accepted: PDF, JPG, JPEG, PNG · Max size: 2 MB"
												required
												onChange={(e) => setPanDocumentFile(e.target.files?.[0] || null)}
												file={panDocumentFile}
												previewTitle="PAN Card"
												onPreview={openDocPreview}
												onFilePreview={openFilePreview}
											/>
										</div>
									</article>
								</div>
							</fieldset>
						)}

						{/* Step 4: Preview — same government form as initiator */}
						{joinStep === 4 && (
							<div className="tenancy-preview-container">
								<div className="govt-form-document">
									<div className="govt-form-watermark">PREVIEW</div>

									<div
										className="govt-form-header"
										style={{ textAlign: 'center', marginBottom: '30px' }}
									>
										<div
											style={{
												fontWeight: 'bold',
												fontSize: '1.2rem',
												textTransform: 'uppercase',
											}}
										>
											THE FIRST SCHEDULE
										</div>
										<div style={{ fontStyle: 'italic', marginBottom: '5px' }}>
											[See section 4(1) and 7(2)]
										</div>
										<div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
											FORM FOR INFORMATION OF TENANCY
										</div>
									</div>

									<div style={{ marginBottom: '20px' }}>
										<div>To,</div>
										<div>The Rent Authority</div>
										<div>{officeAddress} (Address)</div>
									</div>

									<div className="preview-list-container">
										<div
											className="preview-list-item"
											style={{ display: 'flex', marginBottom: '15px' }}
										>
											<div style={{ width: '40px' }}>1.</div>
											<div style={{ flex: '1.5' }}>
												Name and address of the landlord
											</div>
											<div style={{ flex: '2' }}>
												:{' '}
												{previewLandlordName
													? `${previewLandlordName}, ${previewLandlordAddress}`
													: ''}
											</div>
										</div>
										<div
											className="preview-list-item"
											style={{ display: 'flex', marginBottom: '15px' }}
										>
											<div style={{ width: '40px' }}>2.</div>
											<div style={{ flex: '1.5' }}>
												Name and address of the Property Manager (if any)
											</div>
											<div style={{ flex: '2' }}>
												:{' '}
												{hasManager
													? `${application.manager_name}${cleanOptionalValue(application.manager_address) ? `, ${application.manager_address}` : ''}`
													: ''}
											</div>
										</div>
										<div
											className="preview-list-item"
											style={{ display: 'flex', marginBottom: '15px' }}
										>
											<div style={{ width: '40px' }}>3.</div>
											<div style={{ flex: '1.5' }}>
												Name(s) and address of the tenant, including email and contact
												details,
											</div>
											<div style={{ flex: '2' }}>
												:{' '}
												{previewTenantName
													? `${previewTenantName}, ${previewTenantAddress}, Email: ${previewTenantEmail}, Phone: ${previewTenantPhone}`
													: ''}
											</div>
										</div>
										<div
											className="preview-list-item"
											style={{ display: 'flex', marginBottom: '15px' }}
										>
											<div style={{ width: '40px' }}>4.</div>
											<div style={{ flex: '1.5' }}>
												Description of previous tenancy, if any
											</div>
											<div style={{ flex: '2' }}>: {previewTenantPrevious}</div>
										</div>
										<div
											className="preview-list-item"
											style={{ display: 'flex', marginBottom: '15px' }}
										>
											<div style={{ width: '40px' }}>5.</div>
											<div style={{ flex: '1.5' }}>
												Description of premises let to the tenant Including
												appurtenant land, if any
											</div>
											<div style={{ flex: '2' }}>
												: {application.property_premises_description}
											</div>
										</div>
										<div
											className="preview-list-item"
											style={{ display: 'flex', marginBottom: '15px' }}
										>
											<div style={{ width: '40px' }}>6.</div>
											<div style={{ flex: '1.5' }}>
												Date from which possession is given to the tenant
											</div>
											<div style={{ flex: '2' }}>
												: {formatDate(application.property_possession_date)}
											</div>
										</div>
										<div
											className="preview-list-item"
											style={{ display: 'flex', marginBottom: '15px' }}
										>
											<div style={{ width: '40px' }}>7.</div>
											<div style={{ flex: '1.5' }}>Rent payable as in section 8</div>
											<div style={{ flex: '2' }}>
												:{' '}
												{application.property_rent_payable
													? `₹${application.property_rent_payable}`
													: ''}
											</div>
										</div>
										<div
											className="preview-list-item"
											style={{ display: 'flex', marginBottom: '15px' }}
										>
											<div style={{ width: '40px' }}>8.</div>
											<div style={{ flex: '1.5' }}>
												Furniture and other equipment provided to the tenant
											</div>
											<div style={{ flex: '2' }}>
												: {application.property_furniture_description}
											</div>
										</div>
										<div
											className="preview-list-item"
											style={{ display: 'flex', marginBottom: '15px' }}
										>
											<div style={{ width: '40px' }}>9.</div>
											<div style={{ flex: '1.5' }}>
												Other charges payable
												<br />
												(a) Electricity
												<br />
												(b) Water
												<br />
												(c) Extra furnishing, fittings and fixtures
												<br />
												(d) Other services
											</div>
											<div
												style={{
													flex: '2',
													display: 'flex',
													flexDirection: 'column',
												}}
											>
												<div>&nbsp;</div>
												<div>: {application.property_charge_electricity}</div>
												<div>: {application.property_charge_water}</div>
												<div>: {application.property_charge_furnishing}</div>
												<div>: {application.property_charge_other_services}</div>
											</div>
										</div>
										<div
											className="preview-list-item"
											style={{ display: 'flex', marginBottom: '15px' }}
										>
											<div style={{ width: '40px' }}>10.</div>
											<div style={{ flex: '1.5' }}>
												Attach rent or lease or tenancy agreement
											</div>
											<div style={{ flex: '2' }}>: Attached in uploads</div>
										</div>
										<div
											className="preview-list-item"
											style={{ display: 'flex', marginBottom: '15px' }}
										>
											<div style={{ width: '40px' }}>11.</div>
											<div style={{ flex: '1.5' }}>
												Duration of tenancy (Period for which let)
											</div>
											<div style={{ flex: '2' }}>
												: {application.property_tenancy_duration || '—'}
												{application.property_tenancy_end_date
													? ` (Till ${formatDate(application.property_tenancy_end_date)})`
													: ''}
											</div>
										</div>
										<div
											className="preview-list-item"
											style={{ display: 'flex', marginBottom: '15px' }}
										>
											<div style={{ width: '40px' }}>12.</div>
											<div style={{ flex: '1.5' }}>
												Permanent Account Number (PAN) of landlord:
											</div>
											<div style={{ flex: '2' }}>: {previewLandlordPan}</div>
										</div>
										<div
											className="preview-list-item"
											style={{ display: 'flex', marginBottom: '15px' }}
										>
											<div style={{ width: '40px' }}>13.</div>
											<div style={{ flex: '1.5' }}>Aadhaar number of landlord:</div>
											<div style={{ flex: '2' }}>: {previewLandlordAadhar}</div>
										</div>
										<div
											className="preview-list-item"
											style={{ display: 'flex', marginBottom: '15px' }}
										>
											<div style={{ width: '40px' }}>14.</div>
											<div style={{ flex: '1.5' }}>
												Mobile Number and E-mail id of landlord
												<br />
												(if available)
											</div>
											<div style={{ flex: '2' }}>
												: {previewLandlordPhone}, {previewLandlordEmail}
											</div>
										</div>
										<div
											className="preview-list-item"
											style={{ display: 'flex', marginBottom: '15px' }}
										>
											<div style={{ width: '40px' }}>15.</div>
											<div style={{ flex: '1.5' }}>
												Permanent Account Number (PAN) of tenant
											</div>
											<div style={{ flex: '2' }}>: {previewTenantPan}</div>
										</div>
										<div
											className="preview-list-item"
											style={{ display: 'flex', marginBottom: '15px' }}
										>
											<div style={{ width: '40px' }}>16.</div>
											<div style={{ flex: '1.5' }}>Aadhaar number of tenant</div>
											<div style={{ flex: '2' }}>: {previewTenantAadhar}</div>
										</div>
										<div
											className="preview-list-item"
											style={{ display: 'flex', marginBottom: '15px' }}
										>
											<div style={{ width: '40px' }}>17.</div>
											<div style={{ flex: '1.5' }}>
												Mobile Number and E-mail id of tenant
											</div>
											<div style={{ flex: '2' }}>
												: {previewTenantPhone}, {previewTenantEmail}
											</div>
										</div>
										<div
											className="preview-list-item"
											style={{ display: 'flex', marginBottom: '15px' }}
										>
											<div style={{ width: '40px' }}>18.</div>
											<div style={{ flex: '1.5' }}>
												Permanent Account Number (PAN) of Property Manager (if any)
											</div>
											<div style={{ flex: '2' }}>
												: {hasManager && managerPan ? managerPan : ''}
											</div>
										</div>
										<div
											className="preview-list-item"
											style={{ display: 'flex', marginBottom: '15px' }}
										>
											<div style={{ width: '40px' }}>19.</div>
											<div style={{ flex: '1.5' }}>
												Aadhaar number of Property Manager
												<br />
												(if any)
											</div>
											<div style={{ flex: '2' }}>
												: {hasManager && managerAadhar ? managerAadhar : ''}
											</div>
										</div>
										<div
											className="preview-list-item"
											style={{ display: 'flex', marginBottom: '15px' }}
										>
											<div style={{ width: '40px' }}>20.</div>
											<div style={{ flex: '1.5' }}>
												Mobile Number and E-mail id of
												<br />
												Property Manager (if any)
											</div>
											<div style={{ flex: '2' }}>
												:{' '}
												{hasManager && (managerPhone || managerEmail)
													? [managerPhone, managerEmail].filter(Boolean).join(', ')
													: ''}
											</div>
										</div>
									</div>

									<div
										style={{
											display: 'flex',
											justifyContent: 'space-between',
											marginTop: '50px',
											marginBottom: '30px',
										}}
									>
										<div style={{ textAlign: 'center' }}>
											<div style={{ marginBottom: '10px' }}>
												Name and signature of landlord
											</div>
											<div
												style={{
													border: '1px solid #000',
													width: '120px',
													height: '140px',
													margin: '10px auto',
													display: 'flex',
													flexDirection: 'column',
													alignItems: 'center',
													justifyContent: 'center',
													backgroundColor: '#fff',
												}}
											>
												{previewLandlordPhoto ? (
													<img
														src={previewLandlordPhoto}
														alt="L Photo"
														style={{
															maxWidth: '100%',
															maxHeight: '100%',
															objectFit: 'cover',
														}}
													/>
												) : (
													<span
														style={{ fontSize: '0.8rem', textAlign: 'center' }}
													>
														Photograph
														<br />
														of
														<br />
														Landlord
													</span>
												)}
											</div>
											<div
												style={{
													height: '50px',
													marginTop: '10px',
													display: 'flex',
													justifyContent: 'center',
												}}
											>
												{previewLandlordSignature ? (
													<img
														src={previewLandlordSignature}
														alt="L Sign"
														style={{ maxHeight: '100%', maxWidth: '150px' }}
													/>
												) : null}
											</div>
										</div>
										<div style={{ textAlign: 'center' }}>
											<div style={{ marginBottom: '10px' }}>
												Name and signature of tenant
											</div>
											<div
												style={{
													border: '1px solid #000',
													width: '120px',
													height: '140px',
													margin: '10px auto',
													display: 'flex',
													flexDirection: 'column',
													alignItems: 'center',
													justifyContent: 'center',
													backgroundColor: '#fff',
												}}
											>
												{previewTenantPhoto ? (
													<img
														src={previewTenantPhoto}
														alt="T Photo"
														style={{
															maxWidth: '100%',
															maxHeight: '100%',
															objectFit: 'cover',
														}}
													/>
												) : (
													<span
														style={{ fontSize: '0.8rem', textAlign: 'center' }}
													>
														Photograph
														<br />
														of
														<br />
														Tenant
													</span>
												)}
											</div>
											<div
												style={{
													height: '50px',
													marginTop: '10px',
													display: 'flex',
													justifyContent: 'center',
												}}
											>
												{previewTenantSignature ? (
													<img
														src={previewTenantSignature}
														alt="T Sign"
														style={{ maxHeight: '100%', maxWidth: '150px' }}
													/>
												) : null}
											</div>
										</div>
									</div>

									<div style={{ marginTop: '20px', marginBottom: '30px' }}>
										<strong>Enclosed:</strong>
										<ol
											style={{
												marginLeft: '20px',
												marginTop: '10px',
												display: 'flex',
												flexDirection: 'column',
												gap: '5px',
											}}
										>
											<li>Tenancy Agreement.</li>
											<li>Self-attested copies of PAN and Aadhaar of landlord.</li>
											<li>Self-attested copies of PAN and Aadhaar of tenant.</li>
										</ol>
									</div>
								</div>

								<div className="preview-actions-hint">
									Please review all details carefully before proceeding to payment.
								</div>

								<div className="ws-uin-declaration">
									<label className="ws-uin-declaration-label">
										<input
											type="checkbox"
											checked={declarationChecked}
											onChange={(e) => setDeclarationChecked(e.target.checked)}
										/>
										<span>
											I/we hereby declare that the particulars given above are true
											and correct to the best of my/our knowledge and belief and no
											material fact has been concealed.
										</span>
									</label>
								</div>
							</div>
						)}

						{joinStep === 5 && (
							<fieldset className="tenancy-fieldset ws-uin-payment-step">
								<div className={`ws-uin-pay ws-uin-pay--simple${paymentComplete ? ' is-paid' : ''}`}>
									<section className="ws-uin-pay-bill">
										<h2 className="ws-uin-pay-title">Bill summary</h2>
										<div className="ws-uin-pay-bill-rows">
											<div className="ws-uin-pay-row">
												<span>Service</span>
												<strong>Tenancy Certificate (UIN)</strong>
											</div>
											<div className="ws-uin-pay-row">
												<span>Application type</span>
												<strong>{application.apply_type || '—'}</strong>
											</div>
											<div className="ws-uin-pay-row">
												<span>Application no.</span>
												<strong>{application.application_no || '—'}</strong>
											</div>
											<div className="ws-uin-pay-row">
												<span>Your role</span>
												<strong>{roleLabel}</strong>
											</div>
											<div className="ws-uin-pay-row">
												<span>Fee</span>
												<strong>₹{feeAmount}</strong>
											</div>
											<div className="ws-uin-pay-row ws-uin-pay-row--total">
												<span>Total payable</span>
												<strong>₹{feeAmount}</strong>
											</div>
										</div>
										{paymentComplete ? (
											<div className="ws-uin-pay-paid" role="status">
												<strong>Payment successful</strong>
												<span>
													₹{feeAmount} paid
													{paymentGrn ? ` · GRN ${paymentGrn}` : ''}
												</span>
											</div>
										) : (
											<p className="ws-uin-pay-hint">Review the bill and proceed to pay.</p>
										)}
									</section>

									<section className="ws-uin-pay-method">
										<h2 className="ws-uin-pay-title">Pay now</h2>
										{!paymentComplete ? (
											<>
												<button
													type="button"
													className="ws-btn ws-btn--primary ws-uin-pay-btn"
													onClick={handleMockPayment}
													disabled={paymentSimulating || submitting}
												>
													{paymentSimulating ? 'Processing…' : `Pay ₹${feeAmount}`}
												</button>
												<p className="ws-uin-pay-note">Demo payment — no real bank transfer.</p>
											</>
										) : (
											<div className="ws-uin-pay-done">
												<p>Payment confirmed. You can submit the application.</p>
											</div>
										)}
									</section>
								</div>
							</fieldset>
						)}

						<div className="form-actions ws-uin-apply-actions">
							{joinStep > 1 ? (
								<button
									type="button"
									className="ws-btn ws-btn--secondary"
									onClick={() => goToStep(joinStep - 1)}
								>
									Back
								</button>
							) : (
								<button
									type="button"
									className="ws-btn ws-btn--secondary"
									onClick={() => navigate('/dashboard')}
								>
									Cancel
								</button>
							)}
							{joinStep < 4 ? (
								<button
									type="submit"
									className="ws-btn ws-btn--primary"
									disabled={joinStep === 2 && hasDetailsFieldErrors}
								>
									Continue
								</button>
							) : null}
							{joinStep === 4 ? (
								<button
									type="submit"
									className="ws-btn ws-btn--primary"
									disabled={!declarationChecked}
								>
									Proceed to payment
								</button>
							) : null}
							{joinStep === 5 ? (
								<button
									type="submit"
									className="ws-btn ws-btn--primary"
									disabled={submitting || !paymentComplete || !declarationChecked}
								>
									{submitting ? 'Submitting…' : 'Confirm & submit'}
								</button>
							) : null}
						</div>
					</form>
				</div>
			</div>

			{docPreview ? (
				<div className="tenancy-doc-preview-overlay" role="presentation" onClick={closeDocPreview}>
					<div
						className="tenancy-doc-preview-modal"
						role="dialog"
						aria-modal="true"
						aria-labelledby="join-doc-preview-title"
						onClick={(e) => e.stopPropagation()}
					>
						<header className="tenancy-doc-preview-modal__header">
							<h2 id="join-doc-preview-title">{docPreview.title}</h2>
							<button type="button" className="tenancy-doc-preview-modal__close" onClick={closeDocPreview} aria-label="Close preview">
								×
							</button>
						</header>
						<div className="tenancy-doc-preview-modal__body">
							{docPreview.isPdf ? (
								<iframe title={docPreview.title} src={docPreview.url} className="tenancy-doc-preview-modal__iframe" />
							) : (
								<img src={docPreview.url} alt={docPreview.title} className="tenancy-doc-preview-modal__image" />
							)}
						</div>
					</div>
				</div>
			) : null}
		</div>
	)
}

export default JoinApplication
