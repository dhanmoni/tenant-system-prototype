/**
 * Application Type Constants
 * Matches backend types in ApplicationWorkflowController
 */
//export const APPLICATION_TYPES = {
//	TENANCY_CERTIFICATE: 'tenancy',
//	RENT_REVISION: 'form-i-rent-revision',
//	OTHER_CHARGES_REVISION: 'form-i-a-other-charges-revision',
//	VALUER_APPOINTMENT: 'form-i-b-valuer-appointment',
//	RENT_COURT_POSSESSION: 'form-4-rent-court-possession',
//	RENT_COURT_FILING: 'form-5-rent-court-filing',
//	RENT_AUTHORITY_FILING: 'form-6-rent-authority-filing',
//	RENT_COURT_APPEAL: 'form-7-rent-court-appeal',
//	RENT_TRIBUNAL_APPEAL: 'form-8-rent-tribunal-appeal',
//}

export const APPLICATION_TYPES = {
	TENANCY_CERTIFICATE: 'tenancy',
	RENT_REVISION: 'form-i-rent-revision',
	OTHER_CHARGES_REVISION: 'form-i-a-other-charges-revision',
	VALUER_APPOINTMENT: 'form-i-b-valuer-appointment',
	RENT_COURT_POSSESSION: 'form-ii-rent-court-possession',
	RENT_COURT_FILING: 'form-iii-rent-court-filing',
	RENT_AUTHORITY_FILING: 'form-iv-rent-authority-filing',
	RENT_COURT_APPEAL: 'form-v-rent-court-appeal',
	RENT_TRIBUNAL_APPEAL: 'form-vi-rent-tribunal-appeal',
}

/** Form applications under Rent Authority / Court / Tribunal (excludes UIN). */
export const SERVICE_APPLICATION_TYPES = Object.values(APPLICATION_TYPES).filter(
	(type) => type !== APPLICATION_TYPES.TENANCY_CERTIFICATE
)

export const APPLICATION_LABELS = {
	[APPLICATION_TYPES.TENANCY_CERTIFICATE]: 'Tenancy Certificate',
	[APPLICATION_TYPES.RENT_AUTHORITY_FILING]: 'Application filed before Rent Authority',
	[APPLICATION_TYPES.RENT_REVISION]: 'Revision or fixation of rent',
	[APPLICATION_TYPES.OTHER_CHARGES_REVISION]: 'Revision or fixation of other charges',
	[APPLICATION_TYPES.VALUER_APPOINTMENT]: 'Appointment of valuer for fixation of rent & other charges',
	[APPLICATION_TYPES.RENT_COURT_POSSESSION]: 'Recovery of possession of premises',
	[APPLICATION_TYPES.RENT_COURT_FILING]: 'Application filed before Rent Court',
	[APPLICATION_TYPES.RENT_COURT_APPEAL]: 'Appeal against Rent Authority order',
	[APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL]: 'Appeal against Rent Court order',
}

const APPLICATION_I18N_KEYS = {
	[APPLICATION_TYPES.TENANCY_CERTIFICATE]: 'ws.app.tenancy',
	[APPLICATION_TYPES.RENT_REVISION]: 'ws.app.rentRevision',
	[APPLICATION_TYPES.OTHER_CHARGES_REVISION]: 'ws.app.otherCharges',
	[APPLICATION_TYPES.VALUER_APPOINTMENT]: 'ws.app.valuerAppointment',
	[APPLICATION_TYPES.RENT_COURT_POSSESSION]: 'ws.app.rentCourtPossession',
	[APPLICATION_TYPES.RENT_COURT_FILING]: 'ws.app.rentCourtFiling',
	[APPLICATION_TYPES.RENT_AUTHORITY_FILING]: 'ws.app.rentAuthorityFiling',
	[APPLICATION_TYPES.RENT_COURT_APPEAL]: 'ws.app.rentCourtAppeal',
	[APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL]: 'ws.app.rentTribunalAppeal',
}

export function getApplicationLabel(type, t) {
	const key = APPLICATION_I18N_KEYS[type]
	if (key && typeof t === 'function') {
		const translated = t(key)
		if (translated && translated !== key) return translated
	}
	return APPLICATION_LABELS[type] || String(type || '').replace(/-/g, ' ')
}
