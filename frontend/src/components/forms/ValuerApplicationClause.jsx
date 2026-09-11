import {
	FORM_IB_APPLICATION_TEMPLATE,
	FORM_IB_RELATIONS,
	FORM_IB_UNDERTAKING_TEXT,
} from '../../constants/declarations'
import ClauseSentence from './ClauseSentence'

/**
 * Filled blank shown as underlined prose (from UIN / side selection), not an input.
 */
function FilledBlank({ value, label, empty = '…………' }) {
	const text = String(value ?? '').trim()
	return (
		<span
			className={`clause__filled${text ? ' is-filled' : ' is-empty'}`}
			aria-label={label}
			title={label}
		>
			{text || empty}
		</span>
	)
}

/**
 * The body of Form I-B, p.4182.
 *
 * Unlike Forms II to VI this form has no numbered paragraphs and no VERIFICATION clause. It is a
 * recital the applicant completes about themselves and the premises, followed by a free-standing
 * undertaking to bear the valuer's fee. Both are things the applicant asserts, so both are shown as
 * the sentences the Gazette prints and both are recorded on submission.
 *
 * The undertaking is not a checkbox. The printed form gives the applicant no way to decline it -
 * rule 5(4) puts the fee on "the aggrieved party, who has filed the application" - so offering a
 * tick would imply a choice that does not exist. It is stated, and filing makes it.
 *
 * Name, residence, capacity, premises and district are filled from the tenancy / selected side.
 * Only relation and relative name stay as blanks the filer completes.
 */
function ValuerApplicationClause({
	values,
	onChange,
	prefilled = false,
	embedded = false,
	capacityLabel = 'landlord',
	sideSyncMessage = null,
}) {
	const blanks = {
		':name': <FilledBlank key="name" value={values.name} label="Name of the applicant" />,
		':relation': (
			<select
				key="relation"
				className="clause__blank clause__blank--relation"
				aria-label="Son, daughter or wife of"
				value={values.relation}
				onChange={(e) => onChange('relation', e.target.value)}
				required
			>
				{FORM_IB_RELATIONS.map((relation) => (
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
				aria-label="Name of father, mother or husband as applicable"
				placeholder="…………"
				value={values.relativeName}
				onChange={(e) => onChange('relativeName', e.target.value)}
				required
			/>
		),
		':residence': (
			<FilledBlank key="residence" value={values.residence} label="Place at which the applicant resides" />
		),
		':capacity': (
			<FilledBlank key="capacity" value={capacityLabel} label="Applying as landlord or as tenant" />
		),
		':premises': (
			<FilledBlank
				key="premises"
				value={values.premises}
				label="Address at which the premises are situated"
			/>
		),
		':district': (
			<FilledBlank key="district" value={values.district} label="District in which the premises are situated" />
		),
	}

	return (
		<div className={`clause${embedded ? ' clause--embedded' : ''}`}>
			{embedded ? null : <p className="clause__heading">APPLICATION</p>}

			{sideSyncMessage ? (
				<p className="clause__sync-note" role="status">
					{sideSyncMessage}
				</p>
			) : null}

			<div className="verification__oath">
				<p className="clause__block-label">Application</p>
				<ClauseSentence template={FORM_IB_APPLICATION_TEMPLATE} blanks={blanks} />
			</div>

			<div className="clause__undertaking-block">
				<p className="clause__block-label">Fee undertaking</p>
				<p className="clause__sentence clause__sentence--undertaking verification__undertaking">
					{FORM_IB_UNDERTAKING_TEXT}
				</p>
			</div>

			<p className={`clause__note${prefilled ? ' clause__note--prefilled' : ''}`}>
				{prefilled
					? 'Name, residence, capacity, premises and district come from the tenancy record for the side you chose (Landlord or Tenant). Check they are correct, then complete the relation blanks. '
					: null}
				Submitting records both sentences against your name, with the date and time. Under rule 5(4)
				the valuer&rsquo;s fee is borne by the party who files this application.
			</p>
		</div>
	)
}

export default ValuerApplicationClause
