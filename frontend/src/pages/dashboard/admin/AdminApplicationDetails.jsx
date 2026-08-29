import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Link, useParams, useNavigate, useOutletContext, useLocation } from 'react-router-dom'
import api from '../../../api'
import { fetchAdminApplication, fetchValuers as fetchValuerUsers } from '../../../services/adminApplications'
import { getApiErrorMessage } from '../../../services/errors'
import { useLanguage } from '../../../i18n'
import { useAdminProceedings, useValuers } from '../../../hooks/useAdminApplicationDetails'
import { Icon } from '../../../components/dashboard/Icons'
import WorkflowConfirmModal from '../../../components/dashboard/WorkflowConfirmModal'
import { STATUS, STATUS_LABELS } from '../../../constants/status'
import { APPLICATION_LABELS, APPLICATION_TYPES } from '../../../constants/application'
import { ROLES, ASSISTANT_ROLES, PRINCIPAL_ROLES, TENANCY_STAFF_ROLES } from '../../../constants/roles'
import { getRoleLabel } from '../../../constants/roleLabels'
import { adminStatusBadgeClass, adminStatusLabel } from '../../../utils/adminStatusBadge'
import { formatDate, formatDateTime } from '../../../utils/formatters'
import { getAssistantForwardOfficeLabel } from '../../../utils/applicationStatusProgress'
import { buildServiceFormDocument } from '../../../utils/buildServiceFormDocument'
import ProceedingModal from '../../../components/dashboard/ProceedingModal'
import NoticeDocumentViewer from '../../../components/dashboard/NoticeDocumentViewer'
import { useToast } from '../../../context/ToastContext'
import './ApplicationDetails.css'

