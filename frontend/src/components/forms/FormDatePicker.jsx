import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { parseDateOnly, toDateInputValue } from '../../utils/profileAutofill'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
]

function startOfDay(date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function sameDay(a, b) {
	return (
		a &&
		b &&
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	)
}

function formatDisplay(value) {
	const date = parseDateOnly(value)
	if (!date) return ''
	const day = String(date.getDate()).padStart(2, '0')
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const year = date.getFullYear()
	return `${day}-${month}-${year}`
}

function monthMatrix(year, month) {
	const first = new Date(year, month, 1)
	const startPad = first.getDay()
	const daysInMonth = new Date(year, month + 1, 0).getDate()
	const cells = []
	for (let i = 0; i < startPad; i += 1) cells.push(null)
	for (let day = 1; day <= daysInMonth; day += 1) {
		cells.push(new Date(year, month, day))
	}
	while (cells.length % 7 !== 0) cells.push(null)
	return cells
}

/**
 * Compact calendar field for service forms. Value stays YYYY-MM-DD; display is DD-MM-YYYY.
 */
export default function FormDatePicker({
	id,
	value = '',
	onChange,
	required = false,
	max,
	min,
	placeholder = 'Select date',
	disabled = false,
	className = '',
	'aria-describedby': ariaDescribedBy,
	'aria-invalid': ariaInvalid,
}) {
	const autoId = useId()
	const fieldId = id || autoId
	const popoverId = `${fieldId}-calendar`
	const rootRef = useRef(null)
	const selected = useMemo(() => parseDateOnly(value), [value])
	const maxDate = useMemo(() => (max ? parseDateOnly(max) : null), [max])
	const minDate = useMemo(() => (min ? parseDateOnly(min) : null), [min])

	const [open, setOpen] = useState(false)
	const [view, setView] = useState(() => {
		const seed = selected || maxDate || startOfDay(new Date())
		return { year: seed.getFullYear(), month: seed.getMonth() }
	})

	useEffect(() => {
		if (!open) return undefined
		const seed = selected || maxDate || startOfDay(new Date())
		setView({ year: seed.getFullYear(), month: seed.getMonth() })
		return undefined
	}, [open, selected, maxDate])

	useEffect(() => {
		if (!open) return undefined
		const onPointerDown = (event) => {
			if (!rootRef.current?.contains(event.target)) setOpen(false)
		}
		const onKeyDown = (event) => {
			if (event.key === 'Escape') setOpen(false)
		}
		document.addEventListener('pointerdown', onPointerDown)
		document.addEventListener('keydown', onKeyDown)
		return () => {
			document.removeEventListener('pointerdown', onPointerDown)
			document.removeEventListener('keydown', onKeyDown)
		}
	}, [open])

	const cells = useMemo(() => monthMatrix(view.year, view.month), [view.year, view.month])
	const display = formatDisplay(value)
	const today = startOfDay(new Date())

	const isDisabledDay = useCallback(
		(day) => {
			if (!day) return true
			const stamp = startOfDay(day)
			if (maxDate && stamp > startOfDay(maxDate)) return true
			if (minDate && stamp < startOfDay(minDate)) return true
			return false
		},
		[maxDate, minDate]
	)

	const pickDay = useCallback(
		(day) => {
			if (isDisabledDay(day)) return
			const next = toDateInputValue(day)
			onChange?.(next)
			setOpen(false)
		},
		[isDisabledDay, onChange]
	)

	const yearOptions = useMemo(() => {
		const latest = maxDate?.getFullYear() ?? new Date().getFullYear()
		const earliest = minDate?.getFullYear() ?? latest - 120
		const years = []
		for (let year = latest; year >= earliest; year -= 1) years.push(year)
		return years
	}, [maxDate, minDate])

	const shiftMonth = useCallback((delta) => {
		setView((current) => {
			const next = new Date(current.year, current.month + delta, 1)
			return { year: next.getFullYear(), month: next.getMonth() }
		})
	}, [])

	const setMonth = useCallback((month) => {
		setView((current) => ({ ...current, month }))
	}, [])

	const setYear = useCallback((year) => {
		setView((current) => ({ ...current, year }))
	}, [])

	return (
		<div className={`form-date-picker ${className}`.trim()} ref={rootRef}>
			<div className="form-i-field form-date-picker__field">
				<span className="form-i-icon-gutter" aria-hidden>
					<CalendarDays size={18} strokeWidth={2} />
				</span>
				<button
					type="button"
					id={fieldId}
					className={`form-date-picker__trigger${display ? '' : ' is-empty'}`}
					aria-haspopup="dialog"
					aria-expanded={open}
					aria-controls={open ? popoverId : undefined}
					aria-describedby={ariaDescribedBy}
					aria-invalid={ariaInvalid}
					aria-required={required || undefined}
					disabled={disabled}
					onClick={() => setOpen((current) => !current)}
				>
					{display || placeholder}
				</button>
			</div>

			{open ? (
				<div
					id={popoverId}
					className="form-date-picker__popover"
					role="dialog"
					aria-label="Choose date"
				>
					<div className="form-date-picker__header">
						<button
							type="button"
							className="form-date-picker__nav"
							aria-label="Previous month"
							onClick={() => shiftMonth(-1)}
						>
							<ChevronLeft size={16} strokeWidth={2.25} />
						</button>
						<div className="form-date-picker__selectors">
							<label className="form-date-picker__select-wrap">
								<span className="sr-only">Month</span>
								<select
									className="form-date-picker__select form-date-picker__select--month"
									value={view.month}
									aria-label="Month"
									onChange={(event) => setMonth(Number(event.target.value))}
								>
									{MONTHS.map((label, index) => (
										<option key={label} value={index}>
											{label}
										</option>
									))}
								</select>
							</label>
							<label className="form-date-picker__select-wrap">
								<span className="sr-only">Year</span>
								<select
									className="form-date-picker__select form-date-picker__select--year"
									value={view.year}
									aria-label="Year"
									onChange={(event) => setYear(Number(event.target.value))}
								>
									{yearOptions.map((year) => (
										<option key={year} value={year}>
											{year}
										</option>
									))}
								</select>
							</label>
						</div>
						<button
							type="button"
							className="form-date-picker__nav"
							aria-label="Next month"
							onClick={() => shiftMonth(1)}
						>
							<ChevronRight size={16} strokeWidth={2.25} />
						</button>
					</div>

					<div className="form-date-picker__weekdays" aria-hidden>
						{WEEKDAYS.map((label) => (
							<span key={label}>{label}</span>
						))}
					</div>

					<div className="form-date-picker__grid" role="grid" aria-label={`${MONTHS[view.month]} ${view.year}`}>
						{cells.map((day, index) => {
							if (!day) {
								return <span key={`empty-${index}`} className="form-date-picker__day is-empty" />
							}
							const disabledDay = isDisabledDay(day)
							const selectedDay = sameDay(day, selected)
							const todayDay = sameDay(day, today)
							return (
								<button
									key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
									type="button"
									role="gridcell"
									disabled={disabledDay}
									aria-pressed={selectedDay}
									aria-current={todayDay ? 'date' : undefined}
									className={`form-date-picker__day${selectedDay ? ' is-selected' : ''}${
										todayDay ? ' is-today' : ''
									}`}
									onClick={() => pickDay(day)}
								>
									{day.getDate()}
								</button>
							)
						})}
					</div>

					<div className="form-date-picker__footer">
						<button
							type="button"
							className="form-date-picker__today"
							disabled={isDisabledDay(today)}
							onClick={() => pickDay(today)}
						>
							Today
						</button>
						{value && !required ? (
							<button
								type="button"
								className="form-date-picker__clear"
								onClick={() => {
									onChange?.('')
									setOpen(false)
								}}
							>
								Clear
							</button>
						) : null}
					</div>
				</div>
			) : null}
		</div>
	)
}
