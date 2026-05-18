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
