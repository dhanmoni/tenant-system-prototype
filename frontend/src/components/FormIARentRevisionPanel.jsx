import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Building2, CircleDollarSign, FileText, IdCard, MapPin, Upload, User } from 'lucide-react'
import api, { csrf } from '../api'
import TenancyUinLookup from './forms/TenancyUinLookup'
import UinPrefillNotice from './forms/UinPrefillNotice'
import ApplyingAsToggle from './forms/ApplyingAsToggle'
import ServiceFormReadyGate from './forms/ServiceFormReadyGate'
import ServiceFormPreviewModal from './forms/ServiceFormPreviewModal'
import FormIALegalDocument from './forms/FormIALegalDocument'
import { useServiceFormPreview } from '../hooks/useServiceFormPreview'
import { profileDefaults } from '../utils/profileAutofill'
import { APPLICATION_TYPES } from '../constants/application'
import { completeServiceFormSubmit, getServiceFormSuccessMessage } from '../utils/serviceFormSubmit'
import { applyTenancyAutofill, formatRentAuthorityAddressee } from '../utils/tenancyUinAutofill'
import { useToast } from '../context/ToastContext'

const inputShellClass =
	'form-i-field flex h-[50px] w-full items-stretch overflow-hidden rounded-[10px] border border-[#cbd5e1] bg-white transition-[border-color] duration-200 ease-in-out focus-within:border-[#64748b]'

const inputClass =
	'form-i-control h-full w-full min-w-0 flex-1 border-0 bg-transparent px-3.5 text-[15px] font-medium text-[#151717] outline-none placeholder:font-normal placeholder:text-slate-400'

const textareaShellClass =
	'form-i-field flex min-h-[120px] w-full overflow-hidden rounded-[10px] border border-[#cbd5e1] bg-white px-3.5 py-3 transition-[border-color] duration-200 ease-in-out focus-within:border-[#64748b]'

