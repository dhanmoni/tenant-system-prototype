import { Link } from 'react-router-dom'
import { ExternalLink, Globe, Link2, Mail, Share2 } from 'lucide-react'
import nicLogo from '../../assets/img/NIC.png'
import digitalIndiaLogo from '../../assets/img/digital-india.png'
import { siteLastUpdated } from '../../data/siteMeta'
import { useLanguage } from '../../i18n'

const footerLinkClass =
	'landing-footer-link text-sm text-white/80 no-underline transition hover:text-white hover:underline'

const footerSocialClass =
	'landing-footer-social flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/80 no-underline transition hover:border-white/40 hover:bg-white/10 hover:text-white'

function FooterLink({ item }) {
	const className = footerLinkClass

	if (item.hash) {
		return (
			<a href={item.to} className={className}>
				{item.label}
			</a>
		)
	}

	return (
		<Link to={item.to} className={className}>
			{item.label}
		</Link>
	)
}

function FooterColumn({ title, children }) {
	return (
		<div>
			<h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-white/50">{title}</h3>
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
		{ label: t('nav.contact'), href: '/contact', icon: Mail },
		{ label: 'TCP Assam', href: 'https://tcp.assam.gov.in/', icon: ExternalLink },
	]

	return (
		<footer className="landing-footer bg-[#111111] text-white" role="contentinfo">
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
				<div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
					<div className="lg:col-span-4">
						<p className="text-2xl font-bold tracking-tight text-landing">ATRP</p>
						<p className="mt-1 text-sm font-semibold text-white/90">
							{t('gov.portalFull')}
						</p>
						<p className="mt-2 max-w-xs text-sm leading-relaxed text-white/60">
							{t('footer.tagline')}
						</p>
						<div className="mt-5 flex flex-wrap gap-2">
							{socialLinks.map(({ label, href, icon: Icon }) => (
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
							))}
						</div>
						<p className="mt-5 text-xs text-white/45">{t('footer.lastUpdated', { date: '20 Mar 2026' })}</p>
						<p className="text-xs text-white/45">{t('footer.visitors')}</p>
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

						<div className="mt-8 border-t border-white/10 pt-6">
							<p className="text-xs leading-relaxed text-white/50">
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
							<p className="mt-2 text-[10px] uppercase tracking-wide text-white/40">{t('footer.poweredBy')}</p>
						</div>
					</div>
				</div>
			</div>

			<div className="border-t border-white/10">
				<div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
					<p>{t('footer.copyright')}</p>
					<p className="mt-2 font-medium text-white/60">
						{t('footer.lastUpdatedLabel')} <time dateTime="2026-05-16">{siteLastUpdated}</time>
					</p>
					<div className="flex flex-wrap gap-4">
						<Link to="/policies" className="landing-footer-link text-white/50 no-underline hover:text-white">
							{t('footer.terms')}
						</Link>
						<Link to="/policies" className="landing-footer-link text-white/50 no-underline hover:text-white">
							{t('footer.privacy')}
						</Link>
						<a
							href="https://www.india.gov.in/"
							target="_blank"
							rel="noopener noreferrer"
							className="landing-footer-link text-white/50 no-underline hover:text-white"
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
