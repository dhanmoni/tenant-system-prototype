import {
	DECLARATION,
	PARA_ANSWER,
	VERIFICATION,
	declarationBranchText,
	declarationText,
	paragraphsWithAnswer,
	renderParagraphNumbers,
} from '../../constants/declarations'
import { formatLongDate } from '../../utils/formatters'
import { useLegalSignatureUrl } from '../../hooks/useLegalSignatureUrl'
import { PRIOR_STATUS } from '../../constants/priorProceedings'

function blank(value) {
	const text = String(value ?? '').trim()
	return text || '—'
}

/** Filled Gazette blank — bold + underline so entered values stand out from the printed sentence. */
function VBlank({ children }) {
	const text = blank(children)
	return <strong className="form-iv-legal__blank">{text}</strong>
}

function enclosureLines(listOfEnclosures) {
	const raw = String(listOfEnclosures ?? '').trim()
	if (!raw) return []
	return raw
		.split(/\r?\n/)
		.map((line) => line.replace(/^\s*\d+[.)]\s*/, '').trim())
		.filter(Boolean)
}

/**
 * Print-style FORM-V sheet matching the Gazette physical form ([See rule 12]).
 *
 * Product path: an appeal against an order of the Rent Authority, filed before the Rent Court.
 * The appellant may be either the landlord or the tenant, so the parties are supplied by the
 * panel (which honours the Applying-as toggle) rather than fixed to one side.
 *
 * Paragraph 3 is Limitation and paragraph 4 the Memorandum of Appeal — Forms V/VI have no
 * "Facts of the case". See docs/gazette-divergences.md.
 */
