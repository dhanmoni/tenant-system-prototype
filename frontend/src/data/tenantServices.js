/**
 * Grouped tenancy services and form routes (tenant / citizen portal).
 * Used by Services page, sidebar flyout, and form legal context.
 *
 * authority = jurisdiction line (Act section); rule / matter / formName match process-flow references.
 */
export const tenantServiceGroups = [
	{
		id: 'rent-authority',
		title: 'Rent Authority',
		description: 'Applications and filings before the Rent Authority.',
		authority: '(Rent Authority) Circle Officer or equivalent — Sec 30',
		forms: [
			{
				to: '/dashboard/form-i-rent-revision',
				label: 'Form I — Revision or fixation of rent',
				formName: 'Form I',
				matter: 'Revision or fixation of rent',
				rule: 'Rule 5(1)',
			},
			{
				to: '/dashboard/form-i-a-other-charges-revision',
				label: 'Form I-A — Revision or fixation of other charges',
				formName: 'Form I-A',
				matter: 'Revision or fixation of other charges',
				rule: 'Rule 5(2)',
			},
			{
				to: '/dashboard/form-i-b-valuer-appointment',
				label: 'Form I-B — Appointment of valuer',
				formName: 'Form I-B',
				matter:
					'Appointment of valuer for fixation or revision of rent and other charges',
				rule: 'Rule 5(4)',
			},
			{
				to: '/dashboard/form-6-rent-authority-filing',
				label: 'Form IV — Matters under Rule 11',
				formName: 'Form IV',
				matter:
					'Matters under Rule 11 — sections 10 (rent dispute), 14 (deposit money dispute), 15 (property repair dispute) and 20 (withholding dispute)',
				rule: 'Rule 11',
			},
		],
	},
	{
		id: 'rent-court',
		title: 'Rent Court',
		description: 'Applications and filings before the Rent Court.',
		authority: '(Rent Court) ADC or equivalent — Sec 33',
		forms: [
			{
				to: '/dashboard/form-4-rent-court-possession',
				label: 'Form II — Recovery of possession',
				formName: 'Form II',
				matter: 'For recovery of possession of premises from tenant',
				rule: 'Rule 7',
			},
			{
				to: '/dashboard/form-5-rent-court-filing',
				label: 'Form III — Eviction and recovery of possession',
				formName: 'Form III',
				matter:
					'Eviction and recovery of possession of premises by landlord or in the case of landlord',
				rule: 'Rule 10',
			},
			{
				to: '/dashboard/form-7-rent-court-appeal',
				label: 'Form V — Appeal against Rent Authority order',
				formName: 'Form V',
				matter:
					'Appeals by any person aggrieved by the order of the Rent Authority',
				rule: 'Rule 12',
			},
		],
	},
	{
		id: 'rent-tribunal',
		title: 'Rent Tribunal',
		description: 'Appeals before the Rent Tribunal.',
		authority:
			'(Rent Tribunal) District Judge or Additional District Judge — Sec 34',
		forms: [
			{
				to: '/dashboard/form-8-rent-tribunal-appeal',
				label: 'Form VI — Appeal against Rent Court order',
				formName: 'Form VI',
				matter:
					'Appeals by any person aggrieved by the order of the Rent Court',
				rule: 'Rule 13',
			},
		],
	},
]

/**
 * @param {string | undefined} formType Route param, e.g. `form-i-rent-revision`
 * @returns {null | {
 *   to: string,
 *   label: string,
 *   formName: string,
 *   matter: string,
 *   rule: string,
 *   authority: string,
 *   groupId: string,
 *   groupTitle: string,
 * }}
 */
export function getFormServiceMeta(formType) {
	if (!formType) return null
	for (const group of tenantServiceGroups) {
		for (const form of group.forms) {
			const slug = form.to.replace(/^\/dashboard\//, '')
			if (slug === formType) {
				return {
					...form,
					authority: group.authority,
					groupId: group.id,
					groupTitle: group.title,
				}
			}
		}
	}
	return null
}
