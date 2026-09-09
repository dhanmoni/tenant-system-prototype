import { declarationText } from '../../constants/declarations'

/**
 * A sworn declaration printed on a service form.
 *
 * The parenthetical text under such a paragraph is not guidance for the filer, it is the assertion
 * being made, so the control is a required checkbox showing that wording verbatim rather than a
 * free-text box. The wording is read from a shared constant so that what is displayed is what the
 * server records.
 *
 * The filer must be able to read the whole declaration before accepting it, so the text is never
 * truncated or hidden behind a tooltip.
 */
function DeclarationCheckbox({ fieldId, label, checked, onChange, disabled = false }) {
	const text = declarationText(fieldId)

	return (
		<div className="declaration tenancy-field-full">
			{label ? <p className="declaration__label label-text required">{label}</p> : null}
			<label className={`declaration__box${checked ? ' is-checked' : ''}`}>
				<input
					type="checkbox"
					checked={checked}
					onChange={(e) => onChange(e.target.checked)}
					disabled={disabled}
					required
				/>
				<span className="declaration__body">
					<span className="declaration__text">{text}</span>
					<span className="declaration__note">
						Ticking this records the declaration against your name, with the date and time.
					</span>
				</span>
			</label>
		</div>
	)
}

export default DeclarationCheckbox
