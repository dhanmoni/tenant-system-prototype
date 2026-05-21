/**
 * Public-facing portal services copy — homepage highlights and /services page sections.
 */
import { getTenancyAuthoritiesByHierarchy, tenantServiceGroups } from './tenantServices'

const authorityHighlightTaglines = {
	'rent-tribunal': 'Highest level',
	'rent-court': 'Second level',
	'rent-authority': 'First level',
}

function toAuthorityHighlight(group) {
	return {
		id: group.id,
		title: group.title,
		shortLabel: group.title.replace('Rent ', ''),
		tagline: authorityHighlightTaglines[group.id],
		description: group.description,
		accent: `portal-services-showcase-card--${group.id.replace('rent-', '')}`,
	}
}

/** Homepage showcase: UIN first, then authorities top → bottom (Tribunal → Court → Authority). */
export const portalServiceHighlights = [
	{
		id: 'uin',
		title: 'UIN & tenancy certificate',
		shortLabel: 'UIN',
		tagline: 'Start here',
		description: 'Register your tenancy and obtain a Unique Identification Number (UIN).',
		accent: 'portal-services-showcase-card--uin',
	},
	...getTenancyAuthoritiesByHierarchy().map(toAuthorityHighlight),
]

export const portalServicesIntro = {
	eyebrow: 'Portal services',
	title: 'Portal services',
	lead:
		'This portal provides registration and services with the Rent Authority, Rent Court, and Rent Tribunal.',
}

/** Dedicated /services page — readable citizen guide (not homepage showcase). */
export const servicesPageIntro = {
	// eyebrow: 'Citizen guide',
	title: 'Portal services',
	lead:
		'Read below to understand which online service applies to your situation, what each authority does, and how to file after you sign in. Matters are listed in the order most citizens follow — from tenancy registration through the Rent Authority, Rent Court, and Rent Tribunal.',
}

export const portalServiceSections = [
	{
		id: 'uin-registration',
		title: 'Tenancy registration & UIN',
		subtitle: 'Mandatory first step for most landlords and tenants',
		when:
			'When you enter into a tenancy agreement in Assam, or need an official record of rent, parties, and property details for banks, employers, or government processes.',
		why:
			'A registered tenancy and UIN create a verifiable record before the Rent Authority. It helps both parties prove terms, track status online, and download acknowledgement when approved.',
		how: [
			'Create a citizen account with mobile OTP verification.',
			'Open Apply for UIN from your dashboard and complete the tenancy information form.',
			'Upload required documents (agreement, ID, property details as applicable).',
			'Submit and note your application number — track status under UIN Status.',
			'Download your UIN acknowledgement once the Rent Authority approves the application.',
		],
		cta: { label: 'Apply after sign-in', hash: '/#login' },
	},
	{
		id: 'rent-tribunal',
		groupId: 'rent-tribunal',
		title: 'Rent Tribunal services',
		// subtitle: 'District Judge or Additional District Judge — Section 34 (highest level)',
		when:
			'When you are aggrieved by an order of the Rent Court and wish to file a further appeal.',
		why:
			'The Rent Tribunal is the highest forum under the Act and provides appellate review of Rent Court orders.',
		how: [
			'Obtain the Rent Court order you wish to challenge.',
			'Sign in, open All services, choose Rent Tribunal, and complete your appeal application.',
			'Submit with grounds and supporting documents.',
			'Track the appeal status from your dashboard.',
		],
	},
	{
		id: 'rent-court',
		groupId: 'rent-court',
		title: 'Rent Court services',
		// subtitle: 'ADC or equivalent — Section 33 (second level)',	
		when:
			'When you seek recovery or eviction of premises, or wish to appeal an order passed by the Rent Authority.',
		why:
			'The Rent Court sits above the Rent Authority and hears possession, eviction, and appeals against Rent Authority orders.',
		how: [
			'Confirm whether your matter belongs here (possession, eviction, or appeal against Rent Authority order).',
			'Sign in, open All services, select Rent Court, and open the relevant service.',
			'Reference your earlier Rent Authority order or UIN where required.',
			'Submit and monitor status online.',
		],
	},
	{
		id: 'rent-authority',
		groupId: 'rent-authority',
		title: 'Rent Authority services',
		// subtitle: 'Circle Officer or equivalent — Section 30 (first level)',
		when:
			'When you need to revise or fix rent or other charges, appoint a valuer, or raise disputes on rent, deposits, repairs, or withholding — before going to court.',
		why:
			'The Rent Authority is the first level for most tenancy matters. Many cases start here before escalation to the Rent Court.',
		how: [
			'Sign in and open All services, then Rent Authority.',
			'Choose the service that matches your matter (rent revision, other charges, valuer, or disputes).',
			'Fill the application, attach supporting documents, and submit.',
			'Track processing from UIN Status or your dashboard.',
		],
	},
]

export const serviceEscalationGuide = {
	title: 'Which authority should I use?',
	lead:
		'Most matters follow a clear path. Start with registration, then the Rent Authority; only move to Court or Tribunal when the Act and your situation require it.',
	steps: [
		{
			step: '1',
			title: 'Register the tenancy',
			text: 'Apply for a UIN unless you only need a specific dispute form and already have a registered record.',
		},
		{
			step: '2',
			title: 'Rent Authority',
			text: 'Rent revision, other charges, valuer appointment, and Rule 11 disputes (rent, deposit, repair, withholding).',
		},
		{
			step: '3',
			title: 'Rent Court',
			text: 'Recovery of possession, eviction, or appeal against a Rent Authority order.',
		},
		{
			step: '4',
			title: 'Rent Tribunal',
			text: 'Appeal against a Rent Court order (Form VI).',
		},
	],
}

/** Forms list for dedicated page anchors */
export function getPortalFormsByGroup(groupId) {
	const group = tenantServiceGroups.find((g) => g.id === groupId)
	return group?.forms ?? []
}
