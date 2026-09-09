import { Link } from 'react-router-dom'

function ServiceFormShell({ serviceMeta, children }) {
	const groupId = serviceMeta?.groupId || 'rent-authority'
	const groupTitle = serviceMeta?.groupTitle
	const crumbLabel = serviceMeta?.formName || serviceMeta?.label || 'Application'
	const title = serviceMeta?.label || 'Service application'
	const lead = serviceMeta
		? `${serviceMeta.matter}${serviceMeta.rule ? ` (${serviceMeta.rule})` : ''}`
		: 'Complete the application details and submit to the portal.'

	return (
		<div className={`service-form-page service-form-page--${groupId}`}>
			<p className="ws-breadcrumb">
				<Link to="/dashboard/services">Services</Link>
				<span className="ws-breadcrumb-sep" aria-hidden>
					/
				</span>
				{groupTitle ? (
					<>
						<Link to={`/dashboard/services?authority=${groupId}`}>{groupTitle}</Link>
						<span className="ws-breadcrumb-sep" aria-hidden>
							/
						</span>
					</>
				) : null}
				<span>{crumbLabel}</span>
			</p>

			<header className="service-form-head">
				<div className="service-form-head__row">
					<div className="service-form-head__copy">
						{groupTitle ? (
							<span
								className={`service-form-kicker ws-services-form-badge ws-services-form-badge--${groupId}`}
							>
								{groupTitle}
							</span>
						) : null}
						<h1 className="service-form-title">{title}</h1>
						<p className="service-form-lead">{lead}</p>
						{serviceMeta ? (
							<div className="service-form-meta">
								{serviceMeta.formName ? <span>{serviceMeta.formName}</span> : null}
								{serviceMeta.authority ? (
									<span>{String(serviceMeta.authority).replace(/[()]/g, '')}</span>
								) : null}
								{serviceMeta.rule ? <span>{serviceMeta.rule}</span> : null}
							</div>
						) : null}
					</div>
				</div>
			</header>

			<div className="service-form-main">{children}</div>
		</div>
	)
}

export default ServiceFormShell
