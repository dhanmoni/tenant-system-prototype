import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	ArcElement,
	Tooltip,
	Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)
import { Icon } from './Icons'
import { formatDate } from '../../utils/formatters'
import { getRoleLabel } from '../../constants/roleLabels'
import {
	ROLES,
	ADMIN_ROLES,
	ASSISTANT_ROLES,
	PRINCIPAL_ROLES,
} from '../../constants/roles'
import { STATUS_LABELS } from '../../constants/status'
import { APPLICATION_LABELS } from '../../constants/application'

const STATUS_CHART_COLORS = {
	SUBMITTED: '#2563eb',
	IN_REVIEW: '#d97706',
	REJECTED: '#dc2626',
	COMPLETED: '#16a34a',
	OTHER: '#94a3b8',
}

const STATUS_CHART_LABELS = {
	SUBMITTED: 'Submitted',
	IN_REVIEW: 'In review',
	REJECTED: 'Rejected',
	COMPLETED: 'Completed',
	OTHER: 'Other',
}

function formatStatus(status) {
	const key = String(status || '').trim().toUpperCase()
	return STATUS_LABELS[key] || status || '—'
}

function OfficialDashboard({ user, stats, statsLoading, recentActivity = [], error }) {
	const navigate = useNavigate()
	const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN
	const s = stats || {}

	const [now, setNow] = useState(() => new Date())
	useEffect(() => {
		const timer = setInterval(() => setNow(new Date()), 1000)
		return () => clearInterval(timer)
	}, [])

	const statCards = useMemo(() => {
		if (isSuperAdmin) {
			return [
				{ label: 'Districts', value: s.districts_count, icon: 'chart', accent: 'blue' },
				{ label: 'Offices', value: s.offices_count, icon: 'building', accent: 'slate' },
				{ label: 'Users', value: s.users_count, icon: 'users', accent: 'green' },
				{ label: 'Roles', value: s.roles_count, icon: 'file', accent: 'amber' },
				{ label: 'Designations', value: s.designations_count, icon: 'file', accent: 'violet' },
				{
					label: 'UIN applications',
					value: s.tenancy_applications,
					icon: 'documentPlus',
					accent: 'rose',
				},
				{
					label: 'Tenancy rule forms',
					value: s.service_applications,
					icon: 'services',
					accent: 'teal',
				},
			]
		}

		const cards = [
			{
				label: 'District',
				value: s.district_name || user?.district?.name || '—',
				icon: 'chart',
				accent: 'blue',
				isText: true,
			},
			{ label: 'Users in district', value: s.users_count, icon: 'users', accent: 'green' },
			{
				label: 'Service applications',
				value: s.service_applications,
				icon: 'services',
				accent: 'teal',
			},
		]

		if (ADMIN_ROLES.includes(user?.role)) {
			cards.push({
				label: 'UIN applications',
				value: s.tenancy_applications,
				icon: 'documentPlus',
				accent: 'rose',
			})
		}

		if (ASSISTANT_ROLES.includes(user?.role)) {
			cards.push({
				label: 'Awaiting verification',
				value: s.pending_review,
				icon: 'file',
				accent: 'amber',
				highlight: true,
			})
		}

		if (PRINCIPAL_ROLES.includes(user?.role)) {
			cards.push({
				label: 'Awaiting decision',
				value: s.in_review,
				icon: 'status',
				accent: 'amber',
				highlight: true,
			})
		}

		if (user?.role === ROLES.DISTRICT_ADMIN) {
			cards.push(
				{
					label: 'Pending (submitted)',
					value: s.pending_review,
					icon: 'file',
					accent: 'amber',
				},
				{
					label: 'In review',
					value: s.in_review,
					icon: 'status',
					accent: 'violet',
				}
			)
		}

		return cards
	}, [isSuperAdmin, s, user?.district?.name, user?.role])

	const statusChart = useMemo(() => {
		const breakdown = s.applications_by_status || {}
		const keys = ['SUBMITTED', 'IN_REVIEW', 'REJECTED', 'COMPLETED', 'OTHER']
		const values = keys.map((k) => breakdown[k] ?? 0)
		const hasData = values.some((v) => v > 0)

		return {
			hasData,
			data: {
				labels: keys.map((k) => STATUS_CHART_LABELS[k]),
				datasets: [
					{
						label: 'Applications',
						data: values,
						backgroundColor: keys.map((k) => STATUS_CHART_COLORS[k]),
						borderRadius: 6,
						borderSkipped: false,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
				},
				scales: {
					y: {
						beginAtZero: true,
						ticks: { precision: 0 },
						grid: { color: 'rgba(148, 163, 184, 0.25)' },
					},
					x: {
						grid: { display: false },
					},
				},
			},
		}
	}, [s.applications_by_status])

	const categoryChart = useMemo(() => {
		const categories = s.applications_by_category || []
		const values = categories.map((c) => c.count ?? 0)
		const hasData = values.some((v) => v > 0)

		return {
			hasData,
			data: {
				labels: categories.map((c) => c.label),
				datasets: [
					{
						data: values,
						backgroundColor: ['#0d47a1', '#c47a3a', '#2e7d32', '#5c6bc0'],
						borderWidth: 2,
						borderColor: '#fff',
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'bottom',
						labels: { boxWidth: 12, padding: 14, font: { size: 11 } },
					},
				},
			},
		}
	}, [s.applications_by_category])

	const recentApps = s.recent_applications || []
	const dateFormatted = now.toLocaleDateString('en-IN', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
	const timeFormatted = now.toLocaleTimeString('en-IN', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	})

	const openApplication = (appNo) => {
		if (!appNo) return
		navigate(`/dashboard/admin/applications/${encodeURIComponent(appNo)}`)
	}

	return (
		<div
			className={`dashboard-home official-dashboard-home ${isSuperAdmin ? 'admin-dashboard-home' : 'staff-dashboard-home'}`}
		>
			{error ? (
				<div className="admin-error-banner" role="alert">
					{error}
				</div>
			) : null}

			{statsLoading ? (
				<div className="dashboard-stats-loading">Loading dashboard…</div>
			) : (
				<>
					<div className="dashboard-welcome-card official-welcome-card">
						<div className="official-welcome-main">
							<h1 className="dashboard-title-with-icon">
								<Icon name="dashboard" className="dashboard-heading-icon" />
								Welcome, {user?.name}
							</h1>
							<p className="official-role-badge">{getRoleLabel(user?.role)}</p>
							{user?.email ? (
								<p className="staff-email-row">
									<span className="muted">Official email:</span>
									<strong>{user.email}</strong>
								</p>
							) : null}
							<p className="muted official-welcome-sub">
								{isSuperAdmin
									? 'System-wide overview of districts, users, and applications across Assam.'
									: `District-scoped overview for ${s.district_name || user?.district?.name || 'your assigned district'}.`}
							</p>
						</div>
						<div className="staff-dashboard-date-section official-date-section">
							<div className="staff-date-card">
								<span className="staff-date-label">Today</span>
								<span className="staff-date-value">{dateFormatted}</span>
							</div>
							<div className="staff-time-card">
								<span className="staff-date-label">Current time</span>
								<span className="staff-time-value">{timeFormatted}</span>
							</div>
						</div>
					</div>

					<div
						className={`dashboard-overview-cards admin-stats-cards ${isSuperAdmin ? '' : 'staff-stats-cards'}`}
					>
						{statCards.map((card) => (
							<div
								key={card.label}
								className={`dashboard-stat-card dashboard-stat-card--accent-${card.accent}${card.highlight ? ' dashboard-stat-card--highlight' : ''}`}
							>
								<span className="dashboard-stat-icon-wrap">
									<Icon name={card.icon} className="dashboard-stat-icon" />
								</span>
								<span
									className={`dashboard-stat-value${card.isText ? ' dashboard-stat-value--text' : ''}`}
								>
									{card.isText ? card.value : (card.value ?? '0')}
								</span>
								<span className="dashboard-stat-label">{card.label}</span>
							</div>
						))}
					</div>

					<div className="dashboard-charts-row">
						<div className="auth-card dashboard-card dashboard-chart-card">
							<h2 className="dashboard-section-title">
								<Icon name="chart" className="dashboard-section-icon" />
								Applications by status
							</h2>
							<p className="muted official-chart-hint">
								{isSuperAdmin
									? 'All Assam Tenancy Rule form submissions (statewide).'
									: 'Applications in your district for your office category.'}
							</p>
							<div className="dashboard-chart-wrap">
								{statusChart.hasData ? (
									<Bar data={statusChart.data} options={statusChart.options} />
								) : (
									<div className="dashboard-chart-empty">No application data yet.</div>
								)}
							</div>
						</div>

						<div className="auth-card dashboard-card dashboard-chart-card">
							<h2 className="dashboard-section-title">
								<Icon name="file" className="dashboard-section-icon" />
								Application mix
							</h2>
							<p className="muted official-chart-hint">UIN / Tenancy vs Assam Tenancy Rule forms.</p>
							<div className="dashboard-chart-wrap dashboard-chart-wrap--doughnut">
								{categoryChart.hasData ? (
									<Doughnut data={categoryChart.data} options={categoryChart.options} />
								) : (
									<div className="dashboard-chart-empty">No category data yet.</div>
								)}
							</div>
						</div>
					</div>

					<div className="admin-stats-grid official-action-grid">
						{ASSISTANT_ROLES.includes(user?.role) ? (
							<div className="admin-stat-card official-action-card">
								<div className="stat-label">Action required</div>
								<h3 className="official-action-title">Pending inbox</h3>
								<p className="muted official-action-desc">
									Applications awaiting your initial verification and forward to the head officer.
								</p>
								{(s.pending_review ?? 0) > 0 ? (
									<span className="official-action-badge">{s.pending_review} pending</span>
								) : null}
								<button
									type="button"
									className="official-action-btn"
									onClick={() => navigate('/dashboard/admin/inbox')}
								>
									Open inbox
								</button>
							</div>
						) : null}

						{PRINCIPAL_ROLES.includes(user?.role) ? (
							<div className="admin-stat-card official-action-card">
								<div className="stat-label">Action required</div>
								<h3 className="official-action-title">Applications in review</h3>
								<p className="muted official-action-desc">
									Review applications forwarded by your assistant and approve or reject.
								</p>
								{(s.in_review ?? 0) > 0 ? (
									<span className="official-action-badge">{s.in_review} in review</span>
								) : null}
								<button
									type="button"
									className="official-action-btn"
									onClick={() => navigate('/dashboard/admin/applications')}
								>
									View applications
								</button>
							</div>
						) : null}

						{ADMIN_ROLES.includes(user?.role) ? (
							<div className="admin-stat-card official-action-card">
								<div className="stat-label">Management</div>
								<h3 className="official-action-title">User management</h3>
								<p className="muted official-action-desc">
									Manage staff accounts, district assignments, and registered citizens.
								</p>
								<button
									type="button"
									className="official-action-btn official-action-btn--outline"
									onClick={() => navigate('/dashboard/admin/users')}
								>
									Manage users
								</button>
							</div>
						) : null}

						{isSuperAdmin ? (
							<div className="admin-stat-card official-action-card">
								<div className="stat-label">System</div>
								<h3 className="official-action-title">Master data</h3>
								<p className="muted official-action-desc">
									Districts, offices, roles, and designations for the portal.
								</p>
								<button
									type="button"
									className="official-action-btn official-action-btn--outline"
									onClick={() => navigate('/dashboard/admin/districts')}
								>
									Manage districts
								</button>
							</div>
						) : null}
					</div>

					{recentApps.length > 0 ? (
						<div className="auth-card dashboard-card staff-info-card">
							<div className="dashboard-section-head">
								<h2 className="dashboard-section-title">
									<Icon name="list" className="dashboard-section-icon" />
									Recent applications
								</h2>
							</div>
							<div className="official-recent-table-wrap">
								<table className="official-recent-table">
									<thead>
										<tr>
											<th scope="col">Application no.</th>
											<th scope="col">Type</th>
											<th scope="col">Applicant</th>
											<th scope="col">Status</th>
											<th scope="col">Submitted</th>
											<th scope="col">
												<span className="sr-only">Actions</span>
											</th>
										</tr>
									</thead>
									<tbody>
										{recentApps.map((app) => {
											const statusKey = String(app.status || '').toLowerCase()
											return (
												<tr key={app.application_no}>
													<td>
														<strong>{app.application_no}</strong>
													</td>
													<td>
														{APPLICATION_LABELS[app.application_type] ||
															app.application_type ||
															'—'}
													</td>
													<td>{app.applicant_name || '—'}</td>
													<td>
														<span className={`status-pill ${statusKey}`}>
															{formatStatus(app.status)}
														</span>
													</td>
													<td>{formatDate(app.created_at)}</td>
													<td>
														<button
															type="button"
															className="official-table-link"
															onClick={() => openApplication(app.application_no)}
														>
															View
														</button>
													</td>
												</tr>
											)
										})}
									</tbody>
								</table>
							</div>
						</div>
					) : null}

					{isSuperAdmin && recentActivity.length > 0 ? (
						<div className="auth-card dashboard-card staff-info-card">
							<h2 className="dashboard-section-title">
								<Icon name="clock" className="dashboard-section-icon" />
								Recent activity
							</h2>
							<ul className="official-activity-list">
								{recentActivity.slice(0, 8).map((log) => (
									<li key={log.id} className="official-activity-item">
										<span className="official-activity-action">{log.action || 'Activity'}</span>
										<span className="muted">
											{log.user?.name ? `${log.user.name} · ` : ''}
											{formatDate(log.logged_at)}
										</span>
									</li>
								))}
							</ul>
						</div>
					) : null}

					{[ROLES.SUPER_ADMIN, ROLES.DISTRICT_ADMIN].includes(user?.role) ? (
						<div className="auth-card dashboard-card staff-info-card">
							<h2 className="dashboard-section-title">Management quick links</h2>
							<div className="staff-quick-actions-grid">
								<button
									type="button"
									onClick={() => navigate('/dashboard/status')}
									className="dashboard-action-btn"
								>
									UIN status
								</button>
								<button
									type="button"
									onClick={() => navigate('/dashboard/admin/tenancy')}
									className="dashboard-action-btn"
								>
									Tenancy applications
								</button>
								{user.role === ROLES.SUPER_ADMIN ? (
									<button
										type="button"
										onClick={() => navigate('/dashboard/admin/districts')}
										className="dashboard-action-btn"
									>
										Districts
									</button>
								) : null}
								<button
									type="button"
									onClick={() => navigate('/dashboard/admin/users?mode=office')}
									className="dashboard-action-btn"
								>
									Staff management
								</button>
								<button
									type="button"
									onClick={() => navigate('/dashboard/admin/users?mode=tenant')}
									className="dashboard-action-btn"
								>
									Registered users
								</button>
								<button
									type="button"
									onClick={() => navigate('/dashboard/admin/applications')}
									className="dashboard-action-btn"
								>
									Service applications
								</button>
							</div>
						</div>
					) : null}
				</>
			)}
		</div>
	)
}

export default OfficialDashboard
