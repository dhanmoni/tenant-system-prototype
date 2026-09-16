import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Building2, Check, MapPin, Upload, User } from 'lucide-react'
import api, { csrf } from '../api'
import TenancyUinLookup from './forms/TenancyUinLookup'
import UinPrefillNotice from './forms/UinPrefillNotice'
import ApplyingAsToggle from './forms/ApplyingAsToggle'
import LoadedUinChip from './forms/LoadedUinChip'
import ServiceFormReadyGate from './forms/ServiceFormReadyGate'
import ServiceFormPreviewModal from './forms/ServiceFormPreviewModal'
import FormIBLegalDocument from './forms/FormIBLegalDocument'
import { useServiceFormPreview } from '../hooks/useServiceFormPreview'
import { profileDefaults } from '../utils/profileAutofill'
import { APPLICATION_TYPES } from '../constants/application'
import { FORM_IB_RELATIONS, FORM_IB_UNDERTAKING_TEXT } from '../constants/declarations'
import { completeServiceFormSubmit, getServiceFormSuccessMessage } from '../utils/serviceFormSubmit'
import { applyTenancyAutofill, formatRentAuthorityAddressee } from '../utils/tenancyUinAutofill'
import { useToast } from '../context/ToastContext'

const inputClass =
	'h-full w-full border-0 bg-transparent px-3.5 text-[15px] text-[#151717] outline-none placeholder:text-slate-400'
const inputShellClass = 'form-i-field'
const textareaShellClass = 'form-i-field form-i-field--multiline'

function FormCard({ title, description, badge, uin, onChangeUin, children }) {
	return (
		<section className="sf-form-card overflow-hidden sf-form-card rounded-[20px] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
			<div className="sf-form-card__header">
				{badge ? <span className="sf-form-card__badge">{badge}</span> : null}
				<h1 className="sf-form-card__title">{title}</h1>
				{description ? <p className="sf-form-card__lead">{description}</p> : null}
				{uin ? <LoadedUinChip value={uin} onChange={onChangeUin} /> : null}
			</div>
			<div className="flex flex-col gap-4 p-[30px]">{children}</div>
		</section>
	)
}

const sectionToneClass = {
	record: 'sf-section-panel rounded-2xl border border-[#cbd5e1] bg-white px-5 py-5 sm:px-6',
	application: 'sf-section-panel rounded-2xl border border-[#cbd5e1] bg-white px-5 py-5 sm:px-6',
	signature: 'sf-section-panel rounded-2xl border border-[#cbd5e1] bg-white px-5 py-5 sm:px-6',
	default: '',
}

function FormTick({ checked }) {
	return (
		<span
			className={`mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border-[1.5px] transition ${
				checked
					? 'border-[#0d47a1] bg-[#0d47a1] text-white'
					: 'border-slate-400 bg-white text-transparent'
			}`}
			aria-hidden
		>
			{checked ? <Check size={11} strokeWidth={3} /> : null}
		</span>
	)
}

function FormTopBar({ onBack, disabled = false }) {
	return (
		<div className="form-iv-topbar">
			<button type="button" onClick={onBack} disabled={disabled} className="form-iv-back-btn">
				<ArrowLeft size={18} strokeWidth={2.25} aria-hidden />
				Back
			</button>
		</div>
	)
}

function FormSection({
	step,
	title,
	badge,
	description,
	descriptionClassName = 'mt-1 mb-0 text-sm leading-relaxed text-slate-500',
	tone = 'default',
	children,
}) {
	const toneClass = sectionToneClass[tone] || sectionToneClass.default
	return (
		<div className={toneClass || undefined}>
			<div className="mb-5">
				<div className="flex items-start gap-3">
					{step ? (
						<span className="sf-step-badge" aria-hidden>
							{step}
						</span>
					) : null}
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-2">
							<h3 className="sf-section-title">
								{step ? (
									<span className="sr-only">
										Section {step}.{' '}
									</span>
								) : null}
								{title}
							</h3>
							{badge ? (
								<span className="inline-flex items-center rounded-md border border-[#cbd5e1] bg-[#f1f5f9] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#334155]">
									{badge}
								</span>
							) : null}
						</div>
						{description ? <p className={descriptionClassName}>{description}</p> : null}
					</div>
				</div>
			</div>
			<div className="flex flex-col gap-5">{children}</div>
		</div>
	)
}

