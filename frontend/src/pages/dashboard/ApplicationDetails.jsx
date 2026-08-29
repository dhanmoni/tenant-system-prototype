import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate, useOutletContext } from 'react-router-dom'
import api from '../../api'
import { formatDateTime, formatDate } from '../../utils/formatters'
import { APPLICATION_LABELS, APPLICATION_TYPES } from '../../constants/application'
import { STATUS } from '../../constants/status'
import { adminStatusBadgeClass, adminStatusLabel } from '../../utils/adminStatusBadge'
import NoticeDocumentViewer from '../../components/dashboard/NoticeDocumentViewer'
import WorkflowConfirmModal from '../../components/dashboard/WorkflowConfirmModal'
import { useToast } from '../../context/ToastContext'
import { useLanguage } from '../../i18n'
import { useTenantProceedings } from '../../hooks/useTenantProceedings'
import './admin/ApplicationDetails.css'

const FORM_ENDPOINTS = {
	[APPLICATION_TYPES.RENT_REVISION]: '/api/rent-revision-applications',
	[APPLICATION_TYPES.OTHER_CHARGES_REVISION]: '/api/other-charges-revision-applications',
	[APPLICATION_TYPES.VALUER_APPOINTMENT]: '/api/valuer-appointment-applications',
	[APPLICATION_TYPES.RENT_COURT_POSSESSION]: '/api/rent-court-possession-applications',
	[APPLICATION_TYPES.RENT_COURT_FILING]: '/api/rent-court-filing-applications',
	[APPLICATION_TYPES.RENT_AUTHORITY_FILING]: '/api/rent-authority-filing-applications',
	[APPLICATION_TYPES.RENT_COURT_APPEAL]: '/api/rent-court-appeal-applications',
	[APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL]: '/api/rent-tribunal-appeal-applications',
}

const DETAIL_SKIP_KEYS = new Set([
	'id',
	'user_id',
	'user',
	'district_id',
	'signature_image_path',
	'created_at',
	'updated_at',
	'deleted_at',
	'application_no',
	'status',
	'form_type',
	'wizard_step',
	'ref_code',
])

function labelizeField(key) {
	if (key === 'tenancy_uin') return 'Tenancy UIN'
	return String(key || '').replace(/_/g, ' ')
}

function userIsLandlord(user, app) {
	if (!user || !app) return false
	if (app.landlord_user_id && Number(app.landlord_user_id) === Number(user.id)) return true
	if (user.phone && app.landlord_phone && String(app.landlord_phone) === String(user.phone)) return true
	if (
		user.email &&
		app.landlord_email &&
		String(app.landlord_email).toLowerCase() === String(user.email).toLowerCase()
	) {
		return true
	}
	return false
}

