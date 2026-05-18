import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import {
	STATUS_CHART_COLORS,
	STATUS_CHART_LABELS,
	barChartOptions,
} from './chartConfig'

const DEFAULT_KEYS = ['SUBMITTED', 'IN_REVIEW', 'REJECTED', 'COMPLETED', 'OTHER']

function StatusBarChart({ breakdown = {}, keys = DEFAULT_KEYS, emptyLabel = 'No application data yet.' }) {
	const chart = useMemo(() => {
		const values = keys.map((k) => breakdown[k] ?? 0)
		const hasData = values.some((v) => v > 0)
		return {
			hasData,
			data: {
				labels: keys.map((k) => STATUS_CHART_LABELS[k] || k),
				datasets: [
					{
						label: 'Applications',
						data: values,
						backgroundColor: keys.map((k) => STATUS_CHART_COLORS[k] || '#94a3b8'),
						borderRadius: 6,
						borderSkipped: false,
					},
				],
			},
		}
	}, [breakdown, keys])

	return (
		<div className="ws-chart-wrap">
			{chart.hasData ? (
				<Bar data={chart.data} options={barChartOptions} />
			) : (
				<div className="ws-chart-empty">{emptyLabel}</div>
			)}
		</div>
	)
}

export default StatusBarChart
