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
			<p className="label-text required">{label}</p>
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
			<p className="declaration__note">
				Ticking this records the declaration above against your name, with the date and time.
				It is reproduced on the filing exactly as printed in the form.
			</p>
		</div>
	)
}

export default DeclarationCheckbox
