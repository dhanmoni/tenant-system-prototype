import { Info } from 'lucide-react'
import { declarationBranchText, declarationText } from '../../constants/declarations'
import { emptyPriorProceeding, PRIOR_STATUS } from '../../constants/priorProceedings'

/**
 * Paragraph 5 of Forms II to VI, "Matters not previously filed or pending with any other court".
 *
 * `variant="modern"` uses compact cards and field shells for the Rent Authority modern forms.
 */
function PriorProceedingsField({
	fieldId,
	label,
	hint,
	hasPrior,
	onHasPriorChange,
	entries,
	onEntriesChange,
	variant = 'default',
}) {
	const declaration = declarationText(fieldId)
	const branch = declarationBranchText(fieldId)
	const modern = variant === 'modern'

	const updateEntry = (index, patch) => {
		onEntriesChange(entries.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)))
	}

	const addEntry = () => onEntriesChange([...entries, emptyPriorProceeding()])

	const removeEntry = (index) => onEntriesChange(entries.filter((_, i) => i !== index))

	if (modern) {
		return (
			<div className="form-iv-prior">
				{hint ? <p className="form-iv-prior__hint">{hint}</p> : null}

				<div className="form-iv-prior__choices" role="radiogroup" aria-label={label || 'Earlier proceedings'}>
					<label
						className={`form-iv-prior__choice form-iv-prior__choice--compact${
							hasPrior === false ? ' is-selected' : ''
						}`}
					>
						<input
							type="radio"
							name={`${fieldId}__has_prior`}
							checked={hasPrior === false}
							onChange={() => onHasPriorChange(false)}
						/>
						<span className="form-iv-prior__choice-title">No — I have not filed this matter elsewhere</span>
						<span
							className="form-iv-prior__info"
							role="note"
							tabIndex={0}
							aria-label={declaration}
							onClick={(e) => {
								e.preventDefault()
								e.stopPropagation()
							}}
							onMouseDown={(e) => {
								e.preventDefault()
								e.stopPropagation()
							}}
						>
							<Info size={15} aria-hidden />
							<span className="form-iv-prior__info-popup" role="tooltip">
								{declaration}
							</span>
						</span>
					</label>

					<label
						className={`form-iv-prior__choice form-iv-prior__choice--compact${
							hasPrior === true ? ' is-selected' : ''
						}`}
					>
						<input
							type="radio"
							name={`${fieldId}__has_prior`}
							checked={hasPrior === true}
							onChange={() => {
								onHasPriorChange(true)
								if (entries.length === 0) onEntriesChange([emptyPriorProceeding()])
							}}
						/>
						<span className="form-iv-prior__choice-title">Yes — a related case was filed or is pending</span>
						<span
							className="form-iv-prior__info"
							role="note"
							tabIndex={0}
							aria-label={branch}
							onClick={(e) => {
								e.preventDefault()
								e.stopPropagation()
							}}
							onMouseDown={(e) => {
								e.preventDefault()
								e.stopPropagation()
							}}
						>
							<Info size={15} aria-hidden />
							<span className="form-iv-prior__info-popup" role="tooltip">
								{branch}
							</span>
						</span>
					</label>
				</div>

				{hasPrior === true ? (
					<div className="form-iv-prior__table-wrap">
						<div className="form-iv-prior__table-head">
							<p className="form-iv-prior__table-title">Particulars of earlier proceedings</p>
							<p className="form-iv-prior__table-note">
								Fill one row per case. For disposed cases, enclose the decision with the list of enclosures.
							</p>
						</div>

						<div className="form-iv-prior__table" role="table" aria-label="Earlier proceedings">
							<div className="form-iv-prior__tr form-iv-prior__tr--head" role="row">
								<div className="form-iv-prior__th form-iv-prior__col-no" role="columnheader">
									#
								</div>
								<div className="form-iv-prior__th form-iv-prior__col-case" role="columnheader">
									Case no. *
								</div>
								<div className="form-iv-prior__th form-iv-prior__col-forum" role="columnheader">
									Court / forum *
								</div>
								<div className="form-iv-prior__th form-iv-prior__col-date" role="columnheader">
									Filed on
								</div>
								<div className="form-iv-prior__th form-iv-prior__col-status" role="columnheader">
									Status *
								</div>
								<div className="form-iv-prior__th form-iv-prior__col-actions" role="columnheader">
									<span className="sr-only">Actions</span>
								</div>
							</div>

							{entries.map((entry, index) => (
								<div key={index} className="form-iv-prior__case-block" role="rowgroup">
									<div className="form-iv-prior__tr form-iv-prior__tr--main" role="row">
										<div className="form-iv-prior__td form-iv-prior__col-no" role="cell" data-label="#">
											<span className="form-iv-prior__row-no">{index + 1}</span>
										</div>
										<div
											className="form-iv-prior__td form-iv-prior__col-case"
											role="cell"
											data-label="Case number"
										>
											<input
												type="text"
												value={entry.case_number}
												onChange={(e) => updateEntry(index, { case_number: e.target.value })}
												maxLength={128}
												placeholder="Case No."
												aria-label={`Case ${index + 1} number`}
												required
											/>
										</div>
										<div
											className="form-iv-prior__td form-iv-prior__col-forum"
											role="cell"
											data-label="Court / forum"
										>
											<input
												type="text"
												value={entry.forum}
												onChange={(e) => updateEntry(index, { forum: e.target.value })}
												maxLength={255}
												placeholder="Forum"
												aria-label={`Case ${index + 1} forum`}
												required
											/>
										</div>
										<div
											className="form-iv-prior__td form-iv-prior__col-date"
											role="cell"
											data-label="Filed on"
										>
											<input
												type="date"
												value={entry.filing_date}
												onChange={(e) => updateEntry(index, { filing_date: e.target.value })}
												aria-label={`Case ${index + 1} filing date`}
											/>
										</div>
										<div
											className="form-iv-prior__td form-iv-prior__col-status"
											role="cell"
											data-label="Status"
										>
											<div
												className="form-iv-prior__status"
												role="radiogroup"
												aria-label={`Case ${index + 1} status`}
											>
												<label
													className={`form-iv-prior__status-option${
														entry.status === PRIOR_STATUS.PENDING ? ' is-selected' : ''
													}`}
												>
													<input
														type="radio"
														name={`${fieldId}__status_${index}`}
														value={PRIOR_STATUS.PENDING}
														checked={entry.status === PRIOR_STATUS.PENDING}
														onChange={() =>
															updateEntry(index, { status: PRIOR_STATUS.PENDING })
														}
														className="sr-only"
													/>
													<span>Pending</span>
												</label>
												<label
													className={`form-iv-prior__status-option${
														entry.status === PRIOR_STATUS.DISPOSED ? ' is-selected' : ''
													}`}
												>
													<input
														type="radio"
														name={`${fieldId}__status_${index}`}
														value={PRIOR_STATUS.DISPOSED}
														checked={entry.status === PRIOR_STATUS.DISPOSED}
														onChange={() =>
															updateEntry(index, { status: PRIOR_STATUS.DISPOSED })
														}
														className="sr-only"
													/>
													<span>Disposed</span>
												</label>
											</div>
										</div>
										<div
											className="form-iv-prior__td form-iv-prior__col-actions"
											role="cell"
											data-label="Actions"
										>
											{entries.length > 1 ? (
												<button
													type="button"
													className="form-iv-prior__remove"
													onClick={() => removeEntry(index)}
												>
													Remove
												</button>
											) : (
												<span className="form-iv-prior__actions-empty">—</span>
											)}
										</div>
									</div>

									<div className="form-iv-prior__tr form-iv-prior__tr--detail" role="row">
										<div
											className="form-iv-prior__td form-iv-prior__col-detail"
											role="cell"
											data-label={
												entry.status === PRIOR_STATUS.PENDING
													? 'Pendency details'
													: 'Decision'
											}
										>
											<span className="form-iv-prior__detail-label">
												{entry.status === PRIOR_STATUS.PENDING
													? 'Pendency details *'
													: 'Decision *'}
											</span>
											{entry.status === PRIOR_STATUS.PENDING ? (
												<textarea
													value={entry.pendency_details}
													onChange={(e) =>
														updateEntry(index, { pendency_details: e.target.value })
													}
													rows={2}
													maxLength={2000}
													placeholder="Stage / where pending"
													aria-label={`Case ${index + 1} pendency details`}
													required
												/>
											) : (
												<textarea
													value={entry.decision}
													onChange={(e) => updateEntry(index, { decision: e.target.value })}
													rows={2}
													maxLength={2000}
													placeholder="Decision summary — enclose copy under paragraph 8"
													aria-label={`Case ${index + 1} decision`}
													required
												/>
											)}
										</div>
									</div>
								</div>
							))}
						</div>

						<button type="button" className="form-iv-prior__add" onClick={addEntry}>
							+ Add another case
						</button>
					</div>
				) : null}
			</div>
		)
	}

	return (
		<div className="declaration tenancy-field-full">
			{label ? <p className="label-text required">{label}</p> : null}
			{hint ? <p className="sf-field__hint">{hint}</p> : null}

			<div className="ground-choice-group" role="radiogroup" aria-label={label || 'Earlier proceedings'}>
				<label className="ground-choice">
					<input
						type="radio"
						name={`${fieldId}__has_prior`}
						checked={hasPrior === false}
						onChange={() => onHasPriorChange(false)}
					/>
					<span
						className="ground-choice__body"
						style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}
					>
						<span className="ground-choice__label" style={{ marginBottom: 0 }}>
							No — I have not filed this matter elsewhere
						</span>
						<div className="ground-choice__info-container">
							<Info size={16} className="text-muted-foreground" style={{ cursor: 'help' }} />
							<div className="ground-choice__info-popup">
								<span>{declaration}</span>
							</div>
						</div>
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
					<span
						className="ground-choice__body"
						style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}
					>
						<span className="ground-choice__label" style={{ marginBottom: 0 }}>
							Yes — a related case was filed or is pending
						</span>
						<div className="ground-choice__info-container">
							<Info size={16} className="text-muted-foreground" style={{ cursor: 'help' }} />
							<div className="ground-choice__info-popup">
								<span>{branch}</span>
							</div>
						</div>
					</span>
				</label>
			</div>

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
									<span
										className="label-text required"
										style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
									>
										Decision
										<div className="ground-choice__info-container">
											<Info size={16} className="text-muted-foreground" style={{ cursor: 'help' }} />
											<div className="ground-choice__info-popup">
												<span>
													The form requires the decision in a disposed case to be enclosed. It will
													be added to the list of enclosures at paragraph 8.
												</span>
											</div>
										</div>
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
