import { useCallback, useEffect, useMemo, useRef, useState, Children, cloneElement, isValidElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Building2, Check, IdCard, Info, MapPin, Scale, Upload, User } from 'lucide-react'
import api, { csrf } from '../api'
import TenancyUinLookup from './forms/TenancyUinLookup'
import ServiceFormPreviewModal from './forms/ServiceFormPreviewModal'
import FormIVLegalDocument from './forms/FormIVLegalDocument'
import FormDatePicker from './forms/FormDatePicker'
import PriorProceedingsField from './forms/PriorProceedingsField'
import { useServiceFormPreview } from '../hooks/useServiceFormPreview'
import { ageOn, profileDefaults, toDateInputValue } from '../utils/profileAutofill'
import { APPLICATION_TYPES } from '../constants/application'
import { PRIOR_STATUS } from '../constants/priorProceedings'
import {
	DECLARATION,
	PARA_ANSWER,
	VERIFICATION,
	declarationText,
	verificationParagraphs,
} from '../constants/declarations'

/** UI labels in full words; values stay as Gazette S/o. / W/o. / D/o. for the API. */
const VERIFICATION_RELATION_OPTIONS = [
	{ value: 'S/o.', label: 'Son' },
	{ value: 'D/o.', label: 'Daughter' },
	{ value: 'W/o.', label: 'Spouse' },
]
import {
	ESSENTIAL_SERVICES,
	RA_MATTER,
	RA_MATTER_OPTIONS,
	REPAIR_PARTS,
	SERVICE_OTHER,
} from '../constants/rentAuthorityMatters'
import { completeServiceFormSubmit, getServiceFormSuccessMessage } from '../utils/serviceFormSubmit'
import { applyTenancyAutofill, formatRentAuthorityAddressee } from '../utils/tenancyUinAutofill'
import { useToast } from '../context/ToastContext'

const inputClass =
	'h-full w-full border-0 bg-transparent px-3.5 text-[15px] text-[#151717] outline-none placeholder:text-slate-400'
const inputShellClass = 'form-i-field'
const textareaShellClass = 'form-i-field form-i-field--multiline'