const EXCLUDED_FIELDS = new Set([
	'id',
	'user_id',
	'user',
	'district_id',
	'forwarded_by_user_id',
	'rejected_by_user_id',
	'approved_by_user_id',
	'cancelled_by_user_id',
	'forwarded_by',
	'rejected_by',
	'approved_by',
	'cancelled_by',
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
	'cancelled_at',
	'cancellation_reason',
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
	'cancelled_at',
	'cancellation_reason',
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
	{ titleKey: 'ws.adminDetail.section.registration', prefixes: ['registration_date', 'apply_type'] },
	{ titleKey: 'ws.adminDetail.section.landlord', prefixes: ['landlord_'] },
	{ titleKey: 'ws.adminDetail.section.tenant', prefixes: ['tenant_'] },
	{ titleKey: 'ws.adminDetail.section.manager', prefixes: ['manager_'] },
	{ titleKey: 'ws.adminDetail.section.property', prefixes: ['property_'] },
]

const SERVICE_FIELD_SECTIONS = [
	{
		titleKey: 'ws.adminDetail.section.parties',
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
		titleKey: 'ws.adminDetail.section.premises',
		prefixes: ['property_', 'premises_', 'building_', 'schedule_'],
	},
	{
		titleKey: 'ws.adminDetail.section.rent',
		prefixes: ['rent_', 'charge_', 'other_charges', 'existing_', 'amount'],
	},
	{
		titleKey: 'ws.adminDetail.section.case',
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

function buildEditSections(editForm, formType, t) {
	const fields = Object.entries(editForm).filter(([key]) => isEditableField(key))
	return groupDetailFields(fields, formType, t).filter((section) =>
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

function groupDetailFields(fields, formType, t) {
	if (formType === APPLICATION_TYPES.TENANCY_CERTIFICATE) {
		const sections = TENANCY_FIELD_SECTIONS.map((section) => ({
			title: t(section.titleKey),
			fields: fields.filter(([key]) =>
				section.prefixes.some(
					(prefix) => key === prefix || key.startsWith(prefix)
				)
			),
		})).filter((section) => section.fields.length > 0)

		const assigned = new Set(sections.flatMap((s) => s.fields.map(([key]) => key)))
		const other = fields.filter(([key]) => !assigned.has(key))
		if (other.length > 0) {
			sections.push({ title: t('ws.adminDetail.section.other'), fields: other })
		}

		return sections.length > 0
			? sections
			: [{ title: t('ws.adminDetail.section.application'), fields }]
	}

	const sections = SERVICE_FIELD_SECTIONS.map((section) => ({
		title: t(section.titleKey),
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
		sections.push({ title: t('ws.adminDetail.section.docs'), fields: documents })
	}
	if (other.length > 0) {
		sections.push({ title: t('ws.adminDetail.section.other'), fields: other })
	}

	return sections.length > 0
		? sections
		: [{ title: t('ws.adminDetail.section.application'), fields }]
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

function serviceApplicationsListPath(role) {
	if (ASSISTANT_ROLES.includes(role) || role === ROLES.VALUER) {
		return '/dashboard/admin/inbox'
	}
	return '/dashboard/admin/applications'
}

function serviceApplicationsListLabel(role, t) {
	return role === ROLES.VALUER
		? t('ws.adminDetail.list.valuer')
		: t('ws.adminDetail.list.services')
}

const AdminApplicationDetails = () => {
	const { applicationNo } = useParams()
	const navigate = useNavigate()
	const location = useLocation()
	const { user } = useOutletContext()
	const { showToast } = useToast()
	const { t } = useLanguage()
	const fromTenancy =
		location.state?.from === 'tenancy' ||
		location.pathname.includes('/admin/tenancy/')
	const fromInbox = location.state?.from === 'inbox'
	const fromApplications = location.state?.from === 'applications'
	const listPath = fromTenancy
		? '/dashboard/admin/tenancy'
		: fromInbox
			? '/dashboard/admin/inbox'
			: fromApplications
				? '/dashboard/admin/applications'
				: serviceApplicationsListPath(user?.role)
	const listLabel = fromTenancy
		? t('ws.adminDetail.list.tenancy')
		: serviceApplicationsListLabel(user?.role, t)
	const [application, setApplication] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	
	const { data: valuers = [] } = useValuers()
	const { data: proceedings = [], isLoading: proceedingsLoading, refetch: refetchProceedings } = useAdminProceedings(application?.form_type, application?.id)
	const [actionLoading, setActionLoading] = useState(false)
	const [superAdminControls, setSuperAdminControls] = useState({ status: '', assigned_to_role: '' })
	const [isEditing, setIsEditing] = useState(false)
	const [editForm, setEditForm] = useState({})
	const [saveError, setSaveError] = useState('')
	const [selectedValuerId, setSelectedValuerId] = useState('')
	const [valuerLoadError, setValuerLoadError] = useState('')
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

	useEffect(() => {
		if (!fromTenancy || !user?.role) return
		if (!TENANCY_STAFF_ROLES.includes(user.role)) {
			navigate('/dashboard', { replace: true })
		}
	}, [fromTenancy, user?.role, navigate])

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
			showToast(err?.response?.data?.message || 'Failed to open printable application.', 'error')
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
			showToast(message, 'error')
		} finally {
			setAgreementLoading(false)
		}
	}


	const handleProceedingSubmit = async (formData) => {
		try {
			setProceedingSubmitting(true)
			const formType = application.form_type || APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL;
			await api.post(`/api/admin/applications/${formType}/${application.id}/proceedings`, formData)
			refetchProceedings()
			setShowProceedingModal(false)
		} catch (err) {
			showToast(err?.response?.data?.message || 'Failed to save proceeding', 'error')
		} finally {
			setProceedingSubmitting(false)
		}
	}

	useEffect(() => {
		fetchDetails()
	}, [applicationNo])

	const renderProceedings = () => {
		if (!application) return null

		const isRtAppeal = application.form_type === APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL
		if (!isRtAppeal) return null

		const canAddProceeding =
			(user?.role === ROLES.RT_ASSISTANT || user?.role === ROLES.RENT_TRIBUNAL) &&
			application.status !== STATUS.SUBMITTED

		const formatNoticeType = (type) =>
			String(type || '')
				.replace(/_/g, ' ')
				.replace(/\b\w/g, (c) => c.toUpperCase())

		return (
			<section className="admin-app-details__card admin-app-details__proceedings-card no-print">
				<div className="admin-app-details__proceedings-head">
					<div className="admin-app-details__proceedings-head-text">
						<h3 className="admin-app-details__section-title">Case Proceedings & Notices</h3>
						<p className="admin-app-details__proceedings-desc">
							Hearing notices, adjournments, and tribunal orders for this appeal
						</p>
					</div>
					{canAddProceeding ? (
						<button
							className="ws-btn ws-btn--primary ws-btn--sm"
							type="button"
							onClick={() => setShowProceedingModal(true)}
						>
							Add Proceeding
						</button>
					) : null}
				</div>

				<div className="admin-app-details__proceedings-body">
					{proceedingsLoading ? (
						<p className="admin-app-details__proceedings-empty">Loading proceedings…</p>
					) : proceedings.length === 0 ? (
						<p className="admin-app-details__proceedings-empty">
							{canAddProceeding
								? 'No proceedings found. Use Add Proceeding to issue a notice or record an order.'
								: 'No proceedings or notices have been recorded for this appeal yet.'}
						</p>
					) : (
						<ul className="admin-app-details__proceedings-list">
							{proceedings.map((p) => (
								<li key={p.id} className="admin-app-details__proceeding-item">
									<div className="admin-app-details__proceeding-main">
										<div className="admin-app-details__proceeding-title-row">
											<span className="admin-app-details__proceeding-type">
												{formatNoticeType(p.notice_type)}
											</span>
											<span className="admin-app-details__proceeding-date">
												{p.created_at
													? new Date(p.created_at).toLocaleDateString('en-IN', {
															day: '2-digit',
															month: 'short',
															year: 'numeric',
														})
													: '—'}
											</span>
										</div>
										{p.hearing_date ? (
											<p className="admin-app-details__proceeding-meta">
												Hearing:{' '}
												<strong>
													{p.hearing_date}
													{p.hearing_time ? ` · ${p.hearing_time}` : ''}
												</strong>
												{p.venue ? ` · ${p.venue}` : ''}
											</p>
										) : null}
										<p className="admin-app-details__proceeding-meta">
											Sent by: {p.sent_by?.name || 'Unknown'}
										</p>
									</div>
									<button
										type="button"
										className="ws-btn ws-btn--outline ws-btn--sm"
										onClick={() => setViewProceedingDoc(p)}
									>
										View Document
									</button>
								</li>
							))}
						</ul>
					)}
				</div>
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
			const response = await fetchAdminApplication(applicationNo)
			const app = response.application
			setApplication(app)
			setSelectedValuerId(app?.assigned_valuer_id ? String(app.assigned_valuer_id) : '')
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
			setError(getApiErrorMessage(err, t('ws.adminDetail.loadError')))
		} finally {
			if (!silent) setLoading(false)
		}
	}




	const requestAssignValuer = () => {
		if (!selectedValuerId) return showToast('Please select a valuer', 'error')
		setWorkflowMessage('')
		setWorkflowModal('assign-valuer')
	}

	const handleAssignValuer = async () => {
		if (!selectedValuerId) return showToast('Please select a valuer', 'error')
		const isReassign = Boolean(application?.assigned_valuer_id)

		setActionLoading(true)
		try {
			const { data } = await api.post(`/api/admin/applications/${application.id}/assign-valuer`, {
				assigned_valuer_id: Number(selectedValuerId),
			})
			showToast(data?.message || (isReassign ? 'Valuer reassigned successfully' : 'Valuer assigned successfully'), 'success')
			setValuerLoadError('')
			setWorkflowModal(null)
			await fetchDetails({ silent: true })
		} catch (err) {
			showToast(getApiErrorMessage(err, 'Failed to assign valuer'), 'error')
		} finally {
			setActionLoading(false)
		}
	}

	const handleRemoveValuer = async () => {
		setActionLoading(true)
		try {
			const { data } = await api.post(`/api/admin/applications/${application.id}/remove-valuer`)
			showToast(data?.message || 'Valuer removed successfully', 'success')
			setSelectedValuerId('')
			setWorkflowModal(null)
			await fetchDetails({ silent: true })
		} catch (err) {
			showToast(getApiErrorMessage(err, 'Failed to remove valuer'), 'error')
		} finally {
			setActionLoading(false)
		}
	}

	const handleSubmitValuerReport = async () => {
		if (!valuerReport.trim()) return showToast('Please enter the report', 'error')
		setActionLoading(true)
		try {
			const { data } = await api.post(`/api/admin/applications/${application.id}/submit-valuer-report`, {
				valuer_report: valuerReport,
			})
			showToast(data?.message || 'Report submitted successfully', 'success')
			setValuerReport('')
			await fetchDetails({ silent: true })
		} catch (err) {
			showToast(getApiErrorMessage(err, 'Failed to submit report'), 'error')
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
			showToast(getApiErrorMessage(err, `Failed to ${workflowModal} application.`), 'error')
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
		openWorkflowModal('superadmin-move')
	}

	const confirmSuperAdminMove = async () => {
		if (
			!isSuperAdmin ||
			application?.form_type === APPLICATION_TYPES.TENANCY_CERTIFICATE
		) {
			return
		}

		try {
			setActionLoading(true)
			await api.post(
				`/api/admin/applications/${application.form_type}/${application.id}/superadmin-move`,
				superAdminControls
			)
			setWorkflowModal(null)
			showToast('Application moved successfully.', 'success')
			fetchDetails()
		} catch (err) {
			showToast(getApiErrorMessage(err, t('ws.adminDetail.moveError')), 'error')
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

	const { detailFields } = useMemo(() => {
		if (!application) {
			return { detailFields: [] }
		}

		const entries = Object.entries(application).filter(([key]) => !EXCLUDED_FIELDS.has(key))
		const details = []

		for (const [key, value] of entries) {
			if (['application_no'].includes(key)) continue

			if (SUMMARY_FIELDS.includes(key) || UIN_FIELDS.has(key)) {
				continue
			}

			if (WORKFLOW_FIELDS.has(key)) {
				continue
			}

			details.push([key, value])
		}

		return {
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
		const editSections = buildEditSections(editForm, application.form_type, t)
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

	const renderReviewComment = ({
		title,
		authorName,
		roleLabel,
		roleTone = 'default',
		at,
		dateTime,
		text,
	}) => {
		if (!hasDisplayValue(text)) return null
		const name = authorName || roleLabel || 'Reviewer'
		const initial = String(name).trim().charAt(0).toUpperCase() || 'R'

		return (
			<div className="admin-app-details__review-thread">
				{title ? <h4 className="admin-app-details__review-thread-title">{title}</h4> : null}
				<article
					className={`admin-app-details__review-comment admin-app-details__review-comment--${roleTone}`}
				>
					<div className="admin-app-details__review-comment-avatar" aria-hidden>
						{initial}
					</div>
					<div className="admin-app-details__review-comment-main">
						<header className="admin-app-details__review-comment-meta">
							<span className="admin-app-details__review-comment-author">{name}</span>
							{roleLabel ? (
								<span className="admin-app-details__review-comment-role">{roleLabel}</span>
							) : null}
							{at ? (
								<time
									className="admin-app-details__review-comment-time"
									dateTime={dateTime || undefined}
								>
									{at}
								</time>
							) : null}
						</header>
						<div className="admin-app-details__review-comment-bubble">
							<p>{text}</p>
						</div>
					</div>
				</article>
			</div>
		)
	}

	const renderWorkflowRecord = () => {
		if (!application) return null

		const forwardComment = renderReviewComment({
			title: 'Assistant review',
			authorName: application.forwarded_by?.name,
			roleLabel: application.forwarded_by?.role
				? getRoleLabel(application.forwarded_by.role)
				: 'Assistant',
			roleTone: 'assistant',
			at: application.forwarded_at
				? formatDateTime(application.forwarded_at) ||
					new Date(application.forwarded_at).toLocaleString()
				: null,
			dateTime: application.forwarded_at,
			text: application.forward_remarks || (application.forwarded_at ? 'Forwarded for review.' : null),
		})

		const approvalComment = renderReviewComment({
			title: 'Approval note',
			authorName: application.approved_by?.name,
			roleLabel: 'Approver',
			roleTone: 'approve',
			at: application.approved_at
				? formatDateTime(application.approved_at) ||
					new Date(application.approved_at).toLocaleString()
				: null,
			dateTime: application.approved_at,
			text: application.approval_message,
		})

		const rejectionComment = renderReviewComment({
			title: 'Rejection note',
			authorName: application.rejected_by?.name,
			roleLabel: 'Reviewer',
			roleTone: 'reject',
			at: application.rejected_at
				? formatDateTime(application.rejected_at) ||
					new Date(application.rejected_at).toLocaleString()
				: null,
			dateTime: application.rejected_at,
			text: application.rejection_message,
		})

		const cancellationComment = renderReviewComment({
			title: 'Cancellation note',
			authorName: application.cancelled_by?.name,
			roleLabel: 'Landlord',
			roleTone: 'reject',
			at: application.cancelled_at
				? formatDateTime(application.cancelled_at) ||
					new Date(application.cancelled_at).toLocaleString()
				: null,
			dateTime: application.cancelled_at,
			text: application.cancellation_reason,
		})

		const comments = [forwardComment, approvalComment, rejectionComment, cancellationComment].filter(Boolean)
		if (comments.length === 0) return null

		return (
			<section className="admin-app-details__card admin-app-details__workflow-card no-print">
				<h2 className="admin-app-details__section-title">Workflow record</h2>
				<div className="admin-app-details__workflow-body">{comments}</div>
			</section>
		)
	}

	const renderValuerReportComment = (reportText, { title = "Valuer's Report" } = {}) => {
		const valuerName =
			application.assigned_valuer?.name ||
			(application.assigned_valuer_id ? `Valuer #${application.assigned_valuer_id}` : 'Valuer')
		const submittedAt = application.valuer_report_submitted_at
			? new Date(application.valuer_report_submitted_at).toLocaleString()
			: application.valuer_assigned_at
				? new Date(application.valuer_assigned_at).toLocaleString()
				: null

		return renderReviewComment({
			title,
			authorName: valuerName,
			roleLabel: 'Valuer',
			roleTone: 'valuer',
			at: submittedAt,
			dateTime:
				application.valuer_report_submitted_at || application.valuer_assigned_at || undefined,
			text: reportText,
		})
	}

	const renderValuerSections = () => {
		if (application?.form_type !== APPLICATION_TYPES.VALUER_APPOINTMENT) return null
		const canManageValuerAssignment = [
			STATUS.IN_REVIEW,
			STATUS.VALUER_ASSIGNED,
			STATUS.VALUER_REPORT_SUBMITTED,
		].includes(application.status)
		const assignedValuerName =
			application.assigned_valuer?.name ||
			(application.assigned_valuer_id ? `Valuer #${application.assigned_valuer_id}` : null)
		const assignmentState =
			application.status === STATUS.VALUER_REPORT_SUBMITTED
				? 'report'
				: application.assigned_valuer_id
					? 'assigned'
					: 'unassigned'
		const isAssignedToMe =
			user?.role === ROLES.VALUER &&
			Number(application.assigned_valuer_id) === Number(user?.id)
		const canComposeReport =
			isAssignedToMe && application.status === STATUS.VALUER_ASSIGNED

		return (
			<>
				{user?.role === ROLES.RENT_AUTHORITY && (
					<section className="admin-app-details__card admin-app-details__valuer-card admin-app-details__valuer-card--assign">
						<div className="admin-app-details__valuer-head">
							<h3 className="admin-app-details__section-title">Valuer assignment</h3>
							<span
								className={`admin-app-details__valuer-state admin-app-details__valuer-state--${assignmentState}`}
							>
								{assignmentState === 'report'
									? 'Report submitted'
									: assignmentState === 'assigned'
										? 'Valuer assigned'
										: 'Not assigned'}
							</span>
						</div>
						<div className="admin-app-details__valuer-body">
							{!canManageValuerAssignment ? (
								<p className="admin-app-details__valuer-note">
									Valuer can be assigned after this Form I-B reaches <strong>In Review</strong>.
									Current status: <strong>{adminStatusLabel(application.status)}</strong>.
								</p>
							) : (
								<p className="admin-app-details__valuer-note admin-app-details__valuer-note--muted">
									Assign a district valuer for Form I-B. After assignment the case appears on the
									valuer dashboard and valuation inbox.
								</p>
							)}

							{application.assigned_valuer_id ? (
								<div className="admin-app-details__valuer-stats">
									{renderStat('Assigned valuer', assignedValuerName || '—')}
									{renderStat(
										'Assigned on',
										application.valuer_assigned_at
											? new Date(application.valuer_assigned_at).toLocaleString()
											: '—'
									)}
								</div>
							) : canManageValuerAssignment ? (
								<p className="admin-app-details__valuer-note admin-app-details__valuer-note--muted">
									No valuer assigned yet.
								</p>
							) : null}

							{canManageValuerAssignment ? (
								<div className="admin-app-details__valuer-assign">
									<label
										className="admin-app-details__valuer-label"
										htmlFor="admin-valuer-select"
									>
										{application.assigned_valuer_id
											? 'Reassign to another valuer'
											: 'Select valuer'}
									</label>
									<div className="admin-app-details__valuer-assign-row">
										<select
											id="admin-valuer-select"
											className="ws-input admin-app-details__valuer-select"
											value={selectedValuerId}
											onChange={(e) => setSelectedValuerId(e.target.value)}
											disabled={actionLoading || valuers.length === 0}
										>
											<option value="">
												{valuers.length === 0
													? '-- No valuer available --'
													: '-- Select a valuer --'}
											</option>
											{valuers.map((v) => (
												<option key={v.id} value={v.id}>
													{v.name}
													{v.email ? ` (${v.email})` : ''}
												</option>
											))}
										</select>
										<div className="admin-app-details__valuer-assign-actions">
											<button
												type="button"
												className="ws-btn ws-btn--primary"
												onClick={requestAssignValuer}
												disabled={actionLoading || !selectedValuerId}
											>
												{application.assigned_valuer_id ? 'Reassign' : 'Assign'}
											</button>
											{application.assigned_valuer_id ? (
												<button
													type="button"
													className="ws-btn ws-btn--danger"
													onClick={() => openWorkflowModal('remove-valuer')}
													disabled={actionLoading}
												>
													Remove
												</button>
											) : null}
										</div>
									</div>
									{valuerLoadError ? (
										<p className="admin-app-details__valuer-error" role="alert">
											{valuerLoadError}{' '}
											<button
												type="button"
												className="ws-btn ws-btn--outline ws-btn--sm"
												onClick={fetchValuers}
											>
												Retry
											</button>
										</p>
									) : valuers.length === 0 && !valuerLoadError ? (
										<p className="admin-app-details__valuer-error" role="status">
											No valuer users found in this district. Create a valuer account first.
										</p>
									) : null}
								</div>
							) : null}

							{application.valuer_report
								? renderValuerReportComment(application.valuer_report)
								: null}
						</div>
					</section>
				)}

				{user?.role === ROLES.VALUER && (
					<section className="admin-app-details__card admin-app-details__valuer-card admin-app-details__valuer-card--report">
						<div className="admin-app-details__valuer-head">
							<h3 className="admin-app-details__section-title">Valuer report</h3>
							<span
								className={`admin-app-details__valuer-state admin-app-details__valuer-state--${
									application.status === STATUS.VALUER_REPORT_SUBMITTED
										? 'report'
										: canComposeReport
											? 'assigned'
											: 'unassigned'
								}`}
							>
								{application.status === STATUS.VALUER_REPORT_SUBMITTED
									? 'Submitted'
									: canComposeReport
										? 'Awaiting your report'
										: 'Unavailable'}
							</span>
						</div>
						<div className="admin-app-details__valuer-body">
							{application.status === STATUS.VALUER_REPORT_SUBMITTED && isAssignedToMe ? (
								renderValuerReportComment(application.valuer_report, {
									title: 'Your submitted report',
								})
							) : canComposeReport ? (
								<div className="admin-app-details__valuer-composer">
									<div
										className="admin-app-details__valuer-comment-avatar"
										aria-hidden
									>
										{(user?.name || 'V').trim().charAt(0).toUpperCase()}
									</div>
									<div className="admin-app-details__valuer-composer-main">
										<label
											className="admin-app-details__valuer-label"
											htmlFor="admin-valuer-report-input"
										>
											Add your report comment
										</label>
										<textarea
											id="admin-valuer-report-input"
											className="ws-input admin-app-details__valuer-textarea"
											rows={5}
											value={valuerReport}
											onChange={(e) => setValuerReport(e.target.value)}
											placeholder="Write your valuation findings and recommendation…"
											disabled={actionLoading}
										/>
										<div className="admin-app-details__valuer-composer-actions">
											<span className="admin-app-details__valuer-composer-hint">
												Visible to Rent Authority after you post.
											</span>
											<button
												type="button"
												className="ws-btn ws-btn--primary"
												onClick={handleSubmitValuerReport}
												disabled={actionLoading || !valuerReport.trim()}
											>
												Post report
											</button>
										</div>
									</div>
								</div>
							) : (
								<p className="admin-app-details__valuer-note admin-app-details__valuer-note--muted">
									{isAssignedToMe
										? `This file is no longer awaiting a report (status: ${adminStatusLabel(application.status)}).`
										: 'This Form I-B is not assigned to you for valuation.'}
								</p>
							)}
						</div>
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
		return (
			<div className="admin-app-details">
				<p className="ws-muted">{t('ws.adminDetail.loading')}</p>
			</div>
		)
	}

	if (error || !application) {
		return (
			<div className="admin-app-details">
				<p className="ws-breadcrumb">
					<Link to={listPath}>{listLabel}</Link>
					<span className="ws-breadcrumb-sep" aria-hidden>
						/
					</span>
					<span>{t('ws.adminDetail.crumb')}</span>
				</p>
				<div className="ws-alert ws-alert--error admin-app-details__alert" role="alert">
					{error || t('ws.adminDetail.notFound')}
				</div>
			</div>
		)
	}

	const statusClass = adminStatusBadgeClass(application.status)
	const statusText = adminStatusLabel(application.status)
	const detailSections = groupDetailFields(detailFields, application.form_type, t)
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
			<p className="ws-breadcrumb no-print">
				<Link to={listPath}>{listLabel}</Link>
				<span className="ws-breadcrumb-sep" aria-hidden>
					/
				</span>
				<span>{application.application_no}</span>
			</p>

			<div className="admin-app-details__toolbar no-print">
				<button
					type="button"
					className="ws-btn ws-btn--outline ws-btn--sm admin-app-details__back"
					onClick={() => (editing ? cancelEditing() : navigate(listPath))}
				>
					<Icon name="collapse" className="admin-app-details__back-icon" />
					{editing
						? t('ws.adminDetail.exitEdit')
						: t('ws.adminDetail.backTo', { list: listLabel })}
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
								{actionLoading ? t('ws.adminDetail.opening') : t('ws.adminDetail.print')}
							</button>
							{application.agreement_pdf_path ? (
								<button
									type="button"
									className="ws-btn ws-btn--primary ws-btn--sm"
									onClick={handleViewAgreement}
									disabled={agreementLoading}
								>
									{agreementLoading ? t('ws.adminDetail.loadingShort') : t('ws.adminDetail.viewAgreement')}
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
								{t('ws.profile.cancel')}
							</button>
							<button
								type="button"
								className="ws-btn ws-btn--primary ws-btn--sm"
								onClick={handleSave}
								disabled={actionLoading}
							>
								{actionLoading ? t('ws.adminDetail.saving') : t('ws.adminDetail.save')}
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

					{renderWorkflowRecord()}
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

					{renderWorkflowRecord()}
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

					{(application.user || isTenancy) && !editing ? (
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
						</div>
					) : null}

					{renderWorkflowRecord()}

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
				open={workflowModal === 'assign-valuer'}
				onClose={closeWorkflowModal}
				title={application.assigned_valuer_id ? 'Reassign valuer' : 'Assign valuer'}
				description={(() => {
					const target =
						valuers.find((v) => String(v.id) === String(selectedValuerId))?.name ||
						'this valuer'
					const hadReport =
						Boolean(application.valuer_report) ||
						application.status === STATUS.VALUER_REPORT_SUBMITTED
					if (!application.assigned_valuer_id) {
						return `Assign ${application.application_no} to ${target}? The file will appear in the valuer inbox.`
					}
					if (hadReport) {
						return `Reassign ${application.application_no} to ${target}? The previous valuer report will be cleared and the file returned to “Valuer assigned”.`
					}
					return `Reassign ${application.application_no} to ${target}?`
				})()}
				primaryLabel={
					actionLoading
						? application.assigned_valuer_id
							? 'Reassigning…'
							: 'Assigning…'
						: application.assigned_valuer_id
							? 'Confirm reassignment'
							: 'Confirm assignment'
				}
				onPrimary={handleAssignValuer}
				primaryDisabled={Boolean(actionLoading) || !selectedValuerId}
			/>

			<WorkflowConfirmModal
				open={workflowModal === 'remove-valuer'}
				onClose={closeWorkflowModal}
				title="Remove valuer"
				description={
					Boolean(application.valuer_report) ||
					application.status === STATUS.VALUER_REPORT_SUBMITTED
						? `Remove the assigned valuer from ${application.application_no} and clear the submitted report? The file returns to In Review.`
						: `Remove the assigned valuer from ${application.application_no}? The file returns to In Review.`
				}
				primaryLabel={actionLoading ? 'Removing…' : 'Remove valuer'}
				primaryVariant="danger"
				onPrimary={handleRemoveValuer}
				primaryDisabled={Boolean(actionLoading)}
			/>

			<WorkflowConfirmModal
				open={workflowModal === 'superadmin-move'}
				onClose={closeWorkflowModal}
				title="Force-move application"
				description={`Forcefully move ${application.application_no}? This bypasses the normal office workflow.`}
				primaryLabel={actionLoading ? 'Moving…' : 'Confirm move'}
				primaryVariant="danger"
				onPrimary={confirmSuperAdminMove}
				primaryDisabled={Boolean(actionLoading)}
			/>

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
					<span className="workflow-confirm-field__label">Review comment (optional)</span>
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
					<span className="workflow-confirm-field__label">Approval comment (required)</span>
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
					<span className="workflow-confirm-field__label">Rejection comment (required)</span>
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
