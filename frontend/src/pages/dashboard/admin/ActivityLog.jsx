import { useEffect, useState } from 'react'
import api from '../../../api'
import { formatDateTime } from '../../../utils/formatters'

function ActivityLog() {
	const [logs, setLogs] = useState([])
	const [page, setPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)
	const [users, setUsers] = useState([])
	const [userId, setUserId] = useState('')
	const [fromDate, setFromDate] = useState('')
	const [toDate, setToDate] = useState('')
	const [error, setError] = useState('')

	useEffect(() => {
		loadLogs(1)
		loadUsers()
	}, [userId, fromDate, toDate])

	const loadLogs = async (p = 1) => {
		try {
			const { data } = await api.get('/api/activity-logs', {
				params: { page: p, user_id: userId || undefined, from: fromDate || undefined, to: toDate || undefined }
			})
			setLogs(data.data || [])
			setPage(data.current_page || 1)
			setTotalPages(data.last_page || 1)
		} catch (err) { setError('Failed to load logs') }
	}

	const loadUsers = async () => {
		try {
			const { data } = await api.get('/api/users')
			setUsers(data.users || [])
		} catch (err) { }
	}

	return (
		<div className="auth-card dashboard-card">
			<h1>Activity Log</h1>
			{error ? <div className="error">{error}</div> : null}

			<div className="admin-filters">
				<select value={userId} onChange={e => setUserId(e.target.value)}>
					<option value="">All Users</option>
					{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
				</select>
				<input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
				<input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
			</div>

			<div className="admin-table-wrapper">
				<table className="admin-table">
					<thead><tr><th>Time</th><th>User</th><th>Action</th><th>Subject</th></tr></thead>
					<tbody>
						{logs.map(log => (
							<tr key={log.id}>
								<td>{formatDateTime(log.created_at)}</td>
								<td>{log.user?.name || log.user_id}</td>
								<td>{log.action}</td>
								<td>{log.subject_type} #{log.subject_id}</td>
							</tr>
						))}
					</tbody>
				</table>
				<div className="table-pagination">
					<button disabled={page <= 1} onClick={() => loadLogs(page - 1)}>Prev</button>
					<span>{page} / {totalPages}</span>
					<button disabled={page >= totalPages} onClick={() => loadLogs(page + 1)}>Next</button>
				</div>
			</div>
		</div>
	)
}

export default ActivityLog
