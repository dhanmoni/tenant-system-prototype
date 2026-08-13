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

export default function FormIARentRevisionPanel({ onBack, serviceMeta, user }) {
	const navigate = useNavigate()
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')

	const [tenancyUIN, setTenancyUIN] = useState('')
	const [tenancyAgreementDocumentNo, setTenancyAgreementDocumentNo] = useState('')

	const [landlordName, setLandlordName] = useState('')
	const [landlordAddress, setLandlordAddress] = useState('')

	const [tenantName, setTenantName] = useState('')
	const [tenantAddress, setTenantAddress] = useState('')

	const [managerName, setManagerName] = useState('')
	const [managerAddress, setManagerAddress] = useState('')

	const [rentedPremisesDescription, setRentedPremisesDescription] = useState('')
	const [existingOtherChargesDetails, setExistingOtherChargesDetails] = useState('')
	const [proposedOtherChargesDetails, setProposedOtherChargesDetails] = useState('')
	const [reasonForOtherChargesRevision, setReasonForOtherChargesRevision] = useState('')

	const [signedBy, setSignedBy] = useState('landlord')
	const [signatureName, setSignatureName] = useState('')
	const [signatureImage, setSignatureImage] = useState(null)

	const submit = useCallback(async () => {
		setError('')
		setSubmitting(true)
		try {
			await csrf()
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
			formData.append('existing_other_charges_details', existingOtherChargesDetails.trim())
			formData.append('proposed_other_charges_details', proposedOtherChargesDetails.trim())
			formData.append('reason_for_other_charges_revision', reasonForOtherChargesRevision.trim())

			formData.append('signed_by', signedBy)
			formData.append('signature_name', signatureName.trim())
			if (signatureImage) formData.append('signature_image', signatureImage)

			const { data } = await api.post('/api/other-charges-revision-applications', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})

			completeServiceFormSubmit(
				navigate,
				getServiceFormSuccessMessage(
					data,
					'Form-I-A (Other charges revision/fixation) submitted successfully.'
				)
			)
			return true
		} catch (err) {
			const msg =
				err?.response?.data?.message ||
				(err?.response?.data?.errors
					? Object.values(err.response.data.errors).flat().join('. ')
					: 'Failed to submit Form-I-A')
			setError(msg)
			return false
		} finally {
			setSubmitting(false)
		}
	}, [
		existingOtherChargesDetails,
		landlordAddress,
		landlordName,
		managerAddress,
		managerName,
		proposedOtherChargesDetails,
		reasonForOtherChargesRevision,
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
				previewSection('Other charges details', [
					previewItem('Rented premises', rentedPremisesDescription),
					previewItem('Existing other charges', existingOtherChargesDetails),
					previewItem('Proposed other charges', proposedOtherChargesDetails),
					previewItem('Reason for revision', reasonForOtherChargesRevision),
				]),
				previewSection('Signature', [
					previewItem('Signed by', signedBy),
					previewItem('Signature name', signatureName),
					previewItem('Signature image', signatureImage),
				])
			),
		[
			existingOtherChargesDetails,
			landlordAddress,
			landlordName,
			managerAddress,
			managerName,
			proposedOtherChargesDetails,
			reasonForOtherChargesRevision,
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
		applyTenancyAutofill(APPLICATION_TYPES.OTHER_CHARGES_REVISION, tenancy, user, {
			setTenancyUIN,
			setLandlordName,
			setLandlordAddress,
			setTenantName,
			setTenantAddress,
			setManagerName,
			setManagerAddress,
			setRentedPremisesDescription,
			setExistingOtherChargesDetails,
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
					<span className="label-text">Document No. of tenancy agreement (before Sub-Registrar, if any)</span>
					<input
						type="text"
						value={tenancyAgreementDocumentNo}
						onChange={(e) => setTenancyAgreementDocumentNo(e.target.value)}
					/>
				</label>

				<fieldset className="tenancy-fieldset">
					<legend>Landlord / Tenant details</legend>

					<label>
						<span className="label-text required">Landlord name</span>
						<input type="text" value={landlordName} onChange={(e) => setLandlordName(e.target.value)} required />
					</label>
					<label>
						<span className="label-text required">Tenant name</span>
						<input type="text" value={tenantName} onChange={(e) => setTenantName(e.target.value)} required />
					</label>

					<label className="tenancy-field-full">
						<span className="label-text required">Landlord address</span>
						<textarea value={landlordAddress} onChange={(e) => setLandlordAddress(e.target.value)} required rows={3} />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text required">Tenant address</span>
						<textarea value={tenantAddress} onChange={(e) => setTenantAddress(e.target.value)} required rows={3} />
					</label>

					<label>
						<span className="label-text">Property manager name (if any)</span>
						<input type="text" value={managerName} onChange={(e) => setManagerName(e.target.value)} />
					</label>
					<label>
						<span className="label-text">Property manager address (if any)</span>
						<textarea value={managerAddress} onChange={(e) => setManagerAddress(e.target.value)} rows={2} />
					</label>
				</fieldset>

				<label>
					<span className="label-text required">Description of rented premises</span>
					<textarea
						value={rentedPremisesDescription}
						onChange={(e) => setRentedPremisesDescription(e.target.value)}
						required
						rows={3}
					/>
				</label>

				<div className="service-form-fields">
					<label>
						<span className="label-text required">Existing details of other charges</span>
						<textarea
							value={existingOtherChargesDetails}
							onChange={(e) => setExistingOtherChargesDetails(e.target.value)}
							required
							rows={3}
						/>
					</label>
					<label>
						<span className="label-text required">Proposed other charges</span>
						<textarea
							value={proposedOtherChargesDetails}
							onChange={(e) => setProposedOtherChargesDetails(e.target.value)}
							required
							rows={3}
						/>
					</label>
				</div>

				<label>
					<span className="label-text required">Reason for fixation / revision of other charges</span>
					<textarea
						value={reasonForOtherChargesRevision}
						onChange={(e) => setReasonForOtherChargesRevision(e.target.value)}
						required
						rows={3}
					/>
				</label>

				<fieldset className="tenancy-fieldset">
					<legend>Signature</legend>

					<label>
						<span className="label-text">Signed by</span>
						<select value={signedBy} onChange={(e) => setSignedBy(e.target.value)}>
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
				title="Review Form I-A"
				subtitle={serviceMeta?.label}
				sections={previewData}
				onClose={closePreview}
				onConfirm={confirmSubmit}
				confirming={submitting}
				confirmLabel="Confirm & submit Form I-A"
			/>
		</div>
	)
}



