/**
 * Compact pre-apply gate: form identity + UIN search + know-before list.
 */
function ServiceFormReadyGate({
	badge,
	title,
	description,
	prepTitle = 'Enter your Tenancy UIN',
	knowBeforeTitle = 'Know before you apply',
	knowBefore = [],
	children,
}) {
	const hasKnowBefore = Array.isArray(knowBefore) && knowBefore.length > 0

	return (
		<section className="sf-ready-gate sf-form-card overflow-hidden rounded-[20px]">
			<div className="sf-ready-gate__intro">
				{badge ? <span className="sf-form-card__badge">{badge}</span> : null}
				<h1 className="sf-ready-gate__title">{title}</h1>
				{description ? <p className="sf-ready-gate__lead">{description}</p> : null}
			</div>

			<div className="sf-ready-gate__body">
				<h2 className="sf-ready-gate__prep-title">{prepTitle}</h2>
				<div className="sf-ready-gate__search">{children}</div>
			</div>

			{hasKnowBefore ? (
				<div className="sf-ready-gate__know">
					<h3 className="sf-ready-gate__know-title">{knowBeforeTitle}</h3>
					<ul className="sf-ready-gate__know-list">
						{knowBefore.map((item) => (
							<li key={item}>{item}</li>
						))}
					</ul>
				</div>
			) : null}
		</section>
	)
}

export default ServiceFormReadyGate
