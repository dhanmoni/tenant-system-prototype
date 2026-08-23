import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/dashboard/Icons'
import { tenantServiceGroups } from '../../../data/tenantServices'
import { useLanguage } from '../../../i18n'

const SERVICE_TILE_ICONS = {
	'rent-authority': 'building',
	'rent-court': 'file',
	'rent-tribunal': 'chart',
}

const AUTHORITY_TITLE_KEYS = {
	'rent-authority': 'ws.citizen.authority.rentAuthority',
	'rent-court': 'ws.citizen.authority.rentCourt',
	'rent-tribunal': 'ws.citizen.authority.rentTribunal',
}

function Skel({ className = '' }) {
	return <span className={`ws-skel${className ? ` ${className}` : ''}`} aria-hidden />
}

function CitizenDashboardSkeleton({ showActions = false }) {
	const { t } = useLanguage()
	const navigate = useNavigate()

	return (
		<div
			className="ws-page ws-citizen-dashboard"
			aria-busy="true"
			aria-live="polite"
			aria-label={t('ws.citizen.recent.loading')}
		>
			<header className="ws-citizen-welcome">
				<div className="ws-citizen-welcome-accent" aria-hidden />
				<div className="ws-citizen-welcome-inner">
					<div className="ws-citizen-welcome-stats" aria-label={t('ws.citizen.stats.aria')}>
						<Link
							to="/dashboard/status"
							className="ws-citizen-stat-card ws-citizen-stat-card--total"
							aria-label={t('ws.citizen.stat.openTotal')}
						>
							<div className="ws-citizen-stat-card-top">
								<span className="ws-citizen-stat-card-icon" aria-hidden>
									<Icon name="list" />
								</span>
								<span className="ws-citizen-stat-card-label">{t('ws.citizen.stat.total')}</span>
							</div>
							<span className="ws-citizen-stat-card-value">
								<Skel className="ws-skel--stat" />
							</span>
						</Link>
						<Link
							to="/dashboard/status"
							className="ws-citizen-stat-card ws-citizen-stat-card--progress"
							aria-label={t('ws.citizen.stat.openInProgress')}
						>
							<div className="ws-citizen-stat-card-top">
								<span className="ws-citizen-stat-card-icon" aria-hidden>
									<Icon name="clock" />
								</span>
								<span className="ws-citizen-stat-card-label">
									{t('ws.citizen.stat.inProgress')}
								</span>
							</div>
							<span className="ws-citizen-stat-card-value">
								<Skel className="ws-skel--stat" />
							</span>
						</Link>
						<Link
							to="/dashboard/status"
							className="ws-citizen-stat-card ws-citizen-stat-card--done"
							aria-label={t('ws.citizen.stat.openCompleted')}
						>
							<div className="ws-citizen-stat-card-top">
								<span className="ws-citizen-stat-card-icon" aria-hidden>
									<Icon name="check" />
								</span>
								<span className="ws-citizen-stat-card-label">
									{t('ws.citizen.stat.completed')}
								</span>
							</div>
							<span className="ws-citizen-stat-card-value">
								<Skel className="ws-skel--stat" />
							</span>
						</Link>
					</div>
				</div>
			</header>

			{showActions ? (
				<section className="ws-card ws-citizen-actions-card" aria-labelledby="citizen-actions-heading">
					<div className="ws-card-header ws-citizen-actions-header">
						<div>
							<h2 id="citizen-actions-heading" className="ws-card-title">
								{t('ws.citizen.actions.title')}
							</h2>
							<p className="ws-citizen-actions-lead">{t('ws.citizen.actions.lead')}</p>
						</div>
						<button
							type="button"
							className="ws-btn ws-btn--outline ws-btn--sm"
							onClick={() => navigate('/dashboard/services')}
						>
							{t('ws.citizen.actions.browseAll')}
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
									<span className="ws-citizen-uin-kicker">{t('ws.citizen.uin.kicker')}</span>
									<span className="ws-citizen-uin-title">{t('ws.citizen.uin.title')}</span>
									<p className="ws-citizen-uin-desc">{t('ws.citizen.uin.desc')}</p>
								</div>
								<span className="ws-citizen-uin-cta">{t('ws.citizen.uin.cta')}</span>
							</button>
							<div className="ws-citizen-services-panel">
								<p className="ws-citizen-services-label">{t('ws.citizen.services.label')}</p>
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
												<span className="ws-citizen-service-tile-title">
													{t(AUTHORITY_TITLE_KEYS[group.id] || group.title)}
												</span>
												<span className="ws-citizen-service-tile-meta">
													{t('ws.citizen.services.formsAvailable', {
														count: group.forms.length,
													})}
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
			) : null}

			<div className="ws-citizen-lower">
				<section className="ws-card ws-citizen-lower-main">
					<div className="ws-card-header">
						<h2 className="ws-card-title">{t('ws.citizen.recent.title')}</h2>
						<button
							type="button"
							className="ws-btn ws-btn--outline ws-btn--sm"
							onClick={() => navigate('/dashboard/status')}
						>
							{t('ws.citizen.recent.viewAll')}
						</button>
					</div>
					<div className="ws-card-body ws-citizen-lower-body">
						<CitizenRecentSkeleton />
					</div>
				</section>
				<aside className="ws-card ws-citizen-lower-aside">
					<div className="ws-card-header">
						<h2 className="ws-card-title">{t('ws.citizen.chart.title')}</h2>
					</div>
					<div className="ws-card-body ws-citizen-lower-body">
						<p className="ws-citizen-chart-hint">{t('ws.citizen.chart.hint')}</p>
						<CitizenChartSkeleton />
						<button
							type="button"
							className="ws-btn ws-btn--outline ws-citizen-status-link"
							onClick={() => navigate('/dashboard/status')}
						>
							{t('ws.citizen.chart.openStatus')}
						</button>
					</div>
				</aside>
			</div>
		</div>
	)
}

