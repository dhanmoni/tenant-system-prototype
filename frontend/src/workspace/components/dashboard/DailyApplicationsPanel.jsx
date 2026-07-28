import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DistrictActivityCalendar from './DistrictActivityCalendar'
import DistrictApplicationsTable from './DistrictApplicationsTable'
import CategoryDoughnutChart from './CategoryDoughnutChart'
import StatusBarChart from './StatusBarChart'
import { STATUS_LABELS } from '../../../constants/status'
import './chartConfig'

const PERIOD_OPTIONS = [
	{ value: 7, label: '7 days' },
	{ value: 14, label: '14 days' },
	{ value: 30, label: '30 days' },
	{ value: 0, label: 'All available' },
]

function formatSelectedDate(dateKey) {
	if (!dateKey) return ''
	const [y, m, d] = dateKey.split('-').map(Number)
	if (!y || !m || !d) return dateKey
	return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	})
}

function appLocalDateKey(createdAt) {
	if (!createdAt) return null
	const parsed = new Date(createdAt)
	if (Number.isNaN(parsed.getTime())) {
		return String(createdAt).slice(0, 10) || null
	}
	const y = parsed.getFullYear()
	const m = String(parsed.getMonth() + 1).padStart(2, '0')
	const d = String(parsed.getDate()).padStart(2, '0')
	return `${y}-${m}-${d}`
}

function periodCutoff(periodDays) {
	if (!periodDays) return null
	const cutoff = new Date()
	cutoff.setDate(cutoff.getDate() - (periodDays - 1))
	cutoff.setHours(0, 0, 0, 0)
	return cutoff
}

function dateKeyToLocalDate(dateKey) {
	const [y, m, d] = String(dateKey || '').split('-').map(Number)
	if (!y || !m || !d) return null
	return new Date(y, m - 1, d)
}

function periodLabel(periodDays) {
	const option = PERIOD_OPTIONS.find((item) => item.value === periodDays)
	if (option?.value === 0) return 'All available days'
	return option ? `Last ${option.label}` : 'Selected period'
}

/**
 * Combined calendar + applications panel (super admin & district admin).
 * @param {'table'|'stats'} [mode] — `stats` shows charts (super admin); `table` keeps the list.
 */
