import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Building2, Check, CheckCircle2, IdCard, MapPin, Upload, User } from 'lucide-react'
import api, { csrf } from '../api'
import TenancyUinLookup from './forms/TenancyUinLookup'
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

function FormCard({ title, description, badge, children }) {
	return (
		<section className="overflow-hidden rounded-[20px] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
			<div className="border-b border-[#ddd6fe] bg-[#ede9fe] px-[30px] py-5 text-center">
				{badge ? (
					<span className="mb-2 inline-flex rounded-md bg-white/70 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-[#6d28d9]">
						{badge}
					</span>
				) : null}
				<h1 className="m-0 text-[1.5rem] font-semibold leading-snug text-[#6d28d9]">{title}</h1>
				{description ? (
					<p className="mx-auto mt-1.5 mb-0 max-w-2xl text-sm leading-relaxed text-[#6d5a9c]">{description}</p>
				) : null}
			</div>
			<div className="flex flex-col gap-4 p-[30px]">{children}</div>
		</section>
	)
}

const sectionToneClass = {
	record: 'rounded-2xl border border-[#cbd5e1] bg-[#f8fafc] px-5 py-5 sm:px-6',
	application: 'rounded-2xl border border-[#cbd5e1] bg-[#f8fafc] px-5 py-5 sm:px-6',
	signature: 'rounded-2xl border border-[#cbd5e1] bg-[#f8fafc] px-5 py-5 sm:px-6',
	default: '',
}

