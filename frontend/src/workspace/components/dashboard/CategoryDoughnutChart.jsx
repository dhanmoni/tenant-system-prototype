import { useMemo } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { doughnutChartOptions } from './chartConfig'

const PALETTE = ['#0d47a1', '#c47a3a', '#2e7d32', '#5c6bc0', '#7c3aed', '#0891b2']

function CategoryDoughnutChart({ categories = [], emptyLabel = 'No category data yet.' }) {
	const chart = useMemo(() => {
		const values = categories.map((c) => c.count ?? 0)
		const hasData = values.some((v) => v > 0)
		return {
			hasData,
			data: {
				labels: categories.map((c) => c.label),
				datasets: [
					{
						data: values,
						backgroundColor: categories.map((_, i) => PALETTE[i % PALETTE.length]),
						borderWidth: 2,
						borderColor: '#fff',
					},
				],
			},
		}
	}, [categories])

	return (
		<div className="ws-chart-wrap ws-chart-wrap--doughnut">
			{chart.hasData ? (
				<Doughnut data={chart.data} options={doughnutChartOptions} />
			) : (
				<div className="ws-chart-empty">{emptyLabel}</div>
			)}
		</div>
	)
}

export default CategoryDoughnutChart
