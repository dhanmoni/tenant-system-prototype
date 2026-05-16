import { useState } from 'react'
import api, { csrf } from '../api'

export default function Form5RentCourtFilingPanel({ onBack, serviceMeta }) {
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	const [rentCourtAt, setRentCourtAt] = useState('')
	const [tenancyUIN, setTenancyUIN] = useState('')

	const [applicantName, setApplicantName] = useState('')
	const [applicantResidentialAddress, setApplicantResidentialAddress] = useState('')

	const [respondentName, setRespondentName] = useState('')
	const [respondentResidentialAddress, setRespondentResidentialAddress] = useState('')

	const [particularsOfApplication, setParticularsOfApplication] = useState('')
	const [jurisdictionOfRentCourt, setJurisdictionOfRentCourt] = useState('')
	const [factsOfCase, setFactsOfCase] = useState('')
	const [groundsForRelief, setGroundsForRelief] = useState('')
	const [mattersNotPreviouslyFiledOrPending, setMattersNotPreviouslyFiledOrPending] = useState('')
	const [reliefSought, setReliefSought] = useState('')
	const [interimOrderSought, setInterimOrderSought] = useState('')
	const [listOfEnclosures, setListOfEnclosures] = useState('')

	const [signatureName, setSignatureName] = useState('')
	const [signatureImage, setSignatureImage] = useState(null)
	const [verificationDate, setVerificationDate] = useState('')
	const [verificationPlace, setVerificationPlace] = useState('')
	const [verificationRelation, setVerificationRelation] = useState('S/o.')
	const [verificationRelativeName, setVerificationRelativeName] = useState('')
	const [verificationAge, setVerificationAge] = useState('')
	const [verificationAddress, setVerificationAddress] = useState('')
	const [verificationParasFrom, setVerificationParasFrom] = useState('')
	const [verificationParasTo, setVerificationParasTo] = useState('')
	const [verificationBeliefParasFrom, setVerificationBeliefParasFrom] = useState('')
	const [verificationBeliefParasTo, setVerificationBeliefParasTo] = useState('')

	const submit = async () => {
		setError('')
		setSuccess('')
		setSubmitting(true)
		try {
			await csrf()
			const formData = new FormData()

			formData.append('rent_court_at', rentCourtAt.trim())
			formData.append(
				'tenancy_uin',
				tenancyUIN.trim()
			)

			formData.append('applicant_name', applicantName.trim())
			formData.append(
				'applicant_residential_address',
				applicantResidentialAddress.trim()
			)

			formData.append('respondent_name', respondentName.trim())
			formData.append(
				'respondent_residential_address',
				respondentResidentialAddress.trim()
			)

			if (particularsOfApplication.trim()) {
				formData.append('particulars_of_application', particularsOfApplication.trim())
			}
			if (jurisdictionOfRentCourt.trim()) {
				formData.append('jurisdiction_of_rent_court', jurisdictionOfRentCourt.trim())
			}
			if (factsOfCase.trim()) formData.append('facts_of_case', factsOfCase.trim())
			if (groundsForRelief.trim()) formData.append('grounds_for_relief', groundsForRelief.trim())
			if (mattersNotPreviouslyFiledOrPending.trim()) {
				formData.append(
					'matters_not_previously_filed_or_pending',
					mattersNotPreviouslyFiledOrPending.trim()
				)
			}
			if (reliefSought.trim()) formData.append('relief_sought', reliefSought.trim())
			if (interimOrderSought.trim()) {
				formData.append('interim_order_sought', interimOrderSought.trim())
			}
			if (listOfEnclosures.trim()) formData.append('list_of_enclosures', listOfEnclosures.trim())

			formData.append('signature_name', signatureName.trim())
			if (signatureImage) formData.append('signature_image', signatureImage)

			const { data } = await api.post('/api/rent-court-filing-applications', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})

			setSuccess(data?.message || 'Form III submitted successfully.')
		} catch (err) {
			const msg =
				err?.response?.data?.message ||
				(err?.response?.data?.errors
					? Object.values(err.response.data.errors).flat().join('. ')
					: 'Failed to submit Form III')
			setError(msg)
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="auth-card dashboard-card">
			<h1>{serviceMeta?.label || 'Form III - Eviction and recovery of possession'}</h1>
			<p className="muted">
				{serviceMeta
					? `${serviceMeta.matter} (${serviceMeta.rule}) - ${serviceMeta.authority}`
					: 'Fill the application details and submit to the system.'}
			</p>
			{error ? <div className="error">{error}</div> : null}
			{success ? <div className="success">{success}</div> : null}

			<form
				className="tenancy-form"
				onSubmit={(e) => {
					e.preventDefault()
					submit()
				}}
			>
				<label>
					<span className="label-text required">Rent Court at</span>
					<input type="text" value={rentCourtAt} onChange={(e) => setRentCourtAt(e.target.value)} required />
				</label>
				<label>
					<span className="label-text required">Tenancy Unique Identification Number</span>
					<input type="text" value={tenancyUIN} onChange={(e) => setTenancyUIN(e.target.value)} required />
				</label>

				<fieldset className="tenancy-fieldset">
					<legend className="tenancy-legend-italic">A. Applicant</legend>
					<label>
						<span className="label-text required">Name of the Applicant</span>
						<input type="text" value={applicantName} onChange={(e) => setApplicantName(e.target.value)} required />
					</label>
					<label>
						<span className="label-text required">Applicant residential address</span>
						<textarea
							value={applicantResidentialAddress}
							onChange={(e) => setApplicantResidentialAddress(e.target.value)}
							required
						/>
					</label>
				</fieldset>

				<fieldset className="tenancy-fieldset">
					<legend className="tenancy-legend-italic">B. Respondent</legend>
					<label>
						<span className="label-text required">Name of the Respondent</span>
						<input type="text" value={respondentName} onChange={(e) => setRespondentName(e.target.value)} required />
					</label>
					<label>
						<span className="label-text required">Respondent residential address</span>
						<textarea
							value={respondentResidentialAddress}
							onChange={(e) => setRespondentResidentialAddress(e.target.value)}
							required
						/>
					</label>
				</fieldset>

				<label>
					<span className="label-text">Particulars of application</span>
					<textarea value={particularsOfApplication} onChange={(e) => setParticularsOfApplication(e.target.value)} />
				</label>
				<label>
					<span className="label-text">Jurisdiction of the Rent Court</span>
					<textarea value={jurisdictionOfRentCourt} onChange={(e) => setJurisdictionOfRentCourt(e.target.value)} />
				</label>
				<label>
					<span className="label-text">Facts of the case</span>
					<textarea value={factsOfCase} onChange={(e) => setFactsOfCase(e.target.value)} />
				</label>
				<label>
					<span className="label-text">Grounds for relief</span>
					<textarea value={groundsForRelief} onChange={(e) => setGroundsForRelief(e.target.value)} />
				</label>
				<label>
					<span className="label-text">Matters not previously filed or pending</span>
					<textarea value={mattersNotPreviouslyFiledOrPending} onChange={(e) => setMattersNotPreviouslyFiledOrPending(e.target.value)} />
				</label>
				<label>
					<span className="label-text">Relief sought</span>
					<textarea value={reliefSought} onChange={(e) => setReliefSought(e.target.value)} />
				</label>
				<label>
					<span className="label-text">Interim order sought</span>
					<textarea value={interimOrderSought} onChange={(e) => setInterimOrderSought(e.target.value)} />
				</label>
				<label>
					<span className="label-text">List of enclosures</span>
					<textarea value={listOfEnclosures} onChange={(e) => setListOfEnclosures(e.target.value)} />
				</label>

				<fieldset className="tenancy-fieldset">
					<legend className="tenancy-legend-italic">Verification / Signature</legend>
					<label>
						<span className="label-text required">Applicant name (for verification)</span>
						<input
							type="text"
							value={signatureName}
							onChange={(e) => setSignatureName(e.target.value)}
							required
						/>
					</label>
					<label>
						<span className="label-text">Relation</span>
						<select value={verificationRelation} onChange={(e) => setVerificationRelation(e.target.value)}>
							<option value="S/o.">S/o.</option>
							<option value="W/o.">W/o.</option>
							<option value="D/o.">D/o.</option>
						</select>
					</label>
					<label>
						<span className="label-text">Relative name</span>
						<input type="text" value={verificationRelativeName} onChange={(e) => setVerificationRelativeName(e.target.value)} />
					</label>
					<label>
						<span className="label-text">Age</span>
						<input type="number" min="0" value={verificationAge} onChange={(e) => setVerificationAge(e.target.value)} />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text">Address for verification</span>
						<textarea value={verificationAddress} onChange={(e) => setVerificationAddress(e.target.value)} />
					</label>
					<label>
						<span className="label-text">Paras true to personal knowledge - from</span>
						<input type="text" value={verificationParasFrom} onChange={(e) => setVerificationParasFrom(e.target.value)} />
					</label>
					<label>
						<span className="label-text">Paras true to personal knowledge - to</span>
						<input type="text" value={verificationParasTo} onChange={(e) => setVerificationParasTo(e.target.value)} />
					</label>
					<label>
						<span className="label-text">Paras true on legal advice - from</span>
						<input type="text" value={verificationBeliefParasFrom} onChange={(e) => setVerificationBeliefParasFrom(e.target.value)} />
					</label>
					<label>
						<span className="label-text">Paras true on legal advice - to</span>
						<input type="text" value={verificationBeliefParasTo} onChange={(e) => setVerificationBeliefParasTo(e.target.value)} />
					</label>
					<div className="tenancy-field-full">
						<p className="muted" style={{ marginTop: 0 }}>
							I, {signatureName || '________________'} {verificationRelation} {verificationRelativeName || '________________'}, aged {verificationAge || '____'}, residing at {verificationAddress || '________________________'}, do hereby verify that the contents of paras {verificationParasFrom || '____'} to {verificationParasTo || '____'} are true to my personal knowledge and paras {verificationBeliefParasFrom || '____'} to {verificationBeliefParasTo || '____'} are believed to be true on legal advice received and I hereby declare that I have not suppressed any material facts.
						</p>
					</div>
					<label>
						<span className="label-text">Date</span>
						<input
							type="date"
							value={verificationDate}
							onChange={(e) => setVerificationDate(e.target.value)}
						/>
					</label>
					<label>
						<span className="label-text">Place</span>
						<input
							type="text"
							value={verificationPlace}
							onChange={(e) => setVerificationPlace(e.target.value)}
						/>
					</label>
					<label>
						<span className="label-text">Signature image (optional)</span>
						<input type="file" accept="image/*" onChange={(e) => setSignatureImage(e.target.files?.[0] || null)} />
					</label>
				</fieldset>

				<div className="form-actions">
					<button type="button" className="secondary" onClick={onBack} disabled={submitting}>
						Back
					</button>
					<button type="submit" disabled={submitting}>
						{submitting ? 'Submitting...' : 'Submit Form III'}
					</button>
				</div>
			</form>
		</div>
	)
}



