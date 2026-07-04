import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { csrf } from '../api'
import ServiceFormPreviewModal from './forms/ServiceFormPreviewModal'
import { useServiceFormPreview } from '../hooks/useServiceFormPreview'
import { previewItem, previewSection, previewSections } from '../utils/serviceFormPreview'
import { completeServiceFormSubmit, getServiceFormSuccessMessage } from '../utils/serviceFormSubmit'

const parseMoney = (value) => {
	// Accept inputs like "25,000.50" and normalize to a number
	const raw = String(value ?? '')
	const cleaned = raw.replace(/,/g, '').replace(/[^0-9.]/g, '')
	const num = Number(cleaned)
	return Number.isFinite(num) ? num : 0
}

export default function FormIRentRevisionPanel({ onBack, serviceMeta }) {
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
	const [presentMonthlyRent, setPresentMonthlyRent] = useState('')
	const [proposedMonthlyRent, setProposedMonthlyRent] = useState('')

	const [reasonForRentRevision, setReasonForRentRevision] = useState('')

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
			formData.append('present_monthly_rent', String(parseMoney(presentMonthlyRent)))
			formData.append('proposed_monthly_rent', String(parseMoney(proposedMonthlyRent)))
			formData.append('reason_for_rent_revision', reasonForRentRevision.trim())

			formData.append('signed_by', signedBy)
			formData.append('signature_name', signatureName.trim())
			if (signatureImage) formData.append('signature_image', signatureImage)

			const { data } = await api.post('/api/rent-revision-applications', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})

			completeServiceFormSubmit(
				navigate,
				getServiceFormSuccessMessage(
					data,
					'Form-I (Rent revision/fixation) submitted successfully.'
				)
			)
			return true
		} catch (err) {
			const msg =
				err?.response?.data?.message ||
				(err?.response?.data?.errors
					? Object.values(err.response.data.errors).flat().join('. ')
					: 'Failed to submit Form-I')
			setError(msg)
			return false
		} finally {
			setSubmitting(false)
		}
	}, [
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

	return (
		<div className="dashboard-card service-form-panel">
			<h1>{serviceMeta?.label || 'Form I - Revision or fixation of rent'}</h1>
			<p className="muted">
				{serviceMeta
					? `${serviceMeta.matter} (${serviceMeta.rule}) - ${serviceMeta.authority}`
					: 'Fill the application details and submit to the system.'}
			</p>
			{error ? <div className="error">{error}</div> : null}

			<form className="tenancy-form" onSubmit={requestPreview}>
				<label>
					<span className="label-text required">Tenancy UIN</span>
					<input
						type="text"
						value={tenancyUIN}
						onChange={(e) => setTenancyUIN(e.target.value)}
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
						{submitting ? 'Submitting...' : 'Review & submit'}
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



