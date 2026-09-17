import { useCallback, useEffect, useMemo, useState, Children, cloneElement, isValidElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
	ArrowLeft,
	Building2,
	Check,
	MapPin,
	Scale,
	Upload,
	User,
} from 'lucide-react'
import api, { csrf } from '../api'
import TenancyUinLookup from './forms/TenancyUinLookup'
import UinPrefillNotice from './forms/UinPrefillNotice'
import LoadedUinChip from './forms/LoadedUinChip'
import ServiceFormReadyGate from './forms/ServiceFormReadyGate'
import ServiceFormPreviewModal from './forms/ServiceFormPreviewModal'
import FormIILegalDocument from './forms/FormIILegalDocument'
import FormDatePicker from './forms/FormDatePicker'
import { useServiceFormPreview } from '../hooks/useServiceFormPreview'
import { APPLICATION_TYPES } from '../constants/application'
import PriorProceedingsField from './forms/PriorProceedingsField'
import FloatingInfoNote from './forms/FloatingInfoNote'
import { PRIOR_STATUS } from '../constants/priorProceedings'
import {
	DECLARATION,
	PARA_ANSWER,
	VERIFICATION,
	declarationText,
	verificationParagraphs,
} from '../constants/declarations'
import { ageOn, profileDefaults, toDateInputValue } from '../utils/profileAutofill'
import {
	EVICTION_BASIS,
	EVICTION_BASIS_OPTIONS,
	EVICTION_GROUND_CLAUSES,
} from '../constants/evictionGrounds'
import { completeServiceFormSubmit, getServiceFormSuccessMessage } from '../utils/serviceFormSubmit'
import { applyTenancyAutofill, formatRentCourtAddressee } from '../utils/tenancyUinAutofill'
import { useToast } from '../context/ToastContext'

/** UI labels in full words; values stay as Gazette S/o. / W/o. / D/o. for the API. */
const VERIFICATION_RELATION_OPTIONS = [
	{ value: 'S/o.', label: 'Son' },
	{ value: 'D/o.', label: 'Daughter' },
	{ value: 'W/o.', label: 'Spouse' },
]

const inputClass =
	'h-full w-full border-0 bg-transparent px-3.5 text-[15px] text-[#151717] outline-none placeholder:text-slate-400'
const inputShellClass = 'form-i-field'
const textareaShellClass = 'form-i-field form-i-field--multiline'
const textareaClass =
	'h-full w-full resize-y border-0 bg-transparent px-3.5 py-2.5 text-[15px] text-[#151717] outline-none placeholder:text-slate-400'

