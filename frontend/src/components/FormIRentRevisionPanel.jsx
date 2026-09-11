import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Building2, CheckCircle2, FileText, IdCard, IndianRupee, MapPin, Upload, User } from 'lucide-react'
import api, { csrf } from '../api'
import TenancyUinLookup from './forms/TenancyUinLookup'
import ServiceFormPreviewModal from './forms/ServiceFormPreviewModal'
import FormILegalDocument from './forms/FormILegalDocument'
import { useServiceFormPreview } from '../hooks/useServiceFormPreview'
import { profileDefaults } from '../utils/profileAutofill'
import { APPLICATION_TYPES } from '../constants/application'
import { completeServiceFormSubmit, getServiceFormSuccessMessage } from '../utils/serviceFormSubmit'
import { applyTenancyAutofill, formatRentAuthorityAddressee } from '../utils/tenancyUinAutofill'
import { useToast } from '../context/ToastContext'

const parseMoney = (value) => {
	const raw = String(value ?? '')
	const cleaned = raw.replace(/,/g, '').replace(/[^0-9.]/g, '')
	const num = Number(cleaned)
	return Number.isFinite(num) ? num : 0
}

/** Digits and at most one decimal point (max 2 decimal places). */
const sanitizeMoneyInput = (raw) => {
	let next = String(raw ?? '').replace(/[^\d.]/g, '')
	const firstDot = next.indexOf('.')
	if (firstDot !== -1) {
		next =
			next.slice(0, firstDot + 1) + next.slice(firstDot + 1).replace(/\./g, '')
		const [whole, frac = ''] = next.split('.')
		next = `${whole}.${frac.slice(0, 2)}`
	}
	return next
}

/** Soft bordered field shell — icon gutter + divider + white input. */
const inputShellClass =
	'form-i-field flex h-[50px] w-full items-stretch overflow-hidden rounded-[10px] border border-[#cbd5e1] bg-white transition-[border-color] duration-200 ease-in-out focus-within:border-[#6d28d9]'

const inputClass =
	'form-i-control h-full w-full min-w-0 flex-1 border-0 bg-transparent px-3.5 text-[15px] font-medium text-[#151717] outline-none placeholder:font-normal placeholder:text-slate-400'

const textareaShellClass =
	'form-i-field flex min-h-[120px] w-full overflow-hidden rounded-[10px] border border-[#cbd5e1] bg-white px-3.5 py-3 transition-[border-color] duration-200 ease-in-out focus-within:border-[#6d28d9]'

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
	record:
		'rounded-2xl border border-[#cbd5e1] bg-[#f8fafc] px-5 py-5 sm:px-6',
	application:
		'rounded-2xl border border-[#cbd5e1] bg-[#f8fafc] px-5 py-5 sm:px-6',
	signature:
		'rounded-2xl border border-[#cbd5e1] bg-[#f8fafc] px-5 py-5 sm:px-6',
	default: '',
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
						{description ? (
							<p className={descriptionClassName}>{description}</p>
						) : null}
					</div>
				</div>
			</div>
			<div className="flex flex-col gap-5">{children}</div>
		</div>
	)
}

