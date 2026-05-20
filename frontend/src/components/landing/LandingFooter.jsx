import { Link } from 'react-router-dom'
import { ExternalLink, Globe, Link2, Mail, Share2 } from 'lucide-react'
import nicLogo from '../../assets/img/NIC.png'
import digitalIndiaLogo from '../../assets/img/digital-india.png'
import { siteLastUpdated } from '../../data/siteMeta'

const portalLinks = [
	{ label: 'Home', to: '/' },
	{ label: 'Services', to: '/services' },
	{ label: 'How it works', to: '/#portal-guide', hash: true },
	{ label: 'Login', to: '/#login', hash: true },
	{ label: 'New registration', to: '/#register', hash: true },
]

const resourceLinks = [
	{ label: 'About us', to: '/about' },
	{ label: 'Public dashboard', to: '/public-dashboard' },
	{ label: 'Services', to: '/services' },
	{ label: 'Policies & guidelines', to: '/policies' },
	{ label: 'Contact us', to: '/contact' },
	{ label: 'Sitemap', to: '/sitemap' },
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
	{ label: 'Contact', href: '/contact', icon: Mail },
	{ label: 'TCP Assam', href: 'https://tcp.assam.gov.in/', icon: ExternalLink },
]

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
	return (
		<footer className="landing-footer bg-[#111111] text-white" role="contentinfo">
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
				<div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
					<div className="lg:col-span-4">
						<p className="text-2xl font-bold tracking-tight text-landing">ATRP</p>
						<p className="mt-1 text-sm font-semibold text-white/90">
							Assam Tenancy Registration Portal
						</p>
						<p className="mt-2 max-w-xs text-sm leading-relaxed text-white/60">
							One digital platform for tenancy registration and certificate services in Assam.
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
						<p className="mt-5 text-xs text-white/45">Last updated: 20 Mar 2026</p>
						<p className="text-xs text-white/45">Visitors (demo): 4,32,102</p>
					</div>

					<div className="lg:col-span-2">
						<FooterColumn title="Portal">
							{portalLinks.map((item) => (
								<li key={item.label}>
									<FooterLink item={item} />
								</li>
							))}
						</FooterColumn>
					</div>

					<div className="lg:col-span-3">
						<FooterColumn title="Resources">
							{resourceLinks.map((item) => (
								<li key={item.label}>
									<FooterLink item={item} />
								</li>
							))}
						</FooterColumn>
					</div>

					<div className="lg:col-span-3">
						<FooterColumn title="External">
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
								Directorate of Town and Country Planning
								<br />
								Department of Housing and Urban Affairs
								<br />
								Government of Assam
							</p>
							<div className="mt-4 flex flex-wrap items-center gap-4">
								<img className="h-8 w-auto brightness-0 invert opacity-90" src={nicLogo} alt="NIC" />
								<img className="h-8 w-auto" src={digitalIndiaLogo} alt="Digital India" />
							</div>
							<p className="mt-2 text-[10px] uppercase tracking-wide text-white/40">Powered by</p>
						</div>
					</div>
				</div>
			</div>

			<div className="border-t border-white/10">
				<div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
					<p>
						© 2026 Assam Tenancy Registration Portal (demo). Content owned by Directorate of Town and
						Country Planning, Assam.
					</p>
					<p className="mt-2 font-medium text-white/60">
						Last updated: <time dateTime="2026-05-16">{siteLastUpdated}</time>
					</p>
					<div className="flex flex-wrap gap-4">
						<Link to="/policies" className="landing-footer-link text-white/50 no-underline hover:text-white">
							Terms &amp; policies
						</Link>
						<Link to="/policies" className="landing-footer-link text-white/50 no-underline hover:text-white">
							Privacy
						</Link>
						<a
							href="https://www.india.gov.in/"
							target="_blank"
							rel="noopener noreferrer"
							className="landing-footer-link text-white/50 no-underline hover:text-white"
						>
							Website policies
						</a>
					</div>
				</div>
			</div>
		</footer>
	)
}

export default LandingFooter
