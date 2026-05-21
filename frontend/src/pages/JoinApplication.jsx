import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, useOutletContext } from 'react-router-dom'
import api, { csrf } from '../api'

function JoinApplication() {
	const { user } = useOutletContext()
	const [searchParams] = useSearchParams()
	const navigate = useNavigate()
	const refCode = searchParams.get('ref') || ''
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [application, setApplication] = useState(null)
	const [submitting, setSubmitting] = useState(false)

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

	// Payment State
	const [paymentComplete, setPaymentComplete] = useState(false)
	const [paymentSimulating, setPaymentSimulating] = useState(false)

	const feeAmount = (() => {
		if (!application?.apply_type) return 0
		const type = application.apply_type.toLowerCase()
		return type === 'joint' ? 50 : type === 'individual' ? 75 : 0
	})()

	const handleMockPayment = () => {
		setPaymentSimulating(true)
		// TODO: Replace this mock with actual eGRAS payment gateway redirect & callback logic
		setTimeout(() => {
			setPaymentSimulating(false)
			setPaymentComplete(true)
		}, 1500)
	}

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

				// Pre-fill from application data that the initiator entered
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

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (!declarationChecked) {
			setError('You must accept the declaration to submit.')
			return
		}
		if (!paymentComplete) {
			setError('You must complete the fee payment before submitting.')
			return
		}
		setError('')
		setSuccess('')
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
			if (photoFile) {
				formData.append('photo', photoFile)
			}
			if (signatureFile) {
				formData.append('signature', signatureFile)
			}
			if (panDocumentFile) {
				formData.append('pan_document', panDocumentFile)
			}
			const { data } = await api.post('/api/tenancy-applications/join', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})
			setSuccess(data.message || 'Successfully joined the application!')
			setTimeout(() => navigate('/dashboard'), 3000)
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

	if (loading) {
		return (
			<div className="dashboard-card">
				<div className="full-page-loader">
					<div className="loader-spinner"></div>
					<h2 className="loader-text">Loading application...</h2>
				</div>
			</div>
		)
	}

	if (error && !application) {
		return (
			<div className="dashboard-card">
				<h1>Join Application</h1>
				<div className="error" style={{ marginBottom: '20px', marginTop: '20px' }}>{error}</div>
				<button type="button" onClick={() => navigate('/dashboard')}>
					Go to Dashboard
				</button>
			</div>
		)
	}

	if (success) {
		return (
			<div className="dashboard-card">
				<h1>Application Joined</h1>
				<div className="admin-success">{success}</div>
				<p className="muted">Redirecting to dashboard...</p>
			</div>
		)
	}

	if (!application) return null

	const secondRole = application.second_party_role
	const isLandlord = secondRole === 'LANDLORD'

	return (
		<div className="auth-card dashboard-card tenancy-certificate-page">
			<div className="tenancy-page-header">
				<h1>Join Tenancy Application</h1>
				<p className="muted">
					You have been invited to complete this application as{' '}
					<strong>{isLandlord ? 'Landlord' : 'Tenant'}</strong>.
				</p>
			</div>

			{error ? <div className="error">{error}</div> : null}

			{/* Application summary */}
			<div className="join-app-summary">
				<div className="summary-section">
					<h3>Application Details</h3>
					<div className="tenancy-preview-grid">
						<div>
							<span className="label-text">Application No</span>
							<span>{application.application_no}</span>
						</div>
						<div>
							<span className="label-text">Registration Date</span>
							<span>{application.registration_date}</span>
						</div>
						<div>
							<span className="label-text">Apply Type</span>
							<span>{application.apply_type}</span>
						</div>
						<div>
							<span className="label-text">Office</span>
							<span>{application.office?.name || '-'}</span>
						</div>
						<div>
							<span className="label-text">Village / Ward</span>
							<span>{application.village_ward?.name || '-'}</span>
						</div>
					</div>
				</div>

				<div className="summary-section">
					<h3>Participant Details</h3>
					<div className="tenancy-preview-grid">
						<div>
							<span className="label-text">Initiator</span>
							<span >{application.initiator_role}</span>
						</div>
						{application.initiator_role === 'LANDLORD' ? (
							<>
								<div>
									<span className="label-text">Landlord Name</span>
									<span>{application.landlord_name}</span>
								</div>
								<div>
									<span className="label-text">Landlord Phone</span>
									<span>{application.landlord_phone}</span>
								</div>
							</>
						) : (
							<>
								<div>
									<span className="label-text">Tenant Name</span>
									<span>{application.tenant_name}</span>
								</div>
								<div>
									<span className="label-text">Tenant Phone</span>
									<span>{application.tenant_phone}</span>
								</div>
							</>
						)}
					</div>
				</div>

				<div className="summary-section">
					<h3>Property & Rent</h3>
					<div className="tenancy-preview-grid">
						<div className="full-row">
							<span className="label-text">Description</span>
							<span>{application.property_premises_description || '-'}</span>
						</div>
						<div>
							<span className="label-text">Monthly Rent</span>
							<span className="rent-amount">₹{application.property_rent_payable}</span>
						</div>
						<div>
							<span className="label-text">Duration</span>
							<span>{application.property_tenancy_duration}</span>
						</div>
						<div>
							<span className="label-text">Possession Date</span>
							<span>{application.property_possession_date}</span>
						</div>
					</div>
				</div>
			</div>

			{/* Second party form */}
			<form className="tenancy-form" onSubmit={handleSubmit}>
				<h3 className="tenancy-step-heading">
					Your Details ({isLandlord ? 'Landlord' : 'Tenant'})
				</h3>
				<fieldset className="tenancy-fieldset">
					<legend className="tenancy-legend-italic">
						{isLandlord ? 'Landlord' : 'Tenant'} Information
					</legend>
					<label className="tenancy-field-full">
						<span className="label-text required">Full Name</span>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>
					</label>
					<label className="tenancy-field-full">
						<span className="label-text required">Address</span>
						<textarea
							value={address}
							onChange={(e) => setAddress(e.target.value)}
							required
						/>
					</label>
					<label>
						<span className="label-text required">Email</span>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</label>
					<label>
						<span className="label-text required">Phone</span>
						<input
							type="tel"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							required
							readOnly
							className="readonly-input"
							title="Phone number cannot be changed"
						/>
					</label>
					<label>
						<span className="label-text required">PAN No</span>
						<input
							type="text"
							value={pan}
							onChange={(e) => setPan(e.target.value.toUpperCase())}
							required
						/>
					</label>
					<label>
						<span className="label-text">Aadhar No (Optional)</span>
						<input
							type="text"
							value={aadhar}
							onChange={(e) => setAadhar(e.target.value.replace(/\D/g, ''))}
							maxLength={12}
						/>
					</label>
					{!isLandlord ? (
						<label className="tenancy-field-full">
							Description of Previous Tenancy
							<textarea
								value={previousTenancy}
								onChange={(e) => setPreviousTenancy(e.target.value)}
							/>
						</label>
					) : null}
				</fieldset>

				<fieldset className="tenancy-fieldset">
					<legend className="tenancy-legend-spaced">Document Uploads</legend>
					<label className="tenancy-field-full">
						Passport Photo
						<input
							type="file"
							accept="image/png, image/jpeg"
							onChange={(e) => {
								const file = e.target.files?.[0] || null
								setPhotoFile(file)
								if (file) {
									const reader = new FileReader()
									reader.onload = () => setPhotoPreview(reader.result?.toString() || '')
									reader.readAsDataURL(file)
								} else {
									setPhotoPreview('')
								}
							}}
						/>
						{photoPreview ? (
							<img src={photoPreview} alt="Preview" className="tenancy-preview-img" />
						) : null}
					</label>
					<label className="tenancy-field-full">
						Signature
						<input
							type="file"
							accept="image/png, image/jpeg"
							onChange={(e) => {
								const file = e.target.files?.[0] || null
								setSignatureFile(file)
								if (file) {
									const reader = new FileReader()
									reader.onload = () => setSignaturePreview(reader.result?.toString() || '')
									reader.readAsDataURL(file)
								} else {
									setSignaturePreview('')
								}
							}}
						/>
						{signaturePreview ? (
							<img src={signaturePreview} alt="Preview" className="tenancy-preview-img" />
						) : null}
					</label>
					<label className="tenancy-field-full">
						PAN Card Document
						<input
							type="file"
							accept=".pdf, image/png, image/jpeg"
							onChange={(e) => {
								const file = e.target.files?.[0] || null
								setPanDocumentFile(file)
							}}
							required
						/>
						{panDocumentFile && <span className="muted" style={{fontSize: '12px', marginTop: '4px'}}>{panDocumentFile.name}</span>}
					</label>
				</fieldset>

				<div className="payment-section" style={{ marginTop: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
					<h3>Fee Payment</h3>
					<p>Based on your agreement registration date, the required application fee is <strong>₹{feeAmount}</strong>.</p>
					{!paymentComplete ? (
						<button type="button" className="ws-btn ws-btn--primary" onClick={handleMockPayment} disabled={paymentSimulating || submitting}>
							{paymentSimulating ? 'Processing Payment...' : `Pay ₹${feeAmount} via eGRAS`}
						</button>
					) : (
						<div className="ws-alert ws-alert--success" style={{ marginTop: '10px' }}>
							Payment of ₹{feeAmount} completed successfully. (Mock GRN: {Math.floor(Math.random() * 1000000000)})
						</div>
					)}
				</div>

				<div className="tenancy-declaration-section" style={{ marginTop: '32px', padding: '16px', background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '4px' }}>
					<label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', margin: 0, flexDirection: 'row' }}>
						<input 
							type="checkbox" 
							checked={declarationChecked} 
							onChange={(e) => setDeclarationChecked(e.target.checked)} 
							disabled={submitting}
							style={{ marginTop: '4px', width: 'auto' }}
						/>
						<span style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
							I/we hereby declare that the particulars given above are true and correct to the best of my/our knowledge and belief and no material fact has been concealed.
						</span>
					</label>
				</div>

				<div className="form-actions">
					<button type="submit" disabled={submitting || !declarationChecked || !paymentComplete}>
						{submitting ? 'Submitting...' : 'Submit & Complete Application'}
					</button>
					<button
						type="button"
						className="secondary"
						onClick={() => navigate('/dashboard')}
					>
						Cancel
					</button>
				</div>
			</form>
		</div >
	)
}

export default JoinApplication
