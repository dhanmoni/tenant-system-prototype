function DashboardSection({ title, description, action, children, className = '' }) {
	return (
		<section className={`ws-dashboard-section ${className}`.trim()}>
			<header className="ws-dashboard-section-head">
				<div className="ws-dashboard-section-titles">
					<h2 className="ws-dashboard-section-title">{title}</h2>
					{description ? (
						<p className="ws-dashboard-section-desc">{description}</p>
					) : null}
				</div>
				{action ? <div className="ws-dashboard-section-action">{action}</div> : null}
			</header>
			<div className="ws-dashboard-section-body">{children}</div>
		</section>
	)
}

export default DashboardSection
