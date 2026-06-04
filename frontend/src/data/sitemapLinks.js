/**
 * Hierarchical sitemap — top-level pages with nested sub-pages (government HTML sitemap).
 */

export const sitemapTree = [
	{
		label: 'Home',
		to: '/',
		children: [
			{ label: 'How to apply', href: '/#portal-guide' },
			{ label: 'Portal services', href: '/#services' },
			{ label: 'Sign in', href: '/#login' },
			{ label: 'New registration', href: '/#register' },
		],
	},
	{ label: 'About us', to: '/about' },
	{
		label: 'Portal services',
		to: '/services',
		children: [
			{ label: 'Tenancy registration & UIN', to: '/services#uin-registration' },
			{ label: 'Rent Tribunal services', to: '/services#rent-tribunal' },
			{ label: 'Rent Court services', to: '/services#rent-court' },
			{ label: 'Rent Authority services', to: '/services#rent-authority' },
		],
	},
	{ label: 'Public dashboard', to: '/public-dashboard' },
	{ label: 'Policies & guidelines', to: '/policies' },
	{ label: 'Resources', to: '/resources' },
	{ label: 'Contact us', to: '/contact' },
	{ label: 'Sign in', to: '/login' },
	// { label: 'Sitemap', to: '/sitemap' },
	{
		label: 'Related government websites',
		children: [
			{
				label: 'Directorate of Town & Country Planning, Assam',
				href: 'https://tcp.assam.gov.in/',
				external: true,
			},
			{
				label: 'National Portal of India (India.gov.in)',
				href: 'https://www.india.gov.in/',
				external: true,
			},
			{
				label: 'Digital India',
				href: 'https://www.digitalindia.gov.in/',
				external: true,
			},
		],
	},
]
