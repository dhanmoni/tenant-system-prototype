import { useEffect, useState } from 'react'
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import api, { csrf } from '../api'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

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
	const [adminStats, setAdminStats] = useState(null)
	const [adminStatsLoading, setAdminStatsLoading] = useState(false)
	const [staffStats, setStaffStats] = useState(null)
	const [staffStatsLoading, setStaffStatsLoading] = useState(false)
	const [adminRecentActivity, setAdminRecentActivity] = useState([])
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

	const [tenancyVillageWardId, setTenancyVillageWardId] = useState('')
	const [tenancyVillageWards, setTenancyVillageWards] = useState([])
	const [tenancyVillageWardsLoading, setTenancyVillageWardsLoading] = useState(false)
	const [tenancyDistrictId, setTenancyDistrictId] = useState('')
	const [tenancyDistricts, setTenancyDistricts] = useState([])
	const [tenancyDistrictsLoading, setTenancyDistrictsLoading] = useState(false)
	const [initiatorRole, setInitiatorRole] = useState('')
	const [mergeConflict, setMergeConflict] = useState(null)
	const [copiedRefCode, setCopiedRefCode] = useState('')
	const [columnWidths, setColumnWidths] = useState({})
	const [resizing, setResizing] = useState(null)
	const [statusSearchAppNo, setStatusSearchAppNo] = useState('')
	const [statusSearchUid, setStatusSearchUid] = useState('')
	const [statusSortBy, setStatusSortBy] = useState('created_at')
	const [statusSortOrder, setStatusSortOrder] = useState('desc')
	const [activeSearchColumn, setActiveSearchColumn] = useState(null) // 'application_no', 'uid', or null

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (activeSearchColumn && !event.target.closest('.header-search-popup') && !event.target.closest('.header-action-btn')) {
				setActiveSearchColumn(null)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [activeSearchColumn])

	const startResizing = (id, e) => {
		e.preventDefault()
		const header = e.target.parentElement
		setResizing({
			id,
			startX: e.clientX,
			startWidth: columnWidths[id] || header.offsetWidth,
		})
	}

	useEffect(() => {
		if (!resizing) return
		const doResize = (e) => {
			const delta = e.clientX - resizing.startX
			setColumnWidths((prev) => ({
				...prev,
				[resizing.id]: Math.max(50, resizing.startWidth + delta),
			}))
		}
		const stopResizing = () => {
			setResizing(null)
			document.body.classList.remove('resizing')
		}
		document.addEventListener('mousemove', doResize)
		document.addEventListener('mouseup', stopResizing)
		document.body.classList.add('resizing')
		return () => {
			document.removeEventListener('mousemove', doResize)
			document.removeEventListener('mouseup', stopResizing)
		}
	}, [resizing])

	useEffect(() => {
		if (!user) return
		if (initiatorRole === 'LANDLORD') {
			setLandlordName(user.name || '')
			setLandlordPhone(user.phone || '')
			setLandlordEmail(user.email || '')
			if (user.address) setLandlordAddress(user.address)
			if (user.pan) setLandlordPan(user.pan)
		} else if (initiatorRole === 'TENANT') {
			setTenantName(user.name || '')
			setTenantPhone(user.phone || '')
			setTenantEmail(user.email || '')
			if (user.address) setTenantAddress(user.address)
			if (user.pan) setTenantPan(user.pan)
		}
	}, [initiatorRole, user])

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

	const loadTenancyDistricts = async () => {
		setTenancyDistrictsLoading(true)
		try {
			const { data } = await api.get('/api/public/districts')
			const items = Array.isArray(data) ? data : (data.districts || data.data || [])
			setTenancyDistricts(items)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load districts')
		} finally {
			setTenancyDistrictsLoading(false)
		}
	}

	const loadTenancyVillageWards = async (districtId) => {
		if (!districtId) {
			setTenancyVillageWards([])
			return
		}
		setTenancyVillageWardsLoading(true)
		try {
			const { data } = await api.get('/api/public/village-wards', {
				params: { district_id: districtId },
			})
			const items = Array.isArray(data) ? data : data.data || []
			setTenancyVillageWards(items)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load village/wards')
		} finally {
			setTenancyVillageWardsLoading(false)
		}
	}

	const copyToClipboard = (text) => {
		navigator.clipboard.writeText(text).then(() => {
			setCopiedRefCode(text)
			setTimeout(() => setCopiedRefCode(''), 2000)
		}).catch(() => { })
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

	const loadAdminDashboard = async () => {
		if (user?.role !== 'system_admin') return
		setAdminStatsLoading(true)
		setError('')
		try {
			const [statsRes, activityRes] = await Promise.all([
				api.get('/api/dashboard-stats'),
				api.get('/api/activity-logs', { params: { page: 1 } }),
			])
			setAdminStats(statsRes.data || null)
			setAdminRecentActivity(activityRes.data?.data || [])
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load dashboard')
		} finally {
			setAdminStatsLoading(false)
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
			const photoUrl = profileUser.passport_photo_url
			const photoPath = profileUser.passport_photo_path || profileUser.user_passport_photo_path
			if (photoUrl) {
				setProfilePhotoPreview(photoUrl)
			} else if (photoPath) {
				const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
				setProfilePhotoPreview(`${baseUrl}/storage/${photoPath}`)
			} else {
				setProfilePhotoPreview('')
			}
			setProfileEditing(
				!(
					profileUser.profile_type &&
					profileUser.address &&
					profileUser.pin_code &&
					profileUser.pan_card &&
					(photoUrl || photoPath)
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
			formData.append('profile_type', (profileType || '').trim())
			formData.append('address', (profileAddress || '').trim())
			formData.append('pin_code', (profilePin || '').trim().slice(0, 6))
			formData.append('pan_card', (profilePan || '').trim().toUpperCase().slice(0, 10))
			if (profilePhoto) {
				formData.append('passport_photo', profilePhoto)
			}
			const { data } = await api.post('/api/profile', formData)
			const profileUser = data.user || {}
			setProfileType(profileUser.profile_type || '')
			setProfileAddress(profileUser.address || '')
			setProfilePin(profileUser.pin_code || '')
			setProfilePan(profileUser.pan_card || '')
			const photoUrl = profileUser.passport_photo_url
			const photoPath = profileUser.passport_photo_path || profileUser.user_passport_photo_path
			if (photoUrl) {
				setProfilePhotoPreview(photoUrl)
			} else if (photoPath) {
				const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
				setProfilePhotoPreview(`${baseUrl}/storage/${photoPath}`)
			} else {
				setProfilePhotoPreview('')
			}
			setProfilePhoto(null)
			setSuccess('Profile saved successfully.')
			setProfileEditing(false)
		} catch (err) {
			const data = err?.response?.data
			const errors = data?.errors || {}
			const firstError =
				errors.profile_type?.[0] || errors.address?.[0] || errors.pin_code?.[0] ||
				errors.pan_card?.[0] || errors.passport_photo?.[0]
			setError(firstError || data?.message || 'Failed to save profile')
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
			loadTenancyDistricts()
		}
		if (activePanel === 'welcome' && user?.role === 'system_admin') {
			loadAdminDashboard()
		}
		if (activePanel === 'welcome' && user?.role !== 'tenant owner' && user?.role !== 'system_admin') {
			loadStaffDashboard()
		}
	}, [activePanel, user?.role])

	const loadStaffDashboard = async () => {
		setStaffStatsLoading(true)
		setError('')
		try {
			const { data } = await api.get('/api/staff-dashboard-stats')
			setStaffStats(data || null)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load dashboard')
		} finally {
			setStaffStatsLoading(false)
		}
	}

	const StatusTableSortIcon = ({ column }) => {
		if (statusSortBy !== column) {
			return (
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sort-icon-svg">
					<path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
				</svg>
			)
		}
		if (statusSortOrder === 'asc') {
			return (
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sort-icon-svg active">
					<path d="M18 15l-6-6-6 6" />
				</svg>
			)
		}
		return (
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sort-icon-svg active">
				<path d="M6 9l6 6 6-6" />
			</svg>
		)
	}

	const StatusTableSearchIcon = ({ active, filtered }) => (
		<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`search-icon-svg ${active ? 'active' : ''} ${filtered ? 'filtered' : ''}`}>
			<circle cx="11" cy="11" r="8" />
			<line x1="21" y1="21" x2="16.65" y2="16.65" />
		</svg>
	)

	const StatusTableLoader = () => (
		<tr>
			<td colSpan="6">
				<div className="table-loader-container">
					<div className="loader-spinner"></div>
					<span className="table-loader-text">Loading applications...</span>
				</div>
			</td>
		</tr>
	)

	const loadStatusApplications = async (page = 1, overrides = {}) => {
		setStatusLoading(true)
		setError('')
		try {
			const params = {
				page,
				application_no: overrides.application_no !== undefined ? overrides.application_no : (statusSearchAppNo || undefined),
				uid: overrides.uid !== undefined ? overrides.uid : (statusSearchUid || undefined),
				sort_by: overrides.sort_by || statusSortBy,
				sort_order: overrides.sort_order || statusSortOrder,
			}
			const { data } = await api.get('/api/tenancy-applications/my', { params })
			// Handle Laravel paginator { data: [], current_page, last_page } or plain array
			const list = Array.isArray(data) ? data : (data?.data ?? [])
			setStatusApplications(list)
			setStatusPage(Number(data?.current_page) || 1)
			setStatusTotalPages(Number(data?.last_page) || 1)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load applications')
			setStatusApplications([])
			setStatusPage(1)
			setStatusTotalPages(1)
		} finally {
			setStatusLoading(false)
		}
	}

	const handleStatusSort = (column) => {
		const newOrder = statusSortBy === column && statusSortOrder === 'asc' ? 'desc' : 'asc'
		setStatusSortBy(column)
		setStatusSortOrder(newOrder)
		// We use a timeout to ensure state is updated before loading
		setTimeout(() => loadStatusApplications(1), 0)
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
		setTenancyVillageWardId('')
		setTenancyVillageWards([])
		setTenancyDistrictId('')
		setInitiatorRole(profileType === 'landlord' ? 'LANDLORD' : profileType === 'tenant' ? 'TENANT' : '')
		setMergeConflict(null)
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
				<div className="auth-card dashboard-card profile-page">
					<div className="profile-page-header">
						<h1>Profile</h1>
						<p className="muted">
							{hasProfile && !profileEditing
								? 'View and manage your account details.'
								: 'Complete or update your profile information.'}
						</p>
					</div>
					{profileLoading ? (
						<div className="profile-loading">Loading profile…</div>
					) : null}
					{error ? <div className="error">{error}</div> : null}
					{success ? <div className="admin-success">{success}</div> : null}
					{!profileLoading && hasProfile && !profileEditing ? (
						<div className="profile-summary">
							<div className="profile-hero">
								<div className="profile-avatar-wrap">
									{profilePhotoPreview ? (
										<img
											src={profilePhotoPreview}
											alt=""
											className="profile-avatar-img"
										/>
									) : (
										<div className="profile-avatar-placeholder">
											<span className="profile-avatar-initial">
												{profileName ? profileName.trim().charAt(0).toUpperCase() : '?'}
											</span>
										</div>
									)}
								</div>
								<h2 className="profile-hero-name">{profileName}</h2>
								<span
									className={`profile-type-badge ${profileType === 'landlord' ? 'landlord' : 'tenant'}`}
								>
									{profileType === 'landlord' ? 'Landlord' : 'Tenant'}
								</span>
								<p className="profile-hero-email">{profileEmail}</p>
							</div>
							<div className="profile-section">
								<h3 className="profile-section-title">Personal details</h3>
								<div className="profile-summary-grid">
									<div className="profile-summary-item">
										<span className="profile-summary-label">Name</span>
										<span className="profile-summary-value">{profileName}</span>
									</div>
									<div className="profile-summary-item">
										<span className="profile-summary-label">Email</span>
										<span className="profile-summary-value">{profileEmail}</span>
									</div>
									<div className="profile-summary-item">
										<span className="profile-summary-label">Phone</span>
										<span className="profile-summary-value">{profilePhone || '—'}</span>
									</div>
								</div>
							</div>
							<div className="profile-section">
								<h3 className="profile-section-title">Address</h3>
								<div className="profile-summary-grid">
									<div className="profile-summary-item profile-summary-address-full">
										<span className="profile-summary-label">Address</span>
										<span className="profile-summary-value">{profileAddress}</span>
									</div>
									<div className="profile-summary-item">
										<span className="profile-summary-label">District</span>
										<span className="profile-summary-value">{profileDistrict || '—'}</span>
									</div>
									<div className="profile-summary-item">
										<span className="profile-summary-label">State</span>
										<span className="profile-summary-value">{profileState || '—'}</span>
									</div>
									<div className="profile-summary-item">
										<span className="profile-summary-label">PIN Code</span>
										<span className="profile-summary-value">{profilePin}</span>
									</div>
								</div>
							</div>
							<div className="profile-section">
								<h3 className="profile-section-title">Identity</h3>
								<div className="profile-summary-grid">
									<div className="profile-summary-item">
										<span className="profile-summary-label">PAN Card</span>
										<span className="profile-summary-value">{profilePan}</span>
									</div>
								</div>
							</div>
							<div className="profile-actions">
								<button
									type="button"
									className="profile-edit-btn"
									onClick={() => {
										setProfileEditing(true)
										setSuccess('')
										setError('')
									}}
								>
									Edit Profile
								</button>
							</div>
						</div>
					) : !profileLoading ? (
						<form onSubmit={handleProfileSubmit} className="profile-form">
							<div className="profile-form-section profile-form-section-photo">
								<h3 className="profile-section-title">Profile photo</h3>
								<div className="profile-upload-wrap">
									<div className="profile-upload-preview">
										{profilePhotoPreview ? (
											<img src={profilePhotoPreview} alt="" className="profile-avatar-img" />
										) : (
											<div className="profile-avatar-placeholder">
												<span className="profile-avatar-initial">
													{profileName ? profileName.trim().charAt(0).toUpperCase() : '?'}
												</span>
											</div>
										)}
									</div>
									<label className="profile-upload-label">
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
											className="profile-upload-input"
										/>
										<span className="profile-upload-btn">
											{profilePhotoPreview ? 'Change photo' : 'Upload photo'}
										</span>
									</label>
									<p className="profile-upload-hint">Passport size. PNG or JPEG.</p>
								</div>
							</div>
							<div className="profile-form-section">
								<h3 className="profile-section-title">Profile type</h3>
								<fieldset className="profile-type-row">
									<legend className="sr-only">Are you a</legend>
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
							</div>
							<div className="profile-form-section">
								<h3 className="profile-section-title">Personal details</h3>
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
							</div>
							<div className="profile-form-section">
								<h3 className="profile-section-title">Address</h3>
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
							</div>
							<div className="profile-form-section">
								<h3 className="profile-section-title">Identity</h3>
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
							</div>
							<div className="profile-form-actions">
								<button type="submit" className="profile-save-btn" disabled={profileLoading}>
									{profileLoading ? 'Saving…' : 'Save Profile'}
								</button>
								{hasProfile ? (
									<button
										type="button"
										className="secondary"
										onClick={() => {
											setProfileEditing(false)
											setSuccess('')
											setError('')
										}}
									>
										Cancel
									</button>
								) : null}
							</div>
						</form>
					) : null}
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

			const isStaff = user?.role !== 'tenant owner' && user?.role !== 'system_admin'
			return (
				<div className="auth-card dashboard-card">
					<h1>{userListMode === 'tenant' ? 'User List' : isStaff ? 'User Management' : 'Add User'}</h1>
					{userListMode !== 'tenant' && user?.role === 'system_admin' ? (
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
					<div className="admin-table-wrapper">
						<table className="admin-table status-table">
							<thead>
								<tr>
									<th style={{ width: columnWidths['status_app_no'] }}>
										<div className="th-content">
											<span>Application No</span>
											<div className="header-actions">
												<button
													className={`header-action-btn ${statusSearchAppNo ? 'active' : ''} ${activeSearchColumn === 'application_no' ? 'showing-popup' : ''}`}
													onClick={() => setActiveSearchColumn(activeSearchColumn === 'application_no' ? null : 'application_no')}
												>
													<StatusTableSearchIcon 
														active={activeSearchColumn === 'application_no'} 
														filtered={!!statusSearchAppNo} 
													/>
												</button>
											</div>
											{activeSearchColumn === 'application_no' && (
												<div className="header-search-popup">
													<input
														type="text"
														value={statusSearchAppNo}
														onChange={(e) => setStatusSearchAppNo(e.target.value)}
														onKeyDown={(e) => {
															if (e.key === 'Enter') {
																loadStatusApplications(1)
																setActiveSearchColumn(null)
															}
														}}
														placeholder="Search App No..."
														autoFocus
													/>
													<div className="popup-actions">
														<button className="btn-find" onClick={() => { loadStatusApplications(1); setActiveSearchColumn(null); }}>Find</button>
														<button className="btn-clear" onClick={() => {
															setStatusSearchAppNo('');
															setActiveSearchColumn(null);
															loadStatusApplications(1, { application_no: '' });
														}}>Clear</button>
													</div>
												</div>
											)}
										</div>
										<span className="resizer" onMouseDown={(e) => startResizing('status_app_no', e)} />
									</th>
									<th style={{ width: columnWidths['status_uid'] }}>
										<div className="th-content">
											<span>UID</span>
											<div className="header-actions">
												<button
													className={`header-action-btn ${statusSearchUid ? 'active' : ''} ${activeSearchColumn === 'uid' ? 'showing-popup' : ''}`}
													onClick={() => setActiveSearchColumn(activeSearchColumn === 'uid' ? null : 'uid')}
												>
													<StatusTableSearchIcon 
														active={activeSearchColumn === 'uid'} 
														filtered={!!statusSearchUid} 
													/>
												</button>
											</div>
											{activeSearchColumn === 'uid' && (
												<div className="header-search-popup">
													<input
														type="text"
														value={statusSearchUid}
														onChange={(e) => setStatusSearchUid(e.target.value)}
														onKeyDown={(e) => {
															if (e.key === 'Enter') {
																loadStatusApplications(1)
																setActiveSearchColumn(null)
															}
														}}
														placeholder="Search UID..."
														autoFocus
													/>
													<div className="popup-actions">
														<button className="btn-find" onClick={() => { loadStatusApplications(1); setActiveSearchColumn(null); }}>Find</button>
														<button className="btn-clear" onClick={() => {
															setStatusSearchUid('');
															setActiveSearchColumn(null);
															loadStatusApplications(1, { uid: '' });
														}}>Clear</button>
													</div>
												</div>
											)}
										</div>
										<span className="resizer" onMouseDown={(e) => startResizing('status_uid', e)} />
									</th>
									<th style={{ width: columnWidths['status_date'] }}>
										<div className="th-content sortable" onClick={() => handleStatusSort('created_at')}>
											<span>Application Date</span>
											<div className="header-actions">
												<StatusTableSortIcon column="created_at" />
											</div>
										</div>
										<span className="resizer" onMouseDown={(e) => startResizing('status_date', e)} />
									</th>
									<th style={{ width: columnWidths['status_status'] }}>
										<span>Status</span>
										<span className="resizer" onMouseDown={(e) => startResizing('status_status', e)} />
									</th>
									<th style={{ width: columnWidths['status_completion'] }}>
										<span>Completion</span>
										<span className="resizer" onMouseDown={(e) => startResizing('status_completion', e)} />
									</th>
									<th className="table-actions-head">Actions</th>
								</tr>
							</thead>
							<tbody>
								{statusLoading ? (
									<StatusTableLoader />
								) : statusApplications.length === 0 ? (
									<tr>
										<td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
											No applications found.
										</td>
									</tr>
								) : (
									statusApplications.map((app) => (
										<tr key={app.id}>
											<td style={{ width: columnWidths['status_app_no'] }}>{app.application_no}</td>
											<td style={{ width: columnWidths['status_uid'] }}>{app.uid || '-'}</td>
											<td style={{ width: columnWidths['status_date'] }}>
												{app.created_at
													? new Date(app.created_at).toLocaleDateString()
													: '-'}
											</td>
											<td style={{ width: columnWidths['status_status'] }}>
												{formatTenancyApplicationStatus(
													app.status,
													app.application_type || 'Tenancy Certificate'
												)}
											</td>
											<td style={{ width: columnWidths['status_completion'] }}>
												{app.initiator_completed && app.second_party_completed ? (
													<span className="completion-badge completion-badge--done">Both Completed</span>
												) : (
													<span className="completion-badge completion-badge--partial">Awaiting {app.initiator_role === 'LANDLORD' ? 'Tenant' : 'Landlord'}</span>
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
												{app.status === 'PARTIAL' && app.ref_code ? (
													<button
														type="button"
														className="secondary"
														onClick={() => {
															const link = `${window.location.origin}/join?refCode=${app.ref_code}`
															copyToClipboard(link)
														}}
													>
														{copiedRefCode ? '✓ Copied!' : 'Copy Invite Link'}
													</button>
												) : null}
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
									<span className="label-text">UID</span>
									<span>{application.uid || '-'}</span>
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
					if (tenancyOfficeId) {
						formData.append('office_id', tenancyOfficeId)
					}
					if (tenancyVillageWardId) {
						formData.append('village_ward_id', tenancyVillageWardId)
					}
					if (initiatorRole) {
						formData.append('initiator_role', initiatorRole)
					}
					formData.append('apply_type', applyType || 'Individual')
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
					formData.append('tenant_previous_tenancy', tenantPreviousTenancy || '')
					formData.append('property_possession_date', propertyPossessionDate)
					formData.append('property_rent_payable', String(Number(propertyRentPayable) || 0))
					formData.append(
						'property_premises_description',
						propertyPremisesDescription
					)
					formData.append(
						'property_furniture_description',
						propertyFurnitureDescription || ''
					)
					formData.append('property_charge_electricity', propertyChargeElectricity || '')
					formData.append('property_charge_water', propertyChargeWater || '')
					formData.append('property_charge_furnishing', propertyChargeFurnishing || '')
					formData.append(
						'property_charge_other_services',
						propertyChargeOtherServices || ''
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
					const data = err?.response?.data
					const errors = data?.errors
					let msg = data?.message || 'Failed to submit application'
					if (errors && typeof errors === 'object') {
						const list = Object.entries(errors).flatMap(([field, messages]) =>
							(Array.isArray(messages) ? messages : [messages]).map((m) => `${field}: ${m}`)
						)
						if (list.length) msg = list.join('. ')
					}
					setError(msg)
				} finally {
					setTenancySubmitting(false)
				}
			}

			const tenancySteps = [
				{ id: 1, label: 'Registration & Office' },
				{ id: 2, label: 'Tenancy Details' },
				{ id: 3, label: 'Property Details' },
				{ id: 4, label: 'Uploads' },
				{ id: 5, label: 'Preview' },
				{ id: 6, label: 'Submit' },
			]

			const eligibilityMet = !registrationTooOld && !!tenancyRegistrationDate && !!tenancyOfficeId
			const criteriaList = [
				{
					met: !!applyType && (applyType === 'Joint' || applyType === 'Individual'),
					text: applyType
						? `Application type: ${applyType} (${applyType === 'Joint' ? 'registered within 2 months' : 'registered >2 months ago'}).`
						: 'Application type will be Joint (≤2 months) or Individual (>2 months) based on registration date.',
				},
				{ met: !!tenancyOfficeId, text: 'Applying office must be selected.' },
			]

			return (
				<div className="auth-card dashboard-card tenancy-certificate-page">
					<div className="tenancy-page-header">
						<h1>Apply for Tenancy Certificate</h1>
					</div>
					<div className="tenancy-criteria-box">
						<h2 className="tenancy-criteria-title">Eligibility criteria</h2>
						<p className="tenancy-criteria-intro">
							You may apply only if the following conditions are satisfied:
						</p>
						<ul className="tenancy-criteria-list">
							{criteriaList.map((item, i) => (
								<li key={i} className={item.met ? 'tenancy-criteria-met' : 'tenancy-criteria-pending'}>
									<span className="tenancy-criteria-icon" aria-hidden>{item.met ? '✓' : '○'}</span>
									<span>{item.text}</span>
								</li>
							))}
						</ul>
						{tenancyRegistrationDate && (
							<div className={`tenancy-eligibility-result ${eligibilityMet ? 'eligible' : 'not-eligible'}`}>
								{eligibilityMet ? (
									<>
										<strong>You are eligible</strong> to apply. Application type: <strong>{applyType}</strong>. You may proceed to the next step.
									</>
								) : registrationTooOld ? (
									<>
										<strong>Not eligible.</strong> Registration date is more than 3 months old. You cannot apply for a tenancy certificate as per the rules.
									</>
								) : null}
							</div>
						)}
					</div>
					<div className="tenancy-required-docs">
						<h3 className="tenancy-docs-title">Required documents</h3>
						<ul>
							<li>Registered tenancy agreement (PDF)</li>
							<li>Passport-size photographs (landlord and tenant)</li>
							<li>Signatures (landlord and tenant)</li>
						</ul>
					</div>
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
								<h3 className="tenancy-step-heading">Step 1: Registration & applying office</h3>
								<label>
									<span className="label-text required">You are initiating as:</span>
									<select
										value={initiatorRole}
										onChange={(e) => setInitiatorRole(e.target.value)}
										disabled={formLocked}
										required
									>
										<option value="">---SELECT---</option>
										<option value="LANDLORD">Landlord</option>
										<option value="TENANT">Tenant</option>
									</select>
								</label>
								<label>
									<span className="label-text required">
										Date of registration (of tenancy agreement)
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
									<span className="label-text required">District</span>
									<select
										value={tenancyDistrictId}
										onChange={(e) => {
											setTenancyDistrictId(e.target.value)
											setTenancyVillageWardId('')
											loadTenancyVillageWards(e.target.value)
										}}
										disabled={formLocked}
										required
									>
										<option value="">---SELECT---</option>
										{tenancyDistricts.map((d) => (
											<option key={d.id} value={d.id}>{d.name}</option>
										))}
									</select>
									{tenancyDistrictsLoading ? <span className="muted">Loading...</span> : null}
								</label>
								<label>
									<span className="label-text required">Village/Ward</span>
									<select
										value={tenancyVillageWardId}
										onChange={(e) => setTenancyVillageWardId(e.target.value)}
										disabled={formLocked || !tenancyDistrictId}
										required
									>
										<option value="">---SELECT---</option>
										{tenancyVillageWards.map((vw) => (
											<option key={vw.id} value={vw.id}>{vw.name} - {vw.type}</option>
										))}
									</select>
									{tenancyVillageWardsLoading ? <span className="muted">Loading...</span> : null}
								</label>
								<label>
									Apply type
									<input type="text" value={applyType} readOnly />
								</label>
							</>
						) : null}
						{tenancyStep === 2 ? (
							<>
								<h3 className="tenancy-step-heading">Step 2: Landlord, manager & tenant details</h3>
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
								<h3 className="tenancy-step-heading">Step 3: Property details</h3>
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
								<h3 className="tenancy-step-heading">Step 4: Document uploads</h3>
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
								<h3 className="tenancy-step-heading">Step 5: Preview & verify</h3>
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

		// Tenant owner: full dashboard with dummy overview and flow
		if (user?.role === 'tenant owner') {
			const dummyStats = [
				{ label: 'Total Applications', value: 2, icon: 'documents' },
				{ label: 'Under Process', value: 1, icon: 'clock' },
				{ label: 'Approved', value: 1, icon: 'check' },
			]
			const DashboardIcon = ({ name, className = '' }) => {
				const icons = {
					documents: (
						<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
							<polyline points="14 2 14 8 20 8" />
							<line x1="16" y1="13" x2="8" y2="13" />
							<line x1="16" y1="17" x2="8" y2="17" />
							<polyline points="10 9 9 9 8 9" />
						</svg>
					),
					clock: (
						<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
							<circle cx="12" cy="12" r="10" />
							<polyline points="12 6 12 12 16 14" />
						</svg>
					),
					check: (
						<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
							<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
							<polyline points="22 4 12 14.01 9 11.01" />
						</svg>
					),
					user: (
						<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
							<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
							<circle cx="12" cy="7" r="4" />
						</svg>
					),
					documentPlus: (
						<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
							<polyline points="14 2 14 8 20 8" />
							<line x1="12" y1="18" x2="12" y2="12" />
							<line x1="9" y1="15" x2="15" y2="15" />
						</svg>
					),
					status: (
						<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
							<circle cx="12" cy="12" r="10" />
							<line x1="12" y1="16" x2="12" y2="12" />
							<line x1="12" y1="8" x2="12.01" y2="8" />
						</svg>
					),
					list: (
						<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
							<line x1="8" y1="6" x2="21" y2="6" />
							<line x1="8" y1="12" x2="21" y2="12" />
							<line x1="8" y1="18" x2="21" y2="18" />
							<line x1="3" y1="6" x2="3.01" y2="6" />
							<line x1="3" y1="12" x2="3.01" y2="12" />
							<line x1="3" y1="18" x2="3.01" y2="18" />
						</svg>
					),
					welcome: (
						<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
							<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
							<polyline points="9 22 9 12 15 12 15 22" />
						</svg>
					),
				}
				return icons[name] || null
			}
			const dummyRecentApplications = [
				{ id: 'dummy-1', application_no: 'TEN-20250311-001', registration_date: '2025-03-01', status: 'Under process', current_with: 'District Office' },
				{ id: 'dummy-2', application_no: 'TEN-20250305-002', registration_date: '2025-02-28', status: 'Approved', current_with: '-' },
			]
			return (
				<div className="dashboard-home">
					<div className="auth-card dashboard-card dashboard-welcome-card">
						<h1 className="dashboard-title-with-icon">
							<DashboardIcon name="welcome" className="dashboard-heading-icon" />
							Welcome
						</h1>
						<p className="muted">You are signed in as:</p>
						<div className="user-pill">
							<strong>{user?.name}</strong>
							<span>{user?.email}</span>
						</div>
						<button onClick={onLogout} className="secondary" style={{ marginTop: 12 }}>
							Log out
						</button>
					</div>
					<div className="dashboard-overview-cards">
						{dummyStats.map((stat) => (
							<div key={stat.label} className="dashboard-stat-card">
								<span className="dashboard-stat-icon-wrap">
									<DashboardIcon name={stat.icon} className="dashboard-stat-icon" />
								</span>
								<span className="dashboard-stat-value">{stat.value}</span>
								<span className="dashboard-stat-label">{stat.label}</span>
							</div>
						))}
					</div>
					<div className="auth-card dashboard-card">
						<h2 className="dashboard-section-title">
							<DashboardIcon name="status" className="dashboard-section-icon" />
							Quick actions
						</h2>
						<p className="muted">Access your profile and tenancy services.</p>
						<div className="dashboard-quick-actions">
							<button
								type="button"
								className="dashboard-action-btn"
								onClick={() => {
									setActivePanel('profile')
									loadProfile()
								}}
							>
								<DashboardIcon name="user" className="dashboard-action-icon" />
								View / Edit Profile
							</button>
							<button
								type="button"
								className="dashboard-action-btn"
								onClick={() => {
									setActivePanel('tenancy-certificate')
									loadTenancyOffices()
									resetTenancyForm()
								}}
							>
								<DashboardIcon name="documentPlus" className="dashboard-action-icon" />
								Apply for Tenancy Certificate
							</button>
							<button
								type="button"
								className="dashboard-action-btn"
								onClick={() => {
									setActivePanel('status')
									loadStatusApplications(1)
								}}
							>
								<DashboardIcon name="list" className="dashboard-action-icon" />
								View Application Status
							</button>
						</div>
					</div>
					<div className="auth-card dashboard-card">
						<h2 className="dashboard-section-title">
							<DashboardIcon name="list" className="dashboard-section-icon" />
							Recent applications
						</h2>
						<p className="muted">Your latest tenancy certificate applications (demo data).</p>
						<div className="admin-table-wrapper">
							<table className="admin-table status-table">
								<thead>
									<tr>
										<th>Application No</th>
										<th>Registration Date</th>
										<th>Status</th>
										<th>Current With</th>
										<th className="table-actions-head">Actions</th>
									</tr>
								</thead>
								<tbody>
									{dummyRecentApplications.map((app) => (
										<tr key={app.id}>
											<td>{app.application_no}</td>
											<td>{app.registration_date}</td>
											<td>
												<span className="dashboard-status-cell">
													{app.status === 'Approved' ? (
														<DashboardIcon name="check" className="dashboard-status-icon dashboard-status-icon--success" />
													) : (
														<DashboardIcon name="clock" className="dashboard-status-icon dashboard-status-icon--pending" />
													)}
													{app.status}
												</span>
											</td>
											<td>{app.current_with}</td>
											<td className="table-actions">
												<button
													type="button"
													onClick={() => {
														setActivePanel('status')
														loadStatusApplications(1)
													}}
												>
													View
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<p className="muted" style={{ marginTop: 12, marginBottom: 0 }}>
							Use <strong>Status</strong> in the menu to see your real applications.
						</p>
					</div>
				</div>
			)
		}

		// Staff dashboard home (director, assistant_director, district_head, district_assistant) – stats, charts, quick actions
		if (user?.role !== 'tenant owner' && user?.role !== 'system_admin') {
			const StaffIcon = ({ name, className = '' }) => {
				const icons = {
					chart: (
						<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
							<line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
						</svg>
					),
					users: (
						<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
							<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
						</svg>
					),
					file: (
						<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
						</svg>
					),
				}
				return icons[name] || null
			}
			const s = staffStats || {}
			const staffStatCards = [
				{ label: 'States', value: s.states_count, icon: 'chart' },
				{ label: 'Districts', value: s.districts_count, icon: 'chart' },
				{ label: 'Users', value: s.users_count, icon: 'users' },
				{ label: 'Applications', value: s.applications_count, icon: 'file' },
			]
			const staffQuickActions = [
				{ label: 'Application Status', panel: 'status', load: () => { setError(''); setSuccess(''); loadStatusApplications(1) } },
				{ label: 'State Management', panel: 'state', load: () => loadStates(1) },
				{ label: 'District Management', panel: 'district', load: () => { loadStates(1); loadDistricts(1) } },
				{ label: 'User Management (Office)', panel: 'user', load: () => { setUserListMode('office'); setError(''); setSuccess(''); loadAllOffices(); loadAllDesignations(); loadAllRoles(); loadUsers() } },
				{ label: 'User Management (Tenants)', panel: 'user', load: () => { setUserListMode('tenant'); setError(''); setSuccess(''); loadAllOffices(); loadAllDesignations(); loadAllRoles(); loadUsers() } },
			]
			return (
				<div className="dashboard-home staff-dashboard-home">
					<div className="auth-card dashboard-card dashboard-welcome-card">
						<h1 className="dashboard-title-with-icon">Staff dashboard</h1>
						<p className="muted">You are signed in as:</p>
						<div className="user-pill">
							<strong>{user?.name}</strong>
							<span className="staff-email-row">
								<span className="muted">Staff email:</span> {user?.email}
							</span>
							{user?.role && <span className="user-pill-role">{user.role.replace(/_/g, ' ')}</span>}
						</div>
						<button onClick={onLogout} className="secondary" style={{ marginTop: 12 }}>
							Log out
						</button>
					</div>
					{staffStatsLoading ? (
						<div className="dashboard-stats-loading">Loading dashboard…</div>
					) : (
						<>
							<div className="dashboard-overview-cards admin-stats-cards staff-stats-cards">
								{staffStatCards.map((card) => (
									<div key={card.label} className="dashboard-stat-card">
										<span className="dashboard-stat-icon-wrap">
											<StaffIcon name={card.icon} className="dashboard-stat-icon" />
										</span>
										<span className="dashboard-stat-value">{card.value ?? '—'}</span>
										<span className="dashboard-stat-label">{card.label}</span>
									</div>
								))}
							</div>
							{staffStats && (
								<div className="dashboard-charts-row">
									<div className="auth-card dashboard-card dashboard-chart-card">
										<h2 className="dashboard-section-title">Overview</h2>
										<p className="muted">States, districts, users, and applications</p>
										<div className="dashboard-chart-wrap">
											<Bar
												data={{
													labels: ['States', 'Districts', 'Users'],
													datasets: [{
														label: 'Count',
														data: [
															s.states_count ?? 0,
															s.districts_count ?? 0,
															s.users_count ?? 0,
														],
														backgroundColor: [
															'rgba(13, 71, 161, 0.85)',
															'rgba(13, 71, 161, 0.7)',
															'rgba(13, 71, 161, 0.75)',
														],
														borderColor: ['#0d47a1', '#0d47a1', '#0d47a1'],
														borderWidth: 1,
													}],
												}}
												options={{
													responsive: true,
													maintainAspectRatio: false,
													plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
													scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
												}}
											/>
										</div>
									</div>
									<div className="auth-card dashboard-card dashboard-chart-card">
										<h2 className="dashboard-section-title">Applications by status</h2>
										<p className="muted">Tenancy applications.</p>
										<div className="dashboard-chart-wrap dashboard-chart-wrap--doughnut">
											{Object.keys(s.applications_by_status || {}).length > 0 ? (
												<Doughnut
													data={{
														labels: Object.keys(s.applications_by_status || {}),
														datasets: [{
															data: Object.values(s.applications_by_status || {}),
															backgroundColor: [
																'rgba(13, 71, 161, 0.85)',
																'rgba(94, 208, 124, 0.85)',
																'rgba(255, 193, 7, 0.85)',
																'rgba(244, 67, 54, 0.85)',
																'rgba(158, 158, 158, 0.85)',
															],
															borderWidth: 1,
														}],
													}}
													options={{
														responsive: true,
														maintainAspectRatio: false,
														plugins: { legend: { position: 'bottom' } },
													}}
												/>
											) : (
												<p className="muted">No applications yet.</p>
											)}
										</div>
									</div>
								</div>
							)}
							<div className="auth-card dashboard-card staff-info-card">
								<h2 className="dashboard-section-title">Quick actions</h2>
								<p className="muted">Jump to management screens. All links open the correct panel.</p>
								<div className="staff-quick-actions-grid">
									{staffQuickActions.map((action, idx) => (
										<button
											key={idx}
											type="button"
											className="dashboard-action-btn"
											onClick={() => {
												setActivePanel(action.panel)
												action.load()
											}}
										>
											{action.label}
										</button>
									))}
								</div>
							</div>
							<div className="auth-card dashboard-card staff-info-card">
								<h2 className="dashboard-section-title">About</h2>
								<p className="muted">You can manage states, districts, and users (view, update, delete). Creating users, offices, roles, designations, and activity log are for system administrators.</p>
							</div>
						</>
					)}
				</div>
			)
		}

		// Admin dashboard home (system_admin only) – stats, charts, quick actions, activity
		const AdminIcon = ({ name, className = '' }) => {
			const icons = {
				chart: (
					<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
						<line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
					</svg>
				),
				users: (
					<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
						<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
					</svg>
				),
				building: (
					<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
						<path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /><path d="M9 9v.01" /><path d="M9 12v.01" /><path d="M9 15v.01" /><path d="M9 18v.01" />
					</svg>
				),
				file: (
					<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
						<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
					</svg>
				),
				activity: (
					<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
						<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
					</svg>
				),
			}
			return icons[name] || null
		}
		const stats = adminStats || {}
		const statCards = [
			{ label: 'States', value: stats.states_count, icon: 'chart' },
			{ label: 'Districts', value: stats.districts_count, icon: 'chart' },
			{ label: 'Offices', value: stats.offices_count, icon: 'building' },
			{ label: 'Users', value: stats.users_count, icon: 'users' },
			{ label: 'Roles', value: stats.roles_count, icon: 'file' },
			{ label: 'Designations', value: stats.designations_count, icon: 'file' },
			{ label: 'Tenancy applications', value: stats.applications_count, icon: 'file' },
		]
		const quickLinks = [
			{ label: 'State Management', panel: 'state', icon: 'chart', load: () => { loadStates(1) } },
			{ label: 'District Management', panel: 'district', icon: 'chart', load: () => { loadStates(1); loadDistricts(1) } },
			{ label: 'Office Management', panel: 'office', icon: 'building', load: () => { loadAllStates(); loadAllDistricts(); loadOffices(1) } },
			{ label: 'Designation', panel: 'designation', icon: 'file', load: () => loadDesignations(1) },
			{ label: 'Role Management', panel: 'role', icon: 'file', load: () => loadRoles(1) },
			{ label: 'User Management', panel: 'user', icon: 'users', load: () => loadUsers() },
			{ label: 'Activity Log', panel: 'user-activity-log', icon: 'activity', load: () => { loadActivityUsers(); loadActivityLogs(1) } },
		]
		const formatActivityTime = (str) => {
			if (!str) return '—'
			try {
				const d = new Date(str)
				return Number.isNaN(d.getTime()) ? str : d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
			} catch {
				return str
			}
		}
		return (
			<div className="dashboard-home admin-dashboard-home">
				<div className="auth-card dashboard-card dashboard-welcome-card">
					<h1 className="dashboard-title-with-icon">
						<AdminIcon name="chart" className="dashboard-heading-icon" />
						Admin dashboard
					</h1>
					<p className="muted">You are signed in as:</p>
					<div className="user-pill">
						<strong>{user?.name}</strong>
						<span>{user?.email}</span>
						{user?.role && <span className="user-pill-role">{user.role.replace(/_/g, ' ')}</span>}
					</div>
					<button onClick={onLogout} className="secondary" style={{ marginTop: 12 }}>
						Log out
					</button>
				</div>
				{adminStatsLoading ? (
					<div className="dashboard-stats-loading">Loading dashboard…</div>
				) : (
					<>
						<div className="dashboard-overview-cards admin-stats-cards">
							{statCards.map((card) => (
								<div key={card.label} className="dashboard-stat-card">
									<span className="dashboard-stat-icon-wrap">
										<AdminIcon name={card.icon} className="dashboard-stat-icon" />
									</span>
									<span className="dashboard-stat-value">{card.value ?? '—'}</span>
									<span className="dashboard-stat-label">{card.label}</span>
								</div>
							))}
						</div>
						{adminStats && (
							<div className="dashboard-charts-row">
								<div className="auth-card dashboard-card dashboard-chart-card">
									<h2 className="dashboard-section-title">Overview (counts)</h2>
									<p className="muted">Entities in the system.</p>
									<div className="dashboard-chart-wrap">
										<Bar
											data={{
												labels: ['States', 'Districts', 'Offices', 'Users', 'Roles', 'Designations'],
												datasets: [{
													label: 'Count',
													data: [
														stats.states_count ?? 0,
														stats.districts_count ?? 0,
														stats.offices_count ?? 0,
														stats.users_count ?? 0,
														stats.roles_count ?? 0,
														stats.designations_count ?? 0,
													],
													backgroundColor: [
														'rgba(13, 71, 161, 0.8)',
														'rgba(13, 71, 161, 0.7)',
														'rgba(13, 71, 161, 0.6)',
														'rgba(13, 71, 161, 0.75)',
														'rgba(13, 71, 161, 0.65)',
														'rgba(13, 71, 161, 0.55)',
													],
													borderColor: ['#0d47a1', '#0d47a1', '#0d47a1', '#0d47a1', '#0d47a1', '#0d47a1'],
													borderWidth: 1,
												}],
											}}
											options={{
												responsive: true,
												maintainAspectRatio: false,
												plugins: {
													legend: { display: false },
													tooltip: { mode: 'index', intersect: false },
												},
												scales: {
													y: { beginAtZero: true, ticks: { stepSize: 1 } },
												},
											}}
										/>
									</div>
								</div>
								<div className="auth-card dashboard-card dashboard-chart-card">
									<h2 className="dashboard-section-title">Applications by status</h2>
									<p className="muted">Tenancy certificate applications.</p>
									<div className="dashboard-chart-wrap dashboard-chart-wrap--doughnut">
										{Object.keys(stats.applications_by_status || {}).length > 0 ? (
											<Doughnut
												data={{
													labels: Object.keys(stats.applications_by_status || {}),
													datasets: [{
														data: Object.values(stats.applications_by_status || {}),
														backgroundColor: [
															'rgba(13, 71, 161, 0.85)',
															'rgba(27, 94, 32, 0.85)',
															'rgba(245, 124, 0, 0.85)',
															'rgba(198, 40, 40, 0.85)',
															'rgba(94, 208, 124, 0.85)',
														],
														borderColor: '#fff',
														borderWidth: 2,
													}],
												}}
												options={{
													responsive: true,
													maintainAspectRatio: false,
													plugins: {
														legend: { position: 'bottom' },
														tooltip: { mode: 'index' },
													},
												}}
											/>
										) : (
											<div className="dashboard-chart-empty">No application data yet.</div>
										)}
									</div>
								</div>
							</div>
						)}
						<div className="auth-card dashboard-card">
							<h2 className="dashboard-section-title">
								<AdminIcon name="activity" className="dashboard-section-icon" />
								Quick actions
							</h2>
							<p className="muted">Jump to management sections.</p>
							<div className="dashboard-quick-actions">
								{quickLinks.map((link) => (
									<button
										key={link.panel}
										type="button"
										className="dashboard-action-btn"
										onClick={() => {
											link.load()
											setActivePanel(link.panel)
											setError('')
											setSuccess('')
										}}
									>
										<AdminIcon name={link.icon} className="dashboard-action-icon" />
										{link.label}
									</button>
								))}
							</div>
						</div>
						<div className="auth-card dashboard-card">
							<h2 className="dashboard-section-title">
								<AdminIcon name="activity" className="dashboard-section-icon" />
								Recent activity
							</h2>
							<p className="muted">Latest user actions and sign-ins.</p>
							{adminRecentActivity.length === 0 ? (
								<p className="muted">No recent activity.</p>
							) : (
								<div className="admin-table-wrapper">
									<table className="admin-table">
										<thead>
											<tr>
												<th>User</th>
												<th>Action</th>
												<th>Time</th>
											</tr>
										</thead>
										<tbody>
											{adminRecentActivity.slice(0, 5).map((log, idx) => (
												<tr key={log.id || idx}>
													<td>{log.user?.name || log.user_name || '—'}</td>
													<td>{log.action || '—'}</td>
													<td>{formatActivityTime(log.logged_at || log.created_at)}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
							<button
								type="button"
								className="dashboard-action-btn"
								style={{ marginTop: 12 }}
								onClick={() => {
									loadActivityUsers()
									loadActivityLogs(1)
									setActivePanel('user-activity-log')
								}}
							>
								View full activity log
							</button>
						</div>
					</>
				)}
			</div>
		)
	}

	return (
		<section className="dashboard-layout">
			<aside className="dashboard-menu">
				<h2>Menu</h2>
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
								className="dashboard-link dashboard-link-expandable"
								href="#services-menu"
								onClick={(e) => {
									e.preventDefault()
									setServicesMenuOpen((prev) => !prev)
								}}
							>
								<span>Services</span>
								<span className={`dashboard-link-chevron ${servicesMenuOpen ? 'open' : ''}`} aria-hidden>▼</span>
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
					{user?.role !== 'tenant owner' && user?.role !== 'system_admin' ? (
						<>
							<a
								className="dashboard-link"
								href="#status"
								onClick={(e) => {
									e.preventDefault()
									setActivePanel('status')
									loadStatusApplications(1)
									setError('')
									setSuccess('')
								}}
							>
								Application Status
							</a>
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
								className="dashboard-link dashboard-link-expandable"
								href="#staff-user-menu"
								onClick={(e) => {
									e.preventDefault()
									setUserMenuOpen((prev) => !prev)
								}}
							>
								<span>User Management</span>
								<span className={`dashboard-link-chevron ${userMenuOpen ? 'open' : ''}`} aria-hidden>▼</span>
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
						</>
					) : null}
					{user?.role === 'system_admin' ? (
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
								className="dashboard-link dashboard-link-expandable"
								href="#office-menu"
								onClick={(e) => {
									e.preventDefault()
									setOfficeMenuOpen((prev) => !prev)
								}}
							>
								<span>Office Management</span>
								<span className={`dashboard-link-chevron ${officeMenuOpen ? 'open' : ''}`} aria-hidden>▼</span>
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
								className="dashboard-link dashboard-link-expandable"
								href="#user-menu"
								onClick={(e) => {
									e.preventDefault()
									setUserMenuOpen((prev) => !prev)
								}}
							>
								<span>User Management</span>
								<span className={`dashboard-link-chevron ${userMenuOpen ? 'open' : ''}`} aria-hidden>▼</span>
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
