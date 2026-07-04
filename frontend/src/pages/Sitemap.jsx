import { Link } from 'react-router-dom'
import PublicPageLayout from '../components/landing/PublicPageLayout'
import { siteLastUpdated } from '../data/siteMeta'
import { sitemapTree } from '../data/sitemapLinks'

function SitemapLink({ item }) {
	if (item.external && item.href) {
		return (
			<a href={item.href} target="_blank" rel="noopener noreferrer">
				{item.label}
				<span className="gov-sitemap__external"> (External link)</span>
			</a>
		)
	}

	if (item.href) {
		return <a href={item.href}>{item.label}</a>
	}

	if (item.to) {
		return <Link to={item.to}>{item.label}</Link>
	}

	return null
}

function SitemapItem({ item }) {
	const { children } = item
	const isLinked = Boolean(item.to || item.href)

	return (
		<li>
			{isLinked ? (
				<SitemapLink item={item} />
			) : (
				<span className="gov-sitemap__label">{item.label}</span>
			)}
			{children?.length ? (
				<ul>
					{children.map((child) => (
						<SitemapItem key={child.label} item={child} />
					))}
				</ul>
			) : null}
		</li>
	)
}

function Sitemap() {
	return (
		<PublicPageLayout
			title="Sitemap"
			titleId="sitemap-heading"
			breadcrumbLabel="Sitemap"
			lead="List of pages on the Assam Tenancy Registration & Management System portal."
		>
			<div className="gov-plain-page gov-sitemap">
				<nav className="gov-sitemap__nav" aria-label="Site map">
					<ul className="gov-sitemap__tree">
						{sitemapTree.map((item) => (
							<SitemapItem key={item.label} item={item} />
						))}
					</ul>
				</nav>

				<p className="gov-plain-page__meta">
					Last updated: {siteLastUpdated}. For assistance, see{' '}
					<Link to="/contact">Contact us</Link> or the{' '}
					<a href="https://tcp.assam.gov.in/" target="_blank" rel="noopener noreferrer">
						TCP Assam website
					</a>
					.
				</p>
			</div>
		</PublicPageLayout>
	)
}

export default Sitemap
