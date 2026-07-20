import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusProgressViewButton from '../../../components/dashboard/StatusProgressViewButton'
import { formatDate, formatDateTime } from '../../../utils/formatters'
import { APPLICATION_LABELS } from '../../../constants/application'
import { STATUS, STATUS_LABELS } from '../../../constants/status'

const SORT_KEYS = {
	date: 'created_at',
	application: 'application_no',
	type: 'application_type',
	applicant: 'applicant_name',
	status: 'status',
	category: 'category',
}

function formatStatus(status) {
	const key = String(status || '').trim().toUpperCase()
	return STATUS_LABELS[key] || status || '—'
}

function statusClass(status) {
	const s = String(status || '').toUpperCase()
	if ([STATUS.APPROVED, STATUS.COMPLETED, STATUS.SUBMITTED].includes(s)) {
		return 'ws-badge ws-badge--success'
	}
	if (s === STATUS.REJECTED) return 'ws-badge ws-badge--danger'
	if ([STATUS.DRAFT, STATUS.PARTIAL, STATUS.PENDING].includes(s)) {
		return 'ws-badge ws-badge--warning'
	}
	return 'ws-badge ws-badge--pending'
}

function SortButton({ label, sortKey, activeKey, direction, onSort }) {
	const isActive = activeKey === sortKey
	return (
		<button
			type="button"
			className={`ws-da-sort-btn${isActive ? ' is-active' : ''}`}
			onClick={() => onSort(sortKey)}
		>
			{label}
			{isActive ? <span aria-hidden>{direction === 'asc' ? ' ↑' : ' ↓'}</span> : null}
		</button>
	)
}

function DistrictApplicationsTable({ applications = [], selectedDate = null }) {
	const navigate = useNavigate()
	const [sortKey, setSortKey] = useState('date')
	const [sortDir, setSortDir] = useState('desc')
	const [categoryFilter, setCategoryFilter] = useState('all')
	const [statusFilter, setStatusFilter] = useState('all')

	const handleSort = (key) => {
		if (sortKey === key) {
			setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
		} else {
			setSortKey(key)
			setSortDir(key === 'date' ? 'desc' : 'asc')
		}
	}

	const filtered = useMemo(() => {
		let rows = [...applications]

		if (selectedDate) {
			rows = rows.filter((app) => {
				if (!app.created_at) return false
				const raw = String(app.created_at)
				// Prefer local calendar day so ISO timestamps match the activity calendar.
				const parsed = new Date(raw)
				if (!Number.isNaN(parsed.getTime())) {
					const y = parsed.getFullYear()
					const m = String(parsed.getMonth() + 1).padStart(2, '0')
					const d = String(parsed.getDate()).padStart(2, '0')
					return `${y}-${m}-${d}` === selectedDate
				}
				return raw.slice(0, 10) === selectedDate
			})
		}

		if (categoryFilter !== 'all') {
			rows = rows.filter((app) => app.category === categoryFilter)
		}

		if (statusFilter !== 'all') {
			rows = rows.filter(
				(app) => String(app.status || '').toUpperCase() === statusFilter.toUpperCase()
			)
		}

		const field = SORT_KEYS[sortKey] || 'created_at'
		rows.sort((a, b) => {
			const av = a[field] ?? ''
			const bv = b[field] ?? ''
			if (field === 'created_at') {
				const cmp = new Date(av).getTime() - new Date(bv).getTime()
				return sortDir === 'asc' ? cmp : -cmp
			}
			const cmp = String(av).localeCompare(String(bv), undefined, { sensitivity: 'base' })
			return sortDir === 'asc' ? cmp : -cmp
		})

		return rows
	}, [applications, selectedDate, categoryFilter, statusFilter, sortKey, sortDir])

	const statusOptions = useMemo(() => {
		const set = new Set(
			applications.map((app) => String(app.status || '').toUpperCase()).filter(Boolean)
		)
		return Array.from(set).sort()
	}, [applications])

	const handleRow = (app) => {
		if (app.application_no) {
			navigate(`/dashboard/admin/applications/${encodeURIComponent(app.application_no)}`)
		}
	}

	return (
		<div className="ws-da-apps-table">
			<div className="ws-da-apps-toolbar">
				<div className="ws-da-apps-filters">
					<label className="ws-da-apps-filter">
						<span>Type</span>
						<select
							value={categoryFilter}
							onChange={(e) => setCategoryFilter(e.target.value)}
							className="ws-da-apps-select"
						>
							<option value="all">All types</option>
							<option value="uin">UIN / Tenancy</option>
							<option value="form">Service forms</option>
						</select>
					</label>
					<label className="ws-da-apps-filter">
						<span>Status</span>
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="ws-da-apps-select"
						>
							<option value="all">All statuses</option>
							{statusOptions.map((status) => (
								<option key={status} value={status}>
									{formatStatus(status)}
								</option>
							))}
						</select>
					</label>
				</div>
				<p className="ws-da-apps-count">
					{filtered.length} record{filtered.length === 1 ? '' : 's'}
					{selectedDate ? ' for selected date' : ''}
				</p>
			</div>

			{!filtered.length ? (
				<p className="ws-chart-empty">No applications match the current filters.</p>
			) : (
				<div className="ws-table-wrap">
					<table className="ws-table ws-da-table">
						<thead>
							<tr>
								<th scope="col">
									<SortButton
										label="Date"
										sortKey="date"
										activeKey={sortKey}
										direction={sortDir}
										onSort={handleSort}
									/>
								</th>
								<th scope="col">
									<SortButton
										label="Application no."
										sortKey="application"
										activeKey={sortKey}
										direction={sortDir}
										onSort={handleSort}
									/>
								</th>
								<th scope="col">
									<SortButton
										label="Type"
										sortKey="type"
										activeKey={sortKey}
										direction={sortDir}
										onSort={handleSort}
									/>
								</th>
								<th scope="col">
									<SortButton
										label="Applicant"
										sortKey="applicant"
										activeKey={sortKey}
										direction={sortDir}
										onSort={handleSort}
									/>
								</th>
								<th scope="col">
									<SortButton
										label="Status"
										sortKey="status"
										activeKey={sortKey}
										direction={sortDir}
										onSort={handleSort}
									/>
								</th>
								<th scope="col" className="ws-table-actions-col">
									<span className="sr-only">Actions</span>
								</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((app) => (
								<tr
									key={app.application_no || app.id}
									className="ws-table-row-clickable"
									onClick={() => handleRow(app)}
								>
									<td>
										<span className="ws-da-table-date">
											{formatDate(app.created_at)}
										</span>
										<span className="ws-da-table-time">
											{formatDateTime(app.created_at)?.split(', ').pop() || ''}
										</span>
									</td>
									<td className="ws-status-cell-mono">{app.application_no}</td>
									<td>
										<span
											className={`ws-da-type-badge ws-da-type-badge--${app.category || 'form'}`}
										>
											{APPLICATION_LABELS[app.application_type] ||
												app.application_type ||
												'—'}
										</span>
									</td>
									<td>{app.applicant_name || '—'}</td>
									<td>
										<span className={statusClass(app.status)}>
											{formatStatus(app.status)}
										</span>
									</td>
									<td className="ws-table-actions-cell" onClick={(e) => e.stopPropagation()}>
										<StatusProgressViewButton application={app} variant="admin" />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	)
}

export default DistrictApplicationsTable
