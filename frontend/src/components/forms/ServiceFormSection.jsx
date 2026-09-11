/**
 * Shared section chrome for service application forms.
 * Title + short purpose line; optional Lucide icon as a quiet signpost.
 */
function ServiceFormSection({ icon: Icon, title, lead, children, className = '' }) {
	return (
		<section className={`sf-section${className ? ` ${className}` : ''}`}>
			<header className="sf-section__head">
				{Icon ? (
					<span className="sf-section__icon" aria-hidden>
						<Icon size={18} strokeWidth={2} />
					</span>
				) : null}
				<div className="sf-section__copy">
					<h2 className="sf-section__title">{title}</h2>
					{lead ? <p className="sf-section__lead">{lead}</p> : null}
				</div>
			</header>
			<div className="sf-section__body">{children}</div>
		</section>
	)
}

export default ServiceFormSection
