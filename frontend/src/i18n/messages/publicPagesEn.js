/** Public nav pages — English (dashboard, services, about, contact, policies, resources, sitemap). */
const publicPagesEn = {
	'public.layout.breadcrumb': 'Breadcrumb',
	'public.layout.home': 'Home',

	// Public dashboard
	'pd.title': 'Public dashboard',
	'pd.lead':
		'Summary view of portal activity across Assam — tenancy registrations, UIN issuance, and filings before the Rent Authority, Rent Court, and Rent Tribunal.',
	'pd.demoNote':
		'Figures are published for public information and may be updated as departmental reports are finalised.',
	'pd.lastUpdated': 'May 2026',
	'pd.kpis.title': 'Key indicators',
	'pd.kpis.meta': 'Last updated {date}',
	'pd.kpis.caption': 'Portal activity summary for citizens and researchers',
	'pd.kpis.indicator': 'Indicator',
	'pd.kpis.count': 'Count',
	'pd.kpis.remarks': 'Remarks',
	'pd.kpi.applications': 'Applications submitted',
	'pd.kpi.uins': 'UINs issued',
	'pd.kpi.filings': 'Tenancy Act filings',
	'pd.kpi.matters': 'Matters concluded',
	'pd.kpi.applicationsHint':
		'Tenancy and service applications filed through the portal statewide.',
	'pd.kpi.uinsHint': 'Unique Identification Numbers issued to registered tenancies.',
	'pd.kpi.filingsHint':
		'Assam Tenancy Act forms submitted to Rent Authority, Court, and Tribunal.',
	'pd.kpi.mattersHint': 'Disputes and appeals concluded through the digital workflow.',
	'pd.monthly.title': 'Applications per month',
	'pd.monthly.note': 'New applications received through the portal (last six months)',
	'pd.monthly.aria': 'Bar chart of monthly applications',
	'pd.month.dec': 'Dec',
	'pd.month.jan': 'Jan',
	'pd.month.feb': 'Feb',
	'pd.month.mar': 'Mar',
	'pd.month.apr': 'Apr',
	'pd.month.may': 'May',
	'pd.filings.title': 'Filings by tenancy body',
	'pd.filings.note': 'Assam Tenancy Act matters filed online by receiving authority',
	'pd.filings.authority': 'Authority',
	'pd.filings.count': 'Filings',
	'pd.filings.share': 'Share',
	'pd.filings.rentAuthority': 'Rent Authority',
	'pd.filings.rentCourt': 'Rent Court',
	'pd.filings.rentTribunal': 'Rent Tribunal',
	'pd.status.title': 'UIN & acknowledgement status',
	'pd.status.note': 'Share of registration applications by processing stage',
	'pd.status.col': 'Status',
	'pd.status.count': 'Count',
	'pd.status.share': 'Share',
	'pd.status.issued': 'Issued',
	'pd.status.underReview': 'Under review',
	'pd.status.returned': 'Returned / draft',
	'pd.pipeline.title': 'Application pipeline',
	'pd.pipeline.note': 'From submission to acknowledgement',
	'pd.pipeline.stage': 'Stage',
	'pd.pipeline.count': 'Count',
	'pd.pipeline.share': 'Share',
	'pd.pipeline.received': 'UIN / registration received',
	'pd.pipeline.review': 'Under departmental review',
	'pd.pipeline.issued': 'Acknowledgement issued',
	'pd.pipeline.returned': 'Returned for correction',
	'pd.districts.title': 'Top districts by volume',
	'pd.districts.note': 'Highest application counts among Assam districts',
	'pd.districts.rank': 'Rank',
	'pd.districts.district': 'District',
	'pd.districts.applications': 'Applications',
	'pd.link.services': 'Browse all services',
	'pd.link.guide': 'How to register & apply',
	'pd.link.login': 'Login or create account',

	// Services page
	'services.title': 'Portal services',
	'services.lead':
		'Read below to understand which online service applies to your situation, what each authority does, and how to file after you sign in. Matters are listed in the order most citizens follow — from tenancy registration through the Rent Authority, Rent Court, and Rent Tribunal.',
	'services.breadcrumb': 'Services',
	'services.toc': 'On this page',
	'services.when': 'When to use',
	'services.why': 'Why it matters',
	'services.how': 'How to apply',
	'services.formsHeading': 'Forms available online',
	'services.formCol': 'Form',
	'services.matterCol': 'Matter',
	'services.refCol': 'Reference',
	'services.formsNoteBefore': 'After registration, sign in and open',
	'services.formsNoteBold': 'All services',
	'services.formsNoteAfter': 'in your dashboard to file these forms.',
	'services.applyTitle': 'Apply online',
	'services.applyLeadBefore':
		'Create an account or sign in to file applications. You can also return to the',
	'services.applyHome': 'home page',
	'services.applyLeadAfter': 'for registration and status tracking.',
	'services.createAccount': 'Create account',
	'services.signIn': 'Sign in',
	'services.escalation.title': 'Which authority should I use?',
	'services.escalation.lead':
		'Most matters follow a clear path. Start with registration, then the Rent Authority; only move to Court or Tribunal when the Act and your situation require it.',
	'services.escalation.s1.title': 'Register the tenancy',
	'services.escalation.s1.text':
		'Apply for a UIN unless you only need a specific dispute form and already have a registered UIN.',
	'services.escalation.s2.title': 'Rent Authority',
	'services.escalation.s2.text':
		'Rent revision, other charges, valuer appointment, and Rule 11 disputes (rent, deposit, repair, withholding).',
	'services.escalation.s3.title': 'Rent Court',
	'services.escalation.s3.text':
		'Recovery of possession, eviction, or appeal against a Rent Authority order.',
	'services.escalation.s4.title': 'Rent Tribunal',
	'services.escalation.s4.text': 'Appeal against a Rent Court order (Form VI).',
	'services.uin.title': 'Tenancy registration & UIN',
	'services.uin.subtitle': 'Mandatory first step for most landlords and tenants',
	'services.uin.when':
		'When you enter into a tenancy agreement in Assam, or need an official record of rent, parties, and property details for banks, employers, or government processes.',
	'services.uin.why':
		'A registered tenancy and UIN create a verifiable record before the Rent Authority. It helps both parties prove terms, handle disputes effortlessly.',
	'services.uin.how1': 'Create a citizen account with mobile OTP verification.',
	'services.uin.how2':
		'Open Apply for UIN from your dashboard and complete the tenancy information form.',
	'services.uin.how3':
		'Upload required documents (agreement, ID, property details as applicable).',
	'services.uin.how4':
		'Submit and note your application number — track status under UIN Status.',
	'services.uin.how5':
		'Download your auto-generated UIN acknowledgement once the other party joins and submits their details. The UIN is valid for the tenancy term and can be used for future filings.',
	'services.uin.cta': 'Apply after sign-in',
	'services.rt.title': 'Rent Tribunal services',
	'services.rt.when':
		'When you are aggrieved by an order of the Rent Court and wish to file a further appeal.',
	'services.rt.why':
		'The Rent Tribunal is the highest forum under the Act and provides appellate review of Rent Court orders.',
	'services.rt.how1': 'Obtain the Rent Court order you wish to challenge.',
	'services.rt.how2':
		'Sign in, open All services, choose Rent Tribunal, and complete your appeal application.',
	'services.rt.how3': 'Submit with grounds and supporting documents.',
	'services.rt.how4': 'Track the appeal status from your dashboard.',
	'services.rc.title': 'Rent Court services',
	'services.rc.when':
		'When you seek recovery or eviction of premises, or wish to appeal an order passed by the Rent Authority.',
	'services.rc.why':
		'The Rent Court sits above the Rent Authority and hears possession, eviction, and appeals against Rent Authority orders.',
	'services.rc.how1':
		'Confirm whether your matter belongs here (possession, eviction, or appeal against Rent Authority order).',
	'services.rc.how2':
		'Sign in, open All services, select Rent Court, and open the relevant service.',
	'services.rc.how3': 'Reference your earlier Rent Authority order or UIN where required.',
	'services.rc.how4': 'Submit and monitor status online.',
	'services.ra.title': 'Rent Authority services',
	'services.ra.when':
		'When you need to revise or fix rent or other charges, appoint a valuer, or raise disputes on rent, deposits, repairs, or withholding — before going to court.',
	'services.ra.why':
		'The Rent Authority is the first level for most tenancy matters. Many cases start here before escalation to the Rent Court.',
	'services.ra.how1': 'Sign in and open All services, then Rent Authority.',
	'services.ra.how2':
		'Choose the service that matches your matter (rent revision, other charges, valuer, or disputes).',
	'services.ra.how3': 'Fill the application, attach supporting documents, and submit.',
	'services.ra.how4': 'Track processing from UIN Status or your dashboard.',
	'services.form.i.matter': 'Revision or fixation of rent',
	'services.form.ia.matter': 'Revision or fixation of other charges',
	'services.form.ib.matter':
		'Appointment of valuer for fixation or revision of rent and other charges',
	'services.form.iv.matter':
		'Matters under Rule 11 — sections 10 (rent dispute), 14 (deposit money dispute), 15 (property repair dispute) and 20 (withholding dispute)',
	'services.form.ii.matter': 'For recovery of possession of premises from tenant',
	'services.form.iii.matter':
		'Eviction and recovery of possession of premises by landlord or his legal heirs.',
	'services.form.v.matter':
		'Appeals by any person aggrieved by the order of the Rent Authority',
	'services.form.vi.matter':
		'Appeals by any person aggrieved by the order of the Rent Court',

	// About
	'about.title': 'About us',
	'about.lead':
		'The Assam Tenancy Registration & Management System is a unified digital portal for citizens, tenants, and property owners under the Government of Assam.',
	'about.mission.title': 'Our mission',
	'about.mission.body':
		'To make tenancy registration, management and dispute filing accessible online — reducing visits to offices while keeping records trackable and verifiable for tenants and owners across Assam.',
	'about.operator.title': 'Who operates the portal',
	'about.operator.body':
		'The portal is operated under the Department of Housing And Urban Affairs, Government of Assam, through the Directorate of Town and Country Planning (TCP), in line with the Assam Tenancy Act and related rules.',

	// Contact
	'contact.title': 'Contact Us',
	'contact.lead':
		'Directorate of Town and Country Planning, Assam — helpdesk and office contact details. Information below is for demonstration; replace with official published contacts for production.',
	'contact.helpdesk': 'Helpdesk',
	'contact.tollFree': 'Toll-free:',
	'contact.emailLabel': 'Email:',
	'contact.hoursLabel': 'Hours (demo):',
	'contact.hoursValue': 'Monday–Friday, 10:00–17:00 IST',
	'contact.phone': 'Phone',
	'contact.officeAddress': 'Office address',
	'contact.addressLines':
		'Directorate of Town and Country Planning\nUrban Affairs Complex, Sachivalaya Road, Dispur\nGuwahati, Assam 781006',
	'contact.email': 'Email',
	'contact.mapTitle': 'Office location',
	'contact.mapAddress':
		'Directorate of Town and Country Planning, Urban Affairs Complex, Sachivalaya Road, Dispur, Guwahati, Assam 781006',
	'contact.mapIframe': 'Directorate of Town and Country Planning office location',
	'contact.loadMap': 'Load interactive map',
	'contact.loadingMap': 'Loading map…',
	'contact.openMaps': 'Open in Google Maps',
	'contact.meta':
		'Map and contact details are for reference only. Verify the exact office location and published helpline numbers with the department before visiting.',
	'contact.signIn': 'Sign in',
	'contact.register': 'Register',
	'contact.tcpSite': 'TCP Assam official site',

	// Policies
	'policies.title': 'Policies & Guidelines',
	'policies.lead':
		'Terms, privacy practices, and accessibility information for users of the Assam Tenancy Registration Portal.',
	'policies.terms.title': 'Terms of use',
	'policies.terms.p1':
		'This portal is provided by the Directorate of Town and Country Planning, Assam, for online tenancy registration and related citizen services. By using this website, you agree to use it only for lawful purposes connected with tenancy applications and authorised departmental processes.',
	'policies.terms.p2':
		'Unauthorized access, misuse of credentials, or submission of false information may lead to rejection of applications and action under applicable laws.',
	'policies.privacy.title': 'Privacy and data protection',
	'policies.privacy.p1':
		'Personal information collected during registration and application submission is used solely for tenancy administration, verification, and services. Data is handled in line with applicable government data protection guidelines and departmental policies.',

	// Resources
	'resources.title': 'Resources',
	'resources.lead': 'Guides, drafts, and reference materials for Assam tenancy services.',
	'resources.comingSoonPage': 'Resources are coming soon.',
	'resources.notice':
		'Downloads are not yet available. The items below show what will be offered when official draft formats are released.',
	'resources.format': 'Format:',
	'resources.comingSoon': 'Coming soon',
	'resources.download': 'Download',
	'resources.downloadDisabled': 'Download not available yet',
	'resources.agreements.title': 'Agreement drafts',
	'resources.agreements.desc':
		'Sample tenancy and lease agreement formats for reference when preparing your application.',
	'resources.residential.title': 'Residential tenancy agreement draft',
	'resources.residential.desc':
		'Standard format for residential rent agreements under Assam tenancy rules.',
	'resources.commercial.title': 'Commercial lease agreement draft',
	'resources.commercial.desc': 'Template for commercial property tenancy registration.',
	'resources.joint.title': 'Joint tenancy agreement draft',
	'resources.joint.desc': 'Format when multiple tenants are named on one agreement.',
	'resources.notices.title': 'Notices & legal drafts',
	'resources.notices.desc': 'Common notice formats used in rent-related proceedings.',
	'resources.tenantNotice.title': 'Notice to tenant draft',
	'resources.tenantNotice.desc': 'Placeholder notice format for tenancy-related communication.',
	'resources.landlordReply.title': 'Landlord reply notice draft',
	'resources.landlordReply.desc': 'Response format for disputes referred to rent authorities.',
	'resources.forms.title': 'Forms & checklists',
	'resources.forms.desc': 'Supporting documents and checklists for portal applications.',
	'resources.uinChecklist.title': 'UIN registration document checklist',
	'resources.uinChecklist.desc': 'List of documents typically required for UIN application.',
	'resources.cover.title': 'Application cover sheet',
	'resources.cover.desc': 'Cover page for offline submission bundles (reference only).',
	'resources.affidavit.title': 'Affidavit format',
	'resources.affidavit.desc': 'General affidavit template for tenancy-related submissions.',

	// Sitemap
	'sitemap.title': 'Sitemap',
	'sitemap.lead':
		'List of pages on the Assam Tenancy Registration & Management System portal.',
	'sitemap.navAria': 'Site map',
	'sitemap.external': '(External link)',
	'sitemap.metaBefore': 'Last updated: {date}. For assistance, see',
	'sitemap.contact': 'Contact us',
	'sitemap.metaOr': 'or the',
	'sitemap.tcp': 'TCP Assam website',
	'sitemap.home': 'Home',
	'sitemap.howToApply': 'How to apply',
	'sitemap.portalServices': 'Portal services',
	'sitemap.signIn': 'Sign in',
	'sitemap.newRegistration': 'New registration',
	'sitemap.about': 'About us',
	'sitemap.uin': 'Tenancy registration & UIN',
	'sitemap.rt': 'Rent Tribunal services',
	'sitemap.rc': 'Rent Court services',
	'sitemap.ra': 'Rent Authority services',
	'sitemap.dashboard': 'Public dashboard',
	'sitemap.policies': 'Policies & guidelines',
	'sitemap.resources': 'Resources',
	'sitemap.contactUs': 'Contact us',
	'sitemap.related': 'Related government websites',
	'sitemap.tcpFull': 'Directorate of Town & Country Planning, Assam',
	'sitemap.indiaGov': 'National Portal of India (India.gov.in)',
	'sitemap.digitalIndia': 'Digital India',
}

export default publicPagesEn
