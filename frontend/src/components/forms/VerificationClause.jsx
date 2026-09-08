import { useId } from 'react'
import {
	PARA_ANSWER,
	VERIFICATION_RELATIONS,
	VERIFICATION_TEMPLATE,
	paragraphsWithAnswer,
	renderParagraphNumbers,
	verificationParagraphs,
} from '../../constants/declarations'
import ClauseSentence from './ClauseSentence'

/**
 * The VERIFICATION clause of Forms II to VI.
 *
 * The Gazette prints one continuous sworn sentence with blanks in it. Shredding that into a grid of
 * labelled boxes loses the thing that matters: the filer never reads the sentence they are swearing
 * to. So the sentence is rendered as a sentence, with the blanks as inline controls.
 *
 * The prose is not written out in this file. It is split out of VERIFICATION_TEMPLATE at render
 * time, so the words on screen and the words the server records cannot drift apart - editing the
 * sentence in one place changes both, and a placeholder that is renamed on one side breaks loudly
 * rather than silently rendering the wrong oath.
 *
 * Each blank carries an aria-label, because visually the sentence supplies the context and a screen
 * reader reading the inputs alone would not.
 */

/** Column headings, reused as the per-cell label once the table collapses on narrow screens. */
const ANSWER_LABEL = {
	[PARA_ANSWER.PERSONAL_KNOWLEDGE]: 'True to my personal knowledge',
	[PARA_ANSWER.LEGAL_ADVICE]: 'Believed true on legal advice',
	[PARA_ANSWER.NOT_VERIFIED]: 'Not verified',
}

const ANSWER_ORDER = [
	PARA_ANSWER.PERSONAL_KNOWLEDGE,
	PARA_ANSWER.LEGAL_ADVICE,
	PARA_ANSWER.NOT_VERIFIED,
]

function VerificationClause({ fieldId, values, onChange, onParagraphChange, prefilled = false }) {
	const id = useId()
	const paragraphs = verificationParagraphs(fieldId)
	const answers = values.paragraphs || {}

	const personal = paragraphsWithAnswer(fieldId, answers, PARA_ANSWER.PERSONAL_KNOWLEDGE)
	const advised = paragraphsWithAnswer(fieldId, answers, PARA_ANSWER.LEGAL_ADVICE)

	const blanks = {
		':name': (
			<input
				key="name"
				type="text"
				className="clause__blank clause__blank--name"
				aria-label="Name of the applicant"
				value={values.name}
				onChange={(e) => onChange('name', e.target.value)}
				required
			/>
		),
		':relation': (
			<select
				key="relation"
				className="clause__blank clause__blank--relation"
				aria-label="Son of, wife of, or daughter of"
				value={values.relation}
				onChange={(e) => onChange('relation', e.target.value)}
				required
			>
				{VERIFICATION_RELATIONS.map((relation) => (
					<option key={relation} value={relation}>
						{relation}
					</option>
				))}
			</select>
		),
		':relative_name': (
			<input
				key="relative_name"
				type="text"
				className="clause__blank clause__blank--name"
				aria-label="Name of father, husband or mother as applicable"
				value={values.relativeName}
				onChange={(e) => onChange('relativeName', e.target.value)}
				required
			/>
		),
		':age': (
			<input
				key="age"
				type="number"
				min="1"
				max="120"
				className="clause__blank clause__blank--age"
				aria-label="Age in years"
				value={values.age}
				onChange={(e) => onChange('age', e.target.value)}
				required
			/>
		),
		':address': (
			<input
				key="address"
				type="text"
				className="clause__blank clause__blank--address"
				aria-label="Address at which the applicant resides"
				value={values.address}
				onChange={(e) => onChange('address', e.target.value)}
				required
			/>
		),
		// The two paragraph blanks are filled from the table below, not typed. Asking a filer to
		// work out their own paragraph ranges invites contradictions the form cannot catch.
		':personal_paras': (
			<span key="personal_paras" className="clause__filled" aria-live="polite">
				{renderParagraphNumbers(personal)}
			</span>
		),
		':advised_paras': (
			<span key="advised_paras" className="clause__filled" aria-live="polite">
				{renderParagraphNumbers(advised)}
			</span>
		),
	}

	return (
		<div className="clause verification">
			<p className="clause__heading">VERIFICATION</p>

			<ClauseSentence template={VERIFICATION_TEMPLATE} blanks={blanks} />

			<fieldset className="verification__paras" id={`${id}-paras`}>
				<legend>Which paragraphs are you verifying, and how?</legend>
				<p className="verification__paras-hint">
					The two blanks in the sentence above are filled from your answers here. Leave a paragraph
					unmarked if you are not verifying it.
				</p>

				<table className="verification__table">
					<thead>
						<tr>
							<th scope="col">Paragraph</th>
							{ANSWER_ORDER.map((answer) => (
								<th key={answer} scope="col">
									{ANSWER_LABEL[answer]}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{Object.entries(paragraphs).map(([number, heading]) => (
							<tr key={number}>
								<th scope="row">
									<span className="verification__para-number">{number}.</span> {heading}
								</th>
								{ANSWER_ORDER.map((answer) => (
									<td key={answer} data-answer={ANSWER_LABEL[answer]}>
										<label className="verification__radio">
											<input
												type="radio"
												name={`${id}-para-${number}`}
												value={answer}
												checked={answers[number] === answer}
												onChange={() => onParagraphChange(Number(number), answer)}
											/>
											<span className="verification__sr-only">
												Paragraph {number}, {heading}: {ANSWER_LABEL[answer]}
											</span>
										</label>
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</fieldset>

			<div className="verification__foot">
				{/* Printed on one line at the foot of the form, so set inline rather than as a field. */}
				<label className="verification__place">
					<span className="label-text required">Place</span>
					<input
						type="text"
						className="clause__blank clause__blank--name"
						value={values.place}
						onChange={(e) => onChange('place', e.target.value)}
						required
					/>
				</label>

				{/*
				  * The Gazette prints "Date:" here as a blank. In an online filing the date of
				  * verification is the moment of submission, so it is stamped by the server rather
				  * than typed - a typed date could be back-dated against the limitation paragraph of
				  * Forms V and VI.
				  */}
				<p className="verification__date">
					<span className="label-text">Date</span>
					<span className="verification__date-value">Stamped when you submit</span>
				</p>
			</div>

			<p className="clause__note">
				Submitting records this verification against your name, with the date and time. Proceedings
				before the Rent Court and the Rent Tribunal are judicial proceedings under section 36(2) of
				the Act, and section 31 applies the same to the Rent Authority.
			</p>
		</div>
	)
}

export default VerificationClause
