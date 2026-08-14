import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchActivityLogs } from '../../../services/activityLogs'
import DataTable from '../../../components/dashboard/DataTable'
import { Icon } from '../../../components/dashboard/Icons'
import { ROLES } from '../../../constants/roles'
import { formatDateTime, formatDisplayName } from '../../../utils/formatters'
import './DistrictManagement.css'
import './MasterData.css'

function formatAction(action) {
	if (!action) return 'Activity recorded'
	return String(action).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function ActivityLog({ user }) {
	const navigate = useNavigate()
	const [logs, setLogs] = useState([])
	const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [page, setPage] = useState(1)
	const [searchInput, setSearchInput] = useState('')
	const [search, setSearch] = useState('')
	const [from, setFrom] = useState('')
	const [to, setTo] = useState('')

	useEffect(() => {
		if (user?.role !== ROLES.SUPER_ADMIN) {
			navigate('/dashboard')
		}
	}, [user?.role, navigate])

	useEffect(() => {
		const timer = setTimeout(() => {
			const trimmed = searchInput.trim()
			setSearch((prev) => {
				if (prev === trimmed) return prev
				setPage(1)
				return trimmed
			})
		}, 350)
		return () => clearTimeout(timer)
	}, [searchInput])

	useEffect(() => {
		if (user?.role !== ROLES.SUPER_ADMIN) return undefined
		let cancelled = false
		const load = async () => {
			setLoading(true)
			setError('')
			try {
				const data = await fetchActivityLogs({
						page,
						per_page: 15,
						q: search || undefined,
						from: from || undefined,
						to: to || undefined,
					})
				if (cancelled) return
				const list = Array.isArray(data) ? data : data?.data ?? []
				setLogs(list)
				setMeta({
					current_page: data?.current_page || page,
					last_page: data?.last_page || 1,
					total: data?.total ?? list.length,
				})
			} catch {
				if (!cancelled) {
					setLogs([])
					setError('Failed to load activity logs')
				}
			} finally {
				if (!cancelled) setLoading(false)
			}
		}
		load()
		return () => {
			cancelled = true
		}
	}, [user?.role, page, search, from, to])

	const hasFilters = Boolean(search || from || to)
	const start = (meta.current_page - 1) * 15
	const tableRows = logs.map((log, index) => ({
		...log,
		serial_no: start + index + 1,
	}))

	const toolbar = (
		<div className="ws-district-toolbar">
			<div className="ws-district-toolbar__top">
				<label className="ws-district-toolbar__search">
					<span className="ws-district-toolbar__label">Search logs</span>
					<div className="ws-district-toolbar__search-field">
						<Icon name="search" className="ws-district-toolbar__search-icon" />
						<input
							className="ws-district-toolbar__input"
							type="search"
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							placeholder="User, action, or IP…"
							autoComplete="off"
						/>
					</div>
				</label>
			</div>
			<div className="ws-master-date-row">
				<label className="ws-master-date-field">
					<span className="ws-district-toolbar__label">From</span>
					<input
						type="date"
						className="ws-master-date-input"
						value={from}
						onChange={(e) => {
							setFrom(e.target.value)
							setPage(1)
						}}
					/>
				</label>
				<label className="ws-master-date-field">
					<span className="ws-district-toolbar__label">To</span>
					<input
						type="date"
						className="ws-master-date-input"
						value={to}
						onChange={(e) => {
							setTo(e.target.value)
							setPage(1)
						}}
					/>
				</label>
			</div>
			<div className="ws-district-toolbar__meta">
				<p className="ws-district-toolbar__summary">
					Showing <strong>{tableRows.length}</strong> of <strong>{meta.total}</strong> events
				</p>
				{hasFilters ? (
					<button
						type="button"
						className="ws-btn ws-btn--outline ws-btn--sm"
						onClick={() => {
							setSearchInput('')
							setSearch('')
							setFrom('')
							setTo('')
							setPage(1)
						}}
					>
						Clear filters
					</button>
				) : null}
			</div>
		</div>
	)

	return (
		<div className="ws-districts ws-master">
			{error ? (
				<div className="ws-profile-alert ws-profile-alert--error" role="alert">
					{error}
				</div>
			) : null}

			<DataTable
				className="ws-district-table"
				title="Activity log"
				accent="default"
				loading={loading}
				data={tableRows}
				totalCount={meta.total}
				toolbar={toolbar}
				columns={[
					{ key: 'serial_no', label: 'S.no.', mono: true, width: '72px' },
					{
						key: 'logged_at',
						label: 'When',
						render: (val, row) => formatDateTime(val || row.created_at),
					},
					{
						key: 'user',
						label: 'User',
						render: (_val, row) =>
							formatDisplayName(row.user?.name || row.user_name || 'Unknown'),
					},
					{
						key: 'action',
						label: 'Action',
						render: (val) => formatAction(val),
					},
					{
						key: 'ip_address',
						label: 'IP',
						mono: true,
						render: (val) => val || '—',
					},
				]}
				emptyMessage={hasFilters ? 'No logs match your filters.' : 'No activity recorded yet.'}
				pagination={
					meta.last_page > 1
						? {
								currentPage: meta.current_page,
								totalPages: meta.last_page,
								onPageChange: (newPage) => setPage(newPage),
							}
						: null
				}
			/>
		</div>
	)
}

export default ActivityLog
