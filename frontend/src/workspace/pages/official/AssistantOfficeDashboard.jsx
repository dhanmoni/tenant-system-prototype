import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/dashboard/Icons'
import { formatDisplayEmail, formatDisplayName } from '../../../utils/formatters'
import { getRoleLabel } from '../../../constants/roleLabels'
import { APPLICATION_LABELS, APPLICATION_TYPES } from '../../../constants/application'
import { STATUS, STATUS_LABELS } from '../../../constants/status'
import { ROLES } from '../../../constants/roles'
import { getOfficeProfileForRole } from '../../config/officeProfiles'
import NexusStatCard from '../../components/dashboard/NexusStatCard'
import DistrictCoverageMap from '../../components/dashboard/DistrictCoverageMap'

function statusLabel(status) {
	const key = String(status || '').trim().toUpperCase()
	return STATUS_LABELS[key] || status || '—'
}

function getAppTypeValue(app) {
	return String(app?.form_type || app?.application_type || '').toLowerCase()
}

/**
 * Dedicated dashboard for RA / RC / RT assistants.
 */
function AssistantOfficeDashboard({ user, stats, loading, error }) {
	const navigate = useNavigate()
	const s = stats || {}
	const office = getOfficeProfileForRole(user?.role)
	const canAccessTenancyInbox = user?.role === ROLES.RA_ASSISTANT
	const displayName = formatDisplayName(user?.name)
	const displayEmail = formatDisplayEmail(user?.email)
	const roleLabel = getRoleLabel(user?.role)
	const districtName = s.district_name || user?.district?.name || 'Your district'

	const pendingCount = s.pending_review ?? 0
	const forwardedCount = s.applications_by_status?.IN_REVIEW ?? 0
	const completedCount = s.applications_by_status?.COMPLETED ?? 0
	const rejectedCount = s.applications_by_status?.REJECTED ?? 0
	const showDistrictMap = (s.district_breakdown?.length ?? 0) > 0

	const pendingApps = useMemo(() => {
		const rows = s.recent_applications || []
		const submitted = rows.filter((app) => String(app.status || '').toUpperCase() === STATUS.SUBMITTED)
		// RC/RT assistants do not verify tenancy certificate inbox items.
		if (canAccessTenancyInbox) return submitted
		return submitted.filter(
			(app) => getAppTypeValue(app) !== String(APPLICATION_TYPES.TENANCY_CERTIFICATE).toLowerCase(),
		)
	}, [s.recent_applications])

	const tenancyInboxRoute = '/dashboard/admin/tenancy'
	const serviceInboxRoute = '/dashboard/admin/inbox'

	const tenancyPendingCount = useMemo(() => {
		if (!pendingApps.length) return 0
		return pendingApps.filter(
			(app) => getAppTypeValue(app) === String(APPLICATION_TYPES.TENANCY_CERTIFICATE).toLowerCase(),
		).length
	}, [pendingApps])

	const servicePendingCount = Math.max(0, pendingApps.length - tenancyPendingCount)

	const hasTenancyInQueue = tenancyPendingCount > 0
	const hasServiceInQueue = servicePendingCount > 0

	// Used only when the queue contains a single category.
	const inboxRoute = hasTenancyInQueue && !hasServiceInQueue ? tenancyInboxRoute : serviceInboxRoute

	const openAppDetails = (app) => {
		const applicationNo = app.application_no
		if (!applicationNo) {
			navigate(inboxRoute)
			return
		}

		const isTenancy =
			getAppTypeValue(app) === String(APPLICATION_TYPES.TENANCY_CERTIFICATE).toLowerCase()

		navigate(
			isTenancy && canAccessTenancyInbox
				? `/dashboard/admin/tenancy/${encodeURIComponent(applicationNo)}`
				: `/dashboard/admin/applications/${encodeURIComponent(applicationNo)}`,
			{
				state: {
					from: isTenancy && canAccessTenancyInbox ? 'tenancy' : 'inbox',
				},
			},
		)
	}

	const kpiCards = useMemo(() => {
		if (!office) return []
		return [
			{
				label: office.queueAssistantLabel,
				value: pendingCount,
				hint: 'Submitted — ready for your check',
				icon: 'clock',
				tone: pendingCount > 0 ? 'warning' : 'success',
			},
			{
				label: 'Forwarded to officer',
				value: forwardedCount,
				hint: `With ${office.forwardsTo}`,
				icon: 'timeline',
				tone: 'accent',
			},
			{
				label: 'Forms in your scope',
				value: s.service_applications ?? 0,
				hint: office.scopeBlurb,
				icon: 'file',
				tone: 'default',
			},
			{
				label: 'Completed',
				value: completedCount,
				hint: rejectedCount > 0 ? `${rejectedCount} rejected in scope` : 'Closed in your office scope',
				icon: 'check',
				tone: 'success',
			},
		]
	}, [office, pendingCount, forwardedCount, s.service_applications, completedCount, rejectedCount])

	if (!office || !office.isAssistant) {
		return (
			<div className="ws-page ws-official-dashboard">
				<div className="ws-alert ws-alert--error">Unsupported assistant role for this dashboard.</div>
			</div>
		)
	}

	return (
		<div
			className={`ws-page ws-official-dashboard ws-assistant-dashboard ws-assistant-dashboard--${office.tone}`}
		>
			{error ? <div className="ws-alert ws-alert--error">{error}</div> : null}

			<header className="ws-asst-command">
				<div className="ws-asst-command-main">
					<span className="ws-asst-command-badge">{office.assistantBadge}</span>
					<h1 className="ws-asst-command-title">{office.assistantTitle} dashboard</h1>
					<p className="ws-asst-command-meta">
						{displayName} · {displayEmail} · <strong>{roleLabel}</strong>
						{' · '}
						{districtName}
					</p>
					<p className="ws-asst-command-scope">{office.scopeBlurb}</p>
				</div>
				<div className="ws-asst-command-actions">
					<button
						type="button"
						className="ws-btn ws-btn--primary ws-asst-command-btn"
						onClick={() => navigate(serviceInboxRoute)}
					>
						<Icon name="list" />
						Open service inbox
						{servicePendingCount > 0 ? (
							<span className="ws-asst-command-count">{servicePendingCount}</span>
						) : null}
					</button>
					{canAccessTenancyInbox ? (
						<button
							type="button"
							className="ws-btn ws-btn--outline ws-asst-command-btn"
							onClick={() => navigate(tenancyInboxRoute)}
						>
							<Icon name="list" />
							Open tenancy inbox
							{tenancyPendingCount > 0 ? (
								<span className="ws-asst-command-count">{tenancyPendingCount}</span>
							) : null}
						</button>
					) : null}
				</div>
			</header>

			{loading ? (
				<div className="ws-dashboard-loading">Loading dashboard…</div>
			) : (
				<>
					{pendingCount > 0 ? (
						<div className="ws-asst-alert" role="status">
							<div>
								<strong>{pendingCount} application{pendingCount === 1 ? '' : 's'}</strong>{' '}
								awaiting your verification in {districtName}.
							</div>
							<div className="ws-asst-alert__actions">
								<button
									type="button"
									className="ws-btn ws-btn--sm ws-btn--primary"
									onClick={() => navigate(serviceInboxRoute)}
								>
									Go to service inbox
								</button>
								{canAccessTenancyInbox ? (
									<button
										type="button"
										className="ws-btn ws-btn--sm ws-btn--outline"
										onClick={() => navigate(tenancyInboxRoute)}
									>
										Go to tenancy inbox
									</button>
								) : null}
							</div>
						</div>
					) : (
						<div className="ws-asst-alert ws-asst-alert--clear" role="status">
							Inbox is clear — no submitted applications waiting for verification.
							<div className="ws-asst-alert__actions">
								<button
									type="button"
									className="ws-btn ws-btn--sm ws-btn--primary"
									onClick={() => navigate(serviceInboxRoute)}
								>
									Open service inbox
								</button>
								{canAccessTenancyInbox ? (
									<button
										type="button"
										className="ws-btn ws-btn--sm ws-btn--outline"
										onClick={() => navigate(tenancyInboxRoute)}
									>
										Open tenancy inbox
									</button>
								) : null}
							</div>
						</div>
					)}

					<div className="ws-asst-kpi-row" aria-label="Assistant metrics">
						{kpiCards.map((card) => (
							<NexusStatCard key={card.label} {...card} compact />
						))}
					</div>

					<div className="ws-asst-layout">
						<div className="ws-asst-main">
							<section className="ws-asst-block" aria-labelledby="ws-asst-pending-heading">
								<div className="ws-asst-block-head ws-asst-block-head--row">
									<div>
										<h2 id="ws-asst-pending-heading" className="ws-asst-block-title">
											Needs verification
										</h2>
										<p className="ws-asst-block-desc">
											Submitted applications waiting in your inbox
										</p>
									</div>
									<div className="ws-asst-inbox-actions">
										<button
											type="button"
											className="ws-btn ws-btn--sm ws-btn--outline"
											onClick={() => navigate(serviceInboxRoute)}
										>
											Full service inbox
										</button>
										{canAccessTenancyInbox ? (
											<button
												type="button"
												className="ws-btn ws-btn--sm ws-btn--outline"
												onClick={() => navigate(tenancyInboxRoute)}
											>
												Full tenancy inbox
											</button>
										) : null}
									</div>
								</div>
								{pendingApps.length ? (
									<ul className="ws-asst-pending-list">
										{pendingApps.map((app) => (
											<li key={app.application_no || app.id} className="ws-asst-pending-item">
												<div className="ws-asst-pending-main">
													<span className="ws-asst-pending-no">
														{app.application_no || '—'}
													</span>
													<span className="ws-asst-pending-meta">
														{APPLICATION_LABELS[app.application_type] ||
															app.application_type ||
															'Form'}
														{' · '}
														{app.applicant_name || 'Applicant'}
													</span>
												</div>
												<span className="ws-asst-pending-status">
													{statusLabel(app.status)}
												</span>
												<button
													type="button"
													className="ws-btn ws-btn--sm ws-btn--outline"
													onClick={() => openAppDetails(app)}
												>
													Open
												</button>
											</li>
										))}
									</ul>
								) : (
									<p className="ws-chart-empty">
										No applications need verification right now. Open the inbox for the full
										queue.
									</p>
								)}
							</section>
						</div>

						<aside className="ws-asst-aside" aria-label="Assistant context">
							<div className="ws-asst-panel">
								<h3 className="ws-asst-panel-title">Desk snapshot</h3>
								<dl className="ws-asst-summary-list">
									<div>
										<dt>Office</dt>
										<dd>{office.title}</dd>
									</div>
									<div>
										<dt>Your role</dt>
										<dd>{roleLabel}</dd>
									</div>
									<div>
										<dt>District</dt>
										<dd>{districtName}</dd>
									</div>
									<div>
										<dt>Forwards to</dt>
										<dd>{office.forwardsTo}</dd>
									</div>
									<div>
										<dt>{office.queueAssistantLabel}</dt>
										<dd>{pendingCount.toLocaleString('en-IN')}</dd>
									</div>
								</dl>
							</div>

							{showDistrictMap ? (
								<div className="ws-asst-panel ws-asst-panel--map">
									<h3 className="ws-asst-panel-title">Your district</h3>
									<p className="ws-asst-panel-desc">Boundary for {districtName} only</p>
									<DistrictCoverageMap
										districts={s.district_breakdown}
										focusDistrictName={districtName}
										lockToDistrict
									/>
								</div>
							) : null}
						</aside>
					</div>
				</>
			)}
		</div>
	)
}

export default AssistantOfficeDashboard