export function CitizenRecentSkeleton({ rows = 6 }) {
	const { t } = useLanguage()

	return (
		<div className="ws-citizen-recent-table">
			<div className="ws-citizen-recent-head">
				<span>{t('ws.citizen.recent.col.appNo')}</span>
				<span>{t('ws.citizen.recent.col.type')}</span>
				<span>{t('ws.citizen.recent.col.status')}</span>
				<span>{t('ws.citizen.recent.col.submitted')}</span>
			</div>
			<ul className="ws-citizen-recent-list">
				{Array.from({ length: rows }, (_, index) => (
					<li key={index} className="ws-citizen-recent-item">
						<div className="ws-citizen-recent-row ws-citizen-recent-row--skel">
							<span className="ws-citizen-recent-no">
								<Skel className="ws-skel--appno" />
							</span>
							<span className="ws-citizen-recent-type">
								<Skel className="ws-skel--type" />
							</span>
							<span className="ws-citizen-recent-status">
								<Skel className="ws-skel--badge" />
							</span>
							<span className="ws-citizen-recent-date">
								<Skel className="ws-skel--date" />
							</span>
						</div>
					</li>
				))}
			</ul>
		</div>
	)
}

export function CitizenChartSkeleton() {
	return (
		<div className="ws-chart-wrap ws-chart-wrap--doughnut ws-citizen-chart ws-citizen-chart--skel">
			<Skel className="ws-skel--donut" />
			<div className="ws-citizen-chart-skel-legend">
				<span className="ws-citizen-chart-skel-swatch">
					<Skel className="ws-skel--swatch" />
					<Skel className="ws-skel--legend" />
				</span>
				<span className="ws-citizen-chart-skel-swatch">
					<Skel className="ws-skel--swatch" />
					<Skel className="ws-skel--legend" />
				</span>
				<span className="ws-citizen-chart-skel-swatch">
					<Skel className="ws-skel--swatch" />
					<Skel className="ws-skel--legend" />
				</span>
			</div>
		</div>
	)
}

export default CitizenDashboardSkeleton
