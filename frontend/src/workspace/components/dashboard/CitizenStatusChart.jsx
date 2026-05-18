import { useMemo } from 'react'
import { Doughnut } from 'react-chartjs-2'
import {
	doughnutChartOptions,
	STATUS_CHART_COLORS,
	STATUS_CHART_LABELS,
} from './chartConfig'
import { STATUS } from '../../../constants/status'

/** Map raw DB statuses into chart buckets (matches dashboard stat logic). */
export function bucketCitizenStatus(status, applicationType = '') {
	const s = String(status || '').trim().toUpperCase()
	const type = String(applicationType || '').toLowerCase()

	if ([STATUS.APPROVED, STATUS.COMPLETED].includes(s)) return 'COMPLETED'
	if (s === STATUS.REJECTED) return 'REJECTED'
	if ([STATUS.DRAFT].includes(s)) return 'DRAFT'
	if ([STATUS.PARTIAL].includes(s)) return 'PARTIAL'
	if ([STATUS.IN_REVIEW, STATUS.PENDING].includes(s)) return 'IN_REVIEW'
	if (s === STATUS.SUBMITTED) return 'SUBMITTED'
	if (s === STATUS.UNDER_PROCESS) {
		return type.includes('tenancy') ? 'SUBMITTED' : 'IN_REVIEW'
	}
	return s && STATUS_CHART_LABELS[s] ? s : 'OTHER'
}

const CHART_KEYS = ['SUBMITTED', 'IN_REVIEW', 'COMPLETED', 'REJECTED', 'DRAFT', 'PARTIAL', 'OTHER']

function CitizenStatusChart({ applications = [] }) {
	const chart = useMemo(() => {
		const counts = Object.fromEntries(CHART_KEYS.map((k) => [k, 0]))

		applications.forEach((app) => {
			const key = bucketCitizenStatus(app.status, app.application_type)
			if (counts[key] !== undefined) counts[key] += 1
			else counts.OTHER += 1
		})

		const activeKeys = CHART_KEYS.filter((k) => counts[k] > 0)
		const hasData = activeKeys.length > 0

		return {
			hasData,
			data: {
				labels: activeKeys.map((k) => STATUS_CHART_LABELS[k] || k),
				datasets: [
					{
						data: activeKeys.map((k) => counts[k]),
						backgroundColor: activeKeys.map((k) => STATUS_CHART_COLORS[k] || '#94a3b8'),
						borderWidth: 2,
						borderColor: '#fff',
					},
				],
			},
		}
	}, [applications])

	return (
		<div className="ws-chart-wrap ws-chart-wrap--doughnut ws-citizen-chart">
			{chart.hasData ? (
				<Doughnut data={chart.data} options={doughnutChartOptions} />
			) : (
				<div className="ws-chart-empty">
					{applications.length === 0
						? 'Submit an application to see your status breakdown.'
						: 'No status data for the applications on this page.'}
				</div>
			)}
		</div>
	)
}

export default CitizenStatusChart
