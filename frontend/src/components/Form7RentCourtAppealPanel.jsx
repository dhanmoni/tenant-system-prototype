import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { csrf } from '../api'
import ServiceFormPreviewModal from './forms/ServiceFormPreviewModal'
import { useServiceFormPreview } from '../hooks/useServiceFormPreview'
import { previewItem, previewSection, previewSections } from '../utils/serviceFormPreview'
import { completeServiceFormSubmit, getServiceFormSuccessMessage } from '../utils/serviceFormSubmit'

export default function Form7RentCourtAppealPanel({ onBack, serviceMeta }) {
	const navigate = useNavigate()
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')

	const [rentCourtAt, setRentCourtAt] = useState('')
	const [tenancyUIN, setTenancyUIN] = useState('')

	const [appellantName, setAppellantName] = useState('')
	const [appellantResidentialAddress, setAppellantResidentialAddress] = useState('')

	const [respondentName, setRespondentName] = useState('')
	const [respondentResidentialAddress, setRespondentResidentialAddress] = useState('')

	const [orderParticularsAgainstWhichAppealMade, setOrderParticularsAgainstWhichAppealMade] =
		useState('')
	const [jurisdictionOfRentCourt, setJurisdictionOfRentCourt] = useState('')
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

	const submit = useCallback(async () => {
		setError('')
		setSubmitting(true)
		try {
			await csrf()
			const formData = new FormData()

			formData.append('rent_court_at', rentCourtAt.trim())
			formData.append('tenancy_uin', tenancyUIN.trim())

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
			if (jurisdictionOfRentCourt.trim()) formData.append('jurisdiction_of_rent_court', jurisdictionOfRentCourt.trim())
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

			const { data } = await api.post('/api/rent-court-appeal-applications', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})

			completeServiceFormSubmit(
				navigate,
				getServiceFormSuccessMessage(data, 'Form V submitted successfully.')
			)
			return true
		} catch (err) {
			const msg =
				err?.response?.data?.message ||
				(err?.response?.data?.errors
					? Object.values(err.response.data.errors).flat().join('. ')
					: 'Failed to submit Form V')
			setError(msg)
			return false
		} finally {
			setSubmitting(false)
		}
	}, [
		appellantName,
		appellantResidentialAddress,
		interimOrderSought,
		jurisdictionOfRentCourt,
		limitation,
		listOfEnclosures,
		mattersNotPreviouslyFiledOrPending,
		memorandumOfAppeal,
		orderParticularsAgainstWhichAppealMade,
		reliefSought,
		rentCourtAt,
		respondentName,
		respondentResidentialAddress,
		signatureImage,
		signatureName,
		tenancyUIN,
		navigate,
	])

	const previewData = useMemo(
		() =>
			previewSections(
				previewSection('Tenancy', [
					previewItem('Rent Court at', rentCourtAt),
					previewItem('Tenancy UIN', tenancyUIN),
				]),
				previewSection('Parties', [
					previewItem('Appellant name', appellantName),
					previewItem('Appellant address', appellantResidentialAddress),
					previewItem('Respondent name', respondentName),
					previewItem('Respondent address', respondentResidentialAddress),
				]),
				previewSection('Case details', [
					previewItem('Order particulars', orderParticularsAgainstWhichAppealMade),
					previewItem('Jurisdiction of Rent Court', jurisdictionOfRentCourt),
					previewItem('Limitation', limitation),
					previewItem('Memorandum of appeal', memorandumOfAppeal),
					previewItem('Matters not previously filed', mattersNotPreviouslyFiledOrPending),
					previewItem('Relief sought', reliefSought),
					previewItem('Interim order sought', interimOrderSought),
					previewItem('List of enclosures', listOfEnclosures),
				]),
				previewSection('Verification / signature', [
					previewItem('Applicant name', signatureName),
					previewItem('Relation', verificationRelation),
					previewItem('Relative name', verificationRelativeName),
					previewItem('Age', verificationAge),
					previewItem('Address for verification', verificationAddress),
					previewItem('Paras (personal knowledge) from', verificationParasFrom),
					previewItem('Paras (personal knowledge) to', verificationParasTo),
					previewItem('Paras (legal advice) from', verificationBeliefParasFrom),
					previewItem('Paras (legal advice) to', verificationBeliefParasTo),
					previewItem('Date', verificationDate),
					previewItem('Place', verificationPlace),
					previewItem('Signature image', signatureImage),
				])
			),
		[
			appellantName,
			appellantResidentialAddress,
			interimOrderSought,
			jurisdictionOfRentCourt,
			limitation,
			listOfEnclosures,
			mattersNotPreviouslyFiledOrPending,
			memorandumOfAppeal,
			orderParticularsAgainstWhichAppealMade,
			reliefSought,
			rentCourtAt,
			respondentName,
			respondentResidentialAddress,
			signatureImage,
			signatureName,
			tenancyUIN,
			verificationAddress,
			verificationAge,
			verificationBeliefParasFrom,
			verificationBeliefParasTo,
			verificationDate,
			verificationParasFrom,
			verificationParasTo,
			verificationPlace,
			verificationRelation,
			verificationRelativeName,
		]
	)

	const { previewOpen, requestPreview, closePreview, confirmSubmit } = useServiceFormPreview(submit)

	return (
		<div className="dashboard-card service-form-panel">
			<h1>{serviceMeta?.label || 'Form V - Appeal against Rent Authority order'}</h1>
			<p className="muted">
				{serviceMeta
					? `${serviceMeta.matter} (${serviceMeta.rule}) - ${serviceMeta.authority}`
					: 'Fill the application details and submit to the system.'}
			</p>
			{error ? <div className="error">{error}</div> : null}

			<form className="tenancy-form" onSubmit={requestPreview}>
				<label>
					<span className="label-text required">Rent Court at</span>
					<input type="text" value={rentCourtAt} onChange={(e) => setRentCourtAt(e.target.value)} required />
				</label>
				<label>
					<span className="label-text required">Tenancy Unique Identification Number</span>
					<input
						type="text"
						value={tenancyUIN}
						onChange={(e) => setTenancyUIN(e.target.value)}
						required
					/>
				</label>

				<fieldset className="tenancy-fieldset">
					<legend className="tenancy-legend-italic">A. Appellant</legend>
					<label>
						<span className="label-text required">Name of the Appellant</span>
						<input type="text" value={appellantName} onChange={(e) => setAppellantName(e.target.value)} required />
					</label>
					<label>
						<span className="label-text required">Appellant residential address</span>
						<textarea value={appellantResidentialAddress} onChange={(e) => setAppellantResidentialAddress(e.target.value)} required />
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
						<textarea value={respondentResidentialAddress} onChange={(e) => setRespondentResidentialAddress(e.target.value)} required />
					</label>
				</fieldset>

				<label>
					<span className="label-text">1) Particulars of the Rent Authority order</span>
					<textarea
						value={orderParticularsAgainstWhichAppealMade}
						onChange={(e) => setOrderParticularsAgainstWhichAppealMade(e.target.value)}
					/>
				</label>
				<label>
					<span className="label-text">2) Jurisdiction of the Rent Court</span>
					<textarea value={jurisdictionOfRentCourt} onChange={(e) => setJurisdictionOfRentCourt(e.target.value)} />
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
					<span className="label-text">7) Interim order, if any</span>
					<textarea value={interimOrderSought} onChange={(e) => setInterimOrderSought(e.target.value)} />
				</label>
				<label>
					<span className="label-text">8) List of enclosures</span>
					<textarea value={listOfEnclosures} onChange={(e) => setListOfEnclosures(e.target.value)} />
				</label>

				<fieldset className="tenancy-fieldset">
					<legend className="tenancy-legend-italic">Verification / Signature</legend>
					<label>
						<span className="label-text required">Applicant name</span>
						<input type="text" value={signatureName} onChange={(e) => setSignatureName(e.target.value)} required />
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
					<label>
						<span className="label-text">Date</span>
						<input type="date" value={verificationDate} onChange={(e) => setVerificationDate(e.target.value)} />
					</label>
					<label>
						<span className="label-text">Place</span>
						<input type="text" value={verificationPlace} onChange={(e) => setVerificationPlace(e.target.value)} />
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
						{submitting ? 'Submitting...' : 'Review & submit'}
					</button>
				</div>
			</form>

			<ServiceFormPreviewModal
				open={previewOpen}
				title="Review Form V"
				subtitle={serviceMeta?.label}
				sections={previewData}
				onClose={closePreview}
				onConfirm={confirmSubmit}
				confirming={submitting}
				confirmLabel="Confirm & submit Form V"
			/>
		</div>
	)
}



