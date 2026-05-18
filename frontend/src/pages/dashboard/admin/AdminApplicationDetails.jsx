import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useOutletContext } from 'react-router-dom'
import api from '../../../api'
import { STATUS, STATUS_LABELS, STATUS_COLORS } from '../../../constants/status'
import { APPLICATION_LABELS } from '../../../constants/application'
import { ROLES, ASSISTANT_ROLES, PRINCIPAL_ROLES } from '../../../constants/roles'
import './ApplicationDetails.css'

const AdminApplicationDetails = () => {
	const { applicationNo } = useParams()
	const navigate = useNavigate()
	const { user } = useOutletContext()
	const [application, setApplication] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [actionLoading, setActionLoading] = useState(false)

	useEffect(() => {
		fetchDetails()
	}, [applicationNo])

	const fetchDetails = async () => {
		try {
			setLoading(true)
			const response = await api.get(`/api/admin/applications/${applicationNo}`)
			setApplication(response.data.application)
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
			await api.post(`/api/admin/applications/${application.form_type}/${application.id}/${action}`)
			alert(`Application ${action}ed successfully.`)
			fetchDetails() // Refresh
		} catch (err) {
			console.error(`Error during ${action}:`, err)
			alert(`Failed to ${action} application.`)
		} finally {
			setActionLoading(false)
		}
	}

	if (loading) return <div className="admin-loading">Loading application details...</div>
	if (error) return <div className="admin-error-container">{error}</div>
	if (!application) return <div className="admin-error-container">Application not found.</div>

	console.log({ application })
	const renderValue = (key, value) => {
		if (value === null || value === undefined) return '-'
		if (typeof value === 'boolean') return value ? 'Yes' : 'No'

		// Handle images/documents
		if (key.toLowerCase().includes('path') || key.toLowerCase().includes('image') || key.toLowerCase().includes('pdf')) {
			if (typeof value === 'string' && (value.includes('/') || value.includes('\\'))) {
				const url = `${import.meta.env.VITE_API_URL}/storage/${value}`
				if (value.match(/\.(jpg|jpeg|png|gif)$/i)) {
					return (
						<div className="detail-media">
							<img src={url} alt={key} className="detail-img" onClick={() => window.open(url, '_blank')} />
							<a href={url} target="_blank" rel="noopener noreferrer" className="view-link">View Full Image</a>
						</div>
					)
				}
				return <a href={url} target="_blank" rel="noopener noreferrer" className="view-link">View Document</a>
			}
		}

		if (key === 'status') {
			return <span className={`status-pill ${value.toLowerCase()}`}>{STATUS_LABELS[value] || value}</span>
		}

		if (typeof value === 'object') {
			if (value.name) return value.name
			return JSON.stringify(value)
		}

		return value.toString()
	}

	const labelize = (key) => {
		if (key === 'rent_authority_uid' || key === 'rent_court_uid' || key === 'tenancy_uin') {
			return 'Tenancy UIN'
		}
		return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
	}

	// Grouping fields
	const excludedFields = ['id', 'user_id', 'user', 'district_id', 'forwarded_by_user_id', 'rejected_by_user_id', 'approved_by_user_id', 'movement_history', 'created_at', 'updated_at', 'deleted_at', 'assigned_to_role']
	const fields = Object.entries(application).filter(([key]) => !excludedFields.includes(key))

	// Move Tenancy UIN to the first row
	const uinIndex = fields.findIndex(([key]) => key === 'rent_authority_uid' || key === 'rent_court_uid' || key === 'tenancy_uin')
	if (uinIndex !== -1) {
		const [uinField] = fields.splice(uinIndex, 1)
		fields.unshift(uinField)
	}

	return (
		<div className="application-details-page">
			<div className="details-header">
				<div className="header-left">
					<button className="back-btn" onClick={() => navigate(-1)} title="Go Back">
						Back
					</button>
					<div className="header-main">
						<h1>{APPLICATION_LABELS[application?.form_type] || labelize(application?.form_type || '')} Details</h1>
						<p className="app-no">{application.application_no}</p>
					</div>
				</div>
				<div className="header-status">
					<span className={`status-badge ${application.status?.toLowerCase()}`}>
						{STATUS_LABELS[application.status] || application.status}
					</span>
				</div>
			</div>

			<div className="details-content">
				<h2 className="section-title">Application Information</h2>
				<div className="details-grid">
					{fields.map(([key, value]) => (
						<div className="detail-item" key={key}>
							<label>{labelize(key)}</label>
							<div className="detail-value">{renderValue(key, value)}</div>
						</div>
					))}
				</div>
			</div>

			<div className="details-actions">
				{ASSISTANT_ROLES.includes(user.role) && application.status === STATUS.SUBMITTED && (
					<>
						<button className="action-btn forward" onClick={() => handleAction('forward')} disabled={actionLoading}>
							Move to Review
						</button>
						<button className="action-btn reject" onClick={() => handleAction('reject')} disabled={actionLoading}>
							Reject
						</button>
					</>
				)}

				{PRINCIPAL_ROLES.includes(user.role) && application.status === STATUS.IN_REVIEW && (
					<>
						<button className="action-btn approve" onClick={() => handleAction('approve')} disabled={actionLoading}>
							Approve
						</button>
						<button className="action-btn reject" onClick={() => handleAction('reject')} disabled={actionLoading}>
							Reject
						</button>
					</>
				)}
			</div>
		</div>
	)
}

export default AdminApplicationDetails
