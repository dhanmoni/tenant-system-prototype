/**
 * Grouped tenancy services and form routes (tenant / citizen portal).
 * Each form maps to its own database table on the backend.
 */
import { APPLICATION_TYPES } from '../constants/application'

/** UIN / tenancy certificate applications table */
export const TENANCY_TABLE = 'tenancy_applications'

/** Display order: highest forum first (Tribunal → Court → Authority). */
export const TENANCY_AUTHORITY_HIERARCHY = ['rent-tribunal', 'rent-court', 'rent-authority']

export function getTenancyAuthoritiesByHierarchy() {
	return TENANCY_AUTHORITY_HIERARCHY.map((id) => tenantServiceGroups.find((g) => g.id === id)).filter(
		Boolean,
	)
}

export const tenantServiceGroups = [
	{
		id: 'rent-authority',
		title: 'Rent Authority',
		description: 'Applications and filings before the Rent Authority.',
		authority: '(Rent Authority) Circle Officer or equivalent — Sec 30',
		forms: [
			{
				formKey: APPLICATION_TYPES.RENT_REVISION,
				tableName: 'rent_authority_form_i_applications',
				to: `/dashboard/${APPLICATION_TYPES.RENT_REVISION}`,
				label: 'Form I — Revision or fixation of rent',
				formName: 'Form I',
				matter: 'Revision or fixation of rent',
				rule: 'Rule 5(1)',
			},
			{
				formKey: APPLICATION_TYPES.OTHER_CHARGES_REVISION,
				tableName: 'rent_authority_form_ia_applications',
				to: `/dashboard/${APPLICATION_TYPES.OTHER_CHARGES_REVISION}`,
				label: 'Form I-A — Revision or fixation of other charges',
				formName: 'Form I-A',
				matter: 'Revision or fixation of other charges',
				rule: 'Rule 5(2)',
			},
			{
				formKey: APPLICATION_TYPES.VALUER_APPOINTMENT,
				tableName: 'rent_authority_form_ib_applications',
				to: `/dashboard/${APPLICATION_TYPES.VALUER_APPOINTMENT}`,
				label: 'Form I-B — Appointment of valuer',
				formName: 'Form I-B',
				matter:
					'Appointment of valuer for fixation or revision of rent and other charges',
				rule: 'Rule 5(4)',
			},
			{
				formKey: APPLICATION_TYPES.RENT_AUTHORITY_FILING,
				tableName: 'rent_authority_form_6_applications',
				to: `/dashboard/${APPLICATION_TYPES.RENT_AUTHORITY_FILING}`,
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
				formKey: APPLICATION_TYPES.RENT_COURT_POSSESSION,
				tableName: 'rent_court_form_4_applications',
				to: `/dashboard/${APPLICATION_TYPES.RENT_COURT_POSSESSION}`,
				label: 'Form II — Recovery of possession',
				formName: 'Form II',
				matter: 'For recovery of possession of premises from tenant',
				rule: 'Rule 7',
			},
			{
				formKey: APPLICATION_TYPES.RENT_COURT_FILING,
				tableName: 'rent_court_form_5_applications',
				to: `/dashboard/${APPLICATION_TYPES.RENT_COURT_FILING}`,
				label: 'Form III — Eviction and recovery of possession',
				formName: 'Form III',
				matter:
					'Eviction and recovery of possession of premises by landlord or his legal heirs.',
				rule: 'Rule 10',
			},
			{
				formKey: APPLICATION_TYPES.RENT_COURT_APPEAL,
				tableName: 'rent_court_form_7_applications',
				to: `/dashboard/${APPLICATION_TYPES.RENT_COURT_APPEAL}`,
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
				formKey: APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL,
				tableName: 'rent_tribunal_form_8_applications',
				to: `/dashboard/${APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL}`,
				label: 'Form VI — Appeal against Rent Court order',
				formName: 'Form VI',
				matter:
					'Appeals by any person aggrieved by the order of the Rent Court',
				rule: 'Rule 13',
			},
		],
	},
]

/** Flat list of all service forms with group metadata */
export function getAllServiceForms() {
	return tenantServiceGroups.flatMap((group) =>
		group.forms.map((form) => ({
			...form,
			groupId: group.id,
			groupTitle: group.title,
			authority: group.authority,
		}))
	)
}

/** Lookup form definition by route slug (formType param) */
export function getServiceFormByKey(formKey) {
	return getAllServiceForms().find((f) => f.formKey === formKey) || null
}

/** CTA on services listings, e.g. "Apply for Form I" */
export function getFormApplyLabel(form) {
	if (!form?.formName) return 'Apply for this form'
	return `Apply for ${form.formName}`
}

/**
 * @param {string | undefined} formType Route param, e.g. `form-i-rent-revision`
 */
export function getFormServiceMeta(formType) {
	if (!formType) return null
	const form = getServiceFormByKey(formType)
	if (!form) return null
	return {
		...form,
		authority: form.authority,
		groupId: form.groupId,
		groupTitle: form.groupTitle,
	}
}
