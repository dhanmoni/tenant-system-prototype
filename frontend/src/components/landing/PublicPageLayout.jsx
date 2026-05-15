import { Link } from 'react-router-dom'
import LandingFooter from './LandingFooter'

function PublicPageLayout({ eyebrow, title, titleId, lead, breadcrumbLabel, children }) {
	return (
		<div className="public-page min-h-[60vh] bg-landing-cream">
			<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
				<nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500" aria-label="Breadcrumb">
					<Link to="/" className="font-semibold text-landing hover:text-landing-dark hover:underline">
						Home
					</Link>
					<span aria-hidden>/</span>
					<span className="font-medium text-slate-700">{breadcrumbLabel}</span>
				</nav>

				<header className="mb-10 max-w-3xl">
					{eyebrow ? <p className="landing-section-eyebrow">{eyebrow}</p> : null}
					<h1 id={titleId} className="landing-section-title text-3xl sm:text-4xl">
						{title}
					</h1>
					{lead ? <p className="landing-section-lead mt-5">{lead}</p> : null}
				</header>

				{children}
			</div>
			<LandingFooter />
		</div>
	)
}

export default PublicPageLayout
