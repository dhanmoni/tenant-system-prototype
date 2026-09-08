import { declarationBranchText, declarationText } from '../../constants/declarations'
import { emptyPriorProceeding, PRIOR_STATUS } from '../../constants/priorProceedings'

/**
 * Paragraph 5 of Forms II to VI, "Matters not previously filed or pending with any other court".
 *
 * The paragraph is a negative declaration with an affirmative branch. Either the filer declares
 * that no such proceeding was filed or is pending, or the form requires "the details of the
 * pendency of such cases filed, or if disposed, the decisions of such cases to be enclosed".
 *
 * So the control is a yes/no, not a textarea. Answering "no such proceeding" makes the declaration
 * and it is recorded; answering "yes" means the declaration is not made and the particulars are
 * required instead.
 */
function PriorProceedingsField({ fieldId, label, hasPrior, onHasPriorChange, entries, onEntriesChange }) {
	const declaration = declarationText(fieldId)
	const branch = declarationBranchText(fieldId)

	const updateEntry = (index, patch) => {
		onEntriesChange(entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)))
	}

	const addEntry = () => onEntriesChange([...entries, emptyPriorProceeding()])

	const removeEntry = (index) => onEntriesChange(entries.filter((_, i) => i !== index))

	return (
		<div className="declaration tenancy-field-full">
			<p className="label-text required">{label}</p>

			<div className="ground-choice-group" role="radiogroup" aria-label={label}>
				<label className="ground-choice">
					<input
						type="radio"
						name={`${fieldId}__has_prior`}
						checked={hasPrior === false}
						onChange={() => onHasPriorChange(false)}
					/>
					<span className="ground-choice__body">
						<span className="ground-choice__label">I make this declaration</span>
						<span className="ground-choice__text">{declaration}</span>
					</span>
				</label>

				<label className="ground-choice">
					<input
						type="radio"
						name={`${fieldId}__has_prior`}
						checked={hasPrior === true}
						onChange={() => {
							onHasPriorChange(true)
							if (entries.length === 0) onEntriesChange([emptyPriorProceeding()])
						}}
					/>
					<span className="ground-choice__body">
						<span className="ground-choice__label">
							I have previously filed, or there is pending, such a proceeding
						</span>
						<span className="ground-choice__text">{branch}</span>
					</span>
				</label>
			</div>

			{hasPrior === false ? (
				<p className="declaration__note">
					Choosing this records the declaration above against your name, with the date and time.
				</p>
			) : null}

			{hasPrior === true ? (
				<div className="prior-proceedings">
					{entries.map((entry, index) => (
						<fieldset key={index} className="prior-proceeding">
							<legend>Case {index + 1}</legend>

							<label>
								<span className="label-text required">Case number</span>
								<input
									type="text"
									value={entry.case_number}
									onChange={(e) => updateEntry(index, { case_number: e.target.value })}
									maxLength={128}
								/>
							</label>

							<label>
								<span className="label-text required">Court, authority or Bench</span>
								<input
									type="text"
									value={entry.forum}
									onChange={(e) => updateEntry(index, { forum: e.target.value })}
									maxLength={255}
								/>
							</label>

							<label>
								<span className="label-text">Date of filing</span>
								<input
									type="date"
									value={entry.filing_date}
									onChange={(e) => updateEntry(index, { filing_date: e.target.value })}
								/>
							</label>

							<label>
								<span className="label-text required">Status</span>
								<select
									value={entry.status}
									onChange={(e) => updateEntry(index, { status: e.target.value })}
								>
									<option value={PRIOR_STATUS.PENDING}>Pending</option>
									<option value={PRIOR_STATUS.DISPOSED}>Disposed</option>
								</select>
							</label>

							{entry.status === PRIOR_STATUS.PENDING ? (
								<label className="tenancy-field-full">
									<span className="label-text required">Details of the pendency</span>
									<textarea
										value={entry.pendency_details}
										onChange={(e) => updateEntry(index, { pendency_details: e.target.value })}
										rows={2}
										maxLength={2000}
									/>
								</label>
							) : (
								<label className="tenancy-field-full">
									<span className="label-text required">Decision</span>
									<span className="field-note">
										The form requires the decision in a disposed case to be enclosed. It will be
										added to the list of enclosures at paragraph 8.
									</span>
									<textarea
										value={entry.decision}
										onChange={(e) => updateEntry(index, { decision: e.target.value })}
										rows={2}
										maxLength={2000}
									/>
								</label>
							)}

							{entries.length > 1 ? (
								<div className="tenancy-field-full prior-proceeding__actions">
									<button
										type="button"
										className="ws-btn ws-btn--outline"
										onClick={() => removeEntry(index)}
									>
										Remove case {index + 1}
									</button>
								</div>
							) : null}
						</fieldset>
					))}

					<button type="button" className="ws-btn ws-btn--outline" onClick={addEntry}>
						Add another case
					</button>
				</div>
			) : null}
		</div>
	)
}

export default PriorProceedingsField
