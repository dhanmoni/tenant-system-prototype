import { useEffect, useState } from 'react'
import { useOutletContext, useParams, useNavigate } from 'react-router-dom'
import api from '../../api'
import { formatDateTime, formatDate } from '../../utils/formatters'
import emblemDark from '../../assets/img/emblem-dark.png'

function ApplicationDetails() {
	const { user } = useOutletContext()
	const { type, applicationNo } = useParams()
	const navigate = useNavigate()
	
	const [application, setApplication] = useState(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	const formKeyToEndpoint = {
		'form-i-rent-revision': '/api/rent-revision-applications',
		'form-i-a-other-charges-revision': '/api/other-charges-revision-applications',
		'form-i-b-valuer-appointment': '/api/valuer-appointment-applications',
		'form-4-rent-court-possession': '/api/rent-court-possession-applications',
		'form-5-rent-court-filing': '/api/rent-court-filing-applications',
		'form-6-rent-authority-filing': '/api/rent-authority-filing-applications',
		'form-7-rent-court-appeal': '/api/rent-court-appeal-applications',
		'form-8-rent-tribunal-appeal': '/api/rent-tribunal-appeal-applications',
	}

	useEffect(() => {
		loadApplication()
	}, [type, applicationNo])

	const loadApplication = async () => {
		setLoading(true)
		setError('')
		try {
			if (type === 'tenancy') {
				const { data } = await api.get(`/api/tenancy-applications/${applicationNo}`)
				setApplication(data.application || null)
			} else {
				const endpoint = formKeyToEndpoint[type] || `/api/forms`
				const { data } = await api.get(`${endpoint}/${applicationNo}`)
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
			<div className="form-actions no-print application-details-actions">
				<button className="secondary application-back-btn" onClick={() => navigate(-1)}>Back</button>
				<button className="secondary" onClick={() => window.print()}>Print / Save PDF</button>
				{application.agreement_pdf_path && (
					<button className="secondary" onClick={() => window.open(`${baseUrl}/storage/${application.agreement_pdf_path}`, '_blank')}>View Agreement</button>
				)}
			</div>

			<div className="govt-form-document">
				<div className="govt-form-watermark">OFFICIAL</div>

				<div className="govt-form-header">
					<div className="govt-form-seal-container">
						<img src={emblemDark} alt="Government of India Emblem" className="govt-form-seal-image" />
					</div>
					<h2>Government of Assam</h2>
					<h3>Department of Housing And Urban Affairs</h3>
					<div className="govt-form-title">APPLICATION FOR TENANCY CERTIFICATE</div>
				</div>

				<section className="govt-form-section">
					<h4 className="govt-form-section-title"><span className="govt-form-section-num">1</span> Application Details</h4>
					<div className="govt-form-row">
						<span className="govt-form-label">Application No:</span>
						<span className="govt-form-value" style={{ fontWeight: 'bold', color: '#1e40af' }}>{application.application_no}</span>
					</div>
					<div className="govt-form-row">
						<span className="govt-form-label">UID / Ref Code:</span>
						<span className="govt-form-value">{application.uid || application.ref_code || '-'}</span>
					</div>
					<div className="govt-form-row">
						<span className="govt-form-label">Status:</span>
						<span className="govt-form-value">
							<span className={`dashboard-status-pill ${application.status === 'COMPLETED' ? 'dashboard-status-pill--success' : 'dashboard-status-pill--pending'}`}>
								{application.status}
							</span>
						</span>
					</div>
					<div className="govt-form-row">
						<span className="govt-form-label">Initiator Role:</span>
						<span className="govt-form-value">{application.initiator_role}</span>
					</div>
					<div className="govt-form-row">
						<span className="govt-form-label">Submiited On:</span>
						<span className="govt-form-value">{formatDate(application.created_at)}</span>
					</div>
					<div className="govt-form-row">
						<span className="govt-form-label">District / Office:</span>
						<span className="govt-form-value">
							{application.office?.district?.name || '-'} / {application.office?.name || '-'}
						</span>
					</div>
				</section>

				<section className="govt-form-section">
					<h4 className="govt-form-section-title"><span className="govt-form-section-num">2</span> Landlord Details</h4>
					<div className="govt-form-row">
						<span className="govt-form-label">Name:</span>
						<span className="govt-form-value">{application.landlord_name}</span>
					</div>
					<div className="govt-form-row">
						<span className="govt-form-label">Phone:</span>
						<span className="govt-form-value">{application.landlord_phone}</span>
					</div>
					<div className="govt-form-row">
						<span className="govt-form-label">Email:</span>
						<span className="govt-form-value">{application.landlord_email || 'N/A'}</span>
					</div>
					<div className="govt-form-row">
						<span className="govt-form-label">PAN:</span>
						<span className="govt-form-value">{application.landlord_pan || 'N/A'}</span>
					</div>
					<div className="govt-form-full-row">
						<div className="govt-form-label">Full Address:</div>
						<div className="govt-form-value">{application.landlord_address}</div>
					</div>
				</section>

				{application.manager_name && application.manager_name !== 'NA' && (
					<section className="govt-form-section">
						<h4 className="govt-form-section-title"><span className="govt-form-section-num">2A</span> Manager Details</h4>
						<div className="govt-form-row">
							<span className="govt-form-label">Name:</span>
							<span className="govt-form-value">{application.manager_name}</span>
						</div>
						<div className="govt-form-row">
							<span className="govt-form-label">Phone:</span>
							<span className="govt-form-value">{application.manager_phone}</span>
						</div>
						<div className="govt-form-full-row">
							<div className="govt-form-label">Address:</div>
							<div className="govt-form-value">{application.manager_address}</div>
						</div>
					</section>
				)}

				<section className="govt-form-section">
					<h4 className="govt-form-section-title"><span className="govt-form-section-num">3</span> Tenant Details</h4>
					<div className="govt-form-row">
						<span className="govt-form-label">Name:</span>
						<span className="govt-form-value">{application.tenant_name}</span>
					</div>
					<div className="govt-form-row">
						<span className="govt-form-label">Phone:</span>
						<span className="govt-form-value">{application.tenant_phone}</span>
					</div>
					<div className="govt-form-row">
						<span className="govt-form-label">Email:</span>
						<span className="govt-form-value">{application.tenant_email || 'N/A'}</span>
					</div>
					<div className="govt-form-row">
						<span className="govt-form-label">PAN:</span>
						<span className="govt-form-value">{application.tenant_pan || 'N/A'}</span>
					</div>
					<div className="govt-form-full-row">
						<div className="govt-form-label">Full Address:</div>
						<div className="govt-form-value">{application.tenant_address}</div>
					</div>
				</section>

				<section className="govt-form-section">
					<h4 className="govt-form-section-title"><span className="govt-form-section-num">4</span> Property & Financials</h4>
					<div className="govt-form-row">
						<span className="govt-form-label">Possession Date:</span>
						<span className="govt-form-value">{application.property_possession_date}</span>
					</div>
					<div className="govt-form-row">
						<span className="govt-form-label">Monthly Rent:</span>
						<span className="govt-form-value">₹{application.property_rent_payable}</span>
					</div>
					<div className="govt-form-row">
						<span className="govt-form-label">Tenancy Duration:</span>
						<span className="govt-form-value">{application.property_tenancy_duration}</span>
					</div>
					<div className="govt-form-full-row">
						<div className="govt-form-label">Premises Description:</div>
						<div className="govt-form-value">{application.property_premises_description || '-'}</div>
					</div>
					<div className="govt-form-full-row">
						<div className="govt-form-label">Additional Charges (Elec/Water/Misc):</div>
						<div className="govt-form-value">
							{application.property_charge_electricity || '0'} / {application.property_charge_water || '0'} / {application.property_charge_other_services || '0'}
						</div>
					</div>
				</section>

				<section className="govt-form-section">
					<h4 className="govt-form-section-title"><span className="govt-form-section-num">5</span> Affixed Documents</h4>
					<div className="govt-doc-affix-grid">
						<div className="govt-doc-affix-item">
							<div className="govt-doc-affix-label">Landlord Photograph</div>
							<div className="govt-doc-affix-area">
								{application.landlord_photo_path ? (
									<img src={`${baseUrl}/storage/${application.landlord_photo_path}`} alt="Landlord" />
								) : <div className="affix-placeholder">Affix Photo Here</div>}
							</div>
						</div>
						<div className="govt-doc-affix-item">
							<div className="govt-doc-affix-label">Landlord Signature</div>
							<div className="govt-doc-affix-area govt-doc-affix-area--sig">
								{application.landlord_signature_path ? (
									<img src={`${baseUrl}/storage/${application.landlord_signature_path}`} alt="Landlord Sign" />
								) : <div className="affix-placeholder">Sign Here</div>}
							</div>
						</div>
						<div className="govt-doc-affix-item">
							<div className="govt-doc-affix-label">Tenant Photograph</div>
							<div className="govt-doc-affix-area">
								{application.tenant_photo_path ? (
									<img src={`${baseUrl}/storage/${application.tenant_photo_path}`} alt="Tenant" />
								) : <div className="affix-placeholder">Affix Photo Here</div>}
							</div>
						</div>
						<div className="govt-doc-affix-item">
							<div className="govt-doc-affix-label">Tenant Signature</div>
							<div className="govt-doc-affix-area govt-doc-affix-area--sig">
								{application.tenant_signature_path ? (
									<img src={`${baseUrl}/storage/${application.tenant_signature_path}`} alt="Tenant Sign" />
								) : <div className="affix-placeholder">Sign Here</div>}
							</div>
						</div>
					</div>
				</section>

				<section className="govt-form-declaration">
					<p><strong>Declaration:</strong> I/We hereby declare that the particulars given above are true and correct to the best of my/our knowledge and belief. We understand that any false statement or suppression of facts may lead to rejection of application or cancellation of certificate.</p>
					<div className="govt-form-row govt-form-row--submission-date" style={{ marginTop: '1rem' }}>
						<span className="govt-form-label">Date of Submission:</span>
						<span className="govt-form-value govt-form-value--submission-date">{formatDate(application.created_at)}</span>
					</div>
				</section>
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
		<div className="application-details-page">
			{type === 'tenancy' ? renderTenancyDetails() : (
				<div className="auth-card dashboard-card">
					<div className="detail-header" style={{ marginBottom: '2rem' }}>
						<h1>Details: {application.application_no}</h1>
					</div>
					{renderFormDetails()}
				</div>
			)}
		</div>
	)
}

export default ApplicationDetails
