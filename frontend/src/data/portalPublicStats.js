/**
 * Public-facing portal statistics for the landing page.
 * Replace values with a public API (e.g. GET /api/public-portal-stats) when available.
 */
export const portalPublicStats = [
	{
		id: 'applications_submitted',
		value: 12840,
		display: '12K+',
		label: 'Applications submitted',
		description: 'Tenancy and service applications filed through the portal statewide.',
		icon: 'fileStack',
	},
	{
		id: 'uins_issued',
		value: 9215,
		display: '9K+',
		label: 'UINs issued',
		description: 'Unique Identification Numbers issued to registered tenancies.',
		icon: 'idCard',
	},
	{
		id: 'service_filings',
		value: 5120,
		display: '5K+',
		label: 'Service filings',
		description: 'Assam Tenancy Act forms submitted to Rent Authority, Court, and Tribunal.',
		icon: 'landmark',
	},
	{
		id: 'disputes_resolved',
		value: 1446,
		display: '1.4K+',
		label: 'Disputes resolved',
		description: 'Disputes and appeals concluded through the digital workflow.',
		icon: 'circleCheck',
	},
]