function ApplicationDetails() {
	const { type, applicationNo } = useParams()
	const navigate = useNavigate()
	const { user } = useOutletContext() || {}
	const { showToast } = useToast()
	const { t } = useLanguage()
	const statusPath = '/dashboard/status'
	const typeLabel = APPLICATION_LABELS[type] || 'Application'

	const [application, setApplication] = useState(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const { data: proceedings = [], isLoading: proceedingsLoading } = useTenantProceedings(
		type !== APPLICATION_TYPES.TENANCY_CERTIFICATE ? (application?.form_type || type) : null,
		type !== APPLICATION_TYPES.TENANCY_CERTIFICATE ? application?.id : null
	)
	const [viewProceedingDoc, setViewProceedingDoc] = useState(null)
	const [confirmWithdraw, setConfirmWithdraw] = useState(false)
	const [withdrawing, setWithdrawing] = useState(false)
	const [confirmCancelUin, setConfirmCancelUin] = useState(false)
	const [cancelReason, setCancelReason] = useState('')
	const [cancellingUin, setCancellingUin] = useState(false)

	useEffect(() => {
		loadApplication()
	}, [type, applicationNo])

	const loadApplication = async () => {
		setLoading(true)
		setError('')
		try {
			if (type === APPLICATION_TYPES.TENANCY_CERTIFICATE) {
				const { data } = await api.get(`/api/tenancy-applications/${applicationNo}`)
				setApplication(data.application || null)
			} else {
				const endpoint = FORM_ENDPOINTS[type] || '/api/forms'
				const { data } = await api.get(`${endpoint}/${applicationNo}`)
				setApplication(data.application || null)
			}
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load application details')
		} finally {
			setLoading(false)
		}
	}



	const handleWithdraw = async () => {
		setWithdrawing(true)
		try {
			await api.post(`/api/tenant-forms/${type}/${application.id}/withdraw`)
			showToast(t('ws.withdraw.success'), 'success')
			setConfirmWithdraw(false)
			await loadApplication()
		} catch (err) {
			showToast(err?.response?.data?.message || t('ws.withdraw.error'), 'error')
		} finally {
			setWithdrawing(false)
		}
	}

	const handleCancelUin = async () => {
		const reason = cancelReason.trim()
		if (reason.length < 10) {
			showToast(t('ws.uinCancel.reasonError'), 'error')
			return
		}
		setCancellingUin(true)
		try {
			await api.post(`/api/tenancy-applications/${application.application_no}/cancel`, { reason })
			showToast(t('ws.uinCancel.success'), 'success')
			setConfirmCancelUin(false)
			setCancelReason('')
			await loadApplication()
		} catch (err) {
			showToast(err?.response?.data?.message || t('ws.uinCancel.error'), 'error')
		} finally {
			setCancellingUin(false)
		}
	}

	const breadcrumb = (
		<p className="ws-breadcrumb no-print">
			<Link to={statusPath}>My applications</Link>
			<span className="ws-breadcrumb-sep" aria-hidden>
				/
			</span>
			<span>{application?.application_no || typeLabel}</span>
		</p>
	)

	if (loading) {
		return (
			<div className="admin-app-details">
				<p className="ws-muted">Loading application details…</p>
			</div>
		)
	}

	if (error || !application) {
		return (
			<div className="admin-app-details">
				{breadcrumb}
				<div className="ws-alert ws-alert--error admin-app-details__alert" role="alert">
					{error || 'No application data found.'}
				</div>
				<Link to={statusPath} className="ws-btn ws-btn--outline ws-btn--sm">
					Back to my applications
				</Link>
			</div>
		)
	}

	const baseUrl = (api.defaults.baseURL || 'http://localhost:8000').replace(/\/$/, '')
	const canWithdraw = application.status === STATUS.SUBMITTED
	const isTenancy = type === APPLICATION_TYPES.TENANCY_CERTIFICATE
	const canCancelUin =
		isTenancy &&
		Boolean(application.uid) &&
		[STATUS.APPROVED, STATUS.COMPLETED].includes(String(application.status || '').toUpperCase()) &&
		userIsLandlord(user, application)
	const isCancelled = String(application.status || '').toUpperCase() === STATUS.CANCELLED

	const renderProceedings = () => {
		if (type !== APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL) return null

		const formatNoticeType = (noticeType) =>
			String(noticeType || '')
				.replace(/_/g, ' ')
				.replace(/\b\w/g, (c) => c.toUpperCase())

		return (
			<section className="admin-app-details__card admin-app-details__proceedings-card">
				<div className="admin-app-details__proceedings-head">
					<div className="admin-app-details__proceedings-head-text">
						<h3 className="admin-app-details__section-title">Case proceedings & notices</h3>
						<p className="admin-app-details__proceedings-desc">
							Hearing notices and orders issued for your appeal
						</p>
					</div>
				</div>
				<div className="admin-app-details__proceedings-body">
					{proceedingsLoading ? (
						<p className="admin-app-details__proceedings-empty">Loading proceedings…</p>
					) : proceedings.length === 0 ? (
						<p className="admin-app-details__proceedings-empty">
							No proceedings or notices have been recorded for this appeal yet.
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
										View document
									</button>
								</li>
							))}
						</ul>
					)}
				</div>
			</section>
		)
	}

	const detailFields = Object.entries(application).filter(([key, value]) => {
		if (DETAIL_SKIP_KEYS.has(key)) return false
		if (value === null || value === undefined || value === '') return false
		if (typeof value === 'object') return false
		return true
	})

	const signatureUrl = application.signature_image_path
		? `${baseUrl}/storage/${application.signature_image_path}`
		: ''

	return (
		<div className={`admin-app-details${isTenancy ? ' admin-tenancy-doc' : ''}`}>
			{breadcrumb}

			<div className="admin-app-details__toolbar no-print">
				<button
					type="button"
					className="ws-btn ws-btn--outline ws-btn--sm admin-app-details__back"
					onClick={() => navigate(statusPath)}
				>
					Back to my applications
				</button>
				<div className="admin-app-details__toolbar-actions">
					{isTenancy ? (
						<>
							<button
								type="button"
								className="ws-btn ws-btn--outline ws-btn--sm"
								onClick={() => window.print()}
							>
								Print / Save PDF
							</button>
							{application.agreement_pdf_path ? (
								<button
									type="button"
									className="ws-btn ws-btn--primary ws-btn--sm"
									onClick={() =>
										window.open(
											`${baseUrl}/storage/${application.agreement_pdf_path}`,
											'_blank',
										)
									}
								>
									View agreement
								</button>
							) : null}
						</>
					) : null}
					{canWithdraw ? (
						<button
							type="button"
							className="ws-btn ws-btn--danger ws-btn--sm"
							onClick={() => setConfirmWithdraw(true)}
						>
							{t('ws.uinStatus.action.withdraw')}
						</button>
					) : null}
					{canCancelUin ? (
						<button
							type="button"
							className="ws-btn ws-btn--danger ws-btn--sm"
							title={t('ws.uinCancel.actionTitle')}
							onClick={() => setConfirmCancelUin(true)}
						>
							{t('ws.uinCancel.action')}
						</button>
					) : null}
				</div>
			</div>

			{isCancelled ? (
				<div className="ws-alert ws-alert--error admin-app-details__alert no-print" role="status">
					<strong>{t('ws.uinCancel.banner')}</strong>
					{application.cancellation_reason ? (
						<p style={{ margin: '0.4rem 0 0' }}>
							{t('ws.uinCancel.reasonLabel')}: {application.cancellation_reason}
						</p>
					) : null}
				</div>
			) : null}

			{isTenancy ? (
				<div className="tenancy-preview-container">
					<div className="govt-form-document">
						<div className="govt-form-watermark">{isCancelled ? t('ws.status.cancelled') : 'OFFICIAL'}</div>
						<div className="govt-form-header" style={{ textAlign: 'center', marginBottom: '30px' }}>
							<div style={{ fontWeight: 'bold', fontSize: '1.2rem', textTransform: 'uppercase' }}>
								THE FIRST SCHEDULE
							</div>
							<div style={{ fontStyle: 'italic', marginBottom: '5px' }}>
								[See section 4(1) and 7(2)]
							</div>
							<div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
								FORM FOR INFORMATION OF TENANCY
							</div>
						</div>
						<div style={{ marginBottom: '20px' }}>
							<div>To,</div>
							<div>The Rent Authority</div>
							<div>
								{application.office?.name
									? `${application.office.name}, ${application.office.district?.name || ''}`
									: '________________________'}{' '}
								(Address)
							</div>
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
									application.manager_name && application.manager_name !== 'NA'
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
								['4.', 'Description of previous tenancy, if any', application.tenant_previous_tenancy || ''],
								[
									'5.',
									'Description of premises let to the tenant including appurtenant land, if any',
									application.property_premises_description || '',
								],
								[
									'6.',
									'Date from which possession is given to the tenant',
									formatDate(application.property_possession_date) || '',
								],
								[
									'7.',
									'Rent payable as in section 8',
									application.property_rent_payable ? `₹${application.property_rent_payable}` : '',
								],
								[
									'8.',
									'Furniture and other equipment provided to the tenant',
									application.property_furniture_description || '',
								],
							].map(([sl, label, value]) => (
								<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }} key={sl}>
									<div style={{ width: '40px' }}>{sl}</div>
									<div style={{ flex: '1.5' }}>{label}</div>
									<div style={{ flex: '2' }}>: {value}</div>
								</div>
							))}
							<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }}>
								<div style={{ width: '40px' }}>9.</div>
								<div style={{ flex: '1.5' }}>
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
								<div style={{ flex: '2', display: 'flex', flexDirection: 'column' }}>
									<div>&nbsp;</div>
									<div>: {application.property_charge_electricity}</div>
									<div>: {application.property_charge_water}</div>
									<div>: {application.property_charge_furnishing}</div>
									<div>: {application.property_charge_other_services}</div>
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
								['12.', 'Permanent Account Number (PAN) of landlord', application.landlord_pan || ''],
								['13.', 'Aadhaar number of landlord', application.landlord_aadhar || ''],
								[
									'14.',
									'Mobile Number and E-mail id of landlord (if available)',
									[application.landlord_phone, application.landlord_email].filter(Boolean).join(', '),
								],
								['15.', 'Permanent Account Number (PAN) of tenant', application.tenant_pan || ''],
								['16.', 'Aadhaar number of tenant', application.tenant_aadhar || ''],
								[
									'17.',
									'Mobile Number and E-mail id of tenant',
									[application.tenant_phone, application.tenant_email].filter(Boolean).join(', '),
								],
								[
									'18.',
									'Permanent Account Number (PAN) of Property Manager (if any)',
									application.manager_pan && application.manager_pan !== 'NA'
										? application.manager_pan
										: '',
								],
								['19.', 'Aadhaar number of Property Manager (if any)', application.manager_aadhar || ''],
								[
									'20.',
									'Mobile Number and E-mail id of Property Manager (if any)',
									application.manager_phone && application.manager_phone !== 'NA'
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
								<div className="preview-list-item" style={{ display: 'flex', marginBottom: '15px' }} key={sl}>
									<div style={{ width: '40px' }}>{sl}</div>
									<div style={{ flex: '1.5' }}>{label}</div>
									<div style={{ flex: '2' }}>: {value}</div>
								</div>
							))}
						</div>
						<div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px', marginBottom: '30px' }}>
							<div style={{ textAlign: 'center' }}>
								<div style={{ marginBottom: '10px' }}>Name and signature of landlord</div>
								<div
									style={{
										border: '1px solid #000',
										width: '120px',
										height: '140px',
										margin: '10px auto',
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										justifyContent: 'center',
										backgroundColor: '#fff',
									}}
								>
									{application.landlord_photo_path ? (
										<img
											src={`${baseUrl}/storage/${application.landlord_photo_path}`}
											alt="Landlord photograph"
											style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }}
										/>
									) : (
										<span style={{ fontSize: '0.8rem', textAlign: 'center' }}>
											Photograph
											<br />
											of
											<br />
											Landlord
										</span>
									)}
								</div>
								<div style={{ height: '50px', marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
									{application.landlord_signature_path ? (
										<img
											src={`${baseUrl}/storage/${application.landlord_signature_path}`}
											alt="Landlord signature"
											style={{ maxHeight: '100%', maxWidth: '150px' }}
										/>
									) : null}
								</div>
							</div>
							<div style={{ textAlign: 'center' }}>
								<div style={{ marginBottom: '10px' }}>Name and signature of tenant</div>
								<div
									style={{
										border: '1px solid #000',
										width: '120px',
										height: '140px',
										margin: '10px auto',
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										justifyContent: 'center',
										backgroundColor: '#fff',
									}}
								>
									{application.tenant_photo_path ? (
										<img
											src={`${baseUrl}/storage/${application.tenant_photo_path}`}
											alt="Tenant photograph"
											style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }}
										/>
									) : (
										<span style={{ fontSize: '0.8rem', textAlign: 'center' }}>
											Photograph
											<br />
											of
											<br />
											Tenant
										</span>
									)}
								</div>
								<div style={{ height: '50px', marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
									{application.tenant_signature_path ? (
										<img
											src={`${baseUrl}/storage/${application.tenant_signature_path}`}
											alt="Tenant signature"
											style={{ maxHeight: '100%', maxWidth: '150px' }}
										/>
									) : null}
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
			) : (
				<>
					<div className="ws-user-detail__grid">
						<div className="ws-user-detail__field">
							<span className="ws-user-detail__label">Application no.</span>
							<p className="ws-user-detail__value">{application.application_no || '—'}</p>
						</div>
						<div className="ws-user-detail__field">
							<span className="ws-user-detail__label">Type</span>
							<p className="ws-user-detail__value">{typeLabel}</p>
						</div>
						<div className="ws-user-detail__field">
							<span className="ws-user-detail__label">Status</span>
							<p className="ws-user-detail__value">
								<span className={adminStatusBadgeClass(application.status)}>
									{adminStatusLabel(application.status)}
								</span>
							</p>
						</div>
						<div className="ws-user-detail__field">
							<span className="ws-user-detail__label">Submitted</span>
							<p className="ws-user-detail__value">
								{formatDateTime(application.created_at) || '—'}
							</p>
						</div>
						{application.signature_name ? (
							<div className="ws-user-detail__field">
								<span className="ws-user-detail__label">Signed name</span>
								<p className="ws-user-detail__value">{application.signature_name}</p>
							</div>
						) : null}
					</div>

					{detailFields.length > 0 ? (
						<section className="admin-app-details__card">
							<h3 className="admin-app-details__section-title">Submitted details</h3>
							<div className="ws-user-detail__grid" style={{ border: 'none', padding: '1.15rem 1.25rem' }}>
								{detailFields.map(([key, value]) => (
									<div className="ws-user-detail__field" key={key}>
										<span className="ws-user-detail__label">{labelizeField(key)}</span>
										<p className="ws-user-detail__value">{String(value)}</p>
									</div>
								))}
							</div>
						</section>
					) : null}

					{signatureUrl ? (
						<section className="admin-app-details__card">
							<h3 className="admin-app-details__section-title">Signature</h3>
							<div style={{ padding: '1.15rem 1.25rem' }}>
								<img
									className="signature-preview"
									src={signatureUrl}
									alt="Applicant signature"
									style={{ maxWidth: '300px', display: 'block', border: '1px solid #e2e8f0' }}
								/>
							</div>
						</section>
					) : null}

					{renderProceedings()}
				</>
			)}

			{viewProceedingDoc ? (
				<NoticeDocumentViewer
					open
					onClose={() => setViewProceedingDoc(null)}
					proceeding={viewProceedingDoc}
					application={{ ...application, form_type: type }}
				/>
			) : null}

			<WorkflowConfirmModal
				open={confirmWithdraw}
				onClose={() => setConfirmWithdraw(false)}
				title={t('ws.withdraw.title')}
				description={t('ws.withdraw.description', {
					appNo: application.application_no || '',
				})}
				primaryLabel={withdrawing ? t('ws.withdraw.working') : t('ws.withdraw.confirm')}
				primaryVariant="danger"
				primaryDisabled={withdrawing}
				onPrimary={handleWithdraw}
			/>

			<WorkflowConfirmModal
				open={confirmCancelUin}
				onClose={() => {
					if (!cancellingUin) {
						setConfirmCancelUin(false)
						setCancelReason('')
					}
				}}
				title={t('ws.uinCancel.title')}
				description={t('ws.uinCancel.description', {
					appNo: application.application_no || '',
					uin: application.uid || '',
				})}
				primaryLabel={cancellingUin ? t('ws.uinCancel.working') : t('ws.uinCancel.confirm')}
				primaryVariant="danger"
				primaryDisabled={cancellingUin || cancelReason.trim().length < 10}
				onPrimary={handleCancelUin}
			>
				<label className="workflow-confirm-field">
					<span className="workflow-confirm-field__label">{t('ws.uinCancel.reason')}</span>
					<textarea
						className="workflow-confirm-field__input"
						rows={4}
						value={cancelReason}
						onChange={(e) => setCancelReason(e.target.value)}
						placeholder={t('ws.uinCancel.reasonPh')}
						disabled={cancellingUin}
					/>
				</label>
			</WorkflowConfirmModal>
		</div>
	)
}

export default ApplicationDetails
