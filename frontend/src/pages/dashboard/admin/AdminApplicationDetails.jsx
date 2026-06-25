import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, useOutletContext } from 'react-router-dom'
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
	'movement_history',
	'created_at',
	'updated_at',
	'deleted_at',
	'assigned_to_role',
])

const WORKFLOW_FIELDS = new Set([
	'forwarded_at',
	'rejected_at',
	'approved_at',
	'rejection_message',
])

const SUMMARY_FIELDS = ['district', 'form_type']

function hasDisplayValue(value) {
	if (value === null || value === undefined || value === '') return false
	if (typeof value === 'string' && value.trim() === '') return false
	if (value === '-') return false
	return true
}

function labelize(key) {
	if (key === 'rent_authority_uid' || key === 'rent_court_uid' || key === 'tenancy_uin') {
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

const AdminApplicationDetails = () => {
	const { applicationNo } = useParams()
	const navigate = useNavigate()
	const { user } = useOutletContext()
	const [application, setApplication] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [actionLoading, setActionLoading] = useState(false)
	const [superAdminControls, setSuperAdminControls] = useState({ status: '', assigned_to_role: '' })

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

	const formLabel = useMemo(() => {
		if (!application?.form_type) return 'Application'
		return (
			APPLICATION_LABELS[application.form_type] ||
			labelize(application.form_type)
		)
	}, [application?.form_type])

	const { summaryFields, workflowFields, detailFields } = useMemo(() => {
		if (!application) {
			return { summaryFields: [], workflowFields: [], detailFields: [] }
		}

		const entries = Object.entries(application).filter(([key]) => !EXCLUDED_FIELDS.has(key))
		const summary = []
		const workflow = []
		const details = []

		for (const [key, value] of entries) {
			if (['application_no', 'status'].includes(key)) continue

			if (SUMMARY_FIELDS.includes(key)) {
				summary.push([key, value])
				continue
			}

			if (WORKFLOW_FIELDS.has(key)) {
				if (hasDisplayValue(value)) workflow.push([key, value])
				continue
			}

			details.push([key, value])
		}

		const uinIndex = details.findIndex(
			([key]) =>
				key === 'rent_authority_uid' || key === 'rent_court_uid' || key === 'tenancy_uin'
		)
		if (uinIndex !== -1) {
			const [uinField] = details.splice(uinIndex, 1)
			details.unshift(uinField)
		}

		return {
			summaryFields: summary,
			workflowFields: workflow,
			detailFields: details,
		}
	}, [application])

	const renderValue = (key, value) => {
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
	}

	const renderFieldGrid = (fields) => (
		<dl className="admin-app-details__grid">
			{fields.map(([key, value]) => (
				<div className="admin-app-details__field" key={key}>
					<dt>{labelize(key)}</dt>
					<dd>{renderValue(key, value)}</dd>
				</div>
			))}
		</dl>
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

	return (
		<div className="admin-app-details">
			<div className="admin-app-details__toolbar">
				<button
					type="button"
					className="ws-btn ws-btn--outline ws-btn--sm admin-app-details__back"
					onClick={() => navigate('/dashboard/admin/applications')}
				>
					<Icon name="collapse" className="admin-app-details__back-icon" />
					Back to applications
				</button>
			</div>

			<header className="admin-app-details__hero">
				<div className="admin-app-details__hero-main">
					<p className="admin-app-details__eyebrow">{formLabel}</p>
					<h2 className="admin-app-details__ref">{application.application_no}</h2>
					<p className="admin-app-details__meta">
						{STATUS_LABELS[application.status] || application.status}
						{application.district?.name ? (
							<>
								<span className="admin-app-details__meta-sep" aria-hidden>
									·
								</span>
								{application.district.name} district
							</>
						) : null}
					</p>
				</div>
				<span className={statusClass}>{statusText}</span>
			</header>

			{(summaryFields.length > 0 || workflowFields.length > 0) && (
				<section className="admin-app-details__card">
					<h3 className="admin-app-details__section-title">Overview</h3>
					{renderFieldGrid([...summaryFields, ...workflowFields])}
				</section>
			)}

			{detailFields.length > 0 && (
				<section className="admin-app-details__card">
					<h3 className="admin-app-details__section-title">Application details</h3>
					{renderFieldGrid(detailFields)}
				</section>
			)}

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
