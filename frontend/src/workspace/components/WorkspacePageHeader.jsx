function WorkspacePageHeader({
	title,
	subtitle,
	actions = null,
}) {
	return (
		<header className="ws-page-header">
			{title ? (
				<div className="ws-page-title-row">
					<div>
						<h1 className="ws-page-title">{title}</h1>
						{subtitle ? <p className="ws-page-subtitle">{subtitle}</p> : null}
					</div>
					{actions ? <div className="ws-page-actions">{actions}</div> : null}
				</div>
			) : null}
		</header>
	)
}

export default WorkspacePageHeader
