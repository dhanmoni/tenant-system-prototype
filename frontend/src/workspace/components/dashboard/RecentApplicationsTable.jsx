import { useNavigate } from 'react-router-dom'
import { formatDate } from '../../../utils/formatters'
import { APPLICATION_LABELS } from '../../../constants/application'
import { STATUS, STATUS_LABELS } from '../../../constants/status'

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

function RecentApplicationsTable({ applications = [], onRowClick }) {
	const navigate = useNavigate()

	const handleRow = (app) => {
		if (onRowClick) {
			onRowClick(app)
			return
		}
		if (app.application_no) {
			navigate(`/dashboard/admin/applications/${encodeURIComponent(app.application_no)}`)
		}
	}

	if (!applications.length) {
		return <p className="ws-chart-empty">No recent applications.</p>
	}

	return (
		<div className="ws-table-wrap">
			<table className="ws-table">
				<thead>
					<tr>
						<th scope="col">Application no.</th>
						<th scope="col">Type</th>
						<th scope="col">Applicant</th>
						<th scope="col">Status</th>
						<th scope="col">Date</th>
					</tr>
				</thead>
				<tbody>
					{applications.map((app) => (
						<tr
							key={app.application_no || app.id}
							className="ws-table-row-clickable"
							onClick={() => handleRow(app)}
						>
							<td className="ws-status-cell-mono">{app.application_no}</td>
							<td>
								{APPLICATION_LABELS[app.application_type] ||
									app.application_type ||
									'—'}
							</td>
							<td>{app.applicant_name || '—'}</td>
							<td>
								<span className={statusClass(app.status)}>
									{formatStatus(app.status)}
								</span>
							</td>
							<td>{formatDate(app.created_at)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

export default RecentApplicationsTable
