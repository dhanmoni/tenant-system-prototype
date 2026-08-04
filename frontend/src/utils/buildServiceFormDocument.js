import { APPLICATION_TYPES } from '../constants/application'
import { getServiceFormByKey } from '../data/tenantServices'
import { formatDate } from './formatters'

function text(value) {
	if (value === null || value === undefined) return ''
	if (typeof value === 'object') {
		if (value?.name) return String(value.name).trim()
		return ''
	}
	return String(value).trim()
}

function money(value) {
	const raw = text(value)
	if (!raw) return ''
	if (raw.startsWith('₹')) return raw
	return `₹${raw}`
}

function joinParts(...parts) {
	return parts.map(text).filter(Boolean).join(', ')
}

function row(sl, label, value) {
	return {
		sl: typeof sl === 'number' ? `${sl}.` : sl,
		label,
		value: text(value),
	}
}

function rowsFrom(defs) {
	return defs.filter((item) => item && item.label)
}

function signatureBlock(app, caption = 'Signature of applicant') {
	return {
		caption,
		name: text(app.signature_name),
		signedBy: text(app.signed_by),
		imagePath: text(app.signature_image_path),
	}
}

function metaFor(formType) {
	const service = getServiceFormByKey(formType)
	return {
		formName: service?.formName || 'Service form',
		formTitle: service?.matter || 'APPLICATION',
		scheduleRef: service?.rule ? `[See ${service.rule}]` : '',
		authority: service?.groupTitle || 'Authority',
		viewerLabel: service
			? `Submitted form · ${service.formName}`
			: 'Submitted form',
	}
}

function buildFormI(app) {
	return {
		...metaFor(APPLICATION_TYPES.RENT_REVISION),
		addressee: ['To,', 'The Rent Authority', text(app.district?.name) || '________________________'],
		rows: rowsFrom([
			row(1, 'Unique Identification Number (UIN) of the tenancy', app.tenancy_uin),
			row(
				2,
				'Document No. of tenancy agreement (before Sub-Registrar, if any)',
				app.tenancy_agreement_document_no
			),
			row(3, 'Name and address of the landlord', joinParts(app.landlord_name, app.landlord_address)),
			row(4, 'Name and address of the tenant', joinParts(app.tenant_name, app.tenant_address)),
			row(
				5,
				'Name and address of the Property Manager (if any)',
				joinParts(app.manager_name, app.manager_address)
			),
			row(6, 'Description of the rented premises', app.rented_premises_description),
			row(7, 'Present monthly rent', money(app.present_monthly_rent)),
			row(8, 'Proposed monthly rent', money(app.proposed_monthly_rent)),
			row(9, 'Reason for revision or fixation of rent', app.reason_for_rent_revision),
		]),
		signature: signatureBlock(app, 'Signature of landlord / tenant / property manager'),
	}
}

function buildFormIA(app) {
	return {
		...metaFor(APPLICATION_TYPES.OTHER_CHARGES_REVISION),
		addressee: ['To,', 'The Rent Authority', text(app.district?.name) || '________________________'],
		rows: rowsFrom([
			row(1, 'Unique Identification Number (UIN) of the tenancy', app.tenancy_uin),
			row(
				2,
				'Document No. of tenancy agreement (before Sub-Registrar, if any)',
				app.tenancy_agreement_document_no
			),
			row(3, 'Name and address of the landlord', joinParts(app.landlord_name, app.landlord_address)),
			row(4, 'Name and address of the tenant', joinParts(app.tenant_name, app.tenant_address)),
			row(
				5,
				'Name and address of the Property Manager (if any)',
				joinParts(app.manager_name, app.manager_address)
			),
			row(6, 'Description of the rented premises', app.rented_premises_description),
			row(7, 'Existing other charges', app.existing_other_charges_details),
			row(8, 'Proposed other charges', app.proposed_other_charges_details),
			row(9, 'Reason for revision or fixation of other charges', app.reason_for_other_charges_revision),
		]),
		signature: signatureBlock(app, 'Signature of landlord / tenant / property manager'),
	}
}