export default function FormVLegalDocument({
	tenancyUIN,
	beforeRentCourt = '',
	courtLine1 = '',
	courtLine2 = '',
	appellantName,
	appellantResidentialAddress,
	respondentName,
	respondentResidentialAddress,
	particularsOfOrder,
	jurisdictionAccepted,
	limitationAccepted,
	memorandumOfAppeal,
	hasPriorProceedings,
	priorProceedings = [],
	reliefSought,
	interimOrderSought,
	listOfEnclosures,
	verification,
	signatureName,
	signatureImage,
	verifiedOn,
}) {
	const signatureUrl = useLegalSignatureUrl(signatureImage)

	const courtBracket =
		String(beforeRentCourt ?? '').trim() ||
		String(courtLine1 ?? '')
			.replace(/^Rent Court\s*(at|—|–|-)\s*/i, '')
			.trim() ||
		[String(courtLine1 ?? '').trim(), String(courtLine2 ?? '').trim()]
			.filter(Boolean)
			.join(', ') ||
		'________'

	const enclosures = enclosureLines(listOfEnclosures)

	const priorBody = (() => {
		if (hasPriorProceedings === null) return null
		if (!hasPriorProceedings) {
			return (
				<p className="form-iv-legal__paren">
					({declarationText(DECLARATION.FORM_V_PRIOR_PROCEEDINGS)})
				</p>
			)
		}
		const rows = (priorProceedings || []).map((entry, i) => {
			const filed = entry.filing_date ? `, filed on ${entry.filing_date}` : ''
			const detail =
				entry.status === PRIOR_STATUS.PENDING
					? `Pending — ${entry.pendency_details || '—'}`
					: `Disposed — ${entry.decision || '—'}`
			return (
				<li key={i}>
					<strong className="form-i-legal__value">{entry.case_number || '—'}</strong>
					{' before '}
					<strong className="form-i-legal__value">{entry.forum || '—'}</strong>
					{filed}. {detail}
				</li>
			)
		})
		return (
			<>
				<p className="form-iv-legal__paren">
					({declarationBranchText(DECLARATION.FORM_V_PRIOR_PROCEEDINGS)})
				</p>
				{rows.length > 0 ? (
					<ol className="form-iv-legal__prior-list">{rows}</ol>
				) : (
					<p className="form-iv-legal__filled">
						<strong className="form-i-legal__value">—</strong>
					</p>
				)}
			</>
		)
	})()

	const verificationDate = formatLongDate(verifiedOn)

	const verificationAnswers = (() => {
		const answers = { ...(verification?.paragraphs || {}) }
		// Jurisdiction is sworn separately. Unticked para 2 defaults to personal knowledge;
		// a legal-advice tick is kept so the Gazette blank can go either way.
		if (jurisdictionAccepted && answers[2] == null && answers['2'] == null) {
			answers[2] = PARA_ANSWER.PERSONAL_KNOWLEDGE
		}
		return answers
	})()

	const personalParas = renderParagraphNumbers(
		paragraphsWithAnswer(VERIFICATION.FORM_V, verificationAnswers, PARA_ANSWER.PERSONAL_KNOWLEDGE)
	)
	const advisedParas = renderParagraphNumbers(
		paragraphsWithAnswer(VERIFICATION.FORM_V, verificationAnswers, PARA_ANSWER.LEGAL_ADVICE)
	)

	return (
		<article className="form-i-legal form-iv-legal form-iii-legal form-v-legal" aria-label="FORM-V preview">
			<header className="form-i-legal__header">
				<p className="form-i-legal__form-no">FORM-V</p>
				<p className="form-i-legal__rule">[See rule 12]</p>
				<p className="form-i-legal__subject">Appeal to be filed before the Rent Court</p>
			</header>

			<div className="form-iv-legal__before">
				<p className="form-iv-legal__before-title">
					IN THE RENT COURT AT [{blank(courtBracket)}]
				</p>
				<p className="form-iv-legal__uin-line">
					In the matter of Tenancy of Unique Identification Number{' '}
					<strong className="form-i-legal__value form-i-legal__value--uin">
						{blank(tenancyUIN)}
					</strong>
				</p>
			</div>

			<section className="form-iv-legal__parties" aria-label="Parties">
				<div className="form-iv-legal__party">
					<p className="form-iv-legal__party-heading">A. Name of the Appellant</p>
					<p className="form-iv-legal__party-hint">
						(Add description and the residential address on which the service of notices is to
						be effected on the Appellant)
					</p>
					<p className="form-iv-legal__party-filled">
						<strong className="form-i-legal__value">{blank(appellantName)}</strong>
						{String(appellantResidentialAddress ?? '').trim() ? (
							<>
								<br />
								<span className="form-i-legal__addr">
									{String(appellantResidentialAddress).trim()}
								</span>
							</>
						) : null}
					</p>
					<p className="form-iv-legal__party-role">.....APPELLANT</p>
				</div>

				<p className="form-iv-legal__versus">Versus</p>

				<div className="form-iv-legal__party">
					<p className="form-iv-legal__party-heading">B. Name of the Respondent</p>
					<p className="form-iv-legal__party-hint">
						(Add description and the residential address on which the service of notices is to
						be effected on the Respondent(s)).
					</p>
					<p className="form-iv-legal__party-filled">
						<strong className="form-i-legal__value">{blank(respondentName)}</strong>
						{String(respondentResidentialAddress ?? '').trim() ? (
							<>
								<br />
								<span className="form-i-legal__addr">
									{String(respondentResidentialAddress).trim()}
								</span>
							</>
						) : null}
					</p>
					<p className="form-iv-legal__party-role">.....RESPONDENT</p>
				</div>
			</section>

			<p className="form-iv-legal__details-heading">DETAILS OF APPEAL:</p>

			<ol className="form-iv-legal__details form-iii-legal__details">
				<li>
					<span className="form-iv-legal__item-label">
						Particulars of the order of the Rent Authority as against which the appeal is made :
					</span>
					<p className="form-iv-legal__filled">
						<strong className="form-i-legal__value">{blank(particularsOfOrder)}</strong>
					</p>
				</li>

				<li>
					<span className="form-iv-legal__item-label">Jurisdiction of the Rent Court :</span>
					<p className="form-iv-legal__paren">
						(
						{jurisdictionAccepted
							? declarationText(DECLARATION.FORM_V_JURISDICTION)
							: '—'}
						)
					</p>
				</li>

				<li>
					<span className="form-iv-legal__item-label">Limitation :</span>
					<p className="form-iv-legal__paren">
						(
						{limitationAccepted
							? declarationText(DECLARATION.FORM_V_LIMITATION)
							: '—'}
						)
					</p>
				</li>

				<li>
					<span className="form-iv-legal__item-label">Memorandum of Appeal :</span>
					<p className="form-iv-legal__paren">(Grounds for appeal with legal provisions: )</p>
					<p className="form-iv-legal__filled">
						<strong className="form-i-legal__value">{blank(memorandumOfAppeal)}</strong>
					</p>
				</li>

				<li>
					<span className="form-iv-legal__item-label">
						Matters not previously filed or pending with any other court :
					</span>
					{priorBody}
				</li>

				<li>
					<span className="form-iv-legal__item-label">Relief sought :</span>
					<p className="form-iv-legal__paren">
						(In view of the Memorandum provided in para 4 above, the appellant prays for the
						following relief):-
					</p>
					<p className="form-iv-legal__filled">
						<strong className="form-i-legal__value">{blank(reliefSought)}</strong>
					</p>
				</li>

				<li>
					<span className="form-iv-legal__item-label">Interim order, if any prayed for :</span>
					<p className="form-iv-legal__lead">
						Pending final decision on the appeal, the appellant seeks the following interim
						relief:
					</p>
					<p className="form-iv-legal__paren">
						(Give here the nature of the interim relief prayed for).
					</p>
					<p className="form-iv-legal__filled">
						<strong className="form-i-legal__value">
							{String(interimOrderSought ?? '').trim() || 'Nil'}
						</strong>
					</p>
				</li>

				<li>
					<span className="form-iv-legal__item-label">List of enclosures</span>
					<ol className="form-iv-legal__enclosures">
						{(enclosures.length > 0 ? enclosures : ['', '', '']).map((line, i) => (
							<li key={i}>
								{line ? (
									<strong className="form-i-legal__value">{line}</strong>
								) : (
									<span className="form-iv-legal__blank-line" aria-hidden>
										{'\u00a0'}
									</span>
								)}
							</li>
						))}
					</ol>
				</li>
			</ol>

			<div className="form-iv-legal__verification">
				<p className="form-iv-legal__verification-heading">VERIFICATION</p>
				<p className="form-iv-legal__verification-body">
					I, <VBlank>{verification?.name}</VBlank> <VBlank>{verification?.relation}</VBlank>{' '}
					<VBlank>{verification?.relativeName}</VBlank> aged <VBlank>{verification?.age}</VBlank>{' '}
					residing at <VBlank>{verification?.address}</VBlank>, do hereby verify that the contents of
					paras <VBlank>{personalParas}</VBlank> are true to my personal knowledge and paras{' '}
					<VBlank>{advisedParas}</VBlank> believed to be true on legal advice received and I hereby
					declare that I have not suppressed any material facts.
				</p>
			</div>

			<footer className="form-iv-legal__footer">
				<div className="form-iv-legal__footer-meta">
					<p>
						Date: <strong className="form-i-legal__value">{verificationDate}</strong>
					</p>
					<p>
						Place:{' '}
						<strong className="form-i-legal__value">{blank(verification?.place)}</strong>
					</p>
				</div>
				<div className="form-iv-legal__footer-sign">
					{signatureUrl ? (
						<div className="form-i-legal__sign-image-wrap">
							<img
								src={signatureUrl}
								alt="Applicant signature"
								className="form-i-legal__sign-image"
							/>
						</div>
					) : (
						<div className="form-iv-legal__sign-blank" aria-hidden />
					)}
					<p className="form-iv-legal__sign-name">{blank(signatureName)}</p>
					<p className="form-iv-legal__sign-caption">Signature of the Applicant</p>
				</div>
			</footer>
		</article>
	)
}
