import { Link } from 'react-router-dom'
import { Home, LogIn, UserPlus, FileText, BookOpen, Mail, Map, ExternalLink } from 'lucide-react'
import PublicPageLayout from '../components/landing/PublicPageLayout'

const mainLinks = [
	{ label: 'Home', to: '/', icon: Home, external: false },
	{ label: 'Login', to: '/#login', icon: LogIn, external: false },
	{ label: 'New registration', to: '/#register', icon: UserPlus, external: false },
	{ label: 'Apply for certificate', to: '/#login', icon: FileText, external: false },
]

const infoLinks = [
	{ label: 'Policies & Guidelines', to: '/policies', icon: BookOpen, external: false },
	{ label: 'Contact Us', to: '/contact', icon: Mail, external: false },
	{ label: 'Sitemap', to: '/sitemap', icon: Map, external: false },
]

const externalLinks = [
	{ label: 'National Portal (India.gov.in)', href: 'https://www.india.gov.in/', icon: ExternalLink },
	{ label: 'Digital India', href: 'https://www.digitalindia.gov.in/', icon: ExternalLink },
	{ label: 'TCP Assam', href: 'https://tcp.assam.gov.in/', icon: ExternalLink },
]

function LinkGroup({ title, items, useHref = false }) {
	return (
		<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
			<h2 className="landing-section-label mb-4 text-landing">{title}</h2>
			<ul className="space-y-2">
				{items.map((item) => {
					const Icon = item.icon
					return (
						<li key={item.label}>
							{useHref ? (
								<a
									href={item.href}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-slate-700 transition hover:bg-landing/5 hover:text-landing"
								>
									<Icon className="h-4 w-4 shrink-0" aria-hidden />
									{item.label}
								</a>
							) : (
								<Link
									to={item.to}
									className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-slate-700 transition hover:bg-landing/5 hover:text-landing"
								>
									<Icon className="h-4 w-4 shrink-0" aria-hidden />
									{item.label}
								</Link>
							)}
						</li>
					)
				})}
			</ul>
		</div>
	)
}

function Sitemap() {
	return (
		<PublicPageLayout
			eyebrow="Public navigation"
			title="Sitemap"
			titleId="sitemap-heading"
			breadcrumbLabel="Sitemap"
			lead="Quick links to pages and services on the Assam Tenancy Registration Portal prototype."
		>
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				<LinkGroup title="Main" items={mainLinks} />
				<LinkGroup title="Information" items={infoLinks} />
				<LinkGroup title="External" items={externalLinks} useHref />
			</div>
		</PublicPageLayout>
	)
}

export default Sitemap
