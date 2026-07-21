import { useNavigate } from 'react-router-dom'
import DistrictActivityCalendar from './DistrictActivityCalendar'
import DistrictApplicationsTable from './DistrictApplicationsTable'

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

/**
 * Combined calendar + sortable applications panel (super admin & district admin).
 */
function DailyApplicationsPanel({
	dailyActivity = [],
	applications = [],
	selectedDate,
	onSelectDate,
	fullListPath = '/dashboard/admin/applications',
	scopeLabel = 'statewide',
}) {
	const navigate = useNavigate()

	return (
		<div className="ws-daily-panel">
			<div className="ws-daily-panel-head">
				<div>
					<h2 className="ws-daily-panel-title">Daily activity & applications</h2>
					<p className="ws-daily-panel-desc">
						Pick a day on the calendar to filter applications ({scopeLabel}). Sort and filter
						the list beside it.
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
					/>
				</div>
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
			</div>
		</div>
	)
}

export default DailyApplicationsPanel
