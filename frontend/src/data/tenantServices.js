/**
 * Grouped tenancy services and form routes (tenant / citizen portal).
 * Used by Services page and dashboard shortcuts.
 */
export const tenantServiceGroups = [
	{
		id: 'revision',
		title: 'Revision of rent / charges',
		description: 'Rent revision, other charges, and valuer appointment.',
		forms: [
			{ to: '/dashboard/form-i-rent-revision', label: 'Form I — Rent revision / fixation' },
			{ to: '/dashboard/form-i-a-other-charges-revision', label: 'Form I-A — Other charges revision' },
			{ to: '/dashboard/form-i-b-valuer-appointment', label: 'Form I-B — Valuer appointment' },
		],
	},
	{
		id: 'rent-court',
		title: 'Rent Court',
		description: 'Applications and filings before the Rent Court.',
		forms: [
			{ to: '/dashboard/form-4-rent-court-possession', label: 'Form 4 — Rent court possession' },
			{ to: '/dashboard/form-5-rent-court-filing', label: 'Form 5 — Application (Rent Court)' },
		],
	},
	{
		id: 'rent-authority',
		title: 'Rent Authority',
		description: 'Applications before the Rent Authority.',
		forms: [
			{ to: '/dashboard/form-6-rent-authority-filing', label: 'Form 6 — Application (Rent Authority)' },
		],
	},
	{
		id: 'rent-appellant',
		title: 'Rent appellant',
		description: 'Appeals before the Rent Court and Rent Tribunal.',
		forms: [
			{ to: '/dashboard/form-7-rent-court-appeal', label: 'Form 7 — Appeal before Rent Court' },
			{ to: '/dashboard/form-8-rent-tribunal-appeal', label: 'Form 8 — Appeal before Rent Tribunal' },
		],
	},
]
