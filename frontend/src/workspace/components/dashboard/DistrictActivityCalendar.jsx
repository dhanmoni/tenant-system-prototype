import { useMemo, useState } from 'react'

const WEEKDAYS = [
	{ key: 'sun', short: 'S', label: 'Sun' },
	{ key: 'mon', short: 'M', label: 'Mon' },
	{ key: 'tue', short: 'T', label: 'Tue' },
	{ key: 'wed', short: 'W', label: 'Wed' },
	{ key: 'thu', short: 'T', label: 'Thu' },
	{ key: 'fri', short: 'F', label: 'Fri' },
	{ key: 'sat', short: 'S', label: 'Sat' },
]

function toDateKey(date) {
	const y = date.getFullYear()
	const m = String(date.getMonth() + 1).padStart(2, '0')
	const d = String(date.getDate()).padStart(2, '0')
	return `${y}-${m}-${d}`
}

function parseDateKey(key) {
	const [y, m, d] = key.split('-').map(Number)
	return new Date(y, m - 1, d)
}

function DistrictActivityCalendar({
	dailyActivity = [],
	selectedDate,
	onSelectDate,
	embedded = false,
	statsMode = false,
}) {
	const activityMap = useMemo(() => {
		const map = new Map()
		dailyActivity.forEach((row) => {
			if (row?.date) map.set(row.date, row)
		})
		return map
	}, [dailyActivity])

	const [viewMonth, setViewMonth] = useState(() => {
		const now = new Date()
		return new Date(now.getFullYear(), now.getMonth(), 1)
	})

	const monthLabel = viewMonth.toLocaleDateString('en-IN', {
		month: 'long',
		year: 'numeric',
	})

	const cells = useMemo(() => {
		const year = viewMonth.getFullYear()
		const month = viewMonth.getMonth()
		const firstDay = new Date(year, month, 1)
		const startOffset = firstDay.getDay()
		const daysInMonth = new Date(year, month + 1, 0).getDate()
		const grid = []

		for (let i = 0; i < startOffset; i++) {
			grid.push({ type: 'empty', key: `pad-${i}` })
		}

		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(year, month, day)
			const dateKey = toDateKey(date)
			const activity = activityMap.get(dateKey)
			grid.push({
				type: 'day',
				key: dateKey,
				dateKey,
				day,
				total: activity?.total ?? 0,
				uin: activity?.uin ?? 0,
				forms: activity?.forms ?? 0,
				isToday: dateKey === toDateKey(new Date()),
				isSelected: selectedDate === dateKey,
			})
		}

		return grid
	}, [viewMonth, activityMap, selectedDate])

	const monthTotal = useMemo(() => {
		const year = viewMonth.getFullYear()
		const month = viewMonth.getMonth()
		let total = 0
		activityMap.forEach((row, key) => {
			const d = parseDateKey(key)
			if (d.getFullYear() === year && d.getMonth() === month) {
				total += row.total ?? 0
			}
		})
		return total
	}, [viewMonth, activityMap])

	const shiftMonth = (delta) => {
		setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
	}

	return (
		<div className={`ws-da-calendar${embedded ? ' ws-da-calendar--embedded' : ''}`}>
			<div className="ws-da-calendar-head">
				<div>
					<h3 className="ws-da-calendar-title">
						{embedded ? 'Calendar' : 'Submission calendar'}
					</h3>
					<p className="ws-da-calendar-desc">
						{monthTotal} application{monthTotal === 1 ? '' : 's'} in {monthLabel}
					</p>
				</div>
				<div className="ws-da-calendar-nav">
					<button type="button" className="ws-da-calendar-nav-btn" onClick={() => shiftMonth(-1)}>
						‹
					</button>
					<span className="ws-da-calendar-month">{monthLabel}</span>
					<button type="button" className="ws-da-calendar-nav-btn" onClick={() => shiftMonth(1)}>
						›
					</button>
				</div>
			</div>

			<div className="ws-da-calendar-weekdays">
				{WEEKDAYS.map((day) => (
					<span key={day.key} className="ws-da-calendar-weekday" title={day.label}>
						<span className="ws-da-calendar-weekday__full">{day.label}</span>
						<span className="ws-da-calendar-weekday__short" aria-hidden>
							{day.short}
						</span>
					</span>
				))}
			</div>

			<div className="ws-da-calendar-grid" role="grid" aria-label={`Applications in ${monthLabel}`}>
				{cells.map((cell) => {
					if (cell.type === 'empty') {
						return <span key={cell.key} className="ws-da-calendar-cell ws-da-calendar-cell--empty" />
					}

					const hasActivity = cell.total > 0
					return (
						<button
							key={cell.key}
							type="button"
							className={[
								'ws-da-calendar-cell',
								'ws-da-calendar-cell--day',
								hasActivity ? 'has-activity' : '',
								cell.isToday ? 'is-today' : '',
								cell.isSelected ? 'is-selected' : '',
							]
								.filter(Boolean)
								.join(' ')}
							onClick={() => onSelectDate(cell.isSelected ? null : cell.dateKey)}
							title={
								hasActivity
									? `${cell.total} total · ${cell.uin} UIN · ${cell.forms} forms`
									: 'No submissions'
							}
						>
							<span className="ws-da-calendar-day-num">{cell.day}</span>
							{hasActivity ? (
								<span className="ws-da-calendar-day-count">{cell.total}</span>
							) : null}
						</button>
					)
				})}
			</div>

			{selectedDate ? (
				<p className="ws-da-calendar-filter">
					Filtered to{' '}
					<strong>
						{parseDateKey(selectedDate).toLocaleDateString('en-IN', {
							day: 'numeric',
							month: 'short',
							year: 'numeric',
						})}
					</strong>
					<button type="button" className="ws-da-calendar-clear" onClick={() => onSelectDate(null)}>
						Clear
					</button>
				</p>
			) : (
				<p className="ws-da-calendar-filter ws-da-calendar-filter--muted">
					{statsMode
						? 'Click a date to view that day’s submission stats.'
						: embedded
							? 'Click a date to filter the applications list.'
							: 'Click a date to filter the daily applications table.'}
				</p>
			)}
		</div>
	)
}

export default DistrictActivityCalendar
