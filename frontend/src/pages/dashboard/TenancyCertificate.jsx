import { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import { Link, useOutletContext, useNavigate, useSearchParams } from 'react-router-dom'
import api, { csrf } from '../../api'
import { buildTenancyFormData, applyDraftToForm, cleanOptionalValue } from '../../utils/tenancyDraft'
import { formatDate } from '../../utils/formatters'
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
	const [saveToast, setSaveToast] = useState('')
	const [tenancySubmitting, setTenancySubmitting] = useState(false)
	const [draftSaving, setDraftSaving] = useState(false)
	const [draftApplicationNo, setDraftApplicationNo] = useState(null)
	const [savedWizardStep, setSavedWizardStep] = useState(0)
	const [pageReady, setPageReady] = useState(false)
	const [draftLoaded, setDraftLoaded] = useState(false)
	const [conflictData, setConflictData] = useState(null)
	const [submittedApp, setSubmittedApp] = useState(null)
	const [linkCopied, setLinkCopied] = useState(false)
	const saveToastTimerRef = useRef(null)

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
	const [tenancyAreaType, setTenancyAreaType] = useState('')
	const [tenancyLocalBody, setTenancyLocalBody] = useState('')
	const [tenancyVillageWardId, setTenancyVillageWardId] = useState('')
	const [tenancyVillageName, setTenancyVillageName] = useState('')
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
	const [managerMode, setManagerMode] = useState('enter') // 'same' | 'enter'

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
	const [profileDistrictId, setProfileDistrictId] = useState('')
	const [profileOfficeId, setProfileOfficeId] = useState('')



	const populateFromDraft = useCallback(
		(draft) => {
			applyDraftToForm(draft, {
				setDraftApplicationNo,
				setSavedWizardStep,
				setTenancyStep,
				setInitiatorRole,
				setTenancyRegistrationDate,
				setTenancyOfficeId,
				setTenancyAreaType,
				setTenancyLocalBody,
				setTenancyDistrictId,
				setTenancyVillageWardId,
				setTenancyVillageName,
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
				setPropertyTenancyEndDate,
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
	
	const availableLocalBodies = useMemo(() => {
		if (!tenancyAreaType || !tenancyVillageWards.length) return [];
		const bodies = new Set();
		tenancyVillageWards.forEach(vw => {
			if (vw.area_type === tenancyAreaType && vw.local_body) {
				bodies.add(vw.local_body);
			}
		});
		return Array.from(bodies);
	}, [tenancyAreaType, tenancyVillageWards]);

	const availableWards = useMemo(() => {
		if (!tenancyAreaType || !tenancyLocalBody || !tenancyVillageWards.length) return [];
		return tenancyVillageWards.filter(vw => vw.area_type === tenancyAreaType && vw.local_body === tenancyLocalBody);
	}, [tenancyAreaType, tenancyLocalBody, tenancyVillageWards]);

	const availableVillages = useMemo(() => {
		if (!availableWards.length) return []
		// Rural: no ward step — flatten villages under the selected Gram Panchayat
		if (tenancyAreaType === 'Rural') {
			const names = new Set()
			availableWards.forEach((vw) => {
				;(vw.villages || []).forEach((v) => {
					if (v) names.add(String(v))
				})
			})
			return Array.from(names).sort((a, b) => a.localeCompare(b))
		}
		if (!tenancyVillageWardId) return []
		const ward = availableWards.find((w) => w.id == tenancyVillageWardId)
		return ward && ward.villages ? ward.villages : []
	}, [tenancyAreaType, tenancyVillageWardId, availableWards])

	const availableOffices = useMemo(() => {
		if (!tenancyDistrictId) return tenancyOffices;
		return tenancyOffices.filter(o => o.district_id == tenancyDistrictId);
	}, [tenancyOffices, tenancyDistrictId]);

	// Auto-select circle office if there's only one for the selected district
	useEffect(() => {
		if (tenancyDistrictId && availableOffices.length === 1) {
			if (tenancyOfficeId !== String(availableOffices[0].id)) {
				setTenancyOfficeId(String(availableOffices[0].id));
			}
		}
	}, [tenancyDistrictId, availableOffices, tenancyOfficeId]);




	const loadDraft = useCallback(async () => {
		try {
			const draftNo = searchParams.get('draft')
			if (draftNo) {
				const { data } = await api.get(`/api/tenancy-applications/${draftNo}`)
				const app = data.application || data
				if (app?.status === 'DRAFT') {
					populateFromDraft(app)
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
			setProfileDistrictId(p.district_id || '')
			setProfileOfficeId(p.office_id || '')

			const photoUrl = p.passport_photo_url
			const photoPath = p.passport_photo_path || p.user_passport_photo_path
			if (photoUrl) setProfilePhotoPreview(photoUrl)
			else if (photoPath) setProfilePhotoPreview(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${photoPath}`)
		} catch (err) { console.error('Failed to load profile for prefill') }
	}

	
	// Auto-fill district and office from profile once draft is loaded (if they are still empty)
	useEffect(() => {
		if (draftLoaded) {
			if (!tenancyDistrictId && profileDistrictId) {
				setTenancyDistrictId(String(profileDistrictId));
				loadTenancyVillageWards(String(profileDistrictId));
			}
			if (!tenancyOfficeId && profileOfficeId) {
				setTenancyOfficeId(String(profileOfficeId));
			}
		}
	}, [draftLoaded, profileDistrictId, profileOfficeId]); // Intentionally omitting tenancyDistrictId/tenancyOfficeId so it doesn't re-fill if user clears them

	const profileAddressLine = [profileAddress, profilePin].filter(Boolean).join(', ')

	const fillProfileIntoRole = useCallback((role) => {
		if (!role || !profileName) return

		if (role === 'LANDLORD') {
			setLandlordName(profileName)
			setLandlordAddress(profileAddressLine || profileAddress)
			setLandlordEmail(profileEmail)
			setLandlordPhone(profilePhone)
			setLandlordPan(profilePan)
			if (profilePhotoPreview) setLandlordPhotoPreview(profilePhotoPreview)
		} else if (role === 'TENANT') {
			setTenantName(profileName)
			setTenantAddress(profileAddressLine || profileAddress)
			setTenantEmail(profileEmail)
			setTenantPhone(profilePhone)
			setTenantPan(profilePan)
			if (profilePhotoPreview) setTenantPhotoPreview(profilePhotoPreview)
		}
	}, [profileName, profileAddress, profileAddressLine, profileEmail, profilePhone, profilePan, profilePhotoPreview])

	const clearPartyIfMatchesProfile = useCallback((role) => {
		if (!profileName) return
		const addr = profileAddressLine || profileAddress

		if (role === 'LANDLORD') {
			setLandlordName((v) => (v === profileName ? '' : v))
			setLandlordAddress((v) => (v === addr || v === profileAddress ? '' : v))
			setLandlordEmail((v) => (v === profileEmail ? '' : v))
			setLandlordPhone((v) => (v === profilePhone ? '' : v))
			setLandlordPan((v) => (v === profilePan ? '' : v))
			setLandlordPhotoPreview((v) => (v === profilePhotoPreview ? '' : v))
		} else if (role === 'TENANT') {
			setTenantName((v) => (v === profileName ? '' : v))
			setTenantAddress((v) => (v === addr || v === profileAddress ? '' : v))
			setTenantEmail((v) => (v === profileEmail ? '' : v))
			setTenantPhone((v) => (v === profilePhone ? '' : v))
			setTenantPan((v) => (v === profilePan ? '' : v))
			setTenantPhotoPreview((v) => (v === profilePhotoPreview ? '' : v))
		}
	}, [profileName, profileAddress, profileAddressLine, profileEmail, profilePhone, profilePan, profilePhotoPreview])

	const handleInitiatorRoleChange = (role) => {
		if (role === initiatorRole) return
		const previous = initiatorRole
		setInitiatorRole(role)
		fillProfileIntoRole(role)
		if (previous) clearPartyIfMatchesProfile(previous)
	}

	// Default role from profile type (new applications only)
	useEffect(() => {
		if (!draftLoaded || initiatorRole || !profileType) return
		if (profileType === 'landlord') setInitiatorRole('LANDLORD')
		else if (profileType === 'tenant') setInitiatorRole('TENANT')
	}, [draftLoaded, initiatorRole, profileType])

	// Fill initiator section once profile is ready (and fields are still empty)
	useEffect(() => {
		if (!draftLoaded || !initiatorRole || !profileName) return

		if (initiatorRole === 'LANDLORD') {
			setLandlordName((v) => v || profileName)
			setLandlordAddress((v) => v || profileAddressLine || profileAddress)
			setLandlordEmail((v) => v || profileEmail)
			setLandlordPhone((v) => v || profilePhone)
			setLandlordPan((v) => v || profilePan)
			if (profilePhotoPreview) setLandlordPhotoPreview((v) => v || profilePhotoPreview)
		} else if (initiatorRole === 'TENANT') {
			setTenantName((v) => v || profileName)
			setTenantAddress((v) => v || profileAddressLine || profileAddress)
			setTenantEmail((v) => v || profileEmail)
			setTenantPhone((v) => v || profilePhone)
			setTenantPan((v) => v || profilePan)
			if (profilePhotoPreview) setTenantPhotoPreview((v) => v || profilePhotoPreview)
		}
	}, [draftLoaded, initiatorRole, profileName, profileAddress, profileAddressLine, profileEmail, profilePhone, profilePan, profilePhotoPreview])

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
			const { data } = await api.get('/api/public/village-wards', { params: { district_id: districtId, t: new Date().getTime() } })
			setTenancyVillageWards(Array.isArray(data) ? data : data.data || [])
		} catch (err) { setError('Failed to load village/wards') }
		finally { setTenancyVillageWardsLoading(false) }
	}

	useEffect(() => {
		const init = async () => {
			await Promise.all([
				loadProfile(),
				loadTenancyDistricts(),
				loadTenancyOffices(),
				loadDraft(),
			])
			setPageReady(true)
		}
		init()
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const resetTenancyForm = () => {
		setTenancyStep(1); setDraftApplicationNo(null); setSavedWizardStep(0); setTenancyRegistrationDate(''); setTenancyOfficeId('');
		setAgreementFile(null); setAgreementPreviewUrl(''); setLandlordPhotoFile(null); setLandlordPhotoPreview(profileType === 'landlord' ? profilePhotoPreview : '');
		setLandlordSignatureFile(null); setLandlordSignaturePreview(''); setTenantPhotoFile(null); setTenantPhotoPreview(profileType === 'tenant' ? profilePhotoPreview : '');
		setTenantSignatureFile(null); setTenantSignaturePreview(''); setManagerName(''); setManagerAddress(''); setManagerEmail(''); setManagerPhone(''); setManagerPan('');
		setTenantPreviousTenancy(''); setPropertyPossessionDate(''); setPropertyRentPayable(''); setPropertyPremisesDescription(''); setPropertyFurnitureDescription('');
		setPropertyChargeElectricity(''); setPropertyChargeWater(''); setPropertyChargeFurnishing(''); setPropertyChargeOtherServices(''); setPropertyTenancyDuration('');
		setPropertyTenancyEndDate(''); setSuccess(''); setError(''); setTenancyVillageWardId(''); setTenancyVillageWards([]); setTenancyVillageName(''); setTenancyDistrictId(''); setTenancyAreaType(''); setTenancyLocalBody('');
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

	const MOBILE_RE = /^\d{10}$/
	const PAN_RE = /^[A-Z]{5}\d{4}[A-Z]$/
	const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

	const fieldErrors = useMemo(() => {
		const errors = {}
		const phoneMsg = (v) => {
			if (!v) return ''
			return MOBILE_RE.test(v.replace(/\D/g, '')) ? '' : 'Must be exactly 10 digits'
		}
		const panMsg = (v) => {
			if (!v) return ''
			return PAN_RE.test(v.trim().toUpperCase()) ? '' : 'Enter a valid PAN (e.g. ABCDE1234F)'
		}
		const emailMsg = (v) => {
			if (!v) return ''
			return EMAIL_RE.test(v.trim()) ? '' : 'Enter a valid email address'
		}

		errors.landlordPhone = phoneMsg(landlordPhone)
		errors.tenantPhone = phoneMsg(tenantPhone)
		errors.managerPhone = phoneMsg(managerPhone)
		errors.landlordPan = panMsg(landlordPan)
		errors.tenantPan = panMsg(tenantPan)
		errors.managerPan = panMsg(managerPan)
		errors.landlordEmail = emailMsg(landlordEmail)
		errors.tenantEmail = emailMsg(tenantEmail)
		errors.managerEmail = emailMsg(managerEmail)

		const lPhone = (landlordPhone || '').replace(/\D/g, '')
		const tPhone = (tenantPhone || '').replace(/\D/g, '')
		const lPan = (landlordPan || '').trim().toUpperCase()
		const tPan = (tenantPan || '').trim().toUpperCase()
		const lEmail = (landlordEmail || '').trim().toLowerCase()
		const tEmail = (tenantEmail || '').trim().toLowerCase()

		if (lPhone && tPhone && lPhone === tPhone) {
			errors.landlordPhone = 'Cannot be the same as tenant mobile'
			errors.tenantPhone = 'Cannot be the same as landlord mobile'
		}
		if (lPan && tPan && lPan === tPan) {
			errors.landlordPan = 'Cannot be the same as tenant PAN'
			errors.tenantPan = 'Cannot be the same as landlord PAN'
		}
		if (lEmail && tEmail && lEmail === tEmail) {
			errors.landlordEmail = 'Cannot be the same as tenant email'
			errors.tenantEmail = 'Cannot be the same as landlord email'
		}

		return errors
	}, [
		landlordPhone, tenantPhone, managerPhone,
		landlordPan, tenantPan, managerPan,
		landlordEmail, tenantEmail, managerEmail,
	])

	const hasStep2FieldErrors = Boolean(
		fieldErrors.landlordPhone || fieldErrors.tenantPhone ||
		fieldErrors.landlordPan || fieldErrors.tenantPan ||
		fieldErrors.landlordEmail || fieldErrors.tenantEmail ||
		(managerMode === 'enter' && (
			fieldErrors.managerPhone || fieldErrors.managerPan || fieldErrors.managerEmail
		))
	)

	const parseCharge = (value) => {
		if (value === '' || value == null) return 0
		const n = Number(value)
		return Number.isFinite(n) && n > 0 ? n : 0
	}

	const totalMonthlyRent = useMemo(() => {
		const rent = parseCharge(propertyRentPayable)
		return (
			rent +
			parseCharge(propertyChargeElectricity) +
			parseCharge(propertyChargeWater) +
			parseCharge(propertyChargeFurnishing) +
			parseCharge(propertyChargeOtherServices)
		)
	}, [
		propertyRentPayable,
		propertyChargeElectricity,
		propertyChargeWater,
		propertyChargeFurnishing,
		propertyChargeOtherServices,
	])

	useEffect(() => {
		if (managerMode !== 'same') return
		setManagerName(landlordName)
		setManagerAddress(landlordAddress)
		setManagerEmail(landlordEmail)
		setManagerPhone(landlordPhone)
		setManagerPan(landlordPan)
	}, [managerMode, landlordName, landlordAddress, landlordEmail, landlordPhone, landlordPan])

	const handleManagerModeChange = (mode) => {
		setManagerMode(mode)
		if (mode === 'enter') {
			setManagerName('')
			setManagerAddress('')
			setManagerEmail('')
			setManagerPhone('')
			setManagerPan('')
		}
	}

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
			showSaveToast('Payment completed.')
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

	const eligibilityMet = tenancyRegistrationDate && !registrationTooOld

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
		tenancyVillageWardId: tenancyAreaType === 'Rural' ? '' : tenancyVillageWardId,
		tenancyAreaType,
		tenancyLocalBody,
		tenancyVillageName,
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
		propertyTenancyEndDate,
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

	const showSaveToast = useCallback((message = 'Progress saved.') => {
		if (saveToastTimerRef.current) clearTimeout(saveToastTimerRef.current)
		setSaveToast(message)
		saveToastTimerRef.current = setTimeout(() => {
			setSaveToast('')
			saveToastTimerRef.current = null
		}, 2800)
	}, [])

	useEffect(() => () => {
		if (saveToastTimerRef.current) clearTimeout(saveToastTimerRef.current)
	}, [])

	const saveDraftStep = async (step) => {
		setError('')
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
			if (window.toastTimer) clearTimeout(window.toastTimer)
			window.toastTimer = setTimeout(() => setSuccess(''), 3500)
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
		setError(''); setTenancySubmitting(true)
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
			const refCode = data.ref_code
			setSubmittedApp({
				application_no: data.application_no,
				ref_code: refCode,
				join_link: refCode
					? `${window.location.origin}/join?ref=${encodeURIComponent(refCode)}`
					: data.join_link,
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
		{ id: 1, label: 'Registration & Office' },
		{ id: 2, label: 'Tenancy Details' },
		{ id: 3, label: 'Uploads' },
		{ id: 4, label: 'Preview' },
		{ id: 5, label: 'Submit' },
	]

	const TOTAL_STEPS = tenancySteps.length

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
		// Ensure village/ward list is available when returning to registration
		if (stepId === 1 && tenancyDistrictId) {
			loadTenancyVillageWards(tenancyDistrictId)
		}
	}

	const handleContinue = async (e) => {
		e.preventDefault()
		if (tenancyStep === 1 && registrationTooOld) return
		if (tenancyStep === 2) {
			if (hasStep2FieldErrors) return
			if (initiatorRole === 'LANDLORD' && !landlordEmail.trim()) return
			if (initiatorRole === 'TENANT' && !tenantEmail.trim()) return
			if (!landlordPhone || !tenantPhone || !landlordPan || !tenantPan) return
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

		let pendingPartyRole = 'the other party'
		let pendingPartyName = ''
		let pendingPartyPhone = ''

		if (initiatorRole === 'LANDLORD') {
			pendingPartyRole = 'Tenant'
			pendingPartyName = tenantName
			pendingPartyPhone = tenantPhone
		} else if (initiatorRole === 'TENANT') {
			pendingPartyRole = 'Landlord'
			pendingPartyName = landlordName
			pendingPartyPhone = landlordPhone
		}

		const pendingPartyText = pendingPartyName 
			? `${pendingPartyRole} (${pendingPartyName}${pendingPartyPhone ? ` - ${pendingPartyPhone}` : ''})` 
			: pendingPartyRole;
		return (
			<div className="ws-page ws-uin-apply tenancy-certificate-page">
				<div className="uin-confirm">
					<div className="uin-confirm-card">
						<div className="uin-confirm-icon" aria-hidden>✓</div>
						<h1 className="uin-confirm-title">Application submitted successfully</h1>
						<p className="uin-confirm-lead">
							{isJoint
								? `Application submitted. ${pendingPartyText} must complete their details using the join link.`
								: (submittedApp.message || 'Your tenancy certificate application has been lodged.')}
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
									This is a joint application. It is awaiting {pendingPartyText}'s
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
			{saveToast ? (
				<div className="ws-uin-save-toast" role="status" aria-live="polite">
					{saveToast}
				</div>
			) : null}
			{!pageReady ? (
				<div className="ws-uin-apply-loading" role="status" aria-live="polite">
					Loading application…
				</div>
			) : (
				<>
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

			<nav className="ws-uin-h-stepper" aria-label="Application stages">
				<div className="ws-uin-h-stepper__track" aria-hidden />
				<ol className="ws-uin-h-stepper__list">
					{tenancySteps.map((step) => {
						const done = tenancyStep > step.id || savedWizardStep >= step.id
						const active = tenancyStep === step.id
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
					{error ? <div className="ws-alert ws-alert--error" style={{ borderRadius: '8px' }}>{error}</div> : null}

					{conflictData && (
						<div className="conflict-notice-box">
							<p>An application with these details already exists (Application No: <strong>{conflictData.existing_application?.application_no}</strong>).</p>
							<div className="conflict-actions">
								<button type="button" className="secondary" onClick={() => navigate(`/dashboard/status?app_no=${conflictData.existing_application?.application_no}`)}>View Existing Application</button>
								<button type="button" className="danger" onClick={() => submitTenancyApplication(true)}>Start Fresh Application Anyway</button>
							</div>
						</div>
					)}

					{success ? (
						<div style={{
							position: 'fixed',
							top: '30px',
							right: '30px',
							background: '#1f2937',
							color: '#ffffff',
							padding: '12px 24px',
							borderRadius: '8px',
							boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
							zIndex: 9999,
							display: 'flex',
							alignItems: 'center',
							gap: '12px',
							fontSize: '15px',
							fontWeight: '500'
						}}>
							<span style={{ background: '#10b981', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>✓</span>
							{success}
						</div>
					) : null}

					{!draftLoaded ? (
						<div className="ws-uin-apply-loading">Loading your application…</div>
					) : null}

					{draftLoaded ? (
			<form
				className={`tenancy-form ws-uin-apply-form${tenancyStep === 4 ? ' ws-uin-apply-form--preview-step' : ''}`}
				onSubmit={handleContinue}
			>
				<header className="ws-uin-apply-form-head">
					<h1 className="ws-uin-apply-title">Apply for Tenancy Certificate (UIN)</h1>
					<p className="ws-uin-apply-lead">
						Complete each stage in order. Your progress is saved when you continue — you can return to earlier stages to make changes.
					</p>
					<p className="ws-uin-apply-type-note">
						<strong>Joint</strong> (agreement within 2 months): both parties complete the form.
						<strong> Individual</strong> (2–3 months): you apply alone.
						Agreements older than 3 months are not eligible.
					</p>
				</header>

				{tenancyStep === 1 && (
					<fieldset className="tenancy-fieldset">
						<div className="form-grid">
							<div className="ws-uin-role-toggle-field">
								<span className="label-text required">Initiating as</span>
								<div className="ws-uin-role-toggle" role="radiogroup" aria-label="Initiating as">
									<label className={`ws-uin-role-toggle__btn${initiatorRole === 'LANDLORD' ? ' is-active' : ''}`}>
										<input
											type="radio"
											name="initiatorRole"
											value="LANDLORD"
											checked={initiatorRole === 'LANDLORD'}
											onChange={() => handleInitiatorRoleChange('LANDLORD')}
											required
										/>
										Landlord
									</label>
									<label className={`ws-uin-role-toggle__btn${initiatorRole === 'TENANT' ? ' is-active' : ''}`}>
										<input
											type="radio"
											name="initiatorRole"
											value="TENANT"
											checked={initiatorRole === 'TENANT'}
											onChange={() => handleInitiatorRoleChange('TENANT')}
											required
										/>
										Tenant
									</label>
								</div>
								<span className="ws-uin-field-hint">Your profile details will auto-fill the matching section in Tenancy Details.</span>
							</div>

							<div className="ws-uin-date-eligibility">
								<label>
									<span className="label-text required">Date of Agreement</span>
									<input type="date" value={tenancyRegistrationDate} onChange={e => setTenancyRegistrationDate(e.target.value)} onClick={(e) => e.target.showPicker && e.target.showPicker()} required max={new Date().toISOString().split('T')[0]} />
									<span className="ws-uin-field-hint">Must be within the last 3 months.</span>
								</label>

								<label>
									<span className="label-text">Eligibility</span>
									<input
										type="text"
										className={`ws-uin-eligibility-field${tenancyRegistrationDate ? (eligibilityMet ? ' is-eligible' : ' is-ineligible') : ''}`}
										value={
											!tenancyRegistrationDate
												? ''
												: eligibilityMet
													? `${applyType || '—'} — Eligible to apply`
													: registrationTooOld
														? 'Not eligible (Agreement > 3 months old)'
														: '—'
										}
										placeholder="Select agreement date"
										readOnly
										aria-live="polite"
									/>
									<span className="ws-uin-field-hint">
										{!tenancyRegistrationDate
											? 'Shown after you choose the agreement date.'
											: eligibilityMet
												? 'Joint ≤ 2 months · Individual 2–3 months.'
												: 'Agreements older than 3 months cannot be registered.'}
									</span>
								</label>
							</div>
							<label>
								<span className="label-text required">District</span>
								<select value={tenancyDistrictId} onChange={e => { setTenancyDistrictId(e.target.value); setTenancyVillageWardId(''); setTenancyVillageWards([]); setTenancyVillageName(''); loadTenancyVillageWards(e.target.value); }} required>
									<option value="">Select District</option>
									{tenancyDistricts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
								</select>
							</label>

							<div className="radio-group-container">
								<span className="label-text required">Area Type</span>
								<div className="radio-group" style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
									<label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
										<input type="radio" name="areaType" value="Urban" checked={tenancyAreaType === 'Urban'} onChange={e => { setTenancyAreaType(e.target.value); setTenancyLocalBody(''); setTenancyVillageWardId(''); setTenancyVillageName(''); }} required disabled={!tenancyDistrictId} />
										Urban
									</label>
									<label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
										<input type="radio" name="areaType" value="Rural" checked={tenancyAreaType === 'Rural'} onChange={e => { setTenancyAreaType(e.target.value); setTenancyLocalBody(''); setTenancyVillageWardId(''); setTenancyVillageName(''); }} required disabled={!tenancyDistrictId} />
										Rural
									</label>
								</div>
							</div>

							<label>
								<span className="label-text required">{tenancyAreaType === 'Urban' ? 'Town/Municipal Area' : tenancyAreaType === 'Rural' ? 'Gram Panchayat' : 'Local Body'}</span>
								<select value={tenancyLocalBody} onChange={e => { setTenancyLocalBody(e.target.value); setTenancyVillageWardId(''); setTenancyVillageName(''); }} required disabled={!tenancyAreaType}>
									<option value="">Select {tenancyAreaType === 'Urban' ? 'Town' : tenancyAreaType === 'Rural' ? 'Gram Panchayat' : 'Local Body'}</option>
									{availableLocalBodies.map(b => <option key={b} value={b}>{b}</option>)}
								</select>
							</label>

							{tenancyAreaType === 'Urban' && (
								<label>
									<span className="label-text required">Ward</span>
									<select value={tenancyVillageWardId} onChange={e => { setTenancyVillageWardId(e.target.value); setTenancyVillageName(''); }} required disabled={!tenancyLocalBody}>
										<option value="">Select Ward</option>
										{availableWards.map(vw => <option key={vw.id} value={vw.id}>{vw.name}</option>)}
									</select>
								</label>
							)}

							{tenancyAreaType === 'Rural' && (
								<label>
									<span className="label-text required">Village</span>
									<select value={tenancyVillageName} onChange={e => setTenancyVillageName(e.target.value)} required disabled={!tenancyLocalBody}>
										<option value="">Select Village</option>
										{availableVillages.map(v => <option key={v} value={v}>{v}</option>)}
									</select>
								</label>
							)}

							<label>
								<span className="label-text required">Circle Office:</span>
								<select value={tenancyOfficeId} onChange={e => setTenancyOfficeId(e.target.value)} required>
									<option value="">Select Office</option>
									{availableOffices.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
								</select>
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

							<div className={`ws-uin-party-block${initiatorRole === 'LANDLORD' ? ' is-autofilled' : ''}`}>
								<header className="ws-uin-party-block__head">
									<span className="ws-uin-party-block__num">1</span>
									<div>
										<h3 className="ws-uin-party-block__title">
											Landlord details
											{initiatorRole === 'LANDLORD' && <span className="ws-uin-party-block__badge">From your profile</span>}
										</h3>
										<p className="ws-uin-party-block__lead">Enter the landlord’s name, address, PAN and contact information.</p>
									</div>
								</header>
								<div className="ws-uin-party-fields">
									<label>
										<span className="label-text required">Name of the landlord</span>
										<input type="text" placeholder="Landlord Name" value={landlordName} onChange={e => setLandlordName(e.target.value)} required />
									</label>
									<label>
										<span className="label-text required">PAN of landlord</span>
										<input
											type="text"
											value={landlordPan}
											onChange={e => {
												const next = e.target.value.toUpperCase()
												if (/^[A-Z0-9]*$/.test(next)) setLandlordPan(next.slice(0, 10))
											}}
											maxLength={10}
											required
											aria-invalid={Boolean(fieldErrors.landlordPan)}
										/>
										{fieldErrors.landlordPan ? <span className="ws-uin-field-error">{fieldErrors.landlordPan}</span> : null}
									</label>
									<label>
										<span className="label-text required">Mobile Number</span>
										<input
											type="tel"
											inputMode="numeric"
											placeholder="10-digit mobile"
											value={landlordPhone}
											onChange={e => {
												const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
												setLandlordPhone(digits)
											}}
											maxLength={10}
											required
											aria-invalid={Boolean(fieldErrors.landlordPhone)}
										/>
										{fieldErrors.landlordPhone ? <span className="ws-uin-field-error">{fieldErrors.landlordPhone}</span> : null}
									</label>
									<label>
										<span className="label-text required">E-mail id</span>
										<input
											type="email"
											placeholder="name@example.com"
											value={landlordEmail}
											onChange={e => setLandlordEmail(e.target.value)}
											required={initiatorRole === 'LANDLORD'}
											aria-invalid={Boolean(fieldErrors.landlordEmail)}
										/>
										{fieldErrors.landlordEmail ? <span className="ws-uin-field-error">{fieldErrors.landlordEmail}</span> : null}
									</label>
									<label className="ws-uin-party-fields__full">
										<span className="label-text required">Address of the landlord</span>
										<textarea placeholder="Address" value={landlordAddress} onChange={e => setLandlordAddress(e.target.value)} required rows={3} />
									</label>
								</div>
							</div>

							<div className={`ws-uin-party-block${initiatorRole === 'TENANT' ? ' is-autofilled' : ''}`}>
								<header className="ws-uin-party-block__head">
									<span className="ws-uin-party-block__num">2</span>
									<div>
										<h3 className="ws-uin-party-block__title">
											Tenant details
											{initiatorRole === 'TENANT' && <span className="ws-uin-party-block__badge">From your profile</span>}
										</h3>
										<p className="ws-uin-party-block__lead">Enter the tenant’s name, address, PAN, contact details and previous tenancy if any.</p>
									</div>
								</header>
								<div className="ws-uin-party-fields">
									<label>
										<span className="label-text required">Name of the tenant</span>
										<input type="text" placeholder="Tenant Name" value={tenantName} onChange={e => setTenantName(e.target.value)} required />
									</label>
									<label>
										<span className="label-text required">PAN of tenant</span>
										<input
											type="text"
											value={tenantPan}
											onChange={e => {
												const next = e.target.value.toUpperCase()
												if (/^[A-Z0-9]*$/.test(next)) setTenantPan(next.slice(0, 10))
											}}
											maxLength={10}
											required
											aria-invalid={Boolean(fieldErrors.tenantPan)}
										/>
										{fieldErrors.tenantPan ? <span className="ws-uin-field-error">{fieldErrors.tenantPan}</span> : null}
									</label>
									<label>
										<span className="label-text required">Mobile Number</span>
										<input
											type="tel"
											inputMode="numeric"
											placeholder="10-digit mobile"
											value={tenantPhone}
											onChange={e => {
												const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
												setTenantPhone(digits)
											}}
											maxLength={10}
											required
											aria-invalid={Boolean(fieldErrors.tenantPhone)}
										/>
										{fieldErrors.tenantPhone ? <span className="ws-uin-field-error">{fieldErrors.tenantPhone}</span> : null}
									</label>
									<label>
										<span className="label-text required">E-mail id</span>
										<input
											type="email"
											placeholder="name@example.com"
											value={tenantEmail}
											onChange={e => setTenantEmail(e.target.value)}
											required={initiatorRole === 'TENANT'}
											aria-invalid={Boolean(fieldErrors.tenantEmail)}
										/>
										{fieldErrors.tenantEmail ? <span className="ws-uin-field-error">{fieldErrors.tenantEmail}</span> : null}
									</label>
									<label className="ws-uin-party-fields__full">
										<span className="label-text required">Address of the tenant</span>
										<textarea placeholder="Address" value={tenantAddress} onChange={e => setTenantAddress(e.target.value)} required rows={3} />
									</label>
									<label className="ws-uin-party-fields__full">
										<span className="label-text">Description of previous tenancy, if any</span>
										<textarea value={tenantPreviousTenancy} onChange={e => setTenantPreviousTenancy(e.target.value)} rows={3} />
									</label>
								</div>
							</div>

							<div className="ws-uin-party-block">
								<header className="ws-uin-party-block__head">
									<span className="ws-uin-party-block__num">3</span>
									<div>
										<h3 className="ws-uin-party-block__title">Property manager details</h3>
										<p className="ws-uin-party-block__lead">Optional — tick if the landlord is also the property manager, otherwise enter details below.</p>
									</div>
								</header>
								<label className="ws-uin-manager-check">
									<input
										type="checkbox"
										checked={managerMode === 'same'}
										onChange={(e) => handleManagerModeChange(e.target.checked ? 'same' : 'enter')}
									/>
									<span>Same as landlord</span>
								</label>
								{managerMode === 'enter' ? (
									<div className="ws-uin-party-fields">
										<label>
											<span className="label-text">Name of the Property Manager</span>
											<input type="text" placeholder="Property Manager Name" value={managerName} onChange={e => setManagerName(e.target.value)} />
										</label>
										<label>
											<span className="label-text">PAN of Property Manager</span>
											<input
												type="text"
												value={managerPan}
												onChange={e => {
													const next = e.target.value.toUpperCase()
													if (/^[A-Z0-9]*$/.test(next)) setManagerPan(next.slice(0, 10))
												}}
												maxLength={10}
												aria-invalid={Boolean(fieldErrors.managerPan)}
											/>
											{fieldErrors.managerPan ? <span className="ws-uin-field-error">{fieldErrors.managerPan}</span> : null}
										</label>
										<label>
											<span className="label-text">Mobile Number</span>
											<input
												type="tel"
												inputMode="numeric"
												placeholder="10-digit mobile"
												value={managerPhone}
												onChange={e => {
													const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
													setManagerPhone(digits)
												}}
												maxLength={10}
												aria-invalid={Boolean(fieldErrors.managerPhone)}
											/>
											{fieldErrors.managerPhone ? <span className="ws-uin-field-error">{fieldErrors.managerPhone}</span> : null}
										</label>
										<label>
											<span className="label-text">E-mail id</span>
											<input
												type="email"
												placeholder="name@example.com"
												value={managerEmail}
												onChange={e => setManagerEmail(e.target.value)}
												aria-invalid={Boolean(fieldErrors.managerEmail)}
											/>
											{fieldErrors.managerEmail ? <span className="ws-uin-field-error">{fieldErrors.managerEmail}</span> : null}
										</label>
										<label className="ws-uin-party-fields__full">
											<span className="label-text">Address of the Property Manager</span>
											<textarea placeholder="Address" value={managerAddress} onChange={e => setManagerAddress(e.target.value)} rows={3} />
										</label>
									</div>
								) : (
									<p className="ws-uin-manager-same-note">
										Using landlord details for the property manager. No extra entry needed.
									</p>
								)}
							</div>

							<div className="ws-uin-party-block">
								<header className="ws-uin-party-block__head">
									<span className="ws-uin-party-block__num">4</span>
									<div>
										<h3 className="ws-uin-party-block__title">Premises &amp; rent details</h3>
										<p className="ws-uin-party-block__lead">Describe the property, possession date, rent, charges and tenancy duration.</p>
									</div>
								</header>
								<div className="form-group-row">
									<label><span className="label-text">Description of premises let to the tenant Including appurtenant land, if any</span>
										<textarea value={propertyPremisesDescription} onChange={e => setPropertyPremisesDescription(e.target.value)} />
									</label>
								</div>

								<div className="form-group-row">
									<label><span className="label-text required">Tenancy period</span></label>
									<div className="form-grid ws-uin-date-grid">
										<label>
											<span className="label-text required">Possession date</span>
											<input type="date" value={propertyPossessionDate} onChange={e => setPropertyPossessionDate(e.target.value)} onClick={(e) => e.target.showPicker && e.target.showPicker()} required />
										</label>
										<label>
											<span className="label-text required">End date</span>
											<input type="date" value={propertyTenancyEndDate} onChange={e => setPropertyTenancyEndDate(e.target.value)} onClick={(e) => e.target.showPicker && e.target.showPicker()} required min={propertyPossessionDate} />
										</label>
										<label>
											<span className="label-text">Duration</span>
											<input type="text" value={propertyTenancyDuration} readOnly disabled className="readonly-input" />
										</label>
									</div>
								</div>

								<div className="form-group-row">
									<label><span className="label-text required">Rent payable as in section 8 (Monthly Rent ₹)</span>
										<input type="number" value={propertyRentPayable} onChange={e => setPropertyRentPayable(e.target.value)} onWheel={e => e.target.blur()} min="0" required />
									</label>
								</div>

								<div className="form-group-row">
									<label><span className="label-text">Furniture and other equipment provided to the tenant</span>
										<textarea value={propertyFurnitureDescription} onChange={e => setPropertyFurnitureDescription(e.target.value)} />
									</label>
								</div>

								<div className="form-group-row">
									<label><span className="label-text">Other charges payable</span></label>
									<div className="ws-uin-charges-grid">
										<label>
											<span className="label-text">(a) Electricity</span>
											<input type="number" value={propertyChargeElectricity} onChange={e => setPropertyChargeElectricity(e.target.value)} onWheel={e => e.target.blur()} min="0" placeholder="0" />
										</label>
										<label>
											<span className="label-text">(b) Water</span>
											<input type="number" value={propertyChargeWater} onChange={e => setPropertyChargeWater(e.target.value)} onWheel={e => e.target.blur()} min="0" placeholder="0" />
										</label>
										<label>
											<span className="label-text">(c) Extra furnishing, fittings and fixtures</span>
											<input type="number" value={propertyChargeFurnishing} onChange={e => setPropertyChargeFurnishing(e.target.value)} onWheel={e => e.target.blur()} min="0" placeholder="0" />
										</label>
										<label>
											<span className="label-text">(d) Other services</span>
											<input type="number" value={propertyChargeOtherServices} onChange={e => setPropertyChargeOtherServices(e.target.value)} onWheel={e => e.target.blur()} min="0" placeholder="0" />
										</label>
									</div>
									<div className="ws-uin-rent-total">
										<span>Total monthly amount</span>
										<strong>₹{totalMonthlyRent.toLocaleString('en-IN')}</strong>
									</div>
									<p className="ws-uin-rent-total-hint">Empty charge fields are not counted. Total = rent + entered charges.</p>
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
									<div className={`tenancy-doc-slot tenancy-doc-slot--wide${agreementFile ? ' is-uploaded' : ''}`}>
										<div className="tenancy-doc-slot__head">
											<span className="tenancy-doc-slot__title is-required">Registered tenancy agreement (PDF)</span>
										</div>
										<div className="tenancy-doc-slot__row">
											<input
												id="uin-agreement-file"
												className="tenancy-doc-slot__input"
												type="file"
												accept=".pdf"
												required={!agreementFile}
												onChange={e => {
													const f = e.target.files[0]
													setAgreementFile(f)
													if (f) setAgreementPreviewUrl(URL.createObjectURL(f))
													else setAgreementPreviewUrl('')
												}}
											/>
											<label htmlFor="uin-agreement-file" className="tenancy-doc-slot__pick-btn">
												{agreementFile ? 'Change file' : 'Choose file'}
											</label>
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
												<span className="tenancy-doc-slot__pending">No file chosen</span>
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
									<div style={{ flex: '2' }}>: {[cleanOptionalValue(managerName), cleanOptionalValue(managerAddress)].filter(Boolean).join(', ')}</div>
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
									<div style={{ flex: '2' }}>: {formatDate(propertyPossessionDate)}</div>
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
									<div style={{ flex: '2' }}>: {propertyTenancyDuration} (Till {formatDate(propertyTenancyEndDate)})</div>
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
									<div style={{ flex: '2' }}>: {cleanOptionalValue(managerPan)}</div>
								</div>
								<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
									<div style={{ width: '40px' }}>19.</div>
									<div style={{ flex: '1.5' }}>Aadhaar number of Property Manager<br />(if any)</div>
									<div style={{ flex: '2' }}>: {managerAadhar}</div>
								</div>
								<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
									<div style={{ width: '40px' }}>20.</div>
									<div style={{ flex: '1.5' }}>Mobile Number and E-mail id of<br />Property Manager (if any)</div>
									<div style={{ flex: '2' }}>: {[cleanOptionalValue(managerPhone), cleanOptionalValue(managerEmail)].filter(Boolean).join(', ')}</div>
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
						<div className={`ws-uin-pay${paymentComplete ? ' is-paid' : ''}`}>
							<section className="ws-uin-pay-bill">
								<h2 className="ws-uin-pay-title">Bill summary</h2>
								<div className="ws-uin-pay-bill-rows">
									<div className="ws-uin-pay-row">
										<span>Service</span>
										<strong>Tenancy Certificate (UIN)</strong>
									</div>
									<div className="ws-uin-pay-row">
										<span>Application type</span>
										<strong>{applyType || '—'}</strong>
									</div>
									{draftApplicationNo ? (
										<div className="ws-uin-pay-row">
											<span>Draft reference</span>
											<strong>{draftApplicationNo}</strong>
										</div>
									) : null}
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
									<p className="ws-uin-pay-hint">Complete payment on the right to continue.</p>
								)}
							</section>

							<section className="ws-uin-pay-method">
								<h2 className="ws-uin-pay-title">Pay now</h2>
								{!paymentComplete ? (
									<>
										<div className="ws-uin-pay-qr-wrap">
											<div className="ws-uin-pay-qr" aria-hidden>
												<svg viewBox="0 0 120 120" width="132" height="132" role="img">
													<title>Demo QR code</title>
													<rect width="120" height="120" fill="#fff" />
													<rect x="8" y="8" width="28" height="28" fill="#0f172a" />
													<rect x="14" y="14" width="16" height="16" fill="#fff" />
													<rect x="18" y="18" width="8" height="8" fill="#0f172a" />
													<rect x="84" y="8" width="28" height="28" fill="#0f172a" />
													<rect x="90" y="14" width="16" height="16" fill="#fff" />
													<rect x="94" y="18" width="8" height="8" fill="#0f172a" />
													<rect x="8" y="84" width="28" height="28" fill="#0f172a" />
													<rect x="14" y="90" width="16" height="16" fill="#fff" />
													<rect x="18" y="94" width="8" height="8" fill="#0f172a" />
													<rect x="44" y="12" width="8" height="8" fill="#0f172a" />
													<rect x="56" y="12" width="8" height="8" fill="#0f172a" />
													<rect x="68" y="20" width="8" height="8" fill="#0f172a" />
													<rect x="44" y="32" width="8" height="8" fill="#0f172a" />
													<rect x="60" y="32" width="8" height="8" fill="#0f172a" />
													<rect x="44" y="48" width="8" height="8" fill="#0f172a" />
													<rect x="56" y="48" width="8" height="8" fill="#0f172a" />
													<rect x="68" y="48" width="8" height="8" fill="#0f172a" />
													<rect x="80" y="48" width="8" height="8" fill="#0f172a" />
													<rect x="92" y="48" width="8" height="8" fill="#0f172a" />
													<rect x="104" y="48" width="8" height="8" fill="#0f172a" />
													<rect x="44" y="60" width="8" height="8" fill="#0f172a" />
													<rect x="68" y="60" width="8" height="8" fill="#0f172a" />
													<rect x="92" y="60" width="8" height="8" fill="#0f172a" />
													<rect x="44" y="72" width="8" height="8" fill="#0f172a" />
													<rect x="56" y="72" width="8" height="8" fill="#0f172a" />
													<rect x="80" y="72" width="8" height="8" fill="#0f172a" />
													<rect x="104" y="72" width="8" height="8" fill="#0f172a" />
													<rect x="56" y="84" width="8" height="8" fill="#0f172a" />
													<rect x="68" y="84" width="8" height="8" fill="#0f172a" />
													<rect x="92" y="84" width="8" height="8" fill="#0f172a" />
													<rect x="56" y="96" width="8" height="8" fill="#0f172a" />
													<rect x="80" y="96" width="8" height="8" fill="#0f172a" />
													<rect x="104" y="96" width="8" height="8" fill="#0f172a" />
													<rect x="68" y="108" width="8" height="8" fill="#0f172a" />
													<rect x="92" y="108" width="8" height="8" fill="#0f172a" />
												</svg>
											</div>
											<p className="ws-uin-pay-qr-caption">Scan UPI QR to pay ₹{feeAmount}</p>
										</div>

										<div className="ws-uin-pay-or">or</div>

										<div className="ws-uin-pay-bank">
											<div className="ws-uin-pay-bank-row">
												<span>Account name</span>
												<strong>Govt. of Assam — eGRAS</strong>
											</div>
											<div className="ws-uin-pay-bank-row">
												<span>Account no.</span>
												<strong>5010023487612</strong>
											</div>
											<div className="ws-uin-pay-bank-row">
												<span>IFSC</span>
												<strong>SBIN0001234</strong>
											</div>
											<div className="ws-uin-pay-bank-row">
												<span>UPI ID</span>
												<strong>uinfee@assam</strong>
											</div>
										</div>

										<button
											type="button"
											className="ws-btn ws-btn--primary ws-uin-pay-btn"
											onClick={handleMockPayment}
											disabled={paymentSimulating || draftSaving}
										>
											{paymentSimulating ? 'Confirming…' : `I have paid ₹${feeAmount}`}
										</button>
										<p className="ws-uin-pay-note">Demo only — no real bank transfer.</p>
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
				</>
			)}
		</div>
	)
}

export default TenancyCertificate