function DailyApplicationsPanel({
	dailyActivity = [],
	applications = [],
	selectedDate,
	onSelectDate,
	fullListPath = '/dashboard/admin/applications',
	scopeLabel = 'statewide',
	mode = 'table',
}) {
	const navigate = useNavigate()
	const isStatsMode = mode === 'stats'
	const [periodDays, setPeriodDays] = useState(7)

	const activityByDate = useMemo(() => {
		const map = new Map()
		dailyActivity.forEach((row) => {
			if (row?.date) map.set(row.date, row)
		})
		return map
	}, [dailyActivity])

	const dayStats = useMemo(() => {
		const cutoff = !selectedDate ? periodCutoff(periodDays) : null

		const rows = selectedDate
			? applications.filter((app) => appLocalDateKey(app.created_at) === selectedDate)
			: applications.filter((app) => {
					if (!cutoff) return true
					const key = appLocalDateKey(app.created_at)
					const local = dateKeyToLocalDate(key)
					return local ? local >= cutoff : false
				})

		const fromCalendar = selectedDate ? activityByDate.get(selectedDate) : null

		const periodWindow = !selectedDate
			? dailyActivity
					.filter((row) => {
						const local = dateKeyToLocalDate(row.date)
						if (!local) return false
						if (!cutoff) return true
						return local >= cutoff
					})
					.reduce(
						(acc, row) => ({
							total: acc.total + (row.total || 0),
							uin: acc.uin + (row.uin || 0),
							forms: acc.forms + (row.forms || 0),
						}),
						{ total: 0, uin: 0, forms: 0 }
					)
			: null

		const uin =
			(selectedDate ? fromCalendar?.uin : periodWindow?.uin) ??
			rows.filter((app) => app.category === 'uin').length
		const forms =
			(selectedDate ? fromCalendar?.forms : periodWindow?.forms) ??
			rows.filter((app) => app.category === 'form').length
		const total =
			(selectedDate ? fromCalendar?.total : periodWindow?.total) ?? rows.length

		const byStatus = {}
		rows.forEach((app) => {
			const key = String(app.status || '').toUpperCase() || 'OTHER'
			byStatus[key] = (byStatus[key] || 0) + 1
		})

		const statusKeys = Object.keys(byStatus).sort(
			(a, b) => (byStatus[b] || 0) - (byStatus[a] || 0)
		)

		return {
			total,
			uin,
			forms,
			byStatus,
			statusKeys,
			typeCategories: [
				{ label: 'UIN / Tenancy', count: uin },
				{ label: 'Service forms', count: forms },
			],
			hasAny: total > 0 || rows.length > 0,
			periodTitle: periodLabel(periodDays),
		}
	}, [applications, selectedDate, activityByDate, dailyActivity, periodDays])

	return (
		<div className={`ws-daily-panel${isStatsMode ? ' ws-daily-panel--stats' : ''}`}>
			<div className="ws-daily-panel-head">
				<div>
					<h2 className="ws-daily-panel-title">
						{isStatsMode ? 'Daily activity' : 'Daily activity & applications'}
					</h2>
					<p className="ws-daily-panel-desc">
						{isStatsMode
							? `Pick a day on the calendar or choose a period (${scopeLabel}).`
							: `Pick a day on the calendar to filter applications (${scopeLabel}). Sort and filter the list beside it.`}
					</p>
				</div>
				<button
					type="button"
					className="ws-btn ws-btn--sm ws-btn--outline"
					onClick={() => navigate(fullListPath)}
				>
					Open full list
				</button>
			</div>

			<div className="ws-daily-panel-body">
				<div className="ws-daily-panel-calendar">
					<DistrictActivityCalendar
						dailyActivity={dailyActivity}
						selectedDate={selectedDate}
						onSelectDate={onSelectDate}
						embedded
						statsMode={isStatsMode}
					/>
				</div>

				{isStatsMode ? (
					<div className="ws-daily-panel-stats">
						<div className="ws-daily-panel-table-head">
							<h3 className="ws-daily-panel-table-title">
								{selectedDate
									? `Charts for ${formatSelectedDate(selectedDate)}`
									: dayStats.periodTitle}
							</h3>
							{selectedDate ? (
								<button
									type="button"
									className="ws-daily-panel-clear"
									onClick={() => onSelectDate(null)}
								>
									Clear date
								</button>
							) : null}
						</div>

						{!selectedDate ? (
							<div
								className="ws-daily-period"
								role="group"
								aria-label="Stats period"
							>
								{PERIOD_OPTIONS.map((option) => (
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
						) : null}

						<p className="ws-daily-stats-total">
							<strong>{dayStats.total.toLocaleString('en-IN')}</strong> total
							submissions
							{!selectedDate
								? periodDays
									? ` in the last ${periodDays} days`
									: ' in the available period'
								: ''}
						</p>

						{dayStats.hasAny ? (
							<div className="ws-daily-stats-charts">
								<section className="ws-daily-stats-chart" aria-label="Type mix">
									<h4 className="ws-daily-stats-chart__title">By type</h4>
									<p className="ws-daily-stats-chart__hint">UIN vs service forms</p>
									<div className="ws-daily-stats-chart__canvas ws-daily-stats-chart__canvas--pie">
										<CategoryDoughnutChart
											categories={dayStats.typeCategories}
											emptyLabel="No type data for this period."
										/>
									</div>
								</section>

								<section className="ws-daily-stats-chart" aria-label="Status mix">
									<h4 className="ws-daily-stats-chart__title">By status</h4>
									<p className="ws-daily-stats-chart__hint">
										{selectedDate
											? 'Applications submitted on this day'
											: 'Applications in the selected period'}
									</p>
									<div className="ws-daily-stats-chart__canvas ws-daily-stats-chart__canvas--bar">
										<StatusBarChart
											breakdown={dayStats.byStatus}
											keys={
												dayStats.statusKeys.length
													? dayStats.statusKeys
													: ['SUBMITTED', 'IN_REVIEW', 'COMPLETED', 'REJECTED']
											}
											emptyLabel="No status data for this period."
											staticChart
										/>
									</div>
								</section>
							</div>
						) : (
							<p className="ws-daily-stats-empty">
								{selectedDate
									? 'No applications recorded on this day.'
									: 'No application activity in this period yet.'}
							</p>
						)}

						{dayStats.statusKeys.length > 0 ? (
							<ul className="ws-daily-stats-legend" aria-hidden>
								{dayStats.statusKeys.slice(0, 5).map((status) => (
									<li key={status}>
										<span>{STATUS_LABELS[status] || status}</span>
										<strong>{dayStats.byStatus[status]}</strong>
									</li>
								))}
							</ul>
						) : null}

						<button
							type="button"
							className="ws-btn ws-btn--sm ws-btn--primary ws-daily-stats-cta"
							onClick={() => navigate(fullListPath)}
						>
							Browse applications
						</button>
					</div>
				) : (
					<div className="ws-daily-panel-table">
						<div className="ws-daily-panel-table-head">
							<h3 className="ws-daily-panel-table-title">
								{selectedDate
									? `Applications on ${formatSelectedDate(selectedDate)}`
									: 'Recent applications'}
							</h3>
							{selectedDate ? (
								<button
									type="button"
									className="ws-daily-panel-clear"
									onClick={() => onSelectDate(null)}
								>
									Clear date filter
								</button>
							) : null}
						</div>
						<DistrictApplicationsTable
							applications={applications}
							selectedDate={selectedDate}
						/>
					</div>
				)}
			</div>
		</div>
	)
}

export default DailyApplicationsPanel
