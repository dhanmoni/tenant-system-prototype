/**
 * Public-facing portal statistics for the landing page.
 * Values come from GET /api/public/portal-stats (same payload as Public Dashboard).
 */
export const PORTAL_STAT_DEFS = [
	{
		id: 'applications_submitted',
		icon: 'fileStack',
	},
	{
		id: 'uins_issued',
		icon: 'idCard',
	},
	{
		id: 'service_filings',
		icon: 'landmark',
	},
	{
		id: 'disputes_resolved',
		icon: 'circleCheck',
	},
]

export function mapPortalKpis(kpis = []) {
	const byId = Object.fromEntries(
		(Array.isArray(kpis) ? kpis : []).map((row) => [row.id, Number(row.value) || 0]),
	)
	return PORTAL_STAT_DEFS.map((def) => ({
		...def,
		value: byId[def.id] ?? 0,
	}))
}
