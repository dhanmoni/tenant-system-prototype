import { useEffect, useState } from 'react'
import {
	DECLARATION,
	PARA_ANSWER,
	VERIFICATION,
	declarationBranchText,
	declarationText,
	paragraphsWithAnswer,
	renderParagraphNumbers,
} from '../../constants/declarations'
import { PRIOR_STATUS } from '../../constants/priorProceedings'
import {
	describeMatter,
	describeRepairItem,
	describeService,
} from '../../constants/rentAuthorityMatters'

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
 * Print-style FORM-IV sheet matching the Gazette physical form ([See rule- 11]).
 */
export default function FormIVLegalDocument({
	tenancyUIN,
	applicantName,
	applicantResidentialAddress,
	oppositePartyName,
	oppositePartyResidentialAddress,
	statutoryMatter,
	repairItems = [],
	essentialServices = [],
	essentialServiceOther = '',
	particularsOfViolation,
	jurisdictionAccepted,
	factsOfCase,
	groundsForRelief,
	hasPriorProceedings,
	priorProceedings = [],
	reliefSought,
	interimOrderSought,
	listOfEnclosures,
	verification,
	signatureName,
	signatureImage,
	authorityLine1 = '',
	authorityLine2 = '',
}) {
	const [signatureUrl, setSignatureUrl] = useState('')

	useEffect(() => {
		if (!(signatureImage instanceof File) || !signatureImage.type?.startsWith('image/')) {
			setSignatureUrl('')
			return undefined
		}
		const url = URL.createObjectURL(signatureImage)
		setSignatureUrl(url)
		return () => URL.revokeObjectURL(url)
	}, [signatureImage])

	const auth1 = String(authorityLine1 ?? '').trim()
	const auth2 = String(authorityLine2 ?? '').trim()
	const authorityBracket =
		[
			auth1.replace(/^Rent Authority\s*[—–-]\s*/i, '').trim(),
			auth2,
		]
			.filter(Boolean)
			.join(', ') || '________'

	const matterLabel = describeMatter(statutoryMatter)
	const repairs =
		repairItems.length > 0 ? repairItems.map(describeRepairItem).join('; ') : ''
	const services =
		essentialServices.length > 0
			? essentialServices
					.map((code) =>
						code === 'other'
							? `Other: ${essentialServiceOther || '—'}`
							: describeService(code)
					)
					.join('; ')
			: ''

	const enclosures = enclosureLines(listOfEnclosures)

	const priorBody = (() => {
		if (hasPriorProceedings === null) return null
		if (!hasPriorProceedings) {
			return (
				<p className="form-iv-legal__paren">
					({declarationText(DECLARATION.FORM_IV_PRIOR_PROCEEDINGS)})
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
					<strong className="form-i-legal__value">
						{entry.case_number || '—'}
					</strong>
					{' before '}
					<strong className="form-i-legal__value">{entry.forum || '—'}</strong>
					{filed}. {detail}
				</li>
			)
		})
		return (
			<>
				<p className="form-iv-legal__paren">
					({declarationBranchText(DECLARATION.FORM_IV_PRIOR_PROCEEDINGS)})
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

	const verificationDate = new Date().toLocaleDateString('en-IN', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})

	const personalParas = renderParagraphNumbers(
		paragraphsWithAnswer(VERIFICATION.FORM_IV, verification?.paragraphs || {}, PARA_ANSWER.PERSONAL_KNOWLEDGE)
	)
	const advisedParas = renderParagraphNumbers(
		paragraphsWithAnswer(VERIFICATION.FORM_IV, verification?.paragraphs || {}, PARA_ANSWER.LEGAL_ADVICE)
	)

	return (
		<article className="form-i-legal form-iv-legal" aria-label="FORM-IV preview">
			<header className="form-i-legal__header">
				<p className="form-i-legal__form-no">FORM-IV</p>
				<p className="form-i-legal__rule">[See rule- 11]</p>
				<p className="form-i-legal__subject">Application filed before the Rent Authority</p>
			</header>

			<div className="form-iv-legal__before">
				<p className="form-iv-legal__before-title">
					BEFORE THE RENT AUTHORITY [{authorityBracket}]
				</p>
				<p className="form-iv-legal__uin-line">
					In the matter of Tenancy of Unique Identification Number{' '}
					<strong className="form-i-legal__value form-i-legal__value--uin">
						{blank(tenancyUIN)}
					</strong>
				</p>
			</div>

			{(matterLabel || repairs || services) && (
				<p className="form-iv-legal__matter-line">
					<span className="form-iv-legal__matter-label">Matter applied under: </span>
					<strong className="form-i-legal__value">{matterLabel || '—'}</strong>
					{repairs ? (
						<>
							{'; '}
							<span className="form-iv-legal__matter-label">Second Schedule: </span>
							<span className="form-i-legal__value">{repairs}</span>
						</>
					) : null}
					{services ? (
						<>
							{'; '}
							<span className="form-iv-legal__matter-label">Essential services: </span>
							<span className="form-i-legal__value">{services}</span>
						</>
					) : null}
				</p>
			)}

			<section className="form-iv-legal__parties" aria-label="Parties">
				<div className="form-iv-legal__party">
					<p className="form-iv-legal__party-heading">A. Name of the Applicant</p>
					<p className="form-iv-legal__party-hint">
						(Add description and the residential address on which the service of notices is to
						be effected on the Applicant)
					</p>
					<p className="form-iv-legal__party-filled">
						<strong className="form-i-legal__value">{blank(applicantName)}</strong>
						{String(applicantResidentialAddress ?? '').trim() ? (
							<>
								<br />
								<span className="form-i-legal__addr">
									{String(applicantResidentialAddress).trim()}
								</span>
							</>
						) : null}
					</p>
					<p className="form-iv-legal__party-role">…..APPLICANT</p>
				</div>

				<p className="form-iv-legal__versus">Versus</p>

				<div className="form-iv-legal__party">
					<p className="form-iv-legal__party-heading">B. Name of the Opposite Party</p>
					<p className="form-iv-legal__party-hint">
						(Add description and the residential address on which the service of notices is to
						be effected on the Opposite Party).
					</p>
					<p className="form-iv-legal__party-filled">
						<strong className="form-i-legal__value">{blank(oppositePartyName)}</strong>
						{String(oppositePartyResidentialAddress ?? '').trim() ? (
							<>
								<br />
								<span className="form-i-legal__addr">
									{String(oppositePartyResidentialAddress).trim()}
								</span>
							</>
						) : null}
					</p>
					<p className="form-iv-legal__party-role">...OPPOSITE PARTY</p>
				</div>
			</section>

			<p className="form-iv-legal__details-heading">DETAILS OF APPLICATION:</p>

			<ol className="form-iv-legal__details">
				<li>
					<span className="form-iv-legal__item-label">
						Particulars of violation against which the present application is made :
					</span>
					<p className="form-iv-legal__filled">
						<strong className="form-i-legal__value">{blank(particularsOfViolation)}</strong>
					</p>
				</li>

				<li>
					<span className="form-iv-legal__item-label">Jurisdiction of the Rent Authority :</span>
					<p className="form-iv-legal__paren">
						(
						{jurisdictionAccepted
							? declarationText(DECLARATION.FORM_IV_JURISDICTION)
							: '—'}
						)
					</p>
				</li>

				<li>
					<span className="form-iv-legal__item-label">Facts of the case :</span>
					<p className="form-iv-legal__paren">
						(Give here a concise statement of facts in a chronological order, each paragraph
						containing as nearly as possible a separate issue or fact).
					</p>
					<p className="form-iv-legal__filled">
						<strong className="form-i-legal__value">{blank(factsOfCase)}</strong>
					</p>
				</li>

				<li>
					<span className="form-iv-legal__item-label">Grounds for relief :</span>
					<p className="form-iv-legal__filled">
						<strong className="form-i-legal__value">{blank(groundsForRelief)}</strong>
					</p>
				</li>

				<li>
					<span className="form-iv-legal__item-label">
						Matters not previously filed or pending with any other court:
					</span>
					{priorBody}
				</li>

				<li>
					<span className="form-iv-legal__item-label">Relief sought :</span>
					<p className="form-iv-legal__paren">
						(In view of the grounds mentioned in para 4 above, the applicant prays for the
						following relief(s)):-
					</p>
					<p className="form-iv-legal__paren">
						(Specify below the relief sought explaining the grounds for such relief(s) and the
						legal provisions, if any, relied upon).
					</p>
					<p className="form-iv-legal__filled">
						<strong className="form-i-legal__value">{blank(reliefSought)}</strong>
					</p>
				</li>

				<li>
					<span className="form-iv-legal__item-label">Interim order, if any prayed for :</span>
					<p className="form-iv-legal__lead">
						Pending final decision on the application, the applicant seeks the following interim
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
						Date:{' '}
						<strong className="form-i-legal__value">{verificationDate}</strong>
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
