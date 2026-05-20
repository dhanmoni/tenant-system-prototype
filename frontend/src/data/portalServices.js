/**
 * Public-facing portal services copy — homepage highlights and /services page sections.
 */
import { tenantServiceGroups } from './tenantServices'

export const portalServiceHighlights = [
	{
		id: 'uin',
		title: 'UIN & tenancy certificate',
		shortLabel: 'UIN',
		tagline: 'Start here',
		description: 'Register your tenancy and obtain a Unique Identification Number (UIN).',
		accent: 'portal-services-showcase-card--uin',
	},
	...tenantServiceGroups.map((group) => ({
		id: group.id,
		title: group.title,
		shortLabel: group.title.replace('Rent ', ''),
		tagline:
			group.id === 'rent-authority'
				? 'First level'
				: group.id === 'rent-court'
					? 'Second level'
					: 'Appellate level',
		description: group.description,
		accent: `portal-services-showcase-card--${group.id.replace('rent-', '')}`,
	})),
]

export const portalServicesIntro = {
	eyebrow: 'Assam Tenancy Act',
	title: 'Services on this portal',
	lead:
		'From registering a tenancy to filing disputes and appeals — every service is grouped by the authority that hears it under the Assam Tenancy Act.',
}

export const portalServiceSections = [
	{
		id: 'uin-registration',
		title: 'Tenancy registration & UIN',
		subtitle: 'Mandatory first step for most landlords and tenants',
		when:
			'When you enter into a tenancy agreement in Assam, or need an official record of rent, parties, and property details for banks, employers, or government processes.',
		why:
			'A registered tenancy and UIN create a verifiable record before the Rent Authority. It helps both parties prove terms, track status online, and download a digitally signed certificate when approved.',
		how: [
			'Create a citizen account with mobile OTP verification.',
			'Open Apply for UIN from your dashboard and complete the tenancy information form.',
			'Upload required documents (agreement, ID, property details as applicable).',
			'Submit and note your application number — track status under UIN Status.',
			'Download the certificate once the Rent Authority approves the application.',
		],
		cta: { label: 'Apply after sign-in', hash: '/#login' },
	},
	{
		id: 'rent-authority',
		groupId: 'rent-authority',
		title: 'Rent Authority services',
		subtitle: 'Circle Officer or equivalent — Section 30',
		when:
			'When you need to revise or fix rent or other charges, appoint a valuer, or raise disputes on rent, deposits, repairs, or withholding — before going to court.',
		why:
			'The Rent Authority is the first forum for most tenancy matters. Filing the correct form here is usually required before escalation to the Rent Court.',
		how: [
			'Sign in and open **All services** → **Rent Authority**.',
			'Choose the form that matches your matter (rent revision, other charges, valuer, or Rule 11 disputes).',
			'Fill the application, attach supporting documents, and submit.',
			'Track processing from **UIN Status** or your dashboard inbox.',
		],
		cta: { label: 'View Rent Authority forms', anchor: 'rent-authority-forms' },
	},
	{
		id: 'rent-court',
		groupId: 'rent-court',
		title: 'Rent Court services',
		subtitle: 'ADC or equivalent — Section 33',
		when:
			'When you seek recovery or eviction of premises, or wish to appeal an order passed by the Rent Authority.',
		why:
			'Possession and eviction matters, and appeals against Rent Authority orders, are heard by the Rent Court. Use the prescribed form for your situation.',
		how: [
			'Confirm whether your matter belongs here (possession, eviction, or appeal against RA order).',
			'From **All services**, select **Rent Court** and open the relevant form.',
			'Reference your earlier Rent Authority order or tenancy UIN where required.',
			'Submit and monitor status online.',
		],
		cta: { label: 'View Rent Court forms', anchor: 'rent-court-forms' },
	},
	{
		id: 'rent-tribunal',
		groupId: 'rent-tribunal',
		title: 'Rent Tribunal services',
		subtitle: 'District Judge or Additional District Judge — Section 34',
		when:
			'When you are aggrieved by an order of the Rent Court and wish to file a further appeal.',
		why:
			'The Rent Tribunal provides appellate review of Rent Court orders to ensure fair and consistent outcomes across Assam.',
		how: [
			'Obtain the Rent Court order you wish to challenge.',
			'Open **All services** → **Rent Tribunal** → **Form VI**.',
			'Complete the appeal with grounds and documents, then submit.',
			'Track the appeal status from your dashboard.',
		],
		cta: { label: 'View Rent Tribunal forms', anchor: 'rent-tribunal-forms' },
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
			text: 'Apply for UIN / tenancy certificate unless you only need a specific dispute form with an existing record.',
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
