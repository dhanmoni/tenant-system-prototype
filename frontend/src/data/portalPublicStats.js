/**
 * Public-facing portal statistics for the landing page.
 * Replace values with a public API (e.g. GET /api/public-portal-stats) when available.
 */
export const portalStatsMeta = {
	eyebrow: 'Portal activity',
	title: 'At a glance',
	lead: 'Key indicators for UIN applications, tenancy services, and dispute resolution across Assam.',
	lastUpdatedLabel: 'Live portal data',
}

export const portalPublicStats = [
	{
		id: 'applications_submitted',
		label: 'Applications submitted',
		value: 12840,
		trend: '+12% vs last month',
		trendUp: true,
	},
	{
		id: 'uins_issued',
		label: 'UIN generated',
		value: 9215,
		trend: '+8% vs last month',
		trendUp: true,
	},
	{
		id: 'service_filings',
		label: 'Service applications',
		value: 5120,
		trend: '+9% vs last month',
		trendUp: true,
	},
	{
		id: 'disputes_resolved',
		label: 'Disputes resolved',
		value: 1446,
		trend: '+15% vs last month',
		trendUp: true,
	},
]
