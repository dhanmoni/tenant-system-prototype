import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
	Building2,
	CheckCircle2,
	IdCard,
	MapPin,
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

export default function Form7RentCourtAppealPanel({ onBack, serviceMeta, user }) {
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

	const [rentCourtAt, setRentCourtAt] = useState('')
	const [tenancyUIN, setTenancyUIN] = useState('')

	const profile = useMemo(() => profileDefaults(user), [user])
	const profileSide = profile.side === 'TENANT' ? 'tenant' : 'landlord'

	const [appellantName, setAppellantName] = useState(profile.name)
	const [appellantResidentialAddress, setAppellantResidentialAddress] = useState(profile.address)

	const [respondentName, setRespondentName] = useState('')
	const [respondentResidentialAddress, setRespondentResidentialAddress] = useState('')

	const [applyingAs, setApplyingAs] = useState(profileSide)
	const [partyCache, setPartyCache] = useState(emptyPartyCache)
	const [recordLoaded, setRecordLoaded] = useState(false)

	const [orderParticularsAgainstWhichAppealMade, setOrderParticularsAgainstWhichAppealMade] =
		useState('')
	const [jurisdictionAccepted, setJurisdictionAccepted] = useState(false)
	const [limitationAccepted, setLimitationAccepted] = useState(false)
	const [memorandumOfAppeal, setMemorandumOfAppeal] = useState('')
	const [hasPriorProceedings, setHasPriorProceedings] = useState(null)
	const [priorProceedings, setPriorProceedings] = useState([])
	const [reliefSought, setReliefSought] = useState('')
	const [interimOrderSought, setInterimOrderSought] = useState('')
	const [listOfEnclosures, setListOfEnclosures] = useState('')

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

	const signatureName = appellantName.trim()

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
		setVerification((current) => (current.nameEdited ? current : { ...current, name: appellantName }))
	}, [appellantName])

	useEffect(() => {
		setVerification((current) =>
			current.addressEdited ? current : { ...current, address: appellantResidentialAddress }
		)
	}, [appellantResidentialAddress])

	const applyCapacityFromCache = useCallback(
		(role, cache) => {
			const next = cache || emptyPartyCache
			if (role === 'tenant') {
				setAppellantName(next.tenantName || profile.name)
				setAppellantResidentialAddress(next.tenantAddress || profile.address)
				setRespondentName(next.landlordName || '')
				setRespondentResidentialAddress(next.landlordAddress || '')
			} else {
				setAppellantName(next.landlordName || profile.name)
				setAppellantResidentialAddress(next.landlordAddress || profile.address)
				setRespondentName(next.tenantName || '')
				setRespondentResidentialAddress(next.tenantAddress || '')
			}
		},
		[profile.address, profile.name]
	)

	const handleApplyingAsChange = useCallback(
		(role) => {
			setApplyingAs(role)
			if (recordLoaded) applyCapacityFromCache(role, partyCache)
		},
		[applyCapacityFromCache, partyCache, recordLoaded]
	)

	const clearTenancyRecord = useCallback(() => {
		setRecordLoaded(false)
		setPartyCache(emptyPartyCache)
		setApplyingAs(profileSide)
		setAppellantName(profile.name)
		setAppellantResidentialAddress(profile.address)
		setRespondentName('')
		setRespondentResidentialAddress('')
		setRentCourtAt('')
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
			const { data } = await api.post('/api/rent-court-appeal-applications', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})
			return data
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['citizen-applications'] })
			queryClient.invalidateQueries({ queryKey: ['admin-applications'] })
			completeServiceFormSubmit(
				navigate,
				getServiceFormSuccessMessage(data, 'Form V submitted successfully.')
			)
		},
		onError: (err) => {
			const msg =
				err?.response?.data?.message ||
				(err?.response?.data?.errors
					? Object.values(err.response.data.errors).flat().join('. ')
					: 'Failed to submit Form V')
			reportError(msg)
		},
	})

	const submit = useCallback(async () => {
		setError('')

		if (!recordLoaded) {
			reportError('Enter your Tenancy UIN and load the tenancy record before submitting Form V.')
			return false
		}

		if (!jurisdictionAccepted) {
			reportError('Accept the declaration at paragraph 2 before filing.')
			return false
		}

		if (!limitationAccepted) {
			reportError('Accept the declaration at paragraph 3 before filing.')
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

		if (!signatureName) {
			reportError('Appellant name is missing from the tenancy record.')
			return false
		}

		setSubmitting(true)
		try {
			const formData = new FormData()

			formData.append('rent_court_at', rentCourtAt.trim())
			formData.append('tenancy_uin', tenancyUIN.trim())

			formData.append('appellant_name', appellantName.trim())
			formData.append('appellant_residential_address', appellantResidentialAddress.trim())

			formData.append('respondent_name', respondentName.trim())
			formData.append('respondent_residential_address', respondentResidentialAddress.trim())

			if (orderParticularsAgainstWhichAppealMade.trim()) {
				formData.append(
					'order_particulars_against_which_appeal_made',
					orderParticularsAgainstWhichAppealMade.trim()
				)
			}
			formData.append('jurisdiction_declaration_accepted', '1')
			formData.append('limitation_declaration_accepted', '1')
			if (memorandumOfAppeal.trim()) formData.append('memorandum_of_appeal', memorandumOfAppeal.trim())
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
			if (listOfEnclosures.trim()) formData.append('list_of_enclosures', listOfEnclosures.trim())

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
		appellantName,
		appellantResidentialAddress,
		interimOrderSought,
		jurisdictionAccepted,
		limitationAccepted,
		listOfEnclosures,
		hasPriorProceedings,
		priorProceedings,
		memorandumOfAppeal,
		orderParticularsAgainstWhichAppealMade,
		reliefSought,
		rentCourtAt,
		respondentName,
		respondentResidentialAddress,
		signatureImage,
		signatureName,
		verification,
		tenancyUIN,
		recordLoaded,
		reportError,
		mutation,
	])

	const previewData = useMemo(
		() =>
			previewSections(
				previewSection('Tenancy', [
					previewItem('Rent Court at', rentCourtAt),
					previewItem('Tenancy UIN', tenancyUIN),
					previewItem('Applying as', applyingAs === 'tenant' ? 'Tenant' : 'Landlord'),
				]),
				previewSection('Parties', [
					previewItem('Appellant name', appellantName),
					previewItem('Appellant address', appellantResidentialAddress),
					previewItem('Respondent name', respondentName),
					previewItem('Respondent address', respondentResidentialAddress),
				]),
				previewSection('Case details', [
					previewItem('Order particulars', orderParticularsAgainstWhichAppealMade),
					previewItem(
						'Jurisdiction declared',
						jurisdictionAccepted ? declarationText(DECLARATION.FORM_V_JURISDICTION) : ''
					),
					previewItem(
						'3. Limitation',
						limitationAccepted ? declarationText(DECLARATION.FORM_V_LIMITATION) : ''
					),
					previewItem('Memorandum of appeal', memorandumOfAppeal),
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
								: declarationText(DECLARATION.FORM_V_PRIOR_PROCEEDINGS)
					),
					previewItem('Relief sought', reliefSought),
					previewItem('Interim order sought', interimOrderSought),
					previewItem('List of enclosures', listOfEnclosures),
				]),
				previewSection('Verification', [
					previewItem('Verification', composeVerification(VERIFICATION.FORM_V, verification)),
					previewItem('Place', verification.place),
					previewItem('Date', 'Stamped on submission'),
					previewItem('Name against the signature', signatureName),
					previewItem('Signature image', signatureImage),
				])
			),
		[
			appellantName,
			appellantResidentialAddress,
			applyingAs,
			interimOrderSought,
			jurisdictionAccepted,
			limitationAccepted,
			listOfEnclosures,
			hasPriorProceedings,
			priorProceedings,
			memorandumOfAppeal,
			orderParticularsAgainstWhichAppealMade,
			reliefSought,
			rentCourtAt,
			respondentName,
			respondentResidentialAddress,
			signatureImage,
			signatureName,
			verification,
			tenancyUIN,
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

		applyTenancyAutofill(APPLICATION_TYPES.RENT_COURT_APPEAL, tenancy, user, {
			setTenancyUIN,
			setRentCourtAt,
			setAppellantName,
			setAppellantResidentialAddress,
			setRespondentName,
			setRespondentResidentialAddress,
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

	const formTitle = serviceMeta?.label || 'Form V — Appeal against Rent Authority order'
	const formBadge = serviceMeta?.groupTitle || 'Rent Court'
	const formLead = serviceMeta
		? `${serviceMeta.matter || 'Appeal against order of the Rent Authority'}${
				serviceMeta.rule ? ` (${serviceMeta.rule})` : ''
			}`
		: 'Appeal against order of the Rent Authority before the Rent Court'

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
								description="Enter the Unique Identification Number issued by the Rent Authority. Form V can be filed only after the tenancy record is loaded."
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
								description="These details come from the UIN. Confirm them, then choose whether you are appealing as landlord or tenant."
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
									<ReadOnlyField label="Appellant name" value={appellantName} icon={User} />
									<ReadOnlyField label="Respondent name" value={respondentName} icon={User} />
									<div className="sm:col-span-2">
										<ReadOnlyField
											label="Appellant address"
											value={appellantResidentialAddress}
											icon={MapPin}
											multiline
										/>
									</div>
									<div className="sm:col-span-2">
										<ReadOnlyField
											label="Respondent address"
											value={respondentResidentialAddress}
											icon={MapPin}
											multiline
										/>
									</div>
									<div className="sm:col-span-2">
										<ReadOnlyField
											label="In the Rent Court at"
											value={rentCourtAt}
											icon={Building2}
											empty="Not on record"
										/>
									</div>
								</div>
							</FormSection>

							<FormSection
								step={2}
								tone="application"
								title="Details of appeal"
								description="Explain the appeal in plain words. Paragraph numbers match Form V in the Gazette."
							>
								<Field
									label="Particulars of the order of the Rent Authority as against which the appeal is made"
									required
									para={1}
									hint="Identify the Rent Authority order you are appealing against (date, number, and brief substance)."
								>
									<InputShell className={textareaShellClass}>
										<textarea
											required
											value={orderParticularsAgainstWhichAppealMade}
											onChange={(e) => setOrderParticularsAgainstWhichAppealMade(e.target.value)}
											rows={3}
											placeholder="State the order particulars briefly"
											className="h-full w-full resize-y border-0 bg-transparent text-[15px] text-[#151717] outline-none placeholder:text-slate-400"
										/>
									</InputShell>
								</Field>

								<Field
									label="Jurisdiction of the Rent Court"
									required
									para={2}
									hint="Confirm that this Rent Court is the correct place to file this appeal."
								>
									<DeclarationCheckbox
										fieldId={DECLARATION.FORM_V_JURISDICTION}
										hideLabel
										simple
										summary="Yes — this appeal can be heard by this Rent Court"
										checked={jurisdictionAccepted}
										onChange={setJurisdictionAccepted}
									/>
								</Field>

								<Field
									label="Limitation"
									required
									para={3}
									hint="Confirm that this appeal is filed within the limitation period."
								>
									<DeclarationCheckbox
										fieldId={DECLARATION.FORM_V_LIMITATION}
										hideLabel
										simple
										summary="Yes — this appeal is within the limitation period"
										checked={limitationAccepted}
										onChange={setLimitationAccepted}
									/>
								</Field>

								<Field
									label="Memorandum of Appeal"
									required
									para={4}
									hint="State the grounds of appeal and any legal provisions you rely on."
								>
									<InputShell className={textareaShellClass}>
										<textarea
											required
											value={memorandumOfAppeal}
											onChange={(e) => setMemorandumOfAppeal(e.target.value)}
											rows={3}
											placeholder="State the grounds of appeal"
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
										fieldId={DECLARATION.FORM_V_PRIOR_PROCEEDINGS}
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
									hint="In view of the memorandum in para 4, state the relief(s) you seek."
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
									hint="Only if you need temporary relief pending the final decision on this appeal."
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
											value={listOfEnclosures}
											onChange={(e) => setListOfEnclosures(e.target.value)}
											rows={3}
											placeholder="Example: Copy of Rent Authority order, tenancy agreement…"
											className="h-full w-full resize-y border-0 bg-transparent text-[15px] text-[#151717] outline-none placeholder:text-slate-400"
										/>
									</InputShell>
								</Field>
							</FormSection>

							<FormSection
								step={3}
								tone="signature"
								title="Declaration and signature"
								description="Complete the sworn verification, then upload a signature image if you have one."
							>
								<VerificationClause
									prefilled={hasProfileDefaults(profile)}
									fieldId={VERIFICATION.FORM_V}
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
				title="Review Form V"
				subtitle={serviceMeta?.label}
				sections={previewData}
				onClose={closePreview}
				onConfirm={confirmSubmit}
				confirming={submitting}
				confirmLabel="Confirm & submit Form V"
			/>
		</div>
	)
}
