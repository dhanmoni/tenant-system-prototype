/**
 * Illustrative public-facing portal statistics for the landing page demo.
 * Replace with a public API (e.g. GET /api/public-portal-stats) when available.
 */
export const portalStatsMeta = {
	eyebrow: 'Portal activity',
	title: 'At a glance',
	lead: 'Key indicators from tenancy registration, certificates, and dispute resolution under the Assam Tenancy Act.',
	demoNote:
		'Figures shown are illustrative for this demonstration build. Live counts will reflect production data when connected.',
	lastUpdatedLabel: 'Illustrative data',
}

export const portalPublicStats = [
	{
		id: 'applications_submitted',
		label: 'Applications submitted',
		value: 12840,
		hint: 'Tenancy certificates & related filings',
		trend: '+12% vs last month',
		trendUp: true,
	},
	{
		id: 'certificates_issued',
		label: 'Certificates issued',
		value: 9215,
		hint: 'Digitally signed certificates',
		trend: '+8% vs last month',
		trendUp: true,
	},
	{
		id: 'citizens_registered',
		label: 'Registered citizens',
		value: 24560,
		hint: 'Tenants and property owners',
		trend: '+18% vs last month',
		trendUp: true,
	},
	{
		id: 'disputes_raised',
		label: 'Disputes raised',
		value: 1892,
		hint: 'Rent, deposit, possession & appeals',
		trend: '+4% vs last month',
		trendUp: false,
	},
	{
		id: 'matters_resolved',
		label: 'Matters resolved',
		value: 1446,
		hint: 'Closed at Authority, Court, or Tribunal',
		trend: '+15% vs last month',
		trendUp: true,
	},
	{
		id: 'pending_review',
		label: 'Pending review',
		value: 2318,
		hint: 'Awaiting processing or hearing',
		trend: '−6% vs last month',
		trendUp: true,
	},
	{
		id: 'rent_authority_filings',
		label: 'Rent Authority filings',
		value: 3404,
		hint: 'Forms I, I-A, IV & related',
		trend: '+9% vs last month',
		trendUp: true,
	},
	{
		id: 'districts_active',
		label: 'Districts covered',
		value: 35,
		hint: 'State-wide portal reach',
		trend: 'All districts',
		trendUp: null,
	},
]
