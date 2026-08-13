import { Link } from 'react-router-dom'

function ServiceFormShell({ serviceMeta, children }) {
	const groupId = serviceMeta?.groupId || 'rent-authority'
	const crumbLabel = serviceMeta?.formName || serviceMeta?.label || 'Application'

	return (
		<div className={`service-form-page service-form-page--${groupId}`}>
			<p className="ws-breadcrumb">
				<Link to="/dashboard/services">All services</Link>
				<span className="ws-breadcrumb-sep" aria-hidden>
					/
				</span>
				<span>{crumbLabel}</span>
			</p>

			<header className="service-form-header">
				<div className="service-form-heading">
					{serviceMeta?.groupTitle ? (
						<span className={`service-form-kicker ws-services-form-badge ws-services-form-badge--${groupId}`}>
							{serviceMeta.groupTitle}
						</span>
					) : null}
					<h1 className="service-form-title">
						{serviceMeta?.label || 'Service application'}
					</h1>
					{serviceMeta ? (
						<p className="service-form-lead">
							{serviceMeta.matter}
							{serviceMeta.rule ? ` (${serviceMeta.rule})` : ''}
						</p>
					) : (
						<p className="service-form-lead">
							Complete the application details and submit to the portal.
						</p>
					)}
					{serviceMeta ? (
						<div className="service-form-meta">
							{serviceMeta.formName ? <span>{serviceMeta.formName}</span> : null}
							{serviceMeta.authority ? <span>{serviceMeta.authority}</span> : null}
						</div>
					) : null}
				</div>
			</header>

			{children}
		</div>
	)
}

export default ServiceFormShell
