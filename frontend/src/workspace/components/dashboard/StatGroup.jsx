import NexusStatCard from './NexusStatCard'

function StatGroup({ title, stats }) {
	if (!stats?.length) return null

	return (
		<div className="ws-stat-group">
			<h3 className="ws-stat-group-title">{title}</h3>
			<div className="ws-stat-group-grid">
				{stats.map((item) => (
					<NexusStatCard
						key={item.label}
						label={item.label}
						value={item.value}
						hint={item.hint}
						icon={item.icon}
						tone={item.highlight ? 'warning' : item.tone || 'default'}
						isText={item.isText}
						compact
					/>
				))}
			</div>
		</div>
	)
}

export default StatGroup
