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
import InlineParagraphSelector from './InlineParagraphSelector'

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

function VerificationClause({ fieldId, values, onChange, onParagraphChange, prefilled = false }) {
	const id = useId()
	const paragraphs = verificationParagraphs(fieldId)
	const answers = values.paragraphs || {}

	const personal = paragraphsWithAnswer(fieldId, answers, PARA_ANSWER.PERSONAL_KNOWLEDGE)
	const advised = paragraphsWithAnswer(fieldId, answers, PARA_ANSWER.LEGAL_ADVICE)

	const paraOptions = Object.entries(paragraphs).map(([number, heading]) => ({
		number: Number(number),
		heading,
	}))

	const toggleParagraphAnswer = (number, answer) => {
		const num = Number(number)
		const currentAnswer = answers[num]
		if (currentAnswer === answer) {
			onParagraphChange(num, PARA_ANSWER.NOT_VERIFIED)
		} else {
			onParagraphChange(num, answer)
		}
	}

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
		// The two paragraph blanks are filled from the inline dropdowns, not typed. Asking a filer to
		// work out their own paragraph ranges invites contradictions the form cannot catch.
		':personal_paras': (
			<InlineParagraphSelector
				key="personal_paras"
				label="True to personal knowledge"
				options={paraOptions}
				selectedParas={personal}
				onToggle={(num) => toggleParagraphAnswer(num, PARA_ANSWER.PERSONAL_KNOWLEDGE)}
				ariaLabel="Paragraphs true to personal knowledge"
			/>
		),
		':advised_paras': (
			<InlineParagraphSelector
				key="advised_paras"
				label="Believed true on legal advice"
				options={paraOptions}
				selectedParas={advised}
				onToggle={(num) => toggleParagraphAnswer(num, PARA_ANSWER.LEGAL_ADVICE)}
				ariaLabel="Paragraphs believed true on legal advice"
			/>
		),
	}

	return (
		<div className="clause verification">
			<p className="clause__heading">VERIFICATION</p>

			<ClauseSentence template={VERIFICATION_TEMPLATE} blanks={blanks} />

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
		</div>
	)
}

export default VerificationClause
