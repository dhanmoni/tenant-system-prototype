import { useEffect, useMemo, useState } from 'react'

function intensityClass(total, max) {
	if (!total || !max) return 'is-none'
	const ratio = total / max
	if (ratio >= 0.75) return 'is-high'
	if (ratio >= 0.4) return 'is-mid'
	if (ratio > 0) return 'is-low'
	return 'is-none'
}

function DistrictCoverageMap({ districts = [], title = 'District coverage', hint }) {
	const [selectedId, setSelectedId] = useState(null)

	useEffect(() => {
		if (districts.length === 1) {
			setSelectedId(districts[0].id)
		}
	}, [districts])

	const maxTotal = useMemo(
		() => Math.max(0, ...districts.map((d) => d.total_applications ?? 0)),
		[districts]
	)

	const selected = districts.find((d) => d.id === selectedId)

	const renderDetail = (district, prominent = false) => (
		<div
			className={`ws-map-detail${prominent ? ' ws-map-detail--prominent' : ''}`}
			role="region"
			aria-label={`Details for ${district.name}`}
		>
			<strong>{district.name}</strong>
			{district.state_name ? (
				<span className="ws-map-detail-meta">{district.state_name}</span>
			) : null}
			<dl className="ws-map-detail-stats">
				<div>
					<dt>Total</dt>
					<dd>{district.total_applications ?? 0}</dd>
				</div>
				<div>
					<dt>UIN</dt>
					<dd>{district.tenancy_applications ?? 0}</dd>
				</div>
				<div>
					<dt>Forms</dt>
					<dd>{district.service_applications ?? 0}</dd>
				</div>
				<div>
					<dt>Users</dt>
					<dd>{district.users_count ?? 0}</dd>
				</div>
			</dl>
		</div>
	)

	if (!districts.length) {
		return (
			<div className="ws-map-panel">
				<p className="ws-chart-empty">No district data available.</p>
			</div>
		)
	}

	const isSingle = districts.length === 1

	if (isSingle) {
		return (
			<div className="ws-map-panel ws-map-panel--single">
				{hint ? <p className="ws-dashboard-hint ws-map-hint">{hint}</p> : null}
				{renderDetail(districts[0], true)}
			</div>
		)
	}

	return (
		<div className="ws-map-panel">
			{hint ? <p className="ws-dashboard-hint ws-map-hint">{hint}</p> : null}
			<div
				className="ws-district-map"
				data-district-count={districts.length}
				role="list"
				aria-label={title}
			>
				{districts.map((d) => (
					<button
						key={d.id}
						type="button"
						role="listitem"
						className={`ws-district-tile ${intensityClass(d.total_applications, maxTotal)}${
							selectedId === d.id ? ' is-selected' : ''
						}`}
						onClick={() => setSelectedId((prev) => (prev === d.id ? null : d.id))}
						title={`${d.name}: ${d.total_applications ?? 0} applications`}
					>
						<span className="ws-district-tile-name">{d.name}</span>
						<span className="ws-district-tile-count">{d.total_applications ?? 0}</span>
					</button>
				))}
			</div>
			<div className="ws-map-footer">
				<div className="ws-map-legend" aria-hidden>
					<span className="ws-map-legend-label">Volume</span>
					<span className="ws-map-legend-item is-low">Low</span>
					<span className="ws-map-legend-item is-mid">Medium</span>
					<span className="ws-map-legend-item is-high">High</span>
				</div>
			</div>
			{selected ? renderDetail(selected) : null}
		</div>
	)
}

export default DistrictCoverageMap
