import { useEffect, useState } from 'react'
import { useOutletContext, useParams, useNavigate } from 'react-router-dom'
import api from '../../api'
import { formatDateTime, formatDate } from '../../utils/formatters'
import { APPLICATION_TYPES } from '../../constants/application'

import emblemDark from '../../assets/img/emblem-dark.png'

function ApplicationDetails() {
	const { user } = useOutletContext()
	const { type, applicationNo } = useParams()
	const navigate = useNavigate()
	
	const [application, setApplication] = useState(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')

	const formKeyToEndpoint = {
		[APPLICATION_TYPES.RENT_REVISION]: '/api/rent-revision-applications',
		[APPLICATION_TYPES.OTHER_CHARGES_REVISION]: '/api/other-charges-revision-applications',
		[APPLICATION_TYPES.VALUER_APPOINTMENT]: '/api/valuer-appointment-applications',
		[APPLICATION_TYPES.RENT_COURT_POSSESSION]: '/api/rent-court-possession-applications',
		[APPLICATION_TYPES.RENT_COURT_FILING]: '/api/rent-court-filing-applications',
		[APPLICATION_TYPES.RENT_AUTHORITY_FILING]: '/api/rent-authority-filing-applications',
		[APPLICATION_TYPES.RENT_COURT_APPEAL]: '/api/rent-court-appeal-applications',
		[APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL]: '/api/rent-tribunal-appeal-applications',
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

	const baseUrl = (api.defaults.baseURL || 'http://localhost:8000').replace(/\/$/, '')
	
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

				<div className="govt-form-header" style={{ textAlign: 'center', marginBottom: '30px' }}>
					<div style={{ fontWeight: 'bold', fontSize: '1.2rem', textTransform: 'uppercase' }}>THE FIRST SCHEDULE</div>
					<div style={{ fontStyle: 'italic', marginBottom: '5px' }}>[See section 4(1) and 7(2)]</div>
					<div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>FORM FOR INFORMATION OF TENANCY</div>
				</div>

				<div style={{ marginBottom: '20px' }}>
					<div>To,</div>
					<div>The Rent Authority</div>
					<div>{application.office?.name ? `${application.office.name}, ${application.office.district?.name || ''}` : '________________________'} (Address)</div>
				</div>

				<div className="preview-list-container">
					<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
						<div style={{ width: '40px' }}>1.</div>
						<div style={{ flex: '1.5' }}>Name and address of the landlord</div>
						<div style={{ flex: '2' }}>: {application.landlord_name ? `${application.landlord_name}, ${application.landlord_address}` : ''}</div>
					</div>
					<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
						<div style={{ width: '40px' }}>2.</div>
						<div style={{ flex: '1.5' }}>Name and address of the Property Manager (if any)</div>
						<div style={{ flex: '2' }}>: {application.manager_name && application.manager_name !== 'NA' ? `${application.manager_name}, ${application.manager_address}` : ''}</div>
					</div>
					<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
						<div style={{ width: '40px' }}>3.</div>
						<div style={{ flex: '1.5' }}>Name(s) and address of the tenant, including email and contact details,</div>
						<div style={{ flex: '2' }}>: {application.tenant_name ? `${application.tenant_name}, ${application.tenant_address}, Email: ${application.tenant_email}, Phone: ${application.tenant_phone}` : ''}</div>
					</div>
					<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
						<div style={{ width: '40px' }}>4.</div>
						<div style={{ flex: '1.5' }}>Description of previous tenancy, if any</div>
						<div style={{ flex: '2' }}>: {application.tenant_previous_tenancy}</div>
					</div>
					<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
						<div style={{ width: '40px' }}>5.</div>
						<div style={{ flex: '1.5' }}>Description of premises let to the tenant Including appurtenant land, if any</div>
						<div style={{ flex: '2' }}>: {application.property_premises_description}</div>
					</div>
					<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
						<div style={{ width: '40px' }}>6.</div>
						<div style={{ flex: '1.5' }}>Date from which possession is given to the tenant</div>
						<div style={{ flex: '2' }}>: {application.property_possession_date}</div>
					</div>
					<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
						<div style={{ width: '40px' }}>7.</div>
						<div style={{ flex: '1.5' }}>Rent payable as in section 8</div>
						<div style={{ flex: '2' }}>: {application.property_rent_payable ? `₹${application.property_rent_payable}` : ''}</div>
					</div>
					<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
						<div style={{ width: '40px' }}>8.</div>
						<div style={{ flex: '1.5' }}>Furniture and other equipment provided to the tenant</div>
						<div style={{ flex: '2' }}>: {application.property_furniture_description}</div>
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
							<div>: {application.property_charge_electricity}</div>
							<div>: {application.property_charge_water}</div>
							<div>: {application.property_charge_furnishing}</div>
							<div>: {application.property_charge_other_services}</div>
						</div>
					</div>
					<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
						<div style={{ width: '40px' }}>10.</div>
						<div style={{ flex: '1.5' }}>Attach rent or lease or tenancy agreement</div>
						<div style={{ flex: '2' }}>: {application.agreement_pdf_path ? 'Attached' : 'Not Attached'}</div>
					</div>
					<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
						<div style={{ width: '40px' }}>11.</div>
						<div style={{ flex: '1.5' }}>Duration of tenancy (Period for which let)</div>
						<div style={{ flex: '2' }}>: {application.property_tenancy_duration} {application.property_tenancy_end_date ? `(Till ${application.property_tenancy_end_date})` : ''}</div>
					</div>
					<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
						<div style={{ width: '40px' }}>12.</div>
						<div style={{ flex: '1.5' }}>Permanent Account Number (PAN) of landlord:</div>
						<div style={{ flex: '2' }}>: {application.landlord_pan}</div>
					</div>
					<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
						<div style={{ width: '40px' }}>13.</div>
						<div style={{ flex: '1.5' }}>Aadhaar number of landlord:</div>
						<div style={{ flex: '2' }}>: {application.landlord_aadhar || ''}</div>
					</div>
					<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
						<div style={{ width: '40px' }}>14.</div>
						<div style={{ flex: '1.5' }}>Mobile Number and E-mail id of landlord<br />(if available)</div>
						<div style={{ flex: '2' }}>: {application.landlord_phone}, {application.landlord_email}</div>
					</div>
					<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
						<div style={{ width: '40px' }}>15.</div>
						<div style={{ flex: '1.5' }}>Permanent Account Number (PAN)of tenant</div>
						<div style={{ flex: '2' }}>: {application.tenant_pan}</div>
					</div>
					<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
						<div style={{ width: '40px' }}>16.</div>
						<div style={{ flex: '1.5' }}>Aadhaar number of tenant</div>
						<div style={{ flex: '2' }}>: {application.tenant_aadhar || ''}</div>
					</div>
					<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
						<div style={{ width: '40px' }}>17.</div>
						<div style={{ flex: '1.5' }}>Mobile Number and E-mail id of tenant</div>
						<div style={{ flex: '2' }}>: {application.tenant_phone}, {application.tenant_email}</div>
					</div>
					<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
						<div style={{ width: '40px' }}>18.</div>
						<div style={{ flex: '1.5' }}>Permanent Account Number (PAN)of Property Manager (if any)</div>
						<div style={{ flex: '2' }}>: {application.manager_pan && application.manager_pan !== 'NA' ? application.manager_pan : ''}</div>
					</div>
					<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
						<div style={{ width: '40px' }}>19.</div>
						<div style={{ flex: '1.5' }}>Aadhaar number of Property Manager<br />(if any)</div>
						<div style={{ flex: '2' }}>: {application.manager_aadhar || ''}</div>
					</div>
					<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
						<div style={{ width: '40px' }}>20.</div>
						<div style={{ flex: '1.5' }}>Mobile Number and E-mail id of<br />Property Manager (if any)</div>
						<div style={{ flex: '2' }}>: {application.manager_phone && application.manager_phone !== 'NA' ? `${application.manager_phone}, ${application.manager_email !== 'noemail@noemail.com' ? application.manager_email : ''}` : ''}</div>
					</div>
				</div>

				<div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px', marginBottom: '30px' }}>
					<div style={{ textAlign: 'center' }}>
						<div style={{ marginBottom: '10px' }}>Name and signature of landlord</div>
						<div style={{ border: '1px solid #000', width: '120px', height: '140px', margin: '10px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
							{application.landlord_photo_path ? <img src={`${baseUrl}/storage/${application.landlord_photo_path}`} alt="L Photo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '0.8rem', textAlign: 'center' }}>Photograph<br />of<br />Landlord</span>}
						</div>
						<div style={{ height: '50px', marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
							{application.landlord_signature_path ? <img src={`${baseUrl}/storage/${application.landlord_signature_path}`} alt="L Sign" style={{ maxHeight: '100%', maxWidth: '150px' }} /> : null}
						</div>
					</div>
					<div style={{ textAlign: 'center' }}>
						<div style={{ marginBottom: '10px' }}>Name and signature of tenant</div>
						<div style={{ border: '1px solid #000', width: '120px', height: '140px', margin: '10px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
							{application.tenant_photo_path ? <img src={`${baseUrl}/storage/${application.tenant_photo_path}`} alt="T Photo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '0.8rem', textAlign: 'center' }}>Photograph<br />of<br />Tenant</span>}
						</div>
						<div style={{ height: '50px', marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
							{application.tenant_signature_path ? <img src={`${baseUrl}/storage/${application.tenant_signature_path}`} alt="T Sign" style={{ maxHeight: '100%', maxWidth: '150px' }} /> : null}
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
								<span className="label-text" style={{ textTransform: key === 'tenancy_uin' ? 'none' : 'capitalize' }}>{key === 'tenancy_uin' ? 'Tenancy UIN' : key.replace(/_/g, ' ')}:</span>
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
