import {
	FORM_IB_APPLICATION_TEMPLATE,
	FORM_IB_CAPACITIES,
	FORM_IB_RELATIONS,
	FORM_IB_UNDERTAKING_TEXT,
} from '../../constants/declarations'
import ClauseSentence from './ClauseSentence'

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
 */
function ValuerApplicationClause({ values, onChange, prefilled = false }) {
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
				value={values.relativeName}
				onChange={(e) => onChange('relativeName', e.target.value)}
				required
			/>
		),
		':residence': (
			<input
				key="residence"
				type="text"
				className="clause__blank clause__blank--address"
				aria-label="Place at which the applicant resides"
				value={values.residence}
				onChange={(e) => onChange('residence', e.target.value)}
				required
			/>
		),
		':capacity': (
			<select
				key="capacity"
				className="clause__blank clause__blank--relation"
				aria-label="Applying as landlord or as tenant"
				value={values.capacity}
				onChange={(e) => onChange('capacity', e.target.value)}
				required
			>
				{FORM_IB_CAPACITIES.map((capacity) => (
					<option key={capacity} value={capacity}>
						{capacity}
					</option>
				))}
			</select>
		),
		':premises': (
			<input
				key="premises"
				type="text"
				className="clause__blank clause__blank--address"
				aria-label="Address at which the premises are situated"
				value={values.premises}
				onChange={(e) => onChange('premises', e.target.value)}
				required
			/>
		),
		':district': (
			<input
				key="district"
				type="text"
				className="clause__blank clause__blank--name"
				aria-label="District in which the premises are situated"
				value={values.district}
				onChange={(e) => onChange('district', e.target.value)}
				required
			/>
		),
	}

	return (
		<div className="clause">
			<p className="clause__heading">APPLICATION</p>

			<ClauseSentence template={FORM_IB_APPLICATION_TEMPLATE} blanks={blanks} />

			<p className="clause__sentence clause__sentence--undertaking">
				{FORM_IB_UNDERTAKING_TEXT}
			</p>

			<p className="clause__note">
				Submitting records both sentences against your name, with the date and time. Under rule
				5(4) the valuer&rsquo;s fee is borne by the party who files this application.
			</p>
		</div>
	)
}

export default ValuerApplicationClause
