import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/dashboard/Icons'
import { formatDisplayEmail, formatDisplayName } from '../../../utils/formatters'
import { getRoleLabel } from '../../../constants/roleLabels'
import { APPLICATION_LABELS, APPLICATION_TYPES } from '../../../constants/application'
import { STATUS, STATUS_LABELS } from '../../../constants/status'
import NexusStatCard from '../../components/dashboard/NexusStatCard'
import DistrictCoverageMap from '../../components/dashboard/DistrictCoverageMap'

function statusLabel(status) {
	const key = String(status || '').trim().toUpperCase()
	return STATUS_LABELS[key] || status || '—'
}

/**
 * Dedicated dashboard for Valuer — Form I-B assignments only.
 */
function ValuerDashboard({ user, stats, loading, error }) {
	const navigate = useNavigate()
	const s = stats || {}
	const displayName = formatDisplayName(user?.name)
	const displayEmail = formatDisplayEmail(user?.email)
	const roleLabel = getRoleLabel(user?.role)
	const districtName = s.district_name || user?.district?.name || 'Your district'

	const assignedCount = s.pending_review ?? 0
	const reportsSubmitted = s.reports_submitted ?? s.in_review ?? 0
	const completedCount = s.valuer_completed ?? s.applications_by_status?.COMPLETED ?? 0
	const totalAssigned = s.service_applications ?? 0
	const showDistrictMap = (s.district_breakdown?.length ?? 0) > 0

	const assignedApps = useMemo(() => {
		const rows = s.recent_applications || []
		return rows.filter((app) => String(app.status || '').toUpperCase() === STATUS.VALUER_ASSIGNED)
	}, [s.recent_applications])

	const kpiCards = useMemo(
		() => [
			{
				label: 'Assigned to you',
				value: assignedCount,
				hint: 'Form I-B awaiting your report',
				icon: 'clock',
				tone: assignedCount > 0 ? 'teal' : 'success',
			},
			{
				label: 'Reports submitted',
				value: reportsSubmitted,
				hint: 'Waiting on Rent Authority',
				icon: 'timeline',
				tone: 'accent',
			},
			{
				label: 'Your Form I-B cases',
				value: totalAssigned,
				hint: 'Assigned to you (all statuses)',
				icon: 'file',
				tone: 'default',
			},
			{
				label: 'Completed',
				value: completedCount,
				hint: 'Closed after your report',
				icon: 'check',
				tone: 'success',
			},
		],
		[assignedCount, reportsSubmitted, totalAssigned, completedCount]
	)

	return (
		<div className="ws-page ws-official-dashboard ws-valuer-dashboard">
			{error ? <div className="ws-alert ws-alert--error">{error}</div> : null}

			<header className="ws-valuer-command">
				<div className="ws-valuer-command-main">
					<span className="ws-valuer-command-badge">Valuer desk</span>
					<h1 className="ws-valuer-command-title">Valuer dashboard</h1>
					<p className="ws-valuer-command-meta">
						{displayName} · {displayEmail} · <strong>{roleLabel}</strong>
						{' · '}
						{districtName}
					</p>
					<p className="ws-valuer-command-scope">
						Form I-B valuer appointment reports only — files assigned to you by Rent Authority
					</p>
				</div>
				<div className="ws-valuer-command-actions">
					<button
						type="button"
						className="ws-btn ws-btn--primary ws-valuer-command-btn"
						onClick={() => navigate('/dashboard/admin/inbox')}
					>
						<Icon name="list" />
						Open valuation inbox
						{assignedCount > 0 ? (
							<span className="ws-valuer-command-count">{assignedCount}</span>
						) : null}
					</button>
				</div>
			</header>

			{loading ? (
				<div className="ws-dashboard-loading">Loading dashboard…</div>
			) : (
				<>
					{assignedCount > 0 ? (
						<div className="ws-valuer-alert" role="status">
							<div>
								<strong>
									{assignedCount} Form I-B case{assignedCount === 1 ? '' : 's'}
								</strong>{' '}
								assigned to you in {districtName}.
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
						<div className="ws-valuer-alert ws-valuer-alert--clear" role="status">
							No Form I-B files currently assigned for a valuation report.
						</div>
					)}

					<div className="ws-valuer-kpi-row" aria-label="Valuer metrics">
						{kpiCards.map((card) => (
							<NexusStatCard key={card.label} {...card} compact />
						))}
					</div>

					<div className="ws-valuer-layout">
						<div className="ws-valuer-main">
							<section className="ws-valuer-block" aria-labelledby="ws-valuer-assigned-heading">
								<div className="ws-valuer-block-head ws-valuer-block-head--row">
									<div>
										<h2 id="ws-valuer-assigned-heading" className="ws-valuer-block-title">
											Awaiting your report
										</h2>
										<p className="ws-valuer-block-desc">
											Form I-B applications assigned to you
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
								{assignedApps.length ? (
									<ul className="ws-valuer-pending-list">
										{assignedApps.map((app) => (
											<li key={app.application_no || app.id} className="ws-valuer-pending-item">
												<div className="ws-valuer-pending-main">
													<span className="ws-valuer-pending-no">
														{app.application_no || '—'}
													</span>
													<span className="ws-valuer-pending-meta">
														{APPLICATION_LABELS[APPLICATION_TYPES.VALUER_APPOINTMENT]}
														{' · '}
														{app.applicant_name || 'Applicant'}
													</span>
												</div>
												<span className="ws-valuer-pending-status">
													{statusLabel(app.status)}
												</span>
												<button
													type="button"
													className="ws-btn ws-btn--sm ws-btn--outline"
													onClick={() =>
														navigate(
															app.application_no
																? `/dashboard/admin/applications/${encodeURIComponent(app.application_no)}`
																: '/dashboard/admin/inbox',
															app.application_no
																? { state: { from: 'inbox' } }
																: undefined,
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
										No Form I-B cases awaiting your report. Use the valuation inbox for the full
										queue.
									</p>
								)}
							</section>
						</div>

						<aside className="ws-valuer-aside" aria-label="Valuer context">
							<div className="ws-valuer-panel">
								<h3 className="ws-valuer-panel-title">Desk snapshot</h3>
								<dl className="ws-valuer-summary-list">
									<div>
										<dt>Role</dt>
										<dd>{roleLabel}</dd>
									</div>
									<div>
										<dt>District</dt>
										<dd>{districtName}</dd>
									</div>
									<div>
										<dt>Form in scope</dt>
										<dd>Form I-B</dd>
									</div>
									<div>
										<dt>Assigned now</dt>
										<dd>{assignedCount.toLocaleString('en-IN')}</dd>
									</div>
									<div>
										<dt>Reports submitted</dt>
										<dd>{reportsSubmitted.toLocaleString('en-IN')}</dd>
									</div>
								</dl>
							</div>

							{showDistrictMap ? (
								<div className="ws-valuer-panel ws-valuer-panel--map">
									<h3 className="ws-valuer-panel-title">Your district</h3>
									<p className="ws-valuer-panel-desc">Boundary for {districtName} only</p>
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

export default ValuerDashboard
