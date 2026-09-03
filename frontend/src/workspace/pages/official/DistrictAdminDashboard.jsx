import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../api'
import { Icon } from '../../../components/dashboard/Icons'
import { formatDisplayEmail, formatDisplayName } from '../../../utils/formatters'
import { getRoleLabel } from '../../../constants/roleLabels'
import NexusStatCard from '../../components/dashboard/NexusStatCard'
import DistrictAdminQuickActions from '../../components/dashboard/DistrictAdminQuickActions'
import DistrictAdminAttentionPanel from '../../components/dashboard/DistrictAdminAttentionPanel'
import DailyApplicationsPanel, {
	DAILY_PERIOD_OPTIONS,
	resolveActivityDateRange,
} from '../../components/dashboard/DailyApplicationsPanel'
import DistrictCoverageMap from '../../components/dashboard/DistrictCoverageMap'
import { useDistrictBreakdown } from '../../../hooks/useDistrictBreakdown'

function DistrictAdminDashboard({ user, stats, loading, error }) {
	const navigate = useNavigate()
	const s = stats || {}
	const [selectedDate, setSelectedDate] = useState(null)
	const [periodDays, setPeriodDays] = useState(7)


	const displayName = formatDisplayName(user?.name)
	const displayEmail = formatDisplayEmail(user?.email)
	const roleLabel = getRoleLabel(user?.role)
	const districtName = s.district_name || user?.district?.name || 'Your district'
	const queueTotal = (s.pending_review ?? 0) + (s.in_review ?? 0)
	const dateRange = useMemo(
		() => resolveActivityDateRange(selectedDate, periodDays),
		[selectedDate, periodDays]
	)

	const { data: mapData, isLoading: mapLoading, isError: mapIsError } = useDistrictBreakdown(dateRange)
	const mapError = mapIsError ? 'Failed to load map counts' : ''

	const mapDistricts = mapData?.district_breakdown ?? null
	const mapMeta = {
		total: mapData?.total_applications ?? null,
		forms: mapData?.service_applications ?? null,
		uin: mapData?.tenancy_applications ?? null,
	}

	const districtsForMap = mapDistricts ?? s.district_breakdown ?? []
	const showFormBreakdown = (s.form_type_breakdown?.length ?? 0) > 0
	const showDistrictMap =
		(s.district_breakdown?.length ?? 0) > 0 || districtsForMap.length > 0

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
				hint: 'UIN and forms received today',
				icon: 'timeline',
				tone: (s.submitted_today ?? 0) > 0 ? 'accent' : 'default',
			},
			{
				label: 'In queue',
				value: queueTotal,
				hint: `${s.pending_review ?? 0} submitted · ${s.in_review ?? 0} in review`,
				icon: 'clock',
				tone: queueTotal > 0 ? 'warning' : 'success',
			},
			{
				label: 'District users',
				value: s.users_count,
				hint: 'Staff and citizens',
				icon: 'users',
				tone: 'violet',
			},
			{
				label: 'Total applications',
				value: totalApps,
				hint: `${s.tenancy_applications ?? 0} UIN · ${s.service_applications ?? 0} forms`,
				icon: 'list',
				tone: 'accent',
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
			: 'Map and sub-division counts follow the selected day or period'

	return (
		<div className="ws-page ws-official-dashboard ws-district-admin-dashboard">
			{error ? <div className="ws-alert ws-alert--error">{error}</div> : null}

			<header className="ws-da-command">
				<div className="ws-da-command-main">
					<span className="ws-da-command-badge">District administrator</span>
					<h1 className="ws-da-command-title">{districtName} dashboard</h1>
					<p className="ws-da-command-meta">
						{displayName} · {displayEmail} · <strong>{roleLabel}</strong>
					</p>
				</div>
				<div className="ws-da-command-actions">
					<button
						type="button"
						className="ws-btn ws-btn--outline ws-da-command-btn"
						onClick={() => navigate('/dashboard/admin/users')}
					>
						<Icon name="users" />
						Staff directory
					</button>
					<button
						type="button"
						className="ws-btn ws-btn--primary ws-da-command-btn"
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
					<div className="ws-da-kpi-row" aria-label="District metrics">
						{kpiCards.map((card) => (
							<NexusStatCard key={card.label} {...card} compact />
						))}
					</div>

					<div className="ws-da-layout">
						<div className="ws-da-main">
							{showDistrictMap ? (
								<section
									className="ws-da-block ws-da-block--map"
									aria-labelledby="ws-da-map-heading"
								>
									<div className="ws-da-block-head">
										<h2 id="ws-da-map-heading" className="ws-da-block-title">
											Your district on the Assam map
										</h2>
										<p className="ws-da-block-desc">
											Counts for {districtName} —{' '}
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
												filed in district
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
										focusDistrictName={districtName}
										lockToDistrict
									/>
								</section>
							) : null}

							<section
								className="ws-da-block ws-da-block--daily"
								aria-labelledby="ws-da-daily-heading"
							>
								<span id="ws-da-daily-heading" className="sr-only">
									Daily activity and applications
								</span>
								<DailyApplicationsPanel
									dailyActivity={s.daily_activity}
									applications={s.applications_feed || s.recent_applications || []}
									selectedDate={selectedDate}
									onSelectDate={setSelectedDate}
									periodDays={periodDays}
									onPeriodChange={setPeriodDays}
									scopeLabel="your district"
									mode="stats"
									viewerRole={user?.role}
								/>
							</section>
						</div>

						<aside className="ws-da-aside" aria-label="District oversight">
							<DistrictAdminAttentionPanel stats={stats} />

							<div className="ws-da-panel">
								<h3 className="ws-da-panel-title">Quick access</h3>
								<p className="ws-da-panel-desc">Common district admin tasks</p>
								<DistrictAdminQuickActions stats={stats} />
							</div>

							<div className="ws-da-panel ws-da-panel--summary">
								<h3 className="ws-da-panel-title">District snapshot</h3>
								<dl className="ws-da-summary-list">
									<div>
										<dt>District</dt>
										<dd>{districtName}</dd>
									</div>
									<div>
										<dt>UIN applications</dt>
										<dd>{(s.tenancy_applications ?? 0).toLocaleString('en-IN')}</dd>
									</div>
									<div>
										<dt>Service applications</dt>
										<dd>
											{(s.service_applications ?? 0).toLocaleString('en-IN')}
										</dd>
									</div>
									<div>
										<dt>Pending review</dt>
										<dd>{(s.pending_review ?? 0).toLocaleString('en-IN')}</dd>
									</div>
									<div>
										<dt>In review</dt>
										<dd>{(s.in_review ?? 0).toLocaleString('en-IN')}</dd>
									</div>
								</dl>
							</div>

							{showFormBreakdown ? (
								<div className="ws-da-panel ws-da-panel--forms">
									<h3 className="ws-da-panel-title">Forms in your district</h3>
									<p className="ws-da-panel-desc">
										Volume by Assam Tenancy Act form type
									</p>
									<ul className="ws-da-forms-list">
										{s.form_type_breakdown.map((row) => (
											<li key={row.form_key || row.label}>
												<span
													className="ws-da-forms-list__label"
													title={row.label}
												>
													{row.label}
												</span>
												<strong className="ws-da-forms-list__count">
													{(row.count ?? 0).toLocaleString('en-IN')}
												</strong>
											</li>
										))}
									</ul>
								</div>
							) : null}
						</aside>
					</div>
				</>
			)}
		</div>
	)
}

export default DistrictAdminDashboard
