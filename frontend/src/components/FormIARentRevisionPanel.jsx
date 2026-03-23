import { useState } from 'react'
import api, { csrf } from '../api'

export default function FormIARentRevisionPanel({ onBack }) {
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	const [rentAuthorityUid, setRentAuthorityUid] = useState('')
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

	const submit = async () => {
		setError('')
		setSuccess('')
		setSubmitting(true)
		try {
			await csrf()
			const formData = new FormData()
			formData.append('rent_authority_uid', rentAuthorityUid.trim())
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

			setSuccess(data?.message || 'Form-I-A submitted successfully.')
		} catch (err) {
			const msg =
				err?.response?.data?.message ||
				(err?.response?.data?.errors
					? Object.values(err.response.data.errors).flat().join('. ')
					: 'Failed to submit Form-I-A')
			setError(msg)
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="auth-card dashboard-card">
			<h1>Form-I-A: Other charges revision / fixation</h1>
			<p className="muted">Fill the application details and submit to the system.</p>
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
					<span className="label-text required">Unique Identification Number (UID) issued by Rent Authority</span>
					<input
						type="text"
						value={rentAuthorityUid}
						onChange={(e) => setRentAuthorityUid(e.target.value)}
						required
					/>
				</label>

				<label>
					<span className="label-text">Document No. of tenancy agreement (before Sub-Registrar, if any)</span>
					<input
						type="text"
						value={tenancyAgreementDocumentNo}
						onChange={(e) => setTenancyAgreementDocumentNo(e.target.value)}
					/>
				</label>

				<fieldset className="tenancy-fieldset">
					<legend className="tenancy-legend-italic">Landlord / Tenant Details</legend>

					<label>
						<span className="label-text required">Landlord name</span>
						<input type="text" value={landlordName} onChange={(e) => setLandlordName(e.target.value)} required />
					</label>
					<label>
						<span className="label-text required">Landlord address</span>
						<textarea value={landlordAddress} onChange={(e) => setLandlordAddress(e.target.value)} required />
					</label>

					<label>
						<span className="label-text required">Tenant name</span>
						<input type="text" value={tenantName} onChange={(e) => setTenantName(e.target.value)} required />
					</label>
					<label>
						<span className="label-text required">Tenant address</span>
						<textarea value={tenantAddress} onChange={(e) => setTenantAddress(e.target.value)} required />
					</label>

					<label>
						<span className="label-text">Property manager name (if any)</span>
						<input type="text" value={managerName} onChange={(e) => setManagerName(e.target.value)} />
					</label>
					<label>
						<span className="label-text">Property manager address (if any)</span>
						<textarea value={managerAddress} onChange={(e) => setManagerAddress(e.target.value)} />
					</label>
				</fieldset>

				<label>
					<span className="label-text required">Description of rented premises</span>
					<textarea
						value={rentedPremisesDescription}
						onChange={(e) => setRentedPremisesDescription(e.target.value)}
						required
					/>
				</label>

				<label>
					<span className="label-text required">Existing details of other charges</span>
					<textarea
						value={existingOtherChargesDetails}
						onChange={(e) => setExistingOtherChargesDetails(e.target.value)}
						required
					/>
				</label>

				<label>
					<span className="label-text required">Proposed other charges</span>
					<textarea
						value={proposedOtherChargesDetails}
						onChange={(e) => setProposedOtherChargesDetails(e.target.value)}
						required
					/>
				</label>

				<label>
					<span className="label-text required">Reason for fixation / revision of other charges</span>
					<textarea
						value={reasonForOtherChargesRevision}
						onChange={(e) => setReasonForOtherChargesRevision(e.target.value)}
						required
					/>
				</label>

				<fieldset className="tenancy-fieldset">
					<legend className="tenancy-legend-italic">Signature</legend>

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
						{submitting ? 'Submitting...' : 'Submit Form-I-A'}
					</button>
				</div>
			</form>
		</div>
	)
}

