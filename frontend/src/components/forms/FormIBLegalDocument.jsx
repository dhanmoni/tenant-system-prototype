import { useEffect, useState } from 'react'
import { FORM_IB_UNDERTAKING_TEXT } from '../../constants/declarations'

function blank(value) {
	const text = String(value ?? '').trim()
	return text || '…………'
}

/**
 * Print-style FORM-IB sheet matching the Gazette physical form (Rule 5(4)).
 * Recital + undertaking (not a numbered Form I / I-A list).
 */
export default function FormIBLegalDocument({
	tenancyUIN,
	applicantName,
	applicantRelationType,
	applicantRelationTargetName,
	applicantResidentPlace,
	applicantLandlordOrTenant,
	premisesSituatedAddress,
	district,
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
	const capacity = String(applicantLandlordOrTenant || '').trim() || '…………'
	const signName = String(signatureName ?? '').trim() || blank(applicantName)

	return (
		<article className="form-i-legal form-ib-legal" aria-label="FORM-IB preview">
			<header className="form-i-legal__header">
				<p className="form-i-legal__form-no">FORM-IB</p>
				<p className="form-i-legal__rule">[See rule 5(4)]</p>
				<p className="form-i-legal__subject">
					Application for appointment of Valuer for fixation or revision of rent and other charges
				</p>
			</header>

			<div className="form-i-legal__to">
				<p className="form-i-legal__to-label">To</p>
				<p className="form-i-legal__to-authority">The Rent Authority</p>
				<div className="form-i-legal__to-lines">
					<p className={`form-i-legal__to-line ${auth1 ? 'is-filled' : ''}`}>{auth1 || '\u00a0'}</p>
					<p className={`form-i-legal__to-line ${auth2 ? 'is-filled' : ''}`}>{auth2 || '\u00a0'}</p>
				</div>
			</div>

			<p className="form-ib-legal__ref">
				Ref: Unique Identification Number issued by the Rent Authority :{' '}
				<strong className="form-i-legal__value form-i-legal__value--uin">{blank(tenancyUIN)}</strong>
			</p>

			<p className="form-ib-legal__recital">
				I, <strong className="form-i-legal__value">{blank(applicantName)}</strong>{' '}
				<strong className="form-i-legal__value">{blank(applicantRelationType)}</strong> of{' '}
				<strong className="form-i-legal__value">{blank(applicantRelationTargetName)}</strong> resident
				of <strong className="form-i-legal__value">{blank(applicantResidentPlace)}</strong> ,{' '}
				<strong className="form-i-legal__value">{capacity}</strong> of premises situated at{' '}
				<strong className="form-i-legal__value">{blank(premisesSituatedAddress)}</strong> District-{' '}
				<strong className="form-i-legal__value">{blank(district)}</strong> , Assam hereby make this
				application to appoint the government recognized valuer to evaluate the rent and or other charges
				of the aforesaid premises.
			</p>

			<p className="form-ib-legal__undertaking">{FORM_IB_UNDERTAKING_TEXT}</p>

			<footer className="form-i-legal__sign">
				{signatureUrl ? (
					<div className="form-i-legal__sign-image-wrap">
						<img
							src={signatureUrl}
							alt="Applicant signature"
							className="form-i-legal__sign-image"
						/>
					</div>
				) : (
					<div className="form-i-legal__sign-blank" aria-hidden />
				)}
				<p className="form-i-legal__sign-name">{signName}</p>
				<p className="form-i-legal__sign-caption">Name and Signature of landlord or tenant</p>
			</footer>
		</article>
	)
}
