import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import PublicPageLayout from '../components/landing/PublicPageLayout'
import { siteLastUpdated } from '../data/siteMeta'
import { sitemapTree } from '../data/sitemapLinks'
import { useLanguage } from '../i18n'

const labelKeyByPath = {
	'/': 'sitemap.home',
	'/#portal-guide': 'sitemap.howToApply',
	'/#services': 'sitemap.portalServices',
	'/#login': 'sitemap.signIn',
	'/#register': 'sitemap.newRegistration',
	'/about': 'sitemap.about',
	'/services': 'sitemap.portalServices',
	'/services#uin-registration': 'sitemap.uin',
	'/services#rent-tribunal': 'sitemap.rt',
	'/services#rent-court': 'sitemap.rc',
	'/services#rent-authority': 'sitemap.ra',
	'/public-dashboard': 'sitemap.dashboard',
	'/policies': 'sitemap.policies',
	'/resources': 'sitemap.resources',
	'/help-centre': 'sitemap.help',
	'/accessibility': 'sitemap.accessibility',
	'/feedback': 'sitemap.feedback',
	'/contact': 'sitemap.contactUs',
	'/login': 'sitemap.signIn',
	'https://tcp.assam.gov.in/': 'sitemap.tcpFull',
	'https://www.india.gov.in/': 'sitemap.indiaGov',
	'https://www.digitalindia.gov.in/': 'sitemap.digitalIndia',
}

function localizeItem(item, t) {
	const path = item.to || item.href || ''
	const key =
		path && labelKeyByPath[path]
			? labelKeyByPath[path]
			: item.label === 'Related government websites'
				? 'sitemap.related'
				: null

	return {
		...item,
		label: key ? t(key) : item.label,
		children: item.children?.map((child) => localizeItem(child, t)),
	}
}

function SitemapLink({ item, externalLabel }) {
	if (item.external && item.href) {
		return (
			<a href={item.href} target="_blank" rel="noopener noreferrer">
				{item.label}
				<span className="gov-sitemap__external"> {externalLabel}</span>
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

function SitemapItem({ item, externalLabel }) {
	const { children } = item
	const isLinked = Boolean(item.to || item.href)

	return (
		<li>
			{isLinked ? (
				<SitemapLink item={item} externalLabel={externalLabel} />
			) : (
				<span className="gov-sitemap__label">{item.label}</span>
			)}
			{children?.length ? (
				<ul>
					{children.map((child) => (
						<SitemapItem
							key={`${child.to || child.href || child.label}`}
							item={child}
							externalLabel={externalLabel}
						/>
					))}
				</ul>
			) : null}
		</li>
	)
}

function Sitemap() {
	const { t } = useLanguage()

	const tree = useMemo(() => sitemapTree.map((item) => localizeItem(item, t)), [t])

	return (
		<PublicPageLayout
			title={t('sitemap.title')}
			titleId="sitemap-heading"
			breadcrumbLabel={t('sitemap.title')}
			lead={t('sitemap.lead')}
		>
			<div className="gov-plain-page gov-sitemap">
				<nav className="gov-sitemap__nav" aria-label={t('sitemap.navAria')}>
					<ul className="gov-sitemap__tree">
						{tree.map((item) => (
							<SitemapItem
								key={`${item.to || item.href || item.label}`}
								item={item}
								externalLabel={t('sitemap.external')}
							/>
						))}
					</ul>
				</nav>

				<p className="gov-plain-page__meta">
					{t('sitemap.metaBefore', { date: siteLastUpdated })}{' '}
					<Link to="/contact">{t('sitemap.contact')}</Link> {t('sitemap.metaOr')}{' '}
					<a href="https://tcp.assam.gov.in/" target="_blank" rel="noopener noreferrer">
						{t('sitemap.tcp')}
					</a>
					.
				</p>
			</div>
		</PublicPageLayout>
	)
}

export default Sitemap
