/**
 * Numbered section card for service forms — mirrors the UIN apply party-block pattern.
 */
function ServiceFormSection({
	number,
	title,
	description,
	children,
	className = '',
	autofilled = false,
}) {
	return (
		<section
			className={`service-form-block${autofilled ? ' is-autofilled' : ''}${
				className ? ` ${className}` : ''
			}`}
		>
			{(title || number != null) && (
				<div className="service-form-block__head">
					{number != null ? (
						<span className="service-form-block__num" aria-hidden>
							{number}
						</span>
					) : null}
					<div className="service-form-block__copy">
						{title ? <h2 className="service-form-block__title">{title}</h2> : null}
						{description ? (
							<p className="service-form-block__lead">{description}</p>
						) : null}
					</div>
				</div>
			)}
			<div className="service-form-block__fields">{children}</div>
		</section>
	)
}

export default ServiceFormSection
