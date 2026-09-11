import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
	Building2,
	CheckCircle2,
	IdCard,
	Info,
	MapPin,
	Scale,
	Upload,
	User,
} from 'lucide-react'
import api, { csrf } from '../api'
import TenancyUinLookup from './forms/TenancyUinLookup'
import ServiceFormPreviewModal from './forms/ServiceFormPreviewModal'
import { useServiceFormPreview } from '../hooks/useServiceFormPreview'
import { APPLICATION_TYPES } from '../constants/application'
import DeclarationCheckbox from './forms/DeclarationCheckbox'
import PriorProceedingsField from './forms/PriorProceedingsField'
import { PRIOR_STATUS } from '../constants/priorProceedings'
import {
	DECLARATION,
	VERIFICATION,
	composeVerification,
	declarationText,
} from '../constants/declarations'
import VerificationClause from './forms/VerificationClause'
import { hasProfileDefaults, profileDefaults } from '../utils/profileAutofill'
import {
	describeBasis,
	describeGround,
	EVICTION_BASIS,
	EVICTION_BASIS_OPTIONS,
	EVICTION_GROUND_CLAUSES,
} from '../constants/evictionGrounds'
import { previewItem, previewSection, previewSections } from '../utils/serviceFormPreview'
import { completeServiceFormSubmit, getServiceFormSuccessMessage } from '../utils/serviceFormSubmit'
import { applyTenancyAutofill, getPartySides } from '../utils/tenancyUinAutofill'
import { useToast } from '../context/ToastContext'

const inputShellClass =
	'form-i-field flex h-[50px] w-full items-stretch overflow-hidden rounded-[10px] border border-[#cbd5e1] bg-white transition-[border-color] duration-200 ease-in-out focus-within:border-[#2563eb]'

const textareaShellClass =
	'form-i-field flex min-h-[120px] w-full overflow-hidden rounded-[10px] border border-[#cbd5e1] bg-white px-3.5 py-3 transition-[border-color] duration-200 ease-in-out focus-within:border-[#2563eb]'

function FormCard({ title, description, badge, children }) {
	return (
		<section className="overflow-hidden rounded-[20px] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
			<div className="border-b border-[#bfdbfe] bg-[#dbeafe] px-[30px] py-5 text-center">
				{badge ? (
					<span className="mb-2 inline-flex rounded-md bg-white/70 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-[#1d4ed8]">
						{badge}
					</span>
				) : null}
				<h1 className="m-0 text-[1.5rem] font-semibold leading-snug text-[#1e40af]">{title}</h1>
				{description ? (
					<p className="mx-auto mt-1.5 mb-0 max-w-2xl text-sm leading-relaxed text-[#64748b]">
						{description}
					</p>
				) : null}
			</div>
			<div className="flex flex-col gap-4 p-[22px] sm:p-[30px]">{children}</div>
		</section>
	)
}

const sectionToneClass = {
	record: 'rounded-2xl border border-[#cbd5e1] bg-[#f8fafc] px-4 py-4 sm:px-5 sm:py-5',
	application: 'rounded-2xl border border-[#cbd5e1] bg-[#f8fafc] px-4 py-4 sm:px-5 sm:py-5',
	signature: 'rounded-2xl border border-[#cbd5e1] bg-[#f8fafc] px-4 py-4 sm:px-5 sm:py-5',
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
			<div className="mb-4">
				<div className="flex items-start gap-3">
					{step ? (
						<span
							className="inline-flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-[#2563eb] px-2 text-sm font-semibold text-white"
							aria-hidden
						>
							{step}
						</span>
					) : null}
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-2">
							<h3 className="m-0 text-base font-semibold text-[#1e40af]">
								{step ? <span className="sr-only">Section {step}. </span> : null}
								{title}
							</h3>
							{badge ? (
								<span className="inline-flex items-center rounded-md border border-[#bfdbfe] bg-[#dbeafe] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#1e40af]">
									{badge}
								</span>
							) : null}
						</div>
						{description ? <p className={descriptionClassName}>{description}</p> : null}
					</div>
				</div>
			</div>
			<div className="flex flex-col gap-4">{children}</div>
		</div>
	)
}

