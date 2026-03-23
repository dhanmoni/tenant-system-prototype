import { useState } from 'react'
import api, { csrf } from '../api'

const parseMoney = (value) => {
	// Accept inputs like "25,000.50" and normalize to a number
	const raw = String(value ?? '')
	const cleaned = raw.replace(/,/g, '').replace(/[^0-9.]/g, '')
	const num = Number(cleaned)
	return Number.isFinite(num) ? num : 0
}

export default function FormIRentRevisionPanel({ onBack }) {
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
	const [presentMonthlyRent, setPresentMonthlyRent] = useState('')
	const [proposedMonthlyRent, setProposedMonthlyRent] = useState('')

	const [reasonForRentRevision, setReasonForRentRevision] = useState('')

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
			formData.append('present_monthly_rent', String(parseMoney(presentMonthlyRent)))
			formData.append('proposed_monthly_rent', String(parseMoney(proposedMonthlyRent)))
			formData.append('reason_for_rent_revision', reasonForRentRevision.trim())

			formData.append('signed_by', signedBy)
			formData.append('signature_name', signatureName.trim())
			if (signatureImage) formData.append('signature_image', signatureImage)

			const { data } = await api.post('/api/rent-revision-applications', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})

			setSuccess(data?.message || 'Form-I submitted successfully.')
		} catch (err) {
			const msg =
				err?.response?.data?.message ||
				(err?.response?.data?.errors
					? Object.values(err.response.data.errors).flat().join('. ')
					: 'Failed to submit Form-I')
			setError(msg)
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="auth-card dashboard-card">
			<h1>Form-I: Rent revision / fixation</h1>
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
						<input
							type="text"
							value={landlordName}
							onChange={(e) => setLandlordName(e.target.value)}
							required
						/>
					</label>
					<label>
						<span className="label-text required">Landlord address</span>
						<textarea
							value={landlordAddress}
							onChange={(e) => setLandlordAddress(e.target.value)}
							required
						/>
					</label>

					<label>
						<span className="label-text required">Tenant name</span>
						<input
							type="text"
							value={tenantName}
							onChange={(e) => setTenantName(e.target.value)}
							required
						/>
					</label>
					<label>
						<span className="label-text required">Tenant address</span>
						<textarea
							value={tenantAddress}
							onChange={(e) => setTenantAddress(e.target.value)}
							required
						/>
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
					<span className="label-text required">Present monthly rent</span>
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
					<span className="label-text required">Proposed monthly rent</span>
					<input
						type="text"
						value={proposedMonthlyRent}
						onChange={(e) => setProposedMonthlyRent(e.target.value)}
						required
						inputMode="decimal"
						placeholder="e.g. 27000 or 27,000.00"
					/>
				</label>

				<label>
					<span className="label-text required">Reason for fixation / revision of rent</span>
					<textarea
						value={reasonForRentRevision}
						onChange={(e) => setReasonForRentRevision(e.target.value)}
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
						{submitting ? 'Submitting...' : 'Submit Form-I'}
					</button>
				</div>
			</form>
		</div>
	)
}

