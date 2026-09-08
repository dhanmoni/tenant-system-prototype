import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api, { csrf } from '../api'
import TenancyUinLookup from './forms/TenancyUinLookup'
import ServiceFormPreviewModal from './forms/ServiceFormPreviewModal'
import { useServiceFormPreview } from '../hooks/useServiceFormPreview'
import { profileDefaults } from '../utils/profileAutofill'
import { APPLICATION_TYPES } from '../constants/application'
import { previewItem, previewSection, previewSections } from '../utils/serviceFormPreview'
import { completeServiceFormSubmit, getServiceFormSuccessMessage } from '../utils/serviceFormSubmit'
import { applyTenancyAutofill } from '../utils/tenancyUinAutofill'

const parseMoney = (value) => {
	// Accept inputs like "25,000.50" and normalize to a number
	const raw = String(value ?? '')
	const cleaned = raw.replace(/,/g, '').replace(/[^0-9.]/g, '')
	const num = Number(cleaned)
	return Number.isFinite(num) ? num : 0
}

export default function FormIRentRevisionPanel({ onBack, serviceMeta, user }) {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')

	const [tenancyUIN, setTenancyUIN] = useState('')
	const [tenancyAgreementDocumentNo, setTenancyAgreementDocumentNo] = useState('')

	// Both parties are named on this form, so only the filer's own side is seeded from the
	// account. Which side that is comes from the profile type; all of it stays editable.
	const profile = useMemo(() => profileDefaults(user), [user])
	const filesAsTenant = profile.side === 'TENANT'

	const [landlordName, setLandlordName] = useState(filesAsTenant ? '' : profile.name)
	const [landlordAddress, setLandlordAddress] = useState(filesAsTenant ? '' : profile.address)

	const [tenantName, setTenantName] = useState(filesAsTenant ? profile.name : '')
	const [tenantAddress, setTenantAddress] = useState(filesAsTenant ? profile.address : '')

	const [managerName, setManagerName] = useState('')
	const [managerAddress, setManagerAddress] = useState('')

	const [rentedPremisesDescription, setRentedPremisesDescription] = useState('')
	const [presentMonthlyRent, setPresentMonthlyRent] = useState('')
	const [proposedMonthlyRent, setProposedMonthlyRent] = useState('')

	const [reasonForRentRevision, setReasonForRentRevision] = useState('')

	const [signedBy, setSignedBy] = useState('landlord')
	const [signatureName, setSignatureName] = useState(profile.name)
	const [signatureImage, setSignatureImage] = useState(null)

	const mutation = useMutation({
		mutationFn: async (formData) => {
			await csrf()
			const { data } = await api.post('/api/rent-revision-applications', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})
			return data
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['citizen-applications'] })
			queryClient.invalidateQueries({ queryKey: ['admin-applications'] })
			completeServiceFormSubmit(
				navigate,
				getServiceFormSuccessMessage(data, 'Form I (Rent revision) submitted successfully.')
			)
		},
		onError: (err) => {
			const msg =
				err?.response?.data?.message ||
				(err?.response?.data?.errors
					? Object.values(err.response.data.errors).flat().join('. ')
					: 'Failed to submit Form I')
			setError(msg)
		}
	})

	const submit = useCallback(async () => {
		setError('')
		setSubmitting(true)
		try {
			const formData = new FormData()
			formData.append('tenancy_uin', tenancyUIN.trim())
			if (tenancyAgreementDocumentNo.trim()) {
				formData.append('tenancy_agreement_document_no', tenancyAgreementDocumentNo.trim())
			}
			formData.append('landlord_name', landlordName.trim())
			formData.append('landlord_address', landlordAddress.trim())
			formData.append('tenant_name', tenantName.trim())
			formData.append('tenant_address', tenantAddress.trim())
			if (managerName.trim()) formData.append('manager_name', managerName.trim())
			if (managerAddress.trim()) formData.append('manager_address', managerAddress.trim())

			formData.append('rented_premises_description', rentedPremisesDescription.trim())
			formData.append('present_monthly_rent', String(parseMoney(presentMonthlyRent)))
			formData.append('proposed_monthly_rent', String(parseMoney(proposedMonthlyRent)))
			formData.append('reason_for_rent_revision', reasonForRentRevision.trim())

			formData.append('signed_by', signedBy)
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
		landlordAddress,
		landlordName,
		managerAddress,
		managerName,
		mutation,
		presentMonthlyRent,
		proposedMonthlyRent,
		reasonForRentRevision,
		rentedPremisesDescription,
		signatureImage,
		signatureName,
		signedBy,
		tenancyAgreementDocumentNo,
		tenancyUIN,
		tenantAddress,
		tenantName,
		navigate,
	])

	const previewData = useMemo(
		() =>
			previewSections(
				previewSection('Tenancy', [
					previewItem('Tenancy UIN', tenancyUIN),
					previewItem('Agreement document no.', tenancyAgreementDocumentNo),
				]),
				previewSection('Landlord / tenant', [
					previewItem('Landlord name', landlordName),
					previewItem('Landlord address', landlordAddress),
					previewItem('Tenant name', tenantName),
					previewItem('Tenant address', tenantAddress),
					previewItem('Property manager', managerName),
					previewItem('Manager address', managerAddress),
				]),
				previewSection('Rent details', [
					previewItem('Rented premises', rentedPremisesDescription),
					previewItem('Present monthly rent', presentMonthlyRent),
					previewItem('Proposed monthly rent', proposedMonthlyRent),
					previewItem('Reason for revision', reasonForRentRevision),
				]),
				previewSection('Signature', [
					previewItem('Signed by', signedBy),
					previewItem('Signature name', signatureName),
					previewItem('Signature image', signatureImage),
				])
			),
		[
			landlordAddress,
			landlordName,
			managerAddress,
			managerName,
			presentMonthlyRent,
			proposedMonthlyRent,
			reasonForRentRevision,
			rentedPremisesDescription,
			signatureImage,
			signatureName,
			signedBy,
			tenancyAgreementDocumentNo,
			tenancyUIN,
			tenantAddress,
			tenantName,
		]
	)

	const { previewOpen, requestPreview, closePreview, confirmSubmit } = useServiceFormPreview(submit)

	const handleTenancyLoaded = (tenancy) =>
		applyTenancyAutofill(APPLICATION_TYPES.RENT_REVISION, tenancy, user, {
			setTenancyUIN,
			setLandlordName,
			setLandlordAddress,
			setTenantName,
			setTenantAddress,
			setManagerName,
			setManagerAddress,
			setRentedPremisesDescription,
			setPresentMonthlyRent,
		})

	return (
		<div className="dashboard-card service-form-panel">
			{error ? <div className="error" role="alert">{error}</div> : null}

			<form className="tenancy-form" onSubmit={requestPreview}>
				<TenancyUinLookup
					value={tenancyUIN}
					onChange={setTenancyUIN}
					onLoaded={handleTenancyLoaded}
					label="1. Unique Identification Number issued by the Rent Authority"
				/>

				<label>
					<span className="label-text">2. Document No. of tenancy agreement registered before the Sub-Registrar (if any)</span>
					<input
						type="text"
						value={tenancyAgreementDocumentNo}
						onChange={(e) => setTenancyAgreementDocumentNo(e.target.value)}
					/>
				</label>

				<fieldset className="tenancy-fieldset">
					<legend>Parties</legend>

					<label>
						<span className="label-text required">3. Name of the Landlord</span>
						<input
							type="text"
							value={landlordName}
							onChange={(e) => setLandlordName(e.target.value)}
							required
						/>
					</label>
					<label>
						<span className="label-text required">4. Name(s) of the Tenant</span>
						<input
							type="text"
							value={tenantName}
							onChange={(e) => setTenantName(e.target.value)}
							required
						/>
					</label>

					<label className="tenancy-field-full">
						<span className="label-text required">Address of the Landlord</span>
						<textarea
							value={landlordAddress}
							onChange={(e) => setLandlordAddress(e.target.value)}
							required
							rows={3}
						/>
					</label>
					<label className="tenancy-field-full">
						<span className="label-text required">Address of the Tenant</span>
						<textarea
							value={tenantAddress}
							onChange={(e) => setTenantAddress(e.target.value)}
							required
							rows={3}
						/>
					</label>

					<label>
						<span className="label-text">5. Name of the Property Manager (if any)</span>
						<input type="text" value={managerName} onChange={(e) => setManagerName(e.target.value)} />
					</label>
					<label>
						<span className="label-text">Address of the Property Manager (if any)</span>
						<textarea value={managerAddress} onChange={(e) => setManagerAddress(e.target.value)} rows={2} />
					</label>
				</fieldset>

				<label>
					<span className="label-text required">6. Description of rented premises</span>
					<textarea
						value={rentedPremisesDescription}
						onChange={(e) => setRentedPremisesDescription(e.target.value)}
						required
						rows={3}
					/>
				</label>

				<div className="service-form-fields">
					<label>
						<span className="label-text required">7. Present monthly rent</span>
						<input
							type="text"
							value={presentMonthlyRent}
							onChange={(e) => setPresentMonthlyRent(e.target.value)}
							required
							inputMode="decimal"
							placeholder="e.g. 25000 or 25,000.50"
						/>
					</label>
					<label>
						<span className="label-text required">8. Proposed monthly rent</span>
						<input
							type="text"
							value={proposedMonthlyRent}
							onChange={(e) => setProposedMonthlyRent(e.target.value)}
							required
							inputMode="decimal"
							placeholder="e.g. 27000 or 27,000.00"
						/>
					</label>
				</div>

				<label>
					<span className="label-text required">9. Reason for fixation or revision of rent</span>
					<textarea
						value={reasonForRentRevision}
						onChange={(e) => setReasonForRentRevision(e.target.value)}
						required
						rows={3}
					/>
				</label>

				<fieldset className="tenancy-fieldset">
					<legend>Name and Signature of landlord or tenant</legend>

					<label>
						<span className="label-text required">Signed by</span>
						<select
							required value={signedBy} onChange={(e) => setSignedBy(e.target.value)}>
							<option value="landlord">Landlord</option>
							<option value="tenant">Tenant</option>
						</select>
					</label>

					<label>
						<span className="label-text required">Name</span>
						<input type="text" value={signatureName} onChange={(e) => setSignatureName(e.target.value)} required />
					</label>

					<label className="tenancy-field-full">
						<span className="label-text">Signature image (optional)</span>
						<input
							type="file"
							accept="image/*"
							onChange={(e) => setSignatureImage(e.target.files?.[0] || null)}
						/>
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
				title="Review Form I"
				subtitle={serviceMeta?.label}
				sections={previewData}
				onClose={closePreview}
				onConfirm={confirmSubmit}
				confirming={submitting}
				confirmLabel="Confirm & submit Form I"
			/>
		</div>
	)
}



