import { useEffect, useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import api from '../../api'
import { Icon } from '../../components/dashboard/Icons'
import { formatDate } from '../../utils/formatters'

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement
)

function DashboardHome() {
	const { user } = useOutletContext()
	const navigate = useNavigate()
	const [error, setError] = useState('')
	
	// Tenant specific state
	const [tenantRecentApplications, setTenantRecentApplications] = useState([])
	const [tenantRecentLoading, setTenantRecentLoading] = useState(false)
	const [tenantRecentViewMode, setTenantRecentViewMode] = useState('card')

	// Staff/Admin specific state
	const [stats, setStats] = useState(null)
	const [statsLoading, setStatsLoading] = useState(false)
	const [recentActivity, setRecentActivity] = useState([])

	useEffect(() => {
		if (user?.role === 'tenant owner') {
			loadTenantRecentApplications()
		} else if (user?.role === 'system_admin') {
			loadAdminDashboard()
		} else {
			loadStaffDashboard()
		}
	}, [user?.role])

	const loadTenantRecentApplications = async () => {
		setTenantRecentLoading(true)
		try {
			const { data } = await api.get('/api/tenant-forms/my', {
				params: { page: 1, sort_by: 'created_at', sort_order: 'desc' },
			})
			const list = Array.isArray(data) ? data : data?.data ?? []
			setTenantRecentApplications(list.slice(0, 6))
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load recent applications')
		} finally {
			setTenantRecentLoading(false)
		}
	}

	const loadStaffDashboard = async () => {
		setStatsLoading(true)
		try {
			const { data } = await api.get('/api/staff-dashboard-stats')
			setStats(data || null)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load dashboard')
		} finally {
			setStatsLoading(false)
		}
	}

	const loadAdminDashboard = async () => {
		setStatsLoading(true)
		try {
			const [statsRes, activityRes] = await Promise.all([
				api.get('/api/dashboard-stats'),
				api.get('/api/activity-logs', { params: { page: 1 } }),
			])
			setStats(statsRes.data || null)
			setRecentActivity(activityRes.data?.data || [])
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load dashboard')
		} finally {
			setStatsLoading(false)
		}
	}

	const formatStatus = (status, applicationType = '') => {
		const normalizedType = String(applicationType || '').toLowerCase()
		const normalizedStatus = String(status || '').trim().toLowerCase()
		if (normalizedStatus === 'submiited' || normalizedStatus === 'submitted') {
			return 'Submitted'
		}
		if (normalizedType.includes('tenancy certificate') && normalizedStatus === 'under process') {
			return 'Submitted'
		}
		return status || '-'
	}

	if (user?.role === 'tenant owner') {
		const recentItems = tenantRecentApplications || []
		const tenancyRecentCount = recentItems.filter((a) =>
			String(a.application_type || '').toLowerCase().includes('tenancy certificate')
		).length
		const formsRecentCount = recentItems.length - tenancyRecentCount

		const statsCards = [
			{ label: 'Recent Submissions', value: recentItems.length, icon: 'file' },
			{ label: 'Tenancy Certificates', value: tenancyRecentCount, icon: 'check' },
			{ label: 'Assam Tenancy Forms', value: formsRecentCount, icon: 'list' },
		]

		return (
			<div className="dashboard-home">
				<div className="dashboard-overview-cards">
					{statsCards.map((stat) => (
						<div
							key={stat.label}
							className={`dashboard-stat-card ${
								stat.label === 'Recent Submissions'
									? 'dashboard-stat-card--recent-submissions'
									: stat.label === 'Tenancy Certificates'
										? 'dashboard-stat-card--tenancy-certificates'
										: stat.label === 'Assam Tenancy Forms'
											? 'dashboard-stat-card--assam-tenancy-forms'
											: ''
							}`}
						>
							<span className="dashboard-stat-icon-wrap">
								<Icon name={stat.icon} className="dashboard-stat-icon" />
							</span>
							<span className="dashboard-stat-value">{stat.value}</span>
							<span className="dashboard-stat-label">{stat.label}</span>
						</div>
					))}
				</div>
				<div className="auth-card dashboard-card">
					<h2 className="dashboard-section-title">
						<Icon name="status" className="dashboard-section-icon" />
						Quick actions
					</h2>
					<p className="muted">Fast access to your most used actions.</p>
					<div className="dashboard-quick-actions">
						<button type="button" className="dashboard-action-btn" onClick={() => navigate('/dashboard/profile')}>
							<Icon name="user" className="dashboard-action-icon" />
							<span>Profile</span>
						</button>
						<button type="button" className="dashboard-action-btn" onClick={() => navigate('/dashboard/tenancy-certificate')}>
							<Icon name="documentPlus" className="dashboard-action-icon" />
							<span>Tenancy Certificate</span>
						</button>
						<button type="button" className="dashboard-action-btn" onClick={() => navigate('/dashboard/form-i-rent-revision')}>
							<Icon name="file" className="dashboard-action-icon" />
							<span>Form I</span>
						</button>
						<button type="button" className="dashboard-action-btn" onClick={() => navigate('/dashboard/form-i-a-other-charges-revision')}>
							<Icon name="file" className="dashboard-action-icon" />
							<span>Form I-A</span>
						</button>
						<button type="button" className="dashboard-action-btn" onClick={() => navigate('/dashboard/form-i-b-valuer-appointment')}>
							<Icon name="file" className="dashboard-action-icon" />
							<span>Form I-B</span>
						</button>
						<button type="button" className="dashboard-action-btn" onClick={() => navigate('/dashboard/form-4-rent-court-possession')}>
							<Icon name="list" className="dashboard-action-icon" />
							<span>Form 4</span>
						</button>
						<button type="button" className="dashboard-action-btn" onClick={() => navigate('/dashboard/form-7-rent-court-appeal')}>
							<Icon name="list" className="dashboard-action-icon" />
							<span>Form 7</span>
						</button>
						<button type="button" className="dashboard-action-btn" onClick={() => navigate('/dashboard/status')}>
							<Icon name="status" className="dashboard-action-icon" />
							<span>Status</span>
						</button>
					</div>
				</div>
				<div className="auth-card dashboard-card">
					<h2 className="dashboard-section-title">
						<Icon name="list" className="dashboard-section-icon" />
						Recent applications
					</h2>
					<p className="muted">
						{tenantRecentLoading
							? 'Loading your latest applications...'
							: recentItems.length > 0
								? 'Click a tile to filter and view in Status.'
								: 'No applications submitted yet.'}
					</p>
					{recentItems.length > 0 && (
						<div className="dashboard-recent-view-toggle">
							<button
								type="button"
								className={`dashboard-recent-view-btn ${tenantRecentViewMode === 'card' ? 'active' : ''}`}
								onClick={() => setTenantRecentViewMode('card')}
							>
								Card View
							</button>
							<button
								type="button"
								className={`dashboard-recent-view-btn ${tenantRecentViewMode === 'list' ? 'active' : ''}`}
								onClick={() => setTenantRecentViewMode('list')}
							>
								List View
							</button>
						</div>
					)}

					{tenantRecentViewMode === 'card' ? (
						<div className="dashboard-recent-tiles">
							{tenantRecentLoading ? (
								<div className="muted">Loading...</div>
							) : recentItems.length === 0 ? (
								<div className="muted">No applications found.</div>
							) : (
								recentItems.map((app) => {
									const statusText = formatStatus(app.status, app.application_type || '-')
									const statusUpper = String(app.status || '').toUpperCase()
									const isSuccess = statusUpper.includes('APPROVED') || statusUpper.includes('COMPLETED') || statusUpper === 'SUBMITTED'
									return (
										<div
											key={app.row_key || app.id}
											className="dashboard-recent-tile"
											role="button"
											tabIndex={0}
											onClick={() => navigate(`/dashboard/status?app_no=${app.application_no}`)}
										>
											<div className="dashboard-recent-tile-top">
												<div className="dashboard-recent-tile-title">{app.application_no}</div>
												<span className={`dashboard-status-pill ${isSuccess ? 'dashboard-status-pill--success' : 'dashboard-status-pill--pending'}`}>
													{statusText}
												</span>
											</div>
											<div className="dashboard-recent-tile-type">{app.application_type || '-'}</div>
											<div className="dashboard-recent-tile-bottom">
												<span className="muted">Date: </span>
												<span>{formatDate(app.created_at)}</span>
											</div>
										</div>
									)
								})
							)}
						</div>
					) : (
						<div className="dashboard-recent-list">
							{tenantRecentLoading ? (
								<div className="muted">Loading...</div>
							) : recentItems.length === 0 ? (
								<div className="muted">No applications found.</div>
							) : (
								recentItems.map((app) => {
									const statusText = formatStatus(app.status, app.application_type || '-')
									const statusUpper = String(app.status || '').toUpperCase()
									const isSuccess = statusUpper.includes('APPROVED') || statusUpper.includes('COMPLETED') || statusUpper === 'SUBMITTED'
									return (
										<div
											key={app.row_key || app.id}
											className="dashboard-recent-list-item"
											role="button"
											tabIndex={0}
											onClick={() => navigate(`/dashboard/status?app_no=${app.application_no}`)}
										>
											<div className="dashboard-recent-list-top">
												<div className="dashboard-recent-list-title-wrap">
													<div className="dashboard-recent-list-title">{app.application_no}</div>
													<div className="dashboard-recent-list-hint">View details in Status</div>
												</div>
												<span className={`dashboard-status-pill ${isSuccess ? 'dashboard-status-pill--success' : 'dashboard-status-pill--pending'}`}>
													{statusText}
												</span>
											</div>
											<div className="dashboard-recent-list-sub">
												<span className="dashboard-recent-list-chip dashboard-recent-list-chip--type">
													{app.application_type || '-'}
												</span>
												<span className="dashboard-recent-list-chip dashboard-recent-list-chip--date">
													{formatDate(app.created_at)}
												</span>
												<span className="dashboard-recent-list-open">Open</span>
											</div>
										</div>
									)
								})
							)}
						</div>
					)}
				</div>
			</div>
		)
	}

	const isStaff = user?.role !== 'tenant owner' && user?.role !== 'system_admin'
	const s = stats || {}
	const statCards = isStaff 
		? [
			{ label: 'States', value: s.states_count, icon: 'chart' },
			{ label: 'Districts', value: s.districts_count, icon: 'chart' },
			{ label: 'Users', value: s.users_count, icon: 'users' },
			{ label: 'Applications', value: s.applications_count, icon: 'file' },
		]
		: [
			{ label: 'States', value: s.states_count, icon: 'chart' },
			{ label: 'Districts', value: s.districts_count, icon: 'chart' },
			{ label: 'Offices', value: s.offices_count, icon: 'building' },
			{ label: 'Users', value: s.users_count, icon: 'users' },
			{ label: 'Roles', value: s.roles_count, icon: 'file' },
			{ label: 'Designations', value: s.designations_count, icon: 'file' },
			{ label: 'Tenancy applications', value: s.applications_count, icon: 'file' },
		]

	return (
		<div className={`dashboard-home ${isStaff ? 'staff-dashboard-home' : 'admin-dashboard-home'}`}>
			{statsLoading ? (
				<div className="dashboard-stats-loading">Loading dashboard…</div>
			) : (
				<>
					<div className={`dashboard-overview-cards admin-stats-cards ${isStaff ? 'staff-stats-cards' : ''}`}>
						{statCards.map((card) => (
							<div key={card.label} className="dashboard-stat-card">
								<span className="dashboard-stat-icon-wrap">
									<Icon name={card.icon} className="dashboard-stat-icon" />
								</span>
								<span className="dashboard-stat-value">{card.value ?? '—'}</span>
								<span className="dashboard-stat-label">{card.label}</span>
							</div>
						))}
					</div>

					{stats && (
						<div className="dashboard-charts-row">
							<div className="auth-card dashboard-card dashboard-chart-card">
								<h2 className="dashboard-section-title">Overview</h2>
								<div className="dashboard-chart-wrap">
									<Bar
										data={{
											labels: isStaff ? ['States', 'Districts', 'Users'] : ['States', 'Districts', 'Offices', 'Users', 'Roles', 'Designations'],
											datasets: [{
												label: 'Count',
												data: isStaff 
													? [s.states_count ?? 0, s.districts_count ?? 0, s.users_count ?? 0]
													: [s.states_count ?? 0, s.districts_count ?? 0, s.offices_count ?? 0, s.users_count ?? 0, s.roles_count ?? 0, s.designations_count ?? 0],
												backgroundColor: 'rgba(13, 71, 161, 0.75)',
												borderColor: '#0d47a1',
												borderWidth: 1,
											}],
										}}
										options={{
											responsive: true,
											maintainAspectRatio: false,
											plugins: { legend: { display: false } },
											scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
										}}
									/>
								</div>
							</div>
							<div className="auth-card dashboard-card dashboard-chart-card">
								<h2 className="dashboard-section-title">Applications by status</h2>
								<div className="dashboard-chart-wrap dashboard-chart-wrap--doughnut">
									{Object.keys(s.applications_by_status || {}).length > 0 ? (
										<Doughnut
											data={{
												labels: Object.keys(s.applications_by_status || {}),
												datasets: [{
													data: Object.values(s.applications_by_status || {}),
													backgroundColor: [
														'rgba(13, 71, 161, 0.85)',
														'rgba(94, 208, 124, 0.85)',
														'rgba(255, 193, 7, 0.85)',
														'rgba(244, 67, 54, 0.85)',
														'rgba(158, 158, 158, 0.85)',
													],
													borderWidth: 1,
												}],
											}}
											options={{
												responsive: true,
												maintainAspectRatio: false,
												plugins: { legend: { position: 'bottom' } },
											}}
										/>
									) : (
										<p className="muted">No applications yet.</p>
									)}
								</div>
							</div>
						</div>
					)}
					
					<div className="auth-card dashboard-card staff-info-card">
						<h2 className="dashboard-section-title">Quick actions</h2>
						<div className="staff-quick-actions-grid">
							<button onClick={() => navigate('/dashboard/status')} className="dashboard-action-btn">Application Status</button>
							<button onClick={() => navigate('/dashboard/admin/state')} className="dashboard-action-btn">State Management</button>
							<button onClick={() => navigate('/dashboard/admin/district')} className="dashboard-action-btn">District Management</button>
							<button onClick={() => navigate('/dashboard/admin/users?mode=office')} className="dashboard-action-btn">Office Users</button>
							<button onClick={() => navigate('/dashboard/admin/users?mode=tenant')} className="dashboard-action-btn">Tenant Users</button>
							{!isStaff && (
								<>
									<button onClick={() => navigate('/dashboard/admin/office')} className="dashboard-action-btn">Office Management</button>
									<button onClick={() => navigate('/dashboard/admin/designation')} className="dashboard-action-btn">Designation</button>
									<button onClick={() => navigate('/dashboard/admin/role')} className="dashboard-action-btn">Role Management</button>
									<button onClick={() => navigate('/dashboard/admin/activity-log')} className="dashboard-action-btn">Activity Log</button>
								</>
							)}
						</div>
					</div>
				</>
			)}
		</div>
	)
}

export default DashboardHome
