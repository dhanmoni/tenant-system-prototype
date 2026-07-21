import { ROLES, ASSISTANT_ROLES, PRINCIPAL_ROLES } from '../../constants/roles'
import { APPLICATION_TYPES, APPLICATION_LABELS } from '../../constants/application'

/**
 * Office profiles for Rent Authority / Court / Tribunal (and Valuer).
 * Drives role-specific staff + assistant dashboards.
 */
export const OFFICE_IDS = {
	RENT_AUTHORITY: 'rent_authority',
	RENT_COURT: 'rent_court',
	RENT_TRIBUNAL: 'rent_tribunal',
	VALUER: 'valuer',
}

const RA_FORMS = [
	APPLICATION_TYPES.RENT_REVISION,
	APPLICATION_TYPES.OTHER_CHARGES_REVISION,
	APPLICATION_TYPES.VALUER_APPOINTMENT,
	APPLICATION_TYPES.RENT_AUTHORITY_FILING,
]

const RC_FORMS = [
	APPLICATION_TYPES.RENT_COURT_POSSESSION,
	APPLICATION_TYPES.RENT_COURT_FILING,
	APPLICATION_TYPES.RENT_COURT_APPEAL,
]

const RT_FORMS = [APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL]

const VALUER_FORMS = [APPLICATION_TYPES.VALUER_APPOINTMENT]

export const OFFICE_PROFILES = {
	[OFFICE_IDS.RENT_AUTHORITY]: {
		id: OFFICE_IDS.RENT_AUTHORITY,
		title: 'Rent Authority',
		badge: 'Rent Authority office',
		assistantBadge: 'RA Assistant desk',
		assistantTitle: 'Rent Authority Assistant',
		tone: 'authority',
		forms: RA_FORMS,
		scopeBlurb: 'Forms I, I-A, I-B, and IV under the Assam Tenancy Act',
		assistantHint:
			'Verify Form I / I-A / I-B / IV submissions, then forward them to the Rent Authority.',
		principalHint: 'Decide on applications verified by your Rent Authority assistant.',
		forwardsTo: 'Rent Authority',
		queueAssistantLabel: 'Awaiting verification',
		queuePrincipalLabel: 'Awaiting decision',
		assistantSteps: [
			'Open the inbox and take the oldest submitted application (FIFO).',
			'Check documents and form details for Forms I, I-A, I-B, or IV.',
			'Verify the application, or return it if information is incomplete.',
			'Forward verified files to the Rent Authority for decision.',
		],
	},
	[OFFICE_IDS.RENT_COURT]: {
		id: OFFICE_IDS.RENT_COURT,
		title: 'Rent Court',
		badge: 'Rent Court office',
		assistantBadge: 'RC Assistant desk',
		assistantTitle: 'Rent Court Assistant',
		tone: 'court',
		forms: RC_FORMS,
		scopeBlurb: 'Forms II, III, and V under the Assam Tenancy Act',
		assistantHint:
			'Verify Form II / III / V submissions, then forward them to the Rent Court.',
		principalHint: 'Decide on applications verified by your Rent Court assistant.',
		forwardsTo: 'Rent Court',
		queueAssistantLabel: 'Awaiting verification',
		queuePrincipalLabel: 'Awaiting decision',
		assistantSteps: [
			'Open the inbox and take the oldest submitted application (FIFO).',
			'Check documents and form details for Forms II, III, or V.',
			'Verify the application, or return it if information is incomplete.',
			'Forward verified files to the Rent Court for decision.',
		],
	},
	[OFFICE_IDS.RENT_TRIBUNAL]: {
		id: OFFICE_IDS.RENT_TRIBUNAL,
		title: 'Rent Tribunal',
		badge: 'Rent Tribunal office',
		assistantBadge: 'RT Assistant desk',
		assistantTitle: 'Rent Tribunal Assistant',
		tone: 'tribunal',
		forms: RT_FORMS,
		scopeBlurb: 'Form VI tribunal appeals under the Assam Tenancy Act',
		assistantHint: 'Verify Form VI appeals, then forward them to the Rent Tribunal.',
		principalHint: 'Decide on Form VI appeals verified by your Rent Tribunal assistant.',
		forwardsTo: 'Rent Tribunal',
		queueAssistantLabel: 'Awaiting verification',
		queuePrincipalLabel: 'Awaiting decision',
		assistantSteps: [
			'Open the inbox and take the oldest submitted Form VI appeal (FIFO).',
			'Check appeal documents and details against the Rent Court order.',
			'Verify the appeal, or return it if information is incomplete.',
			'Forward verified appeals to the Rent Tribunal for decision.',
		],
	},
	[OFFICE_IDS.VALUER]: {
		id: OFFICE_IDS.VALUER,
		title: 'Valuer',
		badge: 'Valuer desk',
		assistantBadge: 'Valuer desk',
		assistantTitle: 'Valuer',
		tone: 'valuer',
		forms: VALUER_FORMS,
		scopeBlurb: 'Form I-B valuer appointment reports only',
		assistantHint: 'Complete valuation reports for Form I-B appointments assigned to you.',
		principalHint: 'Complete valuation reports for Form I-B appointments.',
		forwardsTo: 'Rent Authority',
		queueAssistantLabel: 'Assigned reports',
		queuePrincipalLabel: 'Assigned reports',
		assistantSteps: [
			'Open your inbox for Form I-B appointments.',
			'Review the property and rent details in the application.',
			'Prepare and submit the valuation report.',
			'Return the file so Rent Authority can continue processing.',
		],
	},
}

const ROLE_TO_OFFICE = {
	[ROLES.RENT_AUTHORITY]: OFFICE_IDS.RENT_AUTHORITY,
	[ROLES.RA_ASSISTANT]: OFFICE_IDS.RENT_AUTHORITY,
	[ROLES.RENT_COURT]: OFFICE_IDS.RENT_COURT,
	[ROLES.RC_ASSISTANT]: OFFICE_IDS.RENT_COURT,
	[ROLES.RENT_TRIBUNAL]: OFFICE_IDS.RENT_TRIBUNAL,
	[ROLES.RT_ASSISTANT]: OFFICE_IDS.RENT_TRIBUNAL,
	[ROLES.VALUER]: OFFICE_IDS.VALUER,
}

export function getOfficeProfileForRole(role) {
	const officeId = ROLE_TO_OFFICE[role]
	if (!officeId) return null
	const profile = OFFICE_PROFILES[officeId]
	const isAssistant = ASSISTANT_ROLES.includes(role)
	const isPrincipal = PRINCIPAL_ROLES.includes(role)
	const isValuer = role === ROLES.VALUER
	return {
		...profile,
		isAssistant,
		isPrincipal,
		isValuer,
		formLabels: profile.forms.map((type) => APPLICATION_LABELS[type] || type),
	}
}

export function isStaffOfficeRole(role) {
	return Boolean(ROLE_TO_OFFICE[role])
}

export function isAssistantOfficeRole(role) {
	return ASSISTANT_ROLES.includes(role)
}

export function isPrincipalOfficeRole(role) {
	return PRINCIPAL_ROLES.includes(role)
}

export function isValuerRole(role) {
	return role === ROLES.VALUER
}