function Field({
	label,
	hint,
	required = false,
	optional = false,
	para = null,
	hintInline = false,
	children,
}) {
	const isDetail = para != null
	return (
		<div
			className={
				isDetail
					? 'flex min-w-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5'
					: 'flex min-w-0 flex-col gap-2'
			}
		>
			<div className={`flex min-w-0 ${hintInline || !hint ? '' : 'flex-col gap-1'}`}>
				<div className="flex flex-row flex-wrap items-center gap-x-2 gap-y-1 text-[14px] font-semibold text-[#151717]">
					{para != null ? (
						<span
							className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-[#dbeafe] px-1.5 text-[13px] font-bold text-[#1e40af]"
							aria-hidden
						>
							{para}
						</span>
					) : null}
					<span className={isDetail ? 'text-[15px] font-semibold text-slate-900' : undefined}>
						{label}
					</span>
					{required ? <span className="text-red-500">*</span> : null}
					{optional ? (
						<span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
							Optional
						</span>
					) : null}
					{hint && hintInline ? (
						<span className="text-[12px] font-medium text-slate-500">{hint}</span>
					) : null}
				</div>
				{hint && !hintInline ? (
					<p className={`m-0 text-[12px] leading-relaxed text-slate-500${isDetail ? ' sm:pl-9' : ''}`}>
						{hint}
					</p>
				) : null}
			</div>
			<div className={isDetail ? 'sm:pl-9' : undefined}>{children}</div>
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
	'inline-flex h-[50px] items-center justify-center rounded-[10px] border-0 bg-[#2563eb] px-5 text-[15px] font-medium text-white transition hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60'
const btnSecondary =
	'inline-flex h-[50px] items-center justify-center rounded-[10px] border border-[#ededef] bg-white px-5 text-[15px] font-medium text-[#151717] transition hover:border-[#2563eb] disabled:cursor-not-allowed disabled:opacity-60'

const emptyPartyCache = {
	landlordName: '',
	landlordAddress: '',
	tenantName: '',
	tenantAddress: '',
}

export default function Form4RentCourtPossessionPanel({ onBack, serviceMeta, user }) {
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

	const [beforeRentCourt, setBeforeRentCourt] = useState('')

	const profile = useMemo(() => profileDefaults(user), [user])
	const profileSide = profile.side === 'TENANT' ? 'tenant' : 'landlord'

	const [applicantName, setApplicantName] = useState(profile.name)
	const [applicantResidentialAddress, setApplicantResidentialAddress] = useState(profile.address)

	const [tenancyUIN, setTenancyUIN] = useState('')
	const [tenantName, setTenantName] = useState('')
	const [applyingAs, setApplyingAs] = useState(profileSide)
	const [partyCache, setPartyCache] = useState(emptyPartyCache)
	const [recordLoaded, setRecordLoaded] = useState(false)

	const [statutoryBasis, setStatutoryBasis] = useState(EVICTION_BASIS.SECTION_21_2)
	const [evictionGrounds, setEvictionGrounds] = useState([])

	const [particularsOfApplication, setParticularsOfApplication] = useState('')
	const [jurisdictionAccepted, setJurisdictionAccepted] = useState(false)
	const [factsOfCase, setFactsOfCase] = useState('')
	const [groundsForRelief, setGroundsForRelief] = useState('')
	const [hasPriorProceedings, setHasPriorProceedings] = useState(null)
	const [priorProceedings, setPriorProceedings] = useState([])
	const [reliefSought, setReliefSought] = useState('')
	const [interimOrderSought, setInterimOrderSought] = useState('')
	const [enclosuresList, setEnclosuresList] = useState('')

	const [signatureImage, setSignatureImage] = useState(null)
	const [verification, setVerification] = useState({
		name: profile.name,
		relation: 'S/o.',
		relativeName: '',
		age: profile.age,
		address: profile.address,
		place: '',
		paragraphs: {},
	})

	const signatureName = applicantName.trim()

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

	const setVerificationField = useCallback((field, value) => {
		setVerification((current) => ({
			...current,
			[field]: value,
			...(field === 'name' ? { nameEdited: true } : {}),
			...(field === 'address' ? { addressEdited: true } : {}),
		}))
	}, [])

	const setParagraphAnswer = useCallback((number, answer) => {
		setVerification((current) => ({
			...current,
			paragraphs: { ...current.paragraphs, [number]: answer },
		}))
	}, [])

	useEffect(() => {
		setVerification((current) => (current.nameEdited ? current : { ...current, name: applicantName }))
	}, [applicantName])

	useEffect(() => {
		setVerification((current) =>
			current.addressEdited ? current : { ...current, address: applicantResidentialAddress }
		)
	}, [applicantResidentialAddress])

	const applyCapacityFromCache = useCallback((role, cache) => {
		const next = cache || emptyPartyCache
		// Form II always names the tenancy tenant in tenant_name; only the applicant side switches.
		setTenantName(next.tenantName || '')
		if (role === 'tenant') {
			setApplicantName(next.tenantName || profile.name)
			setApplicantResidentialAddress(next.tenantAddress || profile.address)
		} else {
			setApplicantName(next.landlordName || profile.name)
			setApplicantResidentialAddress(next.landlordAddress || profile.address)
		}
	}, [profile.address, profile.name])

	const handleApplyingAsChange = useCallback(
		(role) => {
			setApplyingAs(role)
			if (recordLoaded) applyCapacityFromCache(role, partyCache)
		},
		[applyCapacityFromCache, partyCache, recordLoaded]
	)

	const toggleGround = useCallback((clause) => {
		setEvictionGrounds((current) =>
			current.includes(clause) ? current.filter((c) => c !== clause) : [...current, clause]
		)
	}, [])

	const groundsApply = statutoryBasis === EVICTION_BASIS.SECTION_21_2

	const clearTenancyRecord = useCallback(() => {
		setRecordLoaded(false)
		setPartyCache(emptyPartyCache)
		setApplyingAs(profileSide)
		setApplicantName(profile.name)
		setApplicantResidentialAddress(profile.address)
		setTenantName('')
		setBeforeRentCourt('')
		setSignatureImage(null)
		setVerification({
			name: profile.name,
			relation: 'S/o.',
			relativeName: '',
			age: profile.age,
			address: profile.address,
			place: '',
			paragraphs: {},
		})
		setError('')
	}, [profile.address, profile.age, profile.name, profileSide])

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
			const { data } = await api.post('/api/rent-court-possession-applications', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})
			return data
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['citizen-applications'] })
			queryClient.invalidateQueries({ queryKey: ['admin-applications'] })
			completeServiceFormSubmit(
				navigate,
				getServiceFormSuccessMessage(data, 'Form II submitted successfully.')
			)
		},
		onError: (err) => {
			const msg =
				err?.response?.data?.message ||
				(err?.response?.data?.errors
					? Object.values(err.response.data.errors).flat().join('. ')
					: 'Failed to submit Form II')
			reportError(msg)
		},
	})

	const submit = useCallback(async () => {
		setError('')

		if (!recordLoaded) {
			reportError('Enter your Tenancy UIN and load the tenancy record before submitting Form II.')
			return false
		}

		if (!jurisdictionAccepted) {
			reportError('Accept the declaration at paragraph 2 before filing.')
			return false
		}

		if (hasPriorProceedings === null) {
			reportError('Answer paragraph 5 before filing.')
			return false
		}

		if (hasPriorProceedings) {
			const incomplete = priorProceedings.some(
				(entry) =>
					!entry.case_number.trim() ||
					!entry.forum.trim() ||
					(entry.status === PRIOR_STATUS.PENDING
						? !entry.pendency_details.trim()
						: !entry.decision.trim())
			)
			if (priorProceedings.length === 0 || incomplete) {
				reportError(
					'Give the case number, the court or authority, and the pendency or decision for every case disclosed at paragraph 5.'
				)
				return false
			}
		}

		if (groundsApply && evictionGrounds.length === 0) {
			reportError(
				'Select at least one ground under section 21(2). The Rent Court may order recovery of possession only on a ground listed there.'
			)
			return false
		}

		if (!signatureName) {
			reportError('Applicant name is missing from the tenancy record.')
			return false
		}

		setSubmitting(true)
		try {
			const formData = new FormData()

			formData.append('before_rent_court', beforeRentCourt.trim())
			formData.append('applicant_name', applicantName.trim())
			formData.append('applicant_residential_address', applicantResidentialAddress.trim())

			formData.append('tenancy_uin', tenancyUIN.trim())
			if (tenantName.trim()) formData.append('tenant_name', tenantName.trim())

			formData.append('statutory_basis', statutoryBasis)
			if (groundsApply) {
				evictionGrounds.forEach((clause) => formData.append('eviction_grounds[]', clause))
			}

			if (particularsOfApplication.trim()) {
				formData.append('particulars_of_application', particularsOfApplication.trim())
			}
			formData.append('jurisdiction_declaration_accepted', '1')
			if (factsOfCase.trim()) formData.append('facts_of_case', factsOfCase.trim())
			if (groundsForRelief.trim()) formData.append('grounds_for_relief', groundsForRelief.trim())
			formData.append('has_prior_proceedings', hasPriorProceedings ? '1' : '0')
			if (hasPriorProceedings) {
				priorProceedings.forEach((entry, i) => {
					formData.append(`prior_proceedings[${i}][case_number]`, entry.case_number.trim())
					formData.append(`prior_proceedings[${i}][forum]`, entry.forum.trim())
					if (entry.filing_date) {
						formData.append(`prior_proceedings[${i}][filing_date]`, entry.filing_date)
					}
					formData.append(`prior_proceedings[${i}][status]`, entry.status)
					if (entry.status === PRIOR_STATUS.PENDING) {
						formData.append(
							`prior_proceedings[${i}][pendency_details]`,
							entry.pendency_details.trim()
						)
					} else {
						formData.append(`prior_proceedings[${i}][decision]`, entry.decision.trim())
					}
				})
			}
			if (reliefSought.trim()) formData.append('relief_sought', reliefSought.trim())
			if (interimOrderSought.trim()) formData.append('interim_order_sought', interimOrderSought.trim())
			if (enclosuresList.trim()) formData.append('enclosures_list', enclosuresList.trim())

			formData.append('verification_name', verification.name.trim())
			formData.append('verification_relation', verification.relation)
			formData.append('verification_relative_name', verification.relativeName.trim())
			formData.append('verification_age', String(verification.age))
			formData.append('verification_address', verification.address.trim())
			formData.append('verification_place', verification.place.trim())
			Object.entries(verification.paragraphs).forEach(([number, answer]) => {
				formData.append(`verification_paragraphs[${number}]`, answer)
			})

			formData.append('signature_name', signatureName)
			if (signatureImage) formData.append('signature_image', signatureImage)

			await mutation.mutateAsync(formData)
			return true
		} catch {
			return false
		} finally {
			setSubmitting(false)
		}
	}, [
		applicantName,
		applicantResidentialAddress,
		beforeRentCourt,
		enclosuresList,
		factsOfCase,
		groundsForRelief,
		interimOrderSought,
		jurisdictionAccepted,
		hasPriorProceedings,
		priorProceedings,
		reliefSought,
		signatureImage,
		signatureName,
		verification,
		tenancyUIN,
		tenantName,
		statutoryBasis,
		evictionGrounds,
		groundsApply,
		particularsOfApplication,
		recordLoaded,
		reportError,
		mutation,
	])

	const previewData = useMemo(
		() =>
			previewSections(
				previewSection('Court / tenancy', [
					previewItem('Before the Rent Court', beforeRentCourt),
					previewItem('Tenancy UIN', tenancyUIN),
					previewItem('Tenant name', tenantName),
					previewItem('Applying as', applyingAs === 'tenant' ? 'Tenant' : 'Landlord'),
				]),
				previewSection('Applicant', [
					previewItem('Applicant name', applicantName),
					previewItem('Applicant address', applicantResidentialAddress),
				]),
				previewSection('Grounds for recovery of possession', [
					previewItem('Statutory basis', describeBasis(statutoryBasis)),
					previewItem(
						'Grounds relied on',
						groundsApply ? evictionGrounds.map(describeGround).join('\n\n') : ''
					),
				]),
				previewSection('Details of application', [
					previewItem('Particulars of application', particularsOfApplication),
					previewItem(
						'Jurisdiction declared',
						jurisdictionAccepted ? declarationText(DECLARATION.FORM_II_JURISDICTION) : ''
					),
					previewItem('Facts of the case', factsOfCase),
					previewItem('Grounds for relief', groundsForRelief),
					previewItem(
						'Matters not previously filed',
						hasPriorProceedings === null
							? ''
							: hasPriorProceedings
								? priorProceedings
										.map(
											(entry, i) =>
												`${i + 1}. ${entry.case_number} before ${entry.forum} - ${
													entry.status === PRIOR_STATUS.PENDING
														? `pending: ${entry.pendency_details}`
														: `disposed: ${entry.decision}`
												}`
										)
										.join('\n')
								: declarationText(DECLARATION.FORM_II_PRIOR_PROCEEDINGS)
					),
					previewItem('Relief sought', reliefSought),
					previewItem('Interim order sought', interimOrderSought),
					previewItem('List of enclosures', enclosuresList),
				]),
				previewSection('Verification', [
					previewItem('Verification', composeVerification(VERIFICATION.FORM_II, verification)),
					previewItem('Place', verification.place),
					previewItem('Date', 'Stamped on submission'),
					previewItem('Name against the signature', signatureName),
					previewItem('Signature image', signatureImage),
				])
			),
		[
			applicantName,
			applicantResidentialAddress,
			applyingAs,
			beforeRentCourt,
			enclosuresList,
			factsOfCase,
			groundsForRelief,
			interimOrderSought,
			jurisdictionAccepted,
			hasPriorProceedings,
			priorProceedings,
			reliefSought,
			signatureImage,
			signatureName,
			verification,
			tenancyUIN,
			tenantName,
			statutoryBasis,
			evictionGrounds,
			groundsApply,
			particularsOfApplication,
		]
	)

	const { previewOpen, requestPreview, closePreview, confirmSubmit } = useServiceFormPreview(submit)

	const handleTenancyLoaded = (tenancy) => {
		const cache = {
			landlordName: String(tenancy.landlord_name || '').trim(),
			landlordAddress: String(tenancy.landlord_address || '').trim(),
			tenantName: String(tenancy.tenant_name || '').trim(),
			tenantAddress: String(tenancy.tenant_address || '').trim(),
		}
		setPartyCache(cache)

		const sides = getPartySides(tenancy, user?.profile_type)
		const role = sides.selfRole === 'tenant' ? 'tenant' : 'landlord'
		setApplyingAs(role)

		applyTenancyAutofill(APPLICATION_TYPES.RENT_COURT_POSSESSION, tenancy, user, {
			setTenancyUIN,
			setApplicantName,
			setApplicantResidentialAddress,
			setTenantName,
			setBeforeRentCourt,
		})
		applyCapacityFromCache(role, cache)

		const districtName = String(tenancy.district?.name || tenancy.office?.district?.name || '').trim()
		setVerification((current) => ({
			...current,
			name: role === 'tenant' ? cache.tenantName || current.name : cache.landlordName || current.name,
			address:
				role === 'tenant'
					? cache.tenantAddress || current.address
					: cache.landlordAddress || current.address,
			place: districtName || current.place,
			nameEdited: false,
			addressEdited: false,
		}))

		setRecordLoaded(true)
		setError('')
		return 1
	}

	const formTitle = serviceMeta?.label || 'Form II — Recovery of possession'
	const formBadge = serviceMeta?.groupTitle || 'Rent Court'
	const formLead = serviceMeta
		? `${serviceMeta.matter || 'Application for recovery of possession'}${
				serviceMeta.rule ? ` (${serviceMeta.rule})` : ''
			}`
		: 'Application for recovery of possession before the Rent Court'

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
								description="Enter the Unique Identification Number issued by the Rent Authority. Form II can be filed only after the tenancy record is loaded."
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
								title="Application particulars"
								badge="From UIN · read-only"
								description="These details come from the UIN. Confirm them, then choose whether you are applying as landlord or tenant."
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
												applyingAs === 'landlord'
													? 'border-[#2563eb] bg-[#dbeafe]'
													: 'border-[#cbd5e1] bg-white hover:border-[#93c5fd]'
											}`}
										>
											<input
												type="radio"
												name="applying_as"
												value="landlord"
												checked={applyingAs === 'landlord'}
												onChange={() => handleApplyingAsChange('landlord')}
												className="h-4 w-4 accent-[#2563eb]"
											/>
											<span className="text-sm font-semibold text-[#151717]">Landlord</span>
										</label>
										<label
											className={`!m-0 !flex !h-[46px] !flex-row cursor-pointer items-center gap-2.5 rounded-[10px] border px-3.5 transition ${
												applyingAs === 'tenant'
													? 'border-[#2563eb] bg-[#dbeafe]'
													: 'border-[#cbd5e1] bg-white hover:border-[#93c5fd]'
											}`}
										>
											<input
												type="radio"
												name="applying_as"
												value="tenant"
												checked={applyingAs === 'tenant'}
												onChange={() => handleApplyingAsChange('tenant')}
												className="h-4 w-4 accent-[#2563eb]"
											/>
											<span className="text-sm font-semibold text-[#151717]">Tenant</span>
										</label>
									</div>
								</div>

								<div className="grid gap-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-4">
									<ReadOnlyField label="Applicant name" value={applicantName} icon={User} />
									<ReadOnlyField label="Tenant name" value={tenantName} icon={User} />
									<div className="sm:col-span-2">
										<ReadOnlyField
											label="Applicant address"
											value={applicantResidentialAddress}
											icon={MapPin}
											multiline
										/>
									</div>
									<div className="sm:col-span-2">
										<ReadOnlyField
											label="Before the Rent Court at"
											value={beforeRentCourt}
											icon={Building2}
											empty="Not on record"
										/>
									</div>
								</div>
							</FormSection>

							<FormSection
								step={2}
								tone="application"
								title="Grounds for recovery of possession"
								description="Choose the statutory basis. Extra ground checkboxes open only when section 21(2) applies."
							>
								<p className="m-0 inline-flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
									Tap the <Info size={14} className="text-[#2563eb]" aria-hidden /> info icon on an
									option to see which section of the Act it refers to.
								</p>

								<div
									className="tenancy-field-full ground-choice-group"
									role="radiogroup"
									aria-label="Statutory basis"
								>
									{EVICTION_BASIS_OPTIONS.map((option) => (
										<label key={option.value} className="ground-choice">
											<input
												type="radio"
												name="statutory_basis"
												value={option.value}
												checked={statutoryBasis === option.value}
												onChange={() => setStatutoryBasis(option.value)}
											/>
											<span
												className="ground-choice__body"
												style={{
													flexDirection: 'row',
													alignItems: 'center',
													gap: '0.5rem',
													flexWrap: 'wrap',
												}}
											>
												<span className="ground-choice__label" style={{ marginBottom: 0 }}>
													{option.label}
												</span>
												<span
													className="ground-choice__info-container"
													role="note"
													tabIndex={0}
													aria-label={`${option.citation}: ${option.note}`}
													onClick={(e) => {
														e.preventDefault()
														e.stopPropagation()
													}}
													onMouseDown={(e) => {
														e.preventDefault()
														e.stopPropagation()
													}}
												>
													<Info size={16} aria-hidden />
													<span className="ground-choice__info-popup" role="tooltip">
														<strong>{option.citation}</strong>
														<span>{option.note}</span>
													</span>
												</span>
											</span>
										</label>
									))}
								</div>

								{groundsApply ? (
									<>
										<p className="m-0 inline-flex flex-wrap items-center gap-2 text-sm font-semibold text-[#151717]">
											<span className="inline-flex items-center gap-1.5">
												<Scale size={16} className="text-[#2563eb]" aria-hidden />
												Grounds under section 21(2)
												<span className="text-red-500">*</span>
											</span>
											<span
												className="ground-choice__info-container"
												role="note"
												tabIndex={0}
												aria-label="Section 21(2) allows an order on one or more of the following grounds. Select every ground relied on."
											>
												<Info size={16} aria-hidden />
												<span className="ground-choice__info-popup" role="tooltip">
													<span>
														Section 21(2) allows an order on one or more of the following grounds.
														Select every ground relied on.
													</span>
												</span>
											</span>
										</p>
										<div className="tenancy-field-full ground-choice-group ground-choice-group--inline">
											{EVICTION_GROUND_CLAUSES.map((clause) => (
												<label key={clause.value} className="ground-choice">
													<input
														type="checkbox"
														value={clause.value}
														checked={evictionGrounds.includes(clause.value)}
														onChange={() => toggleGround(clause.value)}
													/>
													<span
														className="ground-choice__body"
														style={{
															flexDirection: 'row',
															alignItems: 'center',
															gap: '0.5rem',
															flexWrap: 'wrap',
														}}
													>
														<span className="ground-choice__label" style={{ marginBottom: 0 }}>
															{clause.label}
														</span>
														<span
															className="ground-choice__info-container"
															role="note"
															tabIndex={0}
															aria-label={`${clause.citation}: ${clause.text}`}
															onClick={(e) => {
																e.preventDefault()
																e.stopPropagation()
															}}
															onMouseDown={(e) => {
																e.preventDefault()
																e.stopPropagation()
															}}
														>
															<Info size={16} aria-hidden />
															<span className="ground-choice__info-popup" role="tooltip">
																<strong>{clause.citation}</strong>
																<p style={{ marginTop: '0.25rem', marginBottom: '0.25rem' }}>
																	{clause.text}
																</p>
																{clause.explanation ? (
																	<p style={{ marginTop: 0, fontStyle: 'italic' }}>
																		{clause.explanation}
																	</p>
																) : null}
															</span>
														</span>
													</span>
												</label>
											))}
										</div>
									</>
								) : (
									<p className="m-0 text-sm leading-relaxed text-slate-500">
										No additional ground checklist applies under section 22 — continue with the
										application details.
									</p>
								)}
							</FormSection>

							<FormSection
								step={3}
								tone="application"
								title="Details of the application"
								description="Explain the dispute in plain words. Paragraph numbers match Form II in the Gazette."
							>
								<Field
									label="Particulars of application"
									required
									para={1}
									hint="In one or two sentences, what recovery of possession are you seeking?"
								>
									<InputShell className={textareaShellClass}>
										<textarea
											required
											value={particularsOfApplication}
											onChange={(e) => setParticularsOfApplication(e.target.value)}
											rows={3}
											placeholder="State the particulars briefly"
											className="h-full w-full resize-y border-0 bg-transparent text-[15px] text-[#151717] outline-none placeholder:text-slate-400"
										/>
									</InputShell>
								</Field>

								<Field
									label="Jurisdiction of the Rent Court"
									required
									para={2}
									hint="Confirm that this Rent Court is the correct place to file."
								>
									<DeclarationCheckbox
										fieldId={DECLARATION.FORM_II_JURISDICTION}
										hideLabel
										simple
										summary="Yes — this matter can be heard by this Rent Court"
										checked={jurisdictionAccepted}
										onChange={setJurisdictionAccepted}
									/>
								</Field>

								<Field
									label="Facts of the case"
									required
									para={3}
									hint="Write what happened in date order. Prefer one fact or issue per short paragraph."
								>
									<InputShell className={textareaShellClass}>
										<textarea
											required
											value={factsOfCase}
											onChange={(e) => setFactsOfCase(e.target.value)}
											rows={4}
											placeholder="Set out the facts in chronological order"
											className="h-full w-full resize-y border-0 bg-transparent text-[15px] text-[#151717] outline-none placeholder:text-slate-400"
										/>
									</InputShell>
								</Field>

								<Field
									label="Grounds for relief"
									required
									para={4}
									hint="Why should the Rent Court grant what you are asking? Link to the grounds you chose above."
								>
									<InputShell className={textareaShellClass}>
										<textarea
											required
											value={groundsForRelief}
											onChange={(e) => setGroundsForRelief(e.target.value)}
											rows={3}
											placeholder="State the grounds for relief"
											className="h-full w-full resize-y border-0 bg-transparent text-[15px] text-[#151717] outline-none placeholder:text-slate-400"
										/>
									</InputShell>
								</Field>

								<Field
									label="Have you filed this matter elsewhere?"
									required
									para={5}
									hint="Say whether this same matter is already before another court or authority."
								>
									<PriorProceedingsField
										fieldId={DECLARATION.FORM_II_PRIOR_PROCEEDINGS}
										hint="If yes, add each case below. If no, choose the first option."
										hasPrior={hasPriorProceedings}
										onHasPriorChange={setHasPriorProceedings}
										entries={priorProceedings}
										onEntriesChange={setPriorProceedings}
										variant="modern"
									/>
								</Field>

								<Field
									label="Relief sought"
									required
									para={6}
									hint="State clearly what order you want (for example: recovery of possession)."
								>
									<InputShell className={textareaShellClass}>
										<textarea
											required
											value={reliefSought}
											onChange={(e) => setReliefSought(e.target.value)}
											rows={3}
											placeholder="State the relief sought"
											className="h-full w-full resize-y border-0 bg-transparent text-[15px] text-[#151717] outline-none placeholder:text-slate-400"
										/>
									</InputShell>
								</Field>

								<Field
									label="Interim order, if any prayed for"
									optional
									para={7}
									hint="Only if you need temporary help before the final order."
								>
									<InputShell className={textareaShellClass}>
										<textarea
											value={interimOrderSought}
											onChange={(e) => setInterimOrderSought(e.target.value)}
											rows={3}
											placeholder="Leave blank if not needed"
											className="h-full w-full resize-y border-0 bg-transparent text-[15px] text-[#151717] outline-none placeholder:text-slate-400"
										/>
									</InputShell>
								</Field>

								<Field
									label="List of enclosures"
									optional
									para={8}
									hint="List affidavits or documents you are attaching, if any."
								>
									<InputShell className={textareaShellClass}>
										<textarea
											value={enclosuresList}
											onChange={(e) => setEnclosuresList(e.target.value)}
											rows={3}
											placeholder="Example: Copy of tenancy agreement, rent receipts…"
											className="h-full w-full resize-y border-0 bg-transparent text-[15px] text-[#151717] outline-none placeholder:text-slate-400"
										/>
									</InputShell>
								</Field>
							</FormSection>

							<FormSection
								step={4}
								tone="signature"
								title="Declaration and signature"
								description="Complete the sworn verification, then upload a signature image if you have one."
							>
								<VerificationClause
									prefilled={hasProfileDefaults(profile)}
									fieldId={VERIFICATION.FORM_II}
									values={verification}
									onChange={setVerificationField}
									onParagraphChange={setParagraphAnswer}
									embedded
									variant="modern"
								/>

								<Field
									label="Signature image"
									optional
									hint="JPG, JPEG or PNG. Recommended: at least 300 × 100 px, max 2 MB."
								>
									<div className="form-i-field form-i-upload-field">
										<span className="form-i-icon-gutter" aria-hidden>
											<Upload size={18} strokeWidth={2} />
										</span>
										<label className="form-i-upload-body !m-0 !flex !flex-row !gap-3 min-w-0 flex-1 cursor-pointer items-center px-3.5">
											<span className="inline-flex shrink-0 items-center rounded-lg bg-[#dbeafe] px-3 py-1.5 text-sm font-semibold text-[#1e40af]">
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
				title="Review Form II"
				subtitle={serviceMeta?.label}
				sections={previewData}
				onClose={closePreview}
				onConfirm={confirmSubmit}
				confirming={submitting}
				confirmLabel="Confirm & submit Form II"
			/>
		</div>
	)
}
