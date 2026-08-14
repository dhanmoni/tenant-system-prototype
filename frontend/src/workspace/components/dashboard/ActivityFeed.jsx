import { useEffect, useState } from 'react'
import { fetchActivityLogs } from '../../../services/activityLogs'
import { formatDateTime, formatDisplayName } from '../../../utils/formatters'

function formatAction(action) {
	if (!action) return 'Activity recorded'
	return String(action).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function ActivityFeed() {
	const [logs, setLogs] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	useEffect(() => {
		const load = async () => {
			setLoading(true)
			setError('')
			try {
				const data = await fetchActivityLogs({ per_page: 8 })
				const list = Array.isArray(data) ? data : data?.data ?? []
				setLogs(list)
			} catch (err) {
				setLogs([])
				setError(
					err?.response?.data?.message ||
						'Could not load activity logs. Sign in as super admin to view this section.'
				)
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [])

	if (loading) {
		return (
			<div className="ws-activity-panel">
				<p className="ws-chart-empty">Loading activity…</p>
			</div>
		)
	}

	if (error) {
		return (
			<div className="ws-activity-panel">
				<p className="ws-chart-empty ws-activity-empty--error">{error}</p>
			</div>
		)
	}

	if (!logs.length) {
		return (
			<div className="ws-activity-panel">
				<p className="ws-chart-empty">No recent activity recorded yet.</p>
			</div>
		)
	}

	return (
		<div className="ws-activity-panel">
			<ul className="ws-activity-feed">
				{logs.map((log) => {
					const when = log.logged_at || log.created_at
					const who = formatDisplayName(log.user?.name || log.user_name)
					return (
						<li key={log.id} className="ws-activity-item">
							<div className="ws-activity-main">
								<span className="ws-activity-user">{who}</span>
								<span className="ws-activity-action">{formatAction(log.action)}</span>
								{log.ip_address ? (
									<span className="ws-activity-meta">IP {log.ip_address}</span>
								) : null}
							</div>
							<time className="ws-activity-time" dateTime={when}>
								{formatDateTime(when)}
							</time>
						</li>
					)
				})}
			</ul>
		</div>
	)
}

export default ActivityFeed
