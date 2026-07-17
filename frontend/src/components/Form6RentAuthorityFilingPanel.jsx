import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { csrf } from '../api'
import TenancyUinLookup from './forms/TenancyUinLookup'
import ServiceFormPreviewModal from './forms/ServiceFormPreviewModal'
import { useServiceFormPreview } from '../hooks/useServiceFormPreview'
import { APPLICATION_TYPES } from '../constants/application'
import { previewItem, previewSection, previewSections } from '../utils/serviceFormPreview'
import { completeServiceFormSubmit, getServiceFormSuccessMessage } from '../utils/serviceFormSubmit'
import { applyTenancyAutofill } from '../utils/tenancyUinAutofill'

export default function Form6RentAuthorityFilingPanel({ onBack, serviceMeta, user }) {
	const navigate = useNavigate()
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')

	const [tenancyUIN, setTenancyUIN] = useState('')

	const [applicantName, setApplicantName] = useState('')
	const [applicantResidentialAddress, setApplicantResidentialAddress] = useState('')

	const [oppositePartyName, setOppositePartyName] = useState('')
	const [oppositePartyResidentialAddress, setOppositePartyResidentialAddress] = useState('')

	const [particularsOfViolation, setParticularsOfViolation] = useState('')
	const [jurisdictionOfRentAuthority, setJurisdictionOfRentAuthority] = useState('')
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

	const submit = useCallback(async () => {
		setError('')
		setSubmitting(true)
		try {
			await csrf()
			const formData = new FormData()

			formData.append('tenancy_uin', tenancyUIN.trim())

			formData.append('applicant_name', applicantName.trim())
			formData.append(
				'applicant_residential_address',
				applicantResidentialAddress.trim()
			)

			formData.append('opposite_party_name', oppositePartyName.trim())
			formData.append(
				'opposite_party_residential_address',
				oppositePartyResidentialAddress.trim()
			)

			if (particularsOfViolation.trim()) {
				formData.append('particulars_of_violation', particularsOfViolation.trim())
			}
			if (jurisdictionOfRentAuthority.trim()) {
				formData.append(
					'jurisdiction_of_rent_authority',
					jurisdictionOfRentAuthority.trim()
				)
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
			if (interimOrderSought.trim()) formData.append('interim_order_sought', interimOrderSought.trim())
			if (listOfEnclosures.trim()) formData.append('list_of_enclosures', listOfEnclosures.trim())

			formData.append('signature_name', signatureName.trim())
			if (signatureImage) formData.append('signature_image', signatureImage)

			const { data } = await api.post('/api/rent-authority-filing-applications', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})

			completeServiceFormSubmit(
				navigate,
				getServiceFormSuccessMessage(data, 'Form IV submitted successfully.')
			)
			return true
		} catch (err) {
			const msg =
				err?.response?.data?.message ||
				(err?.response?.data?.errors
					? Object.values(err.response.data.errors).flat().join('. ')
					: 'Failed to submit Form IV')
			setError(msg)
			return false
		} finally {
			setSubmitting(false)
		}
	}, [
		applicantName,
		applicantResidentialAddress,
		factsOfCase,
		groundsForRelief,
		interimOrderSought,
		jurisdictionOfRentAuthority,
		listOfEnclosures,
		mattersNotPreviouslyFiledOrPending,
		oppositePartyName,
		oppositePartyResidentialAddress,
		particularsOfViolation,
		reliefSought,
		signatureImage,
		signatureName,
		tenancyUIN,
		navigate,
	])

	const previewData = useMemo(
		() =>
			previewSections(
				previewSection('Tenancy', [previewItem('Tenancy UIN', tenancyUIN)]),
				previewSection('Parties', [
					previewItem('Applicant name', applicantName),
					previewItem('Applicant address', applicantResidentialAddress),
					previewItem('Opposite party name', oppositePartyName),
					previewItem('Opposite party address', oppositePartyResidentialAddress),
				]),
				previewSection('Case details', [
					previewItem('Particulars of violation', particularsOfViolation),
					previewItem('Jurisdiction of Rent Authority', jurisdictionOfRentAuthority),
					previewItem('Facts of the case', factsOfCase),
					previewItem('Grounds for relief', groundsForRelief),
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
			applicantName,
			applicantResidentialAddress,
			factsOfCase,
			groundsForRelief,
			interimOrderSought,
			jurisdictionOfRentAuthority,
			listOfEnclosures,
			mattersNotPreviouslyFiledOrPending,
			oppositePartyName,
			oppositePartyResidentialAddress,
			particularsOfViolation,
			reliefSought,
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

	const handleTenancyLoaded = (tenancy) =>
		applyTenancyAutofill(APPLICATION_TYPES.RENT_AUTHORITY_FILING, tenancy, user, {
			setTenancyUIN,
			setApplicantName,
			setApplicantResidentialAddress,
			setOppositePartyName,
			setOppositePartyResidentialAddress,
			setJurisdictionOfRentAuthority,
		})

	return (
		<div className="dashboard-card service-form-panel">
			<h1>{serviceMeta?.label || 'Form IV - Matters under Rule 11'}</h1>
			<p className="muted">
				{serviceMeta
					? `${serviceMeta.matter} (${serviceMeta.rule}) - ${serviceMeta.authority}`
					: 'Fill the application details and submit to the system.'}
			</p>
			{error ? <div className="error">{error}</div> : null}

			<form className="tenancy-form" onSubmit={requestPreview}>
				<TenancyUinLookup
					value={tenancyUIN}
					onChange={setTenancyUIN}
					onLoaded={handleTenancyLoaded}
				/>

				<fieldset className="tenancy-fieldset">
					<legend>A. Applicant</legend>
					<label>
						<span className="label-text required">Name of the Applicant</span>
						<input type="text" value={applicantName} onChange={(e) => setApplicantName(e.target.value)} required />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text required">Applicant residential address</span>
						<textarea
							value={applicantResidentialAddress}
							onChange={(e) => setApplicantResidentialAddress(e.target.value)}
							required
							rows={3}
						/>
					</label>
				</fieldset>

				<fieldset className="tenancy-fieldset">
					<legend>B. Opposite Party</legend>
					<label>
						<span className="label-text required">Name of the Opposite Party</span>
						<input type="text" value={oppositePartyName} onChange={(e) => setOppositePartyName(e.target.value)} required />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text required">Opposite party residential address</span>
						<textarea
							value={oppositePartyResidentialAddress}
							onChange={(e) => setOppositePartyResidentialAddress(e.target.value)}
							required
							rows={3}
						/>
					</label>
				</fieldset>

				<fieldset className="tenancy-fieldset">
					<legend>Case details</legend>
					<label className="tenancy-field-full">
						<span className="label-text">1) Particulars of violation against which application is made</span>
						<textarea value={particularsOfViolation} onChange={(e) => setParticularsOfViolation(e.target.value)} rows={3} />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text">2) Jurisdiction of the Rent Authority</span>
						<textarea value={jurisdictionOfRentAuthority} onChange={(e) => setJurisdictionOfRentAuthority(e.target.value)} rows={3} />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text">3) Facts of the case</span>
						<textarea value={factsOfCase} onChange={(e) => setFactsOfCase(e.target.value)} rows={3} />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text">4) Grounds for relief</span>
						<textarea value={groundsForRelief} onChange={(e) => setGroundsForRelief(e.target.value)} rows={3} />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text">5) Matters not previously filed or pending</span>
						<textarea value={mattersNotPreviouslyFiledOrPending} onChange={(e) => setMattersNotPreviouslyFiledOrPending(e.target.value)} rows={3} />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text">6) Relief sought</span>
						<textarea value={reliefSought} onChange={(e) => setReliefSought(e.target.value)} rows={3} />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text">7) Interim order sought</span>
						<textarea value={interimOrderSought} onChange={(e) => setInterimOrderSought(e.target.value)} rows={3} />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text">8) List of enclosures</span>
						<textarea value={listOfEnclosures} onChange={(e) => setListOfEnclosures(e.target.value)} rows={3} />
					</label>
				</fieldset>

				<fieldset className="tenancy-fieldset">
					<legend>Verification / Signature</legend>
					<label>
						<span className="label-text required">Applicant name</span>
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
							rows={3}
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
					<label className="tenancy-field-full">
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
				title="Review Form IV"
				subtitle={serviceMeta?.label}
				sections={previewData}
				onClose={closePreview}
				onConfirm={confirmSubmit}
				confirming={submitting}
				confirmLabel="Confirm & submit Form IV"
			/>
		</div>
	)
}