function buildFormIB(app) {
	const districtText =
		typeof app.district === 'string' ? app.district : text(app.district?.name)
	return {
		...metaFor(APPLICATION_TYPES.VALUER_APPOINTMENT),
		addressee: ['To,', 'The Rent Authority', districtText || '________________________'],
		rows: rowsFrom([
			row(1, 'Unique Identification Number (UIN) of the tenancy', app.tenancy_uin),
			row(
				2,
				'Name of the applicant',
				joinParts(
					app.applicant_name,
					app.applicant_relation_type
						? `${text(app.applicant_relation_type)} of ${text(app.applicant_relation_target_name)}`
						: '',
					app.applicant_resident_place ? `resident of ${text(app.applicant_resident_place)}` : ''
				)
			),
			row(3, 'Whether landlord or tenant', app.applicant_landlord_or_tenant),
			row(4, 'Premises situated at', app.premises_situated_address),
			row(5, 'District', districtText),
		]),
		signature: signatureBlock(app),
	}
}

function buildFormII(app) {
	return {
		...metaFor(APPLICATION_TYPES.RENT_COURT_POSSESSION),
		addressee: [
			'Before the Rent Court',
			text(app.before_rent_court) || '________________________',
		],
		rows: rowsFrom([
			row(1, 'Unique Identification Number (UIN) of the tenancy', app.tenancy_uin),
			row(2, 'Name of the tenant', app.tenant_name),
			row(
				3,
				'Name and residential address of the applicant',
				joinParts(app.applicant_name, app.applicant_residential_address)
			),
			row(4, 'Jurisdiction of the Rent Court', app.jurisdiction_statement),
			row(5, 'Facts of the case', app.facts_of_case),
			row(6, 'Grounds for relief', app.grounds_for_relief),
			row(
				7,
				'Matters not previously filed or pending',
				app.matters_not_previously_filed || app.matters_not_previously_filed_or_pending
			),
			row(8, 'Relief sought', app.relief_sought),
			row(9, 'Interim order, if any, sought', app.interim_order_sought),
			row(10, 'List of enclosures', app.enclosures_list || app.list_of_enclosures),
		]),
		signature: signatureBlock(app),
	}
}

function buildFormIII(app) {
	return {
		...metaFor(APPLICATION_TYPES.RENT_COURT_FILING),
		addressee: ['Before the Rent Court at', text(app.rent_court_at) || '________________________'],
		rows: rowsFrom([
			row(1, 'Unique Identification Number (UIN) of the tenancy', app.tenancy_uin),
			row(
				2,
				'Name and residential address of the applicant',
				joinParts(app.applicant_name, app.applicant_residential_address)
			),
			row(
				3,
				'Name and residential address of the respondent',
				joinParts(app.respondent_name, app.respondent_residential_address)
			),
			row(4, 'Particulars of the application', app.particulars_of_application),
			row(5, 'Jurisdiction of the Rent Court', app.jurisdiction_of_rent_court),
			row(6, 'Facts of the case', app.facts_of_case),
			row(7, 'Grounds for relief', app.grounds_for_relief),
			row(
				8,
				'Matters not previously filed or pending',
				app.matters_not_previously_filed_or_pending
			),
			row(9, 'Relief sought', app.relief_sought),
			row(10, 'Interim order, if any, sought', app.interim_order_sought),
			row(11, 'List of enclosures', app.list_of_enclosures),
		]),
		signature: signatureBlock(app),
	}
}

function buildFormIV(app) {
	return {
		...metaFor(APPLICATION_TYPES.RENT_AUTHORITY_FILING),
		addressee: ['To,', 'The Rent Authority', text(app.district?.name) || '________________________'],
		rows: rowsFrom([
			row(1, 'Unique Identification Number (UIN) of the tenancy', app.tenancy_uin),
			row(
				2,
				'Name and residential address of the applicant',
				joinParts(app.applicant_name, app.applicant_residential_address)
			),
			row(
				3,
				'Name and residential address of the opposite party',
				joinParts(app.opposite_party_name, app.opposite_party_residential_address)
			),
			row(4, 'Particulars of the violation', app.particulars_of_violation),
			row(5, 'Jurisdiction of the Rent Authority', app.jurisdiction_of_rent_authority),
			row(6, 'Facts of the case', app.facts_of_case),
			row(7, 'Grounds for relief', app.grounds_for_relief),
			row(
				8,
				'Matters not previously filed or pending',
				app.matters_not_previously_filed_or_pending
			),
			row(9, 'Relief sought', app.relief_sought),
			row(10, 'Interim order, if any, sought', app.interim_order_sought),
			row(11, 'List of enclosures', app.list_of_enclosures),
		]),
		signature: signatureBlock(app),
	}
}

