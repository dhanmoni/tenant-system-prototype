import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useParams, useNavigate, useOutletContext, useLocation } from 'react-router-dom'
import api from '../../../api'
import { Icon } from '../../../components/dashboard/Icons'
import WorkflowConfirmModal from '../../../components/dashboard/WorkflowConfirmModal'
import { STATUS, STATUS_LABELS } from '../../../constants/status'
import { APPLICATION_LABELS, APPLICATION_TYPES } from '../../../constants/application'
import { ROLES, ASSISTANT_ROLES, PRINCIPAL_ROLES } from '../../../constants/roles'
import { adminStatusBadgeClass, adminStatusLabel } from '../../../utils/adminStatusBadge'
import { formatDate, formatDateTime } from '../../../utils/formatters'
import { getAssistantForwardOfficeLabel } from '../../../utils/applicationStatusProgress'
import { buildServiceFormDocument } from '../../../utils/buildServiceFormDocument'
import ProceedingModal from '../../../components/dashboard/ProceedingModal'
import NoticeDocumentViewer from '../../../components/dashboard/NoticeDocumentViewer'
import './ApplicationDetails.css'

const EXCLUDED_FIELDS = new Set([
	'id',
	'user_id',
	'user',
	'district_id',
	'forwarded_by_user_id',
	'rejected_by_user_id',
	'approved_by_user_id',
	'forwarded_by',
	'rejected_by',
	'approved_by',
	'movement_history',
	'edit_history',
	'created_at',
	'updated_at',
	'deleted_at',
	'assigned_to_role',
	'ref_code',
	'wizard_step',
	'current_with',
	'initiator_role',
	'initiator_completed',
	'second_party_completed',
	'landlord_user_id',
	'tenant_user_id',
	'office_id',
	'village_ward_id',
	'village_name',
	'area_type',
	'local_body',
	'application_type',
	'assigned_valuer',
	'office',
	'village_ward',
])

const WORKFLOW_FIELDS = new Set([
	'forwarded_at',
	'rejected_at',
	'approved_at',
	'rejection_message',
	'approval_message',
	'forward_remarks',
])

const SUMMARY_FIELDS = ['district', 'form_type', 'status']

const UIN_FIELDS = new Set([
	'tenancy_uin',
	'rent_authority_uid',
	'rent_court_uid',
	'uid',
])

const NON_EDITABLE_KEYS = new Set([
	...EXCLUDED_FIELDS,
	...UIN_FIELDS,
	'application_no',
	'status',
	'district',
	'district_id',
	'form_type',
	'forwarded_at',
	'rejected_at',
	'approved_at',
	'rejection_message',
	'approval_message',
	'forward_remarks',
	'ref_code',
	'wizard_step',
	'current_with',
	'initiator_role',
	'initiator_completed',
	'second_party_completed',
	'landlord_user_id',
	'tenant_user_id',
	'office_id',
	'village_ward_id',
	'village_name',
	'area_type',
	'local_body',
	'application_type',
	'assigned_valuer_id',
	'valuer_assigned_at',
	'valuer_report',
	'valuer_report_submitted_at',
])

const TENANCY_FIELD_SECTIONS = [
	{ title: 'Registration', prefixes: ['registration_date', 'apply_type'] },
	{ title: 'Landlord details', prefixes: ['landlord_'] },
	{ title: 'Tenant details', prefixes: ['tenant_'] },
	{ title: 'Manager details', prefixes: ['manager_'] },
	{ title: 'Property & charges', prefixes: ['property_'] },
]

const SERVICE_FIELD_SECTIONS = [
	{
		title: 'Applicant & parties',
		prefixes: [
			'applicant_',
			'appellant_',
			'landlord_',
			'tenant_',
			'signed_',
			'signature_',
			'respondent_',
		],
	},
	{
		title: 'Property & premises',
		prefixes: ['property_', 'premises_', 'building_', 'schedule_'],
	},
	{
		title: 'Rent & charges',
		prefixes: ['rent_', 'charge_', 'other_charges', 'existing_', 'amount'],
	},
	{
		title: 'Case & filing',
		prefixes: [
			'case_',
			'order_',
			'appeal_',
			'filing_',
			'court_',
			'authority_',
			'tenancy_agreement',
			'reason_',
			'grounds_',
			'prayer_',
		],
	},
]

function hasDisplayValue(value) {
	if (value === null || value === undefined || value === '') return false
	if (typeof value === 'string' && value.trim() === '') return false
	if (value === '-') return false
	return true
}

function labelize(key) {
	if (
		key === 'rent_authority_uid' ||
		key === 'rent_court_uid' ||
		key === 'tenancy_uin' ||
		key === 'uid'
	) {
		return 'Tenancy UIN'
	}
	if (key === 'form_type') return 'Form type'
	if (key === 'application_no') return 'Application number'
	return key
		.split('_')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ')
}

/**
 * Returns the two valid workflow transitions for a given form type.
 * Each application can only move between its assistant (Submitted) and principal (In Review).
 */
function getValidTransitions(formType) {
	const RA_TYPES = [
		APPLICATION_TYPES.RENT_REVISION,
		APPLICATION_TYPES.OTHER_CHARGES_REVISION,
		APPLICATION_TYPES.VALUER_APPOINTMENT,
		APPLICATION_TYPES.RENT_AUTHORITY_FILING,
		APPLICATION_TYPES.TENANCY_CERTIFICATE,
	]
	const RC_TYPES = [
		APPLICATION_TYPES.RENT_COURT_POSSESSION,
		APPLICATION_TYPES.RENT_COURT_FILING,
		APPLICATION_TYPES.RENT_COURT_APPEAL,
	]
	const RT_TYPES = [
		APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL,
	]

	if (RA_TYPES.includes(formType)) {
		return [
			{ role: ROLES.RA_ASSISTANT, status: 'SUBMITTED', label: 'RA Assistant — Submitted' },
			{ role: ROLES.RENT_AUTHORITY, status: 'IN_REVIEW', label: 'Rent Authority — In Review' },
		]
	}
	if (RC_TYPES.includes(formType)) {
		return [
			{ role: ROLES.RC_ASSISTANT, status: 'SUBMITTED', label: 'RC Assistant — Submitted' },
			{ role: ROLES.RENT_COURT, status: 'IN_REVIEW', label: 'Rent Court — In Review' },
		]
	}
	if (RT_TYPES.includes(formType)) {
		return [
			{ role: ROLES.RT_ASSISTANT, status: 'SUBMITTED', label: 'RT Assistant — Submitted' },
			{ role: ROLES.RENT_TRIBUNAL, status: 'IN_REVIEW', label: 'Rent Tribunal — In Review' },
		]
	}
	return null
}

function isFileField(key) {
	return /path|image|pdf/i.test(key)
}

function isEditableField(key) {
	return !NON_EDITABLE_KEYS.has(key) && !isFileField(key)
}

function isWideEditField(key) {
	return (
		key.includes('address') ||
		key.includes('reason') ||
		key.includes('description') ||
		key.includes('grounds') ||
		key.includes('prayer') ||
		key.includes('remarks') ||
		key.includes('details') ||
		key.includes('particulars') ||
		key.includes('schedule')
	)
}

function buildEditSections(editForm, formType) {
	const fields = Object.entries(editForm).filter(([key]) => isEditableField(key))
	return groupDetailFields(fields, formType).filter((section) =>
		section.fields.some(([key]) => isEditableField(key))
	)
}

function getUinValue(app) {
	if (!app) return null
	for (const key of UIN_FIELDS) {
		if (hasDisplayValue(app[key])) return app[key]
	}
	return null
}

function groupDetailFields(fields, formType) {
	if (formType === APPLICATION_TYPES.TENANCY_CERTIFICATE) {
		const sections = TENANCY_FIELD_SECTIONS.map((section) => ({
			title: section.title,
			fields: fields.filter(([key]) =>
				section.prefixes.some(
					(prefix) => key === prefix || key.startsWith(prefix)
				)
			),
		})).filter((section) => section.fields.length > 0)

		const assigned = new Set(sections.flatMap((s) => s.fields.map(([key]) => key)))
		const other = fields.filter(([key]) => !assigned.has(key))
		if (other.length > 0) {
			sections.push({ title: 'Other details', fields: other })
		}

		return sections.length > 0 ? sections : [{ title: 'Application details', fields }]
	}

	const sections = SERVICE_FIELD_SECTIONS.map((section) => ({
		title: section.title,
		fields: fields.filter(([key]) =>
			section.prefixes.some(
				(prefix) => key === prefix || key.startsWith(prefix)
			)
		),
	})).filter((section) => section.fields.length > 0)

	const assigned = new Set(sections.flatMap((s) => s.fields.map(([key]) => key)))
	const documents = fields.filter(([key]) => isFileField(key) && !assigned.has(key))
	const other = fields.filter(([key]) => !assigned.has(key) && !isFileField(key))

	if (documents.length > 0) {
		sections.push({ title: 'Documents & uploads', fields: documents })
	}
	if (other.length > 0) {
		sections.push({ title: 'Other details', fields: other })
	}

	return sections.length > 0 ? sections : [{ title: 'Application details', fields }]
}

