import { useState } from 'react'
import api, { csrf } from '../api'

export default function FormIBValuerAppointmentPanel({ onBack }) {
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	const [rentAuthorityUid, setRentAuthorityUid] = useState('')

	const [applicantName, setApplicantName] = useState('')
	const [applicantRelationType, setApplicantRelationType] = useState('Son')
	const [applicantRelationTargetName, setApplicantRelationTargetName] = useState('')
	const [applicantResidentPlace, setApplicantResidentPlace] = useState('')

	const [applicantLandlordOrTenant, setApplicantLandlordOrTenant] = useState('landlord')
	const [premisesSituatedAddress, setPremisesSituatedAddress] = useState('')
	const [district, setDistrict] = useState('')

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

			formData.append('applicant_name', applicantName.trim())
			formData.append('applicant_relation_type', applicantRelationType)
			formData.append(
				'applicant_relation_target_name',
				applicantRelationTargetName.trim()
			)
			formData.append('applicant_resident_place', applicantResidentPlace.trim())
			formData.append('applicant_landlord_or_tenant', applicantLandlordOrTenant)

			formData.append(
				'premises_situated_address',
				premisesSituatedAddress.trim()
			)
			formData.append('district', district.trim())

			formData.append('signed_by', signedBy)
			formData.append('signature_name', signatureName.trim())
			if (signatureImage) formData.append('signature_image', signatureImage)

			const { data } = await api.post('/api/valuer-appointment-applications', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})

			setSuccess(data?.message || 'Form-I-B submitted successfully.')
		} catch (err) {
			const msg =
				err?.response?.data?.message ||
				(err?.response?.data?.errors
					? Object.values(err.response.data.errors).flat().join('. ')
					: 'Failed to submit Form-I-B')
			setError(msg)
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="auth-card dashboard-card">
			<h1>Form-I-B: Valuer appointment</h1>
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

				<fieldset className="tenancy-fieldset">
					<legend className="tenancy-legend-italic">Applicant details</legend>

					<label>
						<span className="label-text required">Applicant name (I, ...)</span>
						<input
							type="text"
							value={applicantName}
							onChange={(e) => setApplicantName(e.target.value)}
							required
						/>
					</label>

					<label>
						<span className="label-text required">Relation type (Son / Daughter / Wife)</span>
						<select
							value={applicantRelationType}
							onChange={(e) => setApplicantRelationType(e.target.value)}
							required
						>
							<option value="Son">Son</option>
							<option value="Daughter">Daughter</option>
							<option value="Wife">Wife</option>
						</select>
					</label>

					<label>
						<span className="label-text required">Relation target name (of ...)</span>
						<input
							type="text"
							value={applicantRelationTargetName}
							onChange={(e) => setApplicantRelationTargetName(e.target.value)}
							required
						/>
					</label>

					<label>
						<span className="label-text required">Resident of (place)</span>
						<input
							type="text"
							value={applicantResidentPlace}
							onChange={(e) => setApplicantResidentPlace(e.target.value)}
							required
						/>
					</label>

					<label>
						<span className="label-text required">Landlord or tenant</span>
						<select
							value={applicantLandlordOrTenant}
							onChange={(e) => setApplicantLandlordOrTenant(e.target.value)}
							required
						>
							<option value="landlord">Landlord</option>
							<option value="tenant">Tenant</option>
						</select>
					</label>
				</fieldset>

				<label>
					<span className="label-text required">Premises situated at</span>
					<textarea
						value={premisesSituatedAddress}
						onChange={(e) => setPremisesSituatedAddress(e.target.value)}
						required
					/>
				</label>

				<label>
					<span className="label-text required">District</span>
					<input
						type="text"
						value={district}
						onChange={(e) => setDistrict(e.target.value)}
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
						<input
							type="text"
							value={signatureName}
							onChange={(e) => setSignatureName(e.target.value)}
							required
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
						{submitting ? 'Submitting...' : 'Submit Form-I-B'}
					</button>
				</div>
			</form>
		</div>
	)
}

