import { useCallback, useEffect, useMemo, useState, Children, cloneElement, isValidElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Building2, Check, MapPin, Scale, Upload, User } from 'lucide-react'
import api, { csrf } from '../api'
import TenancyUinLookup from './forms/TenancyUinLookup'
import UinPrefillNotice from './forms/UinPrefillNotice'
import LoadedUinChip from './forms/LoadedUinChip'
import ServiceFormReadyGate from './forms/ServiceFormReadyGate'
import ServiceFormPreviewModal from './forms/ServiceFormPreviewModal'
import FormIIILegalDocument from './forms/FormIIILegalDocument'
import FormDatePicker from './forms/FormDatePicker'
import PriorProceedingsField from './forms/PriorProceedingsField'
import { useServiceFormPreview } from '../hooks/useServiceFormPreview'
import { APPLICATION_TYPES } from '../constants/application'
import { PRIOR_STATUS } from '../constants/priorProceedings'
import {
	DECLARATION,
	PARA_ANSWER,
	VERIFICATION,
	declarationText,
	verificationParagraphs,
} from '../constants/declarations'
import { ageOn, profileDefaults, toDateInputValue } from '../utils/profileAutofill'
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
const FORM_III_PART_SHORT = {
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
	return FORM_III_PART_SHORT[option.number] || option.heading || `Part ${option.number}`
}

