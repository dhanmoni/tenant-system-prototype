import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/dashboard/Icons'
import { formatDate } from '../../../utils/formatters'
import { parseTenantFormsResponse } from '../../../utils/tenantFormsApi'
import { STATUS } from '../../../constants/status'
import { APPLICATION_TYPES } from '../../../constants/application'
import { tenantServiceGroups } from '../../../data/tenantServices'
import { useLanguage } from '../../../i18n'
import { useCitizenApplications } from '../../../hooks/useCitizenApplications'
import { isTenancyApplication } from '../../../utils/applicationStatusProgress'
import CitizenStatusChart from '../../components/dashboard/CitizenStatusChart'
import SubmissionSuccessModal from '../../../components/dashboard/SubmissionSuccessModal'
import {
	CitizenChartSkeleton,
	CitizenRecentSkeleton,
} from './CitizenDashboardSkeleton'

const SERVICE_TILE_ICONS = {
	'rent-authority': 'landmark',
	'rent-court': 'gavel',
	'rent-tribunal': 'scale',
}

const AUTHORITY_TITLE_KEYS = {
	'rent-authority': 'ws.citizen.authority.rentAuthority',
	'rent-court': 'ws.citizen.authority.rentCourt',
	'rent-tribunal': 'ws.citizen.authority.rentTribunal',
}

const FORM_NAME_KEYS = {
	[APPLICATION_TYPES.RENT_REVISION]: 'ws.services.form.i.name',
	[APPLICATION_TYPES.OTHER_CHARGES_REVISION]: 'ws.services.form.ia.name',
	[APPLICATION_TYPES.VALUER_APPOINTMENT]: 'ws.services.form.ib.name',
	[APPLICATION_TYPES.RENT_AUTHORITY_FILING]: 'ws.services.form.iv.name',
	[APPLICATION_TYPES.RENT_COURT_POSSESSION]: 'ws.services.form.ii.name',
	[APPLICATION_TYPES.RENT_COURT_FILING]: 'ws.services.form.iii.name',
	[APPLICATION_TYPES.RENT_COURT_APPEAL]: 'ws.services.form.v.name',
	[APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL]: 'ws.services.form.vi.name',
}

const APP_TYPE_KEYS = {
	[APPLICATION_TYPES.TENANCY_CERTIFICATE]: 'ws.app.tenancy',
	[APPLICATION_TYPES.RENT_REVISION]: 'ws.app.rentRevision',
	[APPLICATION_TYPES.OTHER_CHARGES_REVISION]: 'ws.app.otherCharges',
	[APPLICATION_TYPES.VALUER_APPOINTMENT]: 'ws.app.valuerAppointment',
	[APPLICATION_TYPES.RENT_COURT_POSSESSION]: 'ws.app.rentCourtPossession',
	[APPLICATION_TYPES.RENT_COURT_FILING]: 'ws.app.rentCourtFiling',
	[APPLICATION_TYPES.RENT_AUTHORITY_FILING]: 'ws.app.rentAuthorityFiling',
	[APPLICATION_TYPES.RENT_COURT_APPEAL]: 'ws.app.rentCourtAppeal',
	[APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL]: 'ws.app.rentTribunalAppeal',
}

const STATUS_KEYS = {
	[STATUS.SUBMITTED]: 'ws.status.submitted',
	[STATUS.IN_REVIEW]: 'ws.status.inReview',
	[STATUS.REJECTED]: 'ws.status.rejected',
	[STATUS.COMPLETED]: 'ws.status.completed',
	[STATUS.APPROVED]: 'ws.status.approved',
	[STATUS.DRAFT]: 'ws.status.draft',
	[STATUS.PARTIAL]: 'ws.status.partial',
	[STATUS.UNDER_PROCESS]: 'ws.status.underProcess',
	[STATUS.PENDING]: 'ws.status.pending',
}

function isDraftApplication(app) {
	return String(app?.status || '').trim().toUpperCase() === STATUS.DRAFT
}

function citizenApplicationHref(app) {
	if (!app?.application_no) return '/dashboard/status'
	if (isDraftApplication(app) && isTenancyApplication(app)) {
		return `/dashboard/tenancy-certificate?draft=${encodeURIComponent(app.application_no)}`
	}
	const type = isTenancyApplication(app)
		? 'tenancy'
		: app.form_key || app.application_type || 'form'
	return `/dashboard/status/${encodeURIComponent(type)}/${encodeURIComponent(app.application_no)}`
}

