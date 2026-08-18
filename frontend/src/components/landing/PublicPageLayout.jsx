import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import LandingFooter from './LandingFooter'
import { useLanguage } from '../../i18n'

/* Hero (and its multi-MB banner assets) only load when a page opts in */
const PublicPageHero = lazy(() => import('./PublicPageHero'))

function PublicPageLayout({
	eyebrow,
	title,
	titleId,
	lead,
	breadcrumbLabel,
	children,
	showHero = false,
	heroSlides,
}) {
	const { t } = useLanguage()

	return (
		<div className="page-public-site min-w-0 overflow-x-clip">
			{showHero ? (
				<header className="public-page-header">
					<Suspense fallback={null}>
						<PublicPageHero slides={heroSlides} />
					</Suspense>
				</header>
			) : null}

			<div className="public-page landing-body landing-wallpaper-bg landing-wallpaper-bg--white min-h-[40vh]">
				<div className="public-page__content">
					<nav className="public-page__breadcrumb" aria-label={t('public.layout.breadcrumb')}>
						<Link to="/" className="public-page__breadcrumb-link">
							{t('public.layout.home')}
						</Link>
						<span aria-hidden>/</span>
						<span className="public-page__breadcrumb-current">{breadcrumbLabel}</span>
					</nav>

					<header className="public-page__intro">
						{eyebrow ? <p className="landing-section-eyebrow">{eyebrow}</p> : null}
						<h1 id={titleId} className="landing-section-title text-3xl sm:text-4xl">
							{title}
						</h1>
						{lead ? <p className="landing-section-lead public-page__lead mt-5">{lead}</p> : null}
					</header>

					<div className="public-page__body">{children}</div>
				</div>
			</div>

			<LandingFooter />
		</div>
	)
}

export default PublicPageLayout
