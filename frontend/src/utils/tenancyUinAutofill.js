import { APPLICATION_TYPES } from '../constants/application'

function fill(setter, value) {
	if (!setter || value === null || value === undefined) return 0
	const text = String(value).trim()
	if (!text) return 0
	setter(text)
	return 1
}

export function getPartySides(tenancy, userProfileType) {
	const profileType = String(userProfileType || '').toUpperCase()
	const isTenant = profileType === 'TENANT'

	if (isTenant) {
		return {
			self: { name: tenancy.tenant_name, address: tenancy.tenant_address },
			other: { name: tenancy.landlord_name, address: tenancy.landlord_address },
			selfRole: 'tenant',
		}
	}

	return {
		self: { name: tenancy.landlord_name, address: tenancy.landlord_address },
		other: { name: tenancy.tenant_name, address: tenancy.tenant_address },
		selfRole: 'landlord',
	}
}

export function formatJurisdiction(tenancy) {
	const office = tenancy.office?.name
	const district = tenancy.district?.name
	return [office, district].filter(Boolean).join(', ')
}

export function formatOtherCharges(tenancy) {
	const lines = []
	if (tenancy.property_charge_electricity) {
		lines.push(`Electricity: ₹${tenancy.property_charge_electricity}`)
	}
	if (tenancy.property_charge_water) {
		lines.push(`Water: ₹${tenancy.property_charge_water}`)
	}
	if (tenancy.property_charge_furnishing) {
		lines.push(`Furnishing / fittings: ₹${tenancy.property_charge_furnishing}`)
	}
	if (tenancy.property_charge_other_services) {
		lines.push(`Other services: ₹${tenancy.property_charge_other_services}`)
	}
	return lines.join('\n')
}

function applyLandlordTenantManager(tenancy, setters) {
	let count = 0
	count += fill(setters.setLandlordName, tenancy.landlord_name)
	count += fill(setters.setLandlordAddress, tenancy.landlord_address)
	count += fill(setters.setTenantName, tenancy.tenant_name)
	count += fill(setters.setTenantAddress, tenancy.tenant_address)
	count += fill(setters.setManagerName, tenancy.manager_name)
	count += fill(setters.setManagerAddress, tenancy.manager_address)
	return count
}

function applyApplicantOpposite(tenancy, user, setters) {
	const sides = getPartySides(tenancy, user?.profile_type)
	let count = 0
	count += fill(setters.setApplicantName, sides.self.name)
	count += fill(setters.setApplicantResidentialAddress, sides.self.address)
	count += fill(setters.setOppositePartyName, sides.other.name)
	count += fill(setters.setOppositePartyResidentialAddress, sides.other.address)
	count += fill(setters.setRespondentName, sides.other.name)
	count += fill(setters.setRespondentResidentialAddress, sides.other.address)
	count += fill(setters.setAppellantName, sides.self.name)
	count += fill(setters.setAppellantResidentialAddress, sides.self.address)
	count += fill(setters.setSignatureName, sides.self.name)
	count += fill(setters.setVerificationAddress, sides.self.address)
	return count
}

export function applyTenancyAutofill(formType, tenancy, user, setters) {
	if (!tenancy) return 0

	let count = 0
	const jurisdiction = formatJurisdiction(tenancy)
	const districtName = tenancy.district?.name || ''

	count += fill(setters.setTenancyUIN, tenancy.uid)

	switch (formType) {
		case APPLICATION_TYPES.RENT_REVISION:
			count += applyLandlordTenantManager(tenancy, setters)
			count += fill(setters.setRentedPremisesDescription, tenancy.property_premises_description)
			count += fill(setters.setPresentMonthlyRent, tenancy.property_rent_payable)
			break

		case APPLICATION_TYPES.OTHER_CHARGES_REVISION:
			count += applyLandlordTenantManager(tenancy, setters)
			count += fill(setters.setRentedPremisesDescription, tenancy.property_premises_description)
			count += fill(setters.setExistingOtherChargesDetails, formatOtherCharges(tenancy))
			break

		case APPLICATION_TYPES.VALUER_APPOINTMENT: {
			const sides = getPartySides(tenancy, user?.profile_type)
			count += fill(setters.setApplicantName, sides.self.name)
			count += fill(setters.setApplicantResidentPlace, sides.self.address)
			count += fill(setters.setApplicantLandlordOrTenant, sides.selfRole)
			count += fill(setters.setPremisesSituatedAddress, tenancy.property_premises_description)
			count += fill(setters.setDistrict, districtName)
			count += fill(setters.setSignedBy, sides.selfRole)
			count += fill(setters.setSignatureName, sides.self.name)
			break
		}

		case APPLICATION_TYPES.RENT_COURT_POSSESSION:
			count += applyApplicantOpposite(tenancy, user, setters)
			count += fill(setters.setTenantName, tenancy.tenant_name)
			count += fill(setters.setBeforeRentCourt, districtName)
			count += fill(setters.setJurisdictionStatement, jurisdiction)
			break

		case APPLICATION_TYPES.RENT_COURT_FILING:
			count += applyApplicantOpposite(tenancy, user, setters)
			count += fill(setters.setRentCourtAt, districtName)
			count += fill(setters.setJurisdictionOfRentCourt, jurisdiction)
			break

		case APPLICATION_TYPES.RENT_AUTHORITY_FILING:
			count += applyApplicantOpposite(tenancy, user, setters)
			count += fill(setters.setJurisdictionOfRentAuthority, jurisdiction)
			break

		case APPLICATION_TYPES.RENT_COURT_APPEAL:
			count += applyApplicantOpposite(tenancy, user, setters)
			count += fill(setters.setRentCourtAt, districtName)
			count += fill(setters.setJurisdictionOfRentCourt, jurisdiction)
			break

		case APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL:
			count += applyApplicantOpposite(tenancy, user, setters)
			count += fill(setters.setRentTribunalAt, districtName)
			count += fill(setters.setJurisdictionOfRentTribunal, jurisdiction)
			break

		default:
			break
	}

	return count
}
