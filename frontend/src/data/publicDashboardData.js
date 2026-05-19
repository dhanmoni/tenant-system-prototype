/** Illustrative data for the public dashboard demo page */

export const publicDashboardMeta = {
	eyebrow: 'Open data',
	title: 'Public dashboard',
	lead: 'Illustrative portal statistics for transparency and awareness. Figures are for demonstration only until connected to live reporting.',
	demoNote:
		'All charts and counts on this page are sample data for the NIC prototype. Production deployment will source verified statistics from official records.',
}

export const monthlyApplications = [
	{ month: 'Oct', value: 892 },
	{ month: 'Nov', value: 1045 },
	{ month: 'Dec', value: 978 },
	{ month: 'Jan', value: 1120 },
	{ month: 'Feb', value: 1186 },
	{ month: 'Mar', value: 1284 },
]

export const filingsByBody = [
	{ id: 'authority', label: 'Rent Authority', value: 3404, pct: 52 },
	{ id: 'court', label: 'Rent Court', value: 1896, pct: 29 },
	{ id: 'tribunal', label: 'Rent Tribunal', value: 1240, pct: 19 },
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
