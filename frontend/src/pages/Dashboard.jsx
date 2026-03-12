import { useEffect, useState } from 'react'
import api, { csrf } from '../api'

function Dashboard({ user, onLogout }) {
	const [activePanel, setActivePanel] = useState('welcome')
	const [officeMenuOpen, setOfficeMenuOpen] = useState(false)
	const [userMenuOpen, setUserMenuOpen] = useState(false)
	const [servicesMenuOpen, setServicesMenuOpen] = useState(false)
	const [stateName, setStateName] = useState('')
	const [states, setStates] = useState([])
	const [statePage, setStatePage] = useState(1)
	const [stateTotalPages, setStateTotalPages] = useState(1)
	const [stateEditId, setStateEditId] = useState(null)
	const [stateEditName, setStateEditName] = useState('')
	const [districtName, setDistrictName] = useState('')
	const [districtStateId, setDistrictStateId] = useState('')
	const [districts, setDistricts] = useState([])
	const [districtPage, setDistrictPage] = useState(1)
	const [districtTotalPages, setDistrictTotalPages] = useState(1)
	const [districtEditId, setDistrictEditId] = useState(null)
	const [districtEditName, setDistrictEditName] = useState('')
	const [districtEditStateId, setDistrictEditStateId] = useState('')
	const [roleName, setRoleName] = useState('')
	const [roles, setRoles] = useState([])
	const [rolePage, setRolePage] = useState(1)
	const [roleTotalPages, setRoleTotalPages] = useState(1)
	const [roleEditId, setRoleEditId] = useState(null)
	const [roleEditName, setRoleEditName] = useState('')
	const [designationName, setDesignationName] = useState('')
	const [designations, setDesignations] = useState([])
	const [designationPage, setDesignationPage] = useState(1)
	const [designationTotalPages, setDesignationTotalPages] = useState(1)
	const [designationEditId, setDesignationEditId] = useState(null)
	const [designationEditName, setDesignationEditName] = useState('')
	const [userName, setUserName] = useState('')
	const [userEmail, setUserEmail] = useState('')
	const [userOfficeId, setUserOfficeId] = useState('')
	const [userDesignationId, setUserDesignationId] = useState('')
	const [userPhone, setUserPhone] = useState('')
	const [userRole, setUserRole] = useState('')
	const [users, setUsers] = useState([])
	const [userRoles, setUserRoles] = useState([])
	const [userOffices, setUserOffices] = useState([])
	const [userEditId, setUserEditId] = useState(null)
	const [userEditName, setUserEditName] = useState('')
	const [userEditEmail, setUserEditEmail] = useState('')
	const [userEditOfficeId, setUserEditOfficeId] = useState('')
	const [userEditDesignationId, setUserEditDesignationId] = useState('')
	const [userEditPhone, setUserEditPhone] = useState('')
	const [userEditRole, setUserEditRole] = useState('')
	const [userListMode, setUserListMode] = useState('office')
	const [officeStateId, setOfficeStateId] = useState('')
	const [officeDistrictId, setOfficeDistrictId] = useState('')
	const [officeName, setOfficeName] = useState('')
	const [officeAddress, setOfficeAddress] = useState('')
	const [officeStates, setOfficeStates] = useState([])
	const [officeDistricts, setOfficeDistricts] = useState([])
	const [offices, setOffices] = useState([])
	const [officePage, setOfficePage] = useState(1)
	const [officeTotalPages, setOfficeTotalPages] = useState(1)
	const [officeEditId, setOfficeEditId] = useState(null)
	const [officeEditName, setOfficeEditName] = useState('')
	const [officeEditAddress, setOfficeEditAddress] = useState('')
	const [officeEditStateId, setOfficeEditStateId] = useState('')
	const [officeEditDistrictId, setOfficeEditDistrictId] = useState('')
	const [activityLogs, setActivityLogs] = useState([])
	const [activityPage, setActivityPage] = useState(1)
	const [activityTotalPages, setActivityTotalPages] = useState(1)
	const [activityUsers, setActivityUsers] = useState([])
	const [activityUserId, setActivityUserId] = useState('')
	const [activityUserQuery, setActivityUserQuery] = useState('')
	const [activityFrom, setActivityFrom] = useState('')
	const [activityTo, setActivityTo] = useState('')
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [profileType, setProfileType] = useState('')
	const [profileName, setProfileName] = useState('')
	const [profileEmail, setProfileEmail] = useState('')
	const [profilePhone, setProfilePhone] = useState('')
	const [profileAddress, setProfileAddress] = useState('')
	const [profileDistrict, setProfileDistrict] = useState('')
	const [profileState, setProfileState] = useState('')
	const [profilePin, setProfilePin] = useState('')
	const [profilePan, setProfilePan] = useState('')
	const [profilePhoto, setProfilePhoto] = useState(null)
	const [profilePhotoPreview, setProfilePhotoPreview] = useState('')
	const [profileLoading, setProfileLoading] = useState(false)
	const [profileEditing, setProfileEditing] = useState(false)
	const [tenancyStep, setTenancyStep] = useState(1)
	const [tenancyRegistrationDate, setTenancyRegistrationDate] = useState('')
	const [tenancyOfficeId, setTenancyOfficeId] = useState('')
	const [tenancyOffices, setTenancyOffices] = useState([])
	const [tenancyOfficesLoading, setTenancyOfficesLoading] = useState(false)
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
	const [propertyPossessionDate, setPropertyPossessionDate] = useState('')
	const [propertyRentPayable, setPropertyRentPayable] = useState('')
	const [propertyPremisesDescription, setPropertyPremisesDescription] =
		useState('')
	const [propertyFurnitureDescription, setPropertyFurnitureDescription] =
		useState('')
	const [propertyChargeElectricity, setPropertyChargeElectricity] = useState('')
	const [propertyChargeWater, setPropertyChargeWater] = useState('')
	const [propertyChargeFurnishing, setPropertyChargeFurnishing] = useState('')
	const [propertyChargeOtherServices, setPropertyChargeOtherServices] =
		useState('')
	const [propertyTenancyDuration, setPropertyTenancyDuration] = useState('')
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
	const [tenancySubmitting, setTenancySubmitting] = useState(false)
	const [tenancyReceipt, setTenancyReceipt] = useState(null)
	const [statusApplications, setStatusApplications] = useState([])
	const [statusLoading, setStatusLoading] = useState(false)
	const [statusPage, setStatusPage] = useState(1)
	const [statusTotalPages, setStatusTotalPages] = useState(1)
	const [statusViewApplication, setStatusViewApplication] = useState(null)
	const [statusViewLoading, setStatusViewLoading] = useState(false)
	const [editingApplicationId, setEditingApplicationId] = useState(null)

	const officeDistrictOptions = officeStateId
		? officeDistricts.filter((district) => {
			const districtStateId = district.state_id ?? district.state?.id
			return String(districtStateId) === String(officeStateId)
		})
		: []
	const officeEditDistrictOptions = officeEditStateId
		? officeDistricts.filter((district) => {
			const districtStateId = district.state_id ?? district.state?.id
			return String(districtStateId) === String(officeEditStateId)
		})
		: []
	const formatTenancyApplicationStatus = (status, applicationType = '') => {
		const normalizedType = String(applicationType || '').toLowerCase()
		const normalizedStatus = String(status || '').trim().toLowerCase()

		if (normalizedStatus === 'submiited') {
			return 'Submitted'
		}

		if (
			normalizedType.includes('tenancy certificate') &&
			normalizedStatus === 'under process'
		) {
			return 'Submitted'
		}

		return status || '-'
	}
	const formatDateTime = (value) => {
		if (!value) return '-'
		const normalized =
			typeof value === 'string' && value.includes(' ') && !value.includes('T')
				? value.replace(' ', 'T')
				: value
		const parsed = new Date(normalized)
		if (Number.isNaN(parsed.getTime())) {
			return String(value)
		}
		return parsed.toLocaleString()
	}

	const loadStates = async (page = 1) => {
		try {
			const { data } = await api.get('/api/states', { params: { page } })
			setStates(data.data || [])
			setStatePage(data.current_page || 1)
			setStateTotalPages(data.last_page || 1)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load states')
		}
	}

	const loadOffices = async (page = 1) => {
		try {
			const { data } = await api.get('/api/offices', { params: { page } })
			setOffices(data.data || [])
			setOfficePage(data.current_page || 1)
			setOfficeTotalPages(data.last_page || 1)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load offices')
		}
	}

	const loadDistricts = async (page = 1) => {
		try {
			const { data } = await api.get('/api/districts', { params: { page } })
			setDistricts(data.data || [])
			setDistrictPage(data.current_page || 1)
			setDistrictTotalPages(data.last_page || 1)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load districts')
		}
	}

	const loadRoles = async (page = 1) => {
		try {
			const { data } = await api.get('/api/roles', { params: { page } })
			setRoles(data.data || [])
			setRolePage(data.current_page || 1)
			setRoleTotalPages(data.last_page || 1)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load roles')
		}
	}

	const loadDesignations = async (page = 1) => {
		try {
			const { data } = await api.get('/api/designations', { params: { page } })
			setDesignations(data.data || [])
			setDesignationPage(data.current_page || 1)
			setDesignationTotalPages(data.last_page || 1)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load designations')
		}
	}

	const loadAllStates = async () => {
		try {
			let page = 1
			let lastPage = 1
			const collected = []
			while (page <= lastPage) {
				const { data } = await api.get('/api/states', { params: { page } })
				collected.push(...(data.data || []))
				lastPage = data.last_page || 1
				page += 1
			}
			setOfficeStates(collected)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load states')
		}
	}

	const loadAllOffices = async () => {
		try {
			let page = 1
			let lastPage = 1
			const collected = []
			while (page <= lastPage) {
				const { data } = await api.get('/api/offices', { params: { page } })
				collected.push(...(data.data || []))
				lastPage = data.last_page || 1
				page += 1
			}
			setUserOffices(collected)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load offices')
		}
	}

	const loadTenancyOffices = async () => {
		setTenancyOfficesLoading(true)
		try {
			let page = 1
			let lastPage = 1
			const collected = []
			while (page <= lastPage) {
				const { data } = await api.get('/api/public/offices', { params: { page } })
				const pageItems = Array.isArray(data)
					? data
					: data.data || data.offices || []
				collected.push(...pageItems)
				lastPage = data.last_page || 1
				page += 1
			}
			setTenancyOffices(collected)
			if (collected.length === 0) {
				setError('No offices available. Please contact support.')
			}
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load offices')
		} finally {
			setTenancyOfficesLoading(false)
		}
	}

	const loadAllDesignations = async () => {
		try {
			let page = 1
			let lastPage = 1
			const collected = []
			while (page <= lastPage) {
				const { data } = await api.get('/api/designations', { params: { page } })
				collected.push(...(data.data || []))
				lastPage = data.last_page || 1
				page += 1
			}
			setDesignations(collected)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load designations')
		}
	}

	const loadAllRoles = async () => {
		try {
			let page = 1
			let lastPage = 1
			const collected = []
			while (page <= lastPage) {
				const { data } = await api.get('/api/roles', { params: { page } })
				collected.push(...(data.data || []))
				lastPage = data.last_page || 1
				page += 1
			}
			setUserRoles(collected)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load roles')
		}
	}

	const loadUsers = async () => {
		try {
			const { data } = await api.get('/api/users')
			setUsers(data.users || [])
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load users')
		}
	}

	const loadAllDistricts = async () => {
		try {
			let page = 1
			let lastPage = 1
			const collected = []
			while (page <= lastPage) {
				const { data } = await api.get('/api/districts', { params: { page } })
				collected.push(...(data.data || []))
				lastPage = data.last_page || 1
				page += 1
			}
			setOfficeDistricts(collected)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load districts')
		}
	}

	const loadActivityLogs = async (page = 1) => {
		try {
			const { data } = await api.get('/api/activity-logs', {
				params: {
					page,
					user_id: activityUserId || undefined,
					from: activityFrom || undefined,
					to: activityTo || undefined,
				},
			})
			setActivityLogs(data.data || [])
			setActivityPage(data.current_page || 1)
			setActivityTotalPages(data.last_page || 1)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load activity logs')
		}
	}

	const loadActivityUsers = async () => {
		try {
			const { data } = await api.get('/api/users')
			setActivityUsers(data.users || [])
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load users')
		}
	}

	const loadProfile = async () => {
		setError('')
		setSuccess('')
		setProfileLoading(true)
		try {
			const { data } = await api.get('/api/profile')
			const profileUser = data.user || {}
			setProfileName(profileUser.name || '')
			setProfileEmail(profileUser.email || '')
			setProfilePhone(profileUser.phone || '')
			setProfileDistrict(profileUser.district?.name || '')
			setProfileState(profileUser.district?.state?.name || '')
			setProfileType(profileUser.profile_type || '')
			setProfileAddress(profileUser.address || '')
			setProfilePin(profileUser.pin_code || '')
			setProfilePan(profileUser.pan_card || '')
			if (profileUser.user_passport_photo_path) {
				const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
				setProfilePhotoPreview(
					`${baseUrl}/storage/${profileUser.user_passport_photo_path}`
				)
			} else {
				setProfilePhotoPreview('')
			}
			setProfileEditing(
				!(
					profileUser.profile_type &&
					profileUser.address &&
					profileUser.pin_code &&
					profileUser.pan_card &&
					profileUser.user_passport_photo_path
				)
			)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load profile')
		} finally {
			setProfileLoading(false)
		}
	}

	const handleProfileSubmit = async (e) => {
		e.preventDefault()
		setError('')
		setSuccess('')
		try {
			await csrf()
			const formData = new FormData()
			formData.append('_method', 'PUT')
			formData.append('profile_type', profileType)
			formData.append('address', profileAddress)
			formData.append('pin_code', profilePin)
			formData.append('pan_card', profilePan)
			if (profilePhoto) {
				formData.append('passport_photo', profilePhoto)
			}
			const { data } = await api.post('/api/profile', formData)
			const profileUser = data.user || {}
			setProfileType(profileUser.profile_type || '')
			setProfileAddress(profileUser.address || '')
			setProfilePin(profileUser.pin_code || '')
			setProfilePan(profileUser.pan_card || '')
			if (profileUser.user_passport_photo_path) {
				const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
				setProfilePhotoPreview(
					`${baseUrl}/storage/${profileUser.user_passport_photo_path}`
				)
			} else {
				setProfilePhotoPreview('')
			}
			setProfilePhoto(null)
			setSuccess('Profile saved successfully.')
			setProfileEditing(false)
		} catch (err) {
			const message =
				err?.response?.data?.message ||
				err?.response?.data?.errors?.profile_type?.[0] ||
				err?.response?.data?.errors?.address?.[0] ||
				err?.response?.data?.errors?.pin_code?.[0] ||
				err?.response?.data?.errors?.pan_card?.[0] ||
				err?.response?.data?.errors?.passport_photo?.[0] ||
				'Failed to save profile'
			setError(message)
		}
	}

	useEffect(() => {
		if (user?.role === 'tenant owner') {
			loadProfile()
		}
	}, [user?.role])

	useEffect(() => {
		if (profileType === 'landlord') {
			setLandlordName(profileName)
			setLandlordAddress(profileAddress)
			setLandlordEmail(profileEmail)
			setLandlordPhone(profilePhone)
			setLandlordPan(profilePan)
			if (profilePhotoPreview) {
				setLandlordPhotoPreview(profilePhotoPreview)
			}
		}
		if (profileType === 'tenant') {
			setTenantName(profileName)
			setTenantAddress(profileAddress)
			setTenantEmail(profileEmail)
			setTenantPhone(profilePhone)
			setTenantPan(profilePan)
			if (profilePhotoPreview) {
				setTenantPhotoPreview(profilePhotoPreview)
			}
		}
	}, [
		profileType,
		profileName,
		profileAddress,
		profileEmail,
		profilePhone,
		profilePan,
		profilePhotoPreview,
	])

	useEffect(() => {
		if (!agreementFile) {
			setAgreementPreviewUrl('')
			return
		}
		const url = URL.createObjectURL(agreementFile)
		setAgreementPreviewUrl(url)
		return () => URL.revokeObjectURL(url)
	}, [agreementFile])

	useEffect(() => {
		if (window.location.hash) {
			window.history.replaceState(null, '', window.location.pathname)
		}
	}, [])

	useEffect(() => {
		if (activePanel === 'tenancy-certificate') {
			loadTenancyOffices()
		}
	}, [activePanel])

	const loadStatusApplications = async (page = 1) => {
		setStatusLoading(true)
		setError('')
		try {
			const { data } = await api.get('/api/tenancy-applications/my', {
				params: { page },
			})
			setStatusApplications(data.data || [])
			setStatusPage(data.current_page || 1)
			setStatusTotalPages(data.last_page || 1)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load applications')
		} finally {
			setStatusLoading(false)
		}
	}

	const loadStatusApplication = async (id) => {
		setStatusViewLoading(true)
		setError('')
		try {
			const { data } = await api.get(`/api/tenancy-applications/${id}`)
			setStatusViewApplication(data.application || null)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load application')
		} finally {
			setStatusViewLoading(false)
		}
	}

	const startEditApplication = (application) => {
		const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
		setEditingApplicationId(application.id)
		setTenancyReceipt(null)
		loadTenancyOffices()
		setTenancyStep(1)
		setTenancyRegistrationDate(application.registration_date || '')
		setTenancyOfficeId(application.office_id ? String(application.office_id) : '')
		setLandlordName(application.landlord_name || '')
		setLandlordAddress(application.landlord_address || '')
		setLandlordEmail(application.landlord_email || '')
		setLandlordPhone(application.landlord_phone || '')
		setLandlordPan(application.landlord_pan || '')
		setManagerName(application.manager_name || '')
		setManagerAddress(application.manager_address || '')
		setManagerEmail(application.manager_email || '')
		setManagerPhone(application.manager_phone || '')
		setManagerPan(application.manager_pan || '')
		setTenantName(application.tenant_name || '')
		setTenantAddress(application.tenant_address || '')
		setTenantEmail(application.tenant_email || '')
		setTenantPhone(application.tenant_phone || '')
		setTenantPan(application.tenant_pan || '')
		setTenantPreviousTenancy(application.tenant_previous_tenancy || '')
		setPropertyPossessionDate(application.property_possession_date || '')
		setPropertyRentPayable(application.property_rent_payable || '')
		setPropertyPremisesDescription(application.property_premises_description || '')
		setPropertyFurnitureDescription(application.property_furniture_description || '')
		setPropertyChargeElectricity(application.property_charge_electricity || '')
		setPropertyChargeWater(application.property_charge_water || '')
		setPropertyChargeFurnishing(application.property_charge_furnishing || '')
		setPropertyChargeOtherServices(application.property_charge_other_services || '')
		setPropertyTenancyDuration(application.property_tenancy_duration || '')
		setAgreementFile(null)
		setAgreementPreviewUrl(
			application.agreement_pdf_path
				? `${baseUrl}/storage/${application.agreement_pdf_path}`
				: ''
		)
		setLandlordPhotoFile(null)
		setLandlordPhotoPreview(
			application.landlord_photo_path
				? `${baseUrl}/storage/${application.landlord_photo_path}`
				: ''
		)
		setLandlordSignatureFile(null)
		setLandlordSignaturePreview(
			application.landlord_signature_path
				? `${baseUrl}/storage/${application.landlord_signature_path}`
				: ''
		)
		setTenantPhotoFile(null)
		setTenantPhotoPreview(
			application.tenant_photo_path
				? `${baseUrl}/storage/${application.tenant_photo_path}`
				: ''
		)
		setTenantSignatureFile(null)
		setTenantSignaturePreview(
			application.tenant_signature_path
				? `${baseUrl}/storage/${application.tenant_signature_path}`
				: ''
		)
		setActivePanel('tenancy-certificate')
	}

	const resetTenancyForm = () => {
		setTenancyStep(1)
		setEditingApplicationId(null)
		setTenancyRegistrationDate('')
		setTenancyOfficeId('')
		setAgreementFile(null)
		setAgreementPreviewUrl('')
		setLandlordPhotoFile(null)
		setLandlordPhotoPreview(profileType === 'landlord' ? profilePhotoPreview : '')
		setLandlordSignatureFile(null)
		setLandlordSignaturePreview('')
		setTenantPhotoFile(null)
		setTenantPhotoPreview(profileType === 'tenant' ? profilePhotoPreview : '')
		setTenantSignatureFile(null)
		setTenantSignaturePreview('')
		setManagerName('')
		setManagerAddress('')
		setManagerEmail('')
		setManagerPhone('')
		setManagerPan('')
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
		setTenancyReceipt(null)
		setSuccess('')
		setError('')
	}

	const handleStateSubmit = async (e) => {
		e.preventDefault()
		setError('')
		setSuccess('')
		try {
			await csrf()
			await api.post('/api/states', { name: stateName })
			setStateName('')
			setSuccess('State added successfully.')
			setTimeout(() => setSuccess(''), 3000)
			await loadStates(statePage)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to add state')
		}
	}

	const handleStateEdit = (state) => {
		setStateEditId(state.id)
		setStateEditName(state.name)
		setError('')
		setSuccess('')
	}

	const handleStateUpdate = async (e) => {
		e.preventDefault()
		if (!stateEditId) return
		setError('')
		setSuccess('')
		try {
			await csrf()
			await api.put(`/api/states/${stateEditId}`, { name: stateEditName })
			setStateEditId(null)
			setStateEditName('')
			setSuccess('State updated successfully.')
			await loadStates(statePage)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to update state')
		}
	}

	const handleStateDelete = async (stateId) => {
		setError('')
		setSuccess('')
		try {
			await csrf()
			await api.delete(`/api/states/${stateId}`)
			setSuccess('State deleted successfully.')
			const nextPage = states.length === 1 && statePage > 1 ? statePage - 1 : statePage
			await loadStates(nextPage)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to delete state')
		}
	}

	const renderPanel = () => {
		if (activePanel === 'profile') {
			const hasProfile =
				!!profileType &&
				!!profileAddress &&
				!!profilePin &&
				!!profilePan &&
				!!profilePhotoPreview

			return (
				<div className="auth-card dashboard-card">
					<h1>Profile</h1>
					<p className="muted">Complete Your Profile.</p>
					{profileLoading ? <div className="muted">Loading profile...</div> : null}
					{error ? <div className="error">{error}</div> : null}
					{success ? <div className="admin-success">{success}</div> : null}
					{hasProfile && !profileEditing ? (
						<div className="profile-summary">
							<div className="profile-summary-grid">
								<div className="profile-summary-item profile-summary-type">
									<span className="profile-summary-label">Are you a</span>
									<span className="profile-summary-value">
										{profileType === 'landlord' ? 'Landlord' : 'Tenant'}
									</span>
								</div>
								<div className="profile-summary-item profile-summary-name">
									<span className="profile-summary-label">Name</span>
									<span className="profile-summary-value">{profileName}</span>
								</div>
								<div className="profile-summary-item profile-summary-email">
									<span className="profile-summary-label">Email</span>
									<span className="profile-summary-value">{profileEmail}</span>
								</div>
								<div className="profile-summary-item profile-summary-phone">
									<span className="profile-summary-label">Phone</span>
									<span className="profile-summary-value">{profilePhone}</span>
								</div>
								<div className="profile-summary-item profile-summary-address">
									<span className="profile-summary-label">Address</span>
									<span className="profile-summary-value">{profileAddress}</span>
								</div>
								<div className="profile-summary-item profile-summary-district">
									<span className="profile-summary-label">District</span>
									<span className="profile-summary-value">{profileDistrict}</span>
								</div>
								<div className="profile-summary-item profile-summary-state">
									<span className="profile-summary-label">State</span>
									<span className="profile-summary-value">{profileState}</span>
								</div>
								<div className="profile-summary-item profile-summary-pin">
									<span className="profile-summary-label">PIN Code</span>
									<span className="profile-summary-value">{profilePin}</span>
								</div>
								<div className="profile-summary-item profile-summary-pan">
									<span className="profile-summary-label">PAN Card</span>
									<span className="profile-summary-value">{profilePan}</span>
								</div>
								<div className="profile-summary-item profile-summary-photo">
									<span className="profile-summary-label">Passport Photo</span>
									{profilePhotoPreview ? (
										<img
											src={profilePhotoPreview}
											alt="Passport"
											className="profile-photo-preview"
										/>
									) : (
										<span className="profile-summary-value">Not uploaded</span>
									)}
								</div>
							</div>
							<button
								type="button"
								onClick={() => {
									setProfileEditing(true)
									setSuccess('')
									setError('')
								}}
							>
								Edit Profile
							</button>
						</div>
					) : (
						<form onSubmit={handleProfileSubmit} className="profile-form">
							<fieldset className="profile-type-row">
								<legend>Are you a</legend>
								<label>
									<input
										type="radio"
										name="profile_type"
										value="landlord"
										checked={profileType === 'landlord'}
										onChange={(e) => setProfileType(e.target.value)}
										required
									/>
									Landlord
								</label>
								<label>
									<input
										type="radio"
										name="profile_type"
										value="tenant"
										checked={profileType === 'tenant'}
										onChange={(e) => setProfileType(e.target.value)}
										required
									/>
									Tenant
								</label>
							</fieldset>
							<label className="profile-field profile-field-name">
								Name
								<input type="text" value={profileName} readOnly required />
							</label>
							<label className="profile-field profile-field-email">
								Email
								<input type="email" value={profileEmail} readOnly required />
							</label>
							<label className="profile-field profile-field-phone">
								Phone
								<input type="text" value={profilePhone} readOnly required />
							</label>
							<label className="profile-field profile-field-state">
								State
								<input type="text" value={profileState} readOnly required />
							</label>
							<label className="profile-field profile-field-district">
								District
								<input type="text" value={profileDistrict} readOnly required />
							</label>
							<label className="profile-field profile-field-address">
								Address
								<textarea
									rows="4"
									value={profileAddress}
									onChange={(e) => setProfileAddress(e.target.value)}
									maxLength={500}
									required
								/>
							</label>
							<label className="profile-field profile-field-pin">
								PIN Code
								<input
									type="text"
									inputMode="numeric"
									value={profilePin}
									onChange={(e) => {
										const nextValue = e.target.value
										if (/^\d*$/.test(nextValue)) {
											setProfilePin(nextValue)
										}
									}}
									pattern="^\d{6}$"
									title="Enter a 6 digit PIN code."
									maxLength={6}
									required
								/>
							</label>
							<label className="profile-field profile-field-pan">
								PAN Card
								<input
									type="text"
									value={profilePan}
									onChange={(e) => {
										const nextValue = e.target.value.toUpperCase()
										if (/^[A-Z0-9]*$/.test(nextValue)) {
											setProfilePan(nextValue)
										}
									}}
									pattern="^[A-Z]{5}[0-9]{4}[A-Z]$"
									title="Enter a valid PAN (e.g. ABCDE1234F)."
									maxLength={10}
									required
								/>
							</label>
							<label className="profile-field profile-field-photo">
								Passport size photograph
								<input
									type="file"
									accept="image/png, image/jpeg"
									required={!profilePhotoPreview}
									onChange={(e) => {
										const file = e.target.files?.[0] || null
										setProfilePhoto(file)
										if (file) {
											const reader = new FileReader()
											reader.onload = () =>
												setProfilePhotoPreview(reader.result?.toString() || '')
											reader.readAsDataURL(file)
										} else {
											setProfilePhotoPreview('')
										}
									}}
								/>
							</label>
							<button type="submit" disabled={profileLoading}>
								{profileLoading ? 'Saving...' : 'Save Profile'}
							</button>
						</form>
					)}
				</div>
			)
		}

		if (activePanel === 'state') {
			return (
				<div className="auth-card dashboard-card">
					<h1>Add State</h1>
					<p className="muted">Create a new state for the system.</p>
					{error ? <div className="error">{error}</div> : null}
					{success ? <div className="admin-success">{success}</div> : null}
					<form onSubmit={handleStateSubmit}>
						<label>
							State name
							<input
								type="text"
								value={stateName}
								onChange={(e) => {
									const nextValue = e.target.value
									if (/^[A-Za-z\s]*$/.test(nextValue)) {
										setStateName(nextValue)
									}
								}}
								pattern="^[A-Za-z\\s]+$"
								title="Only letters and spaces are allowed."
								required
							/>
						</label>
						<button type="submit">Add State</button>
					</form>
					<div className="admin-table-wrapper">
						<h2>State List</h2>
						<table className="role-table">
							<thead>
								<tr>
									<th>Name</th>
									<th className="table-actions-head">Actions</th>
								</tr>
							</thead>
							<tbody>
								{states.length === 0 ? (
									<tr>
										<td colSpan="2">No states found.</td>
									</tr>
								) : (
									states.map((state) => (
										<tr key={state.id}>
											<td>
												{stateEditId === state.id ? (
													<input
														type="text"
														value={stateEditName}
														onChange={(e) => {
															const nextValue = e.target.value
															if (/^[A-Za-z\s]*$/.test(nextValue)) {
																setStateEditName(nextValue)
															}
														}}
														pattern="^[A-Za-z\\s]+$"
														title="Only letters and spaces are allowed."
													/>
												) : (
													state.name
												)}
											</td>
											<td className="table-actions">
												{stateEditId === state.id ? (
													<>
														<button type="button" onClick={handleStateUpdate}>
															Save
														</button>
														<button
															type="button"
															className="secondary"
															onClick={() => {
																setStateEditId(null)
																setStateEditName('')
															}}
														>
															Cancel
														</button>
													</>
												) : (
													<>
														<button
															type="button"
															onClick={() => handleStateEdit(state)}
														>
															Update
														</button>
														<button
															type="button"
															className="secondary"
															onClick={() => handleStateDelete(state.id)}
														>
															Delete
														</button>
													</>
												)}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
						<div className="table-pagination">
							<button
								type="button"
								className="secondary"
								onClick={() => loadStates(statePage - 1)}
								disabled={statePage <= 1}
							>
								Previous
							</button>
							<span className="pagination-info">
								Page {statePage} of {stateTotalPages}
							</span>
							<button
								type="button"
								className="secondary"
								onClick={() => loadStates(statePage + 1)}
								disabled={statePage >= stateTotalPages}
							>
								Next
							</button>
						</div>
					</div>
				</div>
			)
		}

		if (activePanel === 'district') {
			return (
				<div className="auth-card dashboard-card">
					<h1>Add District</h1>
					<p className="muted">Create a new district and assign a state.</p>
					{error ? <div className="error">{error}</div> : null}
					{success ? <div className="admin-success">{success}</div> : null}
					<form
						onSubmit={async (e) => {
							e.preventDefault()
							setError('')
							setSuccess('')
							if (!districtStateId) {
								setError('Please select a state.')
								return
							}
							try {
								await csrf()
								await api.post('/api/districts', {
									name: districtName,
									state_id: districtStateId,
								})
								setDistrictName('')
								setDistrictStateId('')
								setSuccess('District added successfully.')
								setTimeout(() => setSuccess(''), 3000)
								await loadDistricts(districtPage)
							} catch (err) {
								setError(err?.response?.data?.message || 'Failed to add district')
							}
						}}
					>
						<label>
							State
							<select
								value={districtStateId}
								onChange={(e) => setDistrictStateId(e.target.value)}
								required
							>
								<option value="">---SELECT---</option>
								{states.map((state) => (
									<option key={state.id} value={state.id}>
										{state.name}
									</option>
								))}
							</select>
						</label>
						<label>
							District name
							<input
								type="text"
								value={districtName}
								onChange={(e) => {
									const nextValue = e.target.value
									if (/^[A-Za-z\s]*$/.test(nextValue)) {
										setDistrictName(nextValue)
									}
								}}
								pattern="^[A-Za-z\\s]+$"
								title="Only letters and spaces are allowed."
								required
							/>
						</label>
						<button type="submit">Add District</button>
					</form>
					<div className="admin-table-wrapper">
						<h2>District List</h2>
						<table className="admin-table office-table">
							<thead>
								<tr>
									<th>Name</th>
									<th>State</th>
									<th className="table-actions-head">Actions</th>
								</tr>
							</thead>
							<tbody>
								{districts.length === 0 ? (
									<tr>
										<td colSpan="3">No districts found.</td>
									</tr>
								) : (
									districts.map((district) => (
										<tr key={district.id}>
											<td>
												{districtEditId === district.id ? (
													<input
														type="text"
														value={districtEditName}
														onChange={(e) => {
															const nextValue = e.target.value
															if (/^[A-Za-z\\s]*$/.test(nextValue)) {
																setDistrictEditName(nextValue)
															}
														}}
														pattern="^[A-Za-z\\s]+$"
														title="Only letters and spaces are allowed."
													/>
												) : (
													district.name
												)}
											</td>
											<td>
												{districtEditId === district.id ? (
													<select
														value={districtEditStateId}
														onChange={(e) =>
															setDistrictEditStateId(e.target.value)
														}
													>
														<option value="">---SELECT---</option>
														{states.map((state) => (
															<option key={state.id} value={state.id}>
																{state.name}
															</option>
														))}
													</select>
												) : (
													district.state?.name || 'Unassigned'
												)}
											</td>
											<td className="table-actions">
												{districtEditId === district.id ? (
													<>
														<button
															type="button"
															onClick={async () => {
																setError('')
																setSuccess('')
																if (!districtEditStateId) {
																	setError('Please select a state.')
																	return
																}
																try {
																	await csrf()
																	await api.put(`/api/districts/${districtEditId}`, {
																		name: districtEditName,
																		state_id: districtEditStateId,
																	})
																	setDistrictEditId(null)
																	setDistrictEditName('')
																	setDistrictEditStateId('')
																	setSuccess('District updated successfully.')
																	await loadDistricts(districtPage)
																} catch (err) {
																	setError(
																		err?.response?.data?.message ||
																		'Failed to update district'
																	)
																}
															}}
														>
															Save
														</button>
														<button
															type="button"
															className="secondary"
															onClick={() => {
																setDistrictEditId(null)
																setDistrictEditName('')
																setDistrictEditStateId('')
															}}
														>
															Cancel
														</button>
													</>
												) : (
													<>
														<button
															type="button"
															onClick={() => {
																setDistrictEditId(district.id)
																setDistrictEditName(district.name)
																setDistrictEditStateId(
																	district.state_id ? String(district.state_id) : ''
																)
															}}
														>
															Update
														</button>
														<button
															type="button"
															className="secondary"
															onClick={async () => {
																setError('')
																setSuccess('')
																try {
																	await csrf()
																	await api.delete(`/api/districts/${district.id}`)
																	setSuccess('District deleted successfully.')
																	const nextPage =
																		districts.length === 1 && districtPage > 1
																			? districtPage - 1
																			: districtPage
																	await loadDistricts(nextPage)
																} catch (err) {
																	setError(
																		err?.response?.data?.message ||
																		'Failed to delete district'
																	)
																}
															}}
														>
															Delete
														</button>
													</>
												)}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
						<div className="table-pagination">
							<button
								type="button"
								className="secondary"
								onClick={() => loadDistricts(districtPage - 1)}
								disabled={districtPage <= 1}
							>
								Previous
							</button>
							<span className="pagination-info">
								Page {districtPage} of {districtTotalPages}
							</span>
							<button
								type="button"
								className="secondary"
								onClick={() => loadDistricts(districtPage + 1)}
								disabled={districtPage >= districtTotalPages}
							>
								Next
							</button>
						</div>
					</div>
				</div>
			)
		}

		if (activePanel === 'role') {
			return (
				<div className="auth-card dashboard-card">
					<h1>Add Role</h1>
					<p className="muted">Create a new role for the system.</p>
					{error ? <div className="error">{error}</div> : null}
					{success ? <div className="admin-success">{success}</div> : null}
					<form
						onSubmit={async (e) => {
							e.preventDefault()
							setError('')
							setSuccess('')
							try {
								await csrf()
								await api.post('/api/roles', { name: roleName })
								setRoleName('')
								setSuccess('Role added successfully.')
								setTimeout(() => setSuccess(''), 3000)
								await loadRoles(rolePage)
							} catch (err) {
								setError(err?.response?.data?.message || 'Failed to add role')
							}
						}}
					>
						<label>
							Role name
							<input
								type="text"
								value={roleName}
								onChange={(e) => setRoleName(e.target.value)}
								pattern="^[A-Za-z ]+$"
								title="Only letters and spaces are allowed."
								required
							/>
						</label>
						<button type="submit">Add Role</button>
					</form>
					<div className="admin-table-wrapper">
						<h2>Role List</h2>
						<table className="admin-table user-list-table">
							<thead>
								<tr>
									<th>Name</th>
									<th className="table-actions-head">Actions</th>
								</tr>
							</thead>
							<tbody>
								{roles.length === 0 ? (
									<tr>
										<td colSpan="2">No roles found.</td>
									</tr>
								) : (
									roles.map((role) => (
										<tr key={role.id}>
											<td>
												{roleEditId === role.id ? (
													<input
														type="text"
														value={roleEditName}
														onChange={(e) => setRoleEditName(e.target.value)}
														pattern="^[A-Za-z ]+$"
														title="Only letters and spaces are allowed."
													/>
												) : (
													role.name
												)}
											</td>
											<td className="table-actions">
												{roleEditId === role.id ? (
													<>
														<button
															type="button"
															onClick={async () => {
																setError('')
																setSuccess('')
																try {
																	await csrf()
																	await api.put(`/api/roles/${roleEditId}`, {
																		name: roleEditName,
																	})
																	setRoleEditId(null)
																	setRoleEditName('')
																	setSuccess('Role updated successfully.')
																	await loadRoles(rolePage)
																} catch (err) {
																	setError(
																		err?.response?.data?.message ||
																		'Failed to update role'
																	)
																}
															}}
														>
															Save
														</button>
														<button
															type="button"
															className="secondary"
															onClick={() => {
																setRoleEditId(null)
																setRoleEditName('')
															}}
														>
															Cancel
														</button>
													</>
												) : (
													<>
														<button
															type="button"
															onClick={() => {
																setRoleEditId(role.id)
																setRoleEditName(role.name)
															}}
														>
															Update
														</button>
														<button
															type="button"
															className="secondary"
															onClick={async () => {
																setError('')
																setSuccess('')
																try {
																	await csrf()
																	await api.delete(`/api/roles/${role.id}`)
																	setSuccess('Role deleted successfully.')
																	const nextPage =
																		roles.length === 1 && rolePage > 1
																			? rolePage - 1
																			: rolePage
																	await loadRoles(nextPage)
																} catch (err) {
																	setError(
																		err?.response?.data?.message ||
																		'Failed to delete role'
																	)
																}
															}}
														>
															Delete
														</button>
													</>
												)}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
						<div className="table-pagination">
							<button
								type="button"
								className="secondary"
								onClick={() => loadRoles(rolePage - 1)}
								disabled={rolePage <= 1}
							>
								Previous
							</button>
							<span className="pagination-info">
								Page {rolePage} of {roleTotalPages}
							</span>
							<button
								type="button"
								className="secondary"
								onClick={() => loadRoles(rolePage + 1)}
								disabled={rolePage >= roleTotalPages}
							>
								Next
							</button>
						</div>
					</div>
				</div>
			)
		}

		if (activePanel === 'designation') {
			return (
				<div className="auth-card dashboard-card">
					<h1>Add Designation</h1>
					<p className="muted">Create a new designation for the system.</p>
					{error ? <div className="error">{error}</div> : null}
					{success ? <div className="admin-success">{success}</div> : null}
					<form
						onSubmit={async (e) => {
							e.preventDefault()
							setError('')
							setSuccess('')
							try {
								await csrf()
								await api.post('/api/designations', { name: designationName })
								setDesignationName('')
								setSuccess('Designation added successfully.')
								setTimeout(() => setSuccess(''), 3000)
								await loadDesignations(designationPage)
							} catch (err) {
								setError(
									err?.response?.data?.message || 'Failed to add designation'
								)
							}
						}}
					>
						<label>
							Designation name
							<input
								type="text"
								value={designationName}
								onChange={(e) => setDesignationName(e.target.value)}
								pattern="^[A-Za-z ]+$"
								title="Only letters and spaces are allowed."
								required
							/>
						</label>
						<button type="submit">Add Designation</button>
					</form>
					<div className="admin-table-wrapper">
						<h2>Designation List</h2>
						<table className="admin-table">
							<thead>
								<tr>
									<th>Name</th>
									<th className="table-actions-head">Actions</th>
								</tr>
							</thead>
							<tbody>
								{designations.length === 0 ? (
									<tr>
										<td colSpan="2">No designations found.</td>
									</tr>
								) : (
									designations.map((designation) => (
										<tr key={designation.id}>
											<td>
												{designationEditId === designation.id ? (
													<input
														type="text"
														value={designationEditName}
														onChange={(e) =>
															setDesignationEditName(e.target.value)
														}
														pattern="^[A-Za-z ]+$"
														title="Only letters and spaces are allowed."
													/>
												) : (
													designation.name
												)}
											</td>
											<td className="table-actions">
												{designationEditId === designation.id ? (
													<>
														<button
															type="button"
															onClick={async () => {
																setError('')
																setSuccess('')
																try {
																	await csrf()
																	await api.put(
																		`/api/designations/${designationEditId}`,
																		{ name: designationEditName }
																	)
																	setDesignationEditId(null)
																	setDesignationEditName('')
																	setSuccess('Designation updated successfully.')
																	await loadDesignations(designationPage)
																} catch (err) {
																	setError(
																		err?.response?.data?.message ||
																		'Failed to update designation'
																	)
																}
															}}
														>
															Save
														</button>
														<button
															type="button"
															className="secondary"
															onClick={() => {
																setDesignationEditId(null)
																setDesignationEditName('')
															}}
														>
															Cancel
														</button>
													</>
												) : (
													<>
														<button
															type="button"
															onClick={() => {
																setDesignationEditId(designation.id)
																setDesignationEditName(designation.name)
															}}
														>
															Update
														</button>
														<button
															type="button"
															className="secondary"
															onClick={async () => {
																setError('')
																setSuccess('')
																try {
																	await csrf()
																	await api.delete(
																		`/api/designations/${designation.id}`
																	)
																	setSuccess('Designation deleted successfully.')
																	const nextPage =
																		designations.length === 1 &&
																			designationPage > 1
																			? designationPage - 1
																			: designationPage
																	await loadDesignations(nextPage)
																} catch (err) {
																	setError(
																		err?.response?.data?.message ||
																		'Failed to delete designation'
																	)
																}
															}}
														>
															Delete
														</button>
													</>
												)}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
						<div className="table-pagination">
							<button
								type="button"
								className="secondary"
								onClick={() => loadDesignations(designationPage - 1)}
								disabled={designationPage <= 1}
							>
								Previous
							</button>
							<span className="pagination-info">
								Page {designationPage} of {designationTotalPages}
							</span>
							<button
								type="button"
								className="secondary"
								onClick={() => loadDesignations(designationPage + 1)}
								disabled={designationPage >= designationTotalPages}
							>
								Next
							</button>
						</div>
					</div>
				</div>
			)
		}

		if (activePanel === 'user') {
			const filteredUsers = users.filter((createdUser) => {
				const roleName = String(createdUser.role || '').toLowerCase().trim()
				if (userListMode === 'tenant') {
					return roleName === 'tenant owner' || roleName === 'tenant_owner'
				}
				return roleName !== 'tenant owner' && roleName !== 'tenant_owner'
			})

			return (
				<div className="auth-card dashboard-card">
					<h1>{userListMode === 'tenant' ? 'User List' : 'Add User'}</h1>
					{userListMode !== 'tenant' ? (
						<>
							<p className="muted">
								Create a user. Default password is <strong>Test@123</strong>.
							</p>
							{error ? <div className="error">{error}</div> : null}
							{success ? <div className="admin-success">{success}</div> : null}
							<form
								onSubmit={async (e) => {
									e.preventDefault()
									setError('')
									setSuccess('')
									try {
										await csrf()
										await api.post('/api/users', {
											name: userName,
											email: userEmail,
											office_id: userOfficeId || null,
											designation_id: userDesignationId || null,
											phone: userPhone || null,
											role: userRole,
										})
										setSuccess('User created successfully.')
										setUserName('')
										setUserEmail('')
										setUserOfficeId('')
										setUserDesignationId('')
										setUserPhone('')
										setUserRole('')
										await loadUsers()
									} catch (err) {
										setError(err?.response?.data?.message || 'Failed to add user')
									}
								}}
							>
								<label>
									Name
									<input
										type="text"
										value={userName}
										onChange={(e) => setUserName(e.target.value)}
										required
									/>
								</label>
								<label>
									Email
									<input
										type="email"
										value={userEmail}
										onChange={(e) => setUserEmail(e.target.value)}
										required
									/>
								</label>
								<label>
									Office
									<select
										value={userOfficeId}
										onChange={(e) => setUserOfficeId(e.target.value)}
									>
										<option value="">---SELECT---</option>
										{userOffices.map((office) => (
											<option key={office.id} value={office.id}>
												{office.name}
											</option>
										))}
									</select>
								</label>
								<label>
									Designation
									<select
										value={userDesignationId}
										onChange={(e) => setUserDesignationId(e.target.value)}
									>
										<option value="">---SELECT---</option>
										{designations.map((designation) => (
											<option key={designation.id} value={designation.id}>
												{designation.name}
											</option>
										))}
									</select>
								</label>
								<label>
									Phone
									<input
										type="text"
										value={userPhone}
										onChange={(e) => setUserPhone(e.target.value)}
									/>
								</label>
								<label>
									Role
									<select
										value={userRole}
										onChange={(e) => setUserRole(e.target.value)}
										required
									>
										<option value="">---SELECT---</option>
										{userRoles
											.filter((role) => {
												const name = String(role.name || '').toLowerCase().trim()
												return name !== 'tenant owner' && name !== 'tenant_owner'
											})
											.map((role) => (
												<option key={role.id} value={role.name}>
													{role.name}
												</option>
											))}
									</select>
								</label>
								<button type="submit">Add User</button>
							</form>
						</>
					) : null}
					<div className="admin-table-wrapper">
						<h2>
							{userListMode === 'tenant' ? 'Tenant Owner List' : 'User List'}
						</h2>
						<table className="admin-table">
							<thead>
								<tr>
									<th>Name</th>
									<th>Email</th>
									<th>Status</th>
									<th className="table-actions-head">Actions</th>
								</tr>
							</thead>
							<tbody>
								{filteredUsers.length === 0 ? (
									<tr>
										<td colSpan="4">No users found.</td>
									</tr>
								) : (
									filteredUsers.map((createdUser) => (
										<tr key={createdUser.id}>
											<td>{createdUser.name}</td>
											<td>{createdUser.email}</td>
											<td>
												{userListMode === 'tenant'
													? createdUser.is_blocked
														? 'Blocked'
														: 'Approved'
													: createdUser.approved_at
														? 'Approved'
														: 'Pending'}
											</td>
											<td className="table-actions">
												<a className="nav-link table-action-link" href={`/users/${createdUser.id}`}>
													View
												</a>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			)
		}

		if (activePanel === 'office') {
			return (
				<div className="auth-card dashboard-card">
					<h1>Add Office</h1>
					<p className="muted">Create a new office with its location.</p>
					{error ? <div className="error">{error}</div> : null}
					{success ? <div className="admin-success">{success}</div> : null}
					<form
						onSubmit={async (e) => {
							e.preventDefault()
							setError('')
							setSuccess('')
							try {
								await csrf()
								await api.post('/api/offices', {
									state_id: officeStateId,
									district_id: officeDistrictId,
									name: officeName,
									address: officeAddress,
								})
								setSuccess('Office added successfully.')
								setTimeout(() => setSuccess(''), 3000)
								setOfficeStateId('')
								setOfficeDistrictId('')
								setOfficeName('')
								setOfficeAddress('')
								await loadOffices(officePage)
							} catch (err) {
								setError(err?.response?.data?.message || 'Failed to add office')
							}
						}}
					>
						<label>
							State
							<select
								value={officeStateId}
								onChange={(e) => {
									setOfficeStateId(e.target.value)
									setOfficeDistrictId('')
								}}
								required
							>
								<option value="">---SELECT---</option>
								{officeStates.map((state) => (
									<option key={state.id} value={state.id}>
										{state.name}
									</option>
								))}
							</select>
						</label>
						<label>
							District
							<select
								value={officeDistrictId}
								onChange={(e) => setOfficeDistrictId(e.target.value)}
								required
								disabled={!officeStateId}
							>
								<option value="">---SELECT---</option>
								{officeDistrictOptions.map((district) => (
									<option key={district.id} value={district.id}>
										{district.name}
									</option>
								))}
							</select>
						</label>
						<label>
							Office name
							<input
								type="text"
								value={officeName}
								onChange={(e) => setOfficeName(e.target.value)}
								required
							/>
						</label>
						<label>
							Address
							<input
								type="text"
								value={officeAddress}
								onChange={(e) => setOfficeAddress(e.target.value)}
								required
							/>
						</label>
						<button type="submit">Add Office</button>
					</form>
					<div className="admin-table-wrapper">
						<h2>Office List</h2>
						<table className="admin-table">
							<thead>
								<tr>
									<th>Office</th>
									<th>State</th>
									<th>District</th>
									<th>Address</th>
									<th className="table-actions-head">Actions</th>
								</tr>
							</thead>
							<tbody>
								{offices.length === 0 ? (
									<tr>
										<td colSpan="5">No offices found.</td>
									</tr>
								) : (
									offices.map((office) => (
										<tr key={office.id}>
											<td>
												{officeEditId === office.id ? (
													<input
														type="text"
														value={officeEditName}
														onChange={(e) => setOfficeEditName(e.target.value)}
													/>
												) : (
													office.name
												)}
											</td>
											<td>
												{officeEditId === office.id ? (
													<select
														value={officeEditStateId}
														onChange={(e) => {
															setOfficeEditStateId(e.target.value)
															setOfficeEditDistrictId('')
														}}
													>
														<option value="">---SELECT---</option>
														{officeStates.map((state) => (
															<option key={state.id} value={state.id}>
																{state.name}
															</option>
														))}
													</select>
												) : (
													office.state?.name || 'Unassigned'
												)}
											</td>
											<td>
												{officeEditId === office.id ? (
													<select
														value={officeEditDistrictId}
														onChange={(e) => setOfficeEditDistrictId(e.target.value)}
														disabled={!officeEditStateId}
													>
														<option value="">---SELECT---</option>
														{officeEditDistrictOptions.map((district) => (
															<option key={district.id} value={district.id}>
																{district.name}
															</option>
														))}
													</select>
												) : (
													office.district?.name || 'Unassigned'
												)}
											</td>
											<td>
												{officeEditId === office.id ? (
													<input
														type="text"
														value={officeEditAddress}
														onChange={(e) =>
															setOfficeEditAddress(e.target.value)
														}
													/>
												) : (
													office.address
												)}
											</td>
											<td className="table-actions">
												{officeEditId === office.id ? (
													<>
														<button
															type="button"
															onClick={async () => {
																setError('')
																setSuccess('')
																if (!officeEditStateId || !officeEditDistrictId) {
																	setError('Please select a state and district.')
																	return
																}
																try {
																	await csrf()
																	await api.put(`/api/offices/${officeEditId}`, {
																		name: officeEditName,
																		address: officeEditAddress,
																		state_id: officeEditStateId,
																		district_id: officeEditDistrictId,
																	})
																	setOfficeEditId(null)
																	setOfficeEditName('')
																	setOfficeEditAddress('')
																	setOfficeEditStateId('')
																	setOfficeEditDistrictId('')
																	setSuccess('Office updated successfully.')
																	await loadOffices(officePage)
																} catch (err) {
																	setError(
																		err?.response?.data?.message ||
																		'Failed to update office'
																	)
																}
															}}
														>
															Save
														</button>
														<button
															type="button"
															className="secondary"
															onClick={() => {
																setOfficeEditId(null)
																setOfficeEditName('')
																setOfficeEditAddress('')
																setOfficeEditStateId('')
																setOfficeEditDistrictId('')
															}}
														>
															Cancel
														</button>
													</>
												) : (
													<>
														<button
															type="button"
															onClick={() => {
																setOfficeEditId(office.id)
																setOfficeEditName(office.name)
																setOfficeEditAddress(office.address || '')
																setOfficeEditStateId(
																	office.state_id ? String(office.state_id) : ''
																)
																setOfficeEditDistrictId(
																	office.district_id ? String(office.district_id) : ''
																)
															}}
														>
															Update
														</button>
														<button
															type="button"
															className="secondary"
															onClick={async () => {
																setError('')
																setSuccess('')
																try {
																	await csrf()
																	await api.delete(`/api/offices/${office.id}`)
																	setSuccess('Office deleted successfully.')
																	const nextPage =
																		offices.length === 1 && officePage > 1
																			? officePage - 1
																			: officePage
																	await loadOffices(nextPage)
																} catch (err) {
																	setError(
																		err?.response?.data?.message ||
																		'Failed to delete office'
																	)
																}
															}}
														>
															Delete
														</button>
													</>
												)}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
						<div className="table-pagination">
							<button
								type="button"
								className="secondary"
								onClick={() => loadOffices(officePage - 1)}
								disabled={officePage <= 1}
							>
								Previous
							</button>
							<span className="pagination-info">
								Page {officePage} of {officeTotalPages}
							</span>
							<button
								type="button"
								className="secondary"
								onClick={() => loadOffices(officePage + 1)}
								disabled={officePage >= officeTotalPages}
							>
								Next
							</button>
						</div>
					</div>
				</div>
			)
		}

		if (activePanel === 'user-activity-log') {
			return (
				<div className="auth-card dashboard-card">
					<h1>User Activity Log</h1>
					<p className="muted">Review recent user actions and sign-ins.</p>
					<div className="admin-table-wrapper">
						<h2>Filters</h2>
						<div className="nav-actions filter-actions">
							<label>
								User
								<input
									type="text"
									value={activityUserQuery}
									onChange={(e) => setActivityUserQuery(e.target.value)}
									placeholder="Search by name or email"
									list="activity-user-suggestions"
								/>
								<datalist id="activity-user-suggestions">
									{activityUsers
										.filter((activityUser) => {
											const query = activityUserQuery.trim().toLowerCase()
											if (!query) return false
											const name = String(activityUser.name || '').toLowerCase()
											const email = String(activityUser.email || '').toLowerCase()
											return name.includes(query) || email.includes(query)
										})
										.slice(0, 10)
										.map((activityUser) => (
											<option
												key={activityUser.id}
												value={`${activityUser.name} (${activityUser.email})`}
											/>
										))}
								</datalist>
							</label>
							<label>
								From
								<input
									type="date"
									onClick={(e) => e.target.showPicker && e.target.showPicker()}
									value={activityFrom}
									onChange={(e) => setActivityFrom(e.target.value)}
								/>
							</label>
							<label>
								To
								<input
									type="date"
									onClick={(e) => e.target.showPicker && e.target.showPicker()}
									value={activityTo}
									onChange={(e) => setActivityTo(e.target.value)}
								/>
							</label>
							<div className="nav-actions filter-actions">
								<button
									type="button"
									onClick={() => {
										const query = activityUserQuery.trim().toLowerCase()
										if (!query) {
											setActivityUserId('')
											loadActivityLogs(1)
											return
										}
										const match = activityUsers.find((activityUser) => {
											const name = String(activityUser.name || '').toLowerCase()
											const email = String(activityUser.email || '').toLowerCase()
											const id = String(activityUser.id || '').toLowerCase()
											const label = `${activityUser.name} (${activityUser.email})`.toLowerCase()
											return (
												name === query ||
												email === query ||
												id === query ||
												label === query
											)
										})
										setActivityUserId(match ? String(match.id) : '')
										loadActivityLogs(1)
									}}
								>
									Apply
								</button>
								<button
									type="button"
									className="secondary"
									onClick={() => {
										setActivityUserId('')
										setActivityUserQuery('')
										setActivityFrom('')
										setActivityTo('')
										loadActivityLogs(1)
									}}
								>
									Clear
								</button>
							</div>
						</div>
					</div>
					<div className="admin-table-wrapper">
						<h2>Activity</h2>
						<table className="admin-table">
							<thead>
								<tr>
									<th>User</th>
									<th>Action</th>
									<th>IP</th>
									<th>Logged at</th>
								</tr>
							</thead>
							<tbody>
								{activityLogs.length === 0 ? (
									<tr>
										<td colSpan="4">No activity records yet.</td>
									</tr>
								) : (
									activityLogs.map((log) => (
										<tr key={log.id}>
											<td>{log.user?.name || 'Unknown'}</td>
											<td>{log.action}</td>
											<td>{log.ip_address || '-'}</td>
											<td>
												{log.logged_at
													? new Date(log.logged_at).toLocaleString()
													: '-'}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
						<div className="table-pagination">
							<button
								type="button"
								className="secondary"
								onClick={() => loadActivityLogs(activityPage - 1)}
								disabled={activityPage <= 1}
							>
								Previous
							</button>
							<span className="pagination-info">
								Page {activityPage} of {activityTotalPages}
							</span>
							<button
								type="button"
								className="secondary"
								onClick={() => loadActivityLogs(activityPage + 1)}
								disabled={activityPage >= activityTotalPages}
							>
								Next
							</button>
						</div>
					</div>
				</div>
			)
		}

		if (activePanel === 'status') {
			return (
				<div className="auth-card dashboard-card">
					<h1>Application Status</h1>
					<p className="muted">Track your tenancy certificate applications.</p>
					{error ? <div className="error">{error}</div> : null}
					{statusLoading ? <div className="muted">Loading...</div> : null}
					{statusApplications.length === 0 && !statusLoading ? (
						<div className="muted">No applications found.</div>
					) : (
						<div className="admin-table-wrapper">
							<table className="admin-table status-table">
								<thead>
									<tr>
										<th>Application No</th>
										<th>Application Type</th>
										<th>Application Date</th>
										<th>Status</th>
										<th className="table-actions-head">Actions</th>
									</tr>
								</thead>
								<tbody>
									{statusApplications.map((app) => (
										<tr key={app.id}>
											<td>{app.application_no}</td>
											<td>{app.application_type || 'Tenancy Certificate'}</td>
											<td>
												{app.created_at
													? new Date(app.created_at).toLocaleDateString()
													: '-'}
											</td>
											<td>
												{formatTenancyApplicationStatus(
													app.status,
													app.application_type || 'Tenancy Certificate'
												)}
											</td>
											<td className="table-actions">
												<button
													type="button"
													onClick={() => {
														setActivePanel('status-view')
														loadStatusApplication(app.id)
													}}
												>
													View
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
							<div className="table-pagination">
								<button
									type="button"
									className="secondary"
									onClick={() => loadStatusApplications(statusPage - 1)}
									disabled={statusPage <= 1}
								>
									Previous
								</button>
								<span className="pagination-info">
									Page {statusPage} of {statusTotalPages}
								</span>
								<button
									type="button"
									className="secondary"
									onClick={() => loadStatusApplications(statusPage + 1)}
									disabled={statusPage >= statusTotalPages}
								>
									Next
								</button>
							</div>
						</div>
					)}
				</div>
			)
		}

		if (activePanel === 'status-view') {
			const application = statusViewApplication
			const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
			const tenantPhotoUrl =
				application?.tenant_photo_path
					? `${baseUrl}/storage/${application.tenant_photo_path}`
					: ''
			const isReverted =
				application?.status &&
				String(application.status).toLowerCase() === 'reverted'
			const normalizedApplicationStatus = String(application?.status || '')
				.trim()
				.toLowerCase()
			const isSubmittedState =
				normalizedApplicationStatus === 'submitted' ||
				normalizedApplicationStatus === 'submiited' ||
				normalizedApplicationStatus === 'under process'
			const statusDisplayText = isSubmittedState
				? `Submitted by user at ${formatDateTime(application?.created_at)
				}`
				: formatTenancyApplicationStatus(
					application?.status,
					application?.application_type || 'Tenancy Certificate'
				)

			return (
				<div className="auth-card dashboard-card">
					<h1>Application Details</h1>
					<p className="muted">Review your submitted application.</p>
					{error ? <div className="error">{error}</div> : null}
					{statusViewLoading ? <div className="muted">Loading...</div> : null}
					{!application && !statusViewLoading ? (
						<div className="muted">No application data.</div>
					) : application ? (
						<div className="tenancy-preview-section">
							<div className="tenancy-preview-grid">
								<div>
									<span className="label-text">Application No</span>
									<span>{application.application_no}</span>
								</div>
								<div>
									<span className="label-text">Office Applied To</span>
									<span>{application.office?.name || '-'}</span>
								</div>
								<div>
									<span className="label-text">Status</span>
									<span>{statusDisplayText}</span>
								</div>
								<div>
									<span className="label-text">Currently With</span>
									<span>{application.current_with || '-'}</span>
								</div>
								<div>
									<span className="label-text">Applied On</span>
									<span>{formatDateTime(application.created_at)}</span>
								</div>
								<div>
									<span className="label-text">Acknowledgement Generated At</span>
									<span>{formatDateTime(application.created_at)}</span>
								</div>
							</div>
							<div className="form-actions">
								<button
									type="button"
									onClick={() => {
										setActivePanel('status')
										loadStatusApplications()
									}}
								>
									Back to Status
								</button>
								{application?.id ? (
									<button
										type="button"
										className="secondary"
										onClick={() => {
											window.open(
												`${baseUrl}/api/tenancy-applications/${application.id}/receipt?format=pdf&download=1`,
												'_blank'
											)
										}}
									>
										Download Acknowledgement
									</button>
								) : null}
								{application?.id ? (
									<button
										type="button"
										className="secondary"
										onClick={() => {
											window.open(
												`${baseUrl}/api/tenancy-applications/${application.id}/application-details?format=pdf&download=1`,
												'_blank'
											)
										}}
									>
										Download Application
									</button>
								) : null}
								{isReverted ? (
									<button
										type="button"
										onClick={() => startEditApplication(application)}
									>
										Edit Application
									</button>
								) : null}
							</div>
						</div>
					) : null}
				</div>
			)
		}

		if (activePanel === 'tenancy-certificate') {
			const applyType = (() => {
				if (!tenancyRegistrationDate) return ''
				const regDate = new Date(tenancyRegistrationDate)
				if (Number.isNaN(regDate.getTime())) return ''
				const now = new Date()
				const monthsDiff =
					(now.getFullYear() - regDate.getFullYear()) * 12 +
					(now.getMonth() - regDate.getMonth())
				if (monthsDiff <= 2) return 'Joint'
				if (monthsDiff <= 3) return 'Individual'
				return ''
			})()
			const registrationTooOld = (() => {
				if (!tenancyRegistrationDate) return false
				const regDate = new Date(tenancyRegistrationDate)
				if (Number.isNaN(regDate.getTime())) return false
				const now = new Date()
				const monthsDiff =
					(now.getFullYear() - regDate.getFullYear()) * 12 +
					(now.getMonth() - regDate.getMonth())
				return monthsDiff > 3
			})()
			const landlordPrefilled = profileType === 'landlord'
			const tenantPrefilled = profileType === 'tenant'
			const formLocked = Boolean(tenancyReceipt)

			const submitTenancyApplication = async () => {
				setError('')
				setSuccess('')
				setTenancySubmitting(true)
				try {
					await csrf()
					const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
					const storagePathFromUrl = (url) => {
						if (!url) return ''
						const prefix = `${baseUrl}/storage/`
						if (url.startsWith(prefix)) {
							return url.slice(prefix.length)
						}
						return url
					}
					const formData = new FormData()
					formData.append('registration_date', tenancyRegistrationDate)
					formData.append('office_id', tenancyOfficeId || '')
					formData.append('apply_type', applyType)
					formData.append('landlord_name', landlordName)
					formData.append('landlord_address', landlordAddress)
					formData.append('landlord_email', landlordEmail)
					formData.append('landlord_phone', landlordPhone)
					formData.append('landlord_pan', landlordPan)
					formData.append('manager_name', managerName)
					formData.append('manager_address', managerAddress)
					formData.append('manager_email', managerEmail)
					formData.append('manager_phone', managerPhone)
					formData.append('manager_pan', managerPan)
					formData.append('tenant_name', tenantName)
					formData.append('tenant_address', tenantAddress)
					formData.append('tenant_email', tenantEmail)
					formData.append('tenant_phone', tenantPhone)
					formData.append('tenant_pan', tenantPan)
					formData.append('tenant_previous_tenancy', tenantPreviousTenancy)
					formData.append('property_possession_date', propertyPossessionDate)
					formData.append('property_rent_payable', propertyRentPayable)
					formData.append(
						'property_premises_description',
						propertyPremisesDescription
					)
					formData.append(
						'property_furniture_description',
						propertyFurnitureDescription
					)
					formData.append('property_charge_electricity', propertyChargeElectricity)
					formData.append('property_charge_water', propertyChargeWater)
					formData.append('property_charge_furnishing', propertyChargeFurnishing)
					formData.append(
						'property_charge_other_services',
						propertyChargeOtherServices
					)
					formData.append('property_tenancy_duration', propertyTenancyDuration)
					if (agreementFile) {
						formData.append('agreement_pdf', agreementFile)
					}
					if (landlordPhotoFile) {
						formData.append('landlord_photo', landlordPhotoFile)
					} else if (landlordPhotoPreview) {
						formData.append(
							'landlord_photo_path',
							storagePathFromUrl(landlordPhotoPreview)
						)
					}
					if (landlordSignatureFile) {
						formData.append('landlord_signature', landlordSignatureFile)
					}
					if (tenantPhotoFile) {
						formData.append('tenant_photo', tenantPhotoFile)
					} else if (tenantPhotoPreview) {
						formData.append(
							'tenant_photo_path',
							storagePathFromUrl(tenantPhotoPreview)
						)
					}
					if (tenantSignatureFile) {
						formData.append('tenant_signature', tenantSignatureFile)
					}
					const endpoint = editingApplicationId
						? `/api/tenancy-applications/${editingApplicationId}`
						: '/api/tenancy-applications'
					if (editingApplicationId) {
						formData.append('_method', 'PUT')
					}
					const { data } = await api.request({
						url: endpoint,
						method: 'post',
						data: formData,
						headers: { 'Content-Type': 'multipart/form-data' },
					})
					setTenancyReceipt(data)
					setEditingApplicationId(null)
					setSuccess('Application submitted successfully.')
				} catch (err) {
					setError(err?.response?.data?.message || 'Failed to submit application')
				} finally {
					setTenancySubmitting(false)
				}
			}

			const tenancySteps = [
				{ id: 1, label: 'Registration And Applying Office Details' },
				{ id: 2, label: 'Tenancy Details' },
				{ id: 3, label: 'Property Details' },
				{ id: 4, label: 'Uploads' },
				{ id: 5, label: 'Preview' },
				{ id: 6, label: 'Finish' },
			]

			return (
				<div className="auth-card dashboard-card">
					<h1>Apply for Tenancy Certificate</h1>
					<p className="muted">Start a new tenancy certificate application.</p>
					{error ? <div className="error">{error}</div> : null}
					<div className="tenancy-steps">
						{tenancySteps.map((step, index) => {
							const isActive = tenancyStep === step.id
							const isDone = tenancyStep > step.id
							return (
								<div
									key={step.id}
									className={`tenancy-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''
										}`}
								>
									<div className="tenancy-step-icon" aria-hidden="true">
										{step.id}
									</div>
									<span className="tenancy-step-label">{step.label}</span>
									{index < tenancySteps.length - 1 ? (
										<span className="tenancy-step-line" aria-hidden="true" />
									) : null}
								</div>
							)
						})}
					</div>
					<form
						className="tenancy-form"
						onSubmit={(e) => {
							e.preventDefault()
							if (tenancyStep === 1 && registrationTooOld) {
								return
							}
							if (tenancyStep === 2) {
								if (!managerName.trim()) setManagerName('NA')
								if (!managerAddress.trim()) setManagerAddress('NA')
								if (!managerEmail.trim()) setManagerEmail('noemail@noemail.com')
								if (!managerPhone.trim()) setManagerPhone('NA')
								if (!managerPan.trim()) setManagerPan('NA')
							}
							if (tenancyStep < 6) {
								setTenancyStep((prev) => prev + 1)
								return
							}
							if (!tenancyReceipt) {
								submitTenancyApplication()
							}
						}}
					>
						{tenancyStep === 1 ? (
							<>
								<label>
									<span className="label-text required">
										Date of registration
									</span>
									<input
										type="date"
										onClick={(e) => !formLocked && e.target.showPicker && e.target.showPicker()}
										value={tenancyRegistrationDate}
										onChange={(e) => setTenancyRegistrationDate(e.target.value)}
										disabled={formLocked}
										required
									/>
									{registrationTooOld ? (
										<span className="error">
											Registration date is more than 3 months. You cannot
											proceed.
										</span>
									) : null}
								</label>
								<label>
									<span className="label-text required">Applying office</span>
									<select
										value={tenancyOfficeId}
										onChange={(e) => setTenancyOfficeId(e.target.value)}
										disabled={formLocked}
										required
									>
										<option value="">---SELECT---</option>
										{tenancyOffices.map((office) => {
											const label =
												office.name ||
												office.office_name ||
												office.title ||
												`Office #${office.id}`
											return (
												<option key={office.id} value={office.id}>
													{label}
												</option>
											)
										})}
									</select>
									{tenancyOfficesLoading ? (
										<span className="muted">Loading offices...</span>
									) : null}
								</label>
								<label>
									Apply type
									<input type="text" value={applyType} readOnly />
								</label>
							</>
						) : null}
						{tenancyStep === 2 ? (
							<>
								<fieldset className="tenancy-fieldset">
									<legend className="tenancy-legend-italic">
										Landlord Details
									</legend>
									<label className="tenancy-field-full">
										<span className="label-text required">
											Name of Landlord
										</span>
										<input
											type="text"
											value={landlordName}
											onChange={(e) => setLandlordName(e.target.value)}
											readOnly={landlordPrefilled || formLocked}
											required
										/>
									</label>
									<label className="tenancy-field-full">
										<span className="label-text required">Address</span>
										<textarea
											value={landlordAddress}
											onChange={(e) => setLandlordAddress(e.target.value)}
											readOnly={landlordPrefilled || formLocked}
											required
										/>
									</label>
									<label>
										<span className="label-text required">Email</span>
										<input
											type="email"
											value={landlordEmail}
											onChange={(e) => setLandlordEmail(e.target.value)}
											readOnly={landlordPrefilled || formLocked}
											required
										/>
									</label>
									<label>
										<span className="label-text required">Phone</span>
										<input
											type="tel"
											value={landlordPhone}
											onChange={(e) => setLandlordPhone(e.target.value)}
											readOnly={landlordPrefilled || formLocked}
											required
										/>
									</label>
									<label>
										<span className="label-text required">PAN No</span>
										<input
											type="text"
											value={landlordPan}
											onChange={(e) =>
												setLandlordPan(e.target.value.toUpperCase())
											}
											readOnly={landlordPrefilled || formLocked}
											required
										/>
									</label>
								</fieldset>
								<hr className="form-divider" />
								<fieldset className="tenancy-fieldset">
									<legend className="tenancy-legend-spaced">
										Property Manager Details
									</legend>
									<label className="tenancy-field-full">
										Name of Property Manager
										<input
											type="text"
											value={managerName}
											onChange={(e) => setManagerName(e.target.value)}
											readOnly={formLocked}
										/>
									</label>
									<label className="tenancy-field-full">
										Address
										<textarea
											value={managerAddress}
											onChange={(e) => setManagerAddress(e.target.value)}
											readOnly={formLocked}
										/>
									</label>
									<label>
										Email
										<input
											type="email"
											value={managerEmail}
											onChange={(e) => setManagerEmail(e.target.value)}
											readOnly={formLocked}
										/>
									</label>
									<label>
										Phone
										<input
											type="tel"
											value={managerPhone}
											onChange={(e) => setManagerPhone(e.target.value)}
											readOnly={formLocked}
										/>
									</label>
									<label>
										PAN
										<input
											type="text"
											value={managerPan}
											onChange={(e) =>
												setManagerPan(e.target.value.toUpperCase())
											}
											readOnly={formLocked}
										/>
									</label>
								</fieldset>
								<hr className="form-divider" />
								<fieldset className="tenancy-fieldset">
									<legend className="tenancy-legend-spaced">Tenant Details</legend>
									<label className="tenancy-field-full">
										<span className="label-text required">Name of Tenant</span>
										<input
											type="text"
											value={tenantName}
											onChange={(e) => setTenantName(e.target.value)}
											readOnly={tenantPrefilled || formLocked}
											required
										/>
									</label>
									<label className="tenancy-field-full">
										<span className="label-text required">Address</span>
										<textarea
											value={tenantAddress}
											onChange={(e) => setTenantAddress(e.target.value)}
											readOnly={tenantPrefilled || formLocked}
											required
										/>
									</label>
									<label>
										<span className="label-text required">Email</span>
										<input
											type="email"
											value={tenantEmail}
											onChange={(e) => setTenantEmail(e.target.value)}
											readOnly={tenantPrefilled || formLocked}
											required
										/>
									</label>
									<label>
										<span className="label-text required">Phone</span>
										<input
											type="tel"
											value={tenantPhone}
											onChange={(e) => setTenantPhone(e.target.value)}
											readOnly={tenantPrefilled || formLocked}
											required
										/>
									</label>
									<label>
										<span className="label-text required">PAN</span>
										<input
											type="text"
											value={tenantPan}
											onChange={(e) =>
												setTenantPan(e.target.value.toUpperCase())
											}
											readOnly={tenantPrefilled || formLocked}
											required
										/>
									</label>
									<label className="tenancy-field-full">
										Description of previous Tenancy
										<textarea
											value={tenantPreviousTenancy}
											onChange={(e) => setTenantPreviousTenancy(e.target.value)}
											readOnly={formLocked}
										/>
									</label>
								</fieldset>
							</>
						) : null}
						{tenancyStep === 3 ? (
							<>
								<fieldset className="tenancy-fieldset">
									<legend>Property Details</legend>
									<label>
										<span className="label-text required">
											Date of possession by Tenant
										</span>
										<input
											type="date"
											onClick={(e) => !formLocked && e.target.showPicker && e.target.showPicker()}
											value={propertyPossessionDate}
											onChange={(e) => setPropertyPossessionDate(e.target.value)}
											disabled={formLocked}
											required
										/>
									</label>
									<label>
										<span className="label-text required">
											Rent Payable (in Rupees)
										</span>
										<input
											type="number"
											min="0"
											value={propertyRentPayable}
											onChange={(e) => setPropertyRentPayable(e.target.value)}
											readOnly={formLocked}
											required
										/>
									</label>
									<label className="tenancy-field-full">
										<span className="label-text required">
											Description of premises let to Tenant Including Appurtenant
											Land if any
										</span>
										<textarea
											value={propertyPremisesDescription}
											onChange={(e) =>
												setPropertyPremisesDescription(e.target.value)
											}
											readOnly={formLocked}
											required
										/>
									</label>
									<label className="tenancy-field-full">
										Description of Furniture and other equipment provided to
										the Tenant
										<textarea
											value={propertyFurnitureDescription}
											onChange={(e) =>
												setPropertyFurnitureDescription(e.target.value)
											}
											readOnly={formLocked}
										/>
									</label>
									<label className="tenancy-field-full">
										Other Charges Payable
									</label>
									<label>
										A) Electricity
										<input
											type="text"
											value={propertyChargeElectricity}
											onChange={(e) =>
												setPropertyChargeElectricity(e.target.value)
											}
											readOnly={formLocked}
										/>
									</label>
									<label>
										B) Water
										<input
											type="text"
											value={propertyChargeWater}
											onChange={(e) => setPropertyChargeWater(e.target.value)}
											readOnly={formLocked}
										/>
									</label>
									<label>
										C) Extra Furnishing, fittings and fixtures
										<input
											type="text"
											value={propertyChargeFurnishing}
											onChange={(e) =>
												setPropertyChargeFurnishing(e.target.value)
											}
											readOnly={formLocked}
										/>
									</label>
									<label>
										D) Other Services
										<input
											type="text"
											value={propertyChargeOtherServices}
											onChange={(e) =>
												setPropertyChargeOtherServices(e.target.value)
											}
											readOnly={formLocked}
										/>
									</label>
									<label>
										<span className="label-text required">
											Duration of Tenancy
										</span>
										<input
											type="text"
											value={propertyTenancyDuration}
											onChange={(e) =>
												setPropertyTenancyDuration(e.target.value)
											}
											readOnly={formLocked}
											required
										/>
									</label>
								</fieldset>
							</>
						) : null}
						{tenancyStep === 4 ? (
							<>
								<fieldset className="tenancy-fieldset">
									<legend>Uploads</legend>
									<label className="tenancy-field-full">
										Upload Rent/Lease/Tenancy Agreement (PDF only)
										<input
											type="file"
											accept="application/pdf"
											disabled={formLocked}
											onChange={(e) =>
												setAgreementFile(e.target.files?.[0] || null)
											}
										/>
										{agreementPreviewUrl ? (
											<a
												href={agreementPreviewUrl}
												target="_blank"
												rel="noreferrer"
											>
												View Uploaded Agreement
											</a>
										) : null}
									</label>
									<label>
										Upload photograph of Landlord
										<input
											type="file"
											accept="image/*"
											disabled={
												formLocked ||
												(profileType === 'landlord' && !!landlordPhotoPreview)
											}
											onChange={(e) => {
												const file = e.target.files?.[0] || null
												setLandlordPhotoFile(file)
												setLandlordPhotoPreview(
													file ? URL.createObjectURL(file) : ''
												)
											}}
										/>
										{landlordPhotoPreview ? (
											<img
												src={landlordPhotoPreview}
												alt="Landlord"
												className="profile-photo-preview"
											/>
										) : null}
									</label>
									<label>
										Upload Signature of Landlord
										<input
											type="file"
											accept="image/*"
											disabled={formLocked}
											onChange={(e) => {
												const file = e.target.files?.[0] || null
												setLandlordSignatureFile(file)
												setLandlordSignaturePreview(
													file ? URL.createObjectURL(file) : ''
												)
											}}
										/>
										{landlordSignaturePreview ? (
											<img
												src={landlordSignaturePreview}
												alt="Landlord signature"
												className="signature-preview"
											/>
										) : null}
									</label>
									<label>
										Upload photograph of Tenant
										<input
											type="file"
											accept="image/*"
											disabled={
												formLocked ||
												(profileType === 'tenant' && !!tenantPhotoPreview)
											}
											onChange={(e) => {
												const file = e.target.files?.[0] || null
												setTenantPhotoFile(file)
												setTenantPhotoPreview(
													file ? URL.createObjectURL(file) : ''
												)
											}}
										/>
										{tenantPhotoPreview ? (
											<img
												src={tenantPhotoPreview}
												alt="Tenant"
												className="profile-photo-preview"
											/>
										) : null}
									</label>
									<label>
										Upload Signature of Tenant
										<input
											type="file"
											accept="image/*"
											disabled={formLocked}
											onChange={(e) => {
												const file = e.target.files?.[0] || null
												setTenantSignatureFile(file)
												setTenantSignaturePreview(
													file ? URL.createObjectURL(file) : ''
												)
											}}
										/>
										{tenantSignaturePreview ? (
											<img
												src={tenantSignaturePreview}
												alt="Tenant signature"
												className="signature-preview"
											/>
										) : null}
									</label>
								</fieldset>
							</>
						) : null}
						{tenancyStep === 5 ? (
							<>
								<div className="tenancy-preview">
									<h2>Preview</h2>
									<div className="tenancy-preview-section">
										<h3>Registration</h3>
										<div className="tenancy-preview-grid">
											<div>
												<span className="label-text">Date of registration</span>
												<span>{tenancyRegistrationDate || '-'}</span>
											</div>
											<div>
												<span className="label-text">Applying office</span>
												<span>
													{tenancyOffices.find(
														(office) => String(office.id) === String(tenancyOfficeId)
													)?.name || '-'}
												</span>
											</div>
											<div>
												<span className="label-text">Apply type</span>
												<span>{applyType || '-'}</span>
											</div>
										</div>
									</div>

									<div className="tenancy-preview-section">
										<h3>Landlord Details</h3>
										<div className="tenancy-preview-grid">
											<div>
												<span className="label-text">Name</span>
												<span>{landlordName || '-'}</span>
											</div>
											<div>
												<span className="label-text">Address</span>
												<span>{landlordAddress || '-'}</span>
											</div>
											<div>
												<span className="label-text">Email</span>
												<span>{landlordEmail || '-'}</span>
											</div>
											<div>
												<span className="label-text">Phone</span>
												<span>{landlordPhone || '-'}</span>
											</div>
											<div>
												<span className="label-text">PAN No</span>
												<span>{landlordPan || '-'}</span>
											</div>
										</div>
									</div>

									<div className="tenancy-preview-section">
										<h3>Property Manager Details</h3>
										<div className="tenancy-preview-grid">
											<div>
												<span className="label-text">Name</span>
												<span>{managerName || '-'}</span>
											</div>
											<div>
												<span className="label-text">Address</span>
												<span>{managerAddress || '-'}</span>
											</div>
											<div>
												<span className="label-text">Email</span>
												<span>{managerEmail || '-'}</span>
											</div>
											<div>
												<span className="label-text">Phone</span>
												<span>{managerPhone || '-'}</span>
											</div>
											<div>
												<span className="label-text">PAN</span>
												<span>{managerPan || '-'}</span>
											</div>
										</div>
									</div>

									<div className="tenancy-preview-section">
										<h3>Tenant Details</h3>
										<div className="tenancy-preview-grid">
											<div>
												<span className="label-text">Name</span>
												<span>{tenantName || '-'}</span>
											</div>
											<div>
												<span className="label-text">Address</span>
												<span>{tenantAddress || '-'}</span>
											</div>
											<div>
												<span className="label-text">Email</span>
												<span>{tenantEmail || '-'}</span>
											</div>
											<div>
												<span className="label-text">Phone</span>
												<span>{tenantPhone || '-'}</span>
											</div>
											<div>
												<span className="label-text">PAN</span>
												<span>{tenantPan || '-'}</span>
											</div>
											<div>
												<span className="label-text">
													Description of previous Tenancy
												</span>
												<span>{tenantPreviousTenancy || '-'}</span>
											</div>
										</div>
									</div>

									<div className="tenancy-preview-section">
										<h3>Property Details</h3>
										<div className="tenancy-preview-grid">
											<div>
												<span className="label-text">
													Date of possession by Tenant
												</span>
												<span>{propertyPossessionDate || '-'}</span>
											</div>
											<div>
												<span className="label-text">Rent Payable</span>
												<span>{propertyRentPayable || '-'}</span>
											</div>
											<div>
												<span className="label-text">
													Description of premises let to Tenant Including Appurtenant
													Land if any
												</span>
												<span>{propertyPremisesDescription || '-'}</span>
											</div>
											<div>
												<span className="label-text">
													Description of Furniture and other equipment provided
												</span>
												<span>{propertyFurnitureDescription || '-'}</span>
											</div>
											<div>
												<span className="label-text">
													Other Charges - Electricity
												</span>
												<span>{propertyChargeElectricity || '-'}</span>
											</div>
											<div>
												<span className="label-text">Other Charges - Water</span>
												<span>{propertyChargeWater || '-'}</span>
											</div>
											<div>
												<span className="label-text">
													Other Charges - Extra Furnishing, fittings and fixtures
												</span>
												<span>{propertyChargeFurnishing || '-'}</span>
											</div>
											<div>
												<span className="label-text">
													Other Charges - Other Services
												</span>
												<span>{propertyChargeOtherServices || '-'}</span>
											</div>
											<div>
												<span className="label-text">Duration of Tenancy</span>
												<span>{propertyTenancyDuration || '-'}</span>
											</div>
										</div>
									</div>

									<div className="tenancy-preview-section">
										<h3>Uploads</h3>
										<div className="tenancy-preview-grid">
											<div>
												<span className="label-text">
													Agreement (PDF)
												</span>
												{agreementPreviewUrl ? (
													<a
														href={agreementPreviewUrl}
														target="_blank"
														rel="noreferrer"
													>
														{agreementFile?.name || 'View Agreement'}
													</a>
												) : (
													<span>{agreementFile?.name || '-'}</span>
												)}
											</div>
											<div className="preview-media">
												<span className="label-text">Landlord Photo</span>
												{landlordPhotoPreview ? (
													<img
														src={landlordPhotoPreview}
														alt="Landlord"
														className="profile-photo-preview"
													/>
												) : (
													<span>
														{landlordPhotoFile?.name ||
															(landlordPhotoPreview ? 'Prefilled' : '-')}
													</span>
												)}
											</div>
											<div className="preview-media preview-media-left">
												<span className="label-text">Landlord Signature</span>
												{landlordSignaturePreview ? (
													<img
														src={landlordSignaturePreview}
														alt="Landlord signature"
														className="signature-preview"
													/>
												) : (
													<span>
														{landlordSignatureFile?.name ||
															(landlordSignaturePreview ? 'Uploaded' : '-')}
													</span>
												)}
											</div>
											<div className="preview-media">
												<span className="label-text">Tenant Photo</span>
												{tenantPhotoPreview ? (
													<img
														src={tenantPhotoPreview}
														alt="Tenant"
														className="profile-photo-preview"
													/>
												) : (
													<span>
														{tenantPhotoFile?.name ||
															(tenantPhotoPreview ? 'Prefilled' : '-')}
													</span>
												)}
											</div>
											<div className="preview-media preview-media-left">
												<span className="label-text">Tenant Signature</span>
												{tenantSignaturePreview ? (
													<img
														src={tenantSignaturePreview}
														alt="Tenant signature"
														className="signature-preview"
													/>
												) : (
													<span>
														{tenantSignatureFile?.name ||
															(tenantSignaturePreview ? 'Uploaded' : '-')}
													</span>
												)}
											</div>
										</div>
									</div>
								</div>
							</>
						) : null}
						{tenancyStep === 6 ? (
							<>
								<div className="tenancy-finish">
									<strong>All steps completed.</strong>
									<span className="muted">
										Review your details and submit the application.
									</span>
								</div>
								{tenancyReceipt ? (
									<div className="tenancy-preview-section">
										<h3>Acknowledgment Receipt</h3>
										<div className="tenancy-preview-grid">
											<div>
												<span className="label-text">Application No</span>
												<span>{tenancyReceipt.application_no}</span>
											</div>
											<div>
												<span className="label-text">Submitted At</span>
												<span>
													{formatDateTime(
														tenancyReceipt?.application?.created_at ||
														tenancyReceipt?.submitted_at
													)}
												</span>
											</div>
										</div>
										{tenancyReceipt.id ? (
											<div className="form-actions">
												<button
													type="button"
													onClick={() => {
														const baseUrl =
															import.meta.env.VITE_API_URL || 'http://localhost:8000'
														window.open(
															`${baseUrl}/api/tenancy-applications/${tenancyReceipt.id}/receipt?print=1`,
															'_blank'
														)
													}}
												>
													Print Receipt
												</button>
												<button
													type="button"
													className="secondary"
													onClick={() => {
														const baseUrl =
															import.meta.env.VITE_API_URL || 'http://localhost:8000'
														window.open(
															`${baseUrl}/api/tenancy-applications/${tenancyReceipt.id}/receipt?format=pdf&download=1`,
															'_blank'
														)
													}}
												>
													Download PDF
												</button>
											</div>
										) : null}
									</div>
								) : null}
							</>
						) : null}
						<div className="form-actions">
							{!tenancyReceipt ? (
								<>
									{tenancyStep > 1 ? (
										<button
											type="button"
											className="secondary"
											onClick={() =>
												setTenancyStep((prev) => Math.max(1, prev - 1))
											}
										>
											Back
										</button>
									) : null}
									<button
										type={tenancyStep === 6 ? 'button' : 'submit'}
										disabled={
											(tenancyStep === 1 &&
												(!tenancyRegistrationDate ||
													!tenancyOfficeId ||
													registrationTooOld)) ||
											tenancySubmitting ||
											Boolean(tenancyReceipt)
										}
										onClick={() => {
											if (tenancyStep === 6) {
												submitTenancyApplication()
											}
										}}
									>
										{tenancyStep === 6
											? tenancySubmitting
												? 'Submitting...'
												: 'Submit'
											: 'Next'}
									</button>
								</>
							) : null}
						</div>
					</form>
				</div>
			)
		}

		return (
			<div className="auth-card dashboard-card">
				<h1>Welcome</h1>
				<p className="muted">You are signed in as:</p>
				<div className="user-pill">
					<strong>{user?.name}</strong>
					<span>{user?.email}</span>
				</div>
			</div>
		)
	}

	return (
		<section className="dashboard-layout">
			<aside className="dashboard-menu">
				<nav className="dashboard-links">
					<a
						className="dashboard-link"
						href="#dashboard"
						onClick={(e) => {
							e.preventDefault()
							setActivePanel('welcome')
						}}
					>
						Dashboard
					</a>
					{user?.role === 'tenant owner' ? (
						<>
							<a
								className="dashboard-link"
								href="/dashboard"
								onClick={(e) => {
									e.preventDefault()
									setActivePanel('profile')
									loadProfile()
									window.history.replaceState(null, '', '/dashboard')
								}}
							>
								Profile
							</a>
							<a
								className="dashboard-link"
								href="#services-menu"
								onClick={(e) => {
									e.preventDefault()
									setServicesMenuOpen((prev) => !prev)
								}}
							>
								Services
							</a>
							{servicesMenuOpen ? (
								<div className="dashboard-submenu">
									<a
										className="dashboard-link"
										href="#tenancy-certificate"
										onClick={(e) => {
											e.preventDefault()
											setActivePanel('tenancy-certificate')
											loadTenancyOffices()
											resetTenancyForm()
											window.history.replaceState(null, '', '/dashboard')
										}}
									>
										Apply for Tenancy Certificate
									</a>
									<a
										className="dashboard-link"
										href="#status"
										onClick={(e) => {
											e.preventDefault()
											setActivePanel('status')
											loadStatusApplications(1)
											window.history.replaceState(null, '', '/dashboard')
										}}
									>
										Status
									</a>
								</div>
							) : null}
						</>
					) : null}
					{user?.role !== 'tenant owner' ? (
						<>
							<a
								className="dashboard-link"
								href="#state"
								onClick={(e) => {
									e.preventDefault()
									setActivePanel('state')
									loadStates(1)
								}}
							>
								State Management
							</a>
							<a
								className="dashboard-link"
								href="#district"
								onClick={(e) => {
									e.preventDefault()
									setActivePanel('district')
									loadStates(1)
									loadDistricts(1)
								}}
							>
								District Management
							</a>
							<a
								className="dashboard-link"
								href="#office-menu"
								onClick={(e) => {
									e.preventDefault()
									setOfficeMenuOpen((prev) => !prev)
								}}
							>
								Office Management
							</a>
							{officeMenuOpen ? (
								<div className="dashboard-submenu">
									<a
										className="dashboard-link"
										href="#office"
										onClick={(e) => {
											e.preventDefault()
											setActivePanel('office')
											setError('')
											setSuccess('')
											loadAllStates()
											loadAllDistricts()
											loadOffices(1)
										}}
									>
										Office
									</a>
									<a
										className="dashboard-link"
										href="#designation"
										onClick={(e) => {
											e.preventDefault()
											setActivePanel('designation')
											setError('')
											setSuccess('')
											loadDesignations(1)
										}}
									>
										Designation
									</a>
								</div>
							) : null}
							<a
								className="dashboard-link"
								href="#role"
								onClick={(e) => {
									e.preventDefault()
									setActivePanel('role')
									setError('')
									setSuccess('')
									loadRoles(1)
								}}
							>
								Role Management
							</a>
							<a
								className="dashboard-link"
								href="#user-menu"
								onClick={(e) => {
									e.preventDefault()
									setUserMenuOpen((prev) => !prev)
								}}
							>
								User Management
							</a>
							{userMenuOpen ? (
								<div className="dashboard-submenu">
									<a
										className="dashboard-link"
										href="#office-user"
										onClick={(e) => {
											e.preventDefault()
											setActivePanel('user')
											setUserListMode('office')
											setError('')
											setSuccess('')
											loadAllOffices()
											loadAllDesignations()
											loadAllRoles()
											loadUsers()
										}}
									>
										Office user
									</a>
									<a
										className="dashboard-link"
										href="#user"
										onClick={(e) => {
											e.preventDefault()
											setActivePanel('user')
											setUserListMode('tenant')
											setError('')
											setSuccess('')
											loadAllOffices()
											loadAllDesignations()
											loadAllRoles()
											loadUsers()
										}}
									>
										User
									</a>
								</div>
							) : null}
							{user?.role === 'system_admin' ? (
								<a
									className="dashboard-link"
									href="#user-activity-log"
									onClick={(e) => {
										e.preventDefault()
										setActivePanel('user-activity-log')
										setError('')
										setSuccess('')
										loadActivityUsers()
										loadActivityLogs(1)
									}}
								>
									User Activity Log
								</a>
							) : null}
						</>
					) : null}
				</nav>
			</aside>
			{renderPanel()}
		</section>
	)
}

export default Dashboard