function dobInputMax() {
	const today = new Date()
	const year = today.getFullYear()
	const month = String(today.getMonth() + 1).padStart(2, '0')
	const day = String(today.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

function FormTick({ checked, className = '' }) {
	return (
		<span
			className={`sf-form-tick${checked ? ' is-checked' : ''}${className ? ` ${className}` : ''}`}
			aria-hidden
		>
			{checked ? <Check size={11} strokeWidth={3} /> : null}
		</span>
	)
}

/** Unticked parts default to personal knowledge; tick only those based on legal advice. */
const FORM_II_PART_SHORT = {
	1: 'Particulars of application',
	2: 'Jurisdiction',
	3: 'Facts of the case',
	4: 'Grounds for relief',
	5: 'Earlier proceedings',
	6: 'Relief sought',
	7: 'Interim order sought',
	8: 'List of enclosures',
}

function partLabel(option) {
	return FORM_II_PART_SHORT[option.number] || option.heading || `Part ${option.number}`
}

function LegalAdvicePartPicker({ options, selectedNumbers, onToggle, error = '' }) {
	const errorId = error ? 'form-ii-legal-advice-error' : undefined
	return (
		<fieldset
			className="form-iv-detail-item form-iv-legal-advice form-iv-optional-gate m-0 flex min-w-0 flex-col border-0"
			id="form-ii-legal-advice-group"
		>
			<legend className="m-0 w-full min-w-0 px-0">
				<span className="flex flex-wrap items-center gap-2 text-[15px] font-semibold text-[#334155]">
					<span
						className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#cbd5e1] bg-[#f1f5f9] text-[#0d47a1]"
						aria-hidden
					>
						<Scale size={15} strokeWidth={2.25} />
					</span>
					Based on legal advice
				</span>
			</legend>
			<p className="mt-0 mb-0 text-[12px] leading-relaxed text-slate-500 sm:pl-9">
				By default, all particulars above are treated as based on your own knowledge. Tick only those
				that are based on legal advice.
			</p>

			<ul className="m-0 flex list-none flex-col gap-1.5 p-0 sm:pl-9" aria-describedby={errorId}>
				{options.map((option) => {
					const selected = selectedNumbers.includes(option.number)
					const label = partLabel(option)
					const inputId = `form-ii-legal-advice-${option.number}`
					return (
						<li key={option.number} className="min-w-0">
							<label htmlFor={inputId} className="!m-0 !flex cursor-pointer items-center gap-2.5">
								<FormTick checked={selected} className="mt-0" />
								<input
									id={inputId}
									type="checkbox"
									className="sr-only"
									checked={selected}
									onChange={() => onToggle(option.number)}
								/>
								<span className="min-w-0 text-[14px] font-medium leading-snug text-slate-800">
									{label} ({option.number})
								</span>
							</label>
						</li>
					)
				})}
			</ul>
			{error ? (
				<p id={errorId} className="m-0 text-[12px] font-medium text-red-600 sm:pl-9" role="alert">
					{error}
				</p>
			) : null}
		</fieldset>
	)
}

function FormCard({ title, description, badge, uin, onChangeUin, children }) {
	return (
		<section className="sf-form-card overflow-hidden sf-form-card rounded-[20px] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
			<div className="sf-form-card__header">
				{badge ? <span className="sf-form-card__badge">{badge}</span> : null}
				<h1 className="sf-form-card__title">{title}</h1>
				{description ? <p className="sf-form-card__lead">{description}</p> : null}
				{uin ? <LoadedUinChip value={uin} onChange={onChangeUin} /> : null}
			</div>
			<div className="flex flex-col gap-4 p-[22px] sm:p-[30px]">{children}</div>
		</section>
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

const sectionToneClass = {
	record: 'sf-section-panel rounded-2xl border border-[#cbd5e1] bg-white px-4 py-4 sm:px-5 sm:py-5',
	application: 'sf-section-panel rounded-2xl border border-[#cbd5e1] bg-white px-4 py-4 sm:px-5 sm:py-5',
	signature: 'sf-section-panel rounded-2xl border border-[#cbd5e1] bg-white px-4 py-4 sm:px-5 sm:py-5',
	default: '',
}

function injectControlA11y(children, a11y) {
	return Children.map(children, (child) => {
		if (!isValidElement(child)) return child
		const type = child.type
		const isControl = type === 'input' || type === 'textarea' || type === 'select'
		if (isControl) {
			const describedBy = [child.props['aria-describedby'], a11y.describedBy]
				.filter(Boolean)
				.join(' ')
			return cloneElement(child, {
				id: child.props.id || a11y.id,
				'aria-invalid': a11y.invalid || child.props['aria-invalid'] || undefined,
				'aria-describedby': describedBy || undefined,
			})
		}
		if (child.props?.children != null) {
			return cloneElement(child, {
				children: injectControlA11y(child.props.children, a11y),
			})
		}
		return child
	})
}

function FormSection({
	step,
	title,
	badge,
	description,
	descriptionClassName = 'mt-1 mb-0 text-sm leading-relaxed text-slate-500',
	tone = 'default',
	contentClassName = 'flex flex-col gap-4',
	children,
}) {
	const toneClass = sectionToneClass[tone] || sectionToneClass.default
	return (
		<div className={toneClass || undefined} id={step ? `form-ii-section-${step}` : undefined}>
			<div className="mb-4">
				<div className="flex items-start gap-3">
					{step ? (
						<span className="sf-step-badge" aria-hidden>
							{step}
						</span>
					) : null}
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-2">
							<h3 className="sf-section-title">
								{step ? <span className="sr-only">Section {step}. </span> : null}
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
			<div className={contentClassName}>{children}</div>
		</div>
	)
}

function Field({
	id,
	label,
	hint,
	error = '',
	required = false,
	optional = false,
	para = null,
	hintInline = false,
	children,
}) {
	const isDetail = para != null
	const hintId = id && hint ? `${id}-hint` : undefined
	const errorId = id && error ? `${id}-error` : undefined
	const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
	const controlChildren = id
		? injectControlA11y(children, {
				id,
				describedBy,
				invalid: Boolean(error) || undefined,
			})
		: children

	return (
		<div
			className={
				isDetail
					? 'form-iv-field form-iv-detail-item flex min-w-0 flex-col'
					: 'form-iv-field flex min-w-0 flex-col gap-1.5'
			}
			id={id ? `${id}-group` : undefined}
		>
			<div className={`flex min-w-0 ${hintInline || !hint ? '' : 'flex-col gap-1'}`}>
				<div className="flex flex-row flex-wrap items-center gap-x-2 gap-y-1 text-[14px] font-semibold text-[#151717]">
					{para != null ? (
						<span className="sf-para-badge" aria-hidden>
							{para}
						</span>
					) : null}
					{id ? (
						<label
							htmlFor={id}
							className={`m-0 cursor-pointer ${isDetail ? 'text-[14px] font-semibold text-slate-900' : ''}`}
						>
							{label}
						</label>
					) : (
						<span className={isDetail ? 'text-[14px] font-semibold text-slate-900' : undefined}>
							{label}
						</span>
					)}
					{required ? (
						<span className="text-red-500" aria-hidden>
							*
						</span>
					) : null}
					{required ? <span className="sr-only">(required)</span> : null}
					{hint && hintInline ? (
						<span id={hintId} className="text-[12px] font-medium text-slate-500">
							{hint}
						</span>
					) : null}
				</div>
				{hint && !hintInline ? (
					<p
						id={hintId}
						className={`m-0 text-[12px] leading-relaxed text-slate-500${isDetail ? ' sm:pl-8' : ''}`}
					>
						{hint}
					</p>
				) : null}
			</div>
			<div className={isDetail ? 'min-w-0 sm:pl-8' : undefined}>{controlChildren}</div>
			{error ? (
				<p
					id={errorId}
					className={`m-0 text-[12px] font-medium leading-snug text-red-600${isDetail ? ' sm:pl-8' : ''}`}
					role="alert"
				>
					{error}
				</p>
			) : null}
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
		<div className={`flex min-w-0 flex-col gap-2${isUin ? ' form-iv-readonly--uin' : ''}`}>
			<span
				className={`text-[13px] font-semibold uppercase tracking-wide ${
					isUin || fromUin ? 'text-[#0f172a]' : 'text-slate-500'
				}`}
			>
				{label}
				{fromUin ? (
					<span
						className="form-iv-from-uin-tag !normal-case"
						title="Filled from the loaded tenancy UIN"
					>
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

/** Split into two columns so items read down the left column, then the right. */
function splitIntoColumns(items) {
	const mid = Math.ceil(items.length / 2)
	return [items.slice(0, mid), items.slice(mid)]
}

export default function Form4RentCourtPossessionPanel({ onBack, serviceMeta, user }) {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const { showToast } = useToast()
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')
	const [fieldErrors, setFieldErrors] = useState({})

	const reportError = useCallback(
		(message) => {
			const text = String(message || '').trim()
			if (!text) return
			setError(text)
			showToast(text, 'error')
		},
		[showToast]
	)

	const focusFormControl = useCallback((fieldId) => {
		if (!fieldId) return
		window.requestAnimationFrame(() => {
			const control =
				document.getElementById(fieldId) ||
				document.querySelector(
					`#${fieldId}-group input, #${fieldId}-group textarea, #${fieldId}-group button`
				)
			const group = document.getElementById(`${fieldId}-group`)
			;(control || group)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
			if (control && typeof control.focus === 'function') {
				try {
					control.focus({ preventScroll: true })
				} catch {
					control.focus()
				}
			}
		})
	}, [])

	const clearFieldError = useCallback((fieldId) => {
		setFieldErrors((current) => {
			if (!current[fieldId]) return current
			const next = { ...current }
			delete next[fieldId]
			return next
		})
	}, [])

	const [beforeRentCourt, setBeforeRentCourt] = useState('')
	const [courtJurisdictionName, setCourtJurisdictionName] = useState('')
	const [courtJurisdictionAddress, setCourtJurisdictionAddress] = useState('')

	const profile = useMemo(() => profileDefaults(user), [user])

	const [applicantName, setApplicantName] = useState(profile.name)
	const [applicantResidentialAddress, setApplicantResidentialAddress] = useState(profile.address)

	const [tenancyUIN, setTenancyUIN] = useState('')
	const [tenantName, setTenantName] = useState('')
	const [tenantResidentialAddress, setTenantResidentialAddress] = useState('')
	const [premisesSituatedAt, setPremisesSituatedAt] = useState('')
	const [tenancyDistrict, setTenancyDistrict] = useState('')
	const [recordLoaded, setRecordLoaded] = useState(false)

	const [statutoryBasis, setStatutoryBasis] = useState('')
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
	const [verificationDob, setVerificationDob] = useState(() => toDateInputValue(profile.dateOfBirth))
	const [verificationUndertakingAccepted, setVerificationUndertakingAccepted] = useState(false)
	const [verification, setVerification] = useState({
		name: profile.name,
		relation: 'S/o.',
		relativeName: '',
		age: ageOn(toDateInputValue(profile.dateOfBirth)) || profile.age || '',
		address: profile.address,
		place: '',
		paragraphs: {},
	})

	const ageFromDob = useMemo(() => ageOn(verificationDob), [verificationDob])

	const applyDob = useCallback((nextDob) => {
		const normalised = toDateInputValue(nextDob)
		setVerificationDob(normalised)
		setVerification((current) => ({
			...current,
			age: ageOn(normalised) || '',
		}))
		return normalised
	}, [])

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
		}))
	}, [])

	const toggleLegalAdvicePara = useCallback((number) => {
		setVerification((current) => {
			const next = { ...current.paragraphs }
			if (next[number] === PARA_ANSWER.LEGAL_ADVICE) {
				delete next[number]
			} else {
				next[number] = PARA_ANSWER.LEGAL_ADVICE
			}
			return { ...current, paragraphs: next }
		})
	}, [])

	const setInterimOrderSoughtValue = useCallback((value) => {
		setInterimOrderSought(value)
		if (!String(value || '').trim()) {
			setVerification((current) => {
				if (current.paragraphs?.[7] == null) return current
				const next = { ...current.paragraphs }
				delete next[7]
				return { ...current, paragraphs: next }
			})
		}
	}, [])

	const setEnclosuresListValue = useCallback((value) => {
		setEnclosuresList(value)
		if (!String(value || '').trim()) {
			setVerification((current) => {
				if (current.paragraphs?.[8] == null) return current
				const next = { ...current.paragraphs }
				delete next[8]
				return { ...current, paragraphs: next }
			})
		}
	}, [])

	const verificationParaOptions = useMemo(
		() =>
			Object.entries(verificationParagraphs(VERIFICATION.FORM_II)).map(([number, heading]) => ({
				number: Number(number),
				heading,
			})),
		[]
	)

	const requiredVerificationParas = verificationParaOptions

	const resolvedVerificationParagraphs = useMemo(() => {
		const paragraphs = {}
		requiredVerificationParas.forEach((option) => {
			if (option.number === 2 && !jurisdictionAccepted) return
			paragraphs[option.number] =
				verification.paragraphs?.[option.number] === PARA_ANSWER.LEGAL_ADVICE
					? PARA_ANSWER.LEGAL_ADVICE
					: PARA_ANSWER.PERSONAL_KNOWLEDGE
		})
		return paragraphs
	}, [requiredVerificationParas, verification.paragraphs, jurisdictionAccepted])

	const legalAdviceParaNumbers = useMemo(
		() =>
			requiredVerificationParas
				.filter((option) => verification.paragraphs?.[option.number] === PARA_ANSWER.LEGAL_ADVICE)
				.map((option) => option.number),
		[requiredVerificationParas, verification.paragraphs]
	)

	const verifierName = String(applicantName || '').trim()
	const verifierAddress = String(applicantResidentialAddress || '').trim()
	const effectiveSignatureName = verifierName

	const verificationForPreview = useMemo(
		() => ({
			...verification,
			name: verifierName,
			age: String(verification.age || ageFromDob || '').trim(),
			address: verifierAddress,
			paragraphs: resolvedVerificationParagraphs,
		}),
		[verification, verifierName, verifierAddress, resolvedVerificationParagraphs, ageFromDob]
	)

	const toggleGround = useCallback((clause) => {
		clearFieldError('form-ii-eviction-grounds')
		setEvictionGrounds((current) =>
			current.includes(clause) ? current.filter((c) => c !== clause) : [...current, clause]
		)
	}, [clearFieldError])

	const selectBasis = useCallback(
		(value) => {
			clearFieldError('form-ii-basis')
			clearFieldError('form-ii-eviction-grounds')
			setStatutoryBasis(value)
			if (value !== EVICTION_BASIS.SECTION_21_2) {
				setEvictionGrounds([])
			}
		},
		[clearFieldError]
	)

	const groundsApply = statutoryBasis === EVICTION_BASIS.SECTION_21_2

	const clearTenancyRecord = useCallback(() => {
		setRecordLoaded(false)
		setApplicantName(profile.name)
		setApplicantResidentialAddress(profile.address)
		setTenantName('')
		setTenantResidentialAddress('')
		setPremisesSituatedAt('')
		setTenancyDistrict('')
		setBeforeRentCourt('')
		setCourtJurisdictionName('')
		setCourtJurisdictionAddress('')
		setSignatureImage(null)
		setVerificationUndertakingAccepted(false)
		const profileDob = toDateInputValue(profile.dateOfBirth)
		setVerificationDob(profileDob)
		setVerification({
			name: profile.name,
			relation: 'S/o.',
			relativeName: '',
			age: ageOn(profileDob) || profile.age || '',
			address: profile.address,
			place: '',
			paragraphs: {},
		})
		setError('')
		setFieldErrors({})
	}, [profile.address, profile.age, profile.dateOfBirth, profile.name])

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
		const nextErrors = {}
		const fail = (fieldId, message) => {
			if (!nextErrors[fieldId]) nextErrors[fieldId] = message
		}

		if (!recordLoaded) {
			reportError('Enter your Tenancy UIN and load the tenancy record before submitting Form II.')
			return false
		}

		if (!statutoryBasis) {
			fail('form-ii-basis', 'Select the matter this application is under.')
		}
		if (groundsApply && evictionGrounds.length === 0) {
			fail(
				'form-ii-eviction-grounds',
				'Select at least one ground under section 21(2). The Rent Court may order recovery of possession only on a ground listed there.'
			)
		}

		if (!particularsOfApplication.trim()) {
			fail('form-ii-particulars', 'Enter the particulars of the application.')
		}
		if (!jurisdictionAccepted) {
			fail('form-ii-jurisdiction', 'Accept the declaration at paragraph 2 before filing.')
		}
		if (!factsOfCase.trim()) {
			fail('form-ii-facts', 'Enter the facts of the case.')
		}
		if (!groundsForRelief.trim()) {
			fail('form-ii-grounds-relief', 'Enter the grounds for relief.')
		}
		if (hasPriorProceedings === null) {
			fail('form-ii-prior', 'Answer paragraph 5 before filing.')
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
				fail(
					'form-ii-prior',
					'Give the case number, the court or authority, and the pendency or decision for every case disclosed at paragraph 5.'
				)
			}
		}
		if (!reliefSought.trim()) {
			fail('form-ii-relief', 'Enter the relief sought.')
		}
		if (!verification.relativeName.trim()) {
			fail('form-ii-relative-name', 'Enter the father / mother / spouse name.')
		}
		if (!verification.relation) {
			fail('form-ii-relation', 'Select the relation.')
		}
		if (!verificationDob || !String(verification.age || ageFromDob || '').trim()) {
			fail('form-ii-dob', 'Enter the applicant’s date of birth so age can be calculated.')
		}
		if (!verifierName || !verification.relativeName.trim() || !verifierAddress) {
			fail(
				'form-ii-relative-name',
				'Complete the verification particulars (name, relation target and address).'
			)
		}
		if (!verification.place.trim()) {
			fail(
				'form-ii-applicant',
				'This UIN has no district on record. Place of filing cannot be set automatically.'
			)
		}
		const resolvedAnswers = Object.values(resolvedVerificationParagraphs)
		const allOnLegalAdvice =
			resolvedAnswers.length > 0 &&
			resolvedAnswers.every((answer) => answer === PARA_ANSWER.LEGAL_ADVICE)
		if (allOnLegalAdvice) {
			fail(
				'form-ii-legal-advice',
				'At least one part of the application must remain based on your own knowledge. Leave at least one item unticked under Based on legal advice.'
			)
		}
		if (!verificationUndertakingAccepted) {
			fail('form-ii-undertaking', 'Accept the verification undertaking before filing.')
		}
		if (!effectiveSignatureName) {
			fail('form-ii-undertaking', 'Applicant name is missing from the tenancy record.')
		}
		if (!tenantName.trim()) {
			fail('form-ii-applicant', 'Tenant name is missing from the tenancy record.')
		}
		if (!tenantResidentialAddress.trim()) {
			fail('form-ii-applicant', 'Tenant residential address is missing from the tenancy record.')
		}
		if (!signatureImage) {
			fail('form-ii-signature', 'Upload your signature image.')
		}

		const errorKeys = Object.keys(nextErrors)
		setFieldErrors(nextErrors)
		if (errorKeys.length > 0) {
			const firstId = errorKeys[0]
			reportError(nextErrors[firstId])
			focusFormControl(firstId)
			return false
		}

		setSubmitting(true)
		try {
			const formData = new FormData()

			formData.append('before_rent_court', beforeRentCourt.trim())
			formData.append('applicant_name', applicantName.trim())
			formData.append('applicant_residential_address', applicantResidentialAddress.trim())

			formData.append('tenancy_uin', tenancyUIN.trim())
			formData.append('tenant_name', tenantName.trim())
			formData.append('tenant_residential_address', tenantResidentialAddress.trim())

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

			formData.append('verification_name', verifierName)
			formData.append('verification_relation', verification.relation)
			formData.append('verification_relative_name', verification.relativeName.trim())
			formData.append('verification_age', String(verification.age || ageFromDob || '').trim())
			formData.append('verification_address', verifierAddress)
			formData.append('verification_place', verification.place.trim())
			Object.entries(resolvedVerificationParagraphs).forEach(([number, answer]) => {
				formData.append(`verification_paragraphs[${number}]`, answer)
			})

			formData.append('signature_name', effectiveSignatureName)
			if (signatureImage) formData.append('signature_image', signatureImage)

			await mutation.mutateAsync(formData)
			return true
		} catch {
			return false
		} finally {
			setSubmitting(false)
		}
	}, [
		ageFromDob,
		applicantName,
		applicantResidentialAddress,
		beforeRentCourt,
		effectiveSignatureName,
		enclosuresList,
		factsOfCase,
		groundsForRelief,
		interimOrderSought,
		jurisdictionAccepted,
		hasPriorProceedings,
		priorProceedings,
		reliefSought,
		requiredVerificationParas,
		resolvedVerificationParagraphs,
		signatureImage,
		verification,
		verificationDob,
		verificationUndertakingAccepted,
		verifierAddress,
		verifierName,
		tenancyUIN,
		tenantName,
		tenantResidentialAddress,
		statutoryBasis,
		evictionGrounds,
		groundsApply,
		particularsOfApplication,
		recordLoaded,
		reportError,
		focusFormControl,
		mutation,
	])

	const { previewOpen, requestPreview, closePreview, confirmSubmit } = useServiceFormPreview(submit)

	const handleTenancyLoaded = (tenancy) => {
		const nextLandlordName = String(tenancy.landlord_name || '').trim()
		const nextLandlordAddress = String(tenancy.landlord_address || '').trim()
		const nextTenantName = String(tenancy.tenant_name || '').trim()
		const nextTenantAddress = String(tenancy.tenant_address || '').trim()
		const premises = String(tenancy.property_premises_description || '').trim()
		const districtName = String(tenancy.district?.name || tenancy.office?.district?.name || '').trim()

		applyTenancyAutofill(APPLICATION_TYPES.RENT_COURT_POSSESSION, tenancy, user, {
			setTenancyUIN,
			setTenantName,
			setBeforeRentCourt,
		})

		// Form II: applicant is the landlord on the UIN; tenant is named in the recital only.
		setApplicantName(nextLandlordName || profile.name)
		setApplicantResidentialAddress(nextLandlordAddress || profile.address)
		setTenantName(nextTenantName)
		setTenantResidentialAddress(nextTenantAddress)
		setPremisesSituatedAt(premises)
		setTenancyDistrict(districtName)
		if (districtName) setBeforeRentCourt(districtName)

		const court = formatRentCourtAddressee(tenancy)
		setCourtJurisdictionName(court.line1)
		setCourtJurisdictionAddress(court.line2)

		const profileDob = toDateInputValue(profile.dateOfBirth || user?.date_of_birth)
		if (!verificationDob && profileDob) {
			setVerificationDob(profileDob)
		}

		setVerification((current) => ({
			...current,
			name: nextLandlordName || current.name || profile.name,
			address: nextLandlordAddress || current.address || profile.address,
			age: String(ageOn(verificationDob || profileDob) || current.age || profile.age || '').trim(),
			place: districtName || current.place,
			paragraphs: {},
		}))
		setVerificationUndertakingAccepted(false)

		setRecordLoaded(true)
		setError('')
		return 1
	}

	const formTitle = serviceMeta?.formName || 'Form II'
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
						<FormTopBar onBack={onBack} />
						<ServiceFormReadyGate
							badge={formBadge}
							title={formTitle}
							description={formLead}
							knowBefore={[
								'Date of birth and relation details for verification',
								'Eviction ground / facts ready to state',
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
							<div className="form-iv-main">
							<FormSection
								step={1}
								tone="record"
								title="Applicant details"
								description="On Form II the applicant is the landlord. Review the parties and premises from your UIN, then complete relation and age."
							>
								<UinPrefillNotice />
								<div className="grid gap-3 sm:grid-cols-2">
									<ReadOnlyField
										label="A. Applicant name (landlord)"
										value={applicantName}
										icon={User}
										fromUin
									/>
									<ReadOnlyField
										label="B. Respondent name (tenant)"
										value={tenantName}
										icon={User}
										fromUin
									/>
									<ReadOnlyField
										label="Applicant residential address"
										value={applicantResidentialAddress}
										icon={MapPin}
										multiline
										fromUin
									/>
									<ReadOnlyField
										label="Respondent residential address"
										value={tenantResidentialAddress}
										icon={MapPin}
										multiline
										empty="Not on record"
										fromUin
									/>
									<div className="sm:col-span-2">
										<ReadOnlyField
											label="Premises situated at"
											value={premisesSituatedAt}
											icon={Building2}
											multiline
											empty="Not on record"
											fromUin
										/>
									</div>
									<ReadOnlyField
										label="District / place of filing"
										value={tenancyDistrict || verification.place}
										icon={MapPin}
										empty="Not on record"
										fromUin
									/>
									<ReadOnlyField
										label="Before the Rent Court at"
										value={beforeRentCourt}
										icon={Scale}
										empty="Not on record"
										fromUin
									/>
								</div>

								<div className="form-iv-applicant-extras">
									<div className="form-iv-applicant-extras__grid">
										<Field
											id="form-ii-relative-name"
											label="Applicant's father/mother/spouse name"
											required
											hint="Person you are Son, Daughter or Spouse of"
											error={fieldErrors['form-ii-relative-name'] || ''}
										>
											<InputShell icon={User} className={`${inputShellClass} form-iv-relative-name-input`}>
												<input
													type="text"
													value={verification.relativeName}
													onChange={(e) => {
														clearFieldError('form-ii-relative-name')
														setVerificationField('relativeName', e.target.value)
													}}
													required
													placeholder="Full name"
													className={inputClass}
												/>
											</InputShell>
										</Field>

										<fieldset
											id="form-ii-relation-group"
											className="form-iv-field form-iv-applicant-extras__relation m-0 flex min-w-0 flex-col gap-1.5 border-0 p-0"
										>
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
												{VERIFICATION_RELATION_OPTIONS.map((option) => {
													const selected = verification.relation === option.value
													return (
														<label
															key={option.value}
															className={`form-iv-relation-option${selected ? ' is-selected' : ''}`}
														>
															<input
																type="radio"
																name="verification_relation_ii"
																value={option.value}
																checked={selected}
																onChange={() => {
																	clearFieldError('form-ii-relation')
																	setVerificationField('relation', option.value)
																}}
																className="sr-only"
															/>
															<span>{option.label}</span>
														</label>
													)
												})}
											</div>
											{fieldErrors['form-ii-relation'] ? (
												<p className="m-0 text-[12px] font-medium text-red-600" role="alert">
													{fieldErrors['form-ii-relation']}
												</p>
											) : null}
										</fieldset>

										<Field
											id="form-ii-dob"
											label="Applicant's date of birth"
											required
											hint="Age is calculated automatically"
											error={fieldErrors['form-ii-dob'] || fieldErrors['form-ii-age'] || ''}
										>
											<div className="form-iv-dob-field">
												<FormDatePicker
													id="form-ii-dob"
													value={verificationDob}
													onChange={(next) => {
														clearFieldError('form-ii-dob')
														clearFieldError('form-ii-age')
														applyDob(next)
													}}
													required
													max={dobInputMax()}
													placeholder="DD-MM-YYYY"
													className="form-iv-dob-input"
													aria-invalid={
														fieldErrors['form-ii-dob'] || fieldErrors['form-ii-age']
															? 'true'
															: undefined
													}
													aria-describedby={
														[
															'form-ii-dob-hint',
															fieldErrors['form-ii-dob'] || fieldErrors['form-ii-age']
																? 'form-ii-dob-error'
																: null,
														]
															.filter(Boolean)
															.join(' ') || undefined
													}
												/>
												{ageFromDob ? (
													<p className="form-iv-dob-age m-0" aria-live="polite">
														Age: <strong>{ageFromDob}</strong> years
													</p>
												) : null}
											</div>
										</Field>
									</div>
								</div>
							</FormSection>

							<FormSection
								step={2}
								tone="application"
								title="Matter"
								description="Choose what this application is about. Extra grounds open only when section 21(2) applies."
							>
								<p className="m-0 text-[12px] leading-snug text-slate-500">
									Tap the info (i) icon for the section of the Assam Tenancy Act, 2021 and a short
									explanation.
								</p>
								<fieldset id="form-ii-basis-group" className="m-0 min-w-0 border-0 p-0">
									<legend className="sr-only">Matter</legend>
									<div
										className="tenancy-field-full matter-accordion form-iv-matter form-ii-basis"
										role="radiogroup"
										aria-label="Matter"
										aria-invalid={fieldErrors['form-ii-basis'] ? 'true' : undefined}
										aria-describedby={
											fieldErrors['form-ii-basis'] ? 'form-ii-basis-error' : undefined
										}
									>
										{EVICTION_BASIS_OPTIONS.map((option) => {
											const selected = statutoryBasis === option.value
											const showGrounds =
												selected && option.value === EVICTION_BASIS.SECTION_21_2
											const hasFollowUp = option.value === EVICTION_BASIS.SECTION_21_2
											const infoTitle = `Assam Tenancy Act, 2021 — ${option.citation}`

											return (
												<div
													key={option.value}
													className={`matter-accordion__item${selected ? ' is-selected' : ''}${
														showGrounds ? ' is-open' : ''
													}`}
												>
													<label className="matter-accordion__header">
														<input
															type="radio"
															name="statutory_basis"
															value={option.value}
															checked={selected}
															onChange={() => selectBasis(option.value)}
														/>
														<span className="matter-accordion__copy">
															<span className="matter-accordion__title-row">
																<span className="matter-accordion__title">{option.label}</span>
																<FloatingInfoNote
																	label={`${infoTitle}: ${option.note}`}
																	iconSize={16}
																	className="matter-accordion__info"
																>
																	<strong>{infoTitle}</strong>
																	<span>{option.note}</span>
																</FloatingInfoNote>
															</span>
														</span>
														{hasFollowUp ? (
															<span className="matter-accordion__chevron" aria-hidden>
																{selected ? '▾' : '▸'}
															</span>
														) : null}
													</label>

													{showGrounds ? (
														<div
															className="matter-accordion__panel form-iv-services form-ii-grounds-panel"
															id="form-ii-eviction-grounds-group"
														>
															<p className="form-iv-followup-plain">
																Tick every ground under section 21(2) that you rely on.
																<span className="text-red-500" aria-hidden>
																	{' '}
																	*
																</span>
																<span className="sr-only"> (required)</span>
															</p>
															<div className="form-iv-service-card form-ii-grounds-card">
																<div className="form-iv-service-card__head">
																	<p className="form-iv-service-card__title">
																		Grounds under section 21(2)
																	</p>
																	<p className="form-iv-service-card__sub">
																		Select one or more — tap (i) for the Act wording
																	</p>
																</div>
																<div
																	className="form-iv-service-card__body"
																	role="group"
																	aria-label="Grounds under section 21(2)"
																	aria-invalid={
																		fieldErrors['form-ii-eviction-grounds']
																			? 'true'
																			: undefined
																	}
																	aria-describedby={
																		fieldErrors['form-ii-eviction-grounds']
																			? 'form-ii-eviction-grounds-error'
																			: undefined
																	}
																>
																	<div className="form-iv-col-list form-iv-col-list--services">
																		{splitIntoColumns(EVICTION_GROUND_CLAUSES).map(
																			(column, colIndex) => (
																				<div
																					key={colIndex}
																					className="form-iv-col-list__col"
																				>
																					{column.map((clause) => {
																						const checked = evictionGrounds.includes(
																							clause.value
																						)
																						const inputId = `form-ii-ground-${clause.value}`
																						return (
																							<label
																								key={clause.value}
																								htmlFor={inputId}
																								className={`matter-mini-check form-iv-repair-check form-ii-ground-check${
																									checked ? ' is-checked' : ''
																								}`}
																							>
																								<input
																									id={inputId}
																									type="checkbox"
																									value={clause.value}
																									checked={checked}
																									onChange={() =>
																										toggleGround(clause.value)
																									}
																								/>
																								<span className="form-iv-repair-check__code">
																									({clause.value})
																								</span>
																								<span className="form-ii-ground-check__copy">
																									<span className="form-iv-repair-check__text">
																										{clause.label}
																									</span>
																									<FloatingInfoNote
																										label={`${clause.citation}: ${clause.text}`}
																										iconSize={14}
																										className="form-ii-ground-check__info"
																									>
																										<strong>{clause.citation}</strong>
																										<span>{clause.text}</span>
																										{clause.explanation ? (
																											<span className="ground-choice__info-extra">
																												{clause.explanation}
																											</span>
																										) : null}
																									</FloatingInfoNote>
																								</span>
																							</label>
																						)
																					})}
																				</div>
																			)
																		)}
																	</div>
																</div>
															</div>
															{fieldErrors['form-ii-eviction-grounds'] ? (
																<p
																	id="form-ii-eviction-grounds-error"
																	className="m-0 mt-2 text-[12px] font-medium text-red-600"
																	role="alert"
																>
																	{fieldErrors['form-ii-eviction-grounds']}
																</p>
															) : null}
														</div>
													) : null}
												</div>
											)
										})}
									</div>
									{fieldErrors['form-ii-basis'] ? (
										<p
											id="form-ii-basis-error"
											className="m-0 mt-2 text-[12px] font-medium text-red-600"
											role="alert"
										>
											{fieldErrors['form-ii-basis']}
										</p>
									) : null}
								</fieldset>
							</FormSection>

							<FormSection
								step={3}
								tone="application"
								title="Case details"
								description="Fill each item in order. Leave optional items blank if they do not apply."
								contentClassName="form-iv-details"
							>
								<Field
									id="form-ii-particulars"
									label="Particulars of application"
									required
									para={1}
									hint="In one or two sentences, state what recovery of possession you are seeking."
									error={fieldErrors['form-ii-particulars'] || ''}
								>
									<InputShell className={textareaShellClass}>
										<textarea
											required
											value={particularsOfApplication}
											onChange={(e) => {
												clearFieldError('form-ii-particulars')
												setParticularsOfApplication(e.target.value)
											}}
											rows={3}
											placeholder="Example: Recovery of possession of the rented premises from the tenant…"
											className={textareaClass}
										/>
									</InputShell>
								</Field>

								<Field
									id="form-ii-jurisdiction"
									label="Jurisdiction of the Rent Court"
									required
									para={2}
									hint="Check the court below, then tick the declaration to confirm this is the correct Rent Court."
									error={fieldErrors['form-ii-jurisdiction'] || ''}
								>
									<div className="form-iv-jurisdiction form-ii-jurisdiction">
										<div className="form-ii-jurisdiction__fetched">
											<span className="form-ii-jurisdiction__fetched-label">
												Filing venue
												<span
													className="form-iv-from-uin-tag !normal-case"
													title="Filled from the loaded tenancy UIN"
												>
													{' '}
													(from UIN)
												</span>
											</span>
											<div className="form-i-field form-i-field--readonly form-i-field--multiline form-ii-jurisdiction__field">
												<span className="form-i-icon-gutter" aria-hidden>
													<Scale size={18} strokeWidth={2} />
												</span>
												<div
													className={`form-i-readonly-value m-0 min-w-0 flex-1 px-3.5 py-2.5 leading-relaxed ${
														courtJurisdictionName || beforeRentCourt || courtJurisdictionAddress
															? 'is-filled'
															: 'is-empty'
													}`}
												>
													<p className="form-ii-jurisdiction__fetched-name m-0">
														{courtJurisdictionName ||
															(beforeRentCourt
																? `Rent Court at ${beforeRentCourt}`
																: 'Rent Court')}
													</p>
													<p className="form-ii-jurisdiction__fetched-addr m-0">
														{courtJurisdictionAddress ||
															'Address will appear after you load a UIN.'}
													</p>
												</div>
											</div>
										</div>
										<label className="form-ii-jurisdiction__declare">
											<input
												id="form-ii-jurisdiction"
												type="checkbox"
												checked={jurisdictionAccepted}
												onChange={(e) => {
													clearFieldError('form-ii-jurisdiction')
													setJurisdictionAccepted(e.target.checked)
												}}
												required
												className="sr-only"
												aria-invalid={
													fieldErrors['form-ii-jurisdiction'] ? 'true' : undefined
												}
											/>
											<FormTick checked={jurisdictionAccepted} />
											<span className="form-ii-jurisdiction__declare-text">
												{declarationText(DECLARATION.FORM_II_JURISDICTION)}
											</span>
										</label>
									</div>
								</Field>

								<Field
									id="form-ii-facts"
									label="Facts of the case"
									required
									para={3}
									hint="Write what happened in date order. Prefer one fact or issue per short paragraph."
									error={fieldErrors['form-ii-facts'] || ''}
								>
									<InputShell className={textareaShellClass}>
										<textarea
											required
											value={factsOfCase}
											onChange={(e) => {
												clearFieldError('form-ii-facts')
												setFactsOfCase(e.target.value)
											}}
											rows={4}
											placeholder="Example: On … the tenancy began. Thereafter on … the tenant…"
											className={textareaClass}
										/>
									</InputShell>
								</Field>

								<Field
									id="form-ii-grounds-relief"
									label="Grounds for relief"
									required
									para={4}
									hint="Why should the Rent Court grant recovery of possession? Link to the grounds you selected above."
									error={fieldErrors['form-ii-grounds-relief'] || ''}
								>
									<InputShell className={textareaShellClass}>
										<textarea
											required
											value={groundsForRelief}
											onChange={(e) => {
												clearFieldError('form-ii-grounds-relief')
												setGroundsForRelief(e.target.value)
											}}
											rows={3}
											placeholder="Example: The tenant has not paid rent despite notice under section 21(2)…"
											className={textareaClass}
										/>
									</InputShell>
								</Field>

								<Field
									id="form-ii-prior"
									label="Earlier proceedings"
									required
									para={5}
									hint="Say whether any application, petition, writ petition or suit about this matter was filed before."
									error={fieldErrors['form-ii-prior'] || ''}
								>
									<PriorProceedingsField
										fieldId={DECLARATION.FORM_II_PRIOR_PROCEEDINGS}
										hint="If yes, add each case below. If no, choose the first option."
										hasPrior={hasPriorProceedings}
										onHasPriorChange={(value) => {
											clearFieldError('form-ii-prior')
											setHasPriorProceedings(value)
										}}
										entries={priorProceedings}
										onEntriesChange={(entries) => {
											clearFieldError('form-ii-prior')
											setPriorProceedings(entries)
										}}
										variant="modern"
									/>
								</Field>

								<Field
									id="form-ii-relief"
									label="Relief sought"
									required
									para={6}
									hint="State clearly the order you want from the Rent Court, and any legal provisions you rely on."
									error={fieldErrors['form-ii-relief'] || ''}
								>
									<InputShell className={textareaShellClass}>
										<textarea
											required
											value={reliefSought}
											onChange={(e) => {
												clearFieldError('form-ii-relief')
												setReliefSought(e.target.value)
											}}
											rows={3}
											placeholder="Example: That possession of the premises be restored to the applicant…"
											className={textareaClass}
										/>
									</InputShell>
								</Field>

								<Field
									id="form-ii-interim"
									label="Interim order sought"
									optional
									para={7}
									hint="Any temporary relief needed pending the final decision. Leave blank if not required."
									error={fieldErrors['form-ii-interim'] || ''}
								>
									<InputShell className={textareaShellClass}>
										<textarea
											value={interimOrderSought}
											onChange={(e) => {
												clearFieldError('form-ii-interim')
												setInterimOrderSoughtValue(e.target.value)
											}}
											rows={3}
											placeholder="Nature of the interim relief prayed for"
											className={textareaClass}
										/>
									</InputShell>
								</Field>

								<Field
									id="form-ii-enclosures"
									label="List of enclosures"
									optional
									para={8}
									hint="List affidavits or documents attached to this application. Leave blank if none."
									error={fieldErrors['form-ii-enclosures'] || ''}
								>
									<InputShell className={textareaShellClass}>
										<textarea
											value={enclosuresList}
											onChange={(e) => {
												clearFieldError('form-ii-enclosures')
												setEnclosuresListValue(e.target.value)
											}}
											rows={4}
											placeholder="List documents attached, one per line"
											className={textareaClass}
										/>
									</InputShell>
								</Field>

								<LegalAdvicePartPicker
									options={requiredVerificationParas}
									selectedNumbers={legalAdviceParaNumbers}
									onToggle={(number) => {
										clearFieldError('form-ii-legal-advice')
										toggleLegalAdvicePara(number)
									}}
									error={fieldErrors['form-ii-legal-advice'] || ''}
								/>
							</FormSection>

							<FormSection
								step={4}
								tone="signature"
								title="Declaration and signature"
								description="Accept the undertaking and upload your signature to complete the filing."
							>
								<div className="form-iv-verify" id="form-ii-undertaking-group">
									<div className="flex flex-col gap-1.5">
										<div className="flex flex-row flex-wrap items-baseline gap-x-1.5 text-[14px] font-semibold text-[#151717]">
											<label htmlFor="form-ii-undertaking" className="m-0 cursor-pointer">
												Undertaking
											</label>
											<span className="text-red-500" aria-hidden>
												*
											</span>
											<span className="sr-only">(required)</span>
										</div>
										<label
											htmlFor="form-ii-undertaking"
											className={`sf-undertaking-box${
												verificationUndertakingAccepted ? ' is-checked' : ''
											}${fieldErrors['form-ii-undertaking'] ? ' is-error' : ''}`}
										>
											<input
												id="form-ii-undertaking"
												type="checkbox"
												checked={verificationUndertakingAccepted}
												onChange={(e) => {
													clearFieldError('form-ii-undertaking')
													setVerificationUndertakingAccepted(e.target.checked)
												}}
												required
												className="sr-only"
												aria-invalid={fieldErrors['form-ii-undertaking'] ? 'true' : undefined}
												aria-describedby={
													fieldErrors['form-ii-undertaking']
														? 'form-ii-undertaking-error'
														: undefined
												}
											/>
											<FormTick checked={verificationUndertakingAccepted} />
											<span className="min-w-0 text-sm leading-relaxed text-slate-800">
												I hereby declare that I have not suppressed any material facts.
											</span>
										</label>
										{fieldErrors['form-ii-undertaking'] ? (
											<p
												id="form-ii-undertaking-error"
												className="m-0 text-[12px] font-medium text-red-600"
												role="alert"
											>
												{fieldErrors['form-ii-undertaking']}
											</p>
										) : null}
									</div>

									<Field
										id="form-ii-signature"
										label="Signature image"
										required
										hint="JPG, JPEG or PNG. Recommended: at least 300 × 100 px, max 2 MB."
										error={fieldErrors['form-ii-signature'] || ''}
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
													{signatureImage ? 'Signature selected' : 'No image chosen'}
												</span>
												<input
													id="form-ii-signature"
													type="file"
													accept=".jpg,.jpeg,.png,image/jpeg,image/png"
													required={!signatureImage}
													className="sr-only"
													aria-invalid={fieldErrors['form-ii-signature'] ? 'true' : undefined}
													aria-describedby={
														[
															'form-ii-signature-hint',
															fieldErrors['form-ii-signature']
																? 'form-ii-signature-error'
																: null,
														]
															.filter(Boolean)
															.join(' ') || undefined
													}
													onChange={(e) => {
														const file = e.target.files?.[0] || null
														if (file && file.size > 2 * 1024 * 1024) {
															reportError('Signature image must be 2 MB or smaller.')
															e.target.value = ''
															setSignatureImage(null)
															return
														}
														clearFieldError('form-ii-signature')
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
													onClick={() => {
														clearSignatureImage()
														clearFieldError('form-ii-signature')
													}}
													className="form-iv-signature-preview__remove"
												>
													Remove
												</button>
											</div>
										) : null}
									</Field>
								</div>
							</FormSection>
							</div>
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
				title="FORM-II"
				subtitle="Application before the Rent Court for recovery of possession — Rule 7"
				variant="legal"
				legalDocument={
					<FormIILegalDocument
						tenancyUIN={tenancyUIN}
						beforeRentCourt={beforeRentCourt}
						courtLine1={courtJurisdictionName}
						courtLine2={courtJurisdictionAddress}
						applicantName={applicantName}
						applicantResidentialAddress={applicantResidentialAddress}
						tenantName={tenantName}
						premisesSituatedAt={premisesSituatedAt}
						statutoryBasis={statutoryBasis}
						evictionGrounds={evictionGrounds}
						particularsOfApplication={particularsOfApplication}
						jurisdictionAccepted={jurisdictionAccepted}
						factsOfCase={factsOfCase}
						groundsForRelief={groundsForRelief}
						hasPriorProceedings={hasPriorProceedings}
						priorProceedings={priorProceedings}
						reliefSought={reliefSought}
						interimOrderSought={interimOrderSought}
						listOfEnclosures={enclosuresList}
						verification={verificationForPreview}
						signatureName={effectiveSignatureName}
						signatureImage={signatureImage}
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
