/**
 * Statutory basis and grounds for Form II (recovery of possession), mirroring
 * backend/app/Constants/EvictionGrounds.php.
 *
 * Form II's recital reads "In accordance with sub-section (2) of section 21 or section 22 of the
 * Act, I hereby request the Rent Court for recovery of possession of the premises on following
 * ground:" followed by three blank lines. The grounds are a closed statutory list, so they are
 * selected rather than typed.
 *
 * The printed form's three lines are a typographic convenience: section 21(2) allows an order "on
 * one or more of the following grounds" and lists eight. No cap of three is applied.
 */

export const EVICTION_BASIS = {
	SECTION_21_2: 'ATA2021.s21.2',
	SECTION_22: 'ATA2021.s22',
}

export const EVICTION_BASIS_OPTIONS = [
	{
		value: EVICTION_BASIS.SECTION_21_2,
		citation: 'Section 21(2)',
		label: 'Recovery by the landlord during the continuance of the tenancy',
		note:
			'The Rent Court may, on an application made to it by the landlord, make an order for eviction and recovery of possession of the premises on one or more of the following grounds.',
	},
	{
		value: EVICTION_BASIS.SECTION_22,
		citation: 'Section 22',
		label: 'Bonafide requirement by the legal heirs of a deceased landlord',
		note:
			'In case of death of the landlord, where there is a bonafide requirement of the premises let out on rent by the legal heirs of the landlord during the period of tenancy, such legal heirs may file an application for eviction and recovery of possession before the Rent Court.',
	},
]

/**
 * Clauses (a) to (h) of section 21(2), transcribed from the Act as printed in the Assam Gazette
 * Extraordinary, 1 October 2021, pp. 2631-2633.
 */
export const EVICTION_GROUND_CLAUSES = [
	{
		value: 'a',
		citation: 'Section 21(2)(a)',
		label: 'Refusal to pay revised rent',
		text: 'that the tenant does not agree to pay the rent payable under section 8;',
	},
	{
		value: 'b',
		citation: 'Section 21(2)(b)',
		label: 'Non-payment of arrears of rent',
		text:
			'that the tenant has not paid the arrears of rent and other charges payable in full as specified in sub-section (1) of section 13 for two consecutive months, including interest for delayed payment as may be specified in the tenancy agreement within a period of one month from the date of service of notice of demand for payment of such arrears of rent and other charges payable to the landlord in the manner provided in sub-section (4) of section 106 of the Transfer of Property Act, 1882;',
	},
	{
		value: 'c',
		citation: 'Section 21(2)(c)',
		label: 'Subletting without consent',
		text:
			'that the tenant has, after the commencement of this Act, parted with the possession of whole or any part of the premises without obtaining the written consent of the landlord;',
	},
	{
		value: 'd',
		citation: 'Section 21(2)(d)',
		label: 'Misuse of premises',
		text:
			'that the tenant has continued to misuse the premises even after receipt of notice from the landlord to desist from such misuse;',
		explanation:
			'Explanation.- For the purposes of this clause, "misuse of premises" means encroachment of additional space by the tenant or use of premises which causes public nuisance or causes damage to the property or is detrimental to the interest of the landlord or for immoral or illegal purposes.',
	},
	{
		value: 'e',
		citation: 'Section 21(2)(e)',
		label: 'Repairs requiring vacant possession',
		text:
			'where it is necessary for the landlord to carry out any repair or construction or rebuilding or addition or alteration or demolition in respect of the premises or any part thereof, which is not possible to be carried out without the premises being vacated;',
	},
	{
		value: 'f',
		citation: 'Section 21(2)(f)',
		label: 'Redevelopment or change of land use',
		text:
			'that the premises or any part thereof is required by the landlord for carrying out any repairs, construction, rebuilding, additions, alterations or demolition, for change of its use as a consequence of change of land use by the competent authority;',
		explanation:
			'Explanation.- For the purposes of this clause, the expression "competent authority" means the Municipal Corporation or the Municipality or the Development Authority or any other authority, as the case may be, which provides permission on matters relating to repair or redevelopment or demolition of building or permission for change in land use.',
	},
	{
		value: 'g',
		citation: 'Section 21(2)(g)',
		label: 'Landlord has contracted to sell',
		text:
			'that the landlord has given written notice to vacate the premises let out on rent and in consequence of that notice the landlord has contracted to sell the said premises or has taken any other step, as a result of which his interests would seriously suffer if he is not put in possession of that premises;',
	},
	{
		value: 'h',
		citation: 'Section 21(2)(h)',
		label: 'Unauthorized structural change',
		text:
			'that the tenant has carried out any structural change or erected any permanent structure in the premises let out on rent without the written consent of the landlord.',
	},
]

/** Short label for a selected clause, for previews and summaries. */
export function describeGround(clause) {
	const found = EVICTION_GROUND_CLAUSES.find((g) => g.value === clause)
	return found ? `${found.citation} — ${found.text}` : clause
}

export function describeBasis(basis) {
	const found = EVICTION_BASIS_OPTIONS.find((b) => b.value === basis)
	return found ? `${found.citation} — ${found.label}` : ''
}
