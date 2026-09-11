/**
 * Sworn declarations printed on the service forms, verbatim. Mirrors
 * backend/app/Constants/Declarations.php.
 *
 * Paragraph 2 of Forms II to VI is not a question. The parenthetical under the label is the answer,
 * and the filer asserts it. So the control is a checkbox carrying this exact wording, not a textarea.
 *
 * These strings are legally load-bearing. Do not reword them and do not tidy the punctuation:
 * Form IV's declaration closes without a full stop while the others close with one, and that
 * difference is in the Gazette. See docs/gazette-divergences.md item E1.
 *
 * The server never trusts this copy — it writes the snapshot from its own constant. This exists so
 * the filer reads exactly what will be recorded against their name.
 */

export const DECLARATION = {
	FORM_II_JURISDICTION: 'form_ii.para_2_jurisdiction',
	FORM_III_JURISDICTION: 'form_iii.para_2_jurisdiction',
	FORM_IV_JURISDICTION: 'form_iv.para_2_jurisdiction',
	FORM_V_JURISDICTION: 'form_v.para_2_jurisdiction',
	FORM_VI_JURISDICTION: 'form_vi.para_2_jurisdiction',
	FORM_V_LIMITATION: 'form_v.para_3_limitation',
	FORM_VI_LIMITATION: 'form_vi.para_3_limitation',
	FORM_II_PRIOR_PROCEEDINGS: 'form_ii.para_5_prior_proceedings',
	FORM_III_PRIOR_PROCEEDINGS: 'form_iii.para_5_prior_proceedings',
	FORM_IV_PRIOR_PROCEEDINGS: 'form_iv.para_5_prior_proceedings',
	FORM_V_PRIOR_PROCEEDINGS: 'form_v.para_5_prior_proceedings',
	FORM_VI_PRIOR_PROCEEDINGS: 'form_vi.para_5_prior_proceedings',
}

export const DECLARATION_TEXT = {
	[DECLARATION.FORM_II_JURISDICTION]:
		'The applicant declares that the subject matter of this application is within the jurisdiction of the Rent Court.',
	[DECLARATION.FORM_III_JURISDICTION]:
		'The applicant declares that the subject matter of this application is within the jurisdiction of the Rent Court.',
	[DECLARATION.FORM_IV_JURISDICTION]:
		'The applicant declares that the subject matter of this application is within the jurisdiction of the Rent Authority',
	[DECLARATION.FORM_V_JURISDICTION]:
		'The appellant declares that the subject matter of appeal as against which he wants redressal is within the jurisdiction of the Rent Court.',
	[DECLARATION.FORM_VI_JURISDICTION]:
		'The appellant declares that the subject matter of appeal as against which he wants redressal is within the jurisdiction of the Rent Tribunal.',

	// Paragraph 3 of Forms V and VI is Limitation, and the parenthetical under the label IS the
	// answer, so it is a declaration rather than a textarea. Form VI's citation of "section 38" is
	// the Gazette's own slip and Form V prints "Act No XXXI" where VI prints "Act No. XXXI";
	// neither is corrected. See docs/gazette-divergences.md.
	[DECLARATION.FORM_V_LIMITATION]:
		'The appellant further declares that the appeal is within the limitation period prescribed in sub-section (2) of section 32 of the Assam Tenancy Act (Act No XXXI of 2021)',
	[DECLARATION.FORM_VI_LIMITATION]:
		'The appellant further declares that the appeal is within the limitation period prescribed in sub-section (1) of section 38 of the Assam Tenancy Act (Act No. XXXI of 2021)',

	// Paragraph 5, first limb: the negative declaration. Only this sentence is asserted.
	[DECLARATION.FORM_II_PRIOR_PROCEEDINGS]:
		'The applicant further declares that he/she had not previously filed any application, petition, writ petition or suit regarding the matter in respect of which this application has been made, before any court or any other authority or any other Bench of the Tribunal nor any such application, writ petition or suit is pending before any of them.',
	[DECLARATION.FORM_III_PRIOR_PROCEEDINGS]:
		'The applicant further declares that he/she had not previously filed any application, petition, writ petition or suit regarding the matter in respect of which this application has been made, before any court or any other authority or any other Bench of the Tribunal nor any such application, writ petition or suit is pending before any of them.',
	[DECLARATION.FORM_IV_PRIOR_PROCEEDINGS]:
		'The applicant further declares that he/she had not previously filed any application, petition, writ petition or suit regarding the matter in respect of which this application has been made, before any court or any other authority or any other Bench of the any tribunal nor any such application, writ petition or suit is pending before any of them.',
	[DECLARATION.FORM_V_PRIOR_PROCEEDINGS]:
		'The appellant further declares that he/she had not previously filed any application, petition, writ petition or suit regarding the matter in respect of which this appeal has been made, before any court or any other authority or any other Bench of the Tribunal nor any such application, writ petition or suit is pending before any of them.',
	[DECLARATION.FORM_VI_PRIOR_PROCEEDINGS]:
		'The appellant further declares that he/she had not previously filed any application, petition, writ petition or suit regarding the matter in respect of which this appeal has been made, before any court or any other authority or any other Bench of the Tribunal nor any such application, writ petition or suit is pending before any of them.',
}