function FormTick({ checked }) {
	return (
		<span
			className={`mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border-[1.5px] transition ${
				checked
					? 'border-[#6d28d9] bg-[#6d28d9] text-white'
					: 'border-slate-400 bg-white text-transparent'
			}`}
			aria-hidden
		>
			{checked ? <Check size={11} strokeWidth={3} /> : null}
		</span>
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
						<span
							className="inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-[#6d28d9] px-2 text-sm font-semibold text-white"
							aria-hidden
						>
							{step}
						</span>
					) : null}
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-2">
							<h3 className="m-0 text-base font-semibold text-[#6d28d9]">
								{step ? (
									<span className="sr-only">
										Section {step}.{' '}
									</span>
								) : null}
								{title}
							</h3>
							{badge ? (
								<span className="inline-flex items-center rounded-md border border-[#ddd6fe] bg-[#ede9fe] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#6d28d9]">
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
		<div className="flex min-w-0 flex-col gap-1.5">
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
}) {
	const text = String(value ?? '').trim()
	const display = text || empty
	const hasValue = Boolean(text)
	const isUin = variant === 'uin'

	return (
		<div className="flex min-w-0 flex-col gap-2">
			<span className="text-[13px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>
			<div
				className={`form-i-field form-i-field--readonly ${multiline ? 'form-i-field--multiline' : ''} ${
					action ? 'form-i-field--with-action' : ''
				}`}
			>
				{Icon ? (
					<span className="form-i-icon-gutter" aria-hidden>
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

const btnPrimary =
	'inline-flex h-[50px] items-center justify-center rounded-[10px] border-0 bg-[#6d28d9] px-5 text-[15px] font-medium text-white transition hover:bg-[#5b21b6] disabled:cursor-not-allowed disabled:opacity-60'
const btnSecondary =
	'inline-flex h-[50px] items-center justify-center rounded-[10px] border border-[#ededef] bg-white px-5 text-[15px] font-medium text-[#151717] transition hover:border-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-60'

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

	const formTitle = serviceMeta?.label || 'Form I-B — Appointment of valuer'
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
						<FormCard title={formTitle} description={formLead} badge={formBadge}>
							<FormSection
								step={1}
								tone="application"
								title="Identify the tenancy"
								description="Enter the Unique Identification Number issued by the Rent Authority. Form I-B can be filed only after the tenancy record is loaded."
							>
								<TenancyUinLookup
									variant="modern"
									align="center"
									value={tenancyUIN}
									onChange={handleUinChange}
									onLoaded={handleTenancyLoaded}
									label="Tenancy UIN"
									hint="Unique Identification Number issued by the Rent Authority. Only a landlord or tenant named on that tenancy may load the record."
									actionLabel="Load tenancy record"
									loadingLabel="Loading…"
									successMessage={() => 'Tenancy record loaded.'}
									errorFallback="Could not load the tenancy record for this UIN."
								/>
							</FormSection>
						</FormCard>

						<div className="flex justify-start pt-1">
							<button type="button" onClick={onBack} className={btnSecondary}>
								Back
							</button>
						</div>
					</>
				) : (
					<>
						<FormCard title={formTitle} description={formLead} badge={formBadge}>
							<FormSection
								step={1}
								tone="record"
								title="Particulars from the tenancy"
								badge="From UIN · read-only"
								description="Applicant name, residence and district come from the UIN. They update if you change Applying as below."
								descriptionClassName="mt-1.5 mb-0 text-sm font-medium leading-relaxed text-amber-700"
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
								<div className="grid gap-5 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-5">
									<ReadOnlyField label="Landlord name" value={landlordName} icon={User} />
									<ReadOnlyField label="Tenant name" value={tenantName} icon={User} />
									<ReadOnlyField
										label="Landlord address"
										value={landlordAddress}
										icon={MapPin}
										multiline
									/>
									<ReadOnlyField
										label="Tenant address"
										value={tenantAddress}
										icon={MapPin}
										multiline
									/>
									<ReadOnlyField label="Name of the applicant" value={applicantName} icon={User} />
									<ReadOnlyField
										label="Resident of"
										value={applicantResidentPlace}
										icon={MapPin}
										multiline
									/>
									<div className="sm:col-span-2">
										<ReadOnlyField label="District" value={district} icon={MapPin} />
									</div>
								</div>
							</FormSection>

							<FormSection
								step={2}
								tone="application"
								title="Particulars of the application"
								description="Choose whether you are applying as landlord or tenant, complete the relation details, then accept the undertaking and upload your signature."
							>
								<div className="flex flex-col gap-1.5">
									<div className="flex flex-row flex-wrap items-baseline gap-x-1.5 text-[14px] font-semibold text-[#151717]">
										<span>Applying as</span>
										<span className="text-red-500">*</span>
										<span className="text-[12px] font-medium text-slate-500">
											Landlord or tenant of the premises
										</span>
									</div>
									<div className="grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="Applying as">
										<label
											className={`!m-0 !flex !h-[46px] !flex-row cursor-pointer items-center gap-2.5 rounded-[10px] border px-3.5 transition ${
												applicantLandlordOrTenant === 'landlord'
													? 'border-[#6d28d9] bg-[#ede9fe]'
													: 'border-[#cbd5e1] bg-white hover:border-[#c4b5fd]'
											}`}
										>
											<input
												type="radio"
												name="capacity_ib"
												value="landlord"
												checked={applicantLandlordOrTenant === 'landlord'}
												onChange={() => setCapacity('landlord')}
												className="h-4 w-4 accent-[#6d28d9]"
											/>
											<span className="text-sm font-semibold text-[#151717]">Landlord</span>
										</label>
										<label
											className={`!m-0 !flex !h-[46px] !flex-row cursor-pointer items-center gap-2.5 rounded-[10px] border px-3.5 transition ${
												applicantLandlordOrTenant === 'tenant'
													? 'border-[#6d28d9] bg-[#ede9fe]'
													: 'border-[#cbd5e1] bg-white hover:border-[#c4b5fd]'
											}`}
										>
											<input
												type="radio"
												name="capacity_ib"
												value="tenant"
												checked={applicantLandlordOrTenant === 'tenant'}
												onChange={() => setCapacity('tenant')}
												className="h-4 w-4 accent-[#6d28d9]"
											/>
											<span className="text-sm font-semibold text-[#151717]">Tenant</span>
										</label>
									</div>
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

								<div className="flex flex-col gap-5">
									<Field
										label="Applicants father/mother/spouse name"
										required
										hint="Person you are Son, Daughter or Spouse of"
									>
										<InputShell icon={User}>
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

									<div className="flex flex-col gap-1.5">
										<div className="flex flex-row flex-wrap items-baseline gap-x-1.5 text-[14px] font-semibold text-[#151717]">
											<span>Relation</span>
											<span className="text-red-500">*</span>
											<span className="text-[12px] font-medium text-slate-500">
												Son, Daughter or Spouse of the person named above
											</span>
										</div>
										<div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Relation">
											{FORM_IB_RELATIONS.map((relation) => {
												const selected = applicantRelationType === relation
												return (
													<label
														key={relation}
														className={`!m-0 !flex !h-[46px] !flex-row cursor-pointer items-center justify-center rounded-[10px] border px-2 transition ${
															selected
																? 'border-[#6d28d9] bg-[#ede9fe]'
																: 'border-[#cbd5e1] bg-white hover:border-[#c4b5fd]'
														}`}
													>
														<input
															type="radio"
															name="relation_ib"
															value={relation}
															checked={selected}
															onChange={() => setApplicantRelationType(relation)}
															className="sr-only"
														/>
														<span
															className={`text-sm font-semibold ${
																selected ? 'text-[#6d28d9]' : 'text-[#151717]'
															}`}
														>
															{relation}
														</span>
													</label>
												)
											})}
										</div>
									</div>
								</div>

								<div className="flex flex-col gap-1.5">
									<div className="flex flex-row flex-wrap items-baseline gap-x-1.5 text-[14px] font-semibold text-[#151717]">
										<span>Undertaking</span>
										<span className="text-red-500">*</span>
									</div>
									<label
										className={`!m-0 !flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 transition ${
											feeUndertakingAccepted
												? 'border-[#c4b5fd] bg-white'
												: 'border-slate-200 bg-white hover:border-[#c4b5fd]'
										}`}
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
									<div className="form-i-field form-i-upload-field">
										<span className="form-i-icon-gutter" aria-hidden>
											<Upload size={18} strokeWidth={2} />
										</span>
										<label className="form-i-upload-body !m-0 !flex !flex-row !gap-3 min-w-0 flex-1 cursor-pointer items-center px-3.5">
											<span className="inline-flex shrink-0 items-center rounded-lg bg-[#ede9fe] px-3 py-1.5 text-sm font-semibold text-[#6d28d9]">
												{signatureImage ? 'Change file' : 'Choose file'}
											</span>
											<span
												className={`min-w-0 truncate text-sm ${
													signatureImage ? 'font-medium text-green-700' : 'text-slate-500'
												}`}
											>
												{signatureImage?.name || 'No file chosen'}
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
										<div className="mt-3 overflow-hidden rounded-[10px] border border-green-200 bg-green-50">
											<div className="flex flex-wrap items-center justify-between gap-2 border-b border-green-200 px-4 py-2.5">
												<p className="m-0 inline-flex items-center gap-2 text-sm font-semibold text-green-700">
													<CheckCircle2 size={18} strokeWidth={2} aria-hidden />
													Signature image uploaded
												</p>
												<button
													type="button"
													onClick={clearSignatureImage}
													className="text-sm font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
												>
													Remove
												</button>
											</div>
											<div className="flex items-center justify-center bg-white px-4 py-5">
												<img
													src={signaturePreviewUrl}
													alt="Uploaded signature preview"
													className="max-h-32 w-auto max-w-full object-contain"
												/>
											</div>
											<p className="m-0 truncate border-t border-green-100 bg-green-50/80 px-4 py-2 text-xs text-slate-500">
												{signatureImage.name}
												{signatureImage.size
													? ` · ${(signatureImage.size / 1024).toFixed(0)} KB`
													: ''}
											</p>
										</div>
									) : null}
								</Field>
							</FormSection>
						</FormCard>

						<div className="flex flex-wrap items-center justify-between gap-3 pt-1">
							<button type="button" onClick={onBack} disabled={submitting} className={btnSecondary}>
								Back
							</button>
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