function buildFormV(app) {
	return {
		...metaFor(APPLICATION_TYPES.RENT_COURT_APPEAL),
		addressee: ['Before the Rent Court at', text(app.rent_court_at) || '________________________'],
		rows: rowsFrom([
			row(1, 'Unique Identification Number (UIN) of the tenancy', app.tenancy_uin),
			row(
				2,
				'Name and residential address of the appellant',
				joinParts(app.appellant_name, app.appellant_residential_address)
			),
			row(
				3,
				'Name and residential address of the respondent',
				joinParts(app.respondent_name, app.respondent_residential_address)
			),
			row(
				4,
				'Particulars of the order against which appeal is made',
				app.order_particulars_against_which_appeal_made
			),
			row(5, 'Jurisdiction of the Rent Court', app.jurisdiction_of_rent_court),
			row(6, 'Limitation', app.limitation),
			row(7, 'Memorandum of appeal', app.memorandum_of_appeal),
			row(
				8,
				'Matters not previously filed or pending',
				app.matters_not_previously_filed_or_pending
			),
			row(9, 'Relief sought', app.relief_sought),
			row(10, 'Interim order, if any, sought', app.interim_order_sought),
			row(11, 'List of enclosures', app.list_of_enclosures),
		]),
		signature: signatureBlock(app, 'Signature of appellant'),
	}
}

function buildFormVI(app) {
	return {
		...metaFor(APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL),
		addressee: [
			'Before the Rent Tribunal at',
			text(app.rent_tribunal_at) || '________________________',
		],
		rows: rowsFrom([
			row(1, 'Unique Identification Number (UIN) of the tenancy', app.tenancy_uin),
			row(
				2,
				'Name and residential address of the appellant',
				joinParts(app.appellant_name, app.appellant_residential_address)
			),
			row(
				3,
				'Name and residential address of the respondent',
				joinParts(app.respondent_name, app.respondent_residential_address)
			),
			row(
				4,
				'Particulars of the order against which appeal is made',
				app.order_particulars_against_which_appeal_made
			),
			row(5, 'Jurisdiction of the Rent Tribunal', app.jurisdiction_of_rent_tribunal),
			row(6, 'Limitation', app.limitation),
			row(7, 'Memorandum of appeal', app.memorandum_of_appeal),
			row(
				8,
				'Matters not previously filed or pending',
				app.matters_not_previously_filed_or_pending
			),
			row(9, 'Relief sought', app.relief_sought),
			row(10, 'Interim order, if any, sought', app.interim_order_sought),
			row(11, 'List of enclosures', app.list_of_enclosures),
		]),
		signature: signatureBlock(app, 'Signature of appellant'),
	}
}

const BUILDERS = {
	[APPLICATION_TYPES.RENT_REVISION]: buildFormI,
	[APPLICATION_TYPES.OTHER_CHARGES_REVISION]: buildFormIA,
	[APPLICATION_TYPES.VALUER_APPOINTMENT]: buildFormIB,
	[APPLICATION_TYPES.RENT_COURT_POSSESSION]: buildFormII,
	[APPLICATION_TYPES.RENT_COURT_FILING]: buildFormIII,
	[APPLICATION_TYPES.RENT_AUTHORITY_FILING]: buildFormIV,
	[APPLICATION_TYPES.RENT_COURT_APPEAL]: buildFormV,
	[APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL]: buildFormVI,
}

/**
 * Build a statutory-style submitted form document model for Super Admin preview.
 * @param {object} application
 */
export function buildServiceFormDocument(application) {
	if (!application?.form_type) return null
	const builder = BUILDERS[application.form_type]
	if (!builder) return null

	const doc = builder(application)
	return {
		...doc,
		submittedOn: formatDate(application.created_at) || '',
		applicationNo: text(application.application_no),
	}
}
