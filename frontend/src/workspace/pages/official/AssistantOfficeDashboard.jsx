import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/dashboard/Icons'
import { formatDisplayEmail, formatDisplayName } from '../../../utils/formatters'
import { getRoleLabel } from '../../../constants/roleLabels'
import { APPLICATION_LABELS } from '../../../constants/application'
import { STATUS, STATUS_LABELS } from '../../../constants/status'
import { getOfficeProfileForRole } from '../../config/officeProfiles'
import NexusStatCard from '../../components/dashboard/NexusStatCard'
import DistrictCoverageMap from '../../components/dashboard/DistrictCoverageMap'

function statusLabel(status) {
	const key = String(status || '').trim().toUpperCase()
	return STATUS_LABELS[key] || status || '—'
}

/**
 * Dedicated dashboard for RA / RC / RT assistants.
 */
function AssistantOfficeDashboard({ user, stats, loading, error }) {
	const navigate = useNavigate()
	const s = stats || {}
	const office = getOfficeProfileForRole(user?.role)
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
		return rows.filter((app) => String(app.status || '').toUpperCase() === STATUS.SUBMITTED)
	}, [s.recent_applications])

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
						onClick={() => navigate('/dashboard/admin/inbox')}
					>
						<Icon name="list" />
						Open inbox
						{pendingCount > 0 ? (
							<span className="ws-asst-command-count">{pendingCount}</span>
						) : null}
					</button>
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
							<button
								type="button"
								className="ws-btn ws-btn--sm ws-btn--primary"
								onClick={() => navigate('/dashboard/admin/inbox')}
							>
								Go to inbox
							</button>
						</div>
					) : (
						<div className="ws-asst-alert ws-asst-alert--clear" role="status">
							Inbox is clear — no submitted applications waiting for verification.
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
									<button
										type="button"
										className="ws-btn ws-btn--sm ws-btn--outline"
										onClick={() => navigate('/dashboard/admin/inbox')}
									>
										Full inbox
									</button>
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
													onClick={() =>
														navigate(
															app.application_no
																? `/dashboard/admin/applications/${encodeURIComponent(app.application_no)}`
																: '/dashboard/admin/inbox'
														)
													}
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
