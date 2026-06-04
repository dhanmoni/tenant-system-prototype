import { Link } from 'react-router-dom'
import LandingNav from './LandingNav'
import PublicPageHero from './PublicPageHero'
import LandingFooter from './LandingFooter'

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
	return (
		<div className="page-public-site min-w-0 overflow-x-clip">
			<header
				className={`public-page-header${showHero ? '' : ' public-page-header--compact'}`}
			>
				<LandingNav variant="static" />
				{showHero ? <PublicPageHero slides={heroSlides} /> : null}
			</header>

			<div className="public-page landing-body landing-wallpaper-bg landing-wallpaper-bg--white min-h-[40vh]">
				<div className="public-page__content">
					<nav className="public-page__breadcrumb" aria-label="Breadcrumb">
						<Link to="/" className="public-page__breadcrumb-link">
							Home
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
