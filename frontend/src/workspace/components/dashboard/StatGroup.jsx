function StatGroup({ title, stats }) {
	if (!stats?.length) return null

	return (
		<div className="ws-stat-group">
			<h3 className="ws-stat-group-title">{title}</h3>
			<div className="ws-stat-group-grid">
				{stats.map((item) => (
					<div
						key={item.label}
						className={`ws-stat-card ws-stat-card--compact${item.highlight ? ' ws-stat-card--highlight' : ''}`}
					>
						<div className="ws-stat-card-label">{item.label}</div>
						<div
							className={`ws-stat-card-value${item.isText ? ' ws-stat-card-value--text' : ''}`}
						>
							{item.value ?? '—'}
						</div>
						{item.hint ? <div className="ws-stat-card-hint">{item.hint}</div> : null}
					</div>
				))}
			</div>
		</div>
	)
}

export default StatGroup