function Field({ label, hint, required = false, children }) {
	return (
		<div className="form-iv-field flex min-w-0 flex-col gap-1.5">
			<div className="flex min-w-0 flex-col gap-0.5">
				<div className="flex flex-row flex-wrap items-baseline gap-x-1.5 gap-y-0 text-[14px] font-semibold text-[#151717]">
					<span>{label}</span>
					{required ? <span className="text-red-500">*</span> : null}
				</div>
				{hint ? <p className="m-0 text-[12px] leading-snug text-slate-500">{hint}</p> : null}
			</div>
			{children}
		</div>
	)
}

function InputShell({ icon: Icon, children, className = inputShellClass }) {
	return (
		<div className={className}>
			{Icon ? (
				<span className="form-i-icon-gutter" aria-hidden>
					<Icon size={18} strokeWidth={2} />
				</span>
			) : null}
			{children}
		</div>
	)
}

function ReadOnlyField({
	label,
	value,
	empty = '—',
	icon: Icon,
	multiline = false,
	variant = 'default',
	action = null,
	fromUin = false,
}) {
	const text = String(value ?? '').trim()
	const display = text || empty
	const hasValue = Boolean(text)
	const isUin = variant === 'uin'

	return (
		<div className={`flex min-w-0 flex-col gap-1.5${isUin ? ' form-iv-readonly--uin' : ''}`}>
			<span
				className={`text-[13px] font-semibold uppercase tracking-wide ${
					isUin || fromUin ? 'text-[#0f172a]' : 'text-slate-500'
				}`}
			>
				{label}
				{fromUin ? (
					<span className="form-iv-from-uin-tag !normal-case" title="Filled from the loaded tenancy UIN">
						{' '}
						(from UIN)
					</span>
				) : null}
			</span>
			<div
				className={`form-i-field form-i-field--readonly ${multiline ? 'form-i-field--multiline' : ''} ${
					action ? 'form-i-field--with-action' : ''
				}${isUin ? ' form-iv-uin-field' : ''}`}
			>
				{Icon ? (
					<span className={`form-i-icon-gutter${isUin ? ' form-iv-uin-field__icon' : ''}`} aria-hidden>
						<Icon size={18} strokeWidth={2} />
					</span>
				) : null}
				<p
					className={`form-i-readonly-value m-0 min-w-0 flex-1 whitespace-pre-wrap px-3.5 leading-relaxed ${
						multiline ? 'py-3' : 'flex items-center'
					} ${hasValue ? 'is-filled' : 'is-empty'} ${isUin ? 'form-i-readonly-value--uin' : ''}`}
				>
					{isUin && hasValue ? <strong>{display}</strong> : display}
				</p>
				{action ? <div className="form-i-field-action">{action}</div> : null}
			</div>
		</div>
	)
}

const btnPrimary = 'sf-btn-primary'

