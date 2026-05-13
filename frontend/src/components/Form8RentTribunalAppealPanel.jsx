import { useState } from 'react'
import api, { csrf } from '../api'

export default function Form8RentTribunalAppealPanel({ onBack, serviceMeta }) {
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	const [rentTribunalAt, setRentTribunalAt] = useState('')
	const [tenancyUniqueId, setTenancyUniqueId] = useState('')

	const [appellantName, setAppellantName] = useState('')
	const [appellantResidentialAddress, setAppellantResidentialAddress] = useState('')

	const [respondentName, setRespondentName] = useState('')
	const [respondentResidentialAddress, setRespondentResidentialAddress] = useState('')

	const [orderParticularsAgainstWhichAppealMade, setOrderParticularsAgainstWhichAppealMade] =
		useState('')
	const [jurisdictionOfRentTribunal, setJurisdictionOfRentTribunal] = useState('')
	const [limitation, setLimitation] = useState('')
	const [memorandumOfAppeal, setMemorandumOfAppeal] = useState('')
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

			formData.append('rent_tribunal_at', rentTribunalAt.trim())
			formData.append('tenancy_unique_identification_number', tenancyUniqueId.trim())

			formData.append('appellant_name', appellantName.trim())
			formData.append('appellant_residential_address', appellantResidentialAddress.trim())

			formData.append('respondent_name', respondentName.trim())
			formData.append('respondent_residential_address', respondentResidentialAddress.trim())

			if (orderParticularsAgainstWhichAppealMade.trim()) {
				formData.append(
					'order_particulars_against_which_appeal_made',
					orderParticularsAgainstWhichAppealMade.trim()
				)
			}
			if (jurisdictionOfRentTribunal.trim()) formData.append('jurisdiction_of_rent_tribunal', jurisdictionOfRentTribunal.trim())
			if (limitation.trim()) formData.append('limitation', limitation.trim())
			if (memorandumOfAppeal.trim()) formData.append('memorandum_of_appeal', memorandumOfAppeal.trim())
			if (mattersNotPreviouslyFiledOrPending.trim()) {
				formData.append(
					'matters_not_previously_filed_or_pending',
					mattersNotPreviouslyFiledOrPending.trim()
				)
			}

			if (reliefSought.trim()) formData.append('relief_sought', reliefSought.trim())
			if (interimOrderSought.trim()) formData.append('interim_order_sought', interimOrderSought.trim())
			if (listOfEnclosures.trim()) formData.append('list_of_enclosures', listOfEnclosures.trim())

			formData.append('signature_name', signatureName.trim())
			if (signatureImage) formData.append('signature_image', signatureImage)

			const { data } = await api.post('/api/rent-tribunal-appeal-applications', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})

			setSuccess(data?.message || 'Form VI submitted successfully.')
		} catch (err) {
			const msg =
				err?.response?.data?.message ||
				(err?.response?.data?.errors
					? Object.values(err.response.data.errors).flat().join('. ')
					: 'Failed to submit Form VI')
			setError(msg)
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="auth-card dashboard-card">
			<h1>{serviceMeta?.label || 'Form VI - Appeal against Rent Court order'}</h1>
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
					<span className="label-text required">Rent Tribunal at</span>
					<input
						type="text"
						value={rentTribunalAt}
						onChange={(e) => setRentTribunalAt(e.target.value)}
						required
					/>
				</label>
				<label>
					<span className="label-text required">Tenancy UID (U.I. No.)</span>
					<input
						type="text"
						value={tenancyUniqueId}
						onChange={(e) => setTenancyUniqueId(e.target.value)}
						required
					/>
				</label>

				<fieldset className="tenancy-fieldset">
					<legend className="tenancy-legend-italic">A. Appellant</legend>
					<label>
						<span className="label-text required">Name of the Appellant</span>
						<input
							type="text"
							value={appellantName}
							onChange={(e) => setAppellantName(e.target.value)}
							required
						/>
					</label>
					<label>
						<span className="label-text required">Appellant residential address</span>
						<textarea
							value={appellantResidentialAddress}
							onChange={(e) => setAppellantResidentialAddress(e.target.value)}
							required
						/>
					</label>
				</fieldset>

				<fieldset className="tenancy-fieldset">
					<legend className="tenancy-legend-italic">B. Respondent</legend>
					<label>
						<span className="label-text required">Name of the Respondent</span>
						<input
							type="text"
							value={respondentName}
							onChange={(e) => setRespondentName(e.target.value)}
							required
						/>
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
					<span className="label-text">1) Order particulars against which appeal is made</span>
					<textarea
						value={orderParticularsAgainstWhichAppealMade}
						onChange={(e) => setOrderParticularsAgainstWhichAppealMade(e.target.value)}
					/>
				</label>
				<label>
					<span className="label-text">2) Jurisdiction of the Rent Tribunal</span>
					<textarea
						value={jurisdictionOfRentTribunal}
						onChange={(e) => setJurisdictionOfRentTribunal(e.target.value)}
					/>
				</label>
				<label>
					<span className="label-text">3) Limitation</span>
					<textarea value={limitation} onChange={(e) => setLimitation(e.target.value)} />
				</label>
				<label>
					<span className="label-text">4) Memorandum of Appeal</span>
					<textarea value={memorandumOfAppeal} onChange={(e) => setMemorandumOfAppeal(e.target.value)} />
				</label>
				<label>
					<span className="label-text">5) Matters not previously filed or pending</span>
					<textarea
						value={mattersNotPreviouslyFiledOrPending}
						onChange={(e) => setMattersNotPreviouslyFiledOrPending(e.target.value)}
					/>
				</label>
				<label>
					<span className="label-text">6) Relief sought</span>
					<textarea value={reliefSought} onChange={(e) => setReliefSought(e.target.value)} />
				</label>
				<label>
					<span className="label-text">7) Interim order</span>
					<textarea value={interimOrderSought} onChange={(e) => setInterimOrderSought(e.target.value)} />
				</label>
				<label>
					<span className="label-text">8) List of enclosures</span>
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
						<select
							value={verificationRelation}
							onChange={(e) => setVerificationRelation(e.target.value)}
						>
							<option value="S/o.">S/o.</option>
							<option value="W/o.">W/o.</option>
							<option value="D/o.">D/o.</option>
						</select>
					</label>
					<label>
						<span className="label-text">Relative name</span>
						<input
							type="text"
							value={verificationRelativeName}
							onChange={(e) => setVerificationRelativeName(e.target.value)}
						/>
					</label>
					<label>
						<span className="label-text">Age</span>
						<input
							type="number"
							min="0"
							value={verificationAge}
							onChange={(e) => setVerificationAge(e.target.value)}
						/>
					</label>
					<label className="tenancy-field-full">
						<span className="label-text">Address for verification</span>
						<textarea
							value={verificationAddress}
							onChange={(e) => setVerificationAddress(e.target.value)}
						/>
					</label>
					<label>
						<span className="label-text">Paras true to personal knowledge - from</span>
						<input
							type="text"
							value={verificationParasFrom}
							onChange={(e) => setVerificationParasFrom(e.target.value)}
						/>
					</label>
					<label>
						<span className="label-text">Paras true to personal knowledge - to</span>
						<input
							type="text"
							value={verificationParasTo}
							onChange={(e) => setVerificationParasTo(e.target.value)}
						/>
					</label>
					<label>
						<span className="label-text">Paras true on legal advice - from</span>
						<input
							type="text"
							value={verificationBeliefParasFrom}
							onChange={(e) => setVerificationBeliefParasFrom(e.target.value)}
						/>
					</label>
					<label>
						<span className="label-text">Paras true on legal advice - to</span>
						<input
							type="text"
							value={verificationBeliefParasTo}
							onChange={(e) => setVerificationBeliefParasTo(e.target.value)}
						/>
					</label>
					<div className="tenancy-field-full">
						<p className="muted" style={{ marginTop: 0 }}>
							I, {signatureName || '________________'} {verificationRelation}{' '}
							{verificationRelativeName || '________________'}, aged{' '}
							{verificationAge || '____'}, residing at{' '}
							{verificationAddress || '________________________'}, do hereby verify that the
							contents of paras {verificationParasFrom || '____'} to{' '}
							{verificationParasTo || '____'} are true to my personal knowledge and paras{' '}
							{verificationBeliefParasFrom || '____'} to{' '}
							{verificationBeliefParasTo || '____'} are believed to be true on legal advice
							received and I hereby declare that I have not suppressed any material facts.
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
						<input
							type="file"
							accept="image/*"
							onChange={(e) => setSignatureImage(e.target.files?.[0] || null)}
						/>
					</label>
				</fieldset>

				<div className="form-actions">
					<button type="button" className="secondary" onClick={onBack} disabled={submitting}>
						Back
					</button>
					<button type="submit" disabled={submitting}>
						{submitting ? 'Submitting...' : 'Submit Form VI'}
					</button>
				</div>
			</form>
		</div>
	)
}