function FormCard({ title, description, badge, children }) {
	return (
		<section className="sf-form-card overflow-hidden sf-form-card rounded-[20px] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
			<div className="sf-form-card__header">
				{badge ? <span className="sf-form-card__badge">{badge}</span> : null}
				<h1 className="sf-form-card__title">{title}</h1>
				{description ? <p className="sf-form-card__lead">{description}</p> : null}
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

function Field({ label, hint, optional = false, required = false, para = null, children }) {
	const isDetail = para != null
	return (
		<div
			className={
				isDetail
					? 'form-iv-field form-iv-detail-item flex min-w-0 flex-col'
					: 'form-iv-field flex min-w-0 flex-col gap-1.5'
			}
		>
			<div className={`flex min-w-0 ${hint ? 'flex-col gap-1' : ''}`}>
				<div className="flex flex-row flex-wrap items-center gap-x-2 gap-y-1 text-[14px] font-semibold text-[#151717]">
					{para != null ? (
						<span
							className="sf-para-badge"
							aria-hidden
						>
							{para}
						</span>
					) : null}
					<span className={isDetail ? 'text-[14px] font-semibold text-slate-900' : undefined}>
						{label}
					</span>
					{required ? <span className="text-red-500">*</span> : null}
				</div>
				{hint ? (
					<p
						className={`m-0 text-[12px] leading-relaxed text-slate-500${isDetail ? ' sm:pl-8' : ''}`}
					>
						{hint}
					</p>
				) : null}
			</div>
			<div className={isDetail ? 'min-w-0 sm:pl-8' : undefined}>{children}</div>
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
					<span className="form-iv-from-uin-tag !normal-case !text-[#16a34a]" title="Filled from the loaded tenancy UIN">
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

export default function FormIARentRevisionPanel({ onBack, serviceMeta, user }) {
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
	const [tenancyAgreementDocumentNo, setTenancyAgreementDocumentNo] = useState('')

	const profile = useMemo(() => profileDefaults(user), [user])
	const filesAsTenant = profile.side === 'TENANT'

	const [landlordName, setLandlordName] = useState(filesAsTenant ? '' : profile.name)
	const [landlordAddress, setLandlordAddress] = useState(filesAsTenant ? '' : profile.address)
	const [tenantName, setTenantName] = useState(filesAsTenant ? profile.name : '')
	const [tenantAddress, setTenantAddress] = useState(filesAsTenant ? profile.address : '')
	const [managerName, setManagerName] = useState('')
	const [managerAddress, setManagerAddress] = useState('')
	const [rentedPremisesDescription, setRentedPremisesDescription] = useState('')
	const [existingOtherChargesDetails, setExistingOtherChargesDetails] = useState('')
	const [proposedOtherChargesDetails, setProposedOtherChargesDetails] = useState('')
	const [reasonForOtherChargesRevision, setReasonForOtherChargesRevision] = useState('')

	const [signedBy, setSignedBy] = useState(filesAsTenant ? 'tenant' : 'landlord')
	const [signatureImage, setSignatureImage] = useState(null)
	const [recordLoaded, setRecordLoaded] = useState(false)
	const [authorityLine1, setAuthorityLine1] = useState('')
	const [authorityLine2, setAuthorityLine2] = useState('')
	const [tenancyDistrict, setTenancyDistrict] = useState('')
	const [tenancyOffice, setTenancyOffice] = useState('')

	const signaturePreviewUrl = useMemo(
		() => (signatureImage ? URL.createObjectURL(signatureImage) : null),
		[signatureImage]
	)

	useEffect(() => {
		return () => {
			if (signaturePreviewUrl) URL.revokeObjectURL(signaturePreviewUrl)
		}
	}, [signaturePreviewUrl])

	const clearSignatureImage = useCallback(() => {
		setSignatureImage(null)
	}, [])

	const clearTenancyRecord = useCallback(() => {
		setRecordLoaded(false)
		setLandlordName(filesAsTenant ? '' : profile.name)
		setLandlordAddress(filesAsTenant ? '' : profile.address)
		setTenantName(filesAsTenant ? profile.name : '')
		setTenantAddress(filesAsTenant ? profile.address : '')
		setManagerName('')
		setManagerAddress('')
		setRentedPremisesDescription('')
		setExistingOtherChargesDetails('')
		setSignatureImage(null)
		setAuthorityLine1('')
		setAuthorityLine2('')
		setTenancyDistrict('')
		setTenancyOffice('')
		setError('')
	}, [filesAsTenant, profile.address, profile.name])

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
			const { data } = await api.post('/api/other-charges-revision-applications', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})
			return data
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['citizen-applications'] })
			queryClient.invalidateQueries({ queryKey: ['admin-applications'] })
			completeServiceFormSubmit(
				navigate,
				getServiceFormSuccessMessage(data, 'Form I-A submitted successfully.')
			)
		},
		onError: (err) => {
			const msg =
				err?.response?.data?.message ||
				(err?.response?.data?.errors
					? Object.values(err.response.data.errors).flat().join('. ')
					: 'Failed to submit Form I-A')
			reportError(msg)
		},
	})

	const submit = useCallback(async () => {
		setError('')
		if (!recordLoaded) {
			reportError('Enter your Tenancy UIN and load the tenancy record before submitting Form I-A.')
			return false
		}
		if (!landlordName.trim() || !tenantName.trim() || !landlordAddress.trim() || !tenantAddress.trim()) {
			reportError('Tenancy party details are incomplete. Load the UIN again.')
			return false
		}
		const premisesText =
			rentedPremisesDescription.trim() || 'Not stated on the tenancy record'
		const existingChargesText =
			existingOtherChargesDetails.trim() || 'Not stated on the tenancy record'
		const signatureName = (signedBy === 'tenant' ? tenantName : landlordName).trim()
		if (!signatureName) {
			reportError('The name for the selected party is missing from the tenancy record.')
			return false
		}
		if (!signatureImage) {
			reportError('Upload a signature image to continue.')
			return false
		}
		if (!proposedOtherChargesDetails.trim()) {
			reportError('Enter the proposed other charges.')
			return false
		}
		if (!reasonForOtherChargesRevision.trim()) {
			reportError('Enter the reason for fixation or revision of other charges.')
			return false
		}
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
			formData.append('rented_premises_description', premisesText)
			formData.append('existing_other_charges_details', existingChargesText)
			formData.append('proposed_other_charges_details', proposedOtherChargesDetails.trim())
			formData.append('reason_for_other_charges_revision', reasonForOtherChargesRevision.trim())
			formData.append('signed_by', signedBy)
			formData.append('signature_name', signatureName)
			formData.append('signature_image', signatureImage)

			await mutation.mutateAsync(formData)
			return true
		} catch {
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
		mutation,
		proposedOtherChargesDetails,
		reasonForOtherChargesRevision,
		recordLoaded,
		rentedPremisesDescription,
		reportError,
		signatureImage,
		signedBy,
		tenancyAgreementDocumentNo,
		tenancyUIN,
		tenantAddress,
		tenantName,
	])

	const signatureNamePreview = (signedBy === 'tenant' ? tenantName : landlordName).trim()
	const { previewOpen, requestPreview, closePreview, confirmSubmit } = useServiceFormPreview(submit)

	const handleTenancyLoaded = (tenancy) => {
		const filled = applyTenancyAutofill(APPLICATION_TYPES.OTHER_CHARGES_REVISION, tenancy, user, {
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
		const authority = formatRentAuthorityAddressee(tenancy)
		setAuthorityLine1(authority.line1)
		setAuthorityLine2(authority.line2)
		setTenancyDistrict(String(tenancy?.district?.name || tenancy?.office?.district?.name || '').trim())
		setTenancyOffice(String(tenancy?.office?.name || '').trim())
		setRecordLoaded(true)
		setError('')
		return filled
	}

	const formTitle = serviceMeta?.label || 'Form I-A — Revision or fixation of other charges'
	const formBadge = serviceMeta?.groupTitle || 'Rent Authority'
	const formLead = serviceMeta
		? `${serviceMeta.matter || 'Revision or fixation of other charges'}${
				serviceMeta.rule ? ` (${serviceMeta.rule})` : ''
			}`
		: 'Revision or fixation of other charges (Rule 5(2))'

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
							description={serviceMeta?.rule || null}
							knowBefore={[
								'Any earlier Form I / revision reference (if any)',
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
						<FormCard title={formTitle} description={formLead} badge={formBadge}>
							<FormSection
								step={1}
								tone="record"
								title="Applicant details"
								description="First choose Applying as. Then review the tenancy record from your UIN and add the document number if any."
							>
								<ReadOnlyField
									label="UIN issued by the Rent Authority"
									value={tenancyUIN}
									icon={IdCard}
									variant="uin"
									action={
										<button
											type="button"
											className="form-i-change-uin"
											onClick={() => {
												clearTenancyRecord()
												setTenancyUIN('')
											}}
										>
											Change UIN
										</button>
									}
								/>

								<ApplyingAsToggle
									value={signedBy}
									onChange={setSignedBy}
									name="signed_by_ia"
								/>

								<UinPrefillNotice />
								<p className="sf-record-review-label">Tenancy details (from UIN) — review only</p>
								<div className="grid gap-3 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-3">
									<ReadOnlyField label="Landlord name" value={landlordName} icon={User} fromUin />
									<ReadOnlyField label="Tenant name" value={tenantName} icon={User} fromUin />
									<ReadOnlyField label="Landlord address" value={landlordAddress} icon={MapPin} fromUin />
									<ReadOnlyField label="Tenant address" value={tenantAddress} icon={MapPin} fromUin />
									<ReadOnlyField
										label="Property manager name (if any)"
										value={managerName}
										empty="None on record"
										icon={User}
										fromUin
									/>
									<ReadOnlyField
										label="Property manager address (if any)"
										value={managerAddress}
										empty="None on record"
										icon={MapPin}
										fromUin
									/>
									<ReadOnlyField
										label="District"
										value={tenancyDistrict}
										empty="Not on record"
										icon={MapPin}
										fromUin
									/>
									<ReadOnlyField
										label="Rent Authority office"
										value={tenancyOffice}
										empty="Not on record"
										icon={Building2}
										fromUin
									/>
									<div className="sm:col-span-2">
										<ReadOnlyField
											label="Description of rented premises"
											value={rentedPremisesDescription}
											empty="Not on record"
											icon={Building2}
											multiline
											fromUin
										/>
									</div>
									<div className="sm:col-span-2">
										<ReadOnlyField
											label="Existing other charges"
											value={existingOtherChargesDetails}
											empty="Not on record"
											icon={CircleDollarSign}
											multiline
											fromUin
										/>
									</div>
								</div>

								<Field
									label="Document Number"
									optional
									hint="Of the tenancy agreement registered before the Sub-Registrar (if any)"
								>
									<InputShell icon={FileText} className={`${inputShellClass} w-full max-w-[22rem]`}>
										<input
											type="text"
											value={tenancyAgreementDocumentNo}
											onChange={(e) => setTenancyAgreementDocumentNo(e.target.value)}
											placeholder="Leave blank if none"
											className={inputClass}
										/>
									</InputShell>
								</Field>
							</FormSection>

							<FormSection
								step={2}
								tone="application"
								title="Details of revision or fixation"
								description="State the other charges you seek to have fixed or revised, and the grounds for this application."
							>
								<Field
									label="Proposed other charges"
									required
									para={1}
									hint="e.g. electricity, power-backup, water, maintenance, security, extra services or equipment."
								>
									<InputShell className={textareaShellClass}>
										<textarea
											value={proposedOtherChargesDetails}
											onChange={(e) => setProposedOtherChargesDetails(e.target.value)}
											required
											rows={4}
											placeholder="Describe the proposed other charges"
											className="h-full w-full resize-y border-0 bg-transparent text-[15px] text-[#151717] outline-none placeholder:text-slate-400"
										/>
									</InputShell>
								</Field>
								<Field
									label="Reason for fixation or revision of other charges"
									required
									para={2}
								>
									<InputShell className={textareaShellClass}>
										<textarea
											value={reasonForOtherChargesRevision}
											onChange={(e) => setReasonForOtherChargesRevision(e.target.value)}
											required
											rows={4}
											placeholder="Briefly state the reason"
											className="h-full w-full resize-y border-0 bg-transparent text-[15px] text-[#151717] outline-none placeholder:text-slate-400"
										/>
									</InputShell>
								</Field>
							</FormSection>

							<FormSection
								step={3}
								tone="signature"
								title="Declaration and signature"
								description="Upload your signature to complete the filing."
							>
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
				title="FORM-IA"
				subtitle="Application for revision or fixation of other charges — Rule 5(2)"
				variant="legal"
				legalDocument={
					<FormIALegalDocument
						tenancyUIN={tenancyUIN}
						tenancyAgreementDocumentNo={tenancyAgreementDocumentNo}
						landlordName={landlordName}
						landlordAddress={landlordAddress}
						tenantName={tenantName}
						tenantAddress={tenantAddress}
						managerName={managerName}
						managerAddress={managerAddress}
						rentedPremisesDescription={
							rentedPremisesDescription.trim() || 'Not stated on the tenancy record'
						}
						existingOtherChargesDetails={
							existingOtherChargesDetails.trim() || 'Not stated on the tenancy record'
						}
						proposedOtherChargesDetails={proposedOtherChargesDetails}
						reasonForOtherChargesRevision={reasonForOtherChargesRevision}
						signatureName={signatureNamePreview}
						signatureImage={signatureImage}
						signedBy={signedBy}
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
