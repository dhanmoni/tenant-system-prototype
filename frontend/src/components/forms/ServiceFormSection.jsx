function ServiceFormSection({ title, description, children, className = '' }) {
	return (
		<section className={`service-form-section${className ? ` ${className}` : ''}`}>
			{title ? (
				<div className="service-form-section__head">
					<h2 className="service-form-section__title">{title}</h2>
					{description ? (
						<p className="service-form-section__desc">{description}</p>
					) : null}
				</div>
			) : null}
			{children}
		</section>
	)
}

export default ServiceFormSection
