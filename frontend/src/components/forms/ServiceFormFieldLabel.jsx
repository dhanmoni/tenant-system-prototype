import { Info } from 'lucide-react'

/**
 * Plain-language field label with always-visible hint.
 * Legal / formal wording can sit in `info` (i tooltip). Gazette para number is a small chip.
 */
function ServiceFormFieldLabel({
	children,
	hint,
	para,
	optional = false,
	required = false,
	info = null,
}) {
	return (
		<span className="sf-field">
			<span className={`sf-field__label${required ? ' required' : ''}`}>
				{para ? <span className="sf-field__para">Para {para}</span> : null}
				<span className="sf-field__name">{children}</span>
				{optional ? <span className="sf-field__optional">Optional</span> : null}
				{info ? (
					<span
						className="ground-choice__info-container sf-field__info"
						role="note"
						tabIndex={0}
						aria-label={typeof info === 'string' ? info : 'More information'}
					>
						<Info size={15} aria-hidden />
						<span className="ground-choice__info-popup" role="tooltip">
							{typeof info === 'string' ? <span>{info}</span> : info}
						</span>
					</span>
				) : null}
			</span>
			{hint ? <span className="sf-field__hint">{hint}</span> : null}
		</span>
	)
}

export default ServiceFormFieldLabel