export default function FormIBValuerAppointmentPanel({ onBack, serviceMeta, user }) {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const { showToast } = useToast()
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')

	const reportError = useCallback(
		(message) => {
			const text = String(message || '').trim()
			if (!text) return
			setError(text)
			showToast(text, 'error')
		},
		[showToast]
	)

	const [tenancyUIN, setTenancyUIN] = useState('')
	const profile = useMemo(() => profileDefaults(user), [user])

	const [landlordName, setLandlordName] = useState('')
	const [landlordAddress, setLandlordAddress] = useState('')
	const [tenantName, setTenantName] = useState('')
	const [tenantAddress, setTenantAddress] = useState('')

	const [applicantName, setApplicantName] = useState(profile.name)
	const [applicantRelationType, setApplicantRelationType] = useState('Son')
	const [applicantRelationTargetName, setApplicantRelationTargetName] = useState('')
	const [applicantResidentPlace, setApplicantResidentPlace] = useState(profile.address)
	const [applicantLandlordOrTenant, setApplicantLandlordOrTenant] = useState(
		profile.side === 'TENANT' ? 'tenant' : 'landlord'
	)
	const [premisesSituatedAddress, setPremisesSituatedAddress] = useState('')
	const [district, setDistrict] = useState(profile.district)
	const [tenancyOffice, setTenancyOffice] = useState('')

	const [signedBy, setSignedBy] = useState(profile.side === 'TENANT' ? 'tenant' : 'landlord')
	const [signatureImage, setSignatureImage] = useState(null)
	const [feeUndertakingAccepted, setFeeUndertakingAccepted] = useState(false)
	const [recordLoaded, setRecordLoaded] = useState(false)
	const [authorityLine1, setAuthorityLine1] = useState('')
	const [authorityLine2, setAuthorityLine2] = useState('')

	const signaturePreviewUrl = useMemo(
		() => (signatureImage ? URL.createObjectURL(signatureImage) : null),
		[signatureImage]
	)

	useEffect(() => {
		return () => {
			if (signaturePreviewUrl) URL.revokeObjectURL(signaturePreviewUrl)
		}
	}, [signaturePreviewUrl])

	const clearSignatureImage = useCallback(() => setSignatureImage(null), [])

	const clearTenancyRecord = useCallback(() => {
		setRecordLoaded(false)
		setLandlordName('')
		setLandlordAddress('')
		setTenantName('')
		setTenantAddress('')
		setApplicantName(profile.name)
		setApplicantRelationType('Son')
		setApplicantRelationTargetName('')
		setApplicantResidentPlace(profile.address)
		setApplicantLandlordOrTenant(profile.side === 'TENANT' ? 'tenant' : 'landlord')
		setPremisesSituatedAddress('')
		setDistrict(profile.district)
		setTenancyOffice('')
		setSignedBy(profile.side === 'TENANT' ? 'tenant' : 'landlord')
		setSignatureImage(null)
		setFeeUndertakingAccepted(false)
		setAuthorityLine1('')
		setAuthorityLine2('')
		setError('')
	}, [profile.address, profile.district, profile.name, profile.side])

	const handleUinChange = useCallback(
		(value) => {
			setTenancyUIN(value)
			if (recordLoaded) clearTenancyRecord()
		},
		[clearTenancyRecord, recordLoaded]
	)

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
			reportError(msg)
		},
	})

	const signatureNamePreview = applicantName.trim()

	const submit = useCallback(async () => {
		setError('')
		if (!recordLoaded) {
			reportError('Enter your Tenancy UIN and load the tenancy record before submitting Form I-B.')
			return false
		}
		if (!applicantName.trim()) {
			reportError('Enter the applicant name.')
			return false
		}
		if (!applicantRelationTargetName.trim()) {
			reportError('Enter the name of the father, mother or spouse as applicable.')
			return false
		}
		if (!applicantResidentPlace.trim()) {
			reportError('Enter the place at which the applicant resides.')
			return false
		}
		if (!premisesSituatedAddress.trim()) {
			reportError('Enter the address of the premises.')
			return false
		}
		if (!district.trim()) {
			reportError('Enter the district.')
			return false
		}
		if (!feeUndertakingAccepted) {
			reportError('You must accept the fee undertaking to continue.')
			return false
		}
		if (!signatureNamePreview) {
			reportError('Applicant name is required for the signature.')
			return false
		}
		if (!signatureImage) {
			reportError('Upload a signature image to continue.')
			return false
		}
		setSubmitting(true)
		try {
			const formData = new FormData()
			formData.append('tenancy_uin', tenancyUIN.trim())
			formData.append('applicant_name', applicantName.trim())
			formData.append('applicant_relation_type', applicantRelationType)
			formData.append('applicant_relation_target_name', applicantRelationTargetName.trim())
			formData.append('applicant_resident_place', applicantResidentPlace.trim())
			formData.append('applicant_landlord_or_tenant', applicantLandlordOrTenant)
			formData.append('premises_situated_address', premisesSituatedAddress.trim())
			formData.append('district', district.trim())
			formData.append('signed_by', signedBy)
			formData.append('signature_name', signatureNamePreview)
			formData.append('signature_image', signatureImage)

			await mutation.mutateAsync(formData)
			return true
		} catch {
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
		feeUndertakingAccepted,
		mutation,
		premisesSituatedAddress,
		recordLoaded,
		reportError,
		signatureImage,
		signatureNamePreview,
		signedBy,
		tenancyUIN,
	])

	const { previewOpen, requestPreview, closePreview, confirmSubmit } = useServiceFormPreview(submit)

	const handleTenancyLoaded = (tenancy) => {
		setLandlordName(String(tenancy?.landlord_name || '').trim())
		setLandlordAddress(String(tenancy?.landlord_address || '').trim())
		setTenantName(String(tenancy?.tenant_name || '').trim())
		setTenantAddress(String(tenancy?.tenant_address || '').trim())
		const filled = applyTenancyAutofill(APPLICATION_TYPES.VALUER_APPOINTMENT, tenancy, user, {
			setTenancyUIN,
			setApplicantName,
			setApplicantResidentPlace,
			setApplicantLandlordOrTenant,
			setPremisesSituatedAddress,
			setDistrict,
			setSignedBy,
		})
		const authority = formatRentAuthorityAddressee(tenancy)
		setAuthorityLine1(authority.line1)
		setAuthorityLine2(authority.line2)
		setTenancyOffice(String(tenancy?.office?.name || '').trim())
		setRecordLoaded(true)
		setError('')
		return filled
	}

	const setCapacity = useCallback(
		(side) => {
			const role = side === 'tenant' ? 'tenant' : 'landlord'
			setApplicantLandlordOrTenant(role)
			setSignedBy(role)
			if (role === 'tenant') {
				setApplicantName(tenantName || profile.name)
				setApplicantResidentPlace(tenantAddress || profile.address)
			} else {
				setApplicantName(landlordName || profile.name)
				setApplicantResidentPlace(landlordAddress || profile.address)
			}
		},
		[landlordAddress, landlordName, profile.address, profile.name, tenantAddress, tenantName]
	)

	const formTitle = serviceMeta?.formName || 'Form I-B'
	const formBadge = serviceMeta?.groupTitle || 'Rent Authority'
	const formLead = serviceMeta
		? `${serviceMeta.matter || 'Appointment of valuer'}${serviceMeta.rule ? ` (${serviceMeta.rule})` : ''}`
		: 'Appointment of valuer (Rule 5(4))'

	return (
		<div className="mx-auto w-full space-y-4">
			{error ? (
				<div
					className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
					role="alert"
				>
					{error}
				</div>
			) : null}

			<form className="flex flex-col gap-4" onSubmit={requestPreview}>
				{!recordLoaded ? (
					<>
						<FormTopBar onBack={onBack} />
						<ServiceFormReadyGate
							badge={formBadge}
							title={formTitle}
							description={formLead}
							knowBefore={[
								'Father / mother / spouse name for the relation field',
								'A scanned signature for the declaration',
							]}
						>
							<TenancyUinLookup
								variant="modern"
								align="center"
								value={tenancyUIN}
								onChange={handleUinChange}
								onLoaded={handleTenancyLoaded}
								label="Tenancy UIN"
								hint="Only a named landlord or tenant on that record can load it."
								actionLabel="Load record"
								loadingLabel="Loading…"
								successMessage={() => 'Tenancy record loaded.'}
								errorFallback="Could not load the tenancy record for this UIN."
							/>
						</ServiceFormReadyGate>
					</>
				) : (
					<>
						<FormTopBar onBack={onBack} disabled={submitting} />
						<FormCard
							title={formTitle}
							description={formLead}
							badge={formBadge}
							uin={tenancyUIN}
							onChangeUin={() => {
								clearTenancyRecord()
								setTenancyUIN('')
							}}
						>
							<FormSection
								step={1}
								tone="record"
								title="Applicant details"
								description="First choose Applying as. Then review the tenancy record from your UIN and complete premises and relation details."
							>
								<ApplyingAsToggle
									value={applicantLandlordOrTenant}
									onChange={setCapacity}
									name="capacity_ib"
								/>
								<UinPrefillNotice />
								<div className="grid gap-3 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-3">
									<ReadOnlyField label="Landlord name" value={landlordName} icon={User} fromUin />
									<ReadOnlyField label="Tenant name" value={tenantName} icon={User} fromUin />
									<ReadOnlyField
										label="Landlord address"
										value={landlordAddress}
										icon={MapPin}
										multiline
										fromUin
									/>
									<ReadOnlyField
										label="Tenant address"
										value={tenantAddress}
										icon={MapPin}
										multiline
										fromUin
									/>
									<ReadOnlyField label="District" value={district} icon={MapPin} fromUin />
									<ReadOnlyField
										label="Rent Authority office"
										value={tenancyOffice}
										icon={Building2}
										empty="Not on record"
										fromUin
									/>
								</div>

								<Field
									label="Premises situated at"
									required
									hint="Pre-filled from the tenancy record — edit if needed"
								>
									<InputShell icon={Building2} className={textareaShellClass}>
										<textarea
											value={premisesSituatedAddress}
											onChange={(e) => setPremisesSituatedAddress(e.target.value)}
											required
											rows={2}
											placeholder="Full premises address"
											className="h-full w-full resize-y border-0 bg-transparent px-3.5 py-2.5 text-[15px] text-[#151717] outline-none placeholder:text-slate-400"
										/>
									</InputShell>
								</Field>

								<div className="form-ib-relation-row">
										<Field
											label="Applicant's father/mother/spouse name"
											required
											hint="Person you are Son, Daughter or Spouse of"
										>
											<InputShell icon={User} className={`${inputShellClass} form-iv-relative-name-input`}>
												<input
													type="text"
													value={applicantRelationTargetName}
													onChange={(e) => setApplicantRelationTargetName(e.target.value)}
													required
													placeholder="Full name"
													className={inputClass}
												/>
											</InputShell>
										</Field>

										<fieldset className="form-iv-field form-ib-relation-row__relation m-0 flex min-w-0 flex-col gap-1.5 border-0 p-0">
											<legend className="form-iv-applicant-extras__legend">
												<span className="form-iv-applicant-extras__legend-title">
													Relation
													<span className="text-red-500" aria-hidden>
														{' '}
														*
													</span>
													<span className="sr-only">(required)</span>
												</span>
												<span className="form-iv-applicant-extras__legend-hint">
													Son, Daughter or Spouse of the person named beside
												</span>
											</legend>
											<div className="form-iv-relation-field__options" role="radiogroup" aria-label="Relation">
												{FORM_IB_RELATIONS.map((relation) => {
													const selected = applicantRelationType === relation
													return (
														<label
															key={relation}
															className={`form-iv-relation-option${selected ? ' is-selected' : ''}`}
														>
															<input
																type="radio"
																name="relation_ib"
																value={relation}
																checked={selected}
																onChange={() => setApplicantRelationType(relation)}
																className="sr-only"
															/>
															<span>{relation}</span>
														</label>
													)
												})}
											</div>
										</fieldset>
								</div>
							</FormSection>

							<FormSection
								step={2}
								tone="signature"
								title="Declaration and signature"
								description="Accept the undertaking and upload your signature to complete the filing."
							>
								<div className="flex flex-col gap-1.5">
									<div className="flex flex-row flex-wrap items-baseline gap-x-1.5 text-[14px] font-semibold text-[#151717]">
										<span>Undertaking</span>
										<span className="text-red-500">*</span>
									</div>
									<label
										className={`sf-undertaking-box${feeUndertakingAccepted ? ' is-checked' : ''}`}
									>
										<input
											type="checkbox"
											checked={feeUndertakingAccepted}
											onChange={(e) => setFeeUndertakingAccepted(e.target.checked)}
											required
											className="sr-only"
										/>
										<FormTick checked={feeUndertakingAccepted} />
										<span className="min-w-0 text-sm leading-relaxed text-slate-800">
											{FORM_IB_UNDERTAKING_TEXT}
										</span>
									</label>
								</div>

								<Field
									label="Signature image"
									required
									hint="Upload a clear scan or photo of your signature. Format: JPG, JPEG or PNG. Recommended: at least 300 × 100 px (or higher), max file size 2 MB."
								>
									<div className="form-i-field form-i-upload-field w-full max-w-md">
										<span className="form-i-icon-gutter" aria-hidden>
											<Upload size={18} strokeWidth={2} />
										</span>
										<label className="form-i-upload-body !m-0 !flex !flex-row !gap-3 min-w-0 flex-1 cursor-pointer items-center px-3.5">
											<span className="sf-upload-btn">
												{signatureImage ? 'Change image' : 'Upload image'}
											</span>
											<span
												className={`sf-upload-filename${
													signatureImage ? ' is-selected' : ''
												}`}
											>
												{signatureImage?.name || 'No image chosen'}
											</span>
											<input
												type="file"
												accept=".jpg,.jpeg,.png,image/jpeg,image/png"
												required={!signatureImage}
												className="sr-only"
												onChange={(e) => {
													const file = e.target.files?.[0] || null
													if (file && file.size > 2 * 1024 * 1024) {
														reportError('Signature image must be 2 MB or smaller.')
														e.target.value = ''
														setSignatureImage(null)
														return
													}
													setError('')
													setSignatureImage(file)
												}}
											/>
										</label>
									</div>
									{signatureImage && signaturePreviewUrl ? (
										<div className="form-iv-signature-preview">
											<img
												src={signaturePreviewUrl}
												alt="Uploaded signature preview"
												className="form-iv-signature-preview__img"
											/>
											<button
												type="button"
												onClick={clearSignatureImage}
												className="form-iv-signature-preview__remove"
											>
												Remove
											</button>
										</div>
									) : null}
								</Field>
							</FormSection>
						</FormCard>

						<div className="flex flex-wrap items-center justify-center gap-3 pt-2">
							<button type="submit" disabled={submitting} className={btnPrimary}>
								{submitting ? 'Submitting…' : 'Review & submit'}
							</button>
						</div>
					</>
				)}
			</form>

			<ServiceFormPreviewModal
				open={previewOpen}
				title="FORM-IB"
				subtitle="Application for appointment of Valuer for fixation or revision of rent and other charges — Rule 5(4)"
				variant="legal"
				legalDocument={
					<FormIBLegalDocument
						tenancyUIN={tenancyUIN}
						applicantName={applicantName}
						applicantRelationType={applicantRelationType}
						applicantRelationTargetName={applicantRelationTargetName}
						applicantResidentPlace={applicantResidentPlace}
						applicantLandlordOrTenant={applicantLandlordOrTenant}
						premisesSituatedAddress={premisesSituatedAddress}
						district={district}
						signatureName={signatureNamePreview}
						signatureImage={signatureImage}
						authorityLine1={authorityLine1}
						authorityLine2={authorityLine2}
					/>
				}
				onClose={closePreview}
				onConfirm={confirmSubmit}
				confirming={submitting}
				confirmLabel="Submit"
			/>
		</div>
	)
}
