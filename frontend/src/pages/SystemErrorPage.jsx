import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileQuestion, ShieldOff } from 'lucide-react'
import LandingFooter from '../components/landing/LandingFooter'
import PortalNavMark from '../components/landing/PortalNavMark'
import { useAuthSession } from '../context/AuthSessionContext'
import { useLanguage } from '../i18n'

/**
 * Dedicated public error screen — 404 (not found) and 403 (forbidden).
 * Distinct from content pages: large status code, portal mark, clear actions.
 */
function SystemErrorPage({ variant = 'notFound' }) {
	const { t } = useLanguage()
	const { user } = useAuthSession()
	const isForbidden = variant === 'forbidden'
	const prefix = isForbidden ? 'forbidden' : 'notFound'
	const homeTo = user ? '/dashboard' : '/'
	const homeLabel = user ? t(`${prefix}.dashboard`) : t(`${prefix}.home`)
	const Icon = isForbidden ? ShieldOff : FileQuestion

	useEffect(() => {
		const previous = document.title
		document.title = `${t(`${prefix}.code`)} · ${t(`${prefix}.title`)} · ${t('gov.portalName')}`
		return () => {
			document.title = previous
		}
	}, [prefix, t])

	return (
		<div className="portal-status-page landing-wallpaper-bg landing-wallpaper-bg--cream">
			<div className="portal-status-page__inner">
				<p className="portal-status-page__brand">
					<span className="portal-status-page__mark" aria-hidden>
						<PortalNavMark />
					</span>
					<span>
						<span className="portal-status-page__brand-name">{t('gov.portalName')}</span>
						<span className="portal-status-page__brand-line">{t('gov.brandLine')}</span>
					</span>
				</p>

				<div className="portal-status-page__panel">
					<p className="portal-status-page__code" aria-hidden>
						{t(`${prefix}.code`)}
					</p>
					<span className="portal-status-page__icon" aria-hidden>
						<Icon strokeWidth={1.6} />
					</span>
					<h1 id="portal-status-heading" className="portal-status-page__title">
						{t(`${prefix}.title`)}
					</h1>
					<p className="portal-status-page__lead">{t(`${prefix}.lead`)}</p>
					<p className="portal-status-page__body">{t(`${prefix}.body`)}</p>

					<div className="portal-status-page__actions">
						<Link to={homeTo} className="portal-status-page__btn portal-status-page__btn--primary">
							{homeLabel}
						</Link>
						<Link to="/contact" className="portal-status-page__btn portal-status-page__btn--ghost">
							{t(`${prefix}.contact`)}
						</Link>
					</div>

					<nav className="portal-status-page__links" aria-label={t(`${prefix}.more`)}>
						<Link to="/help-centre">{t(`${prefix}.help`)}</Link>
						<span aria-hidden>·</span>
						<Link to="/sitemap">{t(`${prefix}.sitemap`)}</Link>
						<span aria-hidden>·</span>
						<Link to="/services">{t(`${prefix}.services`)}</Link>
					</nav>
				</div>
			</div>
			<LandingFooter />
		</div>
	)
}

export default SystemErrorPage
