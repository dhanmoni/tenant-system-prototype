function ServiceFormShell({ serviceMeta, onBack, error, success, children }) {
	const groupId = serviceMeta?.groupId || 'rent-authority'

	return (
		<div className={`service-form-page service-form-page--${groupId}`}>
			<header className="service-form-header">
				<button type="button" className="service-form-back" onClick={onBack}>
					← Back to services
				</button>
				<div className="service-form-heading">
					{serviceMeta?.groupTitle ? (
						<span className="service-form-kicker">{serviceMeta.groupTitle}</span>
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

			{error ? (
				<div className="service-form-alert service-form-alert--error" role="alert">
					{error}
				</div>
			) : null}
			{success ? (
				<div className="service-form-alert service-form-alert--success" role="status">
					{success}
				</div>
			) : null}

			{children}
		</div>
	)
}

export default ServiceFormShell