function LegalAdvicePartPicker({ options, selectedNumbers, onToggle, error = '' }) {
	const errorId = error ? 'form-iii-legal-advice-error' : undefined
	return (
		<fieldset
			className="form-iv-detail-item form-iv-legal-advice form-iv-optional-gate m-0 flex min-w-0 flex-col border-0"
			id="form-iii-legal-advice-group"
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
					const inputId = `form-iii-legal-advice-${option.number}`
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
		<div className={toneClass || undefined} id={step ? `form-iii-section-${step}` : undefined}>
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

export default function Form5RentCourtFilingPanel({ onBack, serviceMeta, user }) {
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

	const [rentCourtAt, setRentCourtAt] = useState('')
	const [courtJurisdictionName, setCourtJurisdictionName] = useState('')
	const [courtJurisdictionAddress, setCourtJurisdictionAddress] = useState('')

	const profile = useMemo(() => profileDefaults(user), [user])

	const [applicantName, setApplicantName] = useState(profile.name)
	const [applicantResidentialAddress, setApplicantResidentialAddress] = useState(profile.address)

	const [tenancyUIN, setTenancyUIN] = useState('')
	const [respondentName, setRespondentName] = useState('')
	const [respondentResidentialAddress, setRespondentResidentialAddress] = useState('')
	const [premisesSituatedAt, setPremisesSituatedAt] = useState('')
	const [tenancyDistrict, setTenancyDistrict] = useState('')
	const [recordLoaded, setRecordLoaded] = useState(false)

	const [particularsOfApplication, setParticularsOfApplication] = useState('')
	const [jurisdictionAccepted, setJurisdictionAccepted] = useState(false)
	const [factsOfCase, setFactsOfCase] = useState('')
	const [groundsForRelief, setGroundsForRelief] = useState('')
	const [hasPriorProceedings, setHasPriorProceedings] = useState(null)
	const [priorProceedings, setPriorProceedings] = useState([])
	const [reliefSought, setReliefSought] = useState('')
	const [interimOrderSought, setInterimOrderSought] = useState('')
	const [listOfEnclosures, setListOfEnclosures] = useState('')

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
			Object.entries(verificationParagraphs(VERIFICATION.FORM_III)).map(([number, heading]) => ({
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

	const clearTenancyRecord = useCallback(() => {
		setRecordLoaded(false)
		setApplicantName(profile.name)
		setApplicantResidentialAddress(profile.address)
		setRespondentName('')
		setRespondentResidentialAddress('')
		setPremisesSituatedAt('')
		setRentCourtAt('')
		setCourtJurisdictionName('')
		setCourtJurisdictionAddress('')
		setTenancyDistrict('')
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
			const { data } = await api.post('/api/rent-court-filing-applications', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})
			return data
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['citizen-applications'] })
			queryClient.invalidateQueries({ queryKey: ['admin-applications'] })
			completeServiceFormSubmit(
				navigate,
				getServiceFormSuccessMessage(data, 'Form III submitted successfully.')
			)
		},
		onError: (err) => {
			const msg =
				err?.response?.data?.message ||
				(err?.response?.data?.errors
					? Object.values(err.response.data.errors).flat().join('. ')
					: 'Failed to submit Form III')
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
			reportError('Enter your Tenancy UIN and load the tenancy record before submitting Form III.')
			return false
		}

		if (!applicantName.trim() || !applicantResidentialAddress.trim()) {
			fail('form-iii-applicant', 'Applicant name and address are missing from the tenancy record.')
		}
		if (!respondentName.trim() || !respondentResidentialAddress.trim()) {
			fail('form-iii-applicant', 'Respondent name and address are missing from the tenancy record.')
		}
		if (!particularsOfApplication.trim()) {
			fail('form-iii-particulars', 'Enter the particulars of the application.')
		}
		if (!jurisdictionAccepted) {
			fail('form-iii-jurisdiction', 'Accept the declaration at paragraph 2 before filing.')
		}
		if (!factsOfCase.trim()) {
			fail('form-iii-facts', 'Enter the facts of the case.')
		}
		if (!groundsForRelief.trim()) {
			fail('form-iii-grounds-relief', 'Enter the grounds for relief.')
		}
		if (hasPriorProceedings === null) {
			fail('form-iii-prior', 'Answer paragraph 5 before filing.')
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
					'form-iii-prior',
					'Give the case number, the court or authority, and the pendency or decision for every case disclosed at paragraph 5.'
				)
			}
		}
		if (!reliefSought.trim()) {
			fail('form-iii-relief', 'Enter the relief sought.')
		}
		if (!verification.relativeName.trim()) {
			fail('form-iii-relative-name', 'Enter the father / mother / spouse name.')
		}
		if (!verification.relation) {
			fail('form-iii-relation', 'Select the relation.')
		}
		if (!verificationDob || !String(verification.age || ageFromDob || '').trim()) {
			fail('form-iii-dob', 'Enter the applicant’s date of birth so age can be calculated.')
		}
		if (!verifierName || !verifierAddress) {
			fail(
				'form-iii-relative-name',
				'Complete the verification particulars (name, relation target and address).'
			)
		}
		if (!verification.place.trim()) {
			fail(
				'form-iii-applicant',
				'This UIN has no district on record. Place of filing cannot be set automatically.'
			)
		}
		const resolvedAnswers = Object.values(resolvedVerificationParagraphs)
		const allOnLegalAdvice =
			resolvedAnswers.length > 0 &&
			resolvedAnswers.every((answer) => answer === PARA_ANSWER.LEGAL_ADVICE)
		if (allOnLegalAdvice) {
			fail(
				'form-iii-legal-advice',
				'At least one part of the application must remain based on your own knowledge. Leave at least one item unticked under Based on legal advice.'
			)
		}
		if (!verificationUndertakingAccepted) {
			fail('form-iii-undertaking', 'Accept the verification undertaking before filing.')
		}
		if (!effectiveSignatureName) {
			fail('form-iii-undertaking', 'Applicant name is missing from the tenancy record.')
		}
		if (!signatureImage) {
			fail('form-iii-signature', 'Upload your signature image.')
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

			formData.append('rent_court_at', rentCourtAt.trim())
			formData.append('tenancy_uin', tenancyUIN.trim())

			formData.append('applicant_name', applicantName.trim())
			formData.append('applicant_residential_address', applicantResidentialAddress.trim())

			formData.append('respondent_name', respondentName.trim())
			formData.append('respondent_residential_address', respondentResidentialAddress.trim())

			formData.append('particulars_of_application', particularsOfApplication.trim())
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
			if (listOfEnclosures.trim()) formData.append('list_of_enclosures', listOfEnclosures.trim())

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
		effectiveSignatureName,
		factsOfCase,
		groundsForRelief,
		interimOrderSought,
		jurisdictionAccepted,
		listOfEnclosures,
		hasPriorProceedings,
		priorProceedings,
		particularsOfApplication,
		reliefSought,
		rentCourtAt,
		requiredVerificationParas,
		resolvedVerificationParagraphs,
		respondentName,
		respondentResidentialAddress,
		signatureImage,
		verification,
		verificationDob,
		verificationUndertakingAccepted,
		verifierAddress,
		verifierName,
		tenancyUIN,
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

		applyTenancyAutofill(APPLICATION_TYPES.RENT_COURT_FILING, tenancy, user, {
			setTenancyUIN,
			setRentCourtAt,
		})

		// Form III: applicant is the landlord; tenant is the respondent.
		setApplicantName(nextLandlordName || profile.name)
		setApplicantResidentialAddress(nextLandlordAddress || profile.address)
		setRespondentName(nextTenantName)
		setRespondentResidentialAddress(nextTenantAddress)
		setPremisesSituatedAt(premises)
		if (districtName) setRentCourtAt(districtName)

		const court = formatRentCourtAddressee(tenancy)
		setCourtJurisdictionName(court.line1)
		setCourtJurisdictionAddress(court.line2)
		setTenancyDistrict(districtName)

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
		setFieldErrors({})
		return 1
	}

	const formTitle = serviceMeta?.formName || 'Form III'
	const formBadge = serviceMeta?.groupTitle || 'Rent Court'
	const formLead = serviceMeta
		? `${serviceMeta.matter || 'Application before the Rent Court'}${
				serviceMeta.rule ? ` (${serviceMeta.rule})` : ''
			}`
		: 'Application before the Rent Court under Form III (Rule 10)'

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
								'Applicant is the landlord named on the UIN',
								'Date of birth and relation details for verification',
								'Particulars of the dispute ready to state',
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
								hint="Load a UIN where you are a named party. The landlord becomes the applicant."
								actionLabel="Load record"
								loadingLabel="Loading…"
								successMessage={() => 'Tenancy record loaded. Applicant set to the landlord.'}
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
									description="On Form III the applicant is the landlord. Review the parties and premises from your UIN, then complete relation and age."
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
											value={respondentName}
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
											value={respondentResidentialAddress}
											icon={MapPin}
											multiline
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
											label="In the Rent Court at"
											value={rentCourtAt}
											icon={Scale}
											empty="Not on record"
											fromUin
										/>
									</div>

									<div className="form-iv-applicant-extras">
										<div className="form-iv-applicant-extras__grid">
											<Field
												id="form-iii-relative-name"
												label="Applicant's father/mother/spouse name"
												required
												hint="Person you are Son, Daughter or Spouse of"
												error={fieldErrors['form-iii-relative-name'] || ''}
											>
												<InputShell
													icon={User}
													className={`${inputShellClass} form-iv-relative-name-input`}
												>
													<input
														type="text"
														value={verification.relativeName}
														onChange={(e) => {
															clearFieldError('form-iii-relative-name')
															setVerificationField('relativeName', e.target.value)
														}}
														required
														placeholder="Full name"
														className={inputClass}
													/>
												</InputShell>
											</Field>

											<fieldset
												id="form-iii-relation-group"
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
												<div
													className="form-iv-relation-field__options"
													role="radiogroup"
													aria-label="Relation"
												>
													{VERIFICATION_RELATION_OPTIONS.map((option) => {
														const selected = verification.relation === option.value
														return (
															<label
																key={option.value}
																className={`form-iv-relation-option${selected ? ' is-selected' : ''}`}
															>
																<input
																	type="radio"
																	name="verification_relation_iii"
																	value={option.value}
																	checked={selected}
																	onChange={() => {
																		clearFieldError('form-iii-relation')
																		setVerificationField('relation', option.value)
																	}}
																	className="sr-only"
																/>
																<span>{option.label}</span>
															</label>
														)
													})}
												</div>
												{fieldErrors['form-iii-relation'] ? (
													<p className="m-0 text-[12px] font-medium text-red-600" role="alert">
														{fieldErrors['form-iii-relation']}
													</p>
												) : null}
											</fieldset>

											<Field
												id="form-iii-dob"
												label="Applicant's date of birth"
												required
												hint="Age is calculated automatically"
												error={fieldErrors['form-iii-dob'] || fieldErrors['form-iii-age'] || ''}
											>
												<div className="form-iv-dob-field">
													<FormDatePicker
														id="form-iii-dob"
														value={verificationDob}
														onChange={(next) => {
															clearFieldError('form-iii-dob')
															clearFieldError('form-iii-age')
															applyDob(next)
														}}
														required
														max={dobInputMax()}
														placeholder="DD-MM-YYYY"
														className="form-iv-dob-input"
														aria-invalid={
															fieldErrors['form-iii-dob'] || fieldErrors['form-iii-age']
																? 'true'
																: undefined
														}
														aria-describedby={
															[
																'form-iii-dob-hint',
																fieldErrors['form-iii-dob'] || fieldErrors['form-iii-age']
																	? 'form-iii-dob-error'
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
									title="Case details"
									description="Fill each item in order. Paragraph numbers match Form III in the Gazette. Leave optional items blank if they do not apply."
									contentClassName="form-iv-details"
								>
									<Field
										id="form-iii-particulars"
										label="Particulars of application"
										required
										para={1}
										hint="In one or two sentences, state what this application is about."
										error={fieldErrors['form-iii-particulars'] || ''}
									>
										<InputShell className={textareaShellClass}>
											<textarea
												required
												value={particularsOfApplication}
												onChange={(e) => {
													clearFieldError('form-iii-particulars')
													setParticularsOfApplication(e.target.value)
												}}
												rows={3}
												placeholder="State the particulars briefly"
												className={textareaClass}
											/>
										</InputShell>
									</Field>

									<Field
										id="form-iii-jurisdiction"
										label="Jurisdiction of the Rent Court"
										required
										para={2}
										hint="Check the court below, then tick the declaration to confirm this is the correct Rent Court."
										error={fieldErrors['form-iii-jurisdiction'] || ''}
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
															courtJurisdictionName || rentCourtAt || courtJurisdictionAddress
																? 'is-filled'
																: 'is-empty'
														}`}
													>
														<p className="form-ii-jurisdiction__fetched-name m-0">
															{courtJurisdictionName ||
																(rentCourtAt ? `Rent Court at ${rentCourtAt}` : 'Rent Court')}
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
													id="form-iii-jurisdiction"
													type="checkbox"
													checked={jurisdictionAccepted}
													onChange={(e) => {
														clearFieldError('form-iii-jurisdiction')
														setJurisdictionAccepted(e.target.checked)
													}}
													required
													className="sr-only"
													aria-invalid={
														fieldErrors['form-iii-jurisdiction'] ? 'true' : undefined
													}
												/>
												<FormTick checked={jurisdictionAccepted} />
												<span className="form-ii-jurisdiction__declare-text">
													{declarationText(DECLARATION.FORM_III_JURISDICTION)}
												</span>
											</label>
										</div>
									</Field>

									<Field
										id="form-iii-facts"
										label="Facts of the case"
										required
										para={3}
										hint="Write what happened in date order. Prefer one fact or issue per short paragraph."
										error={fieldErrors['form-iii-facts'] || ''}
									>
										<InputShell className={textareaShellClass}>
											<textarea
												required
												value={factsOfCase}
												onChange={(e) => {
													clearFieldError('form-iii-facts')
													setFactsOfCase(e.target.value)
												}}
												rows={4}
												placeholder="Set out the facts in chronological order"
												className={textareaClass}
											/>
										</InputShell>
									</Field>

									<Field
										id="form-iii-grounds-relief"
										label="Grounds for relief"
										required
										para={4}
										hint="Why should the Rent Court grant what you are asking?"
										error={fieldErrors['form-iii-grounds-relief'] || ''}
									>
										<InputShell className={textareaShellClass}>
											<textarea
												required
												value={groundsForRelief}
												onChange={(e) => {
													clearFieldError('form-iii-grounds-relief')
													setGroundsForRelief(e.target.value)
												}}
												rows={3}
												placeholder="State the grounds for relief"
												className={textareaClass}
											/>
										</InputShell>
									</Field>

									<Field
										id="form-iii-prior"
										label="Matters not previously filed"
										required
										para={5}
										hint="Say whether any application, petition, writ petition or suit about this matter was filed before."
										error={fieldErrors['form-iii-prior'] || ''}
									>
										<PriorProceedingsField
											fieldId={DECLARATION.FORM_III_PRIOR_PROCEEDINGS}
											hint="If yes, add each case below. If no, choose the first option."
											hasPrior={hasPriorProceedings}
											onHasPriorChange={(value) => {
												clearFieldError('form-iii-prior')
												setHasPriorProceedings(value)
											}}
											entries={priorProceedings}
											onEntriesChange={(entries) => {
												clearFieldError('form-iii-prior')
												setPriorProceedings(entries)
											}}
											variant="modern"
										/>
									</Field>

									<Field
										id="form-iii-relief"
										label="Relief sought"
										required
										para={6}
										hint="State clearly what order you want from the Rent Court, and any legal provisions you rely on."
										error={fieldErrors['form-iii-relief'] || ''}
									>
										<InputShell className={textareaShellClass}>
											<textarea
												required
												value={reliefSought}
												onChange={(e) => {
													clearFieldError('form-iii-relief')
													setReliefSought(e.target.value)
												}}
												rows={3}
												placeholder="State the relief sought"
												className={textareaClass}
											/>
										</InputShell>
									</Field>

									<Field
										id="form-iii-interim"
										label="Interim order, if any prayed for"
										optional
										para={7}
										hint="Only if you need temporary relief before the final order. Leave blank if not required."
										error={fieldErrors['form-iii-interim'] || ''}
									>
										<InputShell className={textareaShellClass}>
											<textarea
												value={interimOrderSought}
												onChange={(e) => {
													clearFieldError('form-iii-interim')
													setInterimOrderSoughtValue(e.target.value)
												}}
												rows={3}
												placeholder="Nature of the interim relief prayed for"
												className={textareaClass}
											/>
										</InputShell>
									</Field>

									<Field
										id="form-iii-enclosures"
										label="List of enclosures"
										optional
										para={8}
										hint="List affidavits or documents attached to this application. Leave blank if none."
										error={fieldErrors['form-iii-enclosures'] || ''}
									>
										<InputShell className={textareaShellClass}>
											<textarea
												value={listOfEnclosures}
												onChange={(e) => {
													clearFieldError('form-iii-enclosures')
													setListOfEnclosuresValue(e.target.value)
												}}
												rows={4}
												placeholder="Example: Copy of tenancy agreement, rent receipts…"
												className={textareaClass}
											/>
										</InputShell>
									</Field>

									<LegalAdvicePartPicker
										options={requiredVerificationParas}
										selectedNumbers={legalAdviceParaNumbers}
										onToggle={(number) => {
											clearFieldError('form-iii-legal-advice')
											toggleLegalAdvicePara(number)
										}}
										error={fieldErrors['form-iii-legal-advice'] || ''}
									/>
								</FormSection>

								<FormSection
									step={3}
									tone="signature"
									title="Declaration and signature"
									description="Accept the undertaking and upload your signature to complete the filing."
								>
									<div className="form-iv-verify" id="form-iii-undertaking-group">
										<div className="flex flex-col gap-1.5">
											<div className="flex flex-row flex-wrap items-baseline gap-x-1.5 text-[14px] font-semibold text-[#151717]">
												<label htmlFor="form-iii-undertaking" className="m-0 cursor-pointer">
													Undertaking
												</label>
												<span className="text-red-500" aria-hidden>
													*
												</span>
												<span className="sr-only">(required)</span>
											</div>
											<label
												htmlFor="form-iii-undertaking"
												className={`sf-undertaking-box${
													verificationUndertakingAccepted ? ' is-checked' : ''
												}${fieldErrors['form-iii-undertaking'] ? ' is-error' : ''}`}
											>
												<input
													id="form-iii-undertaking"
													type="checkbox"
													checked={verificationUndertakingAccepted}
													onChange={(e) => {
														clearFieldError('form-iii-undertaking')
														setVerificationUndertakingAccepted(e.target.checked)
													}}
													required
													className="sr-only"
													aria-invalid={
														fieldErrors['form-iii-undertaking'] ? 'true' : undefined
													}
													aria-describedby={
														fieldErrors['form-iii-undertaking']
															? 'form-iii-undertaking-error'
															: undefined
													}
												/>
												<FormTick checked={verificationUndertakingAccepted} />
												<span className="min-w-0 text-sm leading-relaxed text-slate-800">
													I hereby declare that I have not suppressed any material facts.
												</span>
											</label>
											{fieldErrors['form-iii-undertaking'] ? (
												<p
													id="form-iii-undertaking-error"
													className="m-0 text-[12px] font-medium text-red-600"
													role="alert"
												>
													{fieldErrors['form-iii-undertaking']}
												</p>
											) : null}
										</div>

										<Field
											id="form-iii-signature"
											label="Signature image"
											required
											hint="JPG, JPEG or PNG. Recommended: at least 300 × 100 px, max 2 MB."
											error={fieldErrors['form-iii-signature'] || ''}
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
														id="form-iii-signature"
														type="file"
														accept=".jpg,.jpeg,.png,image/jpeg,image/png"
														required={!signatureImage}
														className="sr-only"
														aria-invalid={
															fieldErrors['form-iii-signature'] ? 'true' : undefined
														}
														aria-describedby={
															[
																'form-iii-signature-hint',
																fieldErrors['form-iii-signature']
																	? 'form-iii-signature-error'
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
															clearFieldError('form-iii-signature')
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
															clearFieldError('form-iii-signature')
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
				title="FORM-III"
				subtitle="Application before the Rent Court — Rule 10"
				variant="legal"
				legalDocument={
					<FormIIILegalDocument
						tenancyUIN={tenancyUIN}
						beforeRentCourt={rentCourtAt}
						courtLine1={courtJurisdictionName}
						courtLine2={courtJurisdictionAddress}
						applicantName={applicantName}
						applicantResidentialAddress={applicantResidentialAddress}
						respondentName={respondentName}
						respondentResidentialAddress={respondentResidentialAddress}
						particularsOfApplication={particularsOfApplication}
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
