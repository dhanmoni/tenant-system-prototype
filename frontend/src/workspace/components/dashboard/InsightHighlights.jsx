import { useMemo } from 'react'
import NexusStatCard from './NexusStatCard'

function InsightHighlights({ stats }) {
	const insights = useMemo(() => {
		const s = stats || {}
		const totalApps =
			(s.applications_count ?? 0) ||
			(s.tenancy_applications ?? 0) + (s.service_applications ?? 0)
		const breakdown = s.applications_by_status || {}
		const completed = breakdown.COMPLETED ?? 0
		const serviceTotal = s.service_applications ?? 0
		const completionRate =
			serviceTotal > 0 ? Math.round((completed / serviceTotal) * 100) : null
		const backlog = (s.pending_review ?? 0) + (s.in_review ?? 0)
		const districts = s.district_breakdown || []
		const topDistrict = [...districts].sort(
			(a, b) => (b.total_applications ?? 0) - (a.total_applications ?? 0)
		)[0]
		const avgPerDistrict =
			s.districts_count > 0 ? Math.round(totalApps / s.districts_count) : null

		return [
			{
				key: 'total',
				label: 'Total applications',
				value: totalApps.toLocaleString('en-IN'),
				hint: `${s.tenancy_applications ?? 0} UIN · ${s.service_applications ?? 0} forms`,
				tone: 'default',
				icon: 'list',
			},
			{
				key: 'backlog',
				label: 'Active queue',
				value: backlog.toLocaleString('en-IN'),
				hint: `${s.pending_review ?? 0} submitted · ${s.in_review ?? 0} in review`,
				tone: backlog > 0 ? 'warning' : 'success',
				icon: 'clock',
			},
			{
				key: 'completion',
				label: 'Form completion rate',
				value: completionRate != null ? `${completionRate}%` : '—',
				hint:
					completionRate != null
						? `${completed} of ${serviceTotal} forms completed`
						: 'No form submissions yet',
				tone: completionRate != null && completionRate >= 50 ? 'success' : 'default',
				icon: 'check',
			},
			{
				key: 'coverage',
				label: 'District activity',
				value: topDistrict?.name || '—',
				hint: topDistrict
					? `${topDistrict.total_applications ?? 0} apps · avg ${avgPerDistrict ?? 0} / district`
					: `${s.districts_count ?? 0} districts configured`,
				tone: 'violet',
				icon: 'map',
				isText: Boolean(topDistrict?.name),
			},
		]
	}, [stats])

	return (
		<div className="ws-insight-grid" role="list" aria-label="Key insights">
			{insights.map((item) => (
				<div key={item.key} role="listitem">
					<NexusStatCard
						label={item.label}
						value={item.value}
						hint={item.hint}
						tone={item.tone}
						icon={item.icon}
						isText={item.isText}
					/>
				</div>
			))}
		</div>
	)
}

export default InsightHighlights
