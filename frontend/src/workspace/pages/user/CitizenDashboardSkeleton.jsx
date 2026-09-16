import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/dashboard/Icons'
import { tenantServiceGroups } from '../../../data/tenantServices'
import { useLanguage } from '../../../i18n'

const SERVICE_TILE_ICONS = {
	'rent-authority': 'landmark',
	'rent-court': 'gavel',
	'rent-tribunal': 'scale',
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
			{showActions ? (
				<section className="ws-card ws-citizen-apply" aria-labelledby="citizen-apply-heading">
					<div className="ws-card-header">
						<h2 id="citizen-apply-heading" className="ws-card-title">
							{t('ws.citizen.actions.title')}
						</h2>
						<button
							type="button"
							className="ws-btn ws-btn--outline ws-btn--sm"
							onClick={() => navigate('/dashboard/services')}
						>
							{t('ws.citizen.actions.browseAll')}
						</button>
					</div>
					<div className="ws-citizen-bento">
						<button
							type="button"
							className="ws-citizen-uin-card"
							aria-labelledby="citizen-uin-heading"
							onClick={() => navigate('/dashboard/tenancy-certificate')}
						>
							<span className="ws-citizen-uin-icon" aria-hidden>
								<Icon name="idCard" />
							</span>
							<span className="ws-citizen-uin-copy">
								<span className="ws-citizen-uin-kicker">{t('ws.citizen.uin.kicker')}</span>
								<span id="citizen-uin-heading" className="ws-citizen-uin-title">
									{t('ws.citizen.uin.title')}
								</span>
								<span className="ws-citizen-uin-desc">{t('ws.citizen.uin.desc')}</span>
							</span>
							<span className="ws-citizen-uin-cta">{t('ws.citizen.uin.cta')}</span>
						</button>
						<div className="ws-citizen-forms-stack">
							{tenantServiceGroups.map((group) => (
								<button
									key={group.id}
									type="button"
									className={`ws-citizen-form-card ws-citizen-form-card--${group.id}`}
									aria-hidden
								>
									<span className="ws-citizen-form-card__icon" aria-hidden>
										<Icon name={SERVICE_TILE_ICONS[group.id] || 'services'} />
									</span>
									<span className="ws-citizen-form-card__copy">
										<span className="ws-citizen-form-card__title">
											{t(AUTHORITY_TITLE_KEYS[group.id] || group.title)}
										</span>
										<Skel className="ws-skel--form-names" />
									</span>
									<span className="ws-citizen-form-card__cta">{t('ws.citizen.uin.cta')}</span>
								</button>
							))}
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
						<CitizenChartSkeleton />
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
		<>
			<div className="ws-citizen-status-tabs" aria-hidden>
				<span className="ws-citizen-status-tab">
					<Skel className="ws-skel--legend" />
				</span>
				<span className="ws-citizen-status-tab">
					<Skel className="ws-skel--legend" />
				</span>
				<span className="ws-citizen-status-tab">
					<Skel className="ws-skel--legend" />
				</span>
			</div>
			<ul className="ws-citizen-status-list" aria-hidden>
				{Array.from({ length: 4 }, (_, index) => (
					<li key={index} className="ws-citizen-status-item">
						<span className="ws-citizen-status-item__icon">
							<Skel className="ws-skel--swatch" />
						</span>
						<Skel className="ws-skel--legend" />
						<Skel className="ws-skel--stat" />
					</li>
				))}
			</ul>
			<div className="ws-citizen-status-footer">
				<Skel className="ws-skel--legend" />
			</div>
		</>
	)
}

export default CitizenDashboardSkeleton