function Field({ label, hint, optional = false, required = false, children }) {
	return (
		<div className="flex flex-col gap-2">
			{/* Use div — global App.css `label { display:grid }` stacks the red * onto the next row */}
			<div className="flex flex-row flex-wrap items-center gap-x-1.5 gap-y-0 text-[15px] font-semibold text-[#151717]">
				<span>{label}</span>
				{required ? <span className="text-red-500">*</span> : null}
				{optional ? <span className="text-xs font-medium text-slate-400">Optional</span> : null}
			</div>
			{hint ? <p className="m-0 text-sm text-slate-500">{hint}</p> : null}
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

/** Same shape as editable inputs; record values styled distinctly from editable fields. */
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
			<span className="text-[13px] font-semibold uppercase tracking-wide text-slate-500">
				{label}
			</span>
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

export default function FormIRentRevisionPanel({ onBack, serviceMeta, user }) {
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
	const [presentMonthlyRent, setPresentMonthlyRent] = useState('')
	const [proposedMonthlyRent, setProposedMonthlyRent] = useState('')

	const [reasonForRentRevision, setReasonForRentRevision] = useState('')

	const [signedBy, setSignedBy] = useState(filesAsTenant ? 'tenant' : 'landlord')
	const [signatureImage, setSignatureImage] = useState(null)
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
		setPresentMonthlyRent('')
		setSignatureImage(null)
		setAuthorityLine1('')
		setAuthorityLine2('')
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
			reportError(msg)
		},
	})

	const submit = useCallback(async () => {
		setError('')
		if (!recordLoaded) {
			reportError('Enter your Tenancy UIN and load the tenancy record before submitting Form I.')
			return false
		}
		if (!landlordName.trim() || !tenantName.trim() || !landlordAddress.trim() || !tenantAddress.trim()) {
			reportError('Tenancy party details are incomplete. Load the UIN again.')
			return false
		}
		if (!String(presentMonthlyRent).trim()) {
			reportError('Present monthly rent is missing from the tenancy record. Load the UIN again.')
			return false
		}
		const premisesText =
			rentedPremisesDescription.trim() || 'Not stated on the tenancy record'
		const signatureName = (signedBy === 'tenant' ? tenantName : landlordName).trim()
		if (!signatureName) {
			reportError('The name for the selected party is missing from the tenancy record.')
			return false
		}
		if (!signatureImage) {
			reportError('Upload a signature image to continue.')
			return false
		}
		if (!String(proposedMonthlyRent).trim() || parseMoney(proposedMonthlyRent) <= 0) {
			reportError('Enter a valid proposed monthly rent (numbers only).')
			return false
		}
		if (!reasonForRentRevision.trim()) {
			reportError('Enter the reason for fixation or revision of rent.')
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
			formData.append('present_monthly_rent', String(parseMoney(presentMonthlyRent)))
			formData.append('proposed_monthly_rent', String(parseMoney(proposedMonthlyRent)))
			formData.append('reason_for_rent_revision', reasonForRentRevision.trim())

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
		landlordAddress,
		landlordName,
		managerAddress,
		managerName,
		mutation,
		presentMonthlyRent,
		proposedMonthlyRent,
		reasonForRentRevision,
		rentedPremisesDescription,
		reportError,
		signatureImage,
		signedBy,
		tenancyAgreementDocumentNo,
		tenancyUIN,
		tenantAddress,
		tenantName,
		recordLoaded,
	])

	const signatureNamePreview = (signedBy === 'tenant' ? tenantName : landlordName).trim()

	const { previewOpen, requestPreview, closePreview, confirmSubmit } = useServiceFormPreview(submit)

	const handleTenancyLoaded = (tenancy) => {
		const filled = applyTenancyAutofill(APPLICATION_TYPES.RENT_REVISION, tenancy, user, {
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
		const authority = formatRentAuthorityAddressee(tenancy)
		setAuthorityLine1(authority.line1)
		setAuthorityLine2(authority.line2)
		setRecordLoaded(true)
		setError('')
		return filled
	}

	const presentRentDisplay = String(presentMonthlyRent || '').trim()
	const formTitle = serviceMeta?.label || 'Form I — Revision or fixation of rent'
	const formBadge = serviceMeta?.groupTitle || 'Rent Authority'
	const formLead = serviceMeta
		? `${serviceMeta.matter || 'Revision or fixation of rent'}${serviceMeta.rule ? ` (${serviceMeta.rule})` : ''}`
		: 'Revision or fixation of rent (Rule 5(1))'

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
								description="Enter the Unique Identification Number issued by the Rent Authority. Form I can be filed only after the tenancy record is loaded."
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
								title="Particulars of the tenancy"
								badge="From UIN · read-only"
								description="These details are taken from the UIN ID. They are for confirmation only and cannot be changed on this form."
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
									{/* Same-height rows: landlord left, tenant right */}
									<ReadOnlyField label="Landlord name" value={landlordName} icon={User} />
									<ReadOnlyField label="Tenant name" value={tenantName} icon={User} />
									<ReadOnlyField label="Landlord address" value={landlordAddress} icon={MapPin} />
									<ReadOnlyField label="Tenant address" value={tenantAddress} icon={MapPin} />
									<ReadOnlyField
										label="Property manager name (if any)"
										value={managerName}
										empty="None on record"
										icon={User}
									/>
									<ReadOnlyField
										label="Property manager address (if any)"
										value={managerAddress}
										empty="None on record"
										icon={MapPin}
									/>
									<div className="sm:col-span-2">
										<ReadOnlyField
											label="Present monthly rent"
											value={presentRentDisplay}
											icon={IndianRupee}
										/>
									</div>
									<div className="sm:col-span-2">
										<ReadOnlyField
											label="Description of rented premises"
											value={rentedPremisesDescription}
											icon={Building2}
											empty="Not on record"
											multiline
										/>
									</div>
								</div>
							</FormSection>

							<FormSection
								step={2}
								tone="application"
								title="Particulars of the application"
								description="State the rent you seek, whether you are applying as landlord or tenant, and upload your signature."
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
												signedBy === 'landlord'
													? 'border-[#6d28d9] bg-[#ede9fe]'
													: 'border-[#cbd5e1] bg-white hover:border-[#c4b5fd]'
											}`}
										>
											<input
												type="radio"
												name="signed_by"
												value="landlord"
												checked={signedBy === 'landlord'}
												onChange={() => setSignedBy('landlord')}
												className="h-4 w-4 accent-[#6d28d9]"
											/>
											<span className="text-sm font-semibold text-[#151717]">Landlord</span>
										</label>
										<label
											className={`!m-0 !flex !h-[46px] !flex-row cursor-pointer items-center gap-2.5 rounded-[10px] border px-3.5 transition ${
												signedBy === 'tenant'
													? 'border-[#6d28d9] bg-[#ede9fe]'
													: 'border-[#cbd5e1] bg-white hover:border-[#c4b5fd]'
											}`}
										>
											<input
												type="radio"
												name="signed_by"
												value="tenant"
												checked={signedBy === 'tenant'}
												onChange={() => setSignedBy('tenant')}
												className="h-4 w-4 accent-[#6d28d9]"
											/>
											<span className="text-sm font-semibold text-[#151717]">Tenant</span>
										</label>
									</div>
								</div>

								<Field
									label="Document No. of tenancy agreement registered before the Sub-Registrar (if any)"
									optional
								>
									<InputShell icon={FileText}>
										<input
											type="text"
											value={tenancyAgreementDocumentNo}
											onChange={(e) => setTenancyAgreementDocumentNo(e.target.value)}
											placeholder="Leave blank if none"
											className={inputClass}
										/>
									</InputShell>
								</Field>
								<Field label="Proposed monthly rent" required>
									<InputShell icon={IndianRupee}>
										<input
											type="text"
											inputMode="decimal"
											pattern="[0-9]*[.]?[0-9]{0,2}"
											value={proposedMonthlyRent}
											onChange={(e) => setProposedMonthlyRent(sanitizeMoneyInput(e.target.value))}
											onPaste={(e) => {
												e.preventDefault()
												const pasted = e.clipboardData.getData('text')
												setProposedMonthlyRent(sanitizeMoneyInput(pasted))
											}}
											required
											placeholder="Numbers only, e.g. 27000"
											className={inputClass}
											autoComplete="off"
										/>
									</InputShell>
								</Field>
								<Field label="Reason for fixation or revision of rent" required>
									<InputShell className={textareaShellClass}>
										<textarea
											value={reasonForRentRevision}
											onChange={(e) => setReasonForRentRevision(e.target.value)}
											required
											rows={4}
											placeholder="Briefly state the reason"
											className="h-full w-full resize-y border-0 bg-transparent text-[15px] text-[#151717] outline-none placeholder:text-slate-400"
										/>
									</InputShell>
								</Field>

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
														setError('Signature image must be 2 MB or smaller.')
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
				title="FORM-I"
				subtitle="Application for revision or fixation of rent — Rule 5(1)"
				variant="legal"
				legalDocument={
					<FormILegalDocument
						tenancyUIN={tenancyUIN}
						tenancyAgreementDocumentNo={tenancyAgreementDocumentNo}
						landlordName={landlordName}
						landlordAddress={landlordAddress}
						tenantName={tenantName}
						tenantAddress={tenantAddress}
						managerName={managerName}
						managerAddress={managerAddress}
						rentedPremisesDescription={rentedPremisesDescription}
						presentMonthlyRent={presentMonthlyRent}
						proposedMonthlyRent={proposedMonthlyRent}
						reasonForRentRevision={reasonForRentRevision}
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