function dobInputMax() {
	const today = new Date()
	const year = today.getFullYear()
	const month = String(today.getMonth() + 1).padStart(2, '0')
	const day = String(today.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

function FormCard({ title, description, badge, children }) {
	return (
		<section className="rounded-[20px] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
			<div className="overflow-hidden rounded-t-[20px] border-b border-[#ddd6fe] bg-[#ede9fe] px-[30px] py-5 text-center">
				{badge ? (
					<span className="mb-2 inline-flex rounded-md bg-white/70 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-[#6d28d9]">
						{badge}
					</span>
				) : null}
				<h1 className="m-0 text-[1.5rem] font-semibold leading-snug text-[#6d28d9]">{title}</h1>
				{description ? (
					<p className="mx-auto mt-1.5 mb-0 max-w-2xl text-sm leading-relaxed text-[#6d5a9c]">
						{description}
					</p>
				) : null}
			</div>
			<div className="flex flex-col gap-3.5 p-[22px] sm:p-[26px]">{children}</div>
		</section>
	)
}

const sectionToneClass = {
	record: 'rounded-2xl border border-[#cbd5e1] bg-[#f8fafc] px-4 py-4 sm:px-5',
	application: 'rounded-2xl border border-[#cbd5e1] bg-[#f8fafc] px-4 py-4 sm:px-5',
	signature: 'rounded-2xl border border-[#cbd5e1] bg-[#f8fafc] px-4 py-4 sm:px-5',
	default: '',
}

function FormTopBar({ onBack, disabled = false }) {
	return (
		<div className="form-iv-topbar">
			<button
				type="button"
				onClick={onBack}
				disabled={disabled}
				className="form-iv-back-btn"
			>
				<ArrowLeft size={18} strokeWidth={2.25} aria-hidden />
				Back
			</button>
		</div>
	)
}

function injectControlA11y(children, a11y) {
	return Children.map(children, (child) => {
		if (!isValidElement(child)) return child
		const type = child.type
		const isControl =
			type === 'input' || type === 'textarea' || type === 'select'
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
	contentClassName = 'flex flex-col gap-3.5',
	children,
}) {
	const toneClass = sectionToneClass[tone] || sectionToneClass.default
	const sectionId = step ? `form-iv-section-${step}` : undefined
	return (
		<div className={toneClass || undefined} id={sectionId}>
			<div className="mb-3.5">
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
								{step ? <span className="sr-only">Section {step}. </span> : null}
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
						<span
							className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-[#ddd6fe] bg-[#ede9fe] px-1.5 text-[12px] font-bold text-[#6d28d9]"
							aria-hidden
						>
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
					{optional ? (
						<span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
							Optional
						</span>
					) : null}
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

function FormTick({ checked, className = 'mt-0.5' }) {
	return (
		<span
			className={`inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border-[1.5px] transition ${className} ${
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

/**
 * Unticked parts are treated as the applicant's own knowledge automatically.
 * Tick only the parts based on legal advice.
 */
const FORM_IV_PART_SHORT = {
	1: 'Particulars of the violation',
	3: 'Facts of the case',
	4: 'Grounds for relief',
	5: 'Earlier proceedings',
	6: 'Relief sought',
	7: 'Interim order sought',
	8: 'List of enclosures',
}

function partLabel(option) {
	return FORM_IV_PART_SHORT[option.number] || option.heading || `Part ${option.number}`
}

function LegalAdvicePartPicker({ options, selectedNumbers, onToggle, error = '' }) {
	const errorId = error ? 'form-iv-legal-advice-error' : undefined
	return (
		<fieldset
			className="form-iv-detail-item form-iv-legal-advice form-iv-optional-gate m-0 flex min-w-0 flex-col border-0"
			id="form-iv-legal-advice-group"
		>
			<legend className="m-0 w-full min-w-0 px-0">
				<span className="flex flex-wrap items-center gap-2 text-[15px] font-semibold text-[#6d28d9]">
					<span
						className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#ddd6fe] bg-[#ede9fe] text-[#6d28d9]"
						aria-hidden
					>
						<Scale size={15} strokeWidth={2.25} />
					</span>
					Based on legal advice
					<span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
						Optional
					</span>
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
					const inputId = `form-iv-legal-advice-${option.number}`
					return (
						<li key={option.number} className="min-w-0">
							<label
								htmlFor={inputId}
								className="!m-0 !flex cursor-pointer items-center gap-2.5"
							>
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

function ReadOnlyField({
	label,
	value,
	empty = '—',
	icon: Icon,
	variant = 'default',
	action = null,
	multiline = false,
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

const btnPrimary =
	'inline-flex h-[50px] items-center justify-center rounded-[10px] border-0 bg-[#6d28d9] px-5 text-[15px] font-medium text-white transition hover:bg-[#5b21b6] disabled:cursor-not-allowed disabled:opacity-60'

/** Split into two columns so numbering reads down the left column, then the right. */
function splitIntoColumns(items) {
	const mid = Math.ceil(items.length / 2)
	return [items.slice(0, mid), items.slice(mid)]
}

function ColumnCheckList({
	items,
	isChecked,
	onToggle,
	getKey,
	getLabel,
	toneClass = '',
}) {
	const columns = splitIntoColumns(items)
	let number = 0
	return (
		<div className={`form-iv-col-list ${toneClass}`.trim()}>
			{columns.map((column, colIndex) => (
				<div key={colIndex} className="form-iv-col-list__col">
					{column.map((item) => {
						number += 1
						const currentNumber = number
						const key = getKey(item)
						const checked = isChecked(key)
						return (
							<label
								key={key}
								className={`matter-mini-check form-iv-repair-check${checked ? ' is-checked' : ''}`}
							>
								<input
									type="checkbox"
									value={key}
									checked={checked}
									onChange={() => onToggle(key)}
								/>
								<span className="form-iv-repair-check__code">{currentNumber}.</span>
								<span className="form-iv-repair-check__text">{getLabel(item)}</span>
							</label>
						)
					})}
				</div>
			))}
		</div>
	)
}

export default function Form6RentAuthorityFilingPanel({ onBack, serviceMeta, user }) {
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
				document.querySelector(`#${fieldId}-group input, #${fieldId}-group textarea, #${fieldId}-group button`)
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

	const [tenancyUIN, setTenancyUIN] = useState('')
	const profile = useMemo(() => profileDefaults(user), [user])

	const [applicantName, setApplicantName] = useState(profile.name)
	const [applicantResidentialAddress, setApplicantResidentialAddress] = useState(profile.address)
	const [oppositePartyName, setOppositePartyName] = useState('')
	const [oppositePartyResidentialAddress, setOppositePartyResidentialAddress] = useState('')

	const [statutoryMatter, setStatutoryMatter] = useState(RA_MATTER.SECTION_10)
	const [repairItems, setRepairItems] = useState([])
	const [essentialServices, setEssentialServices] = useState([])
	const [essentialServiceOther, setEssentialServiceOther] = useState('')

	const [particularsOfViolation, setParticularsOfViolation] = useState('')
	const [jurisdictionAccepted, setJurisdictionAccepted] = useState(false)
	const [factsOfCase, setFactsOfCase] = useState('')
	const [groundsForRelief, setGroundsForRelief] = useState('')
	const [hasPriorProceedings, setHasPriorProceedings] = useState(null)
	const [priorProceedings, setPriorProceedings] = useState([])
	const [reliefSought, setReliefSought] = useState('')
	const [interimOrderSought, setInterimOrderSought] = useState('')
	const [listOfEnclosures, setListOfEnclosures] = useState('')
	const [signatureImage, setSignatureImage] = useState(null)
	const [recordLoaded, setRecordLoaded] = useState(false)
	const [authorityLine1, setAuthorityLine1] = useState('')
	const [authorityLine2, setAuthorityLine2] = useState('')
	const [tenancyDistrict, setTenancyDistrict] = useState('')
	const [tenancyOffice, setTenancyOffice] = useState('')
	const [verificationDob, setVerificationDob] = useState(() => toDateInputValue(profile.dateOfBirth))
	const [verificationUndertakingAccepted, setVerificationUndertakingAccepted] = useState(false)
	const matterFollowUpRef = useRef(null)

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

	const setListOfEnclosuresValue = useCallback((value) => {
		setListOfEnclosures(value)
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
			Object.entries(verificationParagraphs(VERIFICATION.FORM_IV)).map(([number, heading]) => ({
				number: Number(number),
				heading,
			})),
		[]
	)

	const requiredVerificationParas = verificationParaOptions

	/** Unmarked paras default to personal knowledge; only legal-advice taps are stored. */
	const resolvedVerificationParagraphs = useMemo(() => {
		const paragraphs = {}
		requiredVerificationParas.forEach((option) => {
			paragraphs[option.number] =
				verification.paragraphs?.[option.number] === PARA_ANSWER.LEGAL_ADVICE
					? PARA_ANSWER.LEGAL_ADVICE
					: PARA_ANSWER.PERSONAL_KNOWLEDGE
		})
		return paragraphs
	}, [requiredVerificationParas, verification.paragraphs])

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

	const clearTenancyRecord = useCallback(() => {
		setRecordLoaded(false)
		setApplicantName(profile.name)
		setApplicantResidentialAddress(profile.address)
		setOppositePartyName('')
		setOppositePartyResidentialAddress('')
		setSignatureImage(null)
		setVerificationUndertakingAccepted(false)
		setInterimOrderSought('')
		setListOfEnclosures('')
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
		setAuthorityLine1('')
		setAuthorityLine2('')
		setTenancyDistrict('')
		setTenancyOffice('')
		setError('')
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
			const { data } = await api.post('/api/rent-authority-filing-applications', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})
			return data
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['citizen-applications'] })
			queryClient.invalidateQueries({ queryKey: ['admin-applications'] })
			completeServiceFormSubmit(
				navigate,
				getServiceFormSuccessMessage(data, 'Form IV submitted successfully.')
			)
		},
		onError: (err) => {
			const msg =
				err?.response?.data?.message ||
				(err?.response?.data?.errors
					? Object.values(err.response.data.errors).flat().join('. ')
					: 'Failed to submit Form IV')
			reportError(msg)
		},
	})

	const isRepairs = statutoryMatter === RA_MATTER.SECTION_15
	const isServices = statutoryMatter === RA_MATTER.SECTION_20
	const otherServiceChosen = isServices && essentialServices.includes(SERVICE_OTHER)

	const toggleRepairItem = useCallback((code) => {
		clearFieldError('form-iv-matter')
		setRepairItems((current) =>
			current.includes(code) ? current.filter((c) => c !== code) : [...current, code]
		)
	}, [clearFieldError])

	const toggleService = useCallback((code) => {
		clearFieldError('form-iv-matter')
		setEssentialServices((current) =>
			current.includes(code) ? current.filter((c) => c !== code) : [...current, code]
		)
	}, [clearFieldError])

	const selectMatter = useCallback((value) => {
		setStatutoryMatter(value)
		setFieldErrors((current) => {
			if (!current['form-iv-matter'] && !current['form-iv-service-other']) return current
			const next = { ...current }
			delete next['form-iv-matter']
			delete next['form-iv-service-other']
			return next
		})
		if (value !== RA_MATTER.SECTION_15) setRepairItems([])
		if (value !== RA_MATTER.SECTION_20) {
			setEssentialServices([])
			setEssentialServiceOther('')
		}
		if (value === RA_MATTER.SECTION_15 || value === RA_MATTER.SECTION_20) {
			window.setTimeout(() => {
				matterFollowUpRef.current?.scrollIntoView({
					behavior: 'smooth',
					block: 'start',
				})
			}, 60)
		}
	}, [])

	const submit = useCallback(async () => {
		setError('')
		const nextErrors = {}
		const fail = (fieldId, message) => {
			if (!nextErrors[fieldId]) nextErrors[fieldId] = message
		}

		if (!recordLoaded) {
			reportError('Enter your Tenancy UIN and load the tenancy record before submitting Form IV.')
			return false
		}
		if (!applicantName.trim() || !applicantResidentialAddress.trim()) {
			fail('form-iv-applicant', 'Applicant name and address are required.')
		}
		if (!oppositePartyName.trim() || !oppositePartyResidentialAddress.trim()) {
			fail('form-iv-opposite', 'Opposite party name and address are required.')
		}
		if (!verification.relativeName.trim()) {
			fail('form-iv-relative-name', 'Enter the father / mother / spouse name.')
		}
		if (!verification.relation) {
			fail('form-iv-relation', 'Select the relation.')
		}
		if (!verificationDob || !String(verification.age || ageFromDob || '').trim()) {
			fail(
				'form-iv-dob',
				'Enter the applicant’s date of birth so age can be calculated.'
			)
		}
		if (isRepairs && repairItems.length === 0) {
			fail('form-iv-matter', 'Select the Second Schedule item or items in dispute.')
		}
		if (isServices && essentialServices.length === 0) {
			fail('form-iv-matter', 'Select the essential supply or service that has been withheld.')
		}
		if (otherServiceChosen && !essentialServiceOther.trim()) {
			fail('form-iv-service-other', 'Describe the other essential service that has been withheld.')
		}
		if (!particularsOfViolation.trim()) {
			fail('form-iv-particulars', 'Enter the particulars of the violation.')
		}
		if (!jurisdictionAccepted) {
			fail(
				'form-iv-jurisdiction',
				'Confirm that the matter falls within the jurisdiction of this Rent Authority.'
			)
		}
		if (!factsOfCase.trim()) {
			fail('form-iv-facts', 'Enter the facts of the case.')
		}
		if (!groundsForRelief.trim()) {
			fail('form-iv-grounds', 'Enter the grounds for relief.')
		}
		if (hasPriorProceedings === null) {
			fail('form-iv-prior', 'State whether you have previously filed regarding this matter.')
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
					'form-iv-prior',
					'Give the case number, the court or authority, and the pendency or decision for every earlier case disclosed.'
				)
			}
		}
		if (!reliefSought.trim()) {
			fail('form-iv-relief', 'Enter the relief sought.')
		}
		if (!verifierName || !verification.relativeName.trim() || !verifierAddress) {
			fail('form-iv-relative-name', 'Complete the verification particulars (name, relation target and address).')
		}
		if (!verification.place.trim()) {
			fail(
				'form-iv-applicant',
				'This UIN has no district on record. Place of filing cannot be set automatically.'
			)
		}
		const allOnLegalAdvice =
			requiredVerificationParas.length > 0 &&
			requiredVerificationParas.every(
				(option) =>
					resolvedVerificationParagraphs[option.number] === PARA_ANSWER.LEGAL_ADVICE
			)
		if (allOnLegalAdvice) {
			fail(
				'form-iv-legal-advice',
				'At least one part of the application must remain based on your own knowledge. Leave at least one item unticked under Based on legal advice.'
			)
		}
		if (!verificationUndertakingAccepted) {
			fail('form-iv-undertaking', 'Accept the verification undertaking before filing.')
		}
		if (!effectiveSignatureName) {
			fail('form-iv-undertaking', 'Enter the name against the signature.')
		}
		if (!signatureImage) {
			fail('form-iv-signature', 'Upload your signature image.')
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
			formData.append('tenancy_uin', tenancyUIN.trim())
			formData.append('applicant_name', applicantName.trim())
			formData.append('applicant_residential_address', applicantResidentialAddress.trim())
			formData.append('opposite_party_name', oppositePartyName.trim())
			formData.append('opposite_party_residential_address', oppositePartyResidentialAddress.trim())
			formData.append('statutory_matter', statutoryMatter)
			if (isRepairs) {
				repairItems.forEach((code) => formData.append('repair_items[]', code))
			}
			if (isServices) {
				essentialServices.forEach((code) => formData.append('essential_services[]', code))
				if (otherServiceChosen) {
					formData.append('essential_service_other', essentialServiceOther.trim())
				}
			}
			formData.append('particulars_of_violation', particularsOfViolation.trim())
			formData.append('jurisdiction_declaration_accepted', '1')
			formData.append('facts_of_case', factsOfCase.trim())
			formData.append('grounds_for_relief', groundsForRelief.trim())
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
			formData.append('relief_sought', reliefSought.trim())
			if (interimOrderSought.trim()) {
				formData.append('interim_order_sought', interimOrderSought.trim())
			}
			if (listOfEnclosures.trim()) {
				formData.append('list_of_enclosures', listOfEnclosures.trim())
			}

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
		applicantName,
		applicantResidentialAddress,
		essentialServiceOther,
		essentialServices,
		factsOfCase,
		groundsForRelief,
		hasPriorProceedings,
		interimOrderSought,
		isRepairs,
		isServices,
		jurisdictionAccepted,
		listOfEnclosures,
		mutation,
		oppositePartyName,
		oppositePartyResidentialAddress,
		otherServiceChosen,
		particularsOfViolation,
		priorProceedings,
		recordLoaded,
		reliefSought,
		repairItems,
		reportError,
		focusFormControl,
		resolvedVerificationParagraphs,
		requiredVerificationParas,
		signatureImage,
		effectiveSignatureName,
		statutoryMatter,
		tenancyUIN,
		verification,
		verificationUndertakingAccepted,
		verifierAddress,
		verifierName,
		ageFromDob,
		verificationDob,
	])

	const { previewOpen, requestPreview, closePreview, confirmSubmit } = useServiceFormPreview(submit)

	const handleTenancyLoaded = (tenancy) => {
		const filled = applyTenancyAutofill(APPLICATION_TYPES.RENT_AUTHORITY_FILING, tenancy, user, {
			setTenancyUIN,
			setApplicantName,
			setApplicantResidentialAddress,
			setOppositePartyName,
			setOppositePartyResidentialAddress,
		})
		const authority = formatRentAuthorityAddressee(tenancy)
		setAuthorityLine1(authority.line1)
		setAuthorityLine2(authority.line2)
		const selfName = String(
			user?.profile_type?.toUpperCase() === 'TENANT' ? tenancy.tenant_name : tenancy.landlord_name || ''
		).trim()
		const selfAddress = String(
			user?.profile_type?.toUpperCase() === 'TENANT'
				? tenancy.tenant_address
				: tenancy.landlord_address || ''
		).trim()
		const districtName = String(
			tenancy.district?.name || tenancy.office?.district?.name || ''
		).trim()
		const officeName = String(tenancy.office?.name || '').trim()
		setTenancyDistrict(districtName)
		setTenancyOffice(officeName)
		const profileDob = toDateInputValue(profile.dateOfBirth || user?.date_of_birth)
		const nextDob = verificationDob || profileDob
		if (!verificationDob && profileDob) {
			setVerificationDob(profileDob)
		}
		setVerification((current) => {
			const nextAge = String(ageOn(nextDob) || current.age || profile.age || '').trim()
			return {
				...current,
				name: selfName || current.name || profile.name,
				address: selfAddress || current.address || profile.address,
				age: nextAge,
				place: districtName || current.place,
				paragraphs: {},
			}
		})
		setVerificationUndertakingAccepted(false)
		setInterimOrderSought('')
		setListOfEnclosures('')
		setRecordLoaded(true)
		setError('')
		return filled
	}

	const formTitle = serviceMeta?.label || 'Form IV — Matters under Rule 11'
	const formBadge = serviceMeta?.groupTitle || 'Rent Authority'
	const formLead = serviceMeta
		? `${serviceMeta.matter || 'Application before the Rent Authority'}${serviceMeta.rule ? ` (${serviceMeta.rule})` : ''}`
		: 'Application under sections 10, 14, 15 and 20 (Rule 11(1))'

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
						<FormCard title={formTitle} description={formLead} badge={formBadge}>
							<FormSection
								step={1}
								tone="application"
								title="Identify the tenancy"
								description="Enter the Unique Identification Number issued by the Rent Authority. Form IV can be filed only after the tenancy record is loaded."
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
					</>
				) : (
					<>
						<FormTopBar onBack={onBack} disabled={submitting} />
						<FormCard title={formTitle} description={formLead} badge={formBadge}>
							<div className="form-iv-main">
							<FormSection
								step={1}
								tone="record"
								title="Applicant details"
								description="Parties and district come from your UIN. Age is calculated from your profile date of birth."
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
								<div className="grid gap-3 sm:grid-cols-2">
									<ReadOnlyField label="A. Applicant name" value={applicantName} icon={User} fromUin />
									<ReadOnlyField label="B. Opposite party name" value={oppositePartyName} icon={User} fromUin />
									<ReadOnlyField
										label="Applicant residential address"
										value={applicantResidentialAddress}
										icon={MapPin}
										multiline
										fromUin
									/>
									<ReadOnlyField
										label="Opposite party residential address"
										value={oppositePartyResidentialAddress}
										icon={MapPin}
										multiline
										fromUin
									/>
									<ReadOnlyField
										label="District / place of filing"
										value={tenancyDistrict || verification.place}
										icon={MapPin}
										empty="Not on record"
										fromUin
									/>
									<ReadOnlyField
										label="Rent Authority office"
										value={tenancyOffice}
										icon={Building2}
										empty="Not on record"
										fromUin
									/>
								</div>

								<div className="form-iv-applicant-extras">
									<div className="form-iv-applicant-extras__grid">
										<Field
											id="form-iv-relative-name"
											label="Applicant's father/mother/spouse name"
											required
											hint="Person you are Son, Daughter or Spouse of"
											error={fieldErrors['form-iv-relative-name'] || ''}
										>
											<InputShell icon={User} className={`${inputShellClass} form-iv-relative-name-input`}>
												<input
													type="text"
													value={verification.relativeName}
													onChange={(e) => {
														clearFieldError('form-iv-relative-name')
														setVerificationField('relativeName', e.target.value)
													}}
													required
													placeholder="Full name"
													className={inputClass}
												/>
											</InputShell>
										</Field>

										<fieldset
											id="form-iv-relation-group"
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
																name="verification_relation_iv"
																value={option.value}
																checked={selected}
																onChange={() => {
																	clearFieldError('form-iv-relation')
																	setVerificationField('relation', option.value)
																}}
																className="sr-only"
															/>
															<span>{option.label}</span>
														</label>
													)
												})}
											</div>
											{fieldErrors['form-iv-relation'] ? (
												<p className="m-0 text-[12px] font-medium text-red-600" role="alert">
													{fieldErrors['form-iv-relation']}
												</p>
											) : null}
										</fieldset>

										<Field
											id="form-iv-dob"
											label="Applicant's date of birth"
											required
											hint="Age is calculated automatically"
											error={fieldErrors['form-iv-dob'] || fieldErrors['form-iv-age'] || ''}
										>
											<div className="form-iv-dob-field">
												<FormDatePicker
													id="form-iv-dob"
													value={verificationDob}
													onChange={(next) => {
														clearFieldError('form-iv-dob')
														clearFieldError('form-iv-age')
														applyDob(next)
													}}
													required
													max={dobInputMax()}
													placeholder="DD-MM-YYYY"
													className="form-iv-dob-input"
													aria-invalid={
														fieldErrors['form-iv-dob'] || fieldErrors['form-iv-age']
															? 'true'
															: undefined
													}
													aria-describedby={
														[
															'form-iv-dob-hint',
															fieldErrors['form-iv-dob'] || fieldErrors['form-iv-age']
																? 'form-iv-dob-error'
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
								description="Choose what this application is about. Extra questions open only when needed."
							>
								<p className="m-0 text-[12px] leading-snug text-slate-500">
									Tap the info (i) icon for the section of the Assam Tenancy Act, 2021 and a short explanation.
								</p>
								<fieldset
									id="form-iv-matter-group"
									className="m-0 min-w-0 border-0 p-0"
								>
									<legend className="sr-only">Matter</legend>
								<div
									className="tenancy-field-full matter-accordion form-iv-matter"
									role="radiogroup"
									aria-label="Matter"
									aria-invalid={fieldErrors['form-iv-matter'] ? 'true' : undefined}
									aria-describedby={
										fieldErrors['form-iv-matter'] ? 'form-iv-matter-error' : undefined
									}
								>
									{RA_MATTER_OPTIONS.map((option) => {
										const selected = statutoryMatter === option.value
										const showRepairs = selected && option.value === RA_MATTER.SECTION_15
										const showServices = selected && option.value === RA_MATTER.SECTION_20
										const hasFollowUp =
											option.value === RA_MATTER.SECTION_15 ||
											option.value === RA_MATTER.SECTION_20
										const infoTitle = `Assam Tenancy Act, 2021 — ${option.citation}`

										return (
											<div
												key={option.value}
												ref={
													selected &&
													(option.value === RA_MATTER.SECTION_15 ||
														option.value === RA_MATTER.SECTION_20)
														? matterFollowUpRef
														: undefined
												}
												className={`matter-accordion__item${selected ? ' is-selected' : ''}${
													showRepairs || showServices ? ' is-open' : ''
												}`}
											>
												<label className="matter-accordion__header">
													<input
														type="radio"
														name="statutory_matter"
														value={option.value}
														checked={selected}
														onChange={() => selectMatter(option.value)}
													/>
													<span className="matter-accordion__copy">
														<span className="matter-accordion__title-row">
															<span className="matter-accordion__title">{option.heading}</span>
															<span
																className="ground-choice__info-container matter-accordion__info"
																role="note"
																tabIndex={0}
																aria-label={`${infoTitle}: ${option.note}`}
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
																	<strong>{infoTitle}</strong>
																	<span>{option.note}</span>
																</span>
															</span>
														</span>
													</span>
													{hasFollowUp ? (
														<span className="matter-accordion__chevron" aria-hidden>
															{selected ? '▾' : '▸'}
														</span>
													) : null}
												</label>

												{showRepairs ? (
													<div className="matter-accordion__panel form-iv-repairs">
														<p className="form-iv-followup-plain">
															Tick every repair item in dispute. Part A — landlord duties; Part B —
															tenant periodic repairs (unless the agreement says otherwise).
														</p>
														<div className="form-iv-repair-parts">
															{REPAIR_PARTS.map((part) => (
																<div key={part.part} className="form-iv-repair-part">
																	<div className="form-iv-repair-part__head">
																		<p className="form-iv-repair-part__title">
																			Part {part.part} —{' '}
																			{part.part === 'A'
																				? 'Responsibilities of the Landlord'
																				: 'Periodic repairs by the Tenant'}
																		</p>
																		<p className="form-iv-repair-part__sub">Second Schedule</p>
																	</div>
																	<div className="form-iv-repair-part__list">
																		<ColumnCheckList
																			items={part.items}
																			getKey={(item) => item.code}
																			getLabel={(item) => item.text}
																			isChecked={(code) => repairItems.includes(code)}
																			onToggle={toggleRepairItem}
																		/>
																	</div>
																</div>
															))}
														</div>
													</div>
												) : null}

												{showServices ? (
													<div className="matter-accordion__panel form-iv-services">
														<p className="form-iv-followup-plain">
															Tick every essential supply or service that was cut off or withheld. Use
															Other if it is not listed.
														</p>
														<div className="form-iv-service-card">
															<div className="form-iv-service-card__head">
																<p className="form-iv-service-card__title">
																	Essential supplies and services (Section 20)
																</p>
																<p className="form-iv-service-card__sub">
																	Explanation to section 20 — select one or more
																</p>
															</div>
															<div className="form-iv-service-card__body">
																<ColumnCheckList
																	items={ESSENTIAL_SERVICES}
																	getKey={(service) => service.code}
																	getLabel={(service) => service.label}
																	isChecked={(code) => essentialServices.includes(code)}
																	onToggle={toggleService}
																	toneClass="form-iv-col-list--services"
																/>
															</div>
														</div>
														{otherServiceChosen ? (
															<div className="form-iv-service-other">
																<Field
																	id="form-iv-service-other"
																	label="Describe the other essential service"
																	required
																	error={fieldErrors['form-iv-service-other'] || ''}
																>
																	<InputShell>
																		<input
																			required
																			type="text"
																			value={essentialServiceOther}
																			onChange={(e) => {
																				clearFieldError('form-iv-service-other')
																				setEssentialServiceOther(e.target.value)
																			}}
																			maxLength={255}
																			placeholder="Name the other essential service"
																			className={inputClass}
																		/>
																	</InputShell>
																</Field>
															</div>
														) : null}
													</div>
												) : null}
											</div>
										)
									})}
								</div>
								{fieldErrors['form-iv-matter'] ? (
									<p
										id="form-iv-matter-error"
										className="m-0 mt-2 text-[12px] font-medium text-red-600"
										role="alert"
									>
										{fieldErrors['form-iv-matter']}
									</p>
								) : null}
								</fieldset>
							</FormSection>

							<FormSection
								step={3}
								tone="application"
								title="Case details"
								description="Complete each item in Gazette order. Optional items may be left blank."
								contentClassName="form-iv-details"
							>
									<Field
										id="form-iv-particulars"
										label="Particulars of the violation"
										required
										para={1}
										hint="State briefly the dispute or violation against which this application is made."
										error={fieldErrors['form-iv-particulars'] || ''}
									>
										<InputShell className={textareaShellClass}>
											<textarea
												required
												value={particularsOfViolation}
												onChange={(e) => {
													clearFieldError('form-iv-particulars')
													setParticularsOfViolation(e.target.value)
												}}
												rows={3}
												placeholder="Example: Unilateral revision of rent without agreement…"
												className="h-full w-full resize-y border-0 bg-transparent px-3.5 py-2.5 text-[15px] text-[#151717] outline-none placeholder:text-slate-400"
											/>
										</InputShell>
									</Field>

									<Field
										id="form-iv-jurisdiction"
										label="Jurisdiction of the Rent Authority"
										required
										para={2}
										hint="Confirm that this application is filed before the correct Rent Authority."
										error={fieldErrors['form-iv-jurisdiction'] || ''}
									>
										<label className="!m-0 !flex cursor-pointer items-start gap-3">
											<input
												id="form-iv-jurisdiction"
												type="checkbox"
												checked={jurisdictionAccepted}
												onChange={(e) => {
													clearFieldError('form-iv-jurisdiction')
													setJurisdictionAccepted(e.target.checked)
												}}
												required
												className="sr-only"
												aria-invalid={fieldErrors['form-iv-jurisdiction'] ? 'true' : undefined}
											/>
											<FormTick checked={jurisdictionAccepted} />
											<span className="min-w-0 text-sm leading-relaxed text-slate-800">
												{declarationText(DECLARATION.FORM_IV_JURISDICTION)}
											</span>
										</label>
									</Field>

									<Field
										id="form-iv-facts"
										label="Facts of the case"
										required
										para={3}
										hint="Set out what happened, in chronological order."
										error={fieldErrors['form-iv-facts'] || ''}
									>
										<InputShell className={textareaShellClass}>
											<textarea
												required
												value={factsOfCase}
												onChange={(e) => {
													clearFieldError('form-iv-facts')
													setFactsOfCase(e.target.value)
												}}
												rows={4}
												placeholder="Example: On … the agreed rent was … Thereafter on …"
												className="h-full w-full resize-y border-0 bg-transparent px-3.5 py-2.5 text-[15px] text-[#151717] outline-none placeholder:text-slate-400"
											/>
										</InputShell>
									</Field>

									<Field
										id="form-iv-grounds"
										label="Grounds for relief"
										required
										para={4}
										hint="State the grounds on which the relief is claimed."
										error={fieldErrors['form-iv-grounds'] || ''}
									>
										<InputShell className={textareaShellClass}>
											<textarea
												required
												value={groundsForRelief}
												onChange={(e) => {
													clearFieldError('form-iv-grounds')
													setGroundsForRelief(e.target.value)
												}}
												rows={3}
												placeholder="Example: The revision is contrary to the tenancy agreement and the Act…"
												className="h-full w-full resize-y border-0 bg-transparent px-3.5 py-2.5 text-[15px] text-[#151717] outline-none placeholder:text-slate-400"
											/>
										</InputShell>
									</Field>

									<Field
										id="form-iv-prior"
										label="Earlier proceedings"
										required
										para={5}
										hint="State whether any application, petition, writ petition or suit regarding this matter was previously filed."
										error={fieldErrors['form-iv-prior'] || ''}
									>
										<PriorProceedingsField
											fieldId={DECLARATION.FORM_IV_PRIOR_PROCEEDINGS}
											hint="If Yes, furnish particulars of each case below. If No, select the first option."
											hasPrior={hasPriorProceedings}
											onHasPriorChange={(value) => {
												clearFieldError('form-iv-prior')
												setHasPriorProceedings(value)
											}}
											entries={priorProceedings}
											onEntriesChange={(entries) => {
												clearFieldError('form-iv-prior')
												setPriorProceedings(entries)
											}}
											variant="modern"
										/>
									</Field>

									<Field
										id="form-iv-relief"
										label="Relief sought"
										required
										para={6}
										hint="State clearly the order prayed for from the Rent Authority."
										error={fieldErrors['form-iv-relief'] || ''}
									>
										<InputShell className={textareaShellClass}>
											<textarea
												required
												value={reliefSought}
												onChange={(e) => {
													clearFieldError('form-iv-relief')
													setReliefSought(e.target.value)
												}}
												rows={3}
												placeholder="Example: That the revised rent be set aside / determined…"
												className="h-full w-full resize-y border-0 bg-transparent px-3.5 py-2.5 text-[15px] text-[#151717] outline-none placeholder:text-slate-400"
											/>
										</InputShell>
									</Field>

									<Field
										id="form-iv-interim"
										label="Interim order sought"
										optional
										para={7}
										hint="Temporary relief pending final disposal. Leave blank if not required."
										error={fieldErrors['form-iv-interim'] || ''}
									>
										<InputShell className={textareaShellClass}>
											<textarea
												value={interimOrderSought}
												onChange={(e) => {
													clearFieldError('form-iv-interim')
													setInterimOrderSoughtValue(e.target.value)
												}}
												rows={3}
												placeholder="Nature of the interim relief prayed for"
												className="h-full w-full resize-y border-0 bg-transparent px-3.5 py-2.5 text-[15px] text-[#151717] outline-none placeholder:text-slate-400"
											/>
										</InputShell>
									</Field>

									<Field
										id="form-iv-enclosures"
										label="List of enclosures"
										optional
										para={8}
										hint="List the affidavits or documents accompanying this application. Leave blank if none."
										error={fieldErrors['form-iv-enclosures'] || ''}
									>
										<InputShell className={textareaShellClass}>
											<textarea
												value={listOfEnclosures}
												onChange={(e) => {
													clearFieldError('form-iv-enclosures')
													setListOfEnclosuresValue(e.target.value)
												}}
												rows={3}
												placeholder="Example: Copy of tenancy agreement; rent receipts…"
												className="h-full w-full resize-y border-0 bg-transparent px-3.5 py-2.5 text-[15px] text-[#151717] outline-none placeholder:text-slate-400"
											/>
										</InputShell>
									</Field>

									<LegalAdvicePartPicker
										options={requiredVerificationParas}
										selectedNumbers={legalAdviceParaNumbers}
										onToggle={(number) => {
											clearFieldError('form-iv-legal-advice')
											toggleLegalAdvicePara(number)
										}}
										error={fieldErrors['form-iv-legal-advice'] || ''}
									/>
							</FormSection>

							<FormSection
								step={4}
								tone="signature"
								title="Declaration and signature"
								description="Accept the undertaking and upload your signature to complete the filing."
							>
								<div className="form-iv-verify" id="form-iv-undertaking-group">
									<div className="flex flex-col gap-1.5">
										<div className="flex flex-row flex-wrap items-baseline gap-x-1.5 text-[14px] font-semibold text-[#151717]">
											<label htmlFor="form-iv-undertaking" className="m-0 cursor-pointer">
												Undertaking
											</label>
											<span className="text-red-500" aria-hidden>
												*
											</span>
											<span className="sr-only">(required)</span>
										</div>
										<label
											className={`!m-0 !flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 transition ${
												verificationUndertakingAccepted
													? 'border-[#c4b5fd] bg-white'
													: fieldErrors['form-iv-undertaking']
														? 'border-red-300 bg-white'
														: 'border-slate-200 bg-white hover:border-[#c4b5fd]'
											}`}
										>
											<input
												id="form-iv-undertaking"
												type="checkbox"
												checked={verificationUndertakingAccepted}
												onChange={(e) => {
													clearFieldError('form-iv-undertaking')
													setVerificationUndertakingAccepted(e.target.checked)
												}}
												required
												className="sr-only"
												aria-invalid={fieldErrors['form-iv-undertaking'] ? 'true' : undefined}
												aria-describedby={
													fieldErrors['form-iv-undertaking']
														? 'form-iv-undertaking-error'
														: undefined
												}
											/>
											<FormTick checked={verificationUndertakingAccepted} />
											<span className="min-w-0 text-sm leading-relaxed text-slate-800">
												I hereby declare that I have not suppressed any material facts.
											</span>
										</label>
										{fieldErrors['form-iv-undertaking'] ? (
											<p
												id="form-iv-undertaking-error"
												className="m-0 text-[12px] font-medium text-red-600"
												role="alert"
											>
												{fieldErrors['form-iv-undertaking']}
											</p>
										) : null}
									</div>

									<Field
										id="form-iv-signature"
										label="Signature image"
										required
										hint="JPG, JPEG or PNG. Recommended: at least 300 × 100 px, max 2 MB."
										error={fieldErrors['form-iv-signature'] || ''}
									>
										<div className="form-i-field form-i-upload-field">
											<span className="form-i-icon-gutter" aria-hidden>
												<Upload size={18} strokeWidth={2} />
											</span>
											<label className="form-i-upload-body !m-0 !flex !flex-row !gap-3 min-w-0 flex-1 cursor-pointer items-center px-3.5">
												<span className="inline-flex shrink-0 items-center rounded-lg bg-[#ede9fe] px-3 py-1.5 text-sm font-semibold text-[#6d28d9]">
													{signatureImage ? 'Change file' : 'Choose file'}
												</span>
												<span className="min-w-0 truncate text-sm text-slate-500">
													{signatureImage ? 'Signature selected' : 'No file chosen'}
												</span>
												<input
													id="form-iv-signature"
													type="file"
													accept=".jpg,.jpeg,.png,image/jpeg,image/png"
													required={!signatureImage}
													className="sr-only"
													aria-invalid={fieldErrors['form-iv-signature'] ? 'true' : undefined}
													aria-describedby={
														[
															'form-iv-signature-hint',
															fieldErrors['form-iv-signature']
																? 'form-iv-signature-error'
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
														clearFieldError('form-iv-signature')
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
														clearFieldError('form-iv-signature')
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
				title="FORM-IV"
				subtitle="Application before the Rent Authority — Rule 11(1)"
				variant="legal"
				legalDocument={
					<FormIVLegalDocument
						tenancyUIN={tenancyUIN}
						applicantName={applicantName}
						applicantResidentialAddress={applicantResidentialAddress}
						oppositePartyName={oppositePartyName}
						oppositePartyResidentialAddress={oppositePartyResidentialAddress}
						statutoryMatter={statutoryMatter}
						repairItems={repairItems}
						essentialServices={essentialServices}
						essentialServiceOther={essentialServiceOther}
						particularsOfViolation={particularsOfViolation}
						jurisdictionAccepted={jurisdictionAccepted}
						factsOfCase={factsOfCase}
						groundsForRelief={groundsForRelief}
						hasPriorProceedings={hasPriorProceedings}
						priorProceedings={priorProceedings}
						reliefSought={reliefSought}
						interimOrderSought={interimOrderSought}
						listOfEnclosures={listOfEnclosures}
						verification={verificationForPreview}
						signatureName={effectiveSignatureName}
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
