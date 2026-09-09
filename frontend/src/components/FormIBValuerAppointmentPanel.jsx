import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api, { csrf } from '../api'
import TenancyUinLookup from './forms/TenancyUinLookup'
import ValuerApplicationClause from './forms/ValuerApplicationClause'
import { hasProfileDefaults, profileDefaults } from '../utils/profileAutofill'
import ServiceFormPreviewModal from './forms/ServiceFormPreviewModal'
import { useServiceFormPreview } from '../hooks/useServiceFormPreview'
import { APPLICATION_TYPES } from '../constants/application'
import { previewItem, previewSection, previewSections } from '../utils/serviceFormPreview'
import { completeServiceFormSubmit, getServiceFormSuccessMessage } from '../utils/serviceFormSubmit'
import { applyTenancyAutofill } from '../utils/tenancyUinAutofill'

export default function FormIBValuerAppointmentPanel({ onBack, serviceMeta, user }) {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')

	const [tenancyUIN, setTenancyUIN] = useState('')

	// The account already holds these. Seeded at mount, not fixed: every one stays editable, and
	// the filer is the one making the application on them.
	const profile = useMemo(() => profileDefaults(user), [user])

	const [applicantName, setApplicantName] = useState(profile.name)
	const [applicantRelationType, setApplicantRelationType] = useState('Son')
	const [applicantRelationTargetName, setApplicantRelationTargetName] = useState('')
	const [applicantResidentPlace, setApplicantResidentPlace] = useState(profile.address)

	const [applicantLandlordOrTenant, setApplicantLandlordOrTenant] = useState(
		profile.side === 'TENANT' ? 'tenant' : 'landlord'
	)
	const [premisesSituatedAddress, setPremisesSituatedAddress] = useState('')
	const [district, setDistrict] = useState(profile.district)

	const [signedBy, setSignedBy] = useState(profile.side === 'TENANT' ? 'tenant' : 'landlord')
	const [signatureName, setSignatureName] = useState(profile.name)
	const [signatureImage, setSignatureImage] = useState(null)

	const mutation = useMutation({
		mutationFn: async (formData) => {
			await csrf()
			const { data } = await api.post('/api/valuer-appointment-applications', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})
			return data
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['citizen-applications'] })
			queryClient.invalidateQueries({ queryKey: ['admin-applications'] })
			completeServiceFormSubmit(
				navigate,
				getServiceFormSuccessMessage(data, 'Form I-B submitted successfully.')
			)
		},
		onError: (err) => {
			const msg =
				err?.response?.data?.message ||
				(err?.response?.data?.errors
					? Object.values(err.response.data.errors).flat().join('. ')
					: 'Failed to submit Form I-B')
			setError(msg)
		}
	})

	const submit = useCallback(async () => {
		setError('')
		setSubmitting(true)
		try {
			const formData = new FormData()
			formData.append('tenancy_uin', tenancyUIN.trim())

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

			await mutation.mutateAsync(formData)
			return true
		} catch (err) {
			return false
		} finally {
			setSubmitting(false)
		}
	}, [
		applicantLandlordOrTenant,
		applicantName,
		applicantRelationTargetName,
		applicantRelationType,
		applicantResidentPlace,
		district,
		mutation,
		premisesSituatedAddress,
		signatureImage,
		signatureName,
		signedBy,
		tenancyUIN,
		navigate,
	])

	const previewData = useMemo(
		() =>
			previewSections(
				previewSection('Tenancy', [previewItem('Tenancy UIN', tenancyUIN)]),
				previewSection('Applicant', [
					previewItem('Applicant name', applicantName),
					previewItem('Relation type', applicantRelationType),
					previewItem('Relation target name', applicantRelationTargetName),
					previewItem('Resident of', applicantResidentPlace),
					previewItem('Landlord or tenant', applicantLandlordOrTenant),
				]),
				previewSection('Premises', [
					previewItem('Premises situated at', premisesSituatedAddress),
					previewItem('District', district),
				]),
				previewSection('Signature', [
					previewItem('Signed by', signedBy),
					previewItem('Signature name', signatureName),
					previewItem('Signature image', signatureImage),
				])
			),
		[
			applicantLandlordOrTenant,
			applicantName,
			applicantRelationTargetName,
			applicantRelationType,
			applicantResidentPlace,
			district,
			premisesSituatedAddress,
			signatureImage,
			signatureName,
			signedBy,
			tenancyUIN,
		]
	)

	const { previewOpen, requestPreview, closePreview, confirmSubmit } = useServiceFormPreview(submit)

	const handleTenancyLoaded = (tenancy) =>
		applyTenancyAutofill(APPLICATION_TYPES.VALUER_APPOINTMENT, tenancy, user, {
			setTenancyUIN,
			setApplicantName,
			setApplicantResidentPlace,
			setApplicantLandlordOrTenant,
			setPremisesSituatedAddress,
			setDistrict,
			setSignedBy,
			setSignatureName,
		})

	// The recital's blanks are named for the sentence, not for this panel's state. One place to
	// map between the two.
	const setClauseField = useCallback(
		(field, value) =>
			({
				name: setApplicantName,
				relation: setApplicantRelationType,
				relativeName: setApplicantRelationTargetName,
				residence: setApplicantResidentPlace,
				capacity: setApplicantLandlordOrTenant,
				premises: setPremisesSituatedAddress,
				district: setDistrict,
			})[field](value),
		[]
	)

	return (
		<div className="dashboard-card service-form-panel">
			{error ? <div className="error" role="alert">{error}</div> : null}

			<form className="tenancy-form" onSubmit={requestPreview}>
				<TenancyUinLookup
					value={tenancyUIN}
					onChange={setTenancyUIN}
					onLoaded={handleTenancyLoaded}
					label="Ref: Unique Identification Number issued by the Rent Authority"
				/>

				<ValuerApplicationClause
					prefilled={hasProfileDefaults(profile)}
					values={{
						name: applicantName,
						relation: applicantRelationType,
						relativeName: applicantRelationTargetName,
						residence: applicantResidentPlace,
						capacity: applicantLandlordOrTenant,
						premises: premisesSituatedAddress,
						district,
					}}
					onChange={setClauseField}
				/>

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
						<input
							type="text"
							value={signatureName}
							onChange={(e) => setSignatureName(e.target.value)}
							required
						/>
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
				title="Review Form I-B"
				subtitle={serviceMeta?.label}
				sections={previewData}
				onClose={closePreview}
				onConfirm={confirmSubmit}
				confirming={submitting}
				confirmLabel="Confirm & submit Form I-B"
			/>
		</div>
	)
}



