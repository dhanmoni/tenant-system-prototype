import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api, { csrf } from '../api'
import TenancyUinLookup from './forms/TenancyUinLookup'
import ServiceFormPreviewModal from './forms/ServiceFormPreviewModal'
import { useServiceFormPreview } from '../hooks/useServiceFormPreview'
import { APPLICATION_TYPES } from '../constants/application'
import { previewItem, previewSection, previewSections } from '../utils/serviceFormPreview'
import { completeServiceFormSubmit, getServiceFormSuccessMessage } from '../utils/serviceFormSubmit'
import { applyTenancyAutofill } from '../utils/tenancyUinAutofill'

export default function Form4RentCourtPossessionPanel({ onBack, serviceMeta, user }) {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')

	const [beforeRentCourt, setBeforeRentCourt] = useState('')

	const [applicantName, setApplicantName] = useState('')
	const [applicantResidentialAddress, setApplicantResidentialAddress] = useState('')

	const [tenancyUIN, setTenancyUIN] = useState('')
	const [tenantName, setTenantName] = useState('')

	const [jurisdictionStatement, setJurisdictionStatement] = useState('')
	const [factsOfCase, setFactsOfCase] = useState('')
	const [groundsForRelief, setGroundsForRelief] = useState('')
	const [mattersNotPreviouslyFiled, setMattersNotPreviouslyFiled] = useState('')
	const [reliefSought, setReliefSought] = useState('')
	const [interimOrderSought, setInterimOrderSought] = useState('')
	const [enclosuresList, setEnclosuresList] = useState('')

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

	const mutation = useMutation({
		mutationFn: async (formData) => {
			await csrf()
			const { data } = await api.post('/api/rent-court-possession-applications', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})
			return data
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['citizen-applications'] })
			queryClient.invalidateQueries({ queryKey: ['admin-applications'] })
			completeServiceFormSubmit(
				navigate,
				getServiceFormSuccessMessage(data, 'Form II submitted successfully.')
			)
		},
		onError: (err) => {
			const msg =
				err?.response?.data?.message ||
				(err?.response?.data?.errors
					? Object.values(err.response.data.errors).flat().join('. ')
					: 'Failed to submit Form II')
			setError(msg)
		}
	})

	const submit = useCallback(async () => {
		setError('')
		setSubmitting(true)
		try {
			const formData = new FormData()

			formData.append('before_rent_court', beforeRentCourt.trim())
			formData.append('applicant_name', applicantName.trim())
			formData.append('applicant_residential_address', applicantResidentialAddress.trim())

			formData.append('tenancy_uin', tenancyUIN.trim())
			if (tenantName.trim()) formData.append('tenant_name', tenantName.trim())

			if (jurisdictionStatement.trim()) formData.append('jurisdiction_statement', jurisdictionStatement.trim())
			if (factsOfCase.trim()) formData.append('facts_of_case', factsOfCase.trim())
			if (groundsForRelief.trim()) formData.append('grounds_for_relief', groundsForRelief.trim())
			if (mattersNotPreviouslyFiled.trim()) formData.append('matters_not_previously_filed', mattersNotPreviouslyFiled.trim())
			if (reliefSought.trim()) formData.append('relief_sought', reliefSought.trim())
			if (interimOrderSought.trim()) formData.append('interim_order_sought', interimOrderSought.trim())
			if (enclosuresList.trim()) formData.append('enclosures_list', enclosuresList.trim())

			formData.append('signature_name', signatureName.trim())
			if (signatureImage) formData.append('signature_image', signatureImage)

			await mutation.mutateAsync(formData)
			return true
		} catch (err) {
			return false
		} finally {
			setSubmitting(false)
		}
	}, [
		applicantName,
		applicantResidentialAddress,
		beforeRentCourt,
		enclosuresList,
		factsOfCase,
		groundsForRelief,
		interimOrderSought,
		jurisdictionStatement,
		mattersNotPreviouslyFiled,
		reliefSought,
		signatureImage,
		signatureName,
		tenancyUIN,
		tenantName,
		navigate,
	])

	const previewData = useMemo(
		() =>
			previewSections(
				previewSection('Court / tenancy', [
					previewItem('Before the Rent Court', beforeRentCourt),
					previewItem('Tenancy UIN', tenancyUIN),
					previewItem('Tenant name', tenantName),
				]),
				previewSection('Applicant', [
					previewItem('Applicant name', applicantName),
					previewItem('Applicant address', applicantResidentialAddress),
				]),
				previewSection('Case details', [
					previewItem('Jurisdiction statement', jurisdictionStatement),
					previewItem('Facts of the case', factsOfCase),
					previewItem('Grounds for relief', groundsForRelief),
					previewItem('Matters not previously filed', mattersNotPreviouslyFiled),
					previewItem('Relief sought', reliefSought),
					previewItem('Interim order sought', interimOrderSought),
					previewItem('List of enclosures', enclosuresList),
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
			beforeRentCourt,
			enclosuresList,
			factsOfCase,
			groundsForRelief,
			interimOrderSought,
			jurisdictionStatement,
			mattersNotPreviouslyFiled,
			reliefSought,
			signatureImage,
			signatureName,
			tenancyUIN,
			tenantName,
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
		applyTenancyAutofill(APPLICATION_TYPES.RENT_COURT_POSSESSION, tenancy, user, {
			setTenancyUIN,
			setApplicantName,
			setApplicantResidentialAddress,
			setTenantName,
			setBeforeRentCourt,
			setJurisdictionStatement,
		})

	return (
		<div className="dashboard-card service-form-panel">
			{error ? <div className="error" role="alert">{error}</div> : null}

			<form className="tenancy-form" onSubmit={requestPreview}>
				<TenancyUinLookup
					value={tenancyUIN}
					onChange={setTenancyUIN}
					onLoaded={handleTenancyLoaded}
				/>

				<label>
					<span className="label-text required">Before the Rent Court</span>
					<input type="text" value={beforeRentCourt} onChange={(e) => setBeforeRentCourt(e.target.value)} required />
				</label>

				<fieldset className="tenancy-fieldset">
					<legend>Applicant details</legend>

					<label>
						<span className="label-text required">Name of the Applicant</span>
						<input type="text" value={applicantName} onChange={(e) => setApplicantName(e.target.value)} required />
					</label>
					<label>
						<span className="label-text">Tenant name (optional)</span>
						<input type="text" value={tenantName} onChange={(e) => setTenantName(e.target.value)} />
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
					<legend>Case details</legend>
					<label className="tenancy-field-full">
						<span className="label-text">Jurisdiction of the Rent Court (optional)</span>
						<textarea value={jurisdictionStatement} onChange={(e) => setJurisdictionStatement(e.target.value)} rows={3} />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text">Facts of the case (optional)</span>
						<textarea value={factsOfCase} onChange={(e) => setFactsOfCase(e.target.value)} rows={3} />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text">Grounds for relief (optional)</span>
						<textarea value={groundsForRelief} onChange={(e) => setGroundsForRelief(e.target.value)} rows={3} />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text">Matters not previously filed or pending (optional)</span>
						<textarea value={mattersNotPreviouslyFiled} onChange={(e) => setMattersNotPreviouslyFiled(e.target.value)} rows={3} />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text">Relief sought (optional)</span>
						<textarea value={reliefSought} onChange={(e) => setReliefSought(e.target.value)} rows={3} />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text">Interim order sought (optional)</span>
						<textarea value={interimOrderSought} onChange={(e) => setInterimOrderSought(e.target.value)} rows={3} />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text">List of enclosures (optional)</span>
						<textarea value={enclosuresList} onChange={(e) => setEnclosuresList(e.target.value)} rows={3} />
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
					<button type="button" className="ws-btn ws-btn--outline" onClick={onBack} disabled={submitting}>
						Back
					</button>
					<button type="submit" className="ws-btn ws-btn--primary" disabled={submitting}>
						{submitting ? 'Submitting…' : 'Review & submit'}
					</button>
				</div>
			</form>

			<ServiceFormPreviewModal
				open={previewOpen}
				title="Review Form II"
				subtitle={serviceMeta?.label}
				sections={previewData}
				onClose={closePreview}
				onConfirm={confirmSubmit}
				confirming={submitting}
				confirmLabel="Confirm & submit Form II"
			/>
		</div>
	)
}



