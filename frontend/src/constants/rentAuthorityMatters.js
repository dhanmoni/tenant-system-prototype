/**
 * The matters a Form IV application can be made under, mirroring
 * backend/app/Constants/RentAuthorityMatters.php.
 *
 * Rule 11(1): "An application made to the Rent Authority under sections 10, 14, 15 and 20 of the Act
 * shall be made by the applicant in FORM - IV accompanied by affidavits and documents, if any."
 *
 * Form IV asks only for "Particulars of violation against which the present application is made" and
 * never asks which of the four sections is invoked, even though what the Rent Authority does next
 * differs completely between them.
 */

export const RA_MATTER = {
	SECTION_10: 'ATA2021.s10',
	SECTION_14: 'ATA2021.s14',
	SECTION_15: 'ATA2021.s15',
	SECTION_20: 'ATA2021.s20',
}

export const RA_MATTER_OPTIONS = [
	{
		value: RA_MATTER.SECTION_10,
		citation: 'Section 10',
		heading: 'Dispute about revised rent',
		note:
			'In case of any dispute between the landlord and the tenant regarding revision of rent, the Rent Authority may, on an application made by the landlord or tenant, determine the revised rent and other charges payable by the tenant and also fix the date from which such revised rent becomes payable.',
	},
	{
		value: RA_MATTER.SECTION_14,
		citation: 'Section 14',
		heading: 'Deposit of rent with the Rent Authority',
		note:
			'Where the landlord refuses to accept rent and other charges payable or refuses to give a receipt, or where the tenant is unable to decide to whom the rent is payable, the tenant may deposit the rent with the Rent Authority, which shall enquire as to whom the rent is payable and pass orders as may deem fit.',
	},
	{
		value: RA_MATTER.SECTION_15,
		citation: 'Section 15',
		heading: 'Repair and maintenance of the property',
		note:
			'The landlord and the tenant shall keep the premises in as good a condition as at the commencement of the tenancy, except for normal wear and tear, and shall respectively be responsible to repair and maintain the premises as specified in the Second Schedule or as agreed to in the tenancy agreement.',
	},
	{
		value: RA_MATTER.SECTION_20,
		citation: 'Section 20',
		heading: 'Essential supply or service withheld',
		note:
			'No landlord or property manager shall withhold any essential supply or service in the premises occupied by the tenant. The Rent Authority may pass an interim order directing restoration immediately on service of the order, must complete the inquiry within one month of filing, and may award compensation not exceeding two months rent against the person responsible, or a penalty not exceeding twice the monthly rent if the application is found frivolous or vexatious.',
	},
]

/**
 * The Second Schedule to the Act [See section 15 (1)], transcribed from the Assam Gazette
 * Extraordinary, 1 October 2021, p. 2646.
 *
 * "Unless otherwise agreed in the tenancy agreement, the landlord shall be responsible for repairs
 * relating to the matters falling under Part A and the tenant shall be responsible for matters
 * falling under Part B."
 */
export const REPAIR_PARTS = [
	{
		part: 'A',
		title: 'Part A — Responsibilities of the Landlord',
		items: [
			{ code: 'A1', text: 'Structural repairs except those necessitated by the damage caused by the tenant.' },
			{ code: 'A2', text: 'Whitewashing of walls and painting of doors and windows.' },
			{ code: 'A3', text: 'Changing and plumbing pipes when necessary.' },
			{ code: 'A4', text: 'Internal and external wiring and related maintenance when necessary.' },
		],
	},
	{
		part: 'B',
		title: 'Part B — Periodic repairs to be got done by the tenant',
		items: [
			{ code: 'B1', text: 'Changing of tap washers and taps.' },
			{ code: 'B2', text: 'Drain cleaning.' },
			{ code: 'B3', text: 'Water closet repairs.' },
			{ code: 'B4', text: 'Wash Basin repairs.' },
			{ code: 'B5', text: 'Bath tub repairs.' },
			{ code: 'B6', text: 'Geyser repairs.' },
			{ code: 'B7', text: 'Circuit breaker repairs' },
			{ code: 'B8', text: 'Switches and socket repairs.' },
			{
				code: 'B9',
				text: 'Repairs and replacement of electrical equipment except major internal and external wiring changes.',
			},
			{ code: 'B10', text: 'Kitchen fixtures repairs.' },
			{ code: 'B11', text: 'Replacement of knobs and locks of doors, cupboard, windows etc.' },
			{ code: 'B12', text: 'Replacement of fly-nets.' },
			{ code: 'B13', text: 'Replacement of glass panels in windows, doors etc.' },
			{ code: 'B14', text: 'Maintenance of gardens and open spaces let out to or used by the tenant.' },
		],
	},
]

/**
 * Essential services, from the Explanation to section 20. The Explanation says "includes", so the
 * list is illustrative rather than exhaustive and an "other" entry is allowed.
 */
export const SERVICE_OTHER = 'other'

export const ESSENTIAL_SERVICES = [
	{ code: 'water', label: 'Supply of water' },
	{ code: 'electricity', label: 'Electricity' },
	{ code: 'piped_gas', label: 'Piped cooking gas supply' },
	{ code: 'passage_lights', label: 'Lights in passages' },
	{ code: 'lifts_staircase', label: 'Lifts and on staircase' },
	{ code: 'conservancy', label: 'Conservancy' },
	{ code: 'parking', label: 'Parking' },
	{ code: 'communication', label: 'Communication links' },
	{ code: 'sanitary', label: 'Sanitary services' },
	{ code: 'security', label: 'Security fixtures and features' },
	{ code: SERVICE_OTHER, label: 'Other essential service' },
]

const REPAIR_BY_CODE = Object.fromEntries(
	REPAIR_PARTS.flatMap((part) => part.items.map((item) => [item.code, item])),
)

export function describeMatter(value) {
	const found = RA_MATTER_OPTIONS.find((m) => m.value === value)
	return found ? `${found.citation} — ${found.heading}` : ''
}

export function describeRepairItem(code) {
	const found = REPAIR_BY_CODE[code]
	return found ? `${code} — ${found.text}` : code
}

export function describeService(code) {
	const found = ESSENTIAL_SERVICES.find((s) => s.code === code)
	return found ? found.label : code
}
