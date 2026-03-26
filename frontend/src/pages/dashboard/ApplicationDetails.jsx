import { useEffect, useState } from 'react'
import { useOutletContext, useParams, useNavigate } from 'react-router-dom'
import api from '../../api'
import { formatDateTime, formatDate } from '../../utils/formatters'

function ApplicationDetails() {
	const { user } = useOutletContext()
	const { type, id } = useParams()
	const navigate = useNavigate()
	
	const [application, setApplication] = useState(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	const formKeyToEndpoint = {
		'form-i-rent-revision': '/api/rent-revision-applications',
		'form-i-a-other-charges-revision': '/api/other-charges-revision-applications',
		'form-i-b-valuers-appointment': '/api/valuer-appointment-applications',
		'form-4-rent-court-possession': '/api/rent-court-possession-applications',
		'form-5-rent-court-filing': '/api/rent-court-filing-applications',
		'form-6-rent-authority-filing': '/api/rent-authority-filing-applications',
		'form-7-rent-court-appeal': '/api/rent-court-appeal-applications',
		'form-8-rent-tribunal-appeal': '/api/rent-tribunal-appeal-applications',
	}

	useEffect(() => {
		loadApplication()
	}, [type, id])

	const loadApplication = async () => {
		setLoading(true)
		setError('')
		try {
			if (type === 'tenancy') {
				const { data } = await api.get(`/api/tenancy-applications/${id}`)
				setApplication(data.application || null)
			} else {
				const endpoint = formKeyToEndpoint[type] || `/api/forms`
				const { data } = await api.get(`${endpoint}/${id}`)
				setApplication(data.application || null)
			}
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load application details')
		} finally {
			setLoading(false)
		}
	}

	if (loading) return <div className="auth-card dashboard-card"><p>Loading application details...</p></div>
	if (error) return <div className="auth-card dashboard-card"><p className="error">{error}</p><button onClick={() => navigate(-1)}>Back</button></div>
	if (!application) return <div className="auth-card dashboard-card"><p>No application data found.</p><button onClick={() => navigate(-1)}>Back</button></div>

	const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
	
	const renderTenancyDetails = () => (
		<div className="tenancy-preview-container">
			<div className="tenancy-preview-section">
				<h3>Application Status</h3>
				<div className="preview-grid">
					<div><strong>Application No:</strong> {application.application_no}</div>
					<div><strong>Status:</strong> <span className={`dashboard-status-pill ${application.status === 'Approved' ? 'dashboard-status-pill--success' : 'dashboard-status-pill--pending'}`}>{application.status}</span></div>
					<div><strong>Submitted On:</strong> {formatDateTime(application.created_at)}</div>
					<div><strong>Office:</strong> {application.office?.name || '-'}</div>
				</div>
			</div>

			<div className="tenancy-preview-section">
				<h3>Parties</h3>
				<div className="preview-party-info">
					<h4>Landlord</h4>
					<div className="preview-grid party-details">
						<div><strong>Name:</strong> {application.landlord_name}</div>
						<div><strong>Phone:</strong> {application.landlord_phone}</div>
						<div><strong>Email:</strong> {application.landlord_email || 'N/A'}</div>
						<div><strong>PAN:</strong> {application.landlord_pan || 'N/A'}</div>
					</div>
					<div className="preview-full-row"><strong>Address:</strong> {application.landlord_address}</div>
				</div>

				{application.manager_name && application.manager_name !== 'NA' && (
					<div className="preview-party-info" style={{ marginTop: '1.5rem' }}>
						<h4>Manager</h4>
						<div className="preview-grid party-details">
							<div><strong>Name:</strong> {application.manager_name}</div>
							<div><strong>Phone:</strong> {application.manager_phone}</div>
							<div><strong>Email:</strong> {application.manager_email || 'N/A'}</div>
							<div><strong>PAN:</strong> {application.manager_pan || 'N/A'}</div>
						</div>
						<div className="preview-full-row"><strong>Address:</strong> {application.manager_address}</div>
					</div>
				)}

				<div className="preview-party-info" style={{ marginTop: '1.5rem' }}>
					<h4>Tenant</h4>
					<div className="preview-grid party-details">
						<div><strong>Name:</strong> {application.tenant_name}</div>
						<div><strong>Phone:</strong> {application.tenant_phone}</div>
						<div><strong>Email:</strong> {application.tenant_email || 'N/A'}</div>
						<div><strong>PAN:</strong> {application.tenant_pan || 'N/A'}</div>
					</div>
					<div className="preview-full-row"><strong>Address:</strong> {application.tenant_address}</div>
					{application.tenant_previous_tenancy && <div className="preview-full-row"><strong>Previous:</strong> {application.tenant_previous_tenancy}</div>}
				</div>
			</div>

			<div className="tenancy-preview-section">
				<h3>Property Details</h3>
				<div className="preview-grid">
					<div><strong>Possession Date:</strong> {application.property_possession_date}</div>
					<div><strong>Monthly Rent:</strong> ₹{application.property_rent_payable}</div>
					<div><strong>Duration:</strong> {application.property_tenancy_duration || '-'}</div>
				</div>
				<div style={{ marginTop: '1rem' }}>
					<strong>Premises Description:</strong>
					<p style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>{application.property_premises_description}</p>
				</div>
				
				<div className="charges-summary-box" style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '4px' }}>
					<h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Additional Charges & Furnishing</h4>
					{application.property_furniture_description && (
						<div style={{ marginBottom: '0.75rem', fontSize: '0.9rem' }}>
							<strong>Furniture:</strong> {application.property_furniture_description}
						</div>
					)}
					<div className="preview-grid charges-summary">
						<div><strong>Electricity:</strong> {application.property_charge_electricity || '-'}</div>
						<div><strong>Water:</strong> {application.property_charge_water || '-'}</div>
						<div><strong>Furnishing:</strong> {application.property_charge_furnishing || '-'}</div>
						<div><strong>Other:</strong> {application.property_charge_other_services || '-'}</div>
					</div>
				</div>
			</div>

			<div className="tenancy-preview-section">
				<h3>Documents</h3>
				<div className="preview-media-row" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
					{application.landlord_photo_path && (
						<div className="media-item">
							<span className="label-text">Landlord Photo</span>
							<img src={`${baseUrl}/storage/${application.landlord_photo_path}`} alt="L Photo" style={{ width: '100px', height: '100px', objectFit: 'cover', border: '1px solid #ddd' }} />
						</div>
					)}
					{application.landlord_signature_path && (
						<div className="media-item">
							<span className="label-text">Landlord Sign</span>
							<img src={`${baseUrl}/storage/${application.landlord_signature_path}`} alt="L Sign" style={{ width: '100px', height: '100px', objectFit: 'cover', border: '1px solid #ddd' }} />
						</div>
					)}
					{application.tenant_photo_path && (
						<div className="media-item">
							<span className="label-text">Tenant Photo</span>
							<img src={`${baseUrl}/storage/${application.tenant_photo_path}`} alt="T Photo" style={{ width: '100px', height: '100px', objectFit: 'cover', border: '1px solid #ddd' }} />
						</div>
					)}
					{application.tenant_signature_path && (
						<div className="media-item">
							<span className="label-text">Tenant Sign</span>
							<img src={`${baseUrl}/storage/${application.tenant_signature_path}`} alt="T Sign" style={{ width: '100px', height: '100px', objectFit: 'cover', border: '1px solid #ddd' }} />
						</div>
					)}
				</div>
				{application.agreement_pdf_path && (
					<div style={{ marginTop: '1rem' }}>
						<button className="secondary" onClick={() => window.open(`${baseUrl}/storage/${application.agreement_pdf_path}`, '_blank')}>View Agreement (PDF)</button>
					</div>
				)}
			</div>

			<div className="form-actions" style={{ marginTop: '2rem' }}>
				<button onClick={() => navigate(-1)}>Back</button>
				<button className="secondary" onClick={() => window.open(`${baseUrl}/api/tenancy-applications/${application.id}/receipt?format=pdf&download=1`, '_blank')}>Download Receipt</button>
				<button className="secondary" onClick={() => window.open(`${baseUrl}/api/tenancy-applications/${application.id}/application-details?format=pdf&download=1`, '_blank')}>Download Application</button>
			</div>
		</div>
	)

	const renderFormDetails = () => {
		const signatureUrl = application.signature_image_path ? `${baseUrl}/storage/${application.signature_image_path}` : ''
		return (
			<div className="tenancy-preview-section">
				<div className="tenancy-preview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
					<div><span className="label-text">Application No</span><br /><strong>{application.application_no}</strong></div>
					<div><span className="label-text">Status</span><br /><strong>{application.status}</strong></div>
					<div><span className="label-text">Submitted At</span><br /><strong>{formatDateTime(application.created_at)}</strong></div>
					<div><span className="label-text">Signed Name</span><br /><strong>{application.signature_name || '-'}</strong></div>
				</div>
				
				<div style={{ marginTop: '2rem' }}>
					<h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Details</h3>
					{Object.entries(application).map(([key, value]) => {
						if (['id', 'application_no', 'status', 'created_at', 'updated_at', 'signature_image_path', 'user_id', 'signature_name'].includes(key)) return null
						if (typeof value === 'object' || !value) return null
						return (
							<div key={key} style={{ marginBottom: '0.5rem' }}>
								<span className="label-text" style={{ textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}:</span>
								<span style={{ marginLeft: '1rem' }}>{String(value)}</span>
							</div>
						)
					})}
				</div>

				{signatureUrl && (
					<div className="preview-media" style={{ marginTop: '2rem' }}>
						<h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Signature</h3>
						<img className="signature-preview" src={signatureUrl} alt="Signature" style={{ maxWidth: '300px', display: 'block', border: '1px solid #eee' }} />
					</div>
				)}
				<div className="form-actions" style={{ marginTop: '2rem' }}>
					<button onClick={() => navigate(-1)}>Back</button>
				</div>
			</div>
		)
	}

	return (
		<div className="auth-card dashboard-card">
			<div className="detail-header" style={{ marginBottom: '2rem' }}>
				<h1>{type === 'tenancy' ? 'Tenancy Application Details' : `Details: ${application.application_no}`}</h1>
			</div>
			{type === 'tenancy' ? renderTenancyDetails() : renderFormDetails()}
		</div>
	)
}

export default ApplicationDetails
