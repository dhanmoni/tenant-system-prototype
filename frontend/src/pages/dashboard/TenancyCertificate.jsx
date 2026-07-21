import { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import { Link, useLocation, useOutletContext, useNavigate, useSearchParams } from 'react-router-dom'
import api, { csrf } from '../../api'
import { buildTenancyFormData, applyDraftToForm, applyInitiatorProfileAutofill, cleanOptionalValue } from '../../utils/tenancyDraft'
import { formatDate, formatDateTime } from '../../utils/formatters'
import { Icon } from '../../components/dashboard/Icons'
import DocumentUploadSlot from '../../components/forms/DocumentUploadSlot'
import WorkflowConfirmModal from '../../components/dashboard/WorkflowConfirmModal'
import { useLanguage } from '../../i18n'

function TenancyCertificate() {
	const { user } = useOutletContext()
	const { t } = useLanguage()
	const navigate = useNavigate()
	const location = useLocation()
	const [searchParams, setSearchParams] = useSearchParams()
	const draftParam = searchParams.get('draft')
	const PASSPORT_WIDTH = 350
	const PASSPORT_HEIGHT = 450
	const PASSPORT_TOP_BIAS = 0.18

	const [tenancyStep, setTenancyStep] = useState(1)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [saveToast, setSaveToast] = useState('')
	const [errorToast, setErrorToast] = useState('')
	const [tenancySubmitting, setTenancySubmitting] = useState(false)
	const [draftSaving, setDraftSaving] = useState(false)
	const [draftApplicationNo, setDraftApplicationNo] = useState(null)
	const [savedWizardStep, setSavedWizardStep] = useState(0)
	const [pageReady, setPageReady] = useState(false)
	const [draftLoaded, setDraftLoaded] = useState(false)
	const [startOverOpen, setStartOverOpen] = useState(false)
	const [startOverBusy, setStartOverBusy] = useState(false)
	const [draftsModalOpen, setDraftsModalOpen] = useState(false)
	const [draftsModalMessage, setDraftsModalMessage] = useState('')
	const [draftsDiscardBusy, setDraftsDiscardBusy] = useState(false)
	const [draftsLoading, setDraftsLoading] = useState(false)
	const [conflictData, setConflictData] = useState(null)
	const [submittedApp, setSubmittedApp] = useState(null)
	const [linkCopied, setLinkCopied] = useState(false)
	const saveToastTimerRef = useRef(null)
	const errorToastTimerRef = useRef(null)
	const visitInitKeyRef = useRef(null)
	const allowLeaveRef = useRef(false)
	const [serverDrafts, setServerDrafts] = useState([])

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

	const applyProfileUser = useCallback((profileUser = {}) => {
		if (!profileUser) return
		setProfileType(profileUser.profile_type || '')
		setProfileName(profileUser.name || '')
		setProfileEmail(profileUser.email || '')
		setProfilePhone(profileUser.phone || '')
		setProfileAddress(profileUser.address || '')
		setProfilePin(profileUser.pin_code || '')
		setProfilePan(profileUser.pan_card || '')
	}, [])

	const getProfileSnapshot = useCallback(() => ({
		name: profileName || user?.name || '',
		email: profileEmail || user?.email || '',
		phone: profilePhone || user?.phone || '',
		address: profileAddress || user?.address || '',
		pin_code: profilePin || user?.pin_code || '',
		pan_card: profilePan || user?.pan_card || '',
		profile_type: profileType || user?.profile_type || '',
	}), [profileName, profileEmail, profilePhone, profileAddress, profilePin, profilePan, profileType, user])

	const populateFromDraft = useCallback(
		(draft) => {
			const profileSnapshot = {
				name: user?.name || profileName || '',
				email: user?.email || profileEmail || '',
				phone: user?.phone || profilePhone || '',
				address: user?.address || profileAddress || '',
				pin_code: user?.pin_code || profilePin || '',
				pan_card: user?.pan_card || profilePan || '',
				profile_type: user?.profile_type || profileType || '',
			}
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
			}, { loadVillageWards: loadTenancyVillageWards, profile: profileSnapshot })
		},
		[user, profileName, profileEmail, profilePhone, profileAddress, profilePin, profilePan, profileType]
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

	const fetchServerDrafts = useCallback(async () => {
		setDraftsLoading(true)
		try {
			const { data } = await api.get('/api/tenancy-applications/drafts')
			const list = Array.isArray(data?.drafts) ? data.drafts : []
			setServerDrafts(list.filter((d) => d?.application_no))
			return list
		} catch {
			setServerDrafts([])
			return []
		} finally {
			setDraftsLoading(false)
		}
	}, [])

	const openDraftsModal = useCallback(() => {
		setDraftsModalMessage('')
		setDraftsModalOpen(true)
		void fetchServerDrafts()
	}, [fetchServerDrafts])

	const loadDraft = useCallback(async () => {
		const draftNo = searchParams.get('draft')
		if (!draftNo) {
			setDraftLoaded(true)
			return
		}

		try {
			const { data } = await api.get(
				`/api/tenancy-applications/${encodeURIComponent(draftNo)}`
			)
			const app = data.application || data
			if (String(app?.status || '').toUpperCase() === 'DRAFT') {
				populateFromDraft(app)
				void fetchServerDrafts()
				return
			}
			setError(t('ws.uin.error.cannotContinue'))
		} catch (err) {
			console.error('Failed to load draft', err)
			setError(err?.response?.data?.message || t('ws.uin.error.loadFailed'))
		} finally {
			setDraftLoaded(true)
		}
	}, [populateFromDraft, searchParams, fetchServerDrafts])

	const loadProfile = async () => {
		try {
			const { data } = await api.get('/api/profile')
			applyProfileUser(data.user || {})
		} catch (err) {
			console.error('Failed to load profile for prefill')
			applyProfileUser(user || {})
		}
	}

	
	const profileAddressLine = [profileAddress, profilePin].filter(Boolean).join(', ')

	const fillProfileIntoRole = useCallback((role) => {
		if (!role) return
		const snapshot = getProfileSnapshot()
		if (!snapshot.name) return
		applyInitiatorProfileAutofill(role, snapshot, {
			setLandlordName,
			setLandlordAddress,
			setLandlordEmail,
			setLandlordPhone,
			setLandlordPan,
			setTenantName,
			setTenantAddress,
			setTenantEmail,
			setTenantPhone,
			setTenantPan,
		})
	}, [getProfileSnapshot])

	const clearPartyIfMatchesProfile = useCallback((role) => {
		if (!profileName) return
		const addr = profileAddressLine || profileAddress

		if (role === 'LANDLORD') {
			setLandlordName((v) => (v === profileName ? '' : v))
			setLandlordAddress((v) => (v === addr || v === profileAddress ? '' : v))
			setLandlordEmail((v) => (v === profileEmail ? '' : v))
			setLandlordPhone((v) => (v === profilePhone ? '' : v))
			setLandlordPan((v) => (v === profilePan ? '' : v))
		} else if (role === 'TENANT') {
			setTenantName((v) => (v === profileName ? '' : v))
			setTenantAddress((v) => (v === addr || v === profileAddress ? '' : v))
			setTenantEmail((v) => (v === profileEmail ? '' : v))
			setTenantPhone((v) => (v === profilePhone ? '' : v))
			setTenantPan((v) => (v === profilePan ? '' : v))
		}
	}, [profileName, profileAddress, profileAddressLine, profileEmail, profilePhone, profilePan])

	const handleInitiatorRoleChange = (role) => {
		if (role === initiatorRole) return
		const previous = initiatorRole
		setInitiatorRole(role)
		fillProfileIntoRole(role)
		if (previous) clearPartyIfMatchesProfile(previous)
	}

	// Fresh apply defaults to Landlord (draft resume keeps saved role)
	useEffect(() => {
		if (draftParam || !draftLoaded || initiatorRole) return
		setInitiatorRole('LANDLORD')

		if (user?.district_id) {
			const dId = String(user.district_id)
			setTenancyDistrictId(dId)
			loadTenancyVillageWards(dId)

			if (user.office_id) {
				setTenancyOfficeId(String(user.office_id))
			} else if (tenancyOffices.length > 0) {
				const officesInDistrict = tenancyOffices.filter(o => String(o.district_id) === dId)
				if (officesInDistrict.length === 1) {
					setTenancyOfficeId(String(officesInDistrict[0].id))
				}
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [draftParam, draftLoaded, initiatorRole, user, tenancyOffices])

	// Fill initiator section from profile when fields are empty (after draft load or fresh default)
	useEffect(() => {
		if (!draftLoaded || !initiatorRole) return
		if (draftParam && !draftApplicationNo) return
		const snapshot = getProfileSnapshot()
		if (!snapshot.name) return
		const needsAutofill =
			initiatorRole === 'LANDLORD'
				? !landlordName.trim()
				: initiatorRole === 'TENANT'
					? !tenantName.trim()
					: false
		if (!needsAutofill) return
		fillProfileIntoRole(initiatorRole)
	}, [
		draftParam,
		draftApplicationNo,
		draftLoaded,
		initiatorRole,
		landlordName,
		tenantName,
		getProfileSnapshot,
		fillProfileIntoRole,
	])

	// If draft restored office_id but not district (office relation missing), derive district
	useEffect(() => {
		if (!draftLoaded || tenancyDistrictId || !tenancyOfficeId || !tenancyOffices.length) return
		const office = tenancyOffices.find((o) => String(o.id) === String(tenancyOfficeId))
		if (!office?.district_id) return
		const districtId = String(office.district_id)
		setTenancyDistrictId(districtId)
		loadTenancyVillageWards(districtId)
	}, [draftLoaded, tenancyDistrictId, tenancyOfficeId, tenancyOffices])

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
		if (user) applyProfileUser(user)
	}, [user, applyProfileUser])

	useEffect(() => {
		const init = async () => {
			await Promise.all([
				loadProfile(),
				loadTenancyDistricts(),
				loadTenancyOffices(),
			])
			setPageReady(true)
		}
		init()
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const resetTenancyFormFields = useCallback(() => {
		setTenancyStep(1)
		setDraftApplicationNo(null)
		setSavedWizardStep(0)
		setTenancyRegistrationDate('')
		setTenancyOfficeId('')
		setAgreementFile(null)
		setAgreementPreviewUrl('')
		setLandlordPhotoFile(null)
		setLandlordPhotoPreview('')
		setLandlordSignatureFile(null)
		setLandlordSignaturePreview('')
		setTenantPhotoFile(null)
		setTenantPhotoPreview('')
		setTenantSignatureFile(null)
		setTenantSignaturePreview('')
		setLandlordPanFile(null)
		setTenantPanFile(null)
		setManagerPanFile(null)
		setManagerName('')
		setManagerAddress('')
		setManagerEmail('')
		setManagerPhone('')
		setManagerPan('')
		setManagerAadhar('')
		setLandlordName('')
		setLandlordAddress('')
		setLandlordEmail('')
		setLandlordPhone('')
		setLandlordPan('')
		setLandlordAadhar('')
		setTenantName('')
		setTenantAddress('')
		setTenantEmail('')
		setTenantPhone('')
		setTenantPan('')
		setTenantAadhar('')
		setTenantPreviousTenancy('')
		setPropertyPossessionDate('')
		setPropertyRentPayable('')
		setPropertyPremisesDescription('')
		setPropertyFurnitureDescription('')
		setPropertyChargeElectricity('')
		setPropertyChargeWater('')
		setPropertyChargeFurnishing('')
		setPropertyChargeOtherServices('')
		setPropertyTenancyDuration('')
		setPropertyTenancyEndDate('')
		setSuccess('')
		setError('')
		setTenancyVillageWardId('')
		setTenancyVillageWards([])
		setTenancyVillageName('')
		setTenancyDistrictId('')
		setTenancyAreaType('')
		setTenancyLocalBody('')
		setDeclarationChecked(false)
		setInitiatorRole('')
	}, [])

	const clearTenancyFormFields = useCallback(() => {
		resetTenancyFormFields()
		if (searchParams.get('draft')) {
			setSearchParams({}, { replace: true })
		}
	}, [resetTenancyFormFields, searchParams, setSearchParams])

	const getActiveDraftNo = useCallback(
		() => draftApplicationNo || draftParam || null,
		[draftApplicationNo, draftParam]
	)

	const resumeFromDraft = useCallback((draftNo) => {
		if (!draftNo) return
		setError('')
		setDraftsModalOpen(false)
		setDraftsModalMessage('')
		setSearchParams({ draft: draftNo }, { replace: true })
	}, [setSearchParams])

	const discardSavedDraft = useCallback(async (draftNo) => {
		const targetNo = draftNo || getActiveDraftNo()
		if (!targetNo) return
		setDraftsDiscardBusy(true)
		try {
			await csrf()
			await api.delete(`/api/tenancy-applications/${targetNo}/draft`)
			setServerDrafts((prev) => prev.filter((d) => d.application_no !== targetNo))
			if (draftApplicationNo === targetNo || draftParam === targetNo) {
				clearTenancyFormFields()
			}
			setError('')
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to discard draft')
		} finally {
			setDraftsDiscardBusy(false)
		}
	}, [getActiveDraftNo, draftApplicationNo, draftParam, clearTenancyFormFields])

	useEffect(() => {
		if (!pageReady) return

		const visitKey = `${location.key}|${draftParam || ''}`
		if (visitInitKeyRef.current === visitKey) return
		visitInitKeyRef.current = visitKey

		if (!draftParam) {
			resetTenancyFormFields()
			setDraftLoaded(false)
			void (async () => {
				await fetchServerDrafts()
				setDraftLoaded(true)
			})()
			return
		}

		setDraftLoaded(false)
		resetTenancyFormFields()
		loadDraft()
	}, [pageReady, draftParam, location.key, loadDraft, resetTenancyFormFields, fetchServerDrafts])

	const resetTenancyForm = async () => {
		const draftNo = getActiveDraftNo()
		setStartOverBusy(true)
		try {
			if (draftNo) {
				await csrf()
				await api.delete(`/api/tenancy-applications/${draftNo}/draft`)
				setServerDrafts((prev) => prev.filter((d) => d.application_no !== draftNo))
			}
			clearTenancyFormFields()
			setStartOverOpen(false)
			setError('')
		} catch (err) {
			const msg = err?.response?.data?.message || 'Failed to start over'
			setError(msg)
		} finally {
			setStartOverBusy(false)
		}
	}

	const isResumedSession = Boolean(draftParam || draftApplicationNo)

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
		fieldErrors.managerPhone || fieldErrors.managerPan || fieldErrors.managerEmail
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

	const hasApplyProgress = useMemo(() => {
		if (tenancyStep > 1) return true
		if (draftApplicationNo) return true
		if (tenancyRegistrationDate || tenancyOfficeId || initiatorRole) return true
		if (landlordName.trim() || tenantName.trim() || managerName.trim()) return true
		if (agreementFile || landlordPhotoFile || tenantPhotoFile) return true
		if (declarationChecked) return true
		return false
	}, [
		tenancyStep,
		draftApplicationNo,
		tenancyRegistrationDate,
		tenancyOfficeId,
		initiatorRole,
		landlordName,
		tenantName,
		managerName,
		agreementFile,
		landlordPhotoFile,
		tenantPhotoFile,
		declarationChecked,
	])

	const showRefreshWarning =
		pageReady && draftLoaded && !submittedApp && !draftParam && !draftApplicationNo

	const leaveWarningMessage = t('ws.uin.leaveWarning')

	useEffect(() => {
		if (!showRefreshWarning || !hasApplyProgress) return undefined

		const onBeforeUnload = (event) => {
			if (allowLeaveRef.current) return
			event.preventDefault()
			event.returnValue = leaveWarningMessage
			return leaveWarningMessage
		}

		window.addEventListener('beforeunload', onBeforeUnload)
		return () => window.removeEventListener('beforeunload', onBeforeUnload)
	}, [showRefreshWarning, hasApplyProgress, leaveWarningMessage])

	const showSaveToast = useCallback((message) => {
		if (saveToastTimerRef.current) clearTimeout(saveToastTimerRef.current)
		setSaveToast(message || t('ws.uin.toast.saved'))
		saveToastTimerRef.current = setTimeout(() => {
			setSaveToast('')
			saveToastTimerRef.current = null
		}, 2800)
	}, [t])

	const showErrorToast = useCallback((message) => {
		if (!message) return
		if (errorToastTimerRef.current) clearTimeout(errorToastTimerRef.current)
		setError(message)
		setErrorToast(message)
		errorToastTimerRef.current = setTimeout(() => {
			setErrorToast('')
			errorToastTimerRef.current = null
		}, 3500)
	}, [])

	useEffect(() => () => {
		if (saveToastTimerRef.current) clearTimeout(saveToastTimerRef.current)
		if (errorToastTimerRef.current) clearTimeout(errorToastTimerRef.current)
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
				profile: getProfileSnapshot(),
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
				setServerDrafts((prev) => {
					const others = prev.filter((d) => d.application_no !== draft.application_no)
					return [draft, ...others]
				})
				setSavedWizardStep(Math.max(step, Number(draft.wizard_step) || step))
				// Keep draft in the URL so a refresh reloads this same draft (not a blank form).
				if (draftParam !== draft.application_no) {
					visitInitKeyRef.current = `${location.key}|${draft.application_no}`
					setSearchParams({ draft: draft.application_no }, { replace: true })
				}
			}
			setSuccess(t('ws.uin.toast.saved'))
			if (window.toastTimer) clearTimeout(window.toastTimer)
			window.toastTimer = setTimeout(() => setSuccess(''), 3500)
			return true
		} catch (err) {
			const errors = err?.response?.data?.errors
			let msg = err?.response?.data?.message || t('ws.uin.error.saveFailed')
			if (errors && typeof errors === 'object') {
				const list = Object.entries(errors).flatMap(([field, messages]) =>
					(Array.isArray(messages) ? messages : [messages]).map((m) => `${field}: ${m}`)
				)
				if (list.length) msg = list.join('. ')
			}
			setError(msg)
			showErrorToast(msg)
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
					formData
				)
				data = res.data
			} else {
				const res = await api.post('/api/tenancy-applications', formData)
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
			})
			scrollFormToTop()
		} catch (err) {
			const data = err?.response?.data
			if (err?.response?.status === 409 && data?.conflict) {
				setConflictData(data)
				showErrorToast(data.message || t('ws.uin.error.alreadyExists'))
				return
			}

			const errors = data?.errors
			let msg = data?.message || t('ws.uin.error.submitFailed')
			if (errors && typeof errors === 'object') {
				const list = Object.entries(errors).flatMap(([field, messages]) => (Array.isArray(messages) ? messages : [messages]).map(m => `${field}: ${m}`))
				if (list.length) msg = list.join('. ')
			}
			showErrorToast(msg)
		} finally { setTenancySubmitting(false) }
	}

	const tenancySteps = [
		{ id: 1, label: t('ws.uin.step.1') },
		{ id: 2, label: t('ws.uin.step.2') },
		{ id: 3, label: t('ws.uin.step.3') },
		{ id: 4, label: t('ws.uin.step.4') },
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

	const scrollToFirstError = useCallback((root = null) => {
		const scope = root && root.querySelector ? root : document
		const pageRoot = document.querySelector('.ws-uin-apply') || document
		const target =
			scope.querySelector?.('.ws-uin-field-error')?.closest('label') ||
			scope.querySelector?.('[aria-invalid="true"]') ||
			scope.querySelector?.(':invalid') ||
			pageRoot.querySelector?.('.ws-alert--error')

		if (!target) {
			scrollFormToTop()
			return
		}

		target.scrollIntoView({ behavior: 'smooth', block: 'center' })
		const focusEl =
			target.matches?.('input, select, textarea, button')
				? target
				: target.querySelector?.('input, select, textarea, button')
		if (focusEl && typeof focusEl.focus === 'function') {
			try {
				focusEl.focus({ preventScroll: true })
			} catch {
				focusEl.focus()
			}
		}
	}, [scrollFormToTop])

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
		const form = e.currentTarget
		setError('')

		if (tenancyStep === 1 && registrationTooOld) return

		if (tenancyStep === 1) {
			if (typeof form?.checkValidity === 'function' && !form.checkValidity()) {
				showErrorToast(t('ws.uin.error.fillRequired'))
				const firstInvalid = form.querySelector(':invalid')
				if (firstInvalid) {
					firstInvalid.setAttribute('aria-invalid', 'true')
					firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' })
					try {
						firstInvalid.focus({ preventScroll: true })
					} catch {
						firstInvalid.focus()
					}
				} else {
					requestAnimationFrame(() => scrollToFirstError(form))
				}
				return
			}
		}

		if (tenancyStep === 2) {
			if (hasStep2FieldErrors) {
				showErrorToast(t('ws.uin.error.correctFields'))
				requestAnimationFrame(() => scrollToFirstError(form))
				return
			}
			if (initiatorRole === 'LANDLORD' && !landlordEmail.trim()) {
				showErrorToast(t('ws.uin.error.enterEmail'))
				requestAnimationFrame(() => scrollToFirstError(form))
				return
			}
			if (initiatorRole === 'TENANT' && !tenantEmail.trim()) {
				showErrorToast(t('ws.uin.error.enterEmail'))
				requestAnimationFrame(() => scrollToFirstError(form))
				return
			}
			if (!landlordPhone || !tenantPhone || !landlordPan || !tenantPan) {
				showErrorToast(t('ws.uin.error.partyDetails'))
				requestAnimationFrame(() => scrollToFirstError(form))
				return
			}
			if (typeof form?.checkValidity === 'function' && !form.checkValidity()) {
				showErrorToast(t('ws.uin.error.fillRequired'))
				const firstInvalid = form.querySelector(':invalid')
				if (firstInvalid) {
					firstInvalid.setAttribute('aria-invalid', 'true')
					firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' })
					try {
						firstInvalid.focus({ preventScroll: true })
					} catch {
						firstInvalid.focus()
					}
				} else {
					requestAnimationFrame(() => scrollToFirstError(form))
				}
				return
			}
		}

		if (tenancyStep === 4) {
			if (!declarationChecked) {
				showErrorToast(t('ws.uin.error.acceptToSubmit'))
				requestAnimationFrame(() => scrollToFirstError(form))
				return
			}
			const ok = await saveDraftStep(4)
			if (ok) submitTenancyApplication()
			return
		}
		const ok = await saveDraftStep(tenancyStep)
		if (ok) setTenancyStep((prev) => Math.min(TOTAL_STEPS, prev + 1))
		else requestAnimationFrame(() => scrollToFirstError(form))
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
			pendingPartyRole = t('ws.uin.drafts.tenant')
			pendingPartyName = tenantName
			pendingPartyPhone = tenantPhone
		} else if (initiatorRole === 'TENANT') {
			pendingPartyRole = t('ws.uin.drafts.landlord')
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
						<h1 className="uin-confirm-title">{t('ws.uin.success.title')}</h1>
						<p className="uin-confirm-lead">
							{isJoint
								? t('ws.uin.success.jointLead', { party: pendingPartyText })
								: (submittedApp.message || t('ws.uin.success.lodged'))}
						</p>

						<dl className="uin-confirm-meta">
							<div className="uin-confirm-meta-row">
								<dt>{t('ws.uin.success.appNo')}</dt>
								<dd>{submittedApp.application_no || '—'}</dd>
							</div>
							{submittedApp.ref_code ? (
								<div className="uin-confirm-meta-row">
									<dt>{t('ws.uin.success.refCode')}</dt>
									<dd>{submittedApp.ref_code}</dd>
								</div>
							) : null}
						</dl>

						{isJoint && submittedApp.join_link ? (
							<div className="uin-confirm-invite">
								<p className="uin-confirm-joint-note">
									{t('ws.uin.success.jointNote', { party: pendingPartyText })}
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
										{linkCopied ? t('ws.uin.success.copied') : t('ws.uin.success.copyLink')}
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
								{t('ws.uin.success.downloadAck')}
							</button>
							<button
								type="button"
								className="ws-btn ws-btn--secondary"
								onClick={handleDownloadApplication}
							>
								{t('ws.uin.success.downloadApp')}
							</button>
							<button
								type="button"
								className="ws-btn ws-btn--outline"
								onClick={() => navigate('/dashboard')}
							>
								{t('ws.uin.success.backDashboard')}
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
			{errorToast ? (
				<div className="ws-uin-progress-toast ws-uin-progress-toast--error" role="alert" aria-live="assertive">
					<span className="ws-uin-progress-toast__icon" aria-hidden>!</span>
					{errorToast}
				</div>
			) : null}
			{!pageReady ? (
				<div className="ws-uin-apply-loading" role="status" aria-live="polite">
					{t('ws.uin.loading')}
				</div>
			) : (
				<>
			<header className="ws-uin-apply-head">
				<div className="ws-uin-apply-head__row">
					<div className="ws-uin-apply-head__copy">
						<h1 className="ws-uin-apply-title">{t('ws.uin.title')}</h1>
						<p className="ws-uin-apply-lead">{t('ws.uin.lead')}</p>
						{showRefreshWarning ? (
							<p className="ws-uin-refresh-note" role="status">
								{t('ws.uin.refreshNote')}
							</p>
						) : null}
					</div>
					<div className="ws-uin-apply-head__actions">
						{/*<button
							type="button"
							className="ws-btn ws-btn--secondary ws-uin-drafts-btn"
							onClick={() => openDraftsModal()}
						>
							<Icon name="file" />
							<span>Drafts</span>
							{serverDrafts.length > 0 ? (
								<span className="ws-uin-drafts-btn__badge" aria-label={`${serverDrafts.length} saved drafts`}>
									{serverDrafts.length}
								</span>
							) : null}
						</button>*/}
						{isResumedSession ? (
							<button
								type="button"
								className="ws-btn ws-uin-start-over"
								onClick={() => setStartOverOpen(true)}
							>
								{t('ws.uin.startOver')}
							</button>
						) : null}
					</div>
				</div>
			</header>

			<nav
				className="ws-uin-h-stepper"
				aria-label={t('ws.uin.steps.aria')}
				style={{
					'--ws-uin-steps': TOTAL_STEPS,
					'--ws-uin-progress': `${TOTAL_STEPS <= 1 ? 0 : ((tenancyStep - 1) / (TOTAL_STEPS - 1)) * 100}%`,
				}}
			>
				<div className="ws-uin-h-stepper__rail">
					<div className="ws-uin-h-stepper__track" aria-hidden>
						<span className="ws-uin-h-stepper__progress" />
					</div>
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
				</div>
			</nav>

			<div className="ws-uin-apply-body-full">
				<div className="ws-uin-apply-main">
					{error && !errorToast ? <div className="ws-alert ws-alert--error" style={{ borderRadius: '8px' }}>{error}</div> : null}

					{conflictData && (
						<div className="conflict-notice-box">
							<p>
								{t('ws.uin.conflict.lead', {
									appNo: conflictData.existing_application?.application_no || '—',
								})}
							</p>
							<div className="conflict-actions">
								<button
									type="button"
									className="secondary"
									onClick={() =>
										navigate(
											`/dashboard/status?app_no=${conflictData.existing_application?.application_no}`
										)
									}
								>
									{t('ws.uin.conflict.viewExisting')}
								</button>
								<button
									type="button"
									className="danger"
									disabled={tenancySubmitting}
									onClick={() => submitTenancyApplication(true)}
								>
									{tenancySubmitting
										? t('ws.uin.conflict.submitting')
										: t('ws.uin.conflict.submitNew')}
								</button>
							</div>
						</div>
					)}

					{success ? (
						<div className="ws-uin-progress-toast" role="status" aria-live="polite">
							<span className="ws-uin-progress-toast__icon" aria-hidden>✓</span>
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
				noValidate
			>

				{tenancyStep === 1 && (
					<fieldset className="tenancy-fieldset">
						<div className="form-grid">
							<div className="ws-uin-role-toggle-field">
								<span className="label-text required">{t('ws.uin.form.initiatingAs')}</span>
								<div
									className={`ws-uin-role-toggle${initiatorRole === 'TENANT' ? ' is-tenant' : ' is-landlord'}`}
									role="radiogroup"
									aria-label={t('ws.uin.form.initiatingAs')}
								>
									<span className="ws-uin-role-toggle__indicator" aria-hidden />
									<label
										className={`ws-uin-role-toggle__btn${initiatorRole === 'LANDLORD' ? ' is-active' : ''}`}
									>
										<input
											type="radio"
											name="initiatorRole"
											value="LANDLORD"
											checked={initiatorRole === 'LANDLORD'}
											onChange={() => handleInitiatorRoleChange('LANDLORD')}
											required
										/>
										<Icon name="building" />
										<span>{t('ws.uin.drafts.landlord')}</span>
									</label>
									<label
										className={`ws-uin-role-toggle__btn${initiatorRole === 'TENANT' ? ' is-active' : ''}`}
									>
										<input
											type="radio"
											name="initiatorRole"
											value="TENANT"
											checked={initiatorRole === 'TENANT'}
											onChange={() => handleInitiatorRoleChange('TENANT')}
										/>
										<Icon name="user" />
										<span>{t('ws.uin.drafts.tenant')}</span>
									</label>
								</div>
								<span className="ws-uin-field-hint">{t('ws.uin.form.roleHint')}</span>
							</div>

							<div className="ws-uin-date-eligibility">
								<label>
									<span className="label-text required">{t('ws.uin.form.agreementDate')}</span>
									<input type="date" value={tenancyRegistrationDate} onChange={e => setTenancyRegistrationDate(e.target.value)} onClick={(e) => e.target.showPicker && e.target.showPicker()} required max={new Date().toISOString().split('T')[0]} />
									<span className="ws-uin-field-hint">{t('ws.uin.form.agreementDateHint')}</span>
								</label>

								<label>
									<span className="label-text">{t('ws.uin.form.eligibility')}</span>
									<input
										type="text"
										className={`ws-uin-eligibility-field${tenancyRegistrationDate ? (eligibilityMet ? ' is-eligible' : ' is-ineligible') : ''}`}
										value={
											!tenancyRegistrationDate
												? ''
												: eligibilityMet
													? t('ws.uin.form.eligible', { type: applyType || '—' })
													: registrationTooOld
														? t('ws.uin.form.notEligible')
														: '—'
										}
										placeholder={t('ws.uin.form.selectAgreementDate')}
										readOnly
										aria-live="polite"
									/>
									<span className="ws-uin-field-hint">
										{!tenancyRegistrationDate
											? t('ws.uin.form.eligibilityHintEmpty')
											: eligibilityMet
												? t('ws.uin.form.eligibilityHintOk')
												: t('ws.uin.form.eligibilityHintOld')}
									</span>
								</label>
							</div>
							<label>
								<span className="label-text required">{t('ws.uin.form.district')}</span>
								<select value={tenancyDistrictId} onChange={e => {
									const dId = e.target.value;
									setTenancyDistrictId(dId);
									setTenancyVillageWardId('');
									setTenancyVillageWards([]);
									setTenancyVillageName('');
									loadTenancyVillageWards(dId);
									const officesInDistrict = tenancyOffices.filter(o => String(o.district_id) === dId);
									if (officesInDistrict.length === 1) {
										setTenancyOfficeId(String(officesInDistrict[0].id));
									} else {
										setTenancyOfficeId('');
									}
								}} required>
									<option value="">{t('ws.uin.form.selectDistrict')}</option>
									{tenancyDistricts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
								</select>
							</label>

							<label>
								<span className="label-text required">{t('ws.uin.form.circleOffice')}</span>
								<select value={tenancyOfficeId} onChange={e => setTenancyOfficeId(e.target.value)} required disabled={!tenancyDistrictId}>
									<option value="">{t('ws.uin.form.selectOffice')}</option>
									{availableOffices.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
								</select>
							</label>

							<div className="radio-group-container">
								<span className="label-text required">{t('ws.uin.form.areaType')}</span>
								<div className="radio-group" style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
									<label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
										<input type="radio" name="areaType" value="Urban" checked={tenancyAreaType === 'Urban'} onChange={e => { setTenancyAreaType(e.target.value); setTenancyLocalBody(''); setTenancyVillageWardId(''); setTenancyVillageName(''); }} required disabled={!tenancyDistrictId} />
										{t('ws.uin.form.urban')}
									</label>
									<label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
										<input type="radio" name="areaType" value="Rural" checked={tenancyAreaType === 'Rural'} onChange={e => { setTenancyAreaType(e.target.value); setTenancyLocalBody(''); setTenancyVillageWardId(''); setTenancyVillageName(''); }} required disabled={!tenancyDistrictId} />
										{t('ws.uin.form.rural')}
									</label>
								</div>
							</div>

							<label>
								<span className="label-text required">{tenancyAreaType === 'Urban' ? t('ws.uin.form.townMunicipal') : tenancyAreaType === 'Rural' ? t('ws.uin.form.gramPanchayat') : t('ws.uin.form.localBody')}</span>
								<select value={tenancyLocalBody} onChange={e => { setTenancyLocalBody(e.target.value); setTenancyVillageWardId(''); setTenancyVillageName(''); }} required disabled={!tenancyAreaType}>
									<option value="">{tenancyAreaType === 'Urban' ? t('ws.uin.form.selectTown') : tenancyAreaType === 'Rural' ? t('ws.uin.form.selectGramPanchayat') : t('ws.uin.form.selectLocalBody')}</option>
									{availableLocalBodies.map(b => <option key={b} value={b}>{b}</option>)}
								</select>
							</label>

							{tenancyAreaType === 'Urban' && (
								<label>
									<span className="label-text required">{t('ws.uin.form.ward')}</span>
									<select value={tenancyVillageWardId} onChange={e => { setTenancyVillageWardId(e.target.value); setTenancyVillageName(''); }} required disabled={!tenancyLocalBody}>
										<option value="">{t('ws.uin.form.selectWard')}</option>
										{availableWards.map(vw => <option key={vw.id} value={vw.id}>{vw.name}</option>)}
									</select>
								</label>
							)}

							{tenancyAreaType === 'Rural' && (
								<label>
									<span className="label-text required">{t('ws.uin.form.village')}</span>
									<select value={tenancyVillageName} onChange={e => setTenancyVillageName(e.target.value)} required disabled={!tenancyLocalBody}>
										<option value="">{t('ws.uin.form.selectVillage')}</option>
										{availableVillages.map(v => <option key={v} value={v}>{v}</option>)}
									</select>
								</label>
							)}
						</div>
					</fieldset>
				)}
				{tenancyStep === 2 && (
					<div className="parties-container">
						<section className="tenancy-section">
							<div className="section-header">
								<h2>{t('ws.uin.form.infoOfTenancy')}</h2>
							</div>

							<div className={`ws-uin-party-block${initiatorRole === 'LANDLORD' ? ' is-autofilled' : ''}`}>
								<header className="ws-uin-party-block__head">
									<span className="ws-uin-party-block__num">1</span>
									<div>
										<h3 className="ws-uin-party-block__title">
											{t('ws.uin.form.landlordDetails')}
										</h3>
										<p className="ws-uin-party-block__lead">{t('ws.uin.form.landlordLead')}</p>
									</div>
								</header>
								<div className="ws-uin-party-fields">
									<label>
										<span className="label-text required">{t('ws.uin.form.landlordName')}</span>
										<input type="text" placeholder={t('ws.uin.form.landlordNamePh')} value={landlordName} onChange={e => setLandlordName(e.target.value)} required />
									</label>
									<label>
										<span className="label-text required">{t('ws.uin.form.landlordPan')}</span>
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
										<span className="label-text required">{t('ws.uin.form.mobile')}</span>
										<input
											type="tel"
											inputMode="numeric"
											placeholder={t('ws.uin.form.mobilePh')}
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
										<span className={`label-text${initiatorRole === 'LANDLORD' ? ' required' : ''}`}>
											{t('ws.uin.form.email')}
										</span>
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
										<span className="label-text required">{t('ws.uin.form.landlordAddress')}</span>
										<textarea placeholder={t('ws.uin.form.addressPh')} value={landlordAddress} onChange={e => setLandlordAddress(e.target.value)} required rows={3} />
									</label>
								</div>
							</div>

							<div className={`ws-uin-party-block${initiatorRole === 'TENANT' ? ' is-autofilled' : ''}`}>
								<header className="ws-uin-party-block__head">
									<span className="ws-uin-party-block__num">2</span>
									<div>
										<h3 className="ws-uin-party-block__title">
											{t('ws.uin.form.tenantDetails')}
										</h3>
										<p className="ws-uin-party-block__lead">{t('ws.uin.form.tenantLead')}</p>
									</div>
								</header>
								<div className="ws-uin-party-fields">
									<label>
										<span className="label-text required">{t('ws.uin.form.tenantName')}</span>
										<input type="text" placeholder={t('ws.uin.form.tenantNamePh')} value={tenantName} onChange={e => setTenantName(e.target.value)} required />
									</label>
									<label>
										<span className="label-text required">{t('ws.uin.form.tenantPan')}</span>
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
										<span className="label-text required">{t('ws.uin.form.mobile')}</span>
										<input
											type="tel"
											inputMode="numeric"
											placeholder={t('ws.uin.form.mobilePh')}
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
										<span className={`label-text${initiatorRole === 'TENANT' ? ' required' : ''}`}>
											{t('ws.uin.form.email')}
										</span>
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
										<span className="label-text required">{t('ws.uin.form.tenantAddress')}</span>
										<textarea placeholder={t('ws.uin.form.addressPh')} value={tenantAddress} onChange={e => setTenantAddress(e.target.value)} required rows={3} />
									</label>
									<label className="ws-uin-party-fields__full">
										<span className="label-text">{t('ws.uin.form.previousTenancy')}</span>
										<textarea value={tenantPreviousTenancy} onChange={e => setTenantPreviousTenancy(e.target.value)} rows={3} />
									</label>
								</div>
							</div>

							<div className="ws-uin-party-block">
								<header className="ws-uin-party-block__head">
									<span className="ws-uin-party-block__num">3</span>
									<div>
										<h3 className="ws-uin-party-block__title">{t('ws.uin.form.managerDetails')}</h3>
										<p className="ws-uin-party-block__lead">{t('ws.uin.form.managerLead')}</p>
									</div>
								</header>
								<div className="ws-uin-party-fields">
									<label>
										<span className="label-text">{t('ws.uin.form.managerName')}</span>
										<input type="text" placeholder={t('ws.uin.form.managerNamePh')} value={managerName} onChange={e => setManagerName(e.target.value)} />
									</label>
									<label>
										<span className="label-text">{t('ws.uin.form.managerPan')}</span>
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
										<span className="label-text">{t('ws.uin.form.mobile')}</span>
										<input
											type="tel"
											inputMode="numeric"
											placeholder={t('ws.uin.form.mobilePh')}
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
										<span className="label-text">{t('ws.uin.form.email')}</span>
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
										<span className="label-text">{t('ws.uin.form.managerAddress')}</span>
										<textarea placeholder={t('ws.uin.form.addressPh')} value={managerAddress} onChange={e => setManagerAddress(e.target.value)} rows={3} />
									</label>
								</div>
							</div>

							<div className="ws-uin-party-block">
								<header className="ws-uin-party-block__head">
									<span className="ws-uin-party-block__num">4</span>
									<div>
										<h3 className="ws-uin-party-block__title">{t('ws.uin.form.premisesDetails')}</h3>
										<p className="ws-uin-party-block__lead">{t('ws.uin.form.premisesLead')}</p>
									</div>
								</header>
								<div className="form-group-row">
									<label><span className="label-text">{t('ws.uin.form.premisesDesc')}</span>
										<textarea value={propertyPremisesDescription} onChange={e => setPropertyPremisesDescription(e.target.value)} />
									</label>
								</div>

								<div className="form-group-row">
									<label><span className="label-text required">{t('ws.uin.form.tenancyPeriod')}</span></label>
									<div className="form-grid ws-uin-date-grid">
										<label>
											<span className="label-text required">{t('ws.uin.form.possessionDate')}</span>
											<input
												type="date"
												name="property_possession_date"
												autoComplete="off"
												value={propertyPossessionDate}
												onChange={e => setPropertyPossessionDate(e.target.value)}
												onClick={(e) => e.target.showPicker && e.target.showPicker()}
												required
											/>
										</label>
										<label>
											<span className="label-text required">{t('ws.uin.form.endDate')}</span>
											<input
												type="date"
												name="property_tenancy_end_date"
												autoComplete="off"
												value={propertyTenancyEndDate}
												onChange={e => setPropertyTenancyEndDate(e.target.value)}
												onClick={(e) => e.target.showPicker && e.target.showPicker()}
												required
												min={propertyPossessionDate}
											/>
										</label>
										<label>
											<span className="label-text">{t('ws.uin.form.duration')}</span>
											<input
												type="text"
												name="property_tenancy_duration"
												autoComplete="off"
												value={propertyTenancyDuration}
												readOnly
												disabled
												className="readonly-input"
											/>
										</label>
									</div>
								</div>

								<div className="form-group-row">
									<label><span className="label-text required">{t('ws.uin.form.rentPayable')}</span>
										<input
											type="number"
											name="property_rent_payable"
											autoComplete="off"
											value={propertyRentPayable}
											onChange={e => setPropertyRentPayable(e.target.value)}
											onWheel={e => e.target.blur()}
											min="0"
											required
										/>
									</label>
								</div>

								<div className="form-group-row">
									<label><span className="label-text">{t('ws.uin.form.furnitureDesc')}</span>
										<textarea
											name="property_furniture_description"
											autoComplete="off"
											value={propertyFurnitureDescription}
											onChange={e => setPropertyFurnitureDescription(e.target.value)}
										/>
									</label>
								</div>

								<div className="form-group-row">
									<label><span className="label-text">{t('ws.uin.form.otherCharges')}</span></label>
									<div className="ws-uin-charges-grid">
										<label>
											<span className="label-text">{t('ws.uin.form.chargeElectricity')}</span>
											<input type="number" name="property_charge_electricity" autoComplete="off" value={propertyChargeElectricity} onChange={e => setPropertyChargeElectricity(e.target.value)} onWheel={e => e.target.blur()} min="0" placeholder="0" />
										</label>
										<label>
											<span className="label-text">{t('ws.uin.form.chargeWater')}</span>
											<input type="number" name="property_charge_water" autoComplete="off" value={propertyChargeWater} onChange={e => setPropertyChargeWater(e.target.value)} onWheel={e => e.target.blur()} min="0" placeholder="0" />
										</label>
										<label>
											<span className="label-text">{t('ws.uin.form.chargeFurnishing')}</span>
											<input type="number" name="property_charge_furnishing" autoComplete="off" value={propertyChargeFurnishing} onChange={e => setPropertyChargeFurnishing(e.target.value)} onWheel={e => e.target.blur()} min="0" placeholder="0" />
										</label>
										<label>
											<span className="label-text">{t('ws.uin.form.chargeOther')}</span>
											<input type="number" name="property_charge_other_services" autoComplete="off" value={propertyChargeOtherServices} onChange={e => setPropertyChargeOtherServices(e.target.value)} onWheel={e => e.target.blur()} min="0" placeholder="0" />
										</label>
									</div>
									<div className="ws-uin-rent-total">
										<span>{t('ws.uin.form.totalMonthly')}</span>
										<strong>₹{totalMonthlyRent.toLocaleString('en-IN')}</strong>
									</div>
								</div>
							</div>
						</section>
					</div>
				)}

				{tenancyStep === 3 && (
					<fieldset className="tenancy-fieldset tenancy-docs-fieldset">
						<div className="tenancy-docs-step">
							<header className="tenancy-docs-step__header">
								<h2 className="tenancy-docs-step__title">{t('ws.uin.form.uploadsTitle')}</h2>
								<p className="tenancy-docs-step__lead">
									{t('ws.uin.form.uploadsLead')}
								</p>
								<p className="tenancy-docs-step__disclaimer" role="note">
									<strong>{t('ws.uin.form.uploadsGuidelines')}</strong> {t('ws.uin.form.uploadsGuidelinesBody')}
								</p>
								<ul className="tenancy-docs-step__checklist" aria-label={t('ws.uin.form.checklistAria')}>
									<li>{t('ws.uin.form.checkAgreement')}</li>
									<li>{t('ws.uin.form.checkPhoto')}</li>
									<li>{t('ws.uin.form.checkPan')}</li>
									<li>{t('ws.uin.form.checkSign')}</li>
								</ul>
							</header>

							<div className="tenancy-docs-step__cards">
								<article className="tenancy-doc-card">
									<div className="tenancy-doc-card__head">
										<span className="tenancy-doc-card__num">1</span>
										<div>
											<h3 className="tenancy-doc-card__title">{t('ws.uin.form.agreementCardTitle')}</h3>
											<p className="tenancy-doc-card__meta">{t('ws.uin.form.agreementCardMeta')}</p>
										</div>
									</div>
									<div className={`tenancy-doc-slot tenancy-doc-slot--wide${agreementFile ? ' is-uploaded' : ''}`}>
										<div className="tenancy-doc-slot__head">
											<span className="tenancy-doc-slot__title is-required">{t('ws.uin.form.agreementSlot')}</span>
											<span className="tenancy-doc-slot__hint">{t('ws.uin.form.agreementHint')}</span>
										</div>
										<div className="tenancy-doc-slot__row">
											<input
												id="uin-agreement-file"
												className="tenancy-doc-slot__input"
												type="file"
												accept=".pdf,application/pdf"
												required={!agreementFile}
												onChange={e => {
													const f = e.target.files[0]
													setAgreementFile(f)
													if (f) setAgreementPreviewUrl(URL.createObjectURL(f))
													else setAgreementPreviewUrl('')
												}}
											/>
											<label htmlFor="uin-agreement-file" className="tenancy-doc-slot__pick-btn">
												{agreementFile ? t('ws.uin.upload.changeFile') : t('ws.uin.upload.chooseFile')}
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
														title={t('ws.uin.form.previewAgreement')}
														aria-label={t('ws.uin.form.previewAgreement')}
														onClick={() => openDocPreview('Registered Tenancy Agreement', agreementPreviewUrl, true)}
													>
														<Icon name="eye" />
													</button>
												</div>
											) : (
												<span className="tenancy-doc-slot__pending">{t('ws.uin.upload.noFile')}</span>
											)}
										</div>
									</div>
								</article>

								<article className="tenancy-doc-card">
									<div className="tenancy-doc-card__head">
										<span className="tenancy-doc-card__num">2</span>
										<div>
											<h3 className="tenancy-doc-card__title">{t('ws.uin.form.personalDocsTitle')}</h3>
											<p className="tenancy-doc-card__meta">
												{t('ws.uin.form.personalDocsMeta', { role: initiatorRole === 'TENANT' ? t('ws.uin.drafts.tenant') : t('ws.uin.drafts.landlord') })}
											</p>
										</div>
									</div>
									<div className="tenancy-doc-card__grid">
										{initiatorRole === 'TENANT' ? (
											<>
												<DocumentUploadSlot
													id="uin-tenant-photo"
													label={t('ws.uin.form.photoLabel')}
													accept=".jpg,.jpeg,.png,image/jpeg,image/png"
													hint={t('ws.uin.form.photoHint')}
													required
													onChange={async (e) => {
														const f = e.target.files[0]
														await handlePassportPhotoUpload(f, setTenantPhotoFile, setTenantPhotoPreview, 'tenant')
													}}
													imagePreview={tenantPhotoPreview}
													previewTitle={t('ws.uin.form.photoLabel')}
													onPreview={openDocPreview}
													onFilePreview={openFilePreview}
												/>
												<DocumentUploadSlot
													id="uin-tenant-signature"
													label={t('ws.uin.form.signatureLabel')}
													accept=".jpg,.jpeg,.png,image/jpeg,image/png"
													hint={t('ws.uin.form.signatureHint')}
													required
													onChange={e => {
														const f = e.target.files[0]
														setTenantSignatureFile(f)
														if (f) setTenantSignaturePreview(URL.createObjectURL(f))
													}}
													imagePreview={tenantSignaturePreview}
													previewTitle={t('ws.uin.form.signatureLabel')}
													onPreview={openDocPreview}
													onFilePreview={openFilePreview}
												/>
												<DocumentUploadSlot
													id="uin-tenant-pan"
													label={t('ws.uin.form.panDocLabel')}
													accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
													hint={t('ws.uin.form.panDocHint')}
													required
													onChange={e => setTenantPanFile(e.target.files[0])}
													file={tenantPanFile}
													previewTitle={t('ws.uin.form.panDocLabel')}
													onPreview={openDocPreview}
													onFilePreview={openFilePreview}
												/>
											</>
										) : (
											<>
												<DocumentUploadSlot
													id="uin-landlord-photo"
													label={t('ws.uin.form.photoLabel')}
													accept=".jpg,.jpeg,.png,image/jpeg,image/png"
													hint={t('ws.uin.form.photoHint')}
													required
													onChange={async (e) => {
														const f = e.target.files[0]
														await handlePassportPhotoUpload(f, setLandlordPhotoFile, setLandlordPhotoPreview, 'landlord')
													}}
													imagePreview={landlordPhotoPreview}
													previewTitle={t('ws.uin.form.photoLabel')}
													onPreview={openDocPreview}
													onFilePreview={openFilePreview}
												/>
												<DocumentUploadSlot
													id="uin-landlord-signature"
													label={t('ws.uin.form.signatureLabel')}
													accept=".jpg,.jpeg,.png,image/jpeg,image/png"
													hint={t('ws.uin.form.signatureHint')}
													required
													onChange={e => {
														const f = e.target.files[0]
														setLandlordSignatureFile(f)
														if (f) setLandlordSignaturePreview(URL.createObjectURL(f))
													}}
													imagePreview={landlordSignaturePreview}
													previewTitle={t('ws.uin.form.signatureLabel')}
													onPreview={openDocPreview}
													onFilePreview={openFilePreview}
												/>
												<DocumentUploadSlot
													id="uin-landlord-pan"
													label={t('ws.uin.form.panDocLabel')}
													accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
													hint={t('ws.uin.form.panDocHint')}
													required
													onChange={e => setLandlordPanFile(e.target.files[0])}
													file={landlordPanFile}
													previewTitle={t('ws.uin.form.panDocLabel')}
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
							{t('ws.uin.preview.reviewHint')}
						</div>

						<div className="ws-uin-declaration">
							<label className="ws-uin-declaration-label">
								<input
									type="checkbox"
									checked={declarationChecked}
									onChange={(e) => setDeclarationChecked(e.target.checked)}
								/>
								<span>
									{t('ws.uin.declaration.text')}
								</span>
							</label>
						</div>
					</div>
				)}

				<div className="form-actions ws-uin-apply-actions">
					{tenancyStep > 1 ? (
						<button type="button" className="ws-btn ws-btn--secondary" onClick={() => goToStep(tenancyStep - 1)}>
							{t('ws.uin.actions.back')}
						</button>
					) : null}
					{tenancyStep < 4 ? (
						<button type="submit" className="ws-btn ws-btn--primary" disabled={draftSaving || (tenancyStep === 1 && registrationTooOld)}>
							{draftSaving ? t('ws.uin.actions.saving') : t('ws.uin.actions.saveContinue')}
						</button>
					) : null}
					{tenancyStep === 4 ? (
						<button type="submit" className="ws-btn ws-btn--primary" disabled={tenancySubmitting || draftSaving || !declarationChecked}>
							{tenancySubmitting ? t('ws.uin.actions.submitting') : t('ws.uin.actions.confirmSubmit')}
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

			<WorkflowConfirmModal
				open={draftsModalOpen}
				onClose={() => {
					if (!draftsDiscardBusy) {
						setDraftsModalOpen(false)
						setDraftsModalMessage('')
					}
				}}
				title={t('ws.uin.drafts.title')}
				description={
					draftsModalMessage || t('ws.uin.drafts.description')
				}
				hidePrimary
				secondaryLabel={t('ws.uin.drafts.close')}
			>
				<div className="ws-uin-drafts-modal">
					{draftsLoading ? (
						<p className="ws-uin-drafts-modal__loading">{t('ws.uin.drafts.loading')}</p>
					) : serverDrafts.length > 0 ? (
						<ul className="ws-uin-drafts-list">
							{serverDrafts.map((draft) => {
								const isActive = draft.application_no === (draftApplicationNo || draftParam)
								return (
									<li key={draft.application_no}>
										<article className={`ws-uin-draft-card${isActive ? ' is-active' : ''}`}>
											<div className="ws-uin-draft-card__main">
												<span className="ws-uin-draft-card__no">{draft.application_no}</span>
												{isActive ? (
													<span className="ws-uin-draft-card__active">{t('ws.uin.drafts.current')}</span>
												) : null}
												<ul className="ws-uin-draft-card__meta">
													<li>
														{t('ws.uin.drafts.stageOf', {
															current: Math.min(4, (Number(draft.wizard_step) || 1) + 1),
															total: 4,
														})}
													</li>
													{draft.initiator_role ? (
														<li>
															{draft.initiator_role === 'LANDLORD'
																? t('ws.uin.drafts.landlord')
																: draft.initiator_role === 'TENANT'
																	? t('ws.uin.drafts.tenant')
																	: draft.initiator_role}
														</li>
													) : null}
													{draft.updated_at ? (
														<li>{t('ws.uin.drafts.updated', { date: formatDateTime(draft.updated_at) })}</li>
													) : null}
												</ul>
											</div>
											<div className="ws-uin-draft-card__actions">
												<button
													type="button"
													className="workflow-confirm-btn workflow-confirm-btn--primary"
													disabled={isActive}
													onClick={() => resumeFromDraft(draft.application_no)}
												>
													{isActive ? t('ws.uin.drafts.open') : t('ws.uin.drafts.resume')}
												</button>
												<button
													type="button"
													className="workflow-confirm-btn workflow-confirm-btn--danger"
													disabled={draftsDiscardBusy}
													onClick={() => discardSavedDraft(draft.application_no)}
												>
													{draftsDiscardBusy ? t('ws.uin.drafts.discarding') : t('ws.uin.drafts.discard')}
												</button>
											</div>
										</article>
									</li>
								)
							})}
						</ul>
					) : (
						<p className="ws-uin-drafts-modal__empty">
							{t('ws.uin.drafts.empty')}
						</p>
					)}
				</div>
			</WorkflowConfirmModal>

			<WorkflowConfirmModal
				open={startOverOpen}
				onClose={() => {
					if (!startOverBusy) setStartOverOpen(false)
				}}
				title={t('ws.uin.startOverModal.title')}
				description={
					draftApplicationNo
						? t('ws.uin.startOverModal.withDraft', { appNo: draftApplicationNo })
						: t('ws.uin.startOverModal.withoutDraft')
				}
				primaryLabel={startOverBusy ? t('ws.uin.startOverModal.starting') : t('ws.uin.startOverModal.confirm')}
				secondaryLabel={t('ws.uin.startOverModal.cancel')}
				primaryVariant="danger"
				primaryDisabled={startOverBusy}
				onPrimary={resetTenancyForm}
			/>
				</>
			)}
		</div>
	)
}

export default TenancyCertificate
