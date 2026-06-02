import { useMemo } from 'react'
import { STATUS_CHART_COLORS, STATUS_CHART_LABELS } from './chartConfig'

const PIPELINE_KEYS = ['SUBMITTED', 'IN_REVIEW', 'COMPLETED', 'REJECTED', 'OTHER']

function PipelineSummary({ breakdown = {}, totalLabel = 'form applications' }) {
	const segments = useMemo(() => {
		const values = PIPELINE_KEYS.map((k) => breakdown[k] ?? 0)
		const total = values.reduce((sum, n) => sum + n, 0)
		if (!total) return { total: 0, items: [] }

		return {
			total,
			items: PIPELINE_KEYS.map((key, i) => ({
				key,
				label: STATUS_CHART_LABELS[key] || key,
				count: values[i],
				pct: Math.round((values[i] / total) * 100),
				color: STATUS_CHART_COLORS[key] || '#94a3b8',
			})).filter((item) => item.count > 0),
		}
	}, [breakdown])

	if (!segments.total) {
		return <p className="ws-chart-empty">No pipeline data for {totalLabel} yet.</p>
	}

	return (
		<div className="ws-pipeline">
			<div className="ws-pipeline-bar" role="img" aria-label="Application status distribution">
				{segments.items.map((seg) => (
					<div
						key={seg.key}
						className="ws-pipeline-segment"
						style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
						title={`${seg.label}: ${seg.count} (${seg.pct}%)`}
					/>
				))}
			</div>
			<ul className="ws-pipeline-legend">
				{segments.items.map((seg) => (
					<li key={seg.key} className="ws-pipeline-legend-item">
						<span
							className="ws-pipeline-swatch"
							style={{ backgroundColor: seg.color }}
							aria-hidden
						/>
						<span className="ws-pipeline-legend-label">{seg.label}</span>
						<span className="ws-pipeline-legend-value">
							<strong>{seg.count}</strong>
							<span className="ws-pipeline-legend-pct">{seg.pct}%</span>
						</span>
					</li>
				))}
			</ul>
			<p className="ws-pipeline-footnote">
				{segments.total.toLocaleString('en-IN')} {totalLabel} statewide
			</p>
		</div>
	)
}

export default PipelineSummary
