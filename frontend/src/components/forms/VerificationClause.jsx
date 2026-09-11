import { useId } from 'react'
import {
	PARA_ANSWER,
	VERIFICATION_RELATIONS,
	VERIFICATION_TEMPLATE,
	paragraphsWithAnswer,
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
 * `variant="modern"` uses relation toggles and a clearer place/date row for the Rent Authority
 * modern shell; legacy forms keep the original embedded layout.
 */
function VerificationClause({
	fieldId,
	values,
	onChange,
	onParagraphChange,
	prefilled = false,
	embedded = false,
	variant = 'default',
}) {
	const id = useId()
	const modern = variant === 'modern'
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

	const relationControl = modern ? (
		<span key="relation" className="verification__relation-toggles" role="radiogroup" aria-label="Relation">
			{VERIFICATION_RELATIONS.map((relation) => {
				const selected = values.relation === relation
				return (
					<label
						key={relation}
						className={`verification__relation-toggle${selected ? ' is-selected' : ''}`}
					>
						<input
							type="radio"
							name={`${id}-relation`}
							value={relation}
							checked={selected}
							onChange={() => onChange('relation', relation)}
							className="sr-only"
						/>
						<span>{relation}</span>
					</label>
				)
			})}
		</span>
	) : (
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
	)

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
		':relation': relationControl,
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
		<div
			className={`clause verification${embedded ? ' clause--embedded' : ''}${
				modern ? ' verification--modern' : ''
			}`}
		>
			{embedded ? null : <p className="clause__heading">VERIFICATION</p>}

			{embedded ? (
				<p className="verification__guide">
					{modern
						? 'Complete the sworn sentence below. Mark which paragraphs you know personally and which you believe on legal advice, then enter the place of verification.'
						: 'Fill each underlined blank in the sentence. Use the paragraph pickers to mark what you know personally and what you believe on legal advice.'}
				</p>
			) : null}

			{modern ? (
				<p className="verification__block-label">Sworn statement</p>
			) : null}

			<div className="verification__oath">
				<ClauseSentence template={VERIFICATION_TEMPLATE} blanks={blanks} />
			</div>

			<div className="verification__foot">
				<label className="verification__place">
					<span className="label-text required">Place of verification</span>
					<input
						type="text"
						className={embedded ? undefined : 'clause__blank clause__blank--name'}
						value={values.place}
						onChange={(e) => onChange('place', e.target.value)}
						placeholder="e.g. Guwahati"
						required
					/>
				</label>

				<div className="verification__date">
					<span className="label-text">Date</span>
					<span className="verification__date-value">Stamped automatically when you submit</span>
				</div>
			</div>

			{prefilled ? (
				<p className="clause__note clause__note--prefilled" id={`${id}-prefill`}>
					Some details were filled from your profile or the tenancy record — check they are correct
					before submitting.
				</p>
			) : null}
		</div>
	)
}

export default VerificationClause
