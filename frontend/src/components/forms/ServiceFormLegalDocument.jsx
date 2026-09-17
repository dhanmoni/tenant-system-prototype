import { APPLICATION_TYPES } from '../../constants/application'
import { PARA_ANSWER } from '../../constants/declarations'
import { getServiceFormByKey } from '../../data/tenantServices'
import FormILegalDocument from './FormILegalDocument'
import FormIALegalDocument from './FormIALegalDocument'
import FormIBLegalDocument from './FormIBLegalDocument'
import FormIILegalDocument from './FormIILegalDocument'
import FormIIILegalDocument from './FormIIILegalDocument'
import FormIVLegalDocument from './FormIVLegalDocument'
import FormVLegalDocument from './FormVLegalDocument'
import FormVILegalDocument from './FormVILegalDocument'

function text(value) {
	if (value === null || value === undefined) return ''
	if (typeof value === 'object') {
		if (value?.name) return String(value.name).trim()
		return ''
	}
	return String(value).trim()
}

function asArray(value) {
	if (Array.isArray(value)) return value
	if (value === null || value === undefined || value === '') return []
	if (typeof value === 'string') {
		try {
			const parsed = JSON.parse(value)
			return Array.isArray(parsed) ? parsed : []
		} catch {
			return []
		}
	}
	return []
}

function asBool(value) {
	if (value === true || value === 1 || value === '1' || value === 'true') return true
	if (value === false || value === 0 || value === '0' || value === 'false') return false
	return Boolean(value)
}

function districtName(app) {
	if (!app?.district) return ''
	if (typeof app.district === 'string') return app.district.trim()
	return text(app.district.name)
}

function authorityLines(app) {
	const name = districtName(app)
	return {
		line1: name ? `Rent Authority — ${name}` : 'Rent Authority',
		line2: name ? `District: ${name}` : '',
	}
}

function verificationFromApp(app) {
	const paragraphs = {}
	asArray(app.verification_personal_knowledge_paras).forEach((n) => {
		paragraphs[Number(n)] = PARA_ANSWER.PERSONAL_KNOWLEDGE
	})
	asArray(app.verification_legal_advice_paras).forEach((n) => {
		paragraphs[Number(n)] = PARA_ANSWER.LEGAL_ADVICE
	})
	return {
		name: app.verification_name,
		relation: app.verification_relation,
		relativeName: app.verification_relative_name,
		age: app.verification_age,
		address: app.verification_address,
		place: app.verification_place,
		paragraphs,
	}
}

function signatureImage(app) {
	return text(app.signature_image_url) || null
}

/**
 * Gazette sheet for a filed service application (citizen / admin View).
 */
