/**
 * Illustrative data for the public transparency dashboard (NIC prototype).
 * Align counts with homepage portalPublicStats where applicable.
 */
import { portalPublicStats } from './portalPublicStats'

export const publicDashboardMeta = {
	eyebrow: 'Transparency',
	title: 'Public dashboard',
	lead:
		'Summary view of portal activity across Assam — tenancy registrations, UIN issuance, and filings before the Rent Authority, Rent Court, and Rent Tribunal. Figures below are sample data for demonstration until live reporting is connected.',
	demoNote:
		'Prototype only: statistics are illustrative and do not reflect live departmental records. Production will publish verified figures from official reporting systems.',
	lastUpdated: 'May 2026 (sample)',
}

const kpiLabels = {
	applications_submitted: 'Applications submitted',
	uins_issued: 'UINs issued',
	service_filings: 'Tenancy Act filings',
	disputes_resolved: 'Matters concluded',
}

/** Top-level KPI tiles — sourced from homepage public stats */
export const publicDashboardKpis = portalPublicStats.map((stat) => ({
	id: stat.id,
	value: stat.value,
	display: stat.display,
	label: kpiLabels[stat.id] || stat.description,
	hint: stat.description,
}))

export const monthlyApplications = [
	{ month: 'Dec', value: 978 },
	{ month: 'Jan', value: 1120 },
	{ month: 'Feb', value: 1186 },
	{ month: 'Mar', value: 1248 },
	{ month: 'Apr', value: 1312 },
	{ month: 'May', value: 1284 },
]

export const filingsByBody = [
	{ id: 'authority', label: 'Rent Authority', value: 3404, pct: 52 },
	{ id: 'court', label: 'Rent Court', value: 1896, pct: 29 },
	{ id: 'tribunal', label: 'Rent Tribunal', value: 1240, pct: 19 },
]

export const applicationPipeline = [
	{ label: 'UIN / registration received', value: 12840, pct: 100 },
	{ label: 'Under departmental review', value: 3852, pct: 30 },
	{ label: 'Acknowledgement issued', value: 9215, pct: 72 },
	{ label: 'Returned for correction', value: 1307, pct: 10 },
]

export const topDistricts = [
	{ name: 'Kamrup Metropolitan', applications: 2840 },
	{ name: 'Dibrugarh', applications: 1620 },
	{ name: 'Jorhat', applications: 1410 },
	{ name: 'Sonitpur', applications: 1185 },
	{ name: 'Cachar', applications: 1092 },
]

export const certificateStatus = [
	{ label: 'Issued', value: 9215, pct: 72 },
	{ label: 'Under review', value: 2318, pct: 18 },
	{ label: 'Returned / draft', value: 1307, pct: 10 },
]

export const publicDashboardLinks = [
	{ label: 'Browse all services', to: '/services' },
	{ label: 'How to register & apply', to: '/#portal-guide' },
	{ label: 'Login or create account', to: '/login' },
]
