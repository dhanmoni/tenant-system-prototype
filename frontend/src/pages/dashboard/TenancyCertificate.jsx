import { useEffect, useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import api, { csrf } from '../../api'
import { formatDateTime } from '../../utils/formatters'
import emblemDark from '../../assets/img/emblem-dark.png'

function TenancyCertificate() {
	const { user } = useOutletContext()
	const navigate = useNavigate()
	const PASSPORT_WIDTH = 350
	const PASSPORT_HEIGHT = 450
	const PASSPORT_TOP_BIAS = 0.18

	const [tenancyStep, setTenancyStep] = useState(1)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [tenancySubmitting, setTenancySubmitting] = useState(false)
	const [tenancyReceipt, setTenancyReceipt] = useState(null)
	const [editingApplicationId, setEditingApplicationId] = useState(null)

	// Step 1: Office/Registration
	const [tenancyRegistrationDate, setTenancyRegistrationDate] = useState('')
	const [tenancyOfficeId, setTenancyOfficeId] = useState('')
	const [tenancyOffices, setTenancyOffices] = useState([])
	const [tenancyOfficesLoading, setTenancyOfficesLoading] = useState(false)
	const [tenancyDistrictId, setTenancyDistrictId] = useState('')
	const [tenancyDistricts, setTenancyDistricts] = useState([])
	const [tenancyDistrictsLoading, setTenancyDistrictsLoading] = useState(false)
	const [tenancyVillageWardId, setTenancyVillageWardId] = useState('')
	const [tenancyVillageWards, setTenancyVillageWards] = useState([])
	const [tenancyVillageWardsLoading, setTenancyVillageWardsLoading] = useState(false)
	const [initiatorRole, setInitiatorRole] = useState('')
	// Removed manual applyType state as it is now computed

	// Step 2-4: Parties
	const [landlordName, setLandlordName] = useState('')
	const [landlordAddress, setLandlordAddress] = useState('')
	const [landlordEmail, setLandlordEmail] = useState('')
	const [landlordPhone, setLandlordPhone] = useState('')
	const [landlordPan, setLandlordPan] = useState('')

	const [managerName, setManagerName] = useState('')
	const [managerAddress, setManagerAddress] = useState('')
	const [managerEmail, setManagerEmail] = useState('')
	const [managerPhone, setManagerPhone] = useState('')
	const [managerPan, setManagerPan] = useState('')

	const [tenantName, setTenantName] = useState('')
	const [tenantAddress, setTenantAddress] = useState('')
	const [tenantEmail, setTenantEmail] = useState('')
	const [tenantPhone, setTenantPhone] = useState('')
	const [tenantPan, setTenantPan] = useState('')
	const [tenantPreviousTenancy, setTenantPreviousTenancy] = useState('')

	// Step 5: Property & Files
	const [propertyPossessionDate, setPropertyPossessionDate] = useState('')
	const [propertyTenancyEndDate, setPropertyTenancyEndDate] = useState('')
	const [propertyTenancyDuration, setPropertyTenancyDuration] = useState('')
	const [propertyRentPayable, setPropertyRentPayable] = useState('')
	const [propertyPremisesDescription, setPropertyPremisesDescription] = useState('')
	const [propertyFurnitureDescription, setPropertyFurnitureDescription] = useState('')
	const [propertyChargeElectricity, setPropertyChargeElectricity] = useState('')
	const [propertyChargeWater, setPropertyChargeWater] = useState('')
	const [propertyChargeFurnishing, setPropertyChargeFurnishing] = useState('')
	const [propertyChargeOtherServices, setPropertyChargeOtherServices] = useState('')

	const [agreementFile, setAgreementFile] = useState(null)
	const [agreementPreviewUrl, setAgreementPreviewUrl] = useState('')
	const [landlordPhotoFile, setLandlordPhotoFile] = useState(null)
	const [landlordPhotoPreview, setLandlordPhotoPreview] = useState('')
	const [landlordSignatureFile, setLandlordSignatureFile] = useState(null)
	const [landlordSignaturePreview, setLandlordSignaturePreview] = useState('')
	const [tenantPhotoFile, setTenantPhotoFile] = useState(null)
	const [tenantPhotoPreview, setTenantPhotoPreview] = useState('')
	const [tenantSignatureFile, setTenantSignatureFile] = useState(null)
	const [tenantSignaturePreview, setTenantSignaturePreview] = useState('')

	const [profileType, setProfileType] = useState('')
	const [profileName, setProfileName] = useState('')
	const [profileEmail, setProfileEmail] = useState('')
	const [profilePhone, setProfilePhone] = useState('')
	const [profileAddress, setProfileAddress] = useState('')
	const [profilePin, setProfilePin] = useState('')
	const [profilePan, setProfilePan] = useState('')
	const [profilePhotoPreview, setProfilePhotoPreview] = useState('')

	useEffect(() => {
		loadProfile()
		loadTenancyOffices()
		loadTenancyDistricts()
	}, [])

	const loadProfile = async () => {
		try {
			const { data } = await api.get('/api/profile')
			const p = data.user || {}
			setProfileType(p.profile_type || '')
			setProfileName(p.name || '')
			setProfileEmail(p.email || '')
			setProfilePhone(p.phone || '')
			setProfileAddress(p.address || '')
			setProfilePin(p.pin_code || '')
			setProfilePan(p.pan_card || '')

			const photoUrl = p.passport_photo_url
			const photoPath = p.passport_photo_path || p.user_passport_photo_path
			if (photoUrl) setProfilePhotoPreview(photoUrl)
			else if (photoPath) setProfilePhotoPreview(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${photoPath}`)
		} catch (err) { console.error('Failed to load profile for prefill') }
	}

	// Dynamic pre-fill based on initiatorRole and profile data
	useEffect(() => {
		if (!initiatorRole || !profileName) return;

		if (initiatorRole === 'LANDLORD') {
			setLandlordName(profileName); setLandlordAddress(profileAddress); setLandlordEmail(profileEmail); setLandlordPhone(profilePhone); setLandlordPan(profilePan);
			if (profilePhotoPreview) setLandlordPhotoPreview(profilePhotoPreview);
		} else if (initiatorRole === 'TENANT') {
			setTenantName(profileName); setTenantAddress(profileAddress); setTenantEmail(profileEmail); setTenantPhone(profilePhone); setTenantPan(profilePan);
			if (profilePhotoPreview) setTenantPhotoPreview(profilePhotoPreview);
		} else if (initiatorRole === 'PROPERTY_MANAGER') {
			setManagerName(profileName); setManagerAddress(profileAddress); setManagerEmail(profileEmail); setManagerPhone(profilePhone); setManagerPan(profilePan);
		}
	}, [initiatorRole, profileName, profileAddress, profileEmail, profilePhone, profilePan, profilePhotoPreview])

	useEffect(() => {
		if (propertyPossessionDate && propertyTenancyEndDate) {
			const start = new Date(propertyPossessionDate)
			const end = new Date(propertyTenancyEndDate)
			if (!isNaN(start) && !isNaN(end) && end > start) {
				let years = end.getFullYear() - start.getFullYear()
				let months = end.getMonth() - start.getMonth()
				if (months < 0) { years--; months += 12; }
				let durationStr = ''
				if (years > 0) durationStr += `${years} year${years > 1 ? 's' : ''} `
				if (months > 0) durationStr += `${months} month${months > 1 ? 's' : ''}`
				setPropertyTenancyDuration(durationStr.trim() || 'Less than 1 month')
			} else { setPropertyTenancyDuration('') }
		} else { setPropertyTenancyDuration('') }
	}, [propertyPossessionDate, propertyTenancyEndDate])

	const loadTenancyOffices = async () => {
		setTenancyOfficesLoading(true)
		try {
			const { data } = await api.get('/api/public/offices')
			const items = Array.isArray(data) ? data : (data.data || data.offices || [])
			setTenancyOffices(items)
		} catch (err) { setError('Failed to load offices') }
		finally { setTenancyOfficesLoading(false) }
	}

	const loadTenancyDistricts = async () => {
		setTenancyDistrictsLoading(true)
		try {
			const { data } = await api.get('/api/public/districts')
			setTenancyDistricts(Array.isArray(data) ? data : (data.districts || data.data || []))
		} catch (err) { setError('Failed to load districts') }
		finally { setTenancyDistrictsLoading(false) }
	}

	const loadTenancyVillageWards = async (districtId) => {
		if (!districtId) return setTenancyVillageWards([])
		setTenancyVillageWardsLoading(true)
		try {
			const { data } = await api.get('/api/public/village-wards', { params: { district_id: districtId } })
			setTenancyVillageWards(Array.isArray(data) ? data : data.data || [])
		} catch (err) { setError('Failed to load village/wards') }
		finally { setTenancyVillageWardsLoading(false) }
	}

	const resetTenancyForm = () => {
		setTenancyStep(1); setEditingApplicationId(null); setTenancyRegistrationDate(''); setTenancyOfficeId('');
		setAgreementFile(null); setAgreementPreviewUrl(''); setLandlordPhotoFile(null); setLandlordPhotoPreview(profileType === 'landlord' ? profilePhotoPreview : '');
		setLandlordSignatureFile(null); setLandlordSignaturePreview(''); setTenantPhotoFile(null); setTenantPhotoPreview(profileType === 'tenant' ? profilePhotoPreview : '');
		setTenantSignatureFile(null); setTenantSignaturePreview(''); setManagerName(''); setManagerAddress(''); setManagerEmail(''); setManagerPhone(''); setManagerPan('');
		setTenantPreviousTenancy(''); setPropertyPossessionDate(''); setPropertyRentPayable(''); setPropertyPremisesDescription(''); setPropertyFurnitureDescription('');
		setPropertyChargeElectricity(''); setPropertyChargeWater(''); setPropertyChargeFurnishing(''); setPropertyChargeOtherServices(''); setPropertyTenancyDuration('');
		setPropertyTenancyEndDate(''); setTenancyReceipt(null); setSuccess(''); setError(''); setTenancyVillageWardId(''); setTenancyVillageWards([]); setTenancyDistrictId('');
		setInitiatorRole(profileType === 'landlord' ? 'LANDLORD' : profileType === 'tenant' ? 'TENANT' : '')
	}

	const applyType = (() => {
		if (!tenancyRegistrationDate) return ''
		const regDate = new Date(tenancyRegistrationDate)
		if (isNaN(regDate.getTime())) return ''
		const now = new Date()
		const monthsDiff = (now.getFullYear() - regDate.getFullYear()) * 12 + (now.getMonth() - regDate.getMonth())
		return monthsDiff > 2 ? 'Individual' : 'Joint'
	})()

	const registrationTooOld = (() => {
		if (!tenancyRegistrationDate) return false
		const regDate = new Date(tenancyRegistrationDate)
		if (isNaN(regDate.getTime())) return false
		const now = new Date()
		const monthsDiff = (now.getFullYear() - regDate.getFullYear()) * 12 + (now.getMonth() - regDate.getMonth())
		return monthsDiff > 3
	})()

	const fileToDataUrl = (file) => new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(reader.result)
		reader.onerror = () => reject(new Error('Failed to read image file'))
		reader.readAsDataURL(file)
	})

	const loadImage = (src) => new Promise((resolve, reject) => {
		const img = new Image()
		img.onload = () => resolve(img)
		img.onerror = () => reject(new Error('Invalid image'))
		img.src = src
	})

	const canvasToBlob = (canvas, type = 'image/jpeg', quality = 0.92) =>
		new Promise((resolve, reject) => {
			canvas.toBlob((blob) => {
				if (!blob) {
					reject(new Error('Image processing failed'))
					return
				}
				resolve(blob)
			}, type, quality)
		})

	const processPassportPhoto = async (file) => {
		const dataUrl = await fileToDataUrl(file)
		const img = await loadImage(dataUrl)
		const targetRatio = PASSPORT_WIDTH / PASSPORT_HEIGHT
		const sourceRatio = img.width / img.height

		let sx = 0
		let sy = 0
		let sWidth = img.width
		let sHeight = img.height

		// Crop to passport ratio. Use slight top bias to keep face area prominent.
		if (sourceRatio > targetRatio) {
			sWidth = Math.round(img.height * targetRatio)
			sx = Math.round((img.width - sWidth) / 2)
		} else if (sourceRatio < targetRatio) {
			sHeight = Math.round(img.width / targetRatio)
			const maxShift = Math.max(0, img.height - sHeight)
			sy = Math.round(maxShift * PASSPORT_TOP_BIAS)
		}

		const canvas = document.createElement('canvas')
		canvas.width = PASSPORT_WIDTH
		canvas.height = PASSPORT_HEIGHT
		const ctx = canvas.getContext('2d')
		if (!ctx) throw new Error('Canvas not supported')
		ctx.imageSmoothingEnabled = true
		ctx.imageSmoothingQuality = 'high'
		ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, PASSPORT_WIDTH, PASSPORT_HEIGHT)

		const blob = await canvasToBlob(canvas, 'image/jpeg', 0.9)
		const safeName = (file.name || 'passport-photo').replace(/\.[^.]+$/, '')
		return new File([blob], `${safeName}-passport.jpg`, { type: 'image/jpeg' })
	}

	const handlePassportPhotoUpload = async (file, setFile, setPreview, who) => {
		if (!file) return
		try {
			const processed = await processPassportPhoto(file)
			setFile(processed)
			setPreview(URL.createObjectURL(processed))
		} catch (err) {
			setError(`Failed to process ${who} photo. Please try another image.`)
		}
	}

	const submitTenancyApplication = async () => {
		setError(''); setSuccess(''); setTenancySubmitting(true)
		try {
			await csrf()
			const formData = new FormData()
			formData.append('registration_date', tenancyRegistrationDate)
			if (tenancyOfficeId) formData.append('office_id', tenancyOfficeId)
			if (tenancyVillageWardId) formData.append('village_ward_id', tenancyVillageWardId)
			if (initiatorRole) formData.append('initiator_role', initiatorRole)
			formData.append('apply_type', applyType || 'Individual')
			formData.append('landlord_name', landlordName); formData.append('landlord_address', landlordAddress); formData.append('landlord_email', landlordEmail); formData.append('landlord_phone', landlordPhone); formData.append('landlord_pan', landlordPan);
			formData.append('manager_name', managerName); formData.append('manager_address', managerAddress); formData.append('manager_email', managerEmail); formData.append('manager_phone', managerPhone); formData.append('manager_pan', managerPan);
			formData.append('tenant_name', tenantName); formData.append('tenant_address', tenantAddress); formData.append('tenant_email', tenantEmail); formData.append('tenant_phone', tenantPhone); formData.append('tenant_pan', tenantPan);
			formData.append('tenant_previous_tenancy', tenantPreviousTenancy || '')
			formData.append('property_possession_date', propertyPossessionDate); formData.append('property_rent_payable', String(Number(propertyRentPayable) || 0)); formData.append('property_premises_description', propertyPremisesDescription);
			formData.append('property_furniture_description', propertyFurnitureDescription || ''); formData.append('property_charge_electricity', propertyChargeElectricity || ''); formData.append('property_charge_water', propertyChargeWater || '');
			formData.append('property_charge_furnishing', propertyChargeFurnishing || ''); formData.append('property_charge_other_services', propertyChargeOtherServices || ''); formData.append('property_tenancy_duration', propertyTenancyDuration)

			if (agreementFile) formData.append('agreement_pdf', agreementFile)
			if (landlordPhotoFile) formData.append('landlord_photo', landlordPhotoFile)
			if (landlordSignatureFile) formData.append('landlord_signature', landlordSignatureFile)
			if (tenantPhotoFile) formData.append('tenant_photo', tenantPhotoFile)
			if (tenantSignatureFile) formData.append('tenant_signature', tenantSignatureFile)

			const { data } = await api.post('/api/tenancy-applications', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
			setTenancyReceipt(data)
			setSuccess('Application submitted successfully.')
			setTenancyStep(6)
		} catch (err) {
			const data = err?.response?.data
			const errors = data?.errors
			let msg = data?.message || 'Failed to submit application'
			if (errors && typeof errors === 'object') {
				const list = Object.entries(errors).flatMap(([field, messages]) => (Array.isArray(messages) ? messages : [messages]).map(m => `${field}: ${m}`))
				if (list.length) msg = list.join('. ')
			}
			setError(msg)
		} finally { setTenancySubmitting(false) }
	}

	const tenancySteps = [
		{ id: 1, label: 'Registration & Office' }, { id: 2, label: 'Tenancy Details' }, { id: 3, label: 'Property Details' }, { id: 4, label: 'Uploads' }, { id: 5, label: 'Preview' }, { id: 6, label: 'Submit' }
	]

	const eligibilityMet = !registrationTooOld && !!tenancyRegistrationDate && !!tenancyOfficeId
	const formLocked = Boolean(tenancyReceipt)

	return (
		<div className="dashboard-card tenancy-certificate-page">
			<div className="tenancy-page-header">
				<h1>Apply for Tenancy Certificate</h1>
			</div>

			{tenancyStep === 1 && (
				<>
					<div className="tenancy-criteria-box">
						<h2 className="tenancy-criteria-title">Eligibility criteria</h2>
						<p className="tenancy-criteria-intro">You may apply only if the following conditions are satisfied:</p>
						<ul className="tenancy-criteria-list">
							<li className={applyType ? 'tenancy-criteria-met' : 'tenancy-criteria-pending'}>
								<span className="tenancy-criteria-icon">{applyType ? '✓' : '○'}</span>
								<span>Application type: {applyType || 'Waiting for date...'}</span>
							</li>
							<li className={tenancyOfficeId ? 'tenancy-criteria-met' : 'tenancy-criteria-pending'}>
								<span className="tenancy-criteria-icon">{tenancyOfficeId ? '✓' : '○'}</span>
								<span>Applying office must be selected.</span>
							</li>
						</ul>
						{tenancyRegistrationDate && (
							<div className={`tenancy-eligibility-result ${eligibilityMet ? 'eligible' : 'not-eligible'}`}>
								{eligibilityMet ? <p><strong>You are eligible</strong> to apply. Type: <strong>{applyType}</strong></p> : registrationTooOld ? <p><strong>Not eligible.</strong> Registration is more than 3 months old.</p> : null}
							</div>
						)}
					</div>
					<div className="tenancy-required-docs">
						<h3>Required documents</h3>
						<ul>
							<li>Registered tenancy agreement (PDF)</li>
							<li>Passport-size photograph</li>
							<li>Signature</li>
						</ul>
					</div>
				</>
			)}

			<div className="tenancy-steps">
				{tenancySteps.map((step, idx) => (
					<div key={step.id} className={`tenancy-step ${tenancyStep === step.id ? 'active' : ''} ${tenancyStep > step.id ? 'done' : ''}`}>
						<div className="tenancy-step-icon">{step.id}</div>
						<span className="tenancy-step-label">{step.label}</span>
						{idx < 5 && <span className="tenancy-step-line" />}
					</div>
				))}
			</div>

			{error ? <div className="error">{error}</div> : null}
			{success ? <div className="admin-success">{success}</div> : null}

			<form className="tenancy-form" onSubmit={(e) => {
				e.preventDefault()
				if (tenancyStep === 1 && registrationTooOld) return
				if (tenancyStep === 2) {
					if (!managerName.trim()) setManagerName('NA'); if (!managerAddress.trim()) setManagerAddress('NA');
					if (!managerEmail.trim()) setManagerEmail('noemail@noemail.com'); if (!managerPhone.trim()) setManagerPhone('NA'); if (!managerPan.trim()) setManagerPan('NA');
				}
				if (tenancyStep < 5) { setTenancyStep(prev => prev + 1); return; }
				if (tenancyStep === 5 && !tenancyReceipt) submitTenancyApplication()
			}}>
				{tenancyStep === 1 && (
					<fieldset className="tenancy-fieldset">
						<legend>Application Location</legend>
						<div className="form-grid">
							<label>
								<span className="label-text required">Initiating as</span>
								<select value={initiatorRole} onChange={e => setInitiatorRole(e.target.value)} required disabled={formLocked}>
									<option value="">Select Role</option>
									<option value="LANDLORD">Landlord</option>
									<option value="TENANT">Tenant</option>
								</select>
							</label>

							<label>
								<span className="label-text required">Date of Agreement</span>
								<input type="date" value={tenancyRegistrationDate} onChange={e => setTenancyRegistrationDate(e.target.value)} onClick={(e) => e.target.showPicker && e.target.showPicker()} required disabled={formLocked} max={new Date().toISOString().split('T')[0]} />
							</label>
							<label>
								<span className="label-text required">District</span>
								<select value={tenancyDistrictId} onChange={e => { setTenancyDistrictId(e.target.value); setTenancyVillageWardId(''); setTenancyVillageWards([]); loadTenancyVillageWards(e.target.value); }} required disabled={formLocked}>
									<option value="">Select District</option>
									{tenancyDistricts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
								</select>
							</label>

							<label>
								<span className="label-text required">Village / Ward</span>
								<select value={tenancyVillageWardId} onChange={e => setTenancyVillageWardId(e.target.value)} required disabled={formLocked || !tenancyDistrictId}>
									<option value="">Select Village/Ward</option>
									{tenancyVillageWards.map(vw => <option key={vw.id} value={vw.id}>{vw.name}</option>)}
								</select>
							</label>

							<label>
								<span className="label-text required">Applying Office:</span>
								<select value={tenancyOfficeId} onChange={e => setTenancyOfficeId(e.target.value)} required disabled={formLocked}>
									<option value="">Select Office</option>
									{tenancyOffices.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
								</select>
							</label>

							<label>
								<span className="label-text required">Application Type</span>
								<input type="text" value={applyType} readOnly disabled className="readonly-input" />
							</label>
						</div>
					</fieldset>
				)}
				{tenancyStep === 2 && (
					<div className="parties-container">
						<section className="tenancy-section">
							<div className="section-header">
								<h2>1. Landlord Details</h2>
								{initiatorRole === 'LANDLORD' && <span className="initiator-badge">Initiator</span>}
							</div>
							<div className="form-grid">
								<label><span className="label-text required">Name</span><input type="text" value={landlordName} onChange={e => setLandlordName(e.target.value)} required disabled={formLocked} /></label>
								<label>
									<span className={`label-text ${initiatorRole === 'LANDLORD' ? 'required' : ''}`}>Email</span>
									<input type="email" value={landlordEmail} onChange={e => setLandlordEmail(e.target.value)} required={initiatorRole === 'LANDLORD'} disabled={formLocked} />
								</label>
								<label><span className="label-text required">Phone</span><input type="tel" value={landlordPhone} onChange={e => setLandlordPhone(e.target.value)} required disabled={formLocked} /></label>
								<label><span className="label-text required">PAN</span><input type="text" value={landlordPan} onChange={e => setLandlordPan(e.target.value.toUpperCase())} required disabled={formLocked} /></label>
							</div>
							<label><span className="label-text required">Address</span><textarea value={landlordAddress} onChange={e => setLandlordAddress(e.target.value)} required disabled={formLocked} /></label>
						</section>

						<hr className="section-divider" />

						<section className="tenancy-section">
							<div className="section-header">
								<h2>2. Tenant Details</h2>
								{initiatorRole === 'TENANT' && <span className="initiator-badge">Initiator</span>}
							</div>
							<div className="form-grid">
								<label><span className="label-text required">Name</span><input type="text" value={tenantName} onChange={e => setTenantName(e.target.value)} required disabled={formLocked} /></label>
								<label>
									<span className={`label-text ${initiatorRole === 'TENANT' ? 'required' : ''}`}>Email</span>
									<input type="email" value={tenantEmail} onChange={e => setTenantEmail(e.target.value)} required={initiatorRole === 'TENANT'} disabled={formLocked} />
								</label>
								<label><span className="label-text required">Phone</span><input type="tel" value={tenantPhone} onChange={e => setTenantPhone(e.target.value)} required disabled={formLocked} /></label>
								<label><span className="label-text required">PAN</span><input type="text" value={tenantPan} onChange={e => setTenantPan(e.target.value.toUpperCase())} required disabled={formLocked} /></label>
							</div>
							<label style={{ marginTop: '16px' }}><span className="label-text required">Address</span><textarea value={tenantAddress} onChange={e => setTenantAddress(e.target.value)} required disabled={formLocked} /></label>
							<label style={{ marginTop: '16px' }}><span className="label-text">Previous Tenancy Details (if any)</span><textarea value={tenantPreviousTenancy} onChange={e => setTenantPreviousTenancy(e.target.value)} disabled={formLocked} /></label>
						</section>

						<hr className="section-divider" />

						<section className="tenancy-section">
							<div className="section-header">
								<h2>3. Property Manager Details (Optional)</h2>
								{initiatorRole === 'PROPERTY_MANAGER' && <span className="initiator-badge">Initiator</span>}
							</div>
							<div className="form-grid">
								<label><span className="label-text">Manager Name</span><input type="text" value={managerName} onChange={e => setManagerName(e.target.value)} disabled={formLocked} /></label>
								<label><span className="label-text">Email</span><input type="email" value={managerEmail} onChange={e => setManagerEmail(e.target.value)} disabled={formLocked} /></label>
								<label><span className="label-text">Phone</span><input type="tel" value={managerPhone} onChange={e => setManagerPhone(e.target.value)} disabled={formLocked} /></label>
								<label><span className="label-text">PAN</span><input type="text" value={managerPan} onChange={e => setManagerPan(e.target.value.toUpperCase())} disabled={formLocked} /></label>
							</div>
							<label><span className="label-text">Address</span><textarea value={managerAddress} onChange={e => setManagerAddress(e.target.value)} disabled={formLocked} /></label>
						</section>
					</div>
				)}

				{tenancyStep === 3 && (
					<div className="property-container">
						<section className="tenancy-section">
							<div className="section-header">
								<h2>1. Possession & Rent Details</h2>
							</div>
							<div className="form-grid">
								<label><span className="label-text required">Possession Date</span><input type="date" value={propertyPossessionDate} onChange={e => setPropertyPossessionDate(e.target.value)} onClick={(e) => e.target.showPicker && e.target.showPicker()} required disabled={formLocked} /></label>
								<label><span className="label-text required">Monthly Rent (₹)</span><input type="number" value={propertyRentPayable} onChange={e => setPropertyRentPayable(e.target.value)} min="0" required disabled={formLocked} /></label>
								<label><span className="label-text required">Tenancy End Date</span><input type="date" value={propertyTenancyEndDate} onChange={e => setPropertyTenancyEndDate(e.target.value)} onClick={(e) => e.target.showPicker && e.target.showPicker()} required disabled={formLocked} min={propertyPossessionDate} /></label>
								<div style={{ display: 'flex', alignItems: 'center' }}>
									{propertyTenancyDuration && <p className="muted" style={{ margin: 0 }}>Duration: <strong>{propertyTenancyDuration}</strong></p>}
								</div>
							</div>
						</section>

						<hr className="section-divider" />

						<section className="tenancy-section">
							<div className="section-header">
								<h2>2. Premises Description</h2>
							</div>
							<label><span className="label-text">Full Description of Premises, if any</span><textarea value={propertyPremisesDescription} onChange={e => setPropertyPremisesDescription(e.target.value)} disabled={formLocked} placeholder="Enter detailed description of the property premises..." /></label>
						</section>

						<hr className="section-divider" />

						<section className="tenancy-section">
							<div className="section-header">
								<h3>3. Additional Charges & Furnishing</h3>
							</div>
							<label><span className="label-text">Description of Furniture (if any)</span><textarea value={propertyFurnitureDescription} onChange={e => setPropertyFurnitureDescription(e.target.value)} disabled={formLocked} placeholder="List furniture provided..." /></label>

							<div className="form-grid">
								<label><span className="label-text">Electricity Charge (Monthly/Units)</span><input type="number" value={propertyChargeElectricity} onChange={e => setPropertyChargeElectricity(e.target.value)} min="0" disabled={formLocked} /></label>
								<label><span className="label-text">Water Charge (Monthly)</span><input type="number" value={propertyChargeWater} onChange={e => setPropertyChargeWater(e.target.value)} min="0" disabled={formLocked} /></label>
								<label><span className="label-text">Furnishing Charge (Monthly)</span><input type="number" value={propertyChargeFurnishing} onChange={e => setPropertyChargeFurnishing(e.target.value)} min="0" disabled={formLocked} /></label>
								<label><span className="label-text">Other Service Charges</span><input type="number" value={propertyChargeOtherServices} onChange={e => setPropertyChargeOtherServices(e.target.value)} min="0" disabled={formLocked} /></label>
							</div>
						</section>
					</div>
				)}

				{tenancyStep === 4 && (
					<fieldset className="tenancy-fieldset">
						<legend>Required Documents & Signatures</legend>

						<div className="upload-rows-container">
							<section className="upload-row">
								<h3>1. Tenancy Agreement</h3>
								<div className="upload-item-full">
									<label>
										<span className="label-text required">Registered Tenancy Agreement (PDF)</span>
										<input type="file" accept=".pdf" onChange={e => setAgreementFile(e.target.files[0])} disabled={formLocked} />
										<p className="muted">Upload the scanned copy of the agreement.</p>
									</label>
								</div>
							</section>

							<hr className="section-divider" />

							<section className="upload-row">
								<h3>2. Personal Documents</h3>
								<div className="form-grid">
									{initiatorRole === 'TENANT' ? (
										<>
											<div className="upload-item-row">
												<label>
													<span className="label-text required">Tenant Passport Photo</span>
													<input
														type="file"
														accept="image/*"
														onChange={async (e) => {
															const f = e.target.files[0]
															await handlePassportPhotoUpload(f, setTenantPhotoFile, setTenantPhotoPreview, 'tenant')
														}}
														disabled={formLocked}
														required
													/>
													<p className="muted">Auto-cropped to passport ratio.</p>
												</label>
												{tenantPhotoPreview && <img src={tenantPhotoPreview} alt="T Photo" className="tenancy-thumb" />}
											</div>
											<div className="upload-item-row">
												<label>
													<span className="label-text required">Tenant Signature Image</span>
													<input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; setTenantSignatureFile(f); if (f) setTenantSignaturePreview(URL.createObjectURL(f)) }} disabled={formLocked} required />
												</label>
												{tenantSignaturePreview && <img src={tenantSignaturePreview} alt="T Sign" className="tenancy-thumb" />}
											</div>
										</>
									) : (
										<>
											<div className="upload-item-row">
												<label>
													<span className="label-text required">Landlord Passport Photo</span>
													<input
														type="file"
														accept="image/*"
														onChange={async (e) => {
															const f = e.target.files[0]
															await handlePassportPhotoUpload(f, setLandlordPhotoFile, setLandlordPhotoPreview, 'landlord')
														}}
														disabled={formLocked}
														required
													/>
													<p className="muted">Auto-cropped to passport ratio.</p>
												</label>
												{landlordPhotoPreview && <img src={landlordPhotoPreview} alt="L Photo" className="tenancy-thumb" />}
											</div>
											<div className="upload-item-row">
												<label>
													<span className="label-text required">Landlord Signature Image</span>
													<input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; setLandlordSignatureFile(f); if (f) setLandlordSignaturePreview(URL.createObjectURL(f)) }} disabled={formLocked} required />
												</label>
												{landlordSignaturePreview && <img src={landlordSignaturePreview} alt="L Sign" className="tenancy-thumb" />}
											</div>
										</>
									)}
								</div>
							</section>
						</div>
					</fieldset>
				)}

				{tenancyStep === 5 && (
					<div className="tenancy-preview-container">
						<div className="govt-form-document">
							<div className="govt-form-watermark">PREVIEW</div>

							<div className="govt-form-header">
								<div className="govt-form-seal-container">
									<img src={emblemDark} alt="Government of India Emblem" className="govt-form-seal-image" />
								</div>
								<h2>Government of Assam</h2>
								<h3>Department of Housing And Urban Affairs</h3>
								<div className="govt-form-title">APPLICATION FOR TENANCY CERTIFICATE</div>
							</div>

							<section className="govt-form-section">
								<h4 className="govt-form-section-title"><span className="govt-form-section-num">1</span> Application Details</h4>
								<div className="govt-form-row">
									<span className="govt-form-label">Initiator Role:</span>
									<span className="govt-form-value">{initiatorRole}</span>
								</div>
								<div className="govt-form-row">
									<span className="govt-form-label">Application Type:</span>
									<span className="govt-form-value">{applyType}</span>
								</div>
								<div className="govt-form-row">
									<span className="govt-form-label">Date of Agreement:</span>
									<span className="govt-form-value">{tenancyRegistrationDate}</span>
								</div>
								<div className="govt-form-row">
									<span className="govt-form-label">Applying Office:</span>
									<span className="govt-form-value">{tenancyOffices.find(o => String(o.id) === tenancyOfficeId)?.name}</span>
								</div>
								<div className="govt-form-row">
									<span className="govt-form-label">Location:</span>
									<span className="govt-form-value">
										{tenancyVillageWards.find(vw => String(vw.id) === tenancyVillageWardId)?.name}, {tenancyDistricts.find(d => String(d.id) === tenancyDistrictId)?.name}
									</span>
								</div>
							</section>

							<section className="govt-form-section">
								<h4 className="govt-form-section-title"><span className="govt-form-section-num">2</span> Landlord Details</h4>
								<div className="govt-form-row">
									<span className="govt-form-label">Name:</span>
									<span className="govt-form-value">{landlordName}</span>
								</div>
								<div className="govt-form-row">
									<span className="govt-form-label">Phone:</span>
									<span className="govt-form-value">{landlordPhone}</span>
								</div>
								<div className="govt-form-row">
									<span className="govt-form-label">Email:</span>
									<span className="govt-form-value">{landlordEmail || 'N/A'}</span>
								</div>
								<div className="govt-form-row">
									<span className="govt-form-label">PAN:</span>
									<span className="govt-form-value">{landlordPan}</span>
								</div>
								<div className="govt-form-full-row">
									<div className="govt-form-label">Full Address:</div>
									<div className="govt-form-value">{landlordAddress}</div>
								</div>
							</section>

							<section className="govt-form-section">
								<h4 className="govt-form-section-title"><span className="govt-form-section-num">3</span> Tenant Details</h4>
								<div className="govt-form-row">
									<span className="govt-form-label">Name:</span>
									<span className="govt-form-value">{tenantName}</span>
								</div>
								<div className="govt-form-row">
									<span className="govt-form-label">Phone:</span>
									<span className="govt-form-value">{tenantPhone}</span>
								</div>
								<div className="govt-form-row">
									<span className="govt-form-label">Email:</span>
									<span className="govt-form-value">{tenantEmail || 'N/A'}</span>
								</div>
								<div className="govt-form-row">
									<span className="govt-form-label">PAN:</span>
									<span className="govt-form-value">{tenantPan}</span>
								</div>
								<div className="govt-form-full-row">
									<div className="govt-form-label">Full Address:</div>
									<div className="govt-form-value">{tenantAddress}</div>
								</div>
								{tenantPreviousTenancy && (
									<div className="govt-form-full-row">
										<div className="govt-form-label">Previous Tenancy Details:</div>
										<div className="govt-form-value">{tenantPreviousTenancy}</div>
									</div>
								)}
							</section>

							<section className="govt-form-section">
								<h4 className="govt-form-section-title"><span className="govt-form-section-num">4</span> Property & Financials</h4>
								<div className="govt-form-row">
									<span className="govt-form-label">Possession Date:</span>
									<span className="govt-form-value">{propertyPossessionDate}</span>
								</div>
								<div className="govt-form-row">
									<span className="govt-form-label">Tenancy End Date:</span>
									<span className="govt-form-value">{propertyTenancyEndDate}</span>
								</div>
								<div className="govt-form-row">
									<span className="govt-form-label">Duration:</span>
									<span className="govt-form-value">{propertyTenancyDuration}</span>
								</div>
								<div className="govt-form-row">
									<span className="govt-form-label">Monthly Rent:</span>
									<span className="govt-form-value">₹{propertyRentPayable}</span>
								</div>
								<div className="govt-form-full-row">
									<div className="govt-form-label">Premises Description:</div>
									<div className="govt-form-value">{propertyPremisesDescription}</div>
								</div>
								<div className="govt-form-full-row">
									<div className="govt-form-label">Additional Charges:</div>
									<div className="govt-form-value" style={{ fontSize: '0.9rem' }}>
										Electricity: {propertyChargeElectricity || 0}, Water: {propertyChargeWater || 0},
										Furnishing: {propertyChargeFurnishing || 0}, Other: {propertyChargeOtherServices || 0}
									</div>
								</div>
							</section>

							<div className="govt-form-affix-area">
								<div className="affix-box">
									<div className="affix-frame">
										{initiatorRole === 'LANDLORD' ? (
											landlordPhotoPreview ? <img src={landlordPhotoPreview} alt="L Photo" /> : 'Photo here'
										) : (
											tenantPhotoPreview ? <img src={tenantPhotoPreview} alt="T Photo" /> : 'Photo here'
										)}
									</div>
									<div className="affix-label">Photograph</div>
								</div>
								<div className="affix-box">
									<div className="affix-frame signature-frame">
										{initiatorRole === 'LANDLORD' ? (
											landlordSignaturePreview ? <img src={landlordSignaturePreview} alt="L Sign" /> : 'Signature here'
										) : (
											tenantSignaturePreview ? <img src={tenantSignaturePreview} alt="T Sign" /> : 'Signature here'
										)}
									</div>
									<div className="affix-label">Signature</div>
								</div>
							</div>

							<div className="govt-form-declaration">
								<strong>DECLARATION:</strong> I hereby declare that the information provided above is true to the best of my knowledge and belief. I understand that any false statement or suppression of material facts will lead to the rejection of my application or cancellation of any certificate issued based on this application.
							</div>
						</div>
						<div className="preview-actions-hint">
							Please review all details carefully before final submission.
						</div>
					</div>
				)}

				{tenancyStep === 6 && tenancyReceipt && (
					<div className="tenancy-success-card">
						<h3>Application Submitted!</h3>
						<p>Your Application No is: <strong>{tenancyReceipt.application_no}</strong></p>
						<button type="button" onClick={() => navigate('/dashboard/status')}>View My Applications</button>
					</div>
				)}

				<div className="form-actions">
					{tenancyStep > 1 && tenancyStep < 6 && <button type="button" className="secondary" onClick={() => setTenancyStep(prev => prev - 1)}>Back</button>}
					{tenancyStep < 5 && <button type="submit">Next</button>}
					{tenancyStep === 5 && !tenancyReceipt && <button type="submit" disabled={tenancySubmitting}>{tenancySubmitting ? 'Submitting...' : 'Confirm & Submit'}</button>}
					{tenancyStep === 1 && <button type="button" className="secondary" onClick={resetTenancyForm}>Reset</button>}
				</div>
			</form>
		</div>
	)
}

export default TenancyCertificate