export default function ServiceFormLegalDocument({ application, formType }) {
	if (!application) return null

	const type = formType || application.form_type
	const authority = authorityLines(application)
	const signature = signatureImage(application)
	const verification = verificationFromApp(application)
	const priorProceedings = asArray(application.prior_proceedings)
	const hasPrior = asBool(application.has_prior_proceedings)

	switch (type) {
		case APPLICATION_TYPES.RENT_REVISION:
			return (
				<FormILegalDocument
					tenancyUIN={application.tenancy_uin}
					tenancyAgreementDocumentNo={application.tenancy_agreement_document_no}
					landlordName={application.landlord_name}
					landlordAddress={application.landlord_address}
					tenantName={application.tenant_name}
					tenantAddress={application.tenant_address}
					managerName={application.manager_name}
					managerAddress={application.manager_address}
					rentedPremisesDescription={application.rented_premises_description}
					presentMonthlyRent={application.present_monthly_rent}
					proposedMonthlyRent={application.proposed_monthly_rent}
					reasonForRentRevision={application.reason_for_rent_revision}
					signatureName={application.signature_name}
					signatureImage={signature}
					signedBy={application.signed_by}
					authorityLine1={authority.line1}
					authorityLine2={authority.line2}
				/>
			)
		case APPLICATION_TYPES.OTHER_CHARGES_REVISION:
			return (
				<FormIALegalDocument
					tenancyUIN={application.tenancy_uin}
					tenancyAgreementDocumentNo={application.tenancy_agreement_document_no}
					landlordName={application.landlord_name}
					landlordAddress={application.landlord_address}
					tenantName={application.tenant_name}
					tenantAddress={application.tenant_address}
					managerName={application.manager_name}
					managerAddress={application.manager_address}
					rentedPremisesDescription={application.rented_premises_description}
					existingOtherChargesDetails={application.existing_other_charges_details}
					proposedOtherChargesDetails={application.proposed_other_charges_details}
					reasonForOtherChargesRevision={application.reason_for_other_charges_revision}
					signatureName={application.signature_name}
					signatureImage={signature}
					signedBy={application.signed_by}
					authorityLine1={authority.line1}
					authorityLine2={authority.line2}
				/>
			)
		case APPLICATION_TYPES.VALUER_APPOINTMENT:
			return (
				<FormIBLegalDocument
					tenancyUIN={application.tenancy_uin}
					applicantName={application.applicant_name}
					applicantRelationType={application.applicant_relation_type}
					applicantRelationTargetName={application.applicant_relation_target_name}
					applicantResidentPlace={application.applicant_resident_place}
					applicantLandlordOrTenant={application.applicant_landlord_or_tenant}
					premisesSituatedAddress={application.premises_situated_address}
					district={districtName(application)}
					signatureName={application.signature_name}
					signatureImage={signature}
					authorityLine1={authority.line1}
					authorityLine2={authority.line2}
				/>
			)
		case APPLICATION_TYPES.RENT_COURT_POSSESSION:
			return (
				<FormIILegalDocument
					tenancyUIN={application.tenancy_uin}
					beforeRentCourt={application.before_rent_court}
					applicantName={application.applicant_name}
					applicantResidentialAddress={application.applicant_residential_address}
					tenantName={application.tenant_name}
					premisesSituatedAt={application.tenant_residential_address}
					statutoryBasis={application.statutory_basis}
					evictionGrounds={asArray(application.eviction_grounds)}
					particularsOfApplication={application.particulars_of_application}
					jurisdictionAccepted={Boolean(text(application.jurisdiction_statement))}
					factsOfCase={application.facts_of_case}
					groundsForRelief={application.grounds_for_relief}
					hasPriorProceedings={hasPrior}
					priorProceedings={priorProceedings}
					reliefSought={application.relief_sought}
					interimOrderSought={application.interim_order_sought}
					listOfEnclosures={application.enclosures_list}
					verification={verification}
					signatureName={application.signature_name}
					signatureImage={signature}
					verifiedOn={application.verified_on}
				/>
			)
		case APPLICATION_TYPES.RENT_COURT_FILING:
			return (
				<FormIIILegalDocument
					tenancyUIN={application.tenancy_uin}
					beforeRentCourt={application.rent_court_at}
					applicantName={application.applicant_name}
					applicantResidentialAddress={application.applicant_residential_address}
					respondentName={application.respondent_name}
					respondentResidentialAddress={application.respondent_residential_address}
					particularsOfApplication={application.particulars_of_application}
					jurisdictionAccepted={Boolean(text(application.jurisdiction_of_rent_court))}
					factsOfCase={application.facts_of_case}
					groundsForRelief={application.grounds_for_relief}
					hasPriorProceedings={hasPrior}
					priorProceedings={priorProceedings}
					reliefSought={application.relief_sought}
					interimOrderSought={application.interim_order_sought}
					listOfEnclosures={application.list_of_enclosures}
					verification={verification}
					signatureName={application.signature_name}
					signatureImage={signature}
					verifiedOn={application.verified_on}
				/>
			)
		case APPLICATION_TYPES.RENT_AUTHORITY_FILING:
			return (
				<FormIVLegalDocument
					tenancyUIN={application.tenancy_uin}
					applicantName={application.applicant_name}
					applicantResidentialAddress={application.applicant_residential_address}
					oppositePartyName={application.opposite_party_name}
					oppositePartyResidentialAddress={application.opposite_party_residential_address}
					statutoryMatter={application.statutory_matter}
					repairItems={asArray(application.repair_items)}
					essentialServices={asArray(application.essential_services)}
					essentialServiceOther={application.essential_service_other}
					particularsOfViolation={application.particulars_of_violation}
					jurisdictionAccepted={Boolean(text(application.jurisdiction_of_rent_authority))}
					factsOfCase={application.facts_of_case}
					groundsForRelief={application.grounds_for_relief}
					hasPriorProceedings={hasPrior}
					priorProceedings={priorProceedings}
					reliefSought={application.relief_sought}
					interimOrderSought={application.interim_order_sought}
					listOfEnclosures={application.list_of_enclosures}
					verification={verification}
					signatureName={application.signature_name}
					signatureImage={signature}
					authorityLine1={authority.line1}
					authorityLine2={authority.line2}
					verifiedOn={application.verified_on}
				/>
			)
		case APPLICATION_TYPES.RENT_COURT_APPEAL:
			return (
				<FormVLegalDocument
					tenancyUIN={application.tenancy_uin}
					beforeRentCourt={application.rent_court_at}
					appellantName={application.appellant_name}
					appellantResidentialAddress={application.appellant_residential_address}
					respondentName={application.respondent_name}
					respondentResidentialAddress={application.respondent_residential_address}
					particularsOfOrder={application.order_particulars_against_which_appeal_made}
					jurisdictionAccepted={Boolean(text(application.jurisdiction_of_rent_court))}
					limitationAccepted={Boolean(text(application.limitation))}
					memorandumOfAppeal={application.memorandum_of_appeal}
					hasPriorProceedings={hasPrior}
					priorProceedings={priorProceedings}
					reliefSought={application.relief_sought}
					interimOrderSought={application.interim_order_sought}
					listOfEnclosures={application.list_of_enclosures}
					verification={verification}
					signatureName={application.signature_name}
					signatureImage={signature}
					verifiedOn={application.verified_on}
				/>
			)
		case APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL:
			return (
				<FormVILegalDocument
					tenancyUIN={application.tenancy_uin}
					beforeRentTribunal={application.rent_tribunal_at}
					appellantName={application.appellant_name}
					appellantResidentialAddress={application.appellant_residential_address}
					respondentName={application.respondent_name}
					respondentResidentialAddress={application.respondent_residential_address}
					particularsOfOrder={application.order_particulars_against_which_appeal_made}
					jurisdictionAccepted={Boolean(text(application.jurisdiction_of_rent_tribunal))}
					limitationAccepted={Boolean(text(application.limitation))}
					memorandumOfAppeal={application.memorandum_of_appeal}
					hasPriorProceedings={hasPrior}
					priorProceedings={priorProceedings}
					reliefSought={application.relief_sought}
					interimOrderSought={application.interim_order_sought}
					listOfEnclosures={application.list_of_enclosures}
					verification={verification}
					signatureName={application.signature_name}
					signatureImage={signature}
					verifiedOn={application.verified_on}
				/>
			)
		default:
			return null
	}
}

export function serviceFormViewerLabel(formType) {
	const service = getServiceFormByKey(formType)
	if (!service) return 'Submitted form'
	return `Submitted form · ${service.formName}`
}

export function serviceFormName(formType) {
	return getServiceFormByKey(formType)?.formName || 'Service form'
}