function UserOverview() {
	const { t } = useLanguage()
	const navigate = useNavigate()
	const location = useLocation()
	const [flashMessage, setFlashMessage] = useState('')
	
	const { data: appsRes, isLoading: loading, isError, refetch } = useCitizenApplications('/api/tenant-forms/my', { page: 1, per_page: 50, sort_by: 'created_at', sort_order: 'desc' })

	const { recentApplications, allApplications } = useMemo(() => {
		if (!appsRes) return { recentApplications: [], allApplications: [] }
		const parsed = parseTenantFormsResponse(appsRes)
		return {
			recentApplications: parsed.items.slice(0, 8),
			allApplications: parsed.items,
		}
	}, [appsRes])

	const applications = recentApplications

	const loadError = isError ? t('ws.citizen.recent.loadError') : ''

	useEffect(() => {
		const message = location.state?.successMessage
		if (!message) return
		setFlashMessage(message)
		navigate(location.pathname, { replace: true, state: {} })
	}, [location.pathname, location.state, navigate])

	const formatStatus = (status, applicationType = '') => {
		const normalizedType = String(applicationType || '').toLowerCase()
		const normalizedStatus = String(status || '').trim().toUpperCase()
		if (normalizedStatus === STATUS.SUBMITTED) return t(STATUS_KEYS[STATUS.SUBMITTED])
		if (
			normalizedType.includes(APPLICATION_TYPES.TENANCY_CERTIFICATE) &&
			normalizedStatus === STATUS.UNDER_PROCESS
		) {
			return t(STATUS_KEYS[STATUS.SUBMITTED])
		}
		const key = STATUS_KEYS[normalizedStatus]
		return key ? t(key) : status || '—'
	}

	const formatAppType = (applicationType) => {
		const key = APP_TYPE_KEYS[applicationType]
		return key ? t(key) : applicationType || t('ws.citizen.recent.fallbackType')
	}

	const statusBadgeClass = (status) => {
		const s = String(status || '').toUpperCase()
		if ([STATUS.APPROVED, STATUS.COMPLETED].includes(s)) {
			return 'ws-badge ws-badge--success'
		}
		if (s === STATUS.REJECTED) return 'ws-badge ws-badge--danger'
		if ([STATUS.DRAFT, STATUS.PARTIAL].includes(s)) return 'ws-badge ws-badge--warning'
		if ([STATUS.IN_REVIEW, STATUS.PENDING, STATUS.VALUER_ASSIGNED, STATUS.VALUER_REPORT_SUBMITTED].includes(s)) {
			return 'ws-badge ws-badge--review'
		}
		if ([STATUS.WITHDRAWN, STATUS.CANCELLED].includes(s)) return 'ws-badge ws-badge--muted'
		return 'ws-badge ws-badge--pending'
	}

	const openApplication = (app) => {
		navigate(citizenApplicationHref(app))
	}

	return (
		<div className="ws-page ws-citizen-dashboard">
			<SubmissionSuccessModal
				open={Boolean(flashMessage)}
				message={flashMessage}
				onClose={() => setFlashMessage('')}
			/>

			<section className="ws-card ws-citizen-apply" aria-labelledby="citizen-apply-heading">
				<div className="ws-card-header">
					<h2 id="citizen-apply-heading" className="ws-card-title">
						{t('ws.citizen.actions.title')}
					</h2>
					<button
						type="button"
						className="ws-btn ws-btn--outline ws-btn--sm"
						onClick={() => navigate('/dashboard/services')}
					>
						{t('ws.citizen.actions.browseAll')}
					</button>
				</div>
				<div className="ws-citizen-bento">
					<button
						type="button"
						className="ws-citizen-uin-card"
						aria-labelledby="citizen-uin-heading"
						onClick={() => navigate('/dashboard/tenancy-certificate')}
					>
						<span className="ws-citizen-uin-icon" aria-hidden>
							<Icon name="idCard" />
						</span>
						<span className="ws-citizen-uin-copy">
							<span className="ws-citizen-uin-kicker">{t('ws.citizen.uin.kicker')}</span>
							<span id="citizen-uin-heading" className="ws-citizen-uin-title">
								{t('ws.citizen.uin.title')}
							</span>
							<span className="ws-citizen-uin-desc">{t('ws.citizen.uin.desc')}</span>
						</span>
						<span className="ws-citizen-uin-cta">{t('ws.citizen.uin.cta')}</span>
					</button>
					<div className="ws-citizen-forms-stack">
						{tenantServiceGroups.map((group) => {
							const title = t(AUTHORITY_TITLE_KEYS[group.id] || group.title)
							const formNames = group.forms
								.map((form) => t(FORM_NAME_KEYS[form.formKey]) || form.formName)
								.filter(Boolean)
								.join(', ')
							return (
								<button
									key={group.id}
									type="button"
									className={`ws-citizen-form-card ws-citizen-form-card--${group.id}`}
									aria-label={formNames ? `${title}, ${formNames}` : title}
									onClick={() =>
										navigate(`/dashboard/services?authority=${encodeURIComponent(group.id)}`)
									}
								>
									<span className="ws-citizen-form-card__icon" aria-hidden>
										<Icon name={SERVICE_TILE_ICONS[group.id] || 'services'} />
									</span>
									<span className="ws-citizen-form-card__copy">
										<span className="ws-citizen-form-card__title">{title}</span>
										{formNames ? (
											<span className="ws-citizen-form-card__forms">{formNames}</span>
										) : null}
									</span>
									<span className="ws-citizen-form-card__cta">{t('ws.citizen.uin.cta')}</span>
								</button>
							)
						})}
					</div>
				</div>
			</section>

			<div className="ws-citizen-lower">
				<section className="ws-card ws-citizen-lower-main">
					<div className="ws-card-header">
						<h2 className="ws-card-title">{t('ws.citizen.recent.title')}</h2>
						<button
							type="button"
							className="ws-btn ws-btn--outline ws-btn--sm"
							onClick={() => navigate('/dashboard/status')}
						>
							{t('ws.citizen.recent.viewAll')}
						</button>
					</div>
					<div className="ws-card-body ws-citizen-lower-body">
						{loading ? (
							<CitizenRecentSkeleton />
						) : loadError ? (
							<div className="ws-citizen-empty-state">
								<p>{loadError}</p>
								<button type="button" className="ws-btn ws-btn--outline" onClick={() => refetch()}>
									{t('ws.citizen.recent.retry')}
								</button>
							</div>
						) : applications.length === 0 ? (
							<div className="ws-citizen-empty-state">
								<p>{t('ws.citizen.recent.empty')}</p>
								<button
									type="button"
									className="ws-btn ws-btn--primary"
									onClick={() => navigate('/dashboard/tenancy-certificate')}
								>
									{t('ws.citizen.uin.title')}
								</button>
							</div>
						) : (
							<div className="ws-citizen-recent-table">
								<div className="ws-citizen-recent-head" aria-hidden>
									<span>{t('ws.citizen.recent.col.appNo')}</span>
									<span>{t('ws.citizen.recent.col.type')}</span>
									<span>{t('ws.citizen.recent.col.status')}</span>
									<span>{t('ws.citizen.recent.col.submitted')}</span>
									<span>{t('ws.citizen.recent.col.action')}</span>
								</div>
								<ul className="ws-citizen-recent-list">
									{applications.map((app) => {
										const draft = isDraftApplication(app)
										const actionLabel = draft
											? t('ws.uinStatus.action.resume')
											: t('ws.uinStatus.action.view')
										return (
										<li
											key={app.row_key || app.id || app.application_no}
											className="ws-citizen-recent-item"
										>
											<button
												type="button"
												className="ws-citizen-recent-row"
												aria-label={
													draft
														? t('ws.citizen.recent.resumeAria', {
																appNo: app.application_no || '',
															})
														: t('ws.citizen.recent.openAria', {
																appNo: app.application_no || '',
															})
												}
												onClick={() => openApplication(app)}
											>
												<span className="ws-citizen-recent-no">
													{app.application_no || '—'}
												</span>
												<span className="ws-citizen-recent-field ws-citizen-recent-field--type">
													<span className="ws-citizen-recent-field-label">
														{t('ws.citizen.recent.col.type')}
													</span>
													<span className="ws-citizen-recent-type">
														{formatAppType(app.application_type)}
													</span>
												</span>
												<span className="ws-citizen-recent-field ws-citizen-recent-field--status">
													<span className="ws-citizen-recent-field-label">
														{t('ws.citizen.recent.col.status')}
													</span>
													<span
														className={`ws-citizen-recent-status ${statusBadgeClass(app.status)}`}
													>
														{formatStatus(app.status, app.application_type)}
													</span>
												</span>
												<span className="ws-citizen-recent-field ws-citizen-recent-field--date">
													<span className="ws-citizen-recent-field-label">
														{t('ws.citizen.recent.col.submitted')}
													</span>
													<span className="ws-citizen-recent-date">
														{formatDate(app.created_at)}
													</span>
												</span>
												<span className="ws-citizen-recent-go">
													{actionLabel}
												</span>
											</button>
										</li>
										)
									})}
								</ul>
							</div>
						)}
					</div>
				</section>

				<aside className="ws-card ws-citizen-lower-aside">
					<div className="ws-card-header">
						<h2 className="ws-card-title">{t('ws.citizen.chart.title')}</h2>
					</div>
					<div className="ws-card-body ws-citizen-lower-body">
						{loading ? (
							<CitizenChartSkeleton />
						) : (
							<CitizenStatusChart applications={allApplications} />
						)}
					</div>
				</aside>
			</div>
		</div>
	)
}

export default UserOverview
