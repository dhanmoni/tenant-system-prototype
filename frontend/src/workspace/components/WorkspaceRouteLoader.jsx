/** Lightweight in-panel loader — shown over .ws-main only (not the sidebar). */
function WorkspaceRouteLoader({ label = 'Loading…' }) {
	return (
		<div className="ws-main-route-loader" role="status" aria-live="polite" aria-busy="true" aria-label={label}>
			<div className="ws-main-route-loader-inner">
				<span className="ws-route-spinner" aria-hidden />
				<span className="ws-main-route-loader-label">{label}</span>
			</div>
		</div>
	)
}

export default WorkspaceRouteLoader
