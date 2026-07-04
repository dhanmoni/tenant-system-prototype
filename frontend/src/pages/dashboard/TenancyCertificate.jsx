import { useCallback, useEffect, useState } from 'react'
import { Link, useOutletContext, useNavigate, useSearchParams } from 'react-router-dom'
import api, { csrf } from '../../api'
import { buildTenancyFormData, applyDraftToForm } from '../../utils/tenancyDraft'
import { Icon } from '../../components/dashboard/Icons'
import DocumentUploadSlot from '../../components/forms/DocumentUploadSlot'

function TenancyCertificate() {
	const { user } = useOutletContext()
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const PASSPORT_WIDTH = 350
	const PASSPORT_HEIGHT = 450
	const PASSPORT_TOP_BIAS = 0.18

	const [tenancyStep, setTenancyStep] = useState(1)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [tenancySubmitting, setTenancySubmitting] = useState(false)
	const [draftSaving, setDraftSaving] = useState(false)
	const [draftApplicationNo, setDraftApplicationNo] = useState(null)
	const [savedWizardStep, setSavedWizardStep] = useState(0)
	const [draftLoaded, setDraftLoaded] = useState(false)
	const [conflictData, setConflictData] = useState(null)
	const [submittedApp, setSubmittedApp] = useState(null)
	const [linkCopied, setLinkCopied] = useState(false)

	// Payment State
	const [paymentComplete, setPaymentComplete] = useState(false)
	const [paymentSimulating, setPaymentSimulating] = useState(false)
	const [paymentGrn, setPaymentGrn] = useState('')

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
	const [docPreview, setDocPreview] = useState(null)

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

	const populateFromDraft = useCallback(
		(draft) => {
			applyDraftToForm(draft, {
				setDraftApplicationNo,
				setSavedWizardStep,
				setTenancyStep,
				setInitiatorRole,
				setTenancyRegistrationDate,
				setTenancyOfficeId,
				setTenancyDistrictId,
				setTenancyVillageWardId,
				setLandlordName,
				setLandlordAddress,
				setLandlordEmail,
				setLandlordPhone,
				setLandlordPan,
				setLandlordAadhar,
				setManagerName,
				setManagerAddress,
				setManagerEmail,
				setManagerPhone,
				setManagerPan,
				setManagerAadhar,
				setTenantName,
				setTenantAddress,
				setTenantEmail,
				setTenantPhone,
				setTenantPan,
				setTenantAadhar,
				setTenantPreviousTenancy,
				setPropertyPossessionDate,
				setPropertyRentPayable,
				setPropertyPremisesDescription,
				setPropertyFurnitureDescription,
				setPropertyChargeElectricity,
				setPropertyChargeWater,
				setPropertyChargeFurnishing,
				setPropertyChargeOtherServices,
				setPropertyTenancyDuration,
				setAgreementPreviewUrl,
				setLandlordPhotoPreview,
				setLandlordSignaturePreview,
				setTenantPhotoPreview,
				setTenantSignaturePreview,
			}, { loadVillageWards: loadTenancyVillageWards })
		},
		[]
	)

	const loadDraft = useCallback(async () => {
		try {
			const draftNo = searchParams.get('draft')
			if (draftNo) {
				const { data } = await api.get(`/api/tenancy-applications/${draftNo}`)
				const app = data.application || data
				if (app?.status === 'DRAFT') {
					populateFromDraft(app)
					setDraftLoaded(true)
					return
				}
			}
			const { data } = await api.get('/api/tenancy-applications/draft/current')
			if (data.draft) {
				populateFromDraft(data.draft)
			}
		} catch (err) {
			console.error('Failed to load draft', err)
		} finally {
			setDraftLoaded(true)
		}
	}, [populateFromDraft, searchParams])

	useEffect(() => {
		if (tenancyDistricts.length > 0) {
			loadDraft()
		}
	}, [tenancyDistricts.length, loadDraft])

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
		setTenancyStep(1); setDraftApplicationNo(null); setSavedWizardStep(0); setTenancyRegistrationDate(''); setTenancyOfficeId('');
		setAgreementFile(null); setAgreementPreviewUrl(''); setLandlordPhotoFile(null); setLandlordPhotoPreview(profileType === 'landlord' ? profilePhotoPreview : '');
		setLandlordSignatureFile(null); setLandlordSignaturePreview(''); setTenantPhotoFile(null); setTenantPhotoPreview(profileType === 'tenant' ? profilePhotoPreview : '');
		setTenantSignatureFile(null); setTenantSignaturePreview(''); setManagerName(''); setManagerAddress(''); setManagerEmail(''); setManagerPhone(''); setManagerPan('');
		setTenantPreviousTenancy(''); setPropertyPossessionDate(''); setPropertyRentPayable(''); setPropertyPremisesDescription(''); setPropertyFurnitureDescription('');
		setPropertyChargeElectricity(''); setPropertyChargeWater(''); setPropertyChargeFurnishing(''); setPropertyChargeOtherServices(''); setPropertyTenancyDuration('');
		setPropertyTenancyEndDate(''); setSuccess(''); setError(''); setTenancyVillageWardId(''); setTenancyVillageWards([]); setTenancyDistrictId('');
		setPaymentComplete(false); setPaymentSimulating(false); setPaymentGrn(''); setDeclarationChecked(false);
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

	const feeAmount = (() => {
		if (!applyType) return 0
		const type = applyType.toLowerCase()
		return type === 'joint' ? 50 : type === 'individual' ? 75 : 0
	})()

	const handleMockPayment = () => {
		setPaymentSimulating(true)
		// TODO: Replace this mock with actual eGRAS payment gateway redirect & callback logic
		setTimeout(() => {
			setPaymentSimulating(false)
			setPaymentComplete(true)
			setPaymentGrn(String(Math.floor(Math.random() * 1000000000)))
		}, 1500)
	}

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

	const getFormState = () => ({
		tenancyRegistrationDate,
		tenancyOfficeId,
		tenancyVillageWardId,
		initiatorRole,
		applyType,
		landlordName,
		landlordAddress,
		landlordEmail,
		landlordPhone,
		landlordPan,
		landlordAadhar,
		managerName,
		managerAddress,
		managerEmail,
		managerPhone,
		managerPan,
		managerAadhar,
		tenantName,
		tenantAddress,
		tenantEmail,
		tenantPhone,
		tenantPan,
		tenantAadhar,
		tenantPreviousTenancy,
		propertyPossessionDate,
		propertyRentPayable,
		propertyPremisesDescription,
		propertyFurnitureDescription,
		propertyChargeElectricity,
		propertyChargeWater,
		propertyChargeFurnishing,
		propertyChargeOtherServices,
		propertyTenancyDuration,
		agreementFile,
		landlordPhotoFile,
		landlordSignatureFile,
		tenantPhotoFile,
		tenantSignatureFile,
		landlordPanFile,
		tenantPanFile,
		managerPanFile,
	})

	const saveDraftStep = async (step) => {
		setError('')
		setSuccess('')
		setDraftSaving(true)
		try {
			await csrf()
			// Include all stages up to the furthest reached so going back to edit
			// stage 1 does not drop data saved in later stages.
			const throughStep = Math.max(step, savedWizardStep || 0)
			const formData = buildTenancyFormData(getFormState(), {
				wizardStep: step,
				includeThroughStep: throughStep,
			})
			let data
			if (!draftApplicationNo) {
				const res = await api.post('/api/tenancy-applications/draft', formData)
				data = res.data
			} else {
				// PHP does not parse multipart bodies on PUT; use POST + method spoofing.
				formData.append('_method', 'PUT')
				const res = await api.post(
					`/api/tenancy-applications/${draftApplicationNo}/draft`,
					formData
				)
				data = res.data
			}
			const draft = data.draft || data
			if (draft?.application_no) {
				setDraftApplicationNo(draft.application_no)
				setSavedWizardStep(Math.max(step, Number(draft.wizard_step) || step))
			}
			setSuccess('Progress saved.')
			return true
		} catch (err) {
			const errors = err?.response?.data?.errors
			let msg = err?.response?.data?.message || 'Failed to save progress'
			if (errors && typeof errors === 'object') {
				const list = Object.entries(errors).flatMap(([field, messages]) =>
					(Array.isArray(messages) ? messages : [messages]).map((m) => `${field}: ${m}`)
				)
				if (list.length) msg = list.join('. ')
			}
			setError(msg)
			return false
		} finally {
			setDraftSaving(false)
		}
	}

	const submitTenancyApplication = async (forceNew = false) => {
		setError(''); setSuccess(''); setTenancySubmitting(true)
		if (!forceNew) setConflictData(null)

		try {
			await csrf()
			const formData = buildTenancyFormData(getFormState(), { includeAll: true })
			formData.append('initiator_role', initiatorRole)
			formData.append('apply_type', applyType || 'Individual')
			if (forceNew) formData.append('force_new', '1')

			let data
			if (draftApplicationNo) {
				const res = await api.post(
					`/api/tenancy-applications/${draftApplicationNo}/submit`,
					formData,
					{ headers: { 'Content-Type': 'multipart/form-data' } }
				)
				data = res.data
			} else {
				const res = await api.post('/api/tenancy-applications', formData, {
					headers: { 'Content-Type': 'multipart/form-data' },
				})
				data = res.data
			}
			setConflictData(null)
			setSubmittedApp({
				application_no: data.application_no,
				ref_code: data.ref_code,
				join_link: data.join_link,
				message: data.message,
				apply_type: data.application?.apply_type || applyType,
				fee_amount: feeAmount,
				payment_grn: paymentGrn,
			})
			scrollFormToTop()
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
		{ id: 1, label: 'Registration' },
		{ id: 2, label: 'Tenancy details' },
		{ id: 3, label: 'Documents' },
		{ id: 4, label: 'Preview' },
		{ id: 5, label: 'Payment' },
	]

	const TOTAL_STEPS = tenancySteps.length

	const eligibilityMet = !registrationTooOld && !!tenancyRegistrationDate && !!tenancyOfficeId
	const maxReachableStep = Math.min(TOTAL_STEPS, Math.max(tenancyStep, savedWizardStep + 1))

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
	}, [tenancyStep, scrollFormToTop])

	const goToStep = (stepId) => {
		if (stepId < 1 || stepId > TOTAL_STEPS) return
		if (stepId > maxReachableStep) return
		setTenancyStep(stepId)
		setError('')
		setSuccess('')
		// Ensure village/ward list is available when returning to registration
		if (stepId === 1 && tenancyDistrictId) {
			loadTenancyVillageWards(tenancyDistrictId)
		}
	}

	const handleContinue = async (e) => {
		e.preventDefault()
		if (tenancyStep === 1 && registrationTooOld) return
		if (tenancyStep === 2) {
			if (!managerName.trim()) setManagerName('NA')
			if (!managerAddress.trim()) setManagerAddress('NA')
			if (!managerEmail.trim()) setManagerEmail('noemail@noemail.com')
			if (!managerPhone.trim()) setManagerPhone('NA')
			if (!managerPan.trim()) setManagerPan('NA')
		}
		if (tenancyStep === 4) {
			if (!declarationChecked) {
				setError('You must accept the declaration to proceed to payment.')
				return
			}
			const ok = await saveDraftStep(4)
			if (ok) setTenancyStep(5)
			return
		}
		if (tenancyStep === 5) {
			if (!paymentComplete) {
				setError('You must complete the fee payment before submitting.')
				return
			}
			if (!declarationChecked) {
				setError('You must accept the declaration to submit.')
				return
			}
			submitTenancyApplication()
			return
		}
		const ok = await saveDraftStep(tenancyStep)
		if (ok) setTenancyStep((prev) => Math.min(TOTAL_STEPS, prev + 1))
	}

	const openInPrintWindow = (html) => {
		const printWindow = window.open('', '_blank')
		if (!printWindow) return
		printWindow.document.write(html)
		printWindow.document.close()
	}

	const handleDownloadAcknowledgement = async () => {
		if (!submittedApp?.application_no) return
		try {
			const res = await api.get(
				`/api/tenancy-applications/${submittedApp.application_no}/acknowledgement?print=1`
			)
			openInPrintWindow(res.data)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to open acknowledgement')
		}
	}

	const handleDownloadApplication = async () => {
		if (!submittedApp?.application_no) return
		try {
			const res = await api.get(
				`/api/tenancy-applications/${submittedApp.application_no}/application-details?print=1`
			)
			openInPrintWindow(res.data)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to open application')
		}
	}

	const handleCopyJoinLink = async () => {
		if (!submittedApp?.join_link) return
		try {
			await navigator.clipboard.writeText(submittedApp.join_link)
			setLinkCopied(true)
			setTimeout(() => setLinkCopied(false), 2000)
		} catch {
			setError('Could not copy the link. Please copy it manually.')
		}
	}

	if (submittedApp) {
		const isJoint = String(submittedApp.apply_type || '').toLowerCase() === 'joint'
		return (
			<div className="ws-page ws-uin-apply tenancy-certificate-page">
				<div className="uin-confirm">
					<div className="uin-confirm-card">
						<div className="uin-confirm-icon" aria-hidden>✓</div>
						<h1 className="uin-confirm-title">Application submitted successfully</h1>
						<p className="uin-confirm-lead">
							{submittedApp.message ||
								'Your tenancy certificate application has been lodged.'}
						</p>

						<dl className="uin-confirm-meta">
							<div className="uin-confirm-meta-row">
								<dt>Application number</dt>
								<dd>{submittedApp.application_no || '—'}</dd>
							</div>
							{submittedApp.ref_code ? (
								<div className="uin-confirm-meta-row">
									<dt>Reference code</dt>
									<dd>{submittedApp.ref_code}</dd>
								</div>
							) : null}
							<div className="uin-confirm-meta-row">
								<dt>Fee paid</dt>
								<dd>
									₹{submittedApp.fee_amount}
									{submittedApp.payment_grn ? ` · GRN ${submittedApp.payment_grn}` : ''}
								</dd>
							</div>
						</dl>

						{isJoint && submittedApp.join_link ? (
							<div className="uin-confirm-invite">
								<p className="uin-confirm-joint-note">
									This is a joint application. It is awaiting the other party's
									verification and payment. Share the invite link below so they can
									complete their details.
								</p>
								<div className="uin-confirm-invite-row">
									<input
										type="text"
										className="uin-confirm-invite-input"
										value={submittedApp.join_link}
										readOnly
										onFocus={(e) => e.target.select()}
									/>
									<button
										type="button"
										className="ws-btn ws-btn--secondary uin-confirm-invite-copy"
										onClick={handleCopyJoinLink}
									>
										{linkCopied ? 'Copied!' : 'Copy link'}
									</button>
								</div>
							</div>
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

	return (
		<div className="ws-page ws-uin-apply tenancy-certificate-page">
			<nav className="ws-breadcrumb" aria-label="Breadcrumb">
				<Link to="/dashboard">Dashboard</Link>
				<span className="ws-breadcrumb-sep">/</span>
				<span>Apply for UIN</span>
			</nav>

			<header className="ws-uin-apply-head">
				<h1 className="ws-uin-apply-title">Apply for Tenancy Certificate (UIN)</h1>
				<p className="ws-uin-apply-lead">
					Complete each stage in order. Your progress is saved when you continue — you can return to earlier stages to make changes.
				</p>
				{draftApplicationNo ? (
					<p className="ws-uin-apply-draft-id">
						Draft: <strong>{draftApplicationNo}</strong>
					</p>
				) : null}
			</header>

			<div className="ws-uin-apply-body">
				<aside className="ws-uin-wizard-rail" aria-label="Application stages">
					<p className="ws-uin-wizard-rail-title">Stages</p>
					<ol className="ws-uin-wizard-steps">
						{tenancySteps.map((step, idx) => {
							const done = tenancyStep > step.id || savedWizardStep >= step.id
							const active = tenancyStep === step.id
							const reachable = step.id <= maxReachableStep
							return (
								<li
									key={step.id}
									className={`ws-uin-wizard-step${active ? ' is-active' : ''}${done ? ' is-done' : ''}${!reachable ? ' is-locked' : ''}`}
								>
									<button
										type="button"
										className="ws-uin-wizard-step-btn"
										disabled={!reachable}
										aria-current={active ? 'step' : undefined}
										onClick={() => goToStep(step.id)}
									>
										<span className="ws-uin-wizard-step-num">{done && !active ? '✓' : step.id}</span>
										<span className="ws-uin-wizard-step-label">{step.label}</span>
									</button>
									{idx < tenancySteps.length - 1 ? (
										<span className="ws-uin-wizard-step-line" aria-hidden />
									) : null}
								</li>
							)
						})}
					</ol>
				</aside>

				<div className="ws-uin-apply-main">
					{error ? <div className="ws-alert ws-alert--error">{error}</div> : null}

					{conflictData && (
						<div className="conflict-notice-box">
							<p>An application with these details already exists (Application No: <strong>{conflictData.existing_application?.application_no}</strong>).</p>
							<div className="conflict-actions">
								<button type="button" className="secondary" onClick={() => navigate(`/dashboard/status?app_no=${conflictData.existing_application?.application_no}`)}>View Existing Application</button>
								<button type="button" className="danger" onClick={() => submitTenancyApplication(true)}>Start Fresh Application Anyway</button>
							</div>
						</div>
					)}

					{success ? <div className="ws-alert ws-alert--success">{success}</div> : null}

					{!draftLoaded ? (
						<div className="ws-uin-apply-loading">Loading your application…</div>
					) : null}

					{draftLoaded ? (
			<form
				className={`tenancy-form ws-uin-apply-form${tenancyStep === 4 ? ' ws-uin-apply-form--preview-step' : ''}`}
				onSubmit={handleContinue}
			>
				{tenancyStep === 1 && (
					<fieldset className="tenancy-fieldset">
						<div className="form-grid">
							<label>
								<span className="label-text required">Initiating as</span>
								<select value={initiatorRole} onChange={e => setInitiatorRole(e.target.value)} required>
									<option value="">Select Role</option>
									<option value="LANDLORD">Landlord</option>
									<option value="TENANT">Tenant</option>
								</select>
							</label>

							<label>
								<span className="label-text required">Date of Agreement</span>
								<input type="date" value={tenancyRegistrationDate} onChange={e => setTenancyRegistrationDate(e.target.value)} onClick={(e) => e.target.showPicker && e.target.showPicker()} required max={new Date().toISOString().split('T')[0]} />
							</label>
							<label>
								<span className="label-text required">District</span>
								<select value={tenancyDistrictId} onChange={e => { setTenancyDistrictId(e.target.value); setTenancyVillageWardId(''); setTenancyVillageWards([]); loadTenancyVillageWards(e.target.value); }} required>
									<option value="">Select District</option>
									{tenancyDistricts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
								</select>
							</label>

							<label>
								<span className="label-text required">Village / Ward</span>
								<select value={tenancyVillageWardId} onChange={e => setTenancyVillageWardId(e.target.value)} required disabled={!tenancyDistrictId}>
									<option value="">Select Village/Ward</option>
									{tenancyVillageWards.map(vw => <option key={vw.id} value={vw.id}>{vw.name}</option>)}
								</select>
							</label>

							<label>
								<span className="label-text required">Circle Office:</span>
								<select value={tenancyOfficeId} onChange={e => setTenancyOfficeId(e.target.value)} required>
									<option value="">Select Office</option>
									{tenancyOffices.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
								</select>
							</label>

							<label>
								<span className="label-text required">Application Type</span>
								<input type="text" value={applyType} readOnly disabled className="readonly-input" />
							</label>
						</div>

						<div className="tenancy-criteria-box tenancy-criteria-box--after-type">
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
							{tenancyRegistrationDate ? (
								<div className={`tenancy-eligibility-result ${eligibilityMet ? 'eligible' : 'not-eligible'}`}>
									{eligibilityMet ? (
										<p>
											<strong>You are eligible</strong> to apply. Type: <strong>{applyType}</strong>
											{applyType === 'Joint' ? ' — the other party will complete their details after you submit.' : null}
										</p>
									) : registrationTooOld ? (
										<p><strong>Not eligible,</strong> as agreement date is more than 3 months old.</p>
									) : null}
								</div>
							) : null}
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
									<input type="text" placeholder="Landlord Name" value={landlordName} onChange={e => setLandlordName(e.target.value)} required />
									<textarea placeholder="Address" value={landlordAddress} onChange={e => setLandlordAddress(e.target.value)} required />
								</div>
							</div>

							<div className="form-group-row">
								<label><span className="label-text">2. Name and address of the Property Manager (if any)</span></label>
								<div className="form-grid">
									<input type="text" placeholder="Property Manager Name" value={managerName} onChange={e => setManagerName(e.target.value)} />
									<textarea placeholder="Address" value={managerAddress} onChange={e => setManagerAddress(e.target.value)} />
								</div>
							</div>

							<div className="form-group-row">
								<label><span className="label-text required">3. Name and address of the tenant, including email and contact details</span></label>
								<div className="form-grid">
									<input type="text" placeholder="Tenant Name" value={tenantName} onChange={e => setTenantName(e.target.value)} required />
									<textarea placeholder="Address" value={tenantAddress} onChange={e => setTenantAddress(e.target.value)} required />
								</div>
							</div>

							<div className="form-group-row">
								<label><span className="label-text">4. Description of previous tenancy, if any</span>
									<textarea value={tenantPreviousTenancy} onChange={e => setTenantPreviousTenancy(e.target.value)} />
								</label>
							</div>

							<div className="form-group-row">
								<label><span className="label-text">5. Description of premises let to the tenant Including appurtenant land, if any</span>
									<textarea value={propertyPremisesDescription} onChange={e => setPropertyPremisesDescription(e.target.value)} />
								</label>
							</div>

							<div className="form-group-row">
								<label><span className="label-text required">6. Date from which possession is given to the tenant</span>
									<input type="date" value={propertyPossessionDate} onChange={e => setPropertyPossessionDate(e.target.value)} onClick={(e) => e.target.showPicker && e.target.showPicker()} required />
								</label>
							</div>

							<div className="form-group-row">
								<label><span className="label-text required">7. Rent payable as in section 8 (Monthly Rent ₹)</span>
									<input type="number" value={propertyRentPayable} onChange={e => setPropertyRentPayable(e.target.value)} onWheel={e => e.target.blur()} min="0" required />
								</label>
							</div>

							<div className="form-group-row">
								<label><span className="label-text">8. Furniture and other equipment provided to the tenant</span>
									<textarea value={propertyFurnitureDescription} onChange={e => setPropertyFurnitureDescription(e.target.value)} />
								</label>
							</div>

							<div className="form-group-row">
								<label><span className="label-text">9. Other charges payable</span></label>
								<div className="form-grid">
									<label><span className="label-text">(a) Electricity</span><input type="number" value={propertyChargeElectricity} onChange={e => setPropertyChargeElectricity(e.target.value)} onWheel={e => e.target.blur()} min="0" /></label>
									<label><span className="label-text">(b) Water</span><input type="number" value={propertyChargeWater} onChange={e => setPropertyChargeWater(e.target.value)} onWheel={e => e.target.blur()} min="0" /></label>
									<label><span className="label-text">(c) Extra furnishing, fittings and fixtures</span><input type="number" value={propertyChargeFurnishing} onChange={e => setPropertyChargeFurnishing(e.target.value)} onWheel={e => e.target.blur()} min="0" /></label>
									<label><span className="label-text">(d) Other services</span><input type="number" value={propertyChargeOtherServices} onChange={e => setPropertyChargeOtherServices(e.target.value)} onWheel={e => e.target.blur()} min="0" /></label>
								</div>
							</div>

							<div className="form-group-row">
								<label><span className="label-text required">10. Duration of tenancy (Period for which let)</span></label>
								<div className="form-grid">
									<label><span className="label-text">End Date</span><input type="date" value={propertyTenancyEndDate} onChange={e => setPropertyTenancyEndDate(e.target.value)} onClick={(e) => e.target.showPicker && e.target.showPicker()} required min={propertyPossessionDate} /></label>
									<label><span className="label-text">Duration</span><input type="text" value={propertyTenancyDuration} readOnly disabled className="readonly-input" /></label>
								</div>
							</div>

							<div className="form-group-row">
								<label><span className="label-text required">11. Permanent Account Number (PAN) of landlord:</span>
									<input type="text" value={landlordPan} onChange={e => setLandlordPan(e.target.value.toUpperCase())} required />
								</label>
							</div>

							<div className="form-group-row">
								<label><span className="label-text required">12. Mobile Number and E-mail id of landlord (if available)</span></label>
								<div className="form-grid">
									<input type="tel" placeholder="Mobile Number" value={landlordPhone} onChange={e => setLandlordPhone(e.target.value)} required />
									<input type="email" placeholder="E-mail id" value={landlordEmail} onChange={e => setLandlordEmail(e.target.value)} required={initiatorRole === 'LANDLORD'} />
								</div>
							</div>

							<div className="form-group-row">
								<label><span className="label-text required">13. Permanent Account Number (PAN) of tenant</span>
									<input type="text" value={tenantPan} onChange={e => setTenantPan(e.target.value.toUpperCase())} required />
								</label>
							</div>

							<div className="form-group-row">
								<label><span className="label-text required">14. Mobile Number and E-mail id of tenant</span></label>
								<div className="form-grid">
									<input type="tel" placeholder="Mobile Number" value={tenantPhone} onChange={e => setTenantPhone(e.target.value)} required />
									<input type="email" placeholder="E-mail id" value={tenantEmail} onChange={e => setTenantEmail(e.target.value)} required={initiatorRole === 'TENANT'} />
								</div>
							</div>

							<div className="form-group-row">
								<label><span className="label-text">15. Permanent Account Number (PAN) of Property Manager (if any)</span>
									<input type="text" value={managerPan} onChange={e => setManagerPan(e.target.value.toUpperCase())} />
								</label>
							</div>

							<div className="form-group-row">
								<label><span className="label-text">16. Mobile Number and E-mail id of Property Manager (if any)</span></label>
								<div className="form-grid">
									<input type="tel" placeholder="Mobile Number" value={managerPhone} onChange={e => setManagerPhone(e.target.value)} />
									<input type="email" placeholder="E-mail id" value={managerEmail} onChange={e => setManagerEmail(e.target.value)} />
								</div>
							</div>
						</section>
					</div>
				)}

				{tenancyStep === 3 && (
					<fieldset className="tenancy-fieldset tenancy-docs-fieldset">
						<div className="tenancy-docs-step">
							<header className="tenancy-docs-step__header">
								<h2 className="tenancy-docs-step__title">Upload required documents</h2>
								<p className="tenancy-docs-step__lead">
									All items below are mandatory. Use the preview icon after each upload to verify the file.
								</p>
								<ul className="tenancy-docs-step__checklist" aria-label="Required documents">
									<li>Registered tenancy agreement (PDF)</li>
									<li>Passport-size photograph</li>
									<li>PAN Card</li>
									<li>Signature</li>
								</ul>
							</header>

							<div className="tenancy-docs-step__cards">
								<article className="tenancy-doc-card">
									<div className="tenancy-doc-card__head">
										<span className="tenancy-doc-card__num">1</span>
										<div>
											<h3 className="tenancy-doc-card__title">Registered tenancy agreement</h3>
											<p className="tenancy-doc-card__meta">PDF only · scanned copy of the registered agreement</p>
										</div>
									</div>
									<div className="tenancy-doc-slot tenancy-doc-slot--wide">
										<label className="tenancy-doc-slot__label" htmlFor="uin-agreement-file">
											<span className="label-text required">Choose file</span>
											<input
												id="uin-agreement-file"
												type="file"
												accept=".pdf"
												onChange={e => {
													const f = e.target.files[0]
													setAgreementFile(f)
													if (f) setAgreementPreviewUrl(URL.createObjectURL(f))
													else setAgreementPreviewUrl('')
												}}
											/>
										</label>
										<div className="tenancy-doc-slot__status">
											{agreementFile ? (
												<div className="tenancy-doc-slot__uploaded">
													<span className="tenancy-doc-slot__file-badge" aria-hidden>PDF</span>
													<span className="tenancy-doc-slot__filename" title={agreementFile.name}>
														{agreementFile.name}
													</span>
													<button
														type="button"
														className="tenancy-doc-preview-btn"
														title="Preview agreement"
														aria-label="Preview agreement"
														onClick={() => openDocPreview('Registered Tenancy Agreement', agreementPreviewUrl, true)}
													>
														<Icon name="eye" />
													</button>
												</div>
											) : (
												<span className="tenancy-doc-slot__pending">Awaiting upload</span>
											)}
										</div>
									</div>
								</article>

								<article className="tenancy-doc-card">
									<div className="tenancy-doc-card__head">
										<span className="tenancy-doc-card__num">2</span>
										<div>
											<h3 className="tenancy-doc-card__title">Personal documents</h3>
											<p className="tenancy-doc-card__meta">
												{initiatorRole === 'TENANT' ? 'Tenant' : 'Landlord'} photograph, signature, and PAN card
											</p>
										</div>
									</div>
									<div className="tenancy-doc-card__grid">
										{initiatorRole === 'TENANT' ? (
											<>
												<DocumentUploadSlot
													id="uin-tenant-photo"
													label="Passport-size photograph"
													accept="image/*"
													hint="Auto-cropped to passport ratio."
													required
													onChange={async (e) => {
														const f = e.target.files[0]
														await handlePassportPhotoUpload(f, setTenantPhotoFile, setTenantPhotoPreview, 'tenant')
													}}
													imagePreview={tenantPhotoPreview}
													previewTitle="Passport-size photograph"
													onPreview={openDocPreview}
													onFilePreview={openFilePreview}
												/>
												<DocumentUploadSlot
													id="uin-tenant-signature"
													label="Signature"
													accept="image/*"
													required
													onChange={e => {
														const f = e.target.files[0]
														setTenantSignatureFile(f)
														if (f) setTenantSignaturePreview(URL.createObjectURL(f))
													}}
													imagePreview={tenantSignaturePreview}
													previewTitle="Signature"
													onPreview={openDocPreview}
													onFilePreview={openFilePreview}
												/>
												<DocumentUploadSlot
													id="uin-tenant-pan"
													label="PAN card document"
													accept=".pdf,image/*"
													required
													onChange={e => setTenantPanFile(e.target.files[0])}
													file={tenantPanFile}
													previewTitle="PAN Card"
													onPreview={openDocPreview}
													onFilePreview={openFilePreview}
												/>
											</>
										) : (
											<>
												<DocumentUploadSlot
													id="uin-landlord-photo"
													label="Passport-size photograph"
													accept="image/*"
													hint="Auto-cropped to passport ratio."
													required
													onChange={async (e) => {
														const f = e.target.files[0]
														await handlePassportPhotoUpload(f, setLandlordPhotoFile, setLandlordPhotoPreview, 'landlord')
													}}
													imagePreview={landlordPhotoPreview}
													previewTitle="Passport-size photograph"
													onPreview={openDocPreview}
													onFilePreview={openFilePreview}
												/>
												<DocumentUploadSlot
													id="uin-landlord-signature"
													label="Signature"
													accept="image/*"
													required
													onChange={e => {
														const f = e.target.files[0]
														setLandlordSignatureFile(f)
														if (f) setLandlordSignaturePreview(URL.createObjectURL(f))
													}}
													imagePreview={landlordSignaturePreview}
													previewTitle="Signature"
													onPreview={openDocPreview}
													onFilePreview={openFilePreview}
												/>
												<DocumentUploadSlot
													id="uin-landlord-pan"
													label="PAN card document"
													accept=".pdf,image/*"
													required
													onChange={e => setLandlordPanFile(e.target.files[0])}
													file={landlordPanFile}
													previewTitle="PAN Card"
													onPreview={openDocPreview}
													onFilePreview={openFilePreview}
												/>
											</>
										)}
									</div>
								</article>
							</div>
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
							Please review all details carefully before continuing to payment.
						</div>

						<div className="ws-uin-declaration">
							<label className="ws-uin-declaration-label">
								<input
									type="checkbox"
									checked={declarationChecked}
									onChange={(e) => setDeclarationChecked(e.target.checked)}
								/>
								<span>
									I/we hereby declare that the particulars given above are true and correct to the best of my/our knowledge and belief and no material fact has been concealed.
								</span>
							</label>
						</div>
					</div>
				)}

				{tenancyStep === 5 && (
					<fieldset className="tenancy-fieldset ws-uin-payment-step">
						<div className="ws-uin-payment-card">
							<h2 className="ws-uin-payment-card-title">Application fee payment</h2>
							<p className="ws-uin-payment-card-lead">
								Complete the fee payment to submit your tenancy certificate application. Your application is only lodged after the payment is successful and the acknowledgement is generated.
							</p>

							<div className="ws-uin-payment-summary">
								<div className="ws-uin-payment-summary-row">
									<span>Application type</span>
									<strong>{applyType || '—'}</strong>
								</div>
								<div className="ws-uin-payment-summary-row">
									<span>Amount payable</span>
									<strong>₹{feeAmount}</strong>
								</div>
								{draftApplicationNo ? (
									<div className="ws-uin-payment-summary-row">
										<span>Draft reference</span>
										<strong>{draftApplicationNo}</strong>
									</div>
								) : null}
							</div>

							{!paymentComplete ? (
								<button
									type="button"
									className="ws-btn ws-btn--primary ws-uin-payment-pay-btn"
									onClick={handleMockPayment}
									disabled={paymentSimulating || draftSaving}
								>
									{paymentSimulating ? 'Processing payment…' : `Pay ₹${feeAmount} via eGRAS`}
								</button>
							) : (
								<div className="ws-alert ws-alert--success ws-uin-payment-success">
									Payment of ₹{feeAmount} completed successfully.{paymentGrn ? ` (Mock GRN: ${paymentGrn})` : ''}
								</div>
							)}

							<p className="ws-uin-payment-note">
								This is a demo payment step. No real transaction is processed.
							</p>
						</div>
					</fieldset>
				)}

				<div className="form-actions ws-uin-apply-actions">
					{tenancyStep > 1 ? (
						<button type="button" className="ws-btn ws-btn--secondary" onClick={() => goToStep(tenancyStep - 1)}>
							Back
						</button>
					) : null}
					{tenancyStep === 1 ? (
						<button type="button" className="ws-btn ws-btn--secondary" onClick={resetTenancyForm}>
							Start over
						</button>
					) : null}
					{tenancyStep < 4 ? (
						<button type="submit" className="ws-btn ws-btn--primary" disabled={draftSaving || (tenancyStep === 1 && registrationTooOld)}>
							{draftSaving ? 'Saving…' : 'Save & continue'}
						</button>
					) : null}
					{tenancyStep === 4 ? (
						<button type="submit" className="ws-btn ws-btn--primary" disabled={draftSaving || !declarationChecked}>
							{draftSaving ? 'Saving…' : 'Proceed to payment'}
						</button>
					) : null}
					{tenancyStep === 5 ? (
						<button type="submit" className="ws-btn ws-btn--primary" disabled={tenancySubmitting || draftSaving || !declarationChecked || !paymentComplete}>
							{tenancySubmitting ? 'Submitting…' : 'Confirm & submit'}
						</button>
					) : null}
				</div>
			</form>
					) : null}
				</div>
			</div>

			{docPreview ? (
				<div className="tenancy-doc-preview-overlay" role="presentation" onClick={closeDocPreview}>
					<div
						className="tenancy-doc-preview-modal"
						role="dialog"
						aria-modal="true"
						aria-labelledby="tenancy-doc-preview-title"
						onClick={(e) => e.stopPropagation()}
					>
						<header className="tenancy-doc-preview-modal__header">
							<h2 id="tenancy-doc-preview-title">{docPreview.title}</h2>
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

export default TenancyCertificate
