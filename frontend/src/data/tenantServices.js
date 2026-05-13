/**
 * Grouped tenancy services and form routes (tenant / citizen portal).
 * Used by Services page and dashboard shortcuts.
 */
export const tenantServiceGroups = [
	{
		id: 'rent-authority',
		title: 'Rent Authority',
		description: 'Applications and filings before the Rent Authority.',
		forms: [
			{ to: '/dashboard/form-i-rent-revision', label: 'Form I — Rent revision / fixation' },
			{ to: '/dashboard/form-i-a-other-charges-revision', label: 'Form I-A — Other charges revision' },
			{ to: '/dashboard/form-i-b-valuer-appointment', label: 'Form I-B — Valuer appointment' },
			{ to: '/dashboard/form-6-rent-authority-filing', label: 'Form IV — Application before Rent Authority' },
		],
	},
	{
		id: 'rent-court',
		title: 'Rent Court',
		description: 'Applications and filings before the Rent Court.',
		forms: [
			{ to: '/dashboard/form-4-rent-court-possession', label: 'Form II — Rent court possession recovery' },
			{ to: '/dashboard/form-5-rent-court-filing', label: 'Form III — Application before Rent Court' },
			{ to: '/dashboard/form-7-rent-court-appeal', label: 'Form V — Appeal before Rent Court' },
		],
	},
	{
		id: 'rent-tribunal',
		title: 'Rent Tribunal',
		description: 'Appeals before the Rent Tribunal.',
		forms: [
			{ to: '/dashboard/form-8-rent-tribunal-appeal', label: 'Form VI — Appeal before Rent Tribunal' },
		],
	},
]
