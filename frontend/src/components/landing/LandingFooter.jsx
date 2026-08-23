import { Link } from 'react-router-dom'
import { ExternalLink, Globe, Link2, Mail, Share2 } from 'lucide-react'
import nicLogo from '../../assets/img/NIC.png'
import digitalIndiaLogo from '../../assets/img/digital-india.png'
import { siteLastUpdated } from '../../data/siteMeta'
import { useLanguage } from '../../i18n'

const footerLinkClass =
	'landing-footer-link text-sm no-underline transition hover:underline'

const footerSocialClass =
	'landing-footer-social flex h-9 w-9 items-center justify-center rounded-full border no-underline transition'

function FooterLink({ item }) {
	return (
		<Link
			to={item.to}
			className={footerLinkClass}
			onClick={() => {
				if (!String(item.to).includes('#')) {
					window.scrollTo(0, 0)
				}
			}}
		>
			{item.label}
		</Link>
	)
}

function FooterColumn({ title, children }) {
	return (
		<div>
			<h3 className="mb-4 text-xs font-bold uppercase tracking-wider landing-footer__heading">{title}</h3>
			<ul className="space-y-2.5">{children}</ul>
		</div>
	)
}

function LandingFooter() {
	const { t } = useLanguage()

	const portalLinks = [
		{ label: t('nav.home'), to: '/' },
		{ label: t('nav.services'), to: '/services' },
		{ label: t('footer.howItWorks'), to: '/#portal-guide', hash: true },
		{ label: t('nav.login'), to: '/#login', hash: true },
		{ label: t('footer.newRegistration'), to: '/#register', hash: true },
	]

	const resourceLinks = [
		{ label: t('nav.about'), to: '/about' },
		{ label: t('nav.publicDashboard'), to: '/public-dashboard' },
		{ label: t('nav.services'), to: '/services' },
		{ label: t('footer.policiesGuidelines'), to: '/policies' },
		{ label: t('nav.resources'), to: '/resources' },
		{ label: t('help.title'), to: '/help-centre' },
		{ label: t('a11yPage.title'), to: '/accessibility' },
		{ label: t('feedback.title'), to: '/feedback' },
		{ label: t('nav.contactUs'), to: '/contact' },
		{ label: t('footer.sitemap'), to: '/sitemap' },
	]

	const externalLinks = [
		{ label: 'TCP Assam', href: 'https://tcp.assam.gov.in/' },
		{ label: 'India.gov.in', href: 'https://www.india.gov.in/' },
		{ label: 'Digital India', href: 'https://www.digitalindia.gov.in/' },
	]

	const socialLinks = [
		{ label: 'LinkedIn', href: 'https://www.linkedin.com/', icon: Link2 },
		{ label: 'Facebook', href: 'https://www.facebook.com/', icon: Share2 },
		{ label: 'YouTube', href: 'https://www.youtube.com/', icon: Globe },
		{ label: t('nav.contact'), href: '/contact', icon: Mail, external: false },
		{ label: 'TCP Assam', href: 'https://tcp.assam.gov.in/', icon: ExternalLink },
	]

	return (
		<footer className="landing-footer" role="contentinfo">
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
				<div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
					<div className="lg:col-span-4">
						<p className="landing-footer__brand text-2xl font-bold tracking-tight">ATRP</p>
						<p className="landing-footer__title mt-1 text-sm font-semibold">
							{t('gov.portalFull')}
						</p>
						<p className="landing-footer__tagline mt-2 max-w-xs text-sm leading-relaxed">
							{t('footer.tagline')}
						</p>
						<div className="mt-5 flex flex-wrap gap-2">
							{socialLinks.map(({ label, href, icon: Icon, external }) =>
								external === false ? (
									<Link
										key={label}
										to={href}
										className={footerSocialClass}
										aria-label={label}
									>
										<Icon className="h-4 w-4" aria-hidden />
									</Link>
								) : (
									<a
										key={label}
										href={href}
										target="_blank"
										rel="noopener noreferrer"
										className={footerSocialClass}
										aria-label={label}
									>
										<Icon className="h-4 w-4" aria-hidden />
									</a>
								),
							)}
						</div>
						<p className="landing-footer__meta mt-5 text-xs">
							{t('footer.lastUpdated', { date: siteLastUpdated })}
						</p>
					</div>

					<div className="lg:col-span-2">
						<FooterColumn title={t('footer.portal')}>
							{portalLinks.map((item) => (
								<li key={`${item.to}-${item.label}`}>
									<FooterLink item={item} />
								</li>
							))}
						</FooterColumn>
					</div>

					<div className="lg:col-span-3">
						<FooterColumn title={t('footer.resources')}>
							{resourceLinks.map((item) => (
								<li key={`${item.to}-${item.label}`}>
									<FooterLink item={item} />
								</li>
							))}
						</FooterColumn>
					</div>

					<div className="lg:col-span-3">
						<FooterColumn title={t('footer.external')}>
							{externalLinks.map((item) => (
								<li key={item.label}>
									<a
										href={item.href}
										target="_blank"
										rel="noopener noreferrer"
										className={`${footerLinkClass} inline-flex items-center gap-1.5`}
									>
										{item.label}
										<ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
									</a>
								</li>
							))}
						</FooterColumn>

						<div className="mt-8 border-t border-[color:var(--footer-border)] pt-6">
							<p className="landing-footer__dept text-xs leading-relaxed">
								{t('footer.deptLine1')}
								<br />
								{t('footer.deptLine2')}
								<br />
								{t('footer.deptLine3')}
							</p>
							<div className="mt-4 flex flex-wrap items-center gap-4">
								<img className="h-8 w-auto brightness-0 invert opacity-90" src={nicLogo} alt="NIC" />
								<img className="h-8 w-auto" src={digitalIndiaLogo} alt="Digital India" />
							</div>
							<p className="landing-footer__powered mt-2 text-[10px] uppercase tracking-wide">{t('footer.poweredBy')}</p>
						</div>
					</div>
				</div>
			</div>

			<div className="border-t border-[color:var(--footer-border)]">
				<div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
					<p className="landing-footer__bar-text">{t('footer.copyright')}</p>
					<p className="landing-footer__bar-muted mt-2 font-medium">
						{t('footer.lastUpdatedLabel')} <time dateTime="2026-05-16">{siteLastUpdated}</time>
					</p>
					<div className="flex flex-wrap gap-4">
						<Link
							to="/policies"
							className="landing-footer-link landing-footer__bar-muted no-underline hover:underline"
							onClick={() => window.scrollTo(0, 0)}
						>
							{t('footer.terms')}
						</Link>
						<Link
							to="/policies"
							className="landing-footer-link landing-footer__bar-muted no-underline hover:underline"
							onClick={() => window.scrollTo(0, 0)}
						>
							{t('footer.privacy')}
						</Link>
						<a
							href="https://www.india.gov.in/"
							target="_blank"
							rel="noopener noreferrer"
							className="landing-footer-link landing-footer__bar-muted no-underline hover:underline"
						>
							{t('footer.websitePolicies')}
						</a>
					</div>
				</div>
			</div>
		</footer>
	)
}

export default LandingFooter
