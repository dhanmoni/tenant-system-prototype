import { useEffect, useState } from 'react'

function boldOrDash(value) {
	const text = String(value ?? '').trim()
	return text || '—'
}

function PartyBlock({ name, address }) {
	const n = String(name ?? '').trim()
	const a = String(address ?? '').trim()
	return (
		<span className="form-i-legal__value">
			{n || '—'}
			{a ? (
				<>
					{', '}
					<span className="form-i-legal__addr">{a}</span>
				</>
			) : null}
		</span>
	)
}

/**
 * Print-style FORM-IA sheet matching the Gazette physical form (Rule 5(2)).
 */
export default function FormIALegalDocument({
	tenancyUIN,
	tenancyAgreementDocumentNo,
	landlordName,
	landlordAddress,
	tenantName,
	tenantAddress,
	managerName,
	managerAddress,
	rentedPremisesDescription,
	existingOtherChargesDetails,
	proposedOtherChargesDetails,
	reasonForOtherChargesRevision,
	signatureName,
	signatureImage,
	signedBy,
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

	const managerDisplayName = String(managerName ?? '').trim() || 'None'
	const managerDisplayAddress = String(managerAddress ?? '').trim()
	const agreementNo = String(tenancyAgreementDocumentNo ?? '').trim() || 'Nil'
	const auth1 = String(authorityLine1 ?? '').trim()
	const auth2 = String(authorityLine2 ?? '').trim()

	const items = [
		{
			n: 1,
			label: 'Unique Identification Number issued by the Rent Authority:',
			value: (
				<strong className="form-i-legal__value form-i-legal__value--uin">{boldOrDash(tenancyUIN)}</strong>
			),
		},
		{
			n: 2,
			label: 'Document No. of tenancy agreement registered before the Sub-Registrar (if any) :',
			value: <span className="form-i-legal__value">{agreementNo}</span>,
		},
		{
			n: 3,
			label: 'Name and Address of the Landlord:',
			value: <PartyBlock name={landlordName} address={landlordAddress} />,
		},
		{
			n: 4,
			label: 'Name(s) and Address of the Tenant:',
			value: <PartyBlock name={tenantName} address={tenantAddress} />,
		},
		{
			n: 5,
			label: 'Name and Address of the Property Manager (if any):',
			value: (
				<span className="form-i-legal__value">
					{managerDisplayName}
					{managerDisplayAddress ? (
						<>
							{', '}
							<span className="form-i-legal__addr">{managerDisplayAddress}</span>
						</>
					) : null}
				</span>
			),
		},
		{
			n: 6,
			label: 'Description of rented premises:',
			value: <span className="form-i-legal__value">{boldOrDash(rentedPremisesDescription)}</span>,
			block: true,
		},
		{
			n: 7,
			label:
				'Existing details of other charges (such as- charges for Electricity or Power-backup, Water, Maintenance, Security Services, Extra services or equipment etc.)',
			value: (
				<span className="form-i-legal__value">{boldOrDash(existingOtherChargesDetails)}</span>
			),
			block: true,
		},
		{
			n: 8,
			label: 'Proposed other charges:',
			value: (
				<span className="form-i-legal__value">{boldOrDash(proposedOtherChargesDetails)}</span>
			),
			block: true,
		},
		{
			n: 9,
			label: 'Reason for fixation or revision of other charges:',
			value: (
				<span className="form-i-legal__value">{boldOrDash(reasonForOtherChargesRevision)}</span>
			),
			block: true,
		},
	]

	const roleLabel = signedBy === 'tenant' ? 'Tenant' : 'Landlord'

	return (
		<article className="form-i-legal form-ia-legal" aria-label="FORM-IA preview">
			<header className="form-i-legal__header">
				<p className="form-i-legal__form-no">FORM-IA</p>
				<p className="form-i-legal__rule">[See rule 5(2)]</p>
				<p className="form-i-legal__subject">Application for revision or fixation of other charges</p>
			</header>

			<div className="form-i-legal__to">
				<p className="form-i-legal__to-label">To</p>
				<p className="form-i-legal__to-authority">The Rent Authority</p>
				<div className="form-i-legal__to-lines">
					<p className={`form-i-legal__to-line ${auth1 ? 'is-filled' : ''}`}>
						{auth1 || '\u00a0'}
					</p>
					<p className={`form-i-legal__to-line ${auth2 ? 'is-filled' : ''}`}>
						{auth2 || '\u00a0'}
					</p>
				</div>
			</div>

			<ol className="form-i-legal__list">
				{items.map((item) => (
					<li
						key={item.n}
						className={`form-i-legal__item${item.block ? ' form-i-legal__item--block' : ''}`}
						value={item.n}
					>
						<span className="form-i-legal__item-label">{item.label}</span>
						{item.block ? <div className="form-i-legal__item-body">{item.value}</div> : <> {item.value}</>}
					</li>
				))}
			</ol>

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
				<p className="form-i-legal__sign-name">{boldOrDash(signatureName)}</p>
				<p className="form-i-legal__sign-role">({roleLabel})</p>
				<p className="form-i-legal__sign-caption">
					Name and Signature
					<br />
					of landlord or tenant.
				</p>
			</footer>
		</article>
	)
}
