import { Link } from 'react-router-dom'

function WorkspacePageHeader({
	breadcrumb = [],
	title,
	subtitle,
	actions = null,
}) {
	return (
		<header className="ws-page-header">
			{breadcrumb.length > 0 ? (
				<nav className="ws-breadcrumb" aria-label="Breadcrumb">
					{breadcrumb.map((item, i) => (
						<span key={item.label} style={{ display: 'contents' }}>
							{i > 0 ? <span className="ws-breadcrumb-sep">/</span> : null}
							{item.to ? (
								<Link to={item.to}>{item.label}</Link>
							) : (
								<span>{item.label}</span>
							)}
						</span>
					))}
				</nav>
			) : null}
			<div className="ws-page-title-row">
				<div>
					<h1 className="ws-page-title">{title}</h1>
					{subtitle ? <p className="ws-page-subtitle">{subtitle}</p> : null}
				</div>
				{actions ? <div className="ws-page-actions">{actions}</div> : null}
			</div>
		</header>
	)
}

export default WorkspacePageHeader