export function declarationText(fieldId) {
	return DECLARATION_TEXT[fieldId] || ''
}

/**
 * The second limb of paragraph 5: what the form requires when the filer HAS previously filed.
 * This is an instruction, not part of what is sworn, so it is shown but never recorded as a
 * declaration. Form IV and Form VI print a semicolon where Forms II, III and V print a comma.
 */
export const DECLARATION_BRANCH_TEXT = {
	[DECLARATION.FORM_II_PRIOR_PROCEEDINGS]:
		'In case the applicant has previously filed any such application, writ petition or suit, the details of the pendency of such cases filed, or if disposed, the decisions of such cases to be enclosed.',
	[DECLARATION.FORM_III_PRIOR_PROCEEDINGS]:
		'In case the applicant has previously filed any such application, writ petition or suit, the details of the pendency of such cases filed, or if disposed, the decisions of such cases to be enclosed.',
	[DECLARATION.FORM_IV_PRIOR_PROCEEDINGS]:
		'In case the applicant has previously filed any such application, writ petition or suit, the details of the pendency of such cases filed; or if disposed, the decisions of such cases to be enclosed.',
	[DECLARATION.FORM_V_PRIOR_PROCEEDINGS]:
		'In case the appellant has previously filed any such application, writ petition or suit, the details of the pendency of such cases filed, or if disposed, the decisions of such cases to be enclosed.',
	[DECLARATION.FORM_VI_PRIOR_PROCEEDINGS]:
		'In case the appellant has previously filed any such application, writ petition or suit, the details of the pendency of such cases filed; or if disposed, the decisions of such cases to be enclosed.',
}

export function declarationBranchText(fieldId) {
	return DECLARATION_BRANCH_TEXT[fieldId] || ''
}

/*
 * The VERIFICATION clause that closes Forms II to VI. Mirrors App\Support\Verification and the
 * template in App\Constants\Declarations.
 *
 * The Gazette prints one sworn sentence with blanks, not a set of fields, so the browser renders it
 * as a sentence with the blanks inline. The filer has to be able to read what they are swearing.
 *
 * The server composes the sentence it records from its own copy of this template; this exists so
 * what the filer reads is what gets recorded.
 */

export const VERIFICATION = {
	FORM_II: 'form_ii.verification',
	FORM_III: 'form_iii.verification',
	FORM_IV: 'form_iv.verification',
	FORM_V: 'form_v.verification',
	FORM_VI: 'form_vi.verification',
}

/**
 * Verbatim, with the printed blanks as named placeholders. Do not reword and do not add the commas
 * that look missing after the relation and after the age - they are missing in the Gazette.
 */
export const VERIFICATION_TEMPLATE =
	'I, :name :relation :relative_name aged :age residing at :address, do hereby verify that the contents of paras :personal_paras are true to my personal knowledge and paras :advised_paras believed to be true on legal advice received and I hereby declare that I have not suppressed any material facts.'

/** As printed. On paper the filer strikes out two; here they pick one. */
export const VERIFICATION_RELATIONS = ['S/o.', 'W/o.', 'D/o.']

export const PARA_ANSWER = {
	PERSONAL_KNOWLEDGE: 'personal_knowledge',
	LEGAL_ADVICE: 'legal_advice',
	NOT_VERIFIED: 'not_verified',
}

/**
 * The paragraphs a filer may assign, under the Gazette's own headings.
 *
 * Paragraphs 2 and 5 are absent because they are themselves sworn declarations, accepted separately
 * under their own wording. Paragraph 8 is absent because a list of enclosures asserts no fact.
 */