function buildEditForm(app) {
	if (!app) return {}
	const form = {}
	for (const [key, value] of Object.entries(app)) {
		if (!isEditableField(key)) continue
		// Skip nested relation objects — only scalar form fields are editable
		if (value !== null && typeof value === 'object') continue
		form[key] = value ?? ''
	}
	return form
}

const AdminApplicationDetails = () => {
	const { applicationNo } = useParams()
	const navigate = useNavigate()
	const location = useLocation()
	const { user } = useOutletContext()
	const fromTenancy =
		location.state?.from === 'tenancy' ||
		location.pathname.includes('/admin/tenancy/')
	const listPath = fromTenancy ? '/dashboard/admin/tenancy' : '/dashboard/admin/applications'
	const listLabel = fromTenancy ? 'tenancy applications' : 'service applications'
	const [application, setApplication] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [actionLoading, setActionLoading] = useState(false)
	const [superAdminControls, setSuperAdminControls] = useState({ status: '', assigned_to_role: '' })
	const [isEditing, setIsEditing] = useState(false)
	const [editForm, setEditForm] = useState({})
	const [saveError, setSaveError] = useState('')
	const [valuers, setValuers] = useState([])
	const [selectedValuerId, setSelectedValuerId] = useState('')
	const [valuerReport, setValuerReport] = useState('')
	const [workflowModal, setWorkflowModal] = useState(null)
	const [workflowMessage, setWorkflowMessage] = useState('')
	const [successModal, setSuccessModal] = useState(null)
	const [docPreview, setDocPreview] = useState(null)
	const [agreementLoading, setAgreementLoading] = useState(false)
	const [viewerScale, setViewerScale] = useState(1)
	const [viewerMode, setViewerMode] = useState('fit')
	const [paperHeight, setPaperHeight] = useState(1100)
	
	// Case Proceedings State
	const [proceedings, setProceedings] = useState([])
	const [proceedingsLoading, setProceedingsLoading] = useState(false)
	const [showProceedingModal, setShowProceedingModal] = useState(false)
	const [proceedingSubmitting, setProceedingSubmitting] = useState(false)
	const [viewProceedingDoc, setViewProceedingDoc] = useState(null)

	const viewerStageRef = useRef(null)
	const paperRef = useRef(null)
	const viewerModeRef = useRef('fit')

	const forwardOffice = getAssistantForwardOfficeLabel(user?.role)

	const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN
	const isDistrictAdmin = user?.role === ROLES.DISTRICT_ADMIN

	useEffect(() => {
		viewerModeRef.current = viewerMode
	}, [viewerMode])

	const updatePaperHeight = useCallback(() => {
		if (paperRef.current) {
			setPaperHeight(paperRef.current.scrollHeight || 1100)
		}
	}, [])

	const computeFitScale = useCallback(() => {
		const stage = viewerStageRef.current
		const paper = paperRef.current
		if (!stage || !paper) return 1
		const available = Math.max(240, stage.clientWidth - 28)
		const naturalWidth = paper.scrollWidth || 794
		return Math.min(1, available / naturalWidth)
	}, [])

	const fitViewerToWidth = useCallback(() => {
		const next = computeFitScale()
		setViewerMode('fit')
		setViewerScale(next)
		updatePaperHeight()
	}, [computeFitScale, updatePaperHeight])

	const zoomBy = (delta) => {
		setViewerMode('manual')
		setViewerScale((prev) => {
			const next = Math.min(2, Math.max(0.4, Math.round((prev + delta) * 20) / 20))
			return next
		})
	}

	const zoomToActual = () => {
		setViewerMode('manual')
		setViewerScale(1)
	}
	const closeDocPreview = useCallback(() => {
		setDocPreview((prev) => {
			if (prev?.revokeOnClose && prev.url) {
				URL.revokeObjectURL(prev.url)
			}
			return null
		})
	}, [])

	const openInPrintWindow = (html) => {
		const printWindow = window.open('', '_blank')
		if (!printWindow) return
		printWindow.document.write(html)
		printWindow.document.close()
	}

	const handlePrintTenancyForm = async () => {
		if (!application?.application_no) return
		try {
			setActionLoading(true)
			const res = await api.get(
				`/api/tenancy-applications/${application.application_no}/application-details?print=1`
			)
			openInPrintWindow(res.data)
		} catch (err) {
			alert(err?.response?.data?.message || 'Failed to open printable application.')
		} finally {
			setActionLoading(false)
		}
	}

	const handleViewAgreement = async () => {
		if (!application?.application_no || !application?.agreement_pdf_path) return
		try {
			setAgreementLoading(true)
			const res = await api.get(
				`/api/tenancy-applications/${application.application_no}/agreement`,
				{ responseType: 'blob' }
			)
			const contentType = res.headers?.['content-type'] || ''
			if (contentType.includes('application/json')) {
				const text = await res.data.text()
				const parsed = JSON.parse(text)
				throw new Error(parsed.message || 'Failed to open agreement.')
			}
			const url = URL.createObjectURL(res.data)
			setDocPreview({
				title: 'Registered tenancy agreement',
				url,
				isPdf: true,
				revokeOnClose: true,
			})
		} catch (err) {
			let message = 'Failed to open agreement PDF.'
			const data = err?.response?.data
			if (data instanceof Blob) {
				try {
					const parsed = JSON.parse(await data.text())
					message = parsed.message || message
				} catch {
					/* keep default */
				}
			} else if (err?.message) {
				message = err.message
			}
			alert(message)
		} finally {
			setAgreementLoading(false)
		}
	}

	const fetchProceedings = async (app) => {
		if (!app) return
		const formType = app.form_type || APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL;
		try {
			setProceedingsLoading(true)
			const res = await api.get(`/api/admin/applications/${formType}/${app.id}/proceedings`)
			setProceedings(res.data.proceedings || [])
		} catch (err) {
			console.error('Failed to fetch proceedings', err)
		} finally {
			setProceedingsLoading(false)
		}
	}

	const handleProceedingSubmit = async (formData) => {
		try {
			setProceedingSubmitting(true)
			const formType = application.form_type || APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL;
			const res = await api.post(`/api/admin/applications/${formType}/${application.id}/proceedings`, formData)
			setProceedings([res.data.proceeding, ...proceedings])
			setShowProceedingModal(false)
		} catch (err) {
			alert(err?.response?.data?.message || 'Failed to save proceeding')
		} finally {
			setProceedingSubmitting(false)
		}
	}

	useEffect(() => {
		fetchDetails()
	}, [applicationNo])

	useEffect(() => {
		if (application) {
			fetchProceedings(application)
		}
	}, [application?.id])

	const renderProceedings = () => {
		if (!application) return null

		const isRtAppeal =
			application.form_type === APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL ||
			user?.role === ROLES.RT_ASSISTANT ||
			user?.role === ROLES.RENT_TRIBUNAL;

		if (!isRtAppeal) {
			return null
		}

		return (
			<section className="admin-app-details__card ws-card">
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
					<h3 className="admin-app-details__section-title" style={{ margin: 0 }}>Case Proceedings & Notices</h3>
					{(user?.role === ROLES.RT_ASSISTANT || user?.role === ROLES.RENT_TRIBUNAL) && (
						<button className="ws-btn ws-btn--primary ws-btn--sm" type="button" onClick={() => setShowProceedingModal(true)}>
							Add Proceeding
						</button>
					)}
				</div>
				{proceedingsLoading ? (
					<p>Loading proceedings...</p>
				) : proceedings.length === 0 ? (
					<p>No proceedings found.</p>
				) : (
					<div className="admin-app-details__grid" style={{ gap: '1rem' }}>
						{proceedings.map((p) => (
							<div key={p.id} className="admin-app-details__field" style={{ border: '1px solid var(--clr-neutral-200)', padding: '1rem', borderRadius: '4px' }}>
								<div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
									{new Date(p.created_at).toLocaleDateString()} - {p.notice_type.replace('_', ' ').toUpperCase()}
								</div>
								{p.hearing_date && <div>Hearing: {p.hearing_date} {p.hearing_time}</div>}
								<small>Sent by: {p.sent_by?.name || 'Unknown'}</small>
								<div style={{ marginTop: '0.5rem' }}>
									<button type="button" className="ws-btn ws-btn--secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setViewProceedingDoc(p)}>
										View Document
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</section>
		)
	}

	useEffect(() => {
		if (!docPreview) return undefined
		const onKey = (event) => {
			if (event.key === 'Escape') closeDocPreview()
		}
		document.addEventListener('keydown', onKey)
		const prev = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.removeEventListener('keydown', onKey)
			document.body.style.overflow = prev
		}
	}, [docPreview, closeDocPreview])

	useEffect(() => {
		if (!application || user?.role !== ROLES.SUPER_ADMIN) {
			return undefined
		}

		const syncViewer = () => {
			updatePaperHeight()
			if (viewerModeRef.current === 'fit') {
				setViewerScale(computeFitScale())
			}
		}

		syncViewer()
		const frame = window.requestAnimationFrame(syncViewer)
		const observer = new ResizeObserver(syncViewer)
		if (viewerStageRef.current) observer.observe(viewerStageRef.current)
		if (paperRef.current) observer.observe(paperRef.current)
		window.addEventListener('resize', syncViewer)
		return () => {
			window.cancelAnimationFrame(frame)
			observer.disconnect()
			window.removeEventListener('resize', syncViewer)
		}
	}, [application, user?.role, computeFitScale, updatePaperHeight])

	useEffect(() => {
		updatePaperHeight()
	}, [viewerScale, updatePaperHeight])

	const fetchDetails = async ({ silent = false } = {}) => {
		try {
			if (!silent) setLoading(true)
			const response = await api.get(`/api/admin/applications/${applicationNo}`)
			const app = response.data.application
			setApplication(app)
			// Initialize superadmin controls to a valid transition for this form type
			const transitions = getValidTransitions(app.form_type)
			if (transitions) {
				const currentCombo = `${app.assigned_to_role || ''}|${app.status || ''}`
				const match = transitions.find(t => `${t.role}|${t.status}` === currentCombo)
				const selected = match || transitions[0]
				setSuperAdminControls({
					status: selected.status,
					assigned_to_role: selected.role,
				})
			} else {
				setSuperAdminControls({
					status: app.status || '',
					assigned_to_role: app.assigned_to_role || ''
				})
			}
			setError(null)
		} catch (err) {
			console.error('Error fetching application details:', err)
			setError('Failed to load application details.')
		} finally {
			if (!silent) setLoading(false)
		}
	}

	const fetchValuers = async () => {
		try {
			const { data } = await api.get('/api/users?role=valuer')
			// The backend currently might just return assistants and valuers together for RA, we can filter it locally
			const valuerUsers = (data.users || []).filter(u => u.role === ROLES.VALUER)
			setValuers(valuerUsers)
		} catch (err) {
			console.error('Error fetching valuers:', err)
		}
	}

	useEffect(() => {
		if (user?.role === ROLES.RENT_AUTHORITY && application?.form_type === APPLICATION_TYPES.VALUER_APPOINTMENT) {
			fetchValuers()
		}
	}, [user?.role, application?.form_type])

	const handleAssignValuer = async () => {
		if (!selectedValuerId) return alert('Please select a valuer')
		setActionLoading(true)
		try {
			await api.post(`/api/admin/applications/${application.id}/assign-valuer`, {
				assigned_valuer_id: selectedValuerId
			})
			alert('Valuer assigned successfully')
			fetchDetails()
		} catch (err) {
			console.error(err)
			alert(err.response?.data?.message || 'Failed to assign valuer')
		} finally {
			setActionLoading(false)
		}
	}

	const handleRemoveValuer = async () => {
		if (!window.confirm('Are you sure you want to remove the assigned valuer?')) return;
		setActionLoading(true)
		try {
			await api.post(`/api/admin/applications/${application.id}/remove-valuer`)
			alert('Valuer removed successfully')
			fetchDetails()
		} catch (err) {
			console.error(err)
			alert(err.response?.data?.message || 'Failed to remove valuer')
		} finally {
			setActionLoading(false)
		}
	}

	const handleSubmitValuerReport = async () => {
		if (!valuerReport.trim()) return alert('Please enter the report')
		setActionLoading(true)
		try {
			await api.post(`/api/admin/applications/${application.id}/submit-valuer-report`, {
				valuer_report: valuerReport
			})
			alert('Report submitted successfully')
			fetchDetails()
		} catch (err) {
			console.error(err)
			alert(err.response?.data?.message || 'Failed to submit report')
		} finally {
			setActionLoading(false)
		}
	}

	const openWorkflowModal = (action) => {
		setWorkflowMessage('')
		setWorkflowModal(action)
	}

	const closeWorkflowModal = () => {
		if (actionLoading) return
		setWorkflowModal(null)
		setWorkflowMessage('')
	}

	const handleWorkflowConfirm = async () => {
		if (!application || !workflowModal) return

		const trimmed = workflowMessage.trim()
		const needsMessage = workflowModal === 'approve' || workflowModal === 'reject'
		if (needsMessage && !trimmed) return

		const payload =
			workflowModal === 'forward'
				? { remarks: trimmed || undefined }
				: { message: trimmed }

		try {
			setActionLoading(true)
			await api.post(
				`/api/admin/applications/${application.form_type}/${application.id}/${workflowModal}`,
				payload
			)
			const labels = {
				forward: 'moved to review',
				approve: 'approved',
				reject: 'rejected',
			}
			setWorkflowModal(null)
			setWorkflowMessage('')
			setSuccessModal({
				title: `Application ${labels[workflowModal] || 'updated'}`,
				description:
					needsMessage
						? `${application.application_no} was ${labels[workflowModal]}. Message recorded: "${trimmed}"`
						: `${application.application_no} was ${labels[workflowModal]}${trimmed ? `. Remarks: "${trimmed}"` : ''}.`,
			})
			await fetchDetails({ silent: true })
		} catch (err) {
			console.error(`Error during ${workflowModal}:`, err)
			alert(err.response?.data?.message || `Failed to ${workflowModal} application.`)
		} finally {
			setActionLoading(false)
		}
	}

	const handleSuperAdminMove = async () => {
		if (
			!isSuperAdmin ||
			application?.form_type === APPLICATION_TYPES.TENANCY_CERTIFICATE
		) {
			return
		}
		if (!window.confirm('Are you sure you want to forcefully move this application?')) return

		try {
			setActionLoading(true)
			await api.post(
				`/api/admin/applications/${application.form_type}/${application.id}/superadmin-move`,
				superAdminControls
			)
			alert('Application moved successfully.')
			fetchDetails()
		} catch (err) {
			console.error('Error during superadmin move:', err)
			alert('Failed to move application.')
		} finally {
			setActionLoading(false)
		}
	}

	const startEditing = () => {
		if (!isDistrictAdmin || !application) return
		setEditForm(buildEditForm(application))
		setSaveError('')
		setIsEditing(true)
	}

	const cancelEditing = () => {
		setIsEditing(false)
		setEditForm({})
		setSaveError('')
	}

	const handleFieldChange = (key, value) => {
		setEditForm((prev) => ({ ...prev, [key]: value }))
	}

	const handleSave = async () => {
		if (!isDistrictAdmin || !application?.form_type || !application?.id) {
			return
		}
		setSaveError('')
		setActionLoading(true)
		try {
			const normalize = (value) => {
				if (value === null || value === undefined || value === '') return null
				if (typeof value === 'boolean') return value ? '1' : '0'
				if (typeof value === 'string') {
					const trimmed = value.trim()
					if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) return trimmed.slice(0, 10)
					return trimmed
				}
				return String(value)
			}

			const payload = {}
			const localChanges = []
			for (const [key, value] of Object.entries(editForm)) {
				if (!isEditableField(key)) continue
				const next = value === '' ? null : value
				payload[key] = next
				if (normalize(application[key]) !== normalize(next)) {
					localChanges.push({
						field: key,
						from: application[key] ?? null,
						to: next,
					})
				}
			}

			if (localChanges.length === 0) {
				setIsEditing(false)
				setEditForm({})
				setSuccessModal({
					title: 'No changes made',
					description: `${application.application_no} was left unchanged.`,
					changes: [],
				})
				setActionLoading(false)
				return
			}

			const { data } = await api.put(
				`/api/admin/applications/${application.form_type}/${application.id}`,
				payload
			)
			const updated = data.application || {}
			const changes = Array.isArray(data.changes) ? data.changes : localChanges
			setApplication({
				...updated,
				form_type: updated.form_type || application.form_type,
			})
			setIsEditing(false)
			setEditForm({})
			setSuccessModal({
				title: 'Form updated',
				description: `${application.application_no} was saved successfully.`,
				changes,
			})
		} catch (err) {
			setSaveError(err?.response?.data?.message || 'Failed to save changes.')
		} finally {
			setActionLoading(false)
		}
	}

	const formLabel = useMemo(() => {
		if (!application?.form_type) return 'Application'
		return (
			APPLICATION_LABELS[application.form_type] ||
			labelize(application.form_type)
		)
	}, [application?.form_type])

	const { workflowFields, detailFields } = useMemo(() => {
		if (!application) {
			return { workflowFields: [], detailFields: [] }
		}

		const entries = Object.entries(application).filter(([key]) => !EXCLUDED_FIELDS.has(key))
		const workflow = []
		const details = []

		for (const [key, value] of entries) {
			if (['application_no'].includes(key)) continue

			if (SUMMARY_FIELDS.includes(key) || UIN_FIELDS.has(key)) {
				continue
			}

			if (WORKFLOW_FIELDS.has(key)) {
				if (hasDisplayValue(value)) workflow.push([key, value])
				continue
			}

			details.push([key, value])
		}

		return {
			workflowFields: workflow,
			detailFields: details,
		}
	}, [application])

	const renderValue = useCallback((key, value) => {
		if (!hasDisplayValue(value)) return <span className="admin-app-details__empty">—</span>
		if (typeof value === 'boolean') return value ? 'Yes' : 'No'

		if (
			key.toLowerCase().includes('path') ||
			key.toLowerCase().includes('image') ||
			key.toLowerCase().includes('pdf')
		) {
			if (typeof value === 'string' && (value.includes('/') || value.includes('\\'))) {
				const url = `${import.meta.env.VITE_API_URL}/storage/${value}`
				if (value.match(/\.(jpg|jpeg|png|gif)$/i)) {
					return (
						<div className="admin-app-details__media">
							<img
								src={url}
								alt={labelize(key)}
								className="admin-app-details__img"
								onClick={() => window.open(url, '_blank')}
							/>
							<a href={url} target="_blank" rel="noopener noreferrer" className="admin-app-details__link">
								View full image
							</a>
						</div>
					)
				}
				return (
					<a href={url} target="_blank" rel="noopener noreferrer" className="admin-app-details__link">
						View document
					</a>
				)
			}
		}

		if (key === 'status') {
			return (
				<span className={adminStatusBadgeClass(value)}>
					{adminStatusLabel(value)}
				</span>
			)
		}

		if (key === 'form_type') {
			return APPLICATION_LABELS[value] || labelize(value)
		}

		if (key.endsWith('_at')) {
			return formatDateTime(value) || formatDate(value) || value
		}

		if (key.endsWith('_date')) {
			return formatDate(value)
		}

		if (typeof value === 'object') {
			if (value?.name) return value.name
			return JSON.stringify(value)
		}

		return String(value)
	}, [])

	const renderEditInput = (key, value) => {
		const raw = editForm[key] ?? value ?? ''
		const inputId = `edit-field-${key}`
		if (typeof raw === 'boolean') {
			return (
				<select
					id={inputId}
					className="admin-app-details__input"
					value={String(raw)}
					onChange={(e) => handleFieldChange(key, e.target.value === 'true')}
				>
					<option value="true">Yes</option>
					<option value="false">No</option>
				</select>
			)
		}

		if (key.endsWith('_date') || key.includes('date')) {
			const dateVal = typeof raw === 'string' && raw.includes('T') ? raw.slice(0, 10) : raw
			return (
				<input
					id={inputId}
					type="date"
					className="admin-app-details__input"
					value={dateVal || ''}
					onChange={(e) => handleFieldChange(key, e.target.value)}
				/>
			)
		}

		if (
			typeof raw === 'number' ||
			(key.includes('phone') || key.includes('mobile') || key.includes('aadhar') || key.includes('pan'))
		) {
			return (
				<input
					id={inputId}
					type="text"
					className="admin-app-details__input"
					value={raw}
					onChange={(e) => handleFieldChange(key, e.target.value)}
					autoComplete="off"
				/>
			)
		}

		if (isWideEditField(key) || String(raw).length > 100) {
			return (
				<textarea
					id={inputId}
					className="admin-app-details__input admin-app-details__textarea"
					value={raw}
					rows={isWideEditField(key) ? 3 : 2}
					onChange={(e) => handleFieldChange(key, e.target.value)}
				/>
			)
		}

		return (
			<input
				id={inputId}
				type="text"
				className="admin-app-details__input"
				value={raw}
				onChange={(e) => handleFieldChange(key, e.target.value)}
				autoComplete="off"
			/>
		)
	}

	const renderFieldGrid = (fields, editable = false, dense = false) => {
		const visibleFields = editable
			? fields.filter(([key]) => isEditableField(key))
			: fields

		if (visibleFields.length === 0) return null

		return (
			<dl
				className={`admin-app-details__grid${
					dense ? ' admin-app-details__grid--dense' : ''
				}${editable ? ' admin-app-details__grid--edit' : ''}`}
			>
				{visibleFields.map(([key, value]) => (
					<div
						className={`admin-app-details__field${
							editable && isWideEditField(key) ? ' admin-app-details__field--wide' : ''
						}`}
						key={key}
					>
						<dt>{labelize(key)}</dt>
						<dd>{editable ? renderEditInput(key, value) : renderValue(key, value)}</dd>
					</div>
				))}
			</dl>
		)
	}

	const renderEditWorkspace = () => {
		const editSections = buildEditSections(editForm, application.form_type)
		return (
			<div className="admin-edit-form">
				<header className="admin-edit-form__header">
					<div className="admin-edit-form__header-text">
						<p className="admin-edit-form__eyebrow">Edit application</p>
						<h2 className="admin-edit-form__title">{formLabel}</h2>
						<p className="admin-edit-form__ref">{application.application_no}</p>
					</div>
					<p className="admin-edit-form__hint">
						These fields were filled in by the applicant when they applied. You can
						correct or update them here. Application number, UIN, status, district, and
						uploaded documents cannot be changed.
					</p>
				</header>

				<div className="admin-edit-form__body">
					{editSections.map((section) => {
						const fields = section.fields.filter(([key]) => isEditableField(key))
						if (fields.length === 0) return null
						return (
							<section className="admin-edit-form__section" key={section.title}>
								<div className="admin-edit-form__section-head">
									<h3 className="admin-edit-form__section-title">{section.title}</h3>
									<span className="admin-edit-form__section-tag">Applicant entered</span>
								</div>
								{renderFieldGrid(fields, true, false)}
							</section>
						)
					})}
				</div>
			</div>
		)
	}

	const formatEditValue = (value) => {
		if (value === null || value === undefined || value === '') return '—'
		if (typeof value === 'boolean') return value ? 'Yes' : 'No'
		return String(value)
	}

	const renderEditHistory = () => {
		const history = Array.isArray(application?.edit_history)
			? [...application.edit_history].reverse()
			: []
		if (history.length === 0) return null

		return (
			<section className="admin-edit-history no-print">
				<h2 className="admin-edit-history__title">District admin edit notes</h2>
				<p className="admin-edit-history__lead">
					Record of corrections made after the applicant submitted the form.
				</p>
				<ul className="admin-edit-history__list">
					{history.map((entry, index) => {
						const changes = Array.isArray(entry.changes) ? entry.changes : []
						const key = `${entry.edited_at || 'edit'}-${index}`
						return (
							<li className="admin-edit-history__item" key={key}>
								<div className="admin-edit-history__meta">
									<strong>{entry.edited_by || 'District admin'}</strong>
									<span>
										{entry.edited_at
											? formatDateTime(entry.edited_at) || formatDate(entry.edited_at)
											: '—'}
									</span>
								</div>
								<ul className="admin-edit-history__changes">
									{changes.map((change) => (
										<li key={`${key}-${change.field}`}>
											<span className="admin-edit-history__field">
												{labelize(change.field)}
											</span>
											<span className="admin-edit-history__diff">
												<span className="admin-edit-history__from">
													{formatEditValue(change.from)}
												</span>
												<span aria-hidden> → </span>
												<span className="admin-edit-history__to">
													{formatEditValue(change.to)}
												</span>
											</span>
										</li>
									))}
								</ul>
							</li>
						)
					})}
				</ul>
			</section>
		)
	}

	const renderStat = (label, content) => (
		<div className="admin-app-details__stat" key={label}>
			<span className="admin-app-details__stat-label">{label}</span>
			<span className="admin-app-details__stat-value">{content}</span>
		</div>
	)

	const renderValuerSections = () => {
		if (application?.form_type !== APPLICATION_TYPES.VALUER_APPOINTMENT) return null

		return (
			<>
				{user?.role === ROLES.RENT_AUTHORITY && (application.status === STATUS.IN_REVIEW || application.status === STATUS.VALUER_REPORT_SUBMITTED || application.status === STATUS.VALUER_ASSIGNED) && (
					<section className="admin-app-details__card admin-app-details__valuer-card" style={{ border: '1px solid var(--clr-primary-200)', backgroundColor: 'var(--clr-primary-50)' }}>
						<h3 className="admin-app-details__section-title" style={{ color: 'var(--clr-primary-700)' }}>Valuer Assignment</h3>
						
						{application.assigned_valuer_id ? (
							<div className="admin-app-details__grid" style={{ marginBottom: '1rem' }}>
								{renderStat('Assigned Valuer', application.assigned_valuer?.name || `Valuer ID: ${application.assigned_valuer_id}`)}
								{renderStat('Assigned Date', new Date(application.valuer_assigned_at).toLocaleString())}
							</div>
						) : (
							<p style={{ marginBottom: '1rem', color: 'var(--clr-gray-600)' }}>No valuer assigned yet.</p>
						)}

						<div className="admin-app-details__grid" style={{ alignItems: 'flex-end', marginBottom: '1rem' }}>
							<div className="admin-app-details__field">
								<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Assign / Reassign Valuer</label>
								<select
									className="ws-input"
									value={selectedValuerId}
									onChange={(e) => setSelectedValuerId(e.target.value)}
									disabled={actionLoading}
								>
									<option value="">-- Select a Valuer --</option>
									{valuers.map(v => (
										<option key={v.id} value={v.id}>{v.name} ({v.email})</option>
									))}
								</select>
							</div>
							<div style={{ display: 'flex', gap: '0.5rem' }}>
								<button
									type="button"
									className="ws-btn ws-btn--primary"
									onClick={handleAssignValuer}
									disabled={actionLoading || !selectedValuerId}
								>
									{application.assigned_valuer_id ? 'Reassign' : 'Assign'}
								</button>
								{application.assigned_valuer_id && (
									<button
										type="button"
										className="ws-btn ws-btn--danger"
										onClick={handleRemoveValuer}
										disabled={actionLoading}
									>
										Remove Valuer
									</button>
								)}
							</div>
						</div>

						{application.valuer_report && (
							<div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--clr-primary-200)' }}>
								<h4 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--clr-primary-700)' }}>Valuer's Report</h4>
								<div className="ws-card" style={{ backgroundColor: '#fff', padding: '1rem' }}>
									<p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{application.valuer_report}</p>
								</div>
							</div>
						)}
					</section>
				)}

				{user?.role === ROLES.VALUER && (
					<section className="admin-app-details__card admin-app-details__valuer-card" style={{ border: '1px solid var(--clr-info-200)', backgroundColor: 'var(--clr-info-50)' }}>
						<h3 className="admin-app-details__section-title" style={{ color: 'var(--clr-info-700)' }}>Submit Valuer Report</h3>
						{application.status === STATUS.VALUER_REPORT_SUBMITTED ? (
							<div className="ws-card" style={{ backgroundColor: '#fff', padding: '1rem' }}>
								<p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Report Submitted:</p>
								<p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{application.valuer_report}</p>
							</div>
						) : (
							<>
								<div className="admin-app-details__field" style={{ marginBottom: '1rem' }}>
									<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Your Report</label>
									<textarea
										className="ws-input"
										rows="5"
										value={valuerReport}
										onChange={(e) => setValuerReport(e.target.value)}
										placeholder="Enter your detailed report here..."
										disabled={actionLoading}
									/>
								</div>
								<button
									type="button"
									className="ws-btn ws-btn--primary"
									onClick={handleSubmitValuerReport}
									disabled={actionLoading || !valuerReport.trim()}
								>
									Submit Report
								</button>
							</>
						)}
					</section>
				)}
			</>
		)
	}

	const isTenancy = application?.form_type === APPLICATION_TYPES.TENANCY_CERTIFICATE
	const allowEditing = Boolean(isDistrictAdmin && application)
	const editing = allowEditing && isEditing
	// Real government form paper view for every role (edit mode uses field form instead)
	const isTenancyViewOnly = Boolean(application && isTenancy && !editing)
	const isServiceViewOnly = Boolean(application && !isTenancy && !editing)
	const isDocViewOnly = isTenancyViewOnly || isServiceViewOnly
	const serviceFormDoc = useMemo(
		() => (isServiceViewOnly ? buildServiceFormDocument(application) : null),
		[isServiceViewOnly, application]
	)

	if (loading) {
		return <div className="ws-dashboard-loading">Loading application details…</div>
	}

	if (error) {
		return (
			<div className="ws-alert ws-alert--error admin-app-details__alert" role="alert">
				{error}
			</div>
		)
	}

	if (!application) {
		return (
			<div className="ws-alert ws-alert--error admin-app-details__alert" role="alert">
				Application not found.
			</div>
		)
	}

	const statusClass = adminStatusBadgeClass(application.status)
	const statusText = adminStatusLabel(application.status)
	const detailSections = groupDetailFields(detailFields, application.form_type)
	const storageBase = (api.defaults.baseURL || '').replace(/\/$/, '')
	const hasManager =
		hasDisplayValue(application.manager_name) &&
		String(application.manager_name).toUpperCase() !== 'NA'
	const officeAddress = application.office?.name
		? `${application.office.name}${
				application.district?.name ? `, ${application.district.name}` : ''
			}`
		: application.district?.name || '________________________'
	const storageUrl = (path) => (path ? `${storageBase}/storage/${path}` : '')

	return (
		<div
			className={`admin-app-details${isDocViewOnly ? ' admin-tenancy-doc' : ''}${
				isServiceViewOnly ? ' admin-service-doc' : ''
			}`}
		>
			<div className="admin-app-details__toolbar no-print">
				<button
					type="button"
					className="ws-btn ws-btn--outline ws-btn--sm admin-app-details__back"
					onClick={() => (editing ? cancelEditing() : navigate(listPath))}
				>
					<Icon name="collapse" className="admin-app-details__back-icon" />
					{editing ? 'Exit edit mode' : `Back to ${listLabel}`}
				</button>

				<div className="admin-app-details__toolbar-actions">
					{isTenancyViewOnly ? (
						<>
							<button
								type="button"
								className="ws-btn ws-btn--outline ws-btn--sm"
								onClick={handlePrintTenancyForm}
								disabled={actionLoading}
							>
								{actionLoading ? 'Opening…' : 'Print / Save PDF'}
							</button>
							{application.agreement_pdf_path ? (
								<button
									type="button"
									className="ws-btn ws-btn--primary ws-btn--sm"
									onClick={handleViewAgreement}
									disabled={agreementLoading}
								>
									{agreementLoading ? 'Loading…' : 'View agreement'}
								</button>
							) : null}
						</>
					) : null}
					{allowEditing && !editing ? (
						<button
							type="button"
							className="ws-btn ws-btn--primary ws-btn--sm"
							onClick={startEditing}
						>
							<Icon name="edit" className="admin-app-details__btn-icon" />
							Edit application
						</button>
					) : null}
					{editing ? (
						<>
							<button
								type="button"
								className="ws-btn ws-btn--outline ws-btn--sm"
								onClick={cancelEditing}
								disabled={actionLoading}
							>
								Cancel
							</button>
							<button
								type="button"
								className="ws-btn ws-btn--primary ws-btn--sm"
								onClick={handleSave}
								disabled={actionLoading}
							>
								{actionLoading ? 'Saving…' : 'Save changes'}
							</button>
						</>
					) : null}
				</div>
			</div>

			{saveError ? (
				<div className="ws-alert ws-alert--error admin-app-details__alert" role="alert">
					{saveError}
				</div>
			) : null}

			{editing ? renderEditWorkspace() : null}

			{!editing && isTenancyViewOnly ? (
				<div className="admin-tenancy-doc__preview">
					<aside className="admin-tenancy-doc__registry no-print">
						<div className="admin-tenancy-doc__registry-item">
							<span>Application no.</span>
							<strong>{application.application_no}</strong>
						</div>
						{getUinValue(application) ? (
							<div className="admin-tenancy-doc__registry-item">
								<span>UIN</span>
								<strong>{getUinValue(application)}</strong>
							</div>
						) : null}
						<div className="admin-tenancy-doc__registry-item">
							<span>Status</span>
							<span className={statusClass}>{statusText}</span>
						</div>
						<div className="admin-tenancy-doc__registry-item">
							<span>Submitted on</span>
							<strong>{formatDate(application.created_at)}</strong>
						</div>
						{application.district?.name ? (
							<div className="admin-tenancy-doc__registry-item">
								<span>District</span>
								<strong>{application.district.name}</strong>
							</div>
						) : null}
						{application.apply_type ? (
							<div className="admin-tenancy-doc__registry-item">
								<span>Apply type</span>
								<strong>{labelize(String(application.apply_type))}</strong>
							</div>
						) : null}
					</aside>

					<div className="admin-tenancy-doc__viewer">
						<div className="admin-tenancy-doc__viewer-bar no-print">
							<span className="admin-tenancy-doc__viewer-label">
								Submitted form · First Schedule
							</span>
							<div className="admin-tenancy-doc__zoom" role="group" aria-label="Zoom controls">
								<button
									type="button"
									className="admin-tenancy-doc__zoom-btn"
									onClick={() => zoomBy(-0.1)}
									disabled={viewerScale <= 0.4}
									aria-label="Zoom out"
								>
									−
								</button>
								<span className="admin-tenancy-doc__zoom-value" aria-live="polite">
									{Math.round(viewerScale * 100)}%
								</span>
								<button
									type="button"
									className="admin-tenancy-doc__zoom-btn"
									onClick={() => zoomBy(0.1)}
									disabled={viewerScale >= 2}
									aria-label="Zoom in"
								>
									+
								</button>
								<button
									type="button"
									className={`admin-tenancy-doc__zoom-action${
										viewerMode === 'manual' && viewerScale === 1 ? ' is-active' : ''
									}`}
									onClick={zoomToActual}
								>
									100%
								</button>
								<button
									type="button"
									className={`admin-tenancy-doc__zoom-action${
										viewerMode === 'fit' ? ' is-active' : ''
									}`}
									onClick={fitViewerToWidth}
								>
									Fit width
								</button>
							</div>
						</div>
						<div className="admin-tenancy-doc__viewer-stage" ref={viewerStageRef}>
							<div
								className="admin-tenancy-doc__paper-frame"
								style={{
									width: `${794 * viewerScale}px`,
									height: `${paperHeight * viewerScale}px`,
								}}
							>
								<article
									className="govt-form-document admin-tenancy-doc__paper"
									ref={paperRef}
									style={{
										transform: `scale(${viewerScale})`,
									}}
								>
									<div className="govt-form-watermark">SUBMITTED</div>

									<header className="govt-form-header">
										<div className="admin-tenancy-doc__schedule">THE FIRST SCHEDULE</div>
										<div className="admin-tenancy-doc__section-ref">
											[See section 4(1) and 7(2)]
										</div>
										<div className="admin-tenancy-doc__form-title">
											FORM FOR INFORMATION OF TENANCY
										</div>
									</header>

									<div className="admin-tenancy-doc__addressee">
										<div>To,</div>
										<div>The Rent Authority</div>
										<div>{officeAddress} (Address)</div>
									</div>

									<div className="preview-list-container">
										{[
											[
												'1.',
												'Name and address of the landlord',
												application.landlord_name
													? `${application.landlord_name}, ${application.landlord_address || ''}`
													: '',
											],
											[
												'2.',
												'Name and address of the Property Manager (if any)',
												hasManager
													? `${application.manager_name}, ${application.manager_address || ''}`
													: '',
											],
											[
												'3.',
												'Name(s) and address of the tenant, including email and contact details',
												application.tenant_name
													? `${application.tenant_name}, ${application.tenant_address || ''}, Email: ${application.tenant_email || ''}, Phone: ${application.tenant_phone || ''}`
													: '',
											],
											[
												'4.',
												'Description of previous tenancy, if any',
												application.tenant_previous_tenancy || '',
											],
											[
												'5.',
												'Description of premises let to the tenant including appurtenant land, if any',
												application.property_premises_description || '',
											],
											[
												'6.',
												'Date from which possession is given to the tenant',
												formatDate(application.property_possession_date) ||
													application.property_possession_date ||
													'',
											],
											[
												'7.',
												'Rent payable as in section 8',
												application.property_rent_payable
													? `₹${application.property_rent_payable}`
													: '',
											],
											[
												'8.',
												'Furniture and other equipment provided to the tenant',
												application.property_furniture_description || '',
											],
										].map(([sl, label, value]) => (
											<div className="preview-list-item admin-tenancy-doc__row" key={sl}>
												<div className="admin-tenancy-doc__sl">{sl}</div>
												<div className="admin-tenancy-doc__label">{label}</div>
												<div className="admin-tenancy-doc__value">: {value}</div>
											</div>
										))}

										<div className="preview-list-item admin-tenancy-doc__row">
											<div className="admin-tenancy-doc__sl">9.</div>
											<div className="admin-tenancy-doc__label">
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
											<div className="admin-tenancy-doc__value admin-tenancy-doc__value--stack">
												<div>&nbsp;</div>
												<div>: {application.property_charge_electricity || ''}</div>
												<div>: {application.property_charge_water || ''}</div>
												<div>: {application.property_charge_furnishing || ''}</div>
												<div>: {application.property_charge_other_services || ''}</div>
											</div>
										</div>

										{[
											[
												'10.',
												'Attach rent or lease or tenancy agreement',
												application.agreement_pdf_path ? 'Attached' : 'Not attached',
											],
											[
												'11.',
												'Duration of tenancy (Period for which let)',
												`${application.property_tenancy_duration || ''}${
													application.property_tenancy_end_date
														? ` (Till ${formatDate(application.property_tenancy_end_date)})`
														: ''
												}`,
											],
											[
												'12.',
												'Permanent Account Number (PAN) of landlord',
												application.landlord_pan || '',
											],
											[
												'13.',
												'Aadhaar number of landlord',
												application.landlord_aadhar || '',
											],
											[
												'14.',
												'Mobile Number and E-mail id of landlord (if available)',
												[application.landlord_phone, application.landlord_email]
													.filter(Boolean)
													.join(', '),
											],
											[
												'15.',
												'Permanent Account Number (PAN) of tenant',
												application.tenant_pan || '',
											],
											[
												'16.',
												'Aadhaar number of tenant',
												application.tenant_aadhar || '',
											],
											[
												'17.',
												'Mobile Number and E-mail id of tenant',
												[application.tenant_phone, application.tenant_email]
													.filter(Boolean)
													.join(', '),
											],
											[
												'18.',
												'Permanent Account Number (PAN) of Property Manager (if any)',
												hasManager &&
												application.manager_pan &&
												String(application.manager_pan).toUpperCase() !== 'NA'
													? application.manager_pan
													: '',
											],
											[
												'19.',
												'Aadhaar number of Property Manager (if any)',
												hasManager ? application.manager_aadhar || '' : '',
											],
											[
												'20.',
												'Mobile Number and E-mail id of Property Manager (if any)',
												hasManager &&
												application.manager_phone &&
												String(application.manager_phone).toUpperCase() !== 'NA'
													? [
															application.manager_phone,
															application.manager_email &&
															application.manager_email !== 'noemail@noemail.com'
																? application.manager_email
																: null,
														]
															.filter(Boolean)
															.join(', ')
													: '',
											],
										].map(([sl, label, value]) => (
											<div className="preview-list-item admin-tenancy-doc__row" key={sl}>
												<div className="admin-tenancy-doc__sl">{sl}</div>
												<div className="admin-tenancy-doc__label">{label}</div>
												<div className="admin-tenancy-doc__value">: {value}</div>
											</div>
										))}
									</div>

									<div className="admin-tenancy-doc__signatures">
										<div className="admin-tenancy-doc__sign-block">
											<div className="admin-tenancy-doc__sign-caption">
												Name and signature of landlord
											</div>
											<div className="admin-tenancy-doc__photo-box">
												{application.landlord_photo_path ? (
													<img
														src={storageUrl(application.landlord_photo_path)}
														alt="Landlord photograph"
													/>
												) : (
													<span>
														Photograph
														<br />
														of
														<br />
														Landlord
													</span>
												)}
											</div>
											<div className="admin-tenancy-doc__sign-line">
												{application.landlord_signature_path ? (
													<img
														src={storageUrl(application.landlord_signature_path)}
														alt="Landlord signature"
													/>
												) : null}
											</div>
										</div>
										<div className="admin-tenancy-doc__sign-block">
											<div className="admin-tenancy-doc__sign-caption">
												Name and signature of tenant
											</div>
											<div className="admin-tenancy-doc__photo-box">
												{application.tenant_photo_path ? (
													<img
														src={storageUrl(application.tenant_photo_path)}
														alt="Tenant photograph"
													/>
												) : (
													<span>
														Photograph
														<br />
														of
														<br />
														Tenant
													</span>
												)}
											</div>
											<div className="admin-tenancy-doc__sign-line">
												{application.tenant_signature_path ? (
													<img
														src={storageUrl(application.tenant_signature_path)}
														alt="Tenant signature"
													/>
												) : null}
											</div>
										</div>
									</div>

									<div className="admin-tenancy-doc__enclosed">
										<strong>Enclosed:</strong>
										<ol>
											<li>Tenancy Agreement.</li>
											<li>Self-attested copies of PAN and Aadhaar of landlord.</li>
											<li>Self-attested copies of PAN and Aadhaar of tenant.</li>
										</ol>
									</div>
								</article>
							</div>
						</div>
					</div>

					{workflowFields.length > 0 ? (
						<section className="admin-tenancy-doc__workflow no-print">
							<h2 className="admin-tenancy-doc__workflow-title">Workflow record</h2>
							<dl className="admin-app-details__grid">
								{workflowFields.map(([key, value]) => (
									<div className="admin-app-details__field" key={key}>
										<dt>{labelize(key)}</dt>
										<dd>{renderValue(key, value)}</dd>
									</div>
								))}
							</dl>
						</section>
					) : null}
				</div>
			) : !editing && isServiceViewOnly ? (
				<div className="admin-tenancy-doc__preview">
					<aside className="admin-tenancy-doc__registry no-print">
						<div className="admin-tenancy-doc__registry-item">
							<span>Application no.</span>
							<strong>{application.application_no}</strong>
						</div>
						<div className="admin-tenancy-doc__registry-item">
							<span>Form</span>
							<strong>{serviceFormDoc?.formName || formLabel}</strong>
						</div>
						<div className="admin-tenancy-doc__registry-item">
							<span>Status</span>
							<span className={statusClass}>{statusText}</span>
						</div>
						<div className="admin-tenancy-doc__registry-item">
							<span>Submitted on</span>
							<strong>{formatDate(application.created_at)}</strong>
						</div>
						{application.district?.name ? (
							<div className="admin-tenancy-doc__registry-item">
								<span>District</span>
								<strong>{application.district.name}</strong>
							</div>
						) : null}
						{getUinValue(application) ? (
							<div className="admin-tenancy-doc__registry-item">
								<span>UIN</span>
								<strong>{getUinValue(application)}</strong>
							</div>
						) : null}
					</aside>

					<div className="admin-tenancy-doc__viewer">
						<div className="admin-tenancy-doc__viewer-bar no-print">
							<span className="admin-tenancy-doc__viewer-label">
								{serviceFormDoc?.viewerLabel || 'Submitted form'}
							</span>
							<div className="admin-tenancy-doc__zoom" role="group" aria-label="Zoom controls">
								<button
									type="button"
									className="admin-tenancy-doc__zoom-btn"
									onClick={() => zoomBy(-0.1)}
									disabled={viewerScale <= 0.4}
									aria-label="Zoom out"
								>
									−
								</button>
								<span className="admin-tenancy-doc__zoom-value" aria-live="polite">
									{Math.round(viewerScale * 100)}%
								</span>
								<button
									type="button"
									className="admin-tenancy-doc__zoom-btn"
									onClick={() => zoomBy(0.1)}
									disabled={viewerScale >= 2}
									aria-label="Zoom in"
								>
									+
								</button>
								<button
									type="button"
									className={`admin-tenancy-doc__zoom-action${
										viewerMode === 'manual' && viewerScale === 1 ? ' is-active' : ''
									}`}
									onClick={zoomToActual}
								>
									100%
								</button>
								<button
									type="button"
									className={`admin-tenancy-doc__zoom-action${
										viewerMode === 'fit' ? ' is-active' : ''
									}`}
									onClick={fitViewerToWidth}
								>
									Fit width
								</button>
							</div>
						</div>
						<div className="admin-tenancy-doc__viewer-stage" ref={viewerStageRef}>
							<div
								className="admin-tenancy-doc__paper-frame"
								style={{
									width: `${794 * viewerScale}px`,
									height: `${paperHeight * viewerScale}px`,
								}}
							>
								<article
									className="govt-form-document admin-tenancy-doc__paper admin-service-doc__paper"
									ref={paperRef}
									style={{
										transform: `scale(${viewerScale})`,
									}}
								>
									<div className="govt-form-watermark">SUBMITTED</div>

									<header className="govt-form-header">
										<div className="admin-tenancy-doc__schedule">
											{serviceFormDoc?.formName || 'SERVICE FORM'}
										</div>
										{serviceFormDoc?.scheduleRef ? (
											<div className="admin-tenancy-doc__section-ref">
												{serviceFormDoc.scheduleRef}
											</div>
										) : null}
										<div className="admin-tenancy-doc__form-title">
											{serviceFormDoc?.formTitle || formLabel}
										</div>
									</header>

									{serviceFormDoc?.addressee?.length ? (
										<div className="admin-tenancy-doc__addressee">
											{serviceFormDoc.addressee.map((line, index) => (
												<div key={`${index}-${line}`}>{line}</div>
											))}
										</div>
									) : null}

									<div className="preview-list-container">
										{(serviceFormDoc?.rows || []).map((item) => (
											<div
												className="preview-list-item admin-tenancy-doc__row"
												key={`${item.sl}-${item.label}`}
											>
												<div className="admin-tenancy-doc__sl">{item.sl}</div>
												<div className="admin-tenancy-doc__label">{item.label}</div>
												<div
													className={`admin-tenancy-doc__value${
														item.value && item.value.length > 120
															? ' admin-tenancy-doc__value--stack'
															: ''
													}`}
												>
													: {item.value || '________________________'}
												</div>
											</div>
										))}
									</div>

									{serviceFormDoc?.signature ? (
										<div className="admin-service-doc__signature">
											<div className="admin-service-doc__signature-meta">
												{serviceFormDoc.signature.signedBy ? (
													<div>
														Signed by:{' '}
														<strong>
															{labelize(String(serviceFormDoc.signature.signedBy))}
														</strong>
													</div>
												) : null}
												{serviceFormDoc.signature.name ? (
													<div>
														Name: <strong>{serviceFormDoc.signature.name}</strong>
													</div>
												) : null}
												{serviceFormDoc.submittedOn ? (
													<div>Date: {serviceFormDoc.submittedOn}</div>
												) : null}
											</div>
											<div className="admin-tenancy-doc__sign-block">
												<div className="admin-tenancy-doc__sign-caption">
													{serviceFormDoc.signature.caption}
												</div>
												<div className="admin-tenancy-doc__sign-line">
													{serviceFormDoc.signature.imagePath ? (
														<img
															src={storageUrl(serviceFormDoc.signature.imagePath)}
															alt="Applicant signature"
														/>
													) : (
														<span className="admin-service-doc__sign-placeholder">
															________________________
														</span>
													)}
												</div>
											</div>
										</div>
									) : null}
								</article>
							</div>
						</div>
					</div>

					{application.valuer_report || application.assigned_valuer?.name ? (
						<section className="admin-tenancy-doc__workflow no-print">
							<h2 className="admin-tenancy-doc__workflow-title">Valuer record</h2>
							<dl className="admin-app-details__grid">
								{application.assigned_valuer?.name ? (
									<div className="admin-app-details__field">
										<dt>Assigned valuer</dt>
										<dd>{application.assigned_valuer.name}</dd>
									</div>
								) : null}
								{application.valuer_report ? (
									<div className="admin-app-details__field">
										<dt>Valuer report</dt>
										<dd style={{ whiteSpace: 'pre-wrap' }}>{application.valuer_report}</dd>
									</div>
								) : null}
							</dl>
						</section>
					) : null}

					{workflowFields.length > 0 ? (
						<section className="admin-tenancy-doc__workflow no-print">
							<h2 className="admin-tenancy-doc__workflow-title">Workflow record</h2>
							<dl className="admin-app-details__grid">
								{workflowFields.map(([key, value]) => (
									<div className="admin-app-details__field" key={key}>
										<dt>{labelize(key)}</dt>
										<dd>{renderValue(key, value)}</dd>
									</div>
								))}
							</dl>
						</section>
					) : null}

					{renderProceedings()}
				</div>
			) : !editing ? (
				<>
					<header className="admin-app-details__hero ws-card">
						<div className="admin-app-details__hero-main">
							<p className="admin-app-details__eyebrow">{formLabel}</p>
							<div className="admin-app-details__hero-row">
								<h2 className="admin-app-details__ref">{application.application_no}</h2>
								<span className={statusClass}>{statusText}</span>
							</div>
							<div className="admin-app-details__chips">
								{getUinValue(application) ? (
									<span className="admin-app-details__chip admin-app-details__chip--uin">
										UIN {getUinValue(application)}
									</span>
								) : null}
								{application.district?.name ? (
									<span className="admin-app-details__chip">{application.district.name}</span>
								) : null}
								{application.area_type ? (
									<span className="admin-app-details__chip">{application.area_type}</span>
								) : null}
								{application.local_body ? (
									<span className="admin-app-details__chip">{application.local_body}</span>
								) : null}
								{application.village_ward?.name ? (
									<span className="admin-app-details__chip">
										{application.village_ward.name}
									</span>
								) : null}
								{application.village_name ? (
									<span className="admin-app-details__chip">{application.village_name}</span>
								) : null}
								<span className="admin-app-details__chip">
									Submitted {formatDate(application.created_at)}
								</span>
							</div>
						</div>
					</header>

					{(application.user || isTenancy || workflowFields.length > 0) && !editing ? (
						<div className="admin-app-details__meta-row">
							{application.user ? (
								<div className="admin-app-details__contact">
									<div className="admin-app-details__contact-icon" aria-hidden>
										<Icon name="user" />
									</div>
									<div className="admin-app-details__contact-body">
										<span className="admin-app-details__contact-name">
											{application.user.name || 'Applicant'}
										</span>
										<span className="admin-app-details__contact-meta">
											{[application.user.email, application.user.phone]
												.filter(Boolean)
												.join(' · ')}
										</span>
									</div>
								</div>
							) : null}
							{isTenancy && !application.user ? (
								<>
									{hasDisplayValue(application.landlord_name) ? (
										<div className="admin-app-details__contact">
											<div className="admin-app-details__contact-icon" aria-hidden>
												<Icon name="user" />
											</div>
											<div className="admin-app-details__contact-body">
												<span className="admin-app-details__contact-name">
													Landlord: {application.landlord_name}
												</span>
												<span className="admin-app-details__contact-meta">
													{[application.landlord_email, application.landlord_phone]
														.filter(Boolean)
														.join(' · ')}
												</span>
											</div>
										</div>
									) : null}
									{hasDisplayValue(application.tenant_name) ? (
										<div className="admin-app-details__contact">
											<div className="admin-app-details__contact-icon" aria-hidden>
												<Icon name="user" />
											</div>
											<div className="admin-app-details__contact-body">
												<span className="admin-app-details__contact-name">
													Tenant: {application.tenant_name}
												</span>
												<span className="admin-app-details__contact-meta">
													{[application.tenant_email, application.tenant_phone]
														.filter(Boolean)
														.join(' · ')}
												</span>
											</div>
										</div>
									) : null}
								</>
							) : null}
							{workflowFields.map(([key, value]) =>
								renderStat(labelize(key), renderValue(key, value))
							)}
						</div>
					) : null}

					{detailSections.map((section) => {
						if (section.fields.length === 0) return null

						return (
							<section className="admin-app-details__card ws-card" key={section.title}>
								<h3 className="admin-app-details__section-title">{section.title}</h3>
								{renderFieldGrid(section.fields, false, true)}
							</section>
						)
					})}

					{renderProceedings()}

					{renderValuerSections()}

					{user?.role === 'super_admin' && application.form_type && (() => {
						const transitions = getValidTransitions(application.form_type)
						if (!transitions) return null
						return (
							<section
								className="admin-app-details__card admin-app-details__superadmin-card"
								style={{
									border: '2px solid var(--clr-primary-500)',
									backgroundColor: 'var(--clr-primary-50)',
								}}
							>
								<h3
									className="admin-app-details__section-title"
									style={{ color: 'var(--clr-primary-700)' }}
								>
									Superadmin Workflow Override
								</h3>
								<div className="admin-app-details__grid" style={{ marginBottom: '1rem' }}>
									<div className="admin-app-details__field">
										<label
											style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}
										>
											Move To
										</label>
										<select
											className="ws-input"
											value={`${superAdminControls.assigned_to_role}|${superAdminControls.status}`}
											onChange={(e) => {
												const [role, status] = e.target.value.split('|')
												setSuperAdminControls({ assigned_to_role: role, status })
											}}
										>
											{transitions.map(({ role, status, label }) => (
												<option key={`${role}|${status}`} value={`${role}|${status}`}>
													{label}
												</option>
											))}
										</select>
									</div>
								</div>
								<button
									type="button"
									className="ws-btn ws-btn--primary"
									onClick={handleSuperAdminMove}
									disabled={actionLoading}
								>
									Force Move Application
								</button>
							</section>
						)
					})()}

					{(ASSISTANT_ROLES.includes(user?.role) && application.status === STATUS.SUBMITTED) ||
					(PRINCIPAL_ROLES.includes(user?.role) &&
						(application.status === STATUS.IN_REVIEW ||
							(user?.role === ROLES.RENT_AUTHORITY &&
								application.status === STATUS.VALUER_REPORT_SUBMITTED))) ? (
						<footer className="admin-app-details__actions">
							{ASSISTANT_ROLES.includes(user?.role) &&
								application.status === STATUS.SUBMITTED && (
									<>
										<button
											type="button"
											className="ws-btn ws-btn--primary"
											onClick={() => openWorkflowModal('forward')}
											disabled={actionLoading}
										>
											Move to review
										</button>
										<button
											type="button"
											className="ws-btn ws-btn--danger"
											onClick={() => openWorkflowModal('reject')}
											disabled={actionLoading}
										>
											Reject
										</button>
									</>
								)}

							{PRINCIPAL_ROLES.includes(user?.role) &&
								(application.status === STATUS.IN_REVIEW ||
									(user?.role === ROLES.RENT_AUTHORITY &&
										application.status === STATUS.VALUER_REPORT_SUBMITTED)) && (
									<>
										<button
											type="button"
											className="ws-btn ws-btn--primary"
											onClick={() => openWorkflowModal('approve')}
											disabled={actionLoading}
										>
											Approve
										</button>
										<button
											type="button"
											className="ws-btn ws-btn--danger"
											onClick={() => openWorkflowModal('reject')}
											disabled={actionLoading}
										>
											Reject
										</button>
									</>
								)}
						</footer>
					) : null}
				</>
			) : null}

			{/* Staff workflow actions under the government form paper */}
			{!editing && application ? (
				<div className="admin-app-details__staff-panel no-print">
					{renderEditHistory()}
					{renderValuerSections()}

					{(ASSISTANT_ROLES.includes(user?.role) && application.status === STATUS.SUBMITTED) ||
					(PRINCIPAL_ROLES.includes(user?.role) &&
						(application.status === STATUS.IN_REVIEW ||
							(user?.role === ROLES.RENT_AUTHORITY &&
								application.status === STATUS.VALUER_REPORT_SUBMITTED))) ? (
						<footer className="admin-app-details__actions">
							{ASSISTANT_ROLES.includes(user?.role) &&
								application.status === STATUS.SUBMITTED && (
									<>
										<button
											type="button"
											className="ws-btn ws-btn--primary"
											onClick={() => openWorkflowModal('forward')}
											disabled={actionLoading}
										>
											Move to review
										</button>
										<button
											type="button"
											className="ws-btn ws-btn--danger"
											onClick={() => openWorkflowModal('reject')}
											disabled={actionLoading}
										>
											Reject
										</button>
									</>
								)}

							{PRINCIPAL_ROLES.includes(user?.role) &&
								(application.status === STATUS.IN_REVIEW ||
									(user?.role === ROLES.RENT_AUTHORITY &&
										application.status === STATUS.VALUER_REPORT_SUBMITTED)) && (
									<>
										<button
											type="button"
											className="ws-btn ws-btn--primary"
											onClick={() => openWorkflowModal('approve')}
											disabled={actionLoading}
										>
											Approve
										</button>
										<button
											type="button"
											className="ws-btn ws-btn--danger"
											onClick={() => openWorkflowModal('reject')}
											disabled={actionLoading}
										>
											Reject
										</button>
									</>
								)}
						</footer>
					) : null}
				</div>
			) : null}

			<WorkflowConfirmModal
				open={workflowModal === 'forward'}
				onClose={closeWorkflowModal}
				title="Move to review"
				description={`Send ${application.application_no} to ${forwardOffice} for final review?`}
				primaryLabel={actionLoading ? 'Forwarding…' : `Forward to ${forwardOffice}`}
				onPrimary={handleWorkflowConfirm}
				primaryDisabled={Boolean(actionLoading)}
			>
				<label className="workflow-confirm-field">
					<span className="workflow-confirm-field__label">Remarks (optional)</span>
					<textarea
						className="workflow-confirm-field__input"
						value={workflowMessage}
						onChange={(e) => setWorkflowMessage(e.target.value)}
						placeholder={`Add a note for ${forwardOffice} (e.g. documents verified)…`}
						rows={3}
					/>
				</label>
			</WorkflowConfirmModal>

			<WorkflowConfirmModal
				open={workflowModal === 'approve'}
				onClose={closeWorkflowModal}
				title="Approve application"
				description={`Provide an approval message for ${application.application_no}. This will be shown in the progress timeline.`}
				primaryLabel={actionLoading ? 'Approving…' : 'Confirm approval'}
				onPrimary={handleWorkflowConfirm}
				primaryDisabled={Boolean(actionLoading) || !workflowMessage.trim()}
			>
				<label className="workflow-confirm-field">
					<span className="workflow-confirm-field__label">Approval message (required)</span>
					<textarea
						className="workflow-confirm-field__input"
						value={workflowMessage}
						onChange={(e) => setWorkflowMessage(e.target.value)}
						placeholder="Enter the approval message / remarks…"
						rows={4}
						required
					/>
				</label>
			</WorkflowConfirmModal>

			<WorkflowConfirmModal
				open={workflowModal === 'reject'}
				onClose={closeWorkflowModal}
				title="Reject application"
				description={`Provide a reason for rejecting ${application.application_no}. This will be shown to the applicant and in the progress timeline.`}
				primaryLabel={actionLoading ? 'Rejecting…' : 'Confirm rejection'}
				primaryVariant="danger"
				onPrimary={handleWorkflowConfirm}
				primaryDisabled={Boolean(actionLoading) || !workflowMessage.trim()}
			>
				<label className="workflow-confirm-field">
					<span className="workflow-confirm-field__label">Rejection reason (required)</span>
					<textarea
						className="workflow-confirm-field__input"
						value={workflowMessage}
						onChange={(e) => setWorkflowMessage(e.target.value)}
						placeholder="Explain why this application is rejected…"
						rows={4}
						required
					/>
				</label>
			</WorkflowConfirmModal>

			<WorkflowConfirmModal
				open={Boolean(successModal)}
				onClose={() => setSuccessModal(null)}
				title={successModal?.title || 'Done'}
				description={successModal?.description}
				primaryLabel="OK"
				secondaryLabel="Close"
				onPrimary={() => setSuccessModal(null)}
			>
				{Array.isArray(successModal?.changes) && successModal.changes.length > 0 ? (
					<div className="admin-edit-changes">
						<p className="admin-edit-changes__label">Changes made</p>
						<ul className="admin-edit-changes__list">
							{successModal.changes.map((change) => (
								<li key={change.field}>
									<span className="admin-edit-changes__field">
										{labelize(change.field)}
									</span>
									<span className="admin-edit-changes__diff">
										<span className="admin-edit-changes__from">
											{formatEditValue(change.from)}
										</span>
										<span aria-hidden> → </span>
										<span className="admin-edit-changes__to">
											{formatEditValue(change.to)}
										</span>
									</span>
								</li>
							))}
						</ul>
					</div>
				) : null}
			</WorkflowConfirmModal>

			{docPreview ? (
				<div
					className="tenancy-doc-preview-overlay"
					role="presentation"
					onClick={closeDocPreview}
				>
					<div
						className="tenancy-doc-preview-modal"
						role="dialog"
						aria-modal="true"
						aria-labelledby="admin-tenancy-agreement-title"
						onClick={(e) => e.stopPropagation()}
					>
						<header className="tenancy-doc-preview-modal__header">
							<h2 id="admin-tenancy-agreement-title">{docPreview.title}</h2>
							<button
								type="button"
								className="tenancy-doc-preview-modal__close"
								onClick={closeDocPreview}
								aria-label="Close preview"
							>
								×
							</button>
						</header>
						<div className="tenancy-doc-preview-modal__body">
							<iframe
								title={docPreview.title}
								src={docPreview.url}
								className={`tenancy-doc-preview-modal__iframe${
									docPreview.isPdf ? '' : ' tenancy-doc-preview-modal__iframe--html'
								}`}
							/>
						</div>
					</div>
				</div>
			) : null}
			<ProceedingModal
				open={showProceedingModal}
				onClose={() => setShowProceedingModal(false)}
				onSubmit={handleProceedingSubmit}
				isSubmitting={proceedingSubmitting}
			/>

			<NoticeDocumentViewer
				open={!!viewProceedingDoc}
				onClose={() => setViewProceedingDoc(null)}
				proceeding={viewProceedingDoc}
				application={application}
			/>
		</div>
	)
}

export default AdminApplicationDetails
