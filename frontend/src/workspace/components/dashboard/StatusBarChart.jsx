import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import { STATUS_LABELS } from '../../../constants/status'
import {
	STATUS_CHART_COLORS,
	STATUS_CHART_LABELS,
	barChartOptions,
	staticBarChartOptions,
} from './chartConfig'

const DEFAULT_KEYS = ['SUBMITTED', 'IN_REVIEW', 'REJECTED', 'COMPLETED', 'OTHER']
const FALLBACK_COLORS = ['#2563eb', '#d97706', '#dc2626', '#16a34a', '#7c3aed', '#0891b2', '#94a3b8']

function StatusBarChart({
	breakdown = {},
	keys = DEFAULT_KEYS,
	emptyLabel = 'No application data yet.',
	staticChart = false,
}) {
	const chart = useMemo(() => {
		const values = keys.map((k) => breakdown[k] ?? 0)
		const hasData = values.some((v) => v > 0)
		return {
			hasData,
			data: {
				labels: keys.map((k) => STATUS_CHART_LABELS[k] || STATUS_LABELS[k] || k),
				datasets: [
					{
						label: 'Applications',
						data: values,
						backgroundColor: keys.map(
							(k, i) => STATUS_CHART_COLORS[k] || FALLBACK_COLORS[i % FALLBACK_COLORS.length]
						),
						borderRadius: 6,
						borderSkipped: false,
					},
				],
			},
		}
	}, [breakdown, keys])

	const options = staticChart ? staticBarChartOptions : barChartOptions

	return (
		<div className={`ws-chart-wrap${staticChart ? ' ws-chart-wrap--static' : ''}`}>
			{chart.hasData ? (
				<Bar data={chart.data} options={options} />
			) : (
				<div className="ws-chart-empty">{emptyLabel}</div>
			)}
		</div>
	)
}

export default StatusBarChart
