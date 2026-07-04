import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate, useOutletContext, useLocation } from 'react-router-dom'
import api from '../../../api'
import { Icon } from '../../../components/dashboard/Icons'
import { STATUS, STATUS_LABELS } from '../../../constants/status'
import { APPLICATION_LABELS, APPLICATION_TYPES } from '../../../constants/application'
import { ROLES, ASSISTANT_ROLES, PRINCIPAL_ROLES } from '../../../constants/roles'
import { adminStatusBadgeClass, adminStatusLabel } from '../../../utils/adminStatusBadge'
import { formatDate, formatDateTime } from '../../../utils/formatters'
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
	'application_type',
])

const WORKFLOW_FIELDS = new Set([
	'forwarded_at',
	'rejected_at',
	'approved_at',
	'rejection_message',
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
	'district_id',
	'form_type',
	'forwarded_at',
	'rejected_at',
	'approved_at',
	'rejection_message',
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
	'application_type',
])

const TENANCY_FIELD_SECTIONS = [
	{ title: 'Registration', prefixes: ['registration_date', 'apply_type'] },
	{ title: 'Landlord details', prefixes: ['landlord_'] },
	{ title: 'Tenant details', prefixes: ['tenant_'] },
	{ title: 'Manager details', prefixes: ['manager_'] },
	{ title: 'Property & charges', prefixes: ['property_'] },
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

function getUinValue(app) {
	if (!app) return null
	for (const key of UIN_FIELDS) {
		if (hasDisplayValue(app[key])) return app[key]
	}
	return null
}

function groupDetailFields(fields, formType) {
	if (formType !== APPLICATION_TYPES.TENANCY_CERTIFICATE) {
		return [{ title: 'Application details', fields }]
	}

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

function buildEditForm(app) {
	if (!app) return {}
	const form = {}
	for (const [key, value] of Object.entries(app)) {
		if (isEditableField(key)) {
			form[key] = value ?? ''
		}
	}
	return form
}

const AdminApplicationDetails = () => {
	const { applicationNo } = useParams()
	const navigate = useNavigate()
	const location = useLocation()
	const { user } = useOutletContext()
	const fromTenancy = location.state?.from === 'tenancy'
	const listPath = fromTenancy ? '/dashboard/admin/tenancy' : '/dashboard/admin/applications'
	const listLabel = fromTenancy ? 'tenancy applications' : 'applications'
	const [application, setApplication] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [actionLoading, setActionLoading] = useState(false)
	const [superAdminControls, setSuperAdminControls] = useState({ status: '', assigned_to_role: '' })
	const [isEditing, setIsEditing] = useState(false)
	const [editForm, setEditForm] = useState({})
	const [saveError, setSaveError] = useState('')

	const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN

	useEffect(() => {
		fetchDetails()
	}, [applicationNo])

	const fetchDetails = async () => {
		try {
			setLoading(true)
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
			setLoading(false)
		}
	}

	const handleAction = async (action) => {
		if (!window.confirm(`Are you sure you want to ${action} this application?`)) return

		try {
			setActionLoading(true)
			await api.post(
				`/api/admin/applications/${application.form_type}/${application.id}/${action}`
			)
			alert(`Application ${action}ed successfully.`)
			fetchDetails()
		} catch (err) {
			console.error(`Error during ${action}:`, err)
			alert(`Failed to ${action} application.`)
		} finally {
			setActionLoading(false)
		}
	}

	const handleSuperAdminMove = async () => {
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
		setSaveError('')
		setActionLoading(true)
		try {
			const payload = {}
			for (const [key, value] of Object.entries(editForm)) {
				if (isEditableField(key)) {
					payload[key] = value === '' ? null : value
				}
			}
			const { data } = await api.put(
				`/api/admin/applications/${application.form_type}/${application.id}`,
				payload
			)
			setApplication(data.application)
			setIsEditing(false)
			setEditForm({})
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

		if (typeof value === 'object') {
			if (value?.name) return value.name
			return JSON.stringify(value)
		}

		return String(value)
	}, [])

	const renderEditInput = (key, value) => {
		const raw = editForm[key] ?? value ?? ''
		if (typeof raw === 'boolean') {
			return (
				<select
					className="admin-app-details__input"
					value={String(raw)}
					onChange={(e) => handleFieldChange(key, e.target.value === 'true')}
				>
					<option value="true">Yes</option>
					<option value="false">No</option>
				</select>
			)
		}

		if (typeof raw === 'number' || key.includes('rent') || key.includes('amount') || key.includes('charge')) {
			return (
				<input
					type="text"
					className="admin-app-details__input"
					value={raw}
					onChange={(e) => handleFieldChange(key, e.target.value)}
				/>
			)
		}

		if (String(raw).length > 120 || key.includes('reason') || key.includes('description') || key.includes('address')) {
			return (
				<textarea
					className="admin-app-details__input admin-app-details__textarea"
					value={raw}
					rows={3}
					onChange={(e) => handleFieldChange(key, e.target.value)}
				/>
			)
		}

		return (
			<input
				type="text"
				className="admin-app-details__input"
				value={raw}
				onChange={(e) => handleFieldChange(key, e.target.value)}
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
					<div className="admin-app-details__field" key={key}>
						<dt>{labelize(key)}</dt>
						<dd>{editable ? renderEditInput(key, value) : renderValue(key, value)}</dd>
					</div>
				))}
			</dl>
		)
	}

	const renderStat = (label, content) => (
		<div className="admin-app-details__stat" key={label}>
			<span className="admin-app-details__stat-label">{label}</span>
			<span className="admin-app-details__stat-value">{content}</span>
		</div>
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
	const isTenancy = application.form_type === APPLICATION_TYPES.TENANCY_CERTIFICATE
	const detailSections = groupDetailFields(detailFields, application.form_type)

	return (
		<div className="admin-app-details">
			<div className="admin-app-details__toolbar">
				<button
					type="button"
					className="ws-btn ws-btn--outline ws-btn--sm admin-app-details__back"
					onClick={() => navigate(listPath)}
				>
					<Icon name="collapse" className="admin-app-details__back-icon" />
					Back to {listLabel}
				</button>

				<div className="admin-app-details__toolbar-actions">
					{isSuperAdmin && !isEditing ? (
						<button
							type="button"
							className="ws-btn ws-btn--primary ws-btn--sm"
							onClick={startEditing}
						>
							<Icon name="edit" />
							Edit application
						</button>
					) : null}
					{isEditing ? (
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

			{isEditing ? (
				<div className="admin-app-details__edit-banner" role="status">
					Editing submitted form details only. Application number, UIN, status, district,
					workflow history, and uploaded documents cannot be changed here.
				</div>
			) : null}

			<header className="admin-app-details__hero ws-card">
				<div className="admin-app-details__hero-main">
					<p className="admin-app-details__eyebrow">{formLabel}</p>
					<div className="admin-app-details__hero-row">
						<h2 className="admin-app-details__ref">{application.application_no}</h2>
						{!isEditing ? (
							<span className={statusClass}>{statusText}</span>
						) : null}
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
						<span className="admin-app-details__chip">
							Submitted {formatDate(application.created_at)}
						</span>
					</div>
				</div>
			</header>

			{(application.user || isTenancy || workflowFields.length > 0) && !isEditing ? (
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
									{[application.user.email, application.user.phone].filter(Boolean).join(' · ')}
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
				const hasContent = isEditing
					? section.fields.some(([key]) => isEditableField(key))
					: section.fields.length > 0
				if (!hasContent) return null

				return (
					<section className="admin-app-details__card ws-card" key={section.title}>
						<h3 className="admin-app-details__section-title">
							{isEditing ? `Edit — ${section.title.toLowerCase()}` : section.title}
						</h3>
						{renderFieldGrid(section.fields, isEditing, true)}
					</section>
				)
			})}

			{user?.role === 'super_admin' && application.form_type && (() => {
				const transitions = getValidTransitions(application.form_type)
				if (!transitions) return null
				return (
					<section className="admin-app-details__card admin-app-details__superadmin-card" style={{ border: '2px solid var(--clr-primary-500)', backgroundColor: 'var(--clr-primary-50)' }}>
						<h3 className="admin-app-details__section-title" style={{ color: 'var(--clr-primary-700)' }}>Superadmin Workflow Override</h3>
						<div className="admin-app-details__grid" style={{ marginBottom: '1rem' }}>
							<div className="admin-app-details__field">
								<label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Move To</label>
								<select 
									className="ws-input" 
									value={`${superAdminControls.assigned_to_role}|${superAdminControls.status}`} 
									onChange={(e) => {
										const [role, status] = e.target.value.split('|')
										setSuperAdminControls({ assigned_to_role: role, status })
									}}
								>
									{transitions.map(({ role, status, label }) => (
										<option key={`${role}|${status}`} value={`${role}|${status}`}>{label}</option>
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
			(PRINCIPAL_ROLES.includes(user?.role) && application.status === STATUS.IN_REVIEW) ? (
				<footer className="admin-app-details__actions">
					{ASSISTANT_ROLES.includes(user?.role) && application.status === STATUS.SUBMITTED && (
						<>
							<button
								type="button"
								className="ws-btn ws-btn--primary"
								onClick={() => handleAction('forward')}
								disabled={actionLoading}
							>
								Move to review
							</button>
							<button
								type="button"
								className="ws-btn ws-btn--danger"
								onClick={() => handleAction('reject')}
								disabled={actionLoading}
							>
								Reject
							</button>
						</>
					)}

					{PRINCIPAL_ROLES.includes(user?.role) && application.status === STATUS.IN_REVIEW && (
						<>
							<button
								type="button"
								className="ws-btn ws-btn--primary"
								onClick={() => handleAction('approve')}
								disabled={actionLoading}
							>
								Approve
							</button>
							<button
								type="button"
								className="ws-btn ws-btn--danger"
								onClick={() => handleAction('reject')}
								disabled={actionLoading}
							>
								Reject
							</button>
						</>
					)}
				</footer>
			) : null}
		</div>
	)
}

export default AdminApplicationDetails
