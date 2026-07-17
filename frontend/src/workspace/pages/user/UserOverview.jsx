import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import api from '../../../api'
import { Icon } from '../../../components/dashboard/Icons'
import StatusProgressViewButton from '../../../components/dashboard/StatusProgressViewButton'
import { formatDate } from '../../../utils/formatters'
import { parseTenantFormsResponse } from '../../../utils/tenantFormsApi'
import { STATUS, STATUS_LABELS } from '../../../constants/status'
import { APPLICATION_LABELS, APPLICATION_TYPES } from '../../../constants/application'
import { tenantServiceGroups } from '../../../data/tenantServices'
import CitizenStatusChart from '../../components/dashboard/CitizenStatusChart'
import SubmissionSuccessModal from '../../../components/dashboard/SubmissionSuccessModal'

const SERVICE_TILE_ICONS = {
	'rent-authority': 'building',
	'rent-court': 'file',
	'rent-tribunal': 'chart',
}

function UserOverview() {
	const { user } = useOutletContext()
	const navigate = useNavigate()
	const location = useLocation()
	const [flashMessage, setFlashMessage] = useState('')
	const [applications, setApplications] = useState([])
	const [totalCount, setTotalCount] = useState(0)
	const [loading, setLoading] = useState(true)
	const [loadError, setLoadError] = useState('')

	useEffect(() => {
		loadData()
	}, [])

	useEffect(() => {
		const message = location.state?.successMessage
		if (!message) return
		setFlashMessage(message)
		navigate(location.pathname, { replace: true, state: {} })
	}, [location.pathname, location.state, navigate])

	const loadData = async () => {
		setLoading(true)
		setLoadError('')
		try {
			const appsRes = await api.get('/api/tenant-forms/my', {
				params: { page: 1, per_page: 50, sort_by: 'created_at', sort_order: 'desc' },
			})
			const { items, total } = parseTenantFormsResponse(appsRes.data)
			setApplications(items.slice(0, 8))
			setTotalCount(total)
		} catch (err) {
			setApplications([])
			setTotalCount(0)
			setLoadError(err?.response?.data?.message || 'Could not load your applications.')
		} finally {
			setLoading(false)
		}
	}

	const stats = useMemo(() => {
		let completed = 0
		let inReview = 0
		applications.forEach((app) => {
			const s = String(app.status || '').toUpperCase()
			if ([STATUS.APPROVED, STATUS.COMPLETED, STATUS.SUBMITTED].includes(s)) completed += 1
			else if (
				[STATUS.IN_REVIEW, STATUS.UNDER_PROCESS, STATUS.PENDING, STATUS.PARTIAL, STATUS.DRAFT].includes(s)
			) {
				inReview += 1
			}
		})
		return {
			total: totalCount || applications.length,
			completed,
			inReview,
		}
	}, [applications, totalCount])

	const formatStatus = (status, applicationType = '') => {
		const normalizedType = String(applicationType || '').toLowerCase()
		const normalizedStatus = String(status || '').trim().toUpperCase()
		if (normalizedStatus === STATUS.SUBMITTED) return STATUS_LABELS[STATUS.SUBMITTED]
		if (
			normalizedType.includes(APPLICATION_TYPES.TENANCY_CERTIFICATE) &&
			normalizedStatus === STATUS.UNDER_PROCESS
		) {
			return STATUS_LABELS[STATUS.SUBMITTED]
		}
		return STATUS_LABELS[normalizedStatus] || status || '—'
	}

	const statusBadgeClass = (status) => {
		const s = String(status || '').toUpperCase()
		if ([STATUS.APPROVED, STATUS.COMPLETED, STATUS.SUBMITTED].includes(s)) {
			return 'ws-badge ws-badge--success'
		}
		if ([STATUS.REJECTED].includes(s)) return 'ws-badge ws-badge--danger'
		if ([STATUS.DRAFT, STATUS.PARTIAL].includes(s)) return 'ws-badge ws-badge--warning'
		return 'ws-badge ws-badge--pending'
	}

	const openApplication = (app) => {
		if (!app?.application_no) return
		navigate(`/dashboard/status?app_no=${encodeURIComponent(app.application_no)}`)
	}

	return (
		<div className="ws-page ws-citizen-dashboard">
			<SubmissionSuccessModal
				open={Boolean(flashMessage)}
				message={flashMessage}
				onClose={() => setFlashMessage('')}
			/>

			<header className="ws-citizen-welcome">
				<div className="ws-citizen-welcome-accent" aria-hidden />
				<div className="ws-citizen-welcome-inner">
					<div className="ws-citizen-welcome-stats" aria-label="Application summary">
						<article className="ws-citizen-stat-card ws-citizen-stat-card--total">
							<div className="ws-citizen-stat-card-top">
								<span className="ws-citizen-stat-card-icon" aria-hidden>
									<Icon name="list" />
								</span>
								<span className="ws-citizen-stat-card-label">Total applications</span>
							</div>
							<span className="ws-citizen-stat-card-value">
								{loading ? '…' : stats.total}
							</span>
						</article>
						<article className="ws-citizen-stat-card ws-citizen-stat-card--progress">
							<div className="ws-citizen-stat-card-top">
								<span className="ws-citizen-stat-card-icon" aria-hidden>
									<Icon name="clock" />
								</span>
								<span className="ws-citizen-stat-card-label">In progress</span>
							</div>
							<span className="ws-citizen-stat-card-value">
								{loading ? '…' : stats.inReview}
							</span>
						</article>
						<article className="ws-citizen-stat-card ws-citizen-stat-card--done">
							<div className="ws-citizen-stat-card-top">
								<span className="ws-citizen-stat-card-icon" aria-hidden>
									<Icon name="check" />
								</span>
								<span className="ws-citizen-stat-card-label">Completed</span>
							</div>
							<span className="ws-citizen-stat-card-value">
								{loading ? '…' : stats.completed}
							</span>
						</article>
					</div>
				</div>
			</header>

			<section className="ws-card ws-citizen-actions-card" aria-labelledby="citizen-actions-heading">
				<div className="ws-card-header ws-citizen-actions-header">
					<div>
						<h2 id="citizen-actions-heading" className="ws-card-title">
							Apply &amp; services
						</h2>
						<p className="ws-citizen-actions-lead">
							Start a new application or open Assam Tenancy Act forms by authority.
						</p>
					</div>
					<button
						type="button"
						className="ws-btn ws-btn--outline ws-btn--sm"
						onClick={() => navigate('/dashboard/services')}
					>
						Browse all forms
					</button>
				</div>
				<div className="ws-card-body ws-citizen-actions-body">
					<div className="ws-citizen-actions-layout">
						<button
							type="button"
							className="ws-citizen-uin-card"
							onClick={() => navigate('/dashboard/tenancy-certificate')}
						>
							<span className="ws-citizen-uin-icon" aria-hidden>
								<Icon name="documentPlus" />
							</span>
							<div className="ws-citizen-uin-copy">
								<span className="ws-citizen-uin-kicker">Primary application</span>
								<span className="ws-citizen-uin-title">Apply for UIN</span>
								<p className="ws-citizen-uin-desc">
									Register for a Unique Identification Number (tenancy certificate) under
									the Assam Tenancy Act.
								</p>
							</div>
							<span className="ws-citizen-uin-cta">Start application →</span>
						</button>

						<div className="ws-citizen-services-panel">
							<p className="ws-citizen-services-label">Assam Tenancy Act services</p>
							<div className="ws-citizen-services-grid">
								{tenantServiceGroups.map((group) => (
									<button
										key={group.id}
										type="button"
										className={`ws-citizen-service-tile ws-citizen-service-tile--${group.id}`}
										onClick={() =>
											navigate(`/dashboard/services?authority=${group.id}`)
										}
									>
										<span className="ws-citizen-service-tile-icon" aria-hidden>
											<Icon name={SERVICE_TILE_ICONS[group.id] || 'services'} />
										</span>
										<span className="ws-citizen-service-tile-body">
											<span className="ws-citizen-service-tile-title">{group.title}</span>
											<span className="ws-citizen-service-tile-meta">
												{group.forms.length} forms available
											</span>
										</span>
										<span className="ws-citizen-service-tile-arrow" aria-hidden>
											→
										</span>
									</button>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>

			<div className="ws-citizen-lower">
				<section className="ws-card ws-citizen-lower-main">
					<div className="ws-card-header">
						<h2 className="ws-card-title">Recent applications</h2>
						<button
							type="button"
							className="ws-btn ws-btn--outline ws-btn--sm"
							onClick={() => navigate('/dashboard/status')}
						>
							View all
						</button>
					</div>
					<div className="ws-card-body ws-citizen-lower-body">
						{loading ? (
							<div className="ws-empty">Loading applications…</div>
						) : loadError ? (
							<div className="ws-citizen-empty-state">
								<p>{loadError}</p>
								<button type="button" className="ws-btn ws-btn--outline" onClick={loadData}>
									Retry
								</button>
							</div>
						) : applications.length === 0 ? (
							<div className="ws-citizen-empty-state">
								<p>No applications yet.</p>
								<button
									type="button"
									className="ws-btn ws-btn--primary"
									onClick={() => navigate('/dashboard/tenancy-certificate')}
								>
									Apply for UIN
								</button>
							</div>
						) : (
							<div className="ws-citizen-recent-table">
								<div className="ws-citizen-recent-head" aria-hidden>
									<span>Application no.</span>
									<span>Type</span>
									<span>Status</span>
									<span>Submitted</span>
									<span className="ws-citizen-recent-head-actions">Progress</span>
								</div>
								<ul className="ws-citizen-recent-list">
									{applications.map((app) => (
										<li
											key={app.row_key || app.id || app.application_no}
											className="ws-citizen-recent-item"
										>
											<button
												type="button"
												className="ws-citizen-recent-row"
												onClick={() => openApplication(app)}
											>
												<span className="ws-citizen-recent-no">
													{app.application_no || '—'}
												</span>
												<span className="ws-citizen-recent-type">
													{APPLICATION_LABELS[app.application_type] ||
														app.application_type ||
														'Application'}
												</span>
												<span
													className={`ws-citizen-recent-status ${statusBadgeClass(app.status)}`}
												>
													{formatStatus(app.status, app.application_type)}
												</span>
												<span className="ws-citizen-recent-date">
													{formatDate(app.created_at)}
												</span>
											</button>
											<StatusProgressViewButton
												application={app}
												variant="workspace"
												className="ws-citizen-recent-progress"
												title="View application progress"
											/>
										</li>
									))}
								</ul>
							</div>
						)}
					</div>
				</section>

				<aside className="ws-card ws-citizen-lower-aside">
					<div className="ws-card-header">
						<h2 className="ws-card-title">My application status</h2>
					</div>
					<div className="ws-card-body ws-citizen-lower-body">
						<p className="ws-citizen-chart-hint">Breakdown of your recent submissions.</p>
						<CitizenStatusChart applications={applications} />
						<button
							type="button"
							className="ws-btn ws-btn--outline ws-citizen-status-link"
							onClick={() => navigate('/dashboard/status')}
						>
							Open UIN status
						</button>
					</div>
				</aside>
			</div>
		</div>
	)
}

export default UserOverview
