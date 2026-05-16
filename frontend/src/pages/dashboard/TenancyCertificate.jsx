import { useEffect, useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import api, { csrf } from '../../api'
import { formatDateTime } from '../../utils/formatters'
import emblemDark from '../../assets/img/emblem-dark.png'
import { Icon } from '../../components/dashboard/Icons'

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
	const [conflictData, setConflictData] = useState(null)

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
	const [landlordAadhar, setLandlordAadhar] = useState('')

	const [managerName, setManagerName] = useState('')
	const [managerAddress, setManagerAddress] = useState('')
	const [managerEmail, setManagerEmail] = useState('')
	const [managerPhone, setManagerPhone] = useState('')
	const [managerPan, setManagerPan] = useState('')
	const [managerAadhar, setManagerAadhar] = useState('')

	const [tenantName, setTenantName] = useState('')
	const [tenantAddress, setTenantAddress] = useState('')
	const [tenantEmail, setTenantEmail] = useState('')
	const [tenantPhone, setTenantPhone] = useState('')
	const [tenantPan, setTenantPan] = useState('')
	const [tenantAadhar, setTenantAadhar] = useState('')
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
	const [landlordPanFile, setLandlordPanFile] = useState(null)
	const [tenantPanFile, setTenantPanFile] = useState(null)
	const [managerPanFile, setManagerPanFile] = useState(null)
	const [declarationChecked, setDeclarationChecked] = useState(false)

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

	const submitTenancyApplication = async (forceNew = false) => {
		setError(''); setSuccess(''); setTenancySubmitting(true)
		if (!forceNew) setConflictData(null)

		try {
			await csrf()
			const formData = new FormData()
			formData.append('registration_date', tenancyRegistrationDate)
			if (tenancyOfficeId) formData.append('office_id', tenancyOfficeId)
			if (tenancyVillageWardId) formData.append('village_ward_id', tenancyVillageWardId)
			if (initiatorRole) formData.append('initiator_role', initiatorRole)
			formData.append('apply_type', applyType || 'Individual')
			if (forceNew) formData.append('force_new', '1')

			formData.append('landlord_name', landlordName); formData.append('landlord_address', landlordAddress); formData.append('landlord_email', landlordEmail); formData.append('landlord_phone', landlordPhone); formData.append('landlord_pan', landlordPan); if (landlordAadhar) formData.append('landlord_aadhar', landlordAadhar);
			formData.append('manager_name', managerName); formData.append('manager_address', managerAddress); formData.append('manager_email', managerEmail); formData.append('manager_phone', managerPhone); formData.append('manager_pan', managerPan); if (managerAadhar) formData.append('manager_aadhar', managerAadhar);
			formData.append('tenant_name', tenantName); formData.append('tenant_address', tenantAddress); formData.append('tenant_email', tenantEmail); formData.append('tenant_phone', tenantPhone); formData.append('tenant_pan', tenantPan); if (tenantAadhar) formData.append('tenant_aadhar', tenantAadhar);
			formData.append('tenant_previous_tenancy', tenantPreviousTenancy || '')
			formData.append('property_possession_date', propertyPossessionDate); formData.append('property_rent_payable', String(Number(propertyRentPayable) || 0)); formData.append('property_premises_description', propertyPremisesDescription);
			formData.append('property_furniture_description', propertyFurnitureDescription || ''); formData.append('property_charge_electricity', propertyChargeElectricity || ''); formData.append('property_charge_water', propertyChargeWater || '');
			formData.append('property_charge_furnishing', propertyChargeFurnishing || ''); formData.append('property_charge_other_services', propertyChargeOtherServices || ''); formData.append('property_tenancy_duration', propertyTenancyDuration)

			if (agreementFile) formData.append('agreement_pdf', agreementFile)
			if (landlordPhotoFile) formData.append('landlord_photo', landlordPhotoFile)
			if (landlordSignatureFile) formData.append('landlord_signature', landlordSignatureFile)
			if (tenantPhotoFile) formData.append('tenant_photo', tenantPhotoFile)
			if (tenantSignatureFile) formData.append('tenant_signature', tenantSignatureFile)
			if (landlordPanFile) formData.append('landlord_pan_file', landlordPanFile)
			if (tenantPanFile) formData.append('tenant_pan_file', tenantPanFile)
			if (managerPanFile) formData.append('manager_pan_file', managerPanFile)

			const { data } = await api.post('/api/tenancy-applications', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
			setTenancyReceipt(data)
			setSuccess('Application submitted successfully.')
			setTenancyStep(5)
			setConflictData(null)
		} catch (err) {
			const data = err?.response?.data
			if (err?.response?.status === 409 && data?.conflict) {
				setConflictData(data)
				setError(data.message)
				return
			}

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
		{ id: 1, label: 'Registration' }, { id: 2, label: 'Information of Tenancy' }, { id: 3, label: 'Uploads' }, { id: 4, label: 'Preview' }, { id: 5, label: 'Submit' }
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
								<span>Circle office must be selected.</span>
							</li>
						</ul>
						{tenancyRegistrationDate && (
							<div className={`tenancy-eligibility-result ${eligibilityMet ? 'eligible' : 'not-eligible'}`}>
								{eligibilityMet ? <p><strong>You are eligible</strong> to apply. Type: <strong>{applyType}</strong></p> : registrationTooOld ? <p><strong>Not eligible,</strong> as agreement date is more than 3 months old.</p> : null}
							</div>
						)}
					</div>
					<div className="tenancy-required-docs">
						<h3>Required documents</h3>
						<ul>
							<li>Registered tenancy agreement (PDF)</li>
							<li>Passport-size photograph</li>
							<li>PAN Card</li>
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
						{idx < tenancySteps.length - 1 && <span className="tenancy-step-line" />}
					</div>
				))}
			</div>

			{error ? <div className="error">{error}</div> : null}

			{conflictData && (
				<div className="conflict-notice-box">
					<p>An application with these details already exists (Application No: <strong>{conflictData.existing_application?.application_no}</strong>).</p>
					<div className="conflict-actions">
						<button type="button" className="secondary" onClick={() => navigate(`/dashboard/status?app_no=${conflictData.existing_application?.application_no}`)}>View Existing Application</button>
						<button type="button" className="danger" onClick={() => submitTenancyApplication(true)}>Start Fresh Application Anyway</button>
					</div>
				</div>
			)}

			{success ? <div className="admin-success">{success}</div> : null}

			<form className="tenancy-form" onSubmit={(e) => {
				e.preventDefault()
				if (tenancyStep === 1 && registrationTooOld) return
				if (tenancyStep === 2) {
					if (!managerName.trim()) setManagerName('NA'); if (!managerAddress.trim()) setManagerAddress('NA');
					if (!managerEmail.trim()) setManagerEmail('noemail@noemail.com'); if (!managerPhone.trim()) setManagerPhone('NA'); if (!managerPan.trim()) setManagerPan('NA');
				}
				if (tenancyStep < 4) { setTenancyStep(prev => prev + 1); return; }
				if (tenancyStep === 4 && !tenancyReceipt) {
					if (!declarationChecked) {
						setError('You must accept the declaration to submit.')
						return
					}
					submitTenancyApplication()
				}
			}}>
				{tenancyStep === 1 && (
					<fieldset className="tenancy-fieldset">
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
								<span className="label-text required">Circle Office:</span>
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
								<h2>Information of Tenancy</h2>
							</div>

							<div className="form-group-row" style={{ marginTop: '20px' }}>
								<label><span className="label-text required">1. Name and address of the landlord</span></label>
								<div className="form-grid">
									<input type="text" placeholder="Landlord Name" value={landlordName} onChange={e => setLandlordName(e.target.value)} required disabled={formLocked} />
									<textarea placeholder="Address" value={landlordAddress} onChange={e => setLandlordAddress(e.target.value)} required disabled={formLocked} />
								</div>
							</div>

							<div className="form-group-row">
								<label><span className="label-text">2. Name and address of the Property Manager (if any)</span></label>
								<div className="form-grid">
									<input type="text" placeholder="Property Manager Name" value={managerName} onChange={e => setManagerName(e.target.value)} disabled={formLocked} />
									<textarea placeholder="Address" value={managerAddress} onChange={e => setManagerAddress(e.target.value)} disabled={formLocked} />
								</div>
							</div>

							<div className="form-group-row">
								<label><span className="label-text required">3. Name and address of the tenant, including email and contact details</span></label>
								<div className="form-grid">
									<input type="text" placeholder="Tenant Name" value={tenantName} onChange={e => setTenantName(e.target.value)} required disabled={formLocked} />
									<textarea placeholder="Address" value={tenantAddress} onChange={e => setTenantAddress(e.target.value)} required disabled={formLocked} />
								</div>
							</div>

							<div className="form-group-row">
								<label><span className="label-text">4. Description of previous tenancy, if any</span>
									<textarea value={tenantPreviousTenancy} onChange={e => setTenantPreviousTenancy(e.target.value)} disabled={formLocked} />
								</label>
							</div>

							<div className="form-group-row">
								<label><span className="label-text">5. Description of premises let to the tenant Including appurtenant land, if any</span>
									<textarea value={propertyPremisesDescription} onChange={e => setPropertyPremisesDescription(e.target.value)} disabled={formLocked} />
								</label>
							</div>

							<div className="form-group-row">
								<label><span className="label-text required">6. Date from which possession is given to the tenant</span>
									<input type="date" value={propertyPossessionDate} onChange={e => setPropertyPossessionDate(e.target.value)} onClick={(e) => e.target.showPicker && e.target.showPicker()} required disabled={formLocked} />
								</label>
							</div>

							<div className="form-group-row">
								<label><span className="label-text required">7. Rent payable as in section 8 (Monthly Rent ₹)</span>
									<input type="number" value={propertyRentPayable} onChange={e => setPropertyRentPayable(e.target.value)} onWheel={e => e.target.blur()} min="0" required disabled={formLocked} />
								</label>
							</div>

							<div className="form-group-row">
								<label><span className="label-text">8. Furniture and other equipment provided to the tenant</span>
									<textarea value={propertyFurnitureDescription} onChange={e => setPropertyFurnitureDescription(e.target.value)} disabled={formLocked} />
								</label>
							</div>

							<div className="form-group-row">
								<label><span className="label-text">9. Other charges payable</span></label>
								<div className="form-grid">
									<label><span className="label-text">(a) Electricity</span><input type="number" value={propertyChargeElectricity} onChange={e => setPropertyChargeElectricity(e.target.value)} onWheel={e => e.target.blur()} min="0" disabled={formLocked} /></label>
									<label><span className="label-text">(b) Water</span><input type="number" value={propertyChargeWater} onChange={e => setPropertyChargeWater(e.target.value)} onWheel={e => e.target.blur()} min="0" disabled={formLocked} /></label>
									<label><span className="label-text">(c) Extra furnishing, fittings and fixtures</span><input type="number" value={propertyChargeFurnishing} onChange={e => setPropertyChargeFurnishing(e.target.value)} onWheel={e => e.target.blur()} min="0" disabled={formLocked} /></label>
									<label><span className="label-text">(d) Other services</span><input type="number" value={propertyChargeOtherServices} onChange={e => setPropertyChargeOtherServices(e.target.value)} onWheel={e => e.target.blur()} min="0" disabled={formLocked} /></label>
								</div>
							</div>

							<div className="form-group-row">
								<label><span className="label-text required">10. Duration of tenancy (Period for which let)</span></label>
								<div className="form-grid">
									<label><span className="label-text">End Date</span><input type="date" value={propertyTenancyEndDate} onChange={e => setPropertyTenancyEndDate(e.target.value)} onClick={(e) => e.target.showPicker && e.target.showPicker()} required disabled={formLocked} min={propertyPossessionDate} /></label>
									<label><span className="label-text">Duration</span><input type="text" value={propertyTenancyDuration} readOnly disabled className="readonly-input" /></label>
								</div>
							</div>

							<div className="form-group-row">
								<label><span className="label-text required">11. Permanent Account Number (PAN) of landlord:</span>
									<input type="text" value={landlordPan} onChange={e => setLandlordPan(e.target.value.toUpperCase())} required disabled={formLocked} />
								</label>
							</div>

							<div className="form-group-row">
								<label><span className="label-text required">12. Mobile Number and E-mail id of landlord (if available)</span></label>
								<div className="form-grid">
									<input type="tel" placeholder="Mobile Number" value={landlordPhone} onChange={e => setLandlordPhone(e.target.value)} required disabled={formLocked} />
									<input type="email" placeholder="E-mail id" value={landlordEmail} onChange={e => setLandlordEmail(e.target.value)} required={initiatorRole === 'LANDLORD'} disabled={formLocked} />
								</div>
							</div>

							<div className="form-group-row">
								<label><span className="label-text required">13. Permanent Account Number (PAN) of tenant</span>
									<input type="text" value={tenantPan} onChange={e => setTenantPan(e.target.value.toUpperCase())} required disabled={formLocked} />
								</label>
							</div>

							<div className="form-group-row">
								<label><span className="label-text required">14. Mobile Number and E-mail id of tenant</span></label>
								<div className="form-grid">
									<input type="tel" placeholder="Mobile Number" value={tenantPhone} onChange={e => setTenantPhone(e.target.value)} required disabled={formLocked} />
									<input type="email" placeholder="E-mail id" value={tenantEmail} onChange={e => setTenantEmail(e.target.value)} required={initiatorRole === 'TENANT'} disabled={formLocked} />
								</div>
							</div>

							<div className="form-group-row">
								<label><span className="label-text">15. Permanent Account Number (PAN) of Property Manager (if any)</span>
									<input type="text" value={managerPan} onChange={e => setManagerPan(e.target.value.toUpperCase())} disabled={formLocked} />
								</label>
							</div>

							<div className="form-group-row">
								<label><span className="label-text">16. Mobile Number and E-mail id of Property Manager (if any)</span></label>
								<div className="form-grid">
									<input type="tel" placeholder="Mobile Number" value={managerPhone} onChange={e => setManagerPhone(e.target.value)} disabled={formLocked} />
									<input type="email" placeholder="E-mail id" value={managerEmail} onChange={e => setManagerEmail(e.target.value)} disabled={formLocked} />
								</div>
							</div>
						</section>
					</div>
				)}

				{tenancyStep === 3 && (
					<fieldset className="tenancy-fieldset">

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
											<div className="upload-item-row">
												<label>
													<span className="label-text required">Tenant PAN Card Document</span>
													<input type="file" accept=".pdf,image/*" onChange={e => { setTenantPanFile(e.target.files[0]) }} disabled={formLocked} required />
												</label>
												{tenantPanFile && <span className="muted" style={{ fontSize: '12px' }}>{tenantPanFile.name}</span>}
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
											<div className="upload-item-row">
												<label>
													<span className="label-text required">Landlord PAN Card Document</span>
													<input type="file" accept=".pdf,image/*" onChange={e => { setLandlordPanFile(e.target.files[0]) }} disabled={formLocked} required />
												</label>
												{landlordPanFile && <span className="muted" style={{ fontSize: '12px' }}>{landlordPanFile.name}</span>}
											</div>
										</>
									)}
								</div>
							</section>
						</div>
					</fieldset>
				)}

				{tenancyStep === 4 && (
					<div className="tenancy-preview-container">
						<div className="govt-form-document">
							<div className="govt-form-watermark">PREVIEW</div>

							<div className="govt-form-header" style={{ textAlign: 'center', marginBottom: '30px' }}>
								<div style={{ fontWeight: 'bold', fontSize: '1.2rem', textTransform: 'uppercase' }}>THE FIRST SCHEDULE</div>
								<div style={{ fontStyle: 'italic', marginBottom: '5px' }}>[See section 4(1) and 7(2)]</div>
								<div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>FORM FOR INFORMATION OF TENANCY</div>
							</div>

							<div style={{ marginBottom: '20px' }}>
								<div>To,</div>
								<div>The Rent Authority</div>
								<div>{tenancyOffices.find(o => String(o.id) === tenancyOfficeId)?.name ? `${tenancyOffices.find(o => String(o.id) === tenancyOfficeId)?.name}, ${tenancyDistricts.find(d => String(d.id) === tenancyDistrictId)?.name}` : '________________________'} (Address)</div>
							</div>

							<div className="preview-list-container">
								<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
									<div style={{ width: '40px' }}>1.</div>
									<div style={{ flex: '1.5' }}>Name and address of the landlord</div>
									<div style={{ flex: '2' }}>: {landlordName ? `${landlordName}, ${landlordAddress}` : ''}</div>
								</div>
								<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
									<div style={{ width: '40px' }}>2.</div>
									<div style={{ flex: '1.5' }}>Name and address of the Property Manager (if any)</div>
									<div style={{ flex: '2' }}>: {managerName && managerName !== 'NA' ? `${managerName}, ${managerAddress}` : ''}</div>
								</div>
								<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
									<div style={{ width: '40px' }}>3.</div>
									<div style={{ flex: '1.5' }}>Name(s) and address of the tenant, including email and contact details,</div>
									<div style={{ flex: '2' }}>: {tenantName ? `${tenantName}, ${tenantAddress}, Email: ${tenantEmail}, Phone: ${tenantPhone}` : ''}</div>
								</div>
								<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
									<div style={{ width: '40px' }}>4.</div>
									<div style={{ flex: '1.5' }}>Description of previous tenancy, if any</div>
									<div style={{ flex: '2' }}>: {tenantPreviousTenancy}</div>
								</div>
								<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
									<div style={{ width: '40px' }}>5.</div>
									<div style={{ flex: '1.5' }}>Description of premises let to the tenant Including appurtenant land, if any</div>
									<div style={{ flex: '2' }}>: {propertyPremisesDescription}</div>
								</div>
								<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
									<div style={{ width: '40px' }}>6.</div>
									<div style={{ flex: '1.5' }}>Date from which possession is given to the tenant</div>
									<div style={{ flex: '2' }}>: {propertyPossessionDate}</div>
								</div>
								<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
									<div style={{ width: '40px' }}>7.</div>
									<div style={{ flex: '1.5' }}>Rent payable as in section 8</div>
									<div style={{ flex: '2' }}>: {propertyRentPayable ? `₹${propertyRentPayable}` : ''}</div>
								</div>
								<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
									<div style={{ width: '40px' }}>8.</div>
									<div style={{ flex: '1.5' }}>Furniture and other equipment provided to the tenant</div>
									<div style={{ flex: '2' }}>: {propertyFurnitureDescription}</div>
								</div>
								<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
									<div style={{ width: '40px' }}>9.</div>
									<div style={{ flex: '1.5' }}>
										Other charges payable<br />
										(a) Electricity<br />
										(b) Water<br />
										(c) Extra furnishing, fittings and fixtures<br />
										(d) Other services
									</div>
									<div style={{ flex: '2', display: 'flex', flexDirection: 'column' }}>
										<div>&nbsp;</div>
										<div>: {propertyChargeElectricity}</div>
										<div>: {propertyChargeWater}</div>
										<div>: {propertyChargeFurnishing}</div>
										<div>: {propertyChargeOtherServices}</div>
									</div>
								</div>
								<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
									<div style={{ width: '40px' }}>10.</div>
									<div style={{ flex: '1.5' }}>Attach rent or lease or tenancy agreement</div>
									<div style={{ flex: '2' }}>: Attached in uploads</div>
								</div>
								<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
									<div style={{ width: '40px' }}>11.</div>
									<div style={{ flex: '1.5' }}>Duration of tenancy (Period for which let)</div>
									<div style={{ flex: '2' }}>: {propertyTenancyDuration} (Till {propertyTenancyEndDate})</div>
								</div>
								<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
									<div style={{ width: '40px' }}>12.</div>
									<div style={{ flex: '1.5' }}>Permanent Account Number (PAN) of landlord:</div>
									<div style={{ flex: '2' }}>: {landlordPan}</div>
								</div>
								<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
									<div style={{ width: '40px' }}>13.</div>
									<div style={{ flex: '1.5' }}>Aadhaar number of landlord:</div>
									<div style={{ flex: '2' }}>: {landlordAadhar}</div>
								</div>
								<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
									<div style={{ width: '40px' }}>14.</div>
									<div style={{ flex: '1.5' }}>Mobile Number and E-mail id of landlord<br />(if available)</div>
									<div style={{ flex: '2' }}>: {landlordPhone}, {landlordEmail}</div>
								</div>
								<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
									<div style={{ width: '40px' }}>15.</div>
									<div style={{ flex: '1.5' }}>Permanent Account Number (PAN)of tenant</div>
									<div style={{ flex: '2' }}>: {tenantPan}</div>
								</div>
								<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
									<div style={{ width: '40px' }}>16.</div>
									<div style={{ flex: '1.5' }}>Aadhaar number of tenant</div>
									<div style={{ flex: '2' }}>: {tenantAadhar}</div>
								</div>
								<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
									<div style={{ width: '40px' }}>17.</div>
									<div style={{ flex: '1.5' }}>Mobile Number and E-mail id of tenant</div>
									<div style={{ flex: '2' }}>: {tenantPhone}, {tenantEmail}</div>
								</div>
								<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
									<div style={{ width: '40px' }}>18.</div>
									<div style={{ flex: '1.5' }}>Permanent Account Number (PAN)of Property Manager (if any)</div>
									<div style={{ flex: '2' }}>: {managerPan && managerPan !== 'NA' ? managerPan : ''}</div>
								</div>
								<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
									<div style={{ width: '40px' }}>19.</div>
									<div style={{ flex: '1.5' }}>Aadhaar number of Property Manager<br />(if any)</div>
									<div style={{ flex: '2' }}>: {managerAadhar}</div>
								</div>
								<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
									<div style={{ width: '40px' }}>20.</div>
									<div style={{ flex: '1.5' }}>Mobile Number and E-mail id of<br />Property Manager (if any)</div>
									<div style={{ flex: '2' }}>: {managerPhone && managerPhone !== 'NA' ? `${managerPhone}, ${managerEmail !== 'noemail@noemail.com' ? managerEmail : ''}` : ''}</div>
								</div>
							</div>

							<div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px', marginBottom: '30px' }}>
								<div style={{ textAlign: 'center' }}>
									<div style={{ marginBottom: '10px' }}>Name and signature of landlord</div>
									<div style={{ border: '1px solid #000', width: '120px', height: '140px', margin: '10px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
										{landlordPhotoPreview ? <img src={landlordPhotoPreview} alt="L Photo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '0.8rem', textAlign: 'center' }}>Photograph<br />of<br />Landlord</span>}
									</div>
									<div style={{ height: '50px', marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
										{landlordSignaturePreview ? <img src={landlordSignaturePreview} alt="L Sign" style={{ maxHeight: '100%', maxWidth: '150px' }} /> : null}
									</div>
								</div>
								<div style={{ textAlign: 'center' }}>
									<div style={{ marginBottom: '10px' }}>Name and signature of tenant</div>
									<div style={{ border: '1px solid #000', width: '120px', height: '140px', margin: '10px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
										{tenantPhotoPreview ? <img src={tenantPhotoPreview} alt="T Photo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '0.8rem', textAlign: 'center' }}>Photograph<br />of<br />Tenant</span>}
									</div>
									<div style={{ height: '50px', marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
										{tenantSignaturePreview ? <img src={tenantSignaturePreview} alt="T Sign" style={{ maxHeight: '100%', maxWidth: '150px' }} /> : null}
									</div>
								</div>
							</div>

							<div style={{ marginTop: '20px', marginBottom: '30px' }}>
								<strong>Enclosed:</strong>
								<ol style={{ marginLeft: '20px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
									<li>Tenancy Agreement.</li>
									<li>Self-attested copies of PAN and Aadhaar of landlord.</li>
									<li>Self-attested copies of PAN and Aadhaar of tenant.</li>
								</ol>
							</div>
						</div>
						<div className="preview-actions-hint">
							Please review all details carefully before final submission.
						</div>

						{!tenancyReceipt && (
							<div className="tenancy-declaration-section" style={{ marginTop: '32px', padding: '16px', background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '4px' }}>
								<label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', margin: 0, flexDirection: 'row' }}>
									<input
										type="checkbox"
										checked={declarationChecked}
										onChange={(e) => setDeclarationChecked(e.target.checked)}
										disabled={formLocked}
										style={{ marginTop: '4px', width: 'auto' }}
									/>
									<span style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
										I/we hereby declare that the particulars given above are true and correct to the best of my/our knowledge and belief and no material fact has been concealed.
									</span>
								</label>
							</div>
						)}
					</div>
				)}

				{tenancyStep === 5 && tenancyReceipt && (
					<div className="tenancy-success-card">
						<h3>Application Submitted!</h3>
						<p>Your Application No is: <strong>{tenancyReceipt.application_no}</strong></p>
						<div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
							<button type="button" onClick={() => navigate('/dashboard/status')}>View My Applications</button>
							<button
								type="button"
								className="action-icon-btn secondary"
								title="Download Acknowledgement"
								data-tooltip="Download Acknowledgement"
								onClick={async () => {
									try {
										const response = await api.get(`/api/tenancy-applications/${tenancyReceipt.application_no}/acknowledgement?print=1`);
										const printWindow = window.open('', '_blank');
										printWindow.document.write(response.data);
										printWindow.document.close();
									} catch (err) {
										alert('Failed to open acknowledgement');
									}
								}}
							>
								<Icon name="download" className="btn-icon-svg" />
							</button>
						</div>
					</div>
				)}

				<div className="form-actions">
					{tenancyStep > 1 && tenancyStep < 5 && !tenancyReceipt && <button type="button" className="secondary" onClick={() => setTenancyStep(prev => prev - 1)}>Back</button>}
					{tenancyStep === 1 && <button type="button" className="secondary" onClick={resetTenancyForm}>Reset</button>}
					{tenancyStep < 4 && <button type="submit">Next</button>}
					{tenancyStep === 4 && !tenancyReceipt && <button type="submit" disabled={tenancySubmitting || !declarationChecked}>{tenancySubmitting ? 'Submitting...' : 'Confirm & Submit'}</button>}
				</div>
			</form>
		</div>
	)
}

export default TenancyCertificate