export const VERIFICATION_PARAGRAPHS = {
	[VERIFICATION.FORM_II]: {
		1: 'Particulars of application',
		3: 'Facts of the case',
		4: 'Grounds for relief',
		6: 'Relief sought',
		7: 'Interim order, if any prayed for',
	},
	[VERIFICATION.FORM_III]: {
		1: 'Particulars of application',
		3: 'Facts of the case',
		4: 'Grounds for relief',
		6: 'Relief sought',
		7: 'Interim order, if any prayed for',
	},
	[VERIFICATION.FORM_IV]: {
		1: 'Particulars of violation against which the present application is made',
		3: 'Facts of the case',
		4: 'Grounds for relief',
		5: 'Earlier proceedings',
		6: 'Relief sought',
		7: 'Interim order, if any prayed for',
		8: 'List of enclosures',
	},
	// Forms V and VI have no "Facts of the case": para 3 is Limitation, para 4 the Memorandum.
	[VERIFICATION.FORM_V]: {
		1: 'Particulars of the order of the Rent Authority as against which the appeal is made',
		3: 'Limitation',
		4: 'Memorandum of Appeal',
		6: 'Relief sought',
		7: 'Interim order, if any prayed for',
	},
	[VERIFICATION.FORM_VI]: {
		1: 'Particulars of the order of the Rent Court as against which the Appeal is made',
		3: 'Limitation',
		4: 'Memorandum of Appeal',
		6: 'Relief sought',
		7: 'Interim order, if any prayed for',
	},
}

export function verificationParagraphs(fieldId) {
	return VERIFICATION_PARAGRAPHS[fieldId] || {}
}

/**
 * Fill one of the two "paras ... to ..." blanks. Mirrors Verification::renderParagraphs.
 *
 * The printed blank assumes a contiguous run. A filer whose paragraphs are not contiguous gets a
 * list instead, and an empty set reads "nil" - what would be written on the paper form, and what
 * keeps the sentence whole. See docs/gazette-divergences.md items F1 and F2.
 */
export function renderParagraphNumbers(numbers) {
	const sorted = [...new Set(numbers.map(Number))].sort((a, b) => a - b)

	if (sorted.length === 0) return 'nil'
	if (sorted.length === 1) return String(sorted[0])

	const contiguous = sorted[sorted.length - 1] - sorted[0] === sorted.length - 1
	if (contiguous) return `${sorted[0]} to ${sorted[sorted.length - 1]}`

	return `${sorted.slice(0, -1).join(', ')} and ${sorted[sorted.length - 1]}`
}

/** The paragraph numbers carrying a given answer, in order. */
export function paragraphsWithAnswer(fieldId, answers, wanted) {
	return Object.keys(verificationParagraphs(fieldId))
		.map(Number)
		.filter((n) => answers[n] === wanted)
}

/**
 * The completed sentence, for the review screen. Mirrors Verification::compose.
 *
 * The server composes its own copy from its own template and records that one; this is only so the
 * filer can read back what they are about to swear before they submit it.
 */
export function composeVerification(fieldId, values) {
	const personal = paragraphsWithAnswer(fieldId, values.paragraphs || {}, PARA_ANSWER.PERSONAL_KNOWLEDGE)
	const advised = paragraphsWithAnswer(fieldId, values.paragraphs || {}, PARA_ANSWER.LEGAL_ADVICE)

	return VERIFICATION_TEMPLATE.replace(
		/:name|:relation|:relative_name|:age|:address|:personal_paras|:advised_paras/g,
		(token) =>
			({
				':name': values.name,
				':relation': values.relation,
				':relative_name': values.relativeName,
				':age': String(values.age),
				':address': values.address,
				':personal_paras': renderParagraphNumbers(personal),
				':advised_paras': renderParagraphNumbers(advised),
			})[token]
	)
}

/*
 * Form I-B's two sentences. Mirrors App\Support\ValuerApplication and the templates in
 * App\Constants\Declarations.
 *
 * Form I-B has no numbered paragraphs and no VERIFICATION clause. It is a recital the applicant
 * completes about themselves and the premises, plus a free-standing undertaking to bear the
 * valuer's fee. Both are things the applicant asserts, so both are rendered as the sentences they
 * are and both are recorded.
 */

export const FORM_IB = {
	APPLICATION: 'form_i_b.application',
	UNDERTAKING: 'form_i_b.valuer_fee_undertaking',
}

/**
 * Verbatim, p.4182. The spacing before the commas in "resident of ____ , landlord" and
 * "District- ____ , Assam" is the Gazette's; do not tidy it.
 */
export const FORM_IB_APPLICATION_TEMPLATE =
	'I, :name :relation of :relative_name resident of :residence , :capacity of premises situated at :premises District- :district , Assam hereby make this application to appoint the government recognized valuer to evaluate the rent and or other charges of the aforesaid premises.'

export const FORM_IB_UNDERTAKING_TEXT =
	'I hereby agree to bear the fee of the valuer as determined by the Rent Authority.'

/** As printed. The filer strikes out two on paper; here they pick one. */
export const FORM_IB_RELATIONS = ['Son', 'Daughter', 'Spouse']

/** "landlord or tenant of premises situated at" - again a pair to strike one of. */
export const FORM_IB_CAPACITIES = ['landlord', 'tenant']
