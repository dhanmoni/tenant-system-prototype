import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../api'
import { Icon } from '../../../components/dashboard/Icons'
import { formatDisplayEmail, formatDisplayName } from '../../../utils/formatters'
import NexusStatCard from '../../components/dashboard/NexusStatCard'
import SuperAdminQuickActions from '../../components/dashboard/SuperAdminQuickActions'
import SuperAdminAttentionPanel from '../../components/dashboard/SuperAdminAttentionPanel'
import SuperAdminPlatformHealth from '../../components/dashboard/SuperAdminPlatformHealth'
import DistrictCoverageMap from '../../components/dashboard/DistrictCoverageMap'
import DailyApplicationsPanel, {
	DAILY_PERIOD_OPTIONS,
	resolveActivityDateRange,
} from '../../components/dashboard/DailyApplicationsPanel'
import FormTypeTable from '../../components/dashboard/FormTypeTable'
import ActivityFeed from '../../components/dashboard/ActivityFeed'

function SuperAdminDashboard({ user, stats, loading, error }) {
	const navigate = useNavigate()
	const s = stats || {}
	const [selectedDate, setSelectedDate] = useState(null)
	const [periodDays, setPeriodDays] = useState(7)
	const [mapDistricts, setMapDistricts] = useState(null)
	const [mapMeta, setMapMeta] = useState({
		total: null,
		forms: null,
		uin: null,
	})
	const [mapLoading, setMapLoading] = useState(false)
	const [mapError, setMapError] = useState('')

	const displayName = formatDisplayName(user?.name)
	const displayEmail = formatDisplayEmail(user?.email)
	const queueTotal = (s.pending_review ?? 0) + (s.in_review ?? 0)
	const dateRange = useMemo(
		() => resolveActivityDateRange(selectedDate, periodDays),
		[selectedDate, periodDays]
	)

	const districtsForMap = mapDistricts ?? s.district_breakdown ?? []
	const showDistrictMap = (s.district_breakdown?.length ?? 0) > 0 || districtsForMap.length > 0
	const showFormBreakdown = (s.form_type_breakdown?.length ?? 0) > 0

	useEffect(() => {
		let cancelled = false

		const loadMapBreakdown = async () => {
			setMapLoading(true)
			setMapError('')
			try {
				const params = {}
				if (dateRange.from && dateRange.to) {
					params.from = dateRange.from
					params.to = dateRange.to
				}
				const { data } = await api.get('/api/dashboard-stats/district-breakdown', {
					params,
				})
				if (cancelled) return
				setMapDistricts(data?.district_breakdown || [])
				setMapMeta({
					total: data?.total_applications ?? 0,
					forms: data?.service_applications ?? 0,
					uin: data?.tenancy_applications ?? 0,
				})
			} catch (err) {
				if (cancelled) return
				setMapError(err?.response?.data?.message || 'Failed to load map counts')
				setMapDistricts((prev) => prev ?? s.district_breakdown ?? [])
			} finally {
				if (!cancelled) setMapLoading(false)
			}
		}

		loadMapBreakdown()
		return () => {
			cancelled = true
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- only refetch when the selected range changes
	}, [dateRange.from, dateRange.to])

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

	const mapHint =
		mapMeta.total != null
			? `${mapMeta.total.toLocaleString('en-IN')} applications in this period · ${
					mapMeta.uin ?? 0
				} UIN · ${mapMeta.forms ?? 0} forms`
			: 'District shading shows how many applications were filed in the selected period'

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
								<section
									className="ws-sa-block ws-sa-block--map"
									aria-labelledby="ws-sa-district-heading"
								>
									<div className="ws-sa-block-head">
										<h2 id="ws-sa-district-heading" className="ws-sa-block-title">
											Assam map
										</h2>
										<p className="ws-sa-block-desc">
											Application counts by district for{' '}
											<strong>{dateRange.label}</strong>
											{mapLoading ? ' · updating…' : ''}
										</p>
									</div>

									<div className="ws-sa-map-filters">
										{selectedDate ? (
											<div className="ws-sa-map-filters__selected">
												<span>
													Showing map for{' '}
													<strong>{dateRange.label}</strong>
												</span>
												<button
													type="button"
													className="ws-daily-panel-clear"
													onClick={() => setSelectedDate(null)}
												>
													Clear date
												</button>
											</div>
										) : (
											<div
												className="ws-daily-period"
												role="group"
												aria-label="Map period"
											>
												{DAILY_PERIOD_OPTIONS.map((option) => (
													<button
														key={option.value}
														type="button"
														className={`ws-daily-period__btn${
															periodDays === option.value
																? ' ws-daily-period__btn--active'
																: ''
														}`}
														onClick={() => setPeriodDays(option.value)}
														aria-pressed={periodDays === option.value}
													>
														{option.label}
													</button>
												))}
											</div>
										)}
										{mapMeta.total != null ? (
											<p className="ws-sa-map-period-total">
												<strong>
													{(mapMeta.total ?? 0).toLocaleString('en-IN')}
												</strong>{' '}
												filed statewide
												<span className="ws-sa-map-period-total__split">
													{(mapMeta.uin ?? 0).toLocaleString('en-IN')} UIN ·{' '}
													{(mapMeta.forms ?? 0).toLocaleString('en-IN')}{' '}
													forms
												</span>
											</p>
										) : null}
									</div>

									{mapError ? (
										<div className="ws-alert ws-alert--error">{mapError}</div>
									) : null}

									<DistrictCoverageMap
										districts={districtsForMap}
										hint={mapHint}
										fillContainer
									/>
								</section>
							) : null}

							<section
								className="ws-sa-block ws-sa-block--daily"
								aria-labelledby="ws-sa-daily-heading"
							>
								<span id="ws-sa-daily-heading" className="sr-only">
									Daily activity and applications
								</span>
								<DailyApplicationsPanel
									dailyActivity={s.daily_activity}
									applications={s.applications_feed || s.recent_applications || []}
									selectedDate={selectedDate}
									onSelectDate={setSelectedDate}
									periodDays={periodDays}
									onPeriodChange={setPeriodDays}
									scopeLabel="statewide"
									mode="stats"
									viewerRole={user?.role}
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
