import { declarationText } from '../../constants/declarations'

/**
 * A sworn declaration printed on a service form.
 *
 * The parenthetical text under such a paragraph is not guidance for the filer, it is the assertion
 * being made, so the control is a required checkbox showing that wording verbatim rather than a
 * free-text box. The wording is read from a shared constant so that what is displayed is what the
 * server records.
 *
 * `simple` shows a short citizen-facing accept line first, with the full legal wording underneath
 * in smaller type — easier to act on, without hiding what is being asserted.
 */
function DeclarationCheckbox({
	fieldId,
	label,
	summary,
	checked,
	onChange,
	disabled = false,
	hideLabel = false,
	simple = false,
}) {
	const text = declarationText(fieldId)

	if (simple) {
		return (
			<div className="declaration declaration--simple tenancy-field-full">
				{!hideLabel && label ? <p className="label-text required">{label}</p> : null}
				<label className={`declaration__simple${checked ? ' is-checked' : ''}`}>
					<input
						type="checkbox"
						checked={checked}
						onChange={(e) => onChange(e.target.checked)}
						disabled={disabled}
						required
					/>
					<span className="declaration__simple-copy">
						<span className="declaration__simple-title">
							{summary || 'Yes — I confirm this declaration'}
						</span>
						<span className="declaration__simple-legal">{text}</span>
					</span>
				</label>
			</div>
		)
	}

	return (
		<div className="declaration tenancy-field-full">
			{!hideLabel && label ? <p className="label-text required">{label}</p> : null}
			<label className="declaration__box">
				<input
					type="checkbox"
					checked={checked}
					onChange={(e) => onChange(e.target.checked)}
					disabled={disabled}
					required
				/>
				<span className="declaration__text">{text}</span>
			</label>
		</div>
	)
}

export default DeclarationCheckbox
