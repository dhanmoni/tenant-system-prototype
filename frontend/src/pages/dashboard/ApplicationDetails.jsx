import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useParams, useNavigate, useOutletContext } from 'react-router-dom'
import api from '../../api'
import { formatDate } from '../../utils/formatters'
import { APPLICATION_LABELS, APPLICATION_TYPES } from '../../constants/application'
import { STATUS } from '../../constants/status'
import { adminStatusBadgeClass, adminStatusLabel } from '../../utils/adminStatusBadge'
import WorkflowConfirmModal from '../../components/dashboard/WorkflowConfirmModal'
import ServiceFormLegalDocument, {
	serviceFormName,
	serviceFormViewerLabel,
} from '../../components/forms/ServiceFormLegalDocument'
import { useApplicationDetail } from '../../hooks/useApplicationDetail'
import { useToast } from '../../context/ToastContext'
import { useLanguage } from '../../i18n'
import { useTenantProceedings } from '../../hooks/useTenantProceedings'
import './admin/ApplicationDetails.css'

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
	const isTenancy = type === APPLICATION_TYPES.TENANCY_CERTIFICATE
	const hearingsApply =
		!isTenancy && type !== APPLICATION_TYPES.VALUER_APPOINTMENT
	const statusPath = isTenancy ? '/dashboard/status?type=tenancy' : '/dashboard/status?type=service'
	const typeLabel = APPLICATION_LABELS[type] || 'Application'


	const { data: application, isLoading: loading, isError } = useApplicationDetail(type, applicationNo)
	const error = isError ? 'Failed to load application details' : ''
	const queryClient = useQueryClient()

	const { data: proceedings = [], isLoading: proceedingsLoading } = useTenantProceedings(
		hearingsApply ? (application?.form_type || type) : null,
		hearingsApply ? application?.id : null
	)
	/**
	 * Open the signed notice.
	 *
	 * The document is fetched rather than rendered here: it is the PDF the issuing authority actually
	 * signed. Re-rendering it in the browser would show the party something that is not the signed
	 * instrument, and the two could drift. Only signed proceedings reach this list at all.
	 */
	const openNoticeDocument = async (proceeding) => {
		try {
			const response = await api.get(
				`/api/tenant-forms/${type}/${application.id}/proceedings/${proceeding.id}/document`,
				{ responseType: 'blob' },
			)
			const url = URL.createObjectURL(response.data)
			window.open(url, '_blank', 'noopener')
			// The tab holds its own reference once opened; releasing ours shortly after keeps a long
			// session from accumulating blobs.
			setTimeout(() => URL.revokeObjectURL(url), 60000)
		} catch {
			showToast('Could not open this notice. Please try again.', 'error')
		}
	}
	const [confirmWithdraw, setConfirmWithdraw] = useState(false)
	const [withdrawing, setWithdrawing] = useState(false)
	const [confirmCancelUin, setConfirmCancelUin] = useState(false)
	const [cancelReason, setCancelReason] = useState('')
	const [cancellingUin, setCancellingUin] = useState(false)
	const [proceedingsOpen, setProceedingsOpen] = useState(false)





	const withdrawMutation = useMutation({
		mutationFn: async () => {
			const { data } = await api.post(`/api/tenant-forms/${type}/${application.id}/withdraw`)
			return data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['application-detail', type, applicationNo] })
			queryClient.invalidateQueries({ queryKey: ['citizen-applications'] })
			queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
		}
	})

	const handleWithdraw = async () => {
		setWithdrawing(true)
		try {
			await withdrawMutation.mutateAsync()
			showToast(t('ws.withdraw.success'), 'success')
			setConfirmWithdraw(false)
		} catch (err) {
			showToast(err?.response?.data?.message || t('ws.withdraw.error'), 'error')
		} finally {
			setWithdrawing(false)
		}
	}

	const cancelMutation = useMutation({
		mutationFn: async (reason) => {
			const { data } = await api.post(`/api/tenancy-applications/${application.application_no}/cancel`, { reason })
			return data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['application-detail', type, applicationNo] })
			queryClient.invalidateQueries({ queryKey: ['citizen-applications'] })
			queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
		}
	})

	const handleCancelUin = async () => {
		const reason = cancelReason.trim()
		if (reason.length < 10) {
			showToast(t('ws.uinCancel.reasonError'), 'error')
			return
		}
		setCancellingUin(true)
		try {
			await cancelMutation.mutateAsync(reason)
			showToast(t('ws.uinCancel.success'), 'success')
			setConfirmCancelUin(false)
			setCancelReason('')
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
			<div
				className={`admin-app-details${isTenancy ? ' admin-tenancy-doc' : ' admin-service-form-view'}`}
				aria-busy="true"
			>
				<p className="ws-breadcrumb no-print">
					<Link to={statusPath}>My applications</Link>
					<span className="ws-breadcrumb-sep" aria-hidden>
						/
					</span>
					<span>{typeLabel}</span>
				</p>
				<div className="admin-app-details__toolbar no-print">
					<button
						type="button"
						className="ws-btn ws-btn--outline ws-btn--sm admin-app-details__back"
						onClick={() => navigate(statusPath)}
					>
						{isTenancy ? t('ws.appView.back') : t('ws.appView.backService')}
					</button>
				</div>
				<div className="ws-app-view-loading" role="status" aria-live="polite" aria-label={t('ws.appView.loading')}>
					<div className="ws-app-view-loading__banner">
						<span className="ws-route-spinner" aria-hidden />
						<p>{t('ws.appView.loading')}</p>
					</div>
					<div className="ws-app-view-skel-paper" aria-hidden>
						<span className="ws-skel ws-skel--view-title" />
						<span className="ws-skel ws-skel--view-line" />
						<span className="ws-skel ws-skel--view-line ws-skel--view-line-short" />
						<span className="ws-skel ws-skel--view-line" />
						<span className="ws-skel ws-skel--view-line ws-skel--view-line-mid" />
						<span className="ws-skel ws-skel--view-line" />
						<span className="ws-skel ws-skel--view-line ws-skel--view-line-short" />
						<span className="ws-skel ws-skel--view-line" />
						<span className="ws-skel ws-skel--view-line ws-skel--view-line-mid" />
						<span className="ws-skel ws-skel--view-block" />
					</div>
				</div>
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
					{isTenancy ? t('ws.appView.back') : t('ws.appView.backService')}
				</Link>
			</div>
		)
	}

	const canWithdraw = application.status === STATUS.SUBMITTED
	const canCancelUin =
		isTenancy &&
		Boolean(application.uid) &&
		[STATUS.APPROVED, STATUS.COMPLETED].includes(String(application.status || '').toUpperCase()) &&
		userIsLandlord(user, application)
	const isCancelled = String(application.status || '').toUpperCase() === STATUS.CANCELLED

	const formatNoticeType = (noticeType) =>
		String(noticeType || '')
			.replace(/_/g, ' ')
			.replace(/\b\w/g, (c) => c.toUpperCase())

	const proceedingsBody = (
		<div className="ws-proceedings-panel">
			{proceedingsLoading ? (
				<p className="admin-app-details__proceedings-empty">{t('ws.appView.proceedingsLoading')}</p>
			) : proceedings.length === 0 ? (
				<p className="admin-app-details__proceedings-empty">{t('ws.appView.proceedingsEmpty')}</p>
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
										{t('ws.appView.hearing')}:{' '}
										<strong>
											{p.hearing_date}
											{p.hearing_time ? ` · ${p.hearing_time}` : ''}
										</strong>
										{p.venue ? ` · ${p.venue}` : ''}
									</p>
								) : null}
								<p className="admin-app-details__proceeding-meta">
									{t('ws.appView.sentBy')}: {p.sent_by?.name || 'Unknown'}
								</p>
							</div>
							<button
								type="button"
								className="ws-btn ws-btn--outline ws-btn--sm"
								onClick={() => openNoticeDocument(p)}
							>
								{t('ws.appView.viewDocument')}
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	)

	const showProceedings = hearingsApply && proceedings.length > 0
	const districtLabel =
		typeof application.district === 'string'
			? application.district
			: application.district?.name || ''

	return (
		<div className={`admin-app-details${isTenancy ? ' admin-tenancy-doc' : ' admin-service-form-view'}`}>
			{breadcrumb}

			<div className="admin-app-details__toolbar no-print">
				<button
					type="button"
					className="ws-btn ws-btn--outline ws-btn--sm admin-app-details__back"
					onClick={() => navigate(statusPath)}
				>
					{isTenancy ? t('ws.appView.back') : t('ws.appView.backService')}
				</button>
				<div className="admin-app-details__toolbar-actions">
					{showProceedings ? (
						<button
							type="button"
							className="ws-btn ws-btn--outline ws-btn--sm ws-proceedings-btn has-alert"
							onClick={() => setProceedingsOpen(true)}
						>
							{t('ws.appView.proceedings')}
							<span className="ws-proceedings-btn__count" aria-label={`${proceedings.length} notices`}>
								{proceedings.length}
							</span>
						</button>
					) : null}
					<button
						type="button"
						className="ws-btn ws-btn--outline ws-btn--sm"
						onClick={() => window.print()}
					>
						Print / Save PDF
					</button>
					{isTenancy && application.agreement_pdf_url ? (
						<button
							type="button"
							className="ws-btn ws-btn--primary ws-btn--sm"
							onClick={() => window.open(application.agreement_pdf_url, '_blank')}
						>
							View agreement
						</button>
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
									{application.landlord_photo_url ? (
										<img
											src={application.landlord_photo_url}
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
									{application.landlord_signature_url ? (
										<img
											src={application.landlord_signature_url}
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
									{application.tenant_photo_url ? (
										<img
											src={application.tenant_photo_url}
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
									{application.tenant_signature_url ? (
										<img
											src={application.tenant_signature_url}
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
					<div className="admin-tenancy-doc__preview">
						<aside className="admin-tenancy-doc__registry no-print">
							<div className="admin-tenancy-doc__registry-item">
								<span>Application no.</span>
								<strong>{application.application_no || '—'}</strong>
							</div>
							<div className="admin-tenancy-doc__registry-item">
								<span>Form</span>
								<strong>{serviceFormName(type)}</strong>
							</div>
							<div className="admin-tenancy-doc__registry-item">
								<span>Status</span>
								<span className={adminStatusBadgeClass(application.status)}>
									{adminStatusLabel(application.status)}
								</span>
							</div>
							<div className="admin-tenancy-doc__registry-item">
								<span>Submitted on</span>
								<strong>{formatDate(application.created_at)}</strong>
							</div>
							{districtLabel ? (
								<div className="admin-tenancy-doc__registry-item">
									<span>District</span>
									<strong>{districtLabel}</strong>
								</div>
							) : null}
							{application.tenancy_uin ? (
								<div className="admin-tenancy-doc__registry-item">
									<span>UIN</span>
									<strong>{application.tenancy_uin}</strong>
								</div>
							) : null}
						</aside>

						<div className="tenancy-preview-container ws-service-form-view">
							<p className="ws-service-form-view__label no-print">
								{serviceFormViewerLabel(type)}
							</p>
							<ServiceFormLegalDocument application={application} formType={type} />
						</div>
					</div>
				</>
			)}

			{showProceedings ? (
			<WorkflowConfirmModal
				open={proceedingsOpen}
				onClose={() => setProceedingsOpen(false)}
				title={t('ws.appView.proceedingsTitle')}
				description={t('ws.appView.proceedingsDesc')}
				hidePrimary
				size="wide"
				bodyClassName="ws-proceedings-modal-body"
			>
				{proceedingsBody}
			</WorkflowConfirmModal>
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
