import { Link } from 'react-router-dom'

function ServiceFormShell({ serviceMeta, children, variant = 'default' }) {
	const groupId = serviceMeta?.groupId || 'rent-authority'
	const crumbLabel = serviceMeta?.formName || serviceMeta?.label || 'Application'
	const modern = variant === 'modern'
	const crumbLinkClass =
		groupId === 'rent-court'
			? 'font-medium text-[#2563eb] hover:underline'
			: groupId === 'rent-tribunal'
				? 'font-medium text-[#d97706] hover:underline'
				: 'font-medium text-[#6d28d9] hover:underline'

	return (
		<div
			className={`service-form-page service-form-page--${groupId}${
				modern ? ' service-form-page--modern mx-auto w-full max-w-7xl' : ''
			}`}
		>
			<p className={`ws-breadcrumb${modern ? ' mb-4 text-sm text-slate-500' : ''}`}>
				<Link to="/dashboard/services" className={modern ? crumbLinkClass : undefined}>
					All services
				</Link>
				<span className="ws-breadcrumb-sep" aria-hidden>
					/
				</span>
				<span className={modern ? 'text-slate-700' : undefined}>{crumbLabel}</span>
			</p>

			{/* Modern Form I owns its own title card — avoid repeating Form I / rule / authority here */}
			{modern ? null : (
				<header className="service-form-header">
					<div className="service-form-heading">
						{serviceMeta?.groupTitle ? (
							<span className={`service-form-kicker ws-services-form-badge ws-services-form-badge--${groupId}`}>
								{serviceMeta.groupTitle}
							</span>
						) : null}
						<h1 className="service-form-title">{serviceMeta?.label || 'Service application'}</h1>
						{serviceMeta ? (
							<p className="service-form-lead">
								{serviceMeta.matter}
								{serviceMeta.rule ? ` (${serviceMeta.rule})` : ''}
							</p>
						) : (
							<p className="service-form-lead">Complete the application details and submit to the portal.</p>
						)}
						{serviceMeta ? (
							<div className="service-form-meta">
								{serviceMeta.formName ? <span>{serviceMeta.formName}</span> : null}
								{serviceMeta.authority ? <span>{serviceMeta.authority}</span> : null}
							</div>
						) : null}
					</div>
				</header>
			)}

			{children}
		</div>
	)
}

export default ServiceFormShell
