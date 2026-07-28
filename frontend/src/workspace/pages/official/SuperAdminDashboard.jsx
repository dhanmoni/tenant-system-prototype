import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/dashboard/Icons'
import { formatDisplayEmail, formatDisplayName } from '../../../utils/formatters'
import NexusStatCard from '../../components/dashboard/NexusStatCard'
import SuperAdminQuickActions from '../../components/dashboard/SuperAdminQuickActions'
import SuperAdminAttentionPanel from '../../components/dashboard/SuperAdminAttentionPanel'
import SuperAdminPlatformHealth from '../../components/dashboard/SuperAdminPlatformHealth'
import DistrictCoverageMap from '../../components/dashboard/DistrictCoverageMap'
import DailyApplicationsPanel from '../../components/dashboard/DailyApplicationsPanel'
import FormTypeTable from '../../components/dashboard/FormTypeTable'
import ActivityFeed from '../../components/dashboard/ActivityFeed'

function SuperAdminDashboard({ user, stats, loading, error }) {
	const navigate = useNavigate()
	const s = stats || {}
	const [selectedDate, setSelectedDate] = useState(null)
	const displayName = formatDisplayName(user?.name)
	const displayEmail = formatDisplayEmail(user?.email)
	const queueTotal = (s.pending_review ?? 0) + (s.in_review ?? 0)
	const showDistrictMap = (s.district_breakdown?.length ?? 0) > 0
	const showFormBreakdown = (s.form_type_breakdown?.length ?? 0) > 0

	const kpiCards = useMemo(() => {
		const totalApps =
			(s.applications_count ?? 0) ||
			(s.tenancy_applications ?? 0) + (s.service_applications ?? 0)
		const breakdown = s.applications_by_status || {}
		const completed = breakdown.COMPLETED ?? 0
		const serviceTotal = s.service_applications ?? 0
		const completionRate =
			serviceTotal > 0 ? Math.round((completed / serviceTotal) * 100) : null

		return [
			{
				label: 'Submitted today',
				value: s.submitted_today ?? 0,
				hint: 'Statewide UIN and forms',
				icon: 'timeline',
				tone: (s.submitted_today ?? 0) > 0 ? 'accent' : 'default',
			},
			{
				label: 'Districts',
				value: s.districts_count,
				hint: 'Across Assam',
				icon: 'map',
				tone: 'default',
			},
			{
				label: 'Total applications',
				value: totalApps,
				hint: `${s.tenancy_applications ?? 0} UIN · ${s.service_applications ?? 0} forms`,
				icon: 'list',
				tone: 'accent',
			},
			{
				label: 'In processing queue',
				value: queueTotal,
				hint: `${s.pending_review ?? 0} submitted · ${s.in_review ?? 0} in review`,
				icon: 'clock',
				tone: queueTotal > 0 ? 'warning' : 'success',
			},
			{
				label: 'Form completion',
				value: completionRate != null ? `${completionRate}%` : '—',
				hint:
					completionRate != null
						? `${completed} of ${serviceTotal} forms completed`
						: 'No form data yet',
				icon: 'check',
				tone: completionRate != null && completionRate >= 50 ? 'success' : 'default',
			},
		]
	}, [s, queueTotal])

	return (
		<div className="ws-page ws-official-dashboard ws-super-admin-dashboard">
			{error ? <div className="ws-alert ws-alert--error">{error}</div> : null}

			<header className="ws-sa-command">
				<div className="ws-sa-command-main">
					<span className="ws-sa-command-badge">Platform administrator</span>
					<h1 className="ws-sa-command-title">Statewide control panel</h1>
					<p className="ws-sa-command-meta">
						{displayName} · {displayEmail} · <strong>Statewide (Assam)</strong>
					</p>
				</div>
				<div className="ws-sa-command-actions">
					<button
						type="button"
						className="ws-btn ws-btn--outline ws-sa-command-btn"
						onClick={() => navigate('/dashboard/admin/users')}
					>
						<Icon name="users" />
						Manage users
					</button>
					<button
						type="button"
						className="ws-btn ws-btn--primary ws-sa-command-btn"
						onClick={() => navigate('/dashboard/admin/applications')}
					>
						<Icon name="file" />
						View applications
					</button>
				</div>
			</header>

			{loading ? (
				<div className="ws-dashboard-loading">Loading dashboard…</div>
			) : (
				<>
					<div className="ws-sa-kpi-row" aria-label="Key metrics">
						{kpiCards.map((card) => (
							<NexusStatCard key={card.label} {...card} compact />
						))}
					</div>

					<div className="ws-sa-layout">
						<div className="ws-sa-main">
							<section className="ws-sa-block" aria-labelledby="ws-sa-nav-heading">
								<div className="ws-sa-block-head">
									<h2 id="ws-sa-nav-heading" className="ws-sa-block-title">
										Go to
									</h2>
									<p className="ws-sa-block-desc">Common super admin tasks</p>
								</div>
								<SuperAdminQuickActions stats={stats} />
							</section>

							{showDistrictMap ? (
								<section className="ws-sa-block ws-sa-block--map" aria-labelledby="ws-sa-district-heading">
									<div className="ws-sa-block-head">
										<h2 id="ws-sa-district-heading" className="ws-sa-block-title">
											Assam map
										</h2>
										<p className="ws-sa-block-desc">
											Statewide coverage — pick a district to zoom in and view its stats
										</p>
									</div>
									<DistrictCoverageMap
										districts={s.district_breakdown}
										fillContainer
									/>
								</section>
							) : null}

							<section className="ws-sa-block ws-sa-block--daily" aria-labelledby="ws-sa-daily-heading">
								<span id="ws-sa-daily-heading" className="sr-only">
									Daily activity and applications
								</span>
								<DailyApplicationsPanel
									dailyActivity={s.daily_activity}
									applications={s.applications_feed || s.recent_applications || []}
									selectedDate={selectedDate}
									onSelectDate={setSelectedDate}
									scopeLabel="statewide"
									mode="stats"
								/>
							</section>

							<section
								className="ws-sa-block ws-sa-block--activity"
								aria-labelledby="ws-sa-activity-heading"
							>
								<div className="ws-sa-block-head">
									<h2 id="ws-sa-activity-heading" className="ws-sa-block-title">
										Recent activity
									</h2>
									<p className="ws-sa-block-desc">
										Sign-ins and administrative actions
									</p>
								</div>
								<ActivityFeed />
							</section>
						</div>

						<aside className="ws-sa-aside" aria-label="Monitoring sidebar">
							<SuperAdminAttentionPanel stats={stats} />
							<SuperAdminPlatformHealth stats={stats} />
							{showFormBreakdown ? (
								<div className="ws-sa-panel ws-sa-panel--forms">
									<h3 className="ws-sa-panel-title">Forms breakdown</h3>
									<p className="ws-sa-panel-desc">Volume by form type (statewide)</p>
									<FormTypeTable forms={s.form_type_breakdown} />
								</div>
							) : null}
						</aside>
					</div>
				</>
			)}
		</div>
	)
}

export default SuperAdminDashboard
