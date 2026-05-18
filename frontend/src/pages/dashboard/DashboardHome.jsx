import { useEffect, useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import api from '../../api'
import { Icon } from '../../components/dashboard/Icons'
import OfficialDashboard from '../../components/dashboard/OfficialDashboard'
import { formatDate } from '../../utils/formatters'
import { ROLES } from '../../constants/roles'
import { STATUS, STATUS_LABELS } from '../../constants/status'
import { APPLICATION_LABELS, APPLICATION_TYPES } from '../../constants/application'

function DashboardHome() {
	const { user } = useOutletContext()
	const navigate = useNavigate()
	const [error, setError] = useState('')
	const [showProfilePrompt, setShowProfilePrompt] = useState(false)

	// Tenant specific state
	const [tenantRecentApplications, setTenantRecentApplications] = useState([])
	const [tenantRecentLoading, setTenantRecentLoading] = useState(false)
	const [tenantRecentViewMode, setTenantRecentViewMode] = useState('card')

	// Staff/Admin specific state
	const [stats, setStats] = useState(null)
	const [statsLoading, setStatsLoading] = useState(false)
	const [recentActivity, setRecentActivity] = useState([])

	useEffect(() => {
		if (user?.role === ROLES.USER) {
			loadTenantRecentApplications()
			checkProfileCompleteness()
		} else if (user?.role === ROLES.SUPER_ADMIN) {
			loadAdminDashboard()
		} else {
			loadStaffDashboard()
		}
	}, [user?.role])

	const checkProfileCompleteness = async () => {
		try {
			const { data } = await api.get('/api/profile')
			const profileUser = data?.user || {}
			const photoUrl = profileUser.passport_photo_url
			const photoPath = profileUser.passport_photo_path || profileUser.user_passport_photo_path
			const hasFullProfile =
				!!profileUser.address &&
				!!profileUser.pin_code &&
				!!profileUser.pan_card &&
				!!(photoUrl || photoPath)
			setShowProfilePrompt(!hasFullProfile)
		} catch (_err) {
			setShowProfilePrompt(false)
		}
	}

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
		const normalizedStatus = String(status || '').trim().toUpperCase()

		if (normalizedStatus === STATUS.SUBMITTED) {
			return STATUS_LABELS[STATUS.SUBMITTED]
		}

		if (normalizedType.includes(APPLICATION_TYPES.TENANCY_CERTIFICATE) && normalizedStatus === STATUS.UNDER_PROCESS) {
			return STATUS_LABELS[STATUS.SUBMITTED]
		}

		return STATUS_LABELS[normalizedStatus] || status || '-'
	}

	const getAppTypeLabel = (type) => {
		return APPLICATION_LABELS[type] || type || '-'
	}

	if (user?.role === ROLES.USER) {
		const recentItems = tenantRecentApplications || []

		return (
			<div className="dashboard-home tenant-dashboard-home">
				{showProfilePrompt ? (
					<div className="tenant-profile-prompt" role="status" aria-live="polite">
						<div className="tenant-profile-prompt-text">
							<Icon name="user" className="tenant-profile-prompt-icon" />
							<span>
								Complete your profile first. This helps auto-fill future applications and saves your time.
							</span>
						</div>
						<button
							type="button"
							className="tenant-profile-prompt-btn"
							onClick={() => navigate('/dashboard/profile')}
						>
							Complete profile
						</button>
					</div>
				) : null}

				<div className="tenant-dashboard-hero">
					<button
						type="button"
						className="tenant-hero-tile tenant-hero-tile--certificate"
						onClick={() => navigate('/dashboard/tenancy-certificate')}
					>
						<span className="tenant-hero-tile-kicker">Application</span>
						<span className="tenant-hero-tile-title">Apply for UIN</span>
						<p className="tenant-hero-tile-desc">
							Start a new Unique Identification Number (UIN) application and track it from your dashboard.
						</p>
						<span className="tenant-hero-tile-cta">
							<Icon name="documentPlus" className="tenant-hero-tile-cta-icon" />
							Open application
						</span>
					</button>

					<button
						type="button"
						className="tenant-hero-tile tenant-hero-tile--services-cta"
						onClick={() => navigate('/dashboard/services')}
					>
						<span className="tenant-hero-tile-kicker tenant-hero-tile-kicker--on-light">Services</span>
						<span className="tenant-hero-tile-title tenant-hero-tile-title--on-light">Assam Tenancy forms</span>
						<p className="tenant-hero-tile-desc tenant-hero-tile-desc--on-light">
							Open the services page to browse Rent Authority, Rent Court, and Rent Tribunal forms, then
							apply for the one you need.
						</p>
						<span className="tenant-hero-tile-cta tenant-hero-tile-cta--outline">
							<Icon name="services" className="tenant-hero-tile-cta-icon tenant-hero-tile-cta-icon--blue" />
							View services
						</span>
					</button>
				</div>
				<div className="auth-card dashboard-card">
					<div className="dashboard-section-head">
						<h2 className="dashboard-section-title">
							<Icon name="list" className="dashboard-section-icon" />
							Recent applications
						</h2>
						{recentItems.length > 0 && (
							<div className="dashboard-recent-view-toggle" role="group" aria-label="Recent applications view">
								<button
									type="button"
									className={`dashboard-recent-view-btn dashboard-recent-view-btn--icon ${tenantRecentViewMode === 'card' ? 'active' : ''}`}
									onClick={() => setTenantRecentViewMode('card')}
									title="Card view"
									aria-label="Card view"
								>
									<Icon name="dashboard" className="dashboard-recent-view-icon" />
									<span className="sr-only">Card view</span>
								</button>
								<button
									type="button"
									className={`dashboard-recent-view-btn dashboard-recent-view-btn--icon ${tenantRecentViewMode === 'list' ? 'active' : ''}`}
									onClick={() => setTenantRecentViewMode('list')}
									title="List view"
									aria-label="List view"
								>
									<Icon name="list" className="dashboard-recent-view-icon" />
									<span className="sr-only">List view</span>
								</button>
							</div>
						)}
					</div>
					<p className="muted">
						{tenantRecentLoading
							? 'Loading your latest applications...'
							: recentItems.length > 0
								? 'Click a tile to filter and view in UIN Status.'
								: 'No applications submitted yet.'}
					</p>

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
									const isSuccess = [STATUS.APPROVED, STATUS.COMPLETED, STATUS.SUBMITTED].includes(statusUpper)
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
											<div className="dashboard-recent-tile-type">{getAppTypeLabel(app.application_type)}</div>
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
									const isSuccess = [STATUS.APPROVED, STATUS.COMPLETED, STATUS.SUBMITTED].includes(statusUpper)
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
													<div className="dashboard-recent-list-hint">View details in UIN Status</div>
												</div>
												<span className={`dashboard-status-pill ${isSuccess ? 'dashboard-status-pill--success' : 'dashboard-status-pill--pending'}`}>
													{statusText}
												</span>
											</div>
											<div className="dashboard-recent-list-sub">
												<span className="dashboard-recent-list-chip dashboard-recent-list-chip--type">
													{getAppTypeLabel(app.application_type)}
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

	return (
		<OfficialDashboard
			user={user}
			stats={stats}
			statsLoading={statsLoading}
			recentActivity={recentActivity}
			error={error}
		/>
	)
}

export default DashboardHome
