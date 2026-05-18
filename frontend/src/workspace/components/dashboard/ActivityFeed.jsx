import { useEffect, useState } from 'react'
import api from '../../../api'
import { formatDateTime } from '../../../utils/formatters'

function ActivityFeed() {
	const [logs, setLogs] = useState([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const load = async () => {
			try {
				const { data } = await api.get('/api/activity-logs', { params: { per_page: 8 } })
				const list = Array.isArray(data) ? data : data?.data ?? []
				setLogs(list)
			} catch {
				setLogs([])
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [])

	if (loading) return <p className="ws-chart-empty">Loading activity…</p>
	if (!logs.length) return <p className="ws-chart-empty">No recent activity.</p>

	return (
		<ul className="ws-activity-feed">
			{logs.map((log) => (
				<li key={log.id} className="ws-activity-item">
					<div className="ws-activity-main">
						<strong>{log.user_name || log.user?.name || 'System'}</strong>
						<span className="ws-activity-action">{log.action || log.description}</span>
					</div>
					<time className="ws-activity-time" dateTime={log.created_at}>
						{formatDateTime(log.created_at)}
					</time>
				</li>
			))}
		</ul>
	)
}

export default ActivityFeed
