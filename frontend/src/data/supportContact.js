/**
 * Public helpdesk contact — as published on the Directorate website.
 * Source: https://tcp.assam.gov.in/contact-us
 * Email: HQ mailbox. Phone: RTI & Public Grievance Officer.
 */
export const supportContact = {
	isPrototype: false,
	email: 'directortcpassam@gmail.com',
	phone: '9435144391',
	phoneDisplay: '94351-44391',
	phoneTel: '+919435144391',
	mapsQuery: 'Directorate of Town and Country Planning Assam Dispur',
	tcpSite: 'https://tcp.assam.gov.in/',
	tcpContactPage: 'https://tcp.assam.gov.in/contact-us',
}

export const supportMailto = `mailto:${supportContact.email}`
export const supportTel = `tel:${supportContact.phoneTel}`
export const supportMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(supportContact.mapsQuery)}`
