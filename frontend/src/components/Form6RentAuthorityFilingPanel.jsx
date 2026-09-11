import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Check, CheckCircle2, IdCard, Info, MapPin, Upload, User } from 'lucide-react'
import api, { csrf } from '../api'
import TenancyUinLookup from './forms/TenancyUinLookup'
import ServiceFormPreviewModal from './forms/ServiceFormPreviewModal'
import FormIVLegalDocument from './forms/FormIVLegalDocument'
import PriorProceedingsField from './forms/PriorProceedingsField'
import { useServiceFormPreview } from '../hooks/useServiceFormPreview'
import { ageOn, formatLongDate, profileDefaults, toDateInputValue } from '../utils/profileAutofill'
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
		<section className="overflow-hidden rounded-[20px] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)]">
			<div className="border-b border-[#ddd6fe] bg-[#ede9fe] px-[30px] py-5 text-center">
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
								<span className="inline-flex items-center rounded-md border border-[#ddd6fe] bg-[#f5f3ff] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#6d28d9]">
									{badge}
								</span>
							) : null}
						</div>
						{description ? <p className={descriptionClassName}>{description}</p> : null}
					</div>
				</div>
			</div>
			<div className="flex flex-col gap-3.5">{children}</div>
		</div>
	)
}

function Field({ label, hint, required = false, optional = false, para = null, hintInline = false, children }) {
	const isDetail = para != null
	return (
		<div
			className={
				isDetail
					? 'form-iv-field flex min-w-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5'
					: 'form-iv-field flex min-w-0 flex-col gap-1.5'
			}
		>
			<div className={`flex min-w-0 ${hintInline || !hint ? '' : 'flex-col gap-1'}`}>
				<div className="flex flex-row flex-wrap items-center gap-x-2 gap-y-1 text-[14px] font-semibold text-[#151717]">
					{para != null ? (
						<span
							className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-[#ede9fe] px-1.5 text-[13px] font-bold text-[#6d28d9]"
							aria-hidden
						>
							{para}
						</span>
					) : null}
					<span className={isDetail ? 'text-[15px] font-semibold text-slate-900' : undefined}>{label}</span>
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
	6: 'Relief sought',
	7: 'Interim order sought',
}

function partLabel(option) {
	return FORM_IV_PART_SHORT[option.number] || option.heading || `Part ${option.number}`
}

function LegalAdvicePartPicker({ options, selectedNumbers, onToggle }) {
	return (
		<div
			className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
			role="group"
			aria-label="Parts based on legal advice"
		>
			<div className="min-w-0">
				<p className="m-0 flex flex-wrap items-center gap-2 text-[15px] font-semibold text-[#6d28d9]">
					Based on legal advice
					<span className="rounded-md border border-[#ddd6fe] bg-[#ede9fe] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#6d28d9]">
						Optional
					</span>
				</p>
				<p className="mt-1 mb-0 text-[12px] leading-relaxed text-slate-500">
					By default, all particulars above are treated as based on your own knowledge. Tick only
					those that are based on legal advice.
				</p>
			</div>

			<ul className="m-0 flex list-none flex-col gap-1.5 p-0">
				{options.map((option) => {
					const selected = selectedNumbers.includes(option.number)
					const label = partLabel(option)
					const inputId = `form-iv-legal-advice-${option.number}`
					return (
						<li key={option.number} className="min-w-0">
							<label
								htmlFor={inputId}
								className="!m-0 !flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 hover:border-slate-300"
							>
								<input
									id={inputId}
									type="checkbox"
									className="sr-only"
									checked={selected}
									onChange={() => onToggle(option.number)}
								/>
								<FormTick checked={selected} />
								<span className="min-w-0 text-sm font-medium text-slate-800">
									{label} ({option.number})
								</span>
							</label>
						</li>
					)
				})}
			</ul>
		</div>
	)
}

function ReadOnlyField({ label, value, empty = '—', icon: Icon, variant = 'default', action = null, multiline = false }) {
	const text = String(value ?? '').trim()
	const display = text || empty
	const hasValue = Boolean(text)
	const isUin = variant === 'uin'

	return (
		<div className="flex min-w-0 flex-col gap-1.5">
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
	'inline-flex h-[50px] items-center justify-center rounded-[10px] border-0 bg-[#151717] px-5 text-[15px] font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60'
const btnSecondary =
	'inline-flex h-[50px] items-center justify-center rounded-[10px] border border-[#ededef] bg-white px-5 text-[15px] font-medium text-[#151717] transition hover:border-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-60'

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
	const [needInterimOrder, setNeedInterimOrder] = useState(false)
	const [needEnclosures, setNeedEnclosures] = useState(false)

	const [signatureImage, setSignatureImage] = useState(null)
	const [recordLoaded, setRecordLoaded] = useState(false)
	const [authorityLine1, setAuthorityLine1] = useState('')
	const [authorityLine2, setAuthorityLine2] = useState('')
	const [tenancyDistrict, setTenancyDistrict] = useState('')
	const [tenancyOffice, setTenancyOffice] = useState('')
	const [verificationDob, setVerificationDob] = useState(() => toDateInputValue(profile.dateOfBirth))
	const [dobEditing, setDobEditing] = useState(() => !toDateInputValue(profile.dateOfBirth))
	const [verificationUndertakingAccepted, setVerificationUndertakingAccepted] = useState(false)
	const matterFollowUpRef = useRef(null)

	const [verification, setVerification] = useState({
		name: profile.name,
		relation: 'S/o.',
		relativeName: '',
		age: profile.age,
		address: profile.address,
		place: '',
		paragraphs: {},
	})

	const dobDisplay = useMemo(() => formatLongDate(verificationDob), [verificationDob])
	const ageFromDob = useMemo(() => ageOn(verificationDob), [verificationDob])

	const applyDob = useCallback((nextDob) => {
		const normalised = toDateInputValue(nextDob)
		setVerificationDob(normalised)
		setVerification((current) => ({
			...current,
			age: ageOn(normalised),
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

	const turnOffInterimOrder = useCallback(() => {
		setNeedInterimOrder(false)
		setInterimOrderSought('')
		setVerification((current) => {
			if (current.paragraphs?.[7] == null) return current
			const next = { ...current.paragraphs }
			delete next[7]
			return { ...current, paragraphs: next }
		})
	}, [])

	const turnOffEnclosures = useCallback(() => {
		setNeedEnclosures(false)
		setListOfEnclosures('')
	}, [])

	const verificationParaOptions = useMemo(
		() =>
			Object.entries(verificationParagraphs(VERIFICATION.FORM_IV)).map(([number, heading]) => ({
				number: Number(number),
				heading,
			})),
		[]
	)

	const requiredVerificationParas = useMemo(
		() =>
			verificationParaOptions.filter((option) => option.number !== 7 || needInterimOrder),
		[verificationParaOptions, needInterimOrder]
	)

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
		setNeedInterimOrder(false)
		setNeedEnclosures(false)
		setInterimOrderSought('')
		setListOfEnclosures('')
		setVerification({
			name: profile.name,
			relation: 'S/o.',
			relativeName: '',
			age: profile.age,
			address: profile.address,
			place: '',
			paragraphs: {},
		})
		const profileDob = toDateInputValue(profile.dateOfBirth)
		setVerificationDob(profileDob)
		setDobEditing(!profileDob)
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
		setRepairItems((current) =>
			current.includes(code) ? current.filter((c) => c !== code) : [...current, code]
		)
	}, [])

	const toggleService = useCallback((code) => {
		setEssentialServices((current) =>
			current.includes(code) ? current.filter((c) => c !== code) : [...current, code]
		)
	}, [])

	const selectMatter = useCallback((value) => {
		setStatutoryMatter(value)
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
		if (!recordLoaded) {
			reportError('Enter your Tenancy UIN and load the tenancy record before submitting Form IV.')
			return false
		}
		if (!applicantName.trim() || !applicantResidentialAddress.trim()) {
			reportError('Applicant name and address are required.')
			return false
		}
		if (!oppositePartyName.trim() || !oppositePartyResidentialAddress.trim()) {
			reportError('Opposite party name and address are required.')
			return false
		}
		if (!particularsOfViolation.trim()) {
			reportError('Enter the particulars of the violation.')
			return false
		}
		if (!jurisdictionAccepted) {
			reportError('Confirm that the matter falls within the jurisdiction of this Rent Authority.')
			return false
		}
		if (!factsOfCase.trim()) {
			reportError('Enter the facts of the case.')
			return false
		}
		if (!groundsForRelief.trim()) {
			reportError('Enter the grounds for relief.')
			return false
		}
		if (hasPriorProceedings === null) {
			reportError('State whether you have previously filed regarding this matter.')
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
					'Give the case number, the court or authority, and the pendency or decision for every earlier case disclosed.'
				)
				return false
			}
		}
		if (!reliefSought.trim()) {
			reportError('Enter the relief sought.')
			return false
		}
		if (needInterimOrder && !interimOrderSought.trim()) {
			reportError('Enter the interim order sought, or turn off “I need an interim order”.')
			return false
		}
		if (needEnclosures && !listOfEnclosures.trim()) {
			reportError('List the enclosures, or turn off “I am attaching documents”.')
			return false
		}
		if (isRepairs && repairItems.length === 0) {
			reportError('Select the Second Schedule item or items in dispute.')
			return false
		}
		if (isServices && essentialServices.length === 0) {
			reportError('Select the essential supply or service that has been withheld.')
			return false
		}
		if (otherServiceChosen && !essentialServiceOther.trim()) {
			reportError('Describe the other essential service that has been withheld.')
			return false
		}
		if (!verifierName || !verification.relativeName.trim() || !verifierAddress) {
			reportError('Complete the verification particulars (name, relation target and address).')
			return false
		}
		if (!String(verification.age || ageFromDob || '').trim()) {
			reportError('Age is missing. Edit age under Application particulars, or add date of birth in your profile.')
			return false
		}
		if (!verification.place.trim()) {
			reportError('This UIN has no district on record. Place of filing cannot be set automatically.')
			return false
		}
		const allOnLegalAdvice =
			requiredVerificationParas.length > 0 &&
			requiredVerificationParas.every(
				(option) =>
					resolvedVerificationParagraphs[option.number] === PARA_ANSWER.LEGAL_ADVICE
			)
		if (allOnLegalAdvice) {
			reportError(
				'At least one part of the application must remain based on your own knowledge. Leave at least one item unticked under Based on legal advice.'
			)
			return false
		}
		if (!verificationUndertakingAccepted) {
			reportError('Accept the verification undertaking before filing.')
			return false
		}
		if (!effectiveSignatureName) {
			reportError('Enter the name against the signature.')
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
			if (needInterimOrder && interimOrderSought.trim()) {
				formData.append('interim_order_sought', interimOrderSought.trim())
			}
			if (needEnclosures && listOfEnclosures.trim()) {
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
		needEnclosures,
		needInterimOrder,
		oppositePartyName,
		oppositePartyResidentialAddress,
		otherServiceChosen,
		particularsOfViolation,
		priorProceedings,
		recordLoaded,
		reliefSought,
		repairItems,
		reportError,
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
		const ageFromProfile = String(profile.age || ageOn(profileDob) || '').trim()
		setVerification((current) => {
			const nextDob = verificationDob || profileDob
			const nextAge = String(current.age || ageOn(nextDob) || ageFromProfile || '').trim()
			return {
				...current,
				name: selfName || current.name || profile.name,
				address: selfAddress || current.address || profile.address,
				age: nextAge,
				place: districtName || current.place,
				paragraphs: {},
			}
		})
		if (!verificationDob && profileDob) {
			setVerificationDob(profileDob)
		}
		setDobEditing(!(verificationDob || profileDob))
		setVerificationUndertakingAccepted(false)
		setNeedInterimOrder(false)
		setNeedEnclosures(false)
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
								badge="From UIN"
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
									<ReadOnlyField label="A. Applicant name" value={applicantName} icon={User} />
									<ReadOnlyField label="B. Opposite party name" value={oppositePartyName} icon={User} />
									<ReadOnlyField
										label="Applicant residential address"
										value={applicantResidentialAddress}
										icon={MapPin}
										multiline
									/>
									<ReadOnlyField
										label="Opposite party residential address"
										value={oppositePartyResidentialAddress}
										icon={MapPin}
										multiline
									/>
									<ReadOnlyField
										label="District / place of filing"
										value={tenancyDistrict || verification.place}
										icon={MapPin}
										empty="Not on record"
									/>
									<ReadOnlyField
										label="Rent Authority office"
										value={tenancyOffice}
										empty="Not on record"
									/>
								</div>

								<div className="form-iv-applicant-extras">
									<Field
										label="Father / mother / spouse"
										required
										hintInline
										hint="Person you are Son, Daughter or Spouse of"
									>
										<InputShell icon={User}>
											<input
												type="text"
												value={verification.relativeName}
												onChange={(e) => setVerificationField('relativeName', e.target.value)}
												required
												placeholder="Full name"
												className={inputClass}
											/>
										</InputShell>
									</Field>

									<Field
										label="Relation"
										required
										hintInline
										hint="Son, Daughter or Spouse of the person named above"
									>
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
															name="verification_relation_iv"
															value={option.value}
															checked={selected}
															onChange={() => setVerificationField('relation', option.value)}
															className="sr-only"
														/>
														<span>{option.label}</span>
													</label>
												)
											})}
										</div>
									</Field>

									{dobEditing ? (
										<Field
											label="Your age"
											required
											hintInline
											hint="Pick date of birth to set age"
										>
											<div className="form-iv-age-edit">
												<InputShell icon={CalendarDays} className={`${inputShellClass} form-iv-dob-input`}>
													<input
														type="date"
														value={verificationDob}
														onChange={(e) => applyDob(e.target.value)}
														required
														max={dobInputMax()}
														aria-label="Date of birth"
														className={inputClass}
													/>
												</InputShell>
												{ageFromDob ? (
													<span className="form-iv-dob-age-chip">{ageFromDob} years</span>
												) : null}
												{verificationDob ? (
													<button
														type="button"
														className="form-i-change-uin"
														onClick={() => setDobEditing(false)}
													>
														Done
													</button>
												) : null}
												{profile.dateOfBirth &&
												toDateInputValue(profile.dateOfBirth) !== verificationDob ? (
													<button
														type="button"
														className="form-i-change-uin"
														onClick={() => {
															applyDob(profile.dateOfBirth)
															setDobEditing(false)
														}}
													>
														Use profile
													</button>
												) : null}
											</div>
										</Field>
									) : (
										<Field
											label="Your age"
											required
											hintInline
											hint="From your profile date of birth"
										>
											<div className="form-i-field form-i-field--readonly form-i-field--with-action form-iv-age-readonly">
												<span className="form-i-icon-gutter" aria-hidden>
													<CalendarDays size={18} strokeWidth={2} />
												</span>
												<p className="form-iv-age-readonly__line">
													{ageFromDob ? (
														<>
															<span className="form-iv-age-readonly__value">{ageFromDob} years</span>
															{dobDisplay ? (
																<span className="form-iv-age-readonly__source">
																	· Born {dobDisplay}
																</span>
															) : null}
														</>
													) : (
														<span className="form-iv-age-readonly__empty">Not on profile</span>
													)}
												</p>
												<div className="form-i-field-action">
													<button
														type="button"
														className="form-i-change-uin"
														onClick={() => setDobEditing(true)}
													>
														Edit
													</button>
												</div>
											</div>
										</Field>
									)}
								</div>
							</FormSection>

							<FormSection
								step={2}
								tone="application"
								title="Matter applied under"
								description="Choose what this application is about. Extra questions open only when needed."
							>
								<p className="m-0 text-[12px] leading-snug text-slate-500">
									Tap the info (i) icon for the section of the Assam Tenancy Act, 2021 and a short explanation.
								</p>
								<div
									className="tenancy-field-full matter-accordion form-iv-matter"
									role="radiogroup"
									aria-label="Matter applied under"
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
														<div className="form-iv-followup-intro">
															<div className="form-iv-followup-intro__main">
																<p className="form-iv-followup-intro__title">
																	Which repair items are in dispute?
																</p>
																<p className="form-iv-followup-intro__hint">
																	Tick every item that applies. Part A is usually the landlord’s
																	duty; Part B is usually the tenant’s — unless your agreement
																	says otherwise.
																</p>
															</div>
															<div className="form-iv-followup-intro__meta form-iv-followup-intro__meta--row">
																<span className="form-iv-followup-chip form-iv-followup-chip--multi">
																	Choose more than one
																</span>
																{REPAIR_PARTS.map((part) => {
																	const selectedInPart = part.items.filter((item) =>
																		repairItems.includes(item.code)
																	).length
																	const tone = part.part === 'A' ? 'a' : 'b'
																	const side = part.part === 'A' ? 'Landlord' : 'Tenant'
																	return (
																		<span
																			key={part.part}
																			className={`form-iv-followup-chip form-iv-followup-chip--part-${tone}`}
																		>
																			Part {part.part} · {side}
																			<span className="form-iv-followup-chip__count">
																				{selectedInPart}/{part.items.length}
																			</span>
																		</span>
																	)
																})}
															</div>
														</div>
														<div className="form-iv-repair-parts">
															{REPAIR_PARTS.map((part) => {
																const selectedInPart = part.items.filter((item) =>
																	repairItems.includes(item.code)
																).length
																const tone = part.part === 'A' ? 'landlord' : 'tenant'
																return (
																	<div
																		key={part.part}
																		className={`form-iv-repair-part form-iv-repair-part--${tone}`}
																	>
																		<div className="form-iv-repair-part__head">
																			<span className="form-iv-repair-part__badge">
																				Part {part.part}
																			</span>
																			<div className="form-iv-repair-part__titles">
																				<p className="form-iv-repair-part__title">
																					{part.part === 'A'
																						? 'Responsibilities of the Landlord'
																						: 'Periodic repairs by the Tenant'}
																				</p>
																				<p className="form-iv-repair-part__sub">
																					Second Schedule
																				</p>
																			</div>
																			<span className="form-iv-repair-part__count">
																				{selectedInPart}/{part.items.length}
																			</span>
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
																)
															})}
														</div>
													</div>
												) : null}

												{showServices ? (
													<div className="matter-accordion__panel form-iv-services">
														<div className="form-iv-followup-intro">
															<div className="form-iv-followup-intro__main">
																<p className="form-iv-followup-intro__title">
																	Which essential supply or service was withheld?
																</p>
																<p className="form-iv-followup-intro__hint">
																	Tick every service that was cut off or withheld. Use Other if
																	it is not in the list.
																</p>
															</div>
															<div className="form-iv-followup-intro__meta">
																<span className="form-iv-followup-chip form-iv-followup-chip--multi">
																	Choose more than one
																</span>
																<span className="form-iv-followup-chip form-iv-followup-chip--count">
																	{essentialServices.length} selected
																</span>
															</div>
														</div>
														<div className="form-iv-service-card">
															<div className="form-iv-service-card__head">
																<span className="form-iv-service-card__badge">Section 20</span>
																<div className="form-iv-service-card__titles">
																	<p className="form-iv-service-card__title">
																		Essential supplies and services
																	</p>
																	<p className="form-iv-service-card__sub">
																		Explanation to section 20 — select one or more
																	</p>
																</div>
																<span className="form-iv-repair-part__count">
																	{essentialServices.length}/{ESSENTIAL_SERVICES.length}
																</span>
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
																<Field label="Describe the other essential service" required>
																	<InputShell>
																		<input
																			required
																			type="text"
																			value={essentialServiceOther}
																			onChange={(e) => setEssentialServiceOther(e.target.value)}
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
							</FormSection>

							<FormSection
								step={3}
								tone="application"
								title="Details of the application"
								description="Confirm the Rent Authority, then complete each item in order. Optional items may be left unticked."
							>
								<div className="flex flex-col gap-3.5">
									<Field
										label="Jurisdiction of the Rent Authority"
										required
										para={1}
										hint="Confirm that this application is filed before the correct Rent Authority."
									>
										<div className="flex flex-col gap-3">
											<div
												className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3"
												aria-label="Rent Authority"
											>
												<span
													className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-[#6d28d9]"
													aria-hidden
												>
													<MapPin size={18} strokeWidth={2} />
												</span>
												<div className="min-w-0">
													<p className="m-0 text-[15px] font-semibold leading-snug text-slate-900">
														{authorityLine1 ||
															(tenancyOffice
																? `Rent Authority — ${tenancyOffice}`
																: tenancyDistrict
																	? `Rent Authority — ${tenancyDistrict}`
																	: 'Rent Authority')}
													</p>
													{authorityLine2 ? (
														<p className="mt-1 mb-0 text-[13px] leading-relaxed text-slate-600">
															{authorityLine2}
														</p>
													) : tenancyDistrict ? (
														<p className="mt-1 mb-0 text-[13px] leading-relaxed text-slate-600">
															{tenancyOffice ? `${tenancyOffice}, ` : ''}
															{tenancyDistrict}
														</p>
													) : (
														<p className="mt-1 mb-0 text-[13px] italic text-slate-400">
															Authority address not available on this UIN
														</p>
													)}
												</div>
											</div>
											<label
												className={`!m-0 !flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 transition ${
													jurisdictionAccepted
														? 'border-[#c4b5fd] bg-white'
														: 'border-slate-200 bg-white hover:border-[#c4b5fd]'
												}`}
											>
												<input
													type="checkbox"
													checked={jurisdictionAccepted}
													onChange={(e) => setJurisdictionAccepted(e.target.checked)}
													required
													className="sr-only"
												/>
												<FormTick checked={jurisdictionAccepted} />
												<span className="min-w-0 text-sm leading-relaxed text-slate-800">
													{declarationText(DECLARATION.FORM_IV_JURISDICTION)}
												</span>
											</label>
										</div>
									</Field>

									<Field
										label="Particulars of the violation"
										required
										para={2}
										hint="State briefly the dispute or violation against which this application is made."
									>
										<InputShell className={textareaShellClass}>
											<textarea
												required
												value={particularsOfViolation}
												onChange={(e) => setParticularsOfViolation(e.target.value)}
												rows={3}
												placeholder="Example: Unilateral revision of rent without agreement…"
												className="h-full w-full resize-y border-0 bg-transparent px-3.5 py-2.5 text-[15px] text-[#151717] outline-none placeholder:text-slate-400"
											/>
										</InputShell>
									</Field>

									<Field
										label="Facts of the case"
										required
										para={3}
										hint="Set out what happened, in chronological order."
									>
										<InputShell className={textareaShellClass}>
											<textarea
												required
												value={factsOfCase}
												onChange={(e) => setFactsOfCase(e.target.value)}
												rows={4}
												placeholder="Example: On … the agreed rent was … Thereafter on …"
												className="h-full w-full resize-y border-0 bg-transparent px-3.5 py-2.5 text-[15px] text-[#151717] outline-none placeholder:text-slate-400"
											/>
										</InputShell>
									</Field>

									<Field
										label="Grounds for relief"
										required
										para={4}
										hint="State the grounds on which the relief is claimed."
									>
										<InputShell className={textareaShellClass}>
											<textarea
												required
												value={groundsForRelief}
												onChange={(e) => setGroundsForRelief(e.target.value)}
												rows={3}
												placeholder="Example: The revision is contrary to the tenancy agreement and the Act…"
												className="h-full w-full resize-y border-0 bg-transparent px-3.5 py-2.5 text-[15px] text-[#151717] outline-none placeholder:text-slate-400"
											/>
										</InputShell>
									</Field>

									<Field
										label="Earlier proceedings"
										required
										para={5}
										hint="State whether any application, petition, writ petition or suit regarding this matter was previously filed."
									>
										<PriorProceedingsField
											fieldId={DECLARATION.FORM_IV_PRIOR_PROCEEDINGS}
											hint="If Yes, furnish particulars of each case below. If No, select the first option."
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
										hint="State clearly the order prayed for from the Rent Authority."
									>
										<InputShell className={textareaShellClass}>
											<textarea
												required
												value={reliefSought}
												onChange={(e) => setReliefSought(e.target.value)}
												rows={3}
												placeholder="Example: That the revised rent be set aside / determined…"
												className="h-full w-full resize-y border-0 bg-transparent px-3.5 py-2.5 text-[15px] text-[#151717] outline-none placeholder:text-slate-400"
											/>
										</InputShell>
									</Field>

									<div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
										<label className="!m-0 !flex cursor-pointer items-start gap-3">
											<span
												className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-[#ede9fe] px-1.5 text-[13px] font-bold text-[#6d28d9]"
												aria-hidden
											>
												7
											</span>
											<FormTick checked={needInterimOrder} />
											<input
												type="checkbox"
												checked={needInterimOrder}
												onChange={(e) => {
													if (e.target.checked) setNeedInterimOrder(true)
													else turnOffInterimOrder()
												}}
												className="sr-only"
											/>
											<span className="min-w-0 pt-0.5">
												<span className="flex flex-wrap items-center gap-2 text-[15px] font-semibold text-slate-900">
													Interim order sought
													<span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
														Optional
													</span>
												</span>
												<span className="mt-1 block text-[12px] leading-relaxed text-slate-500">
													Temporary relief pending final disposal. Leave unticked if not required.
												</span>
											</span>
										</label>
										{needInterimOrder ? (
											<div className="sm:pl-9">
												<Field label="Nature of interim relief" required>
													<InputShell className={textareaShellClass}>
														<textarea
															value={interimOrderSought}
															onChange={(e) => setInterimOrderSoughtValue(e.target.value)}
															rows={2}
															required
															placeholder="Nature of the interim relief prayed for"
															className="h-full w-full resize-y border-0 bg-transparent px-3.5 py-2.5 text-[15px] text-[#151717] outline-none placeholder:text-slate-400"
														/>
													</InputShell>
												</Field>
											</div>
										) : null}
									</div>

									<div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
										<label className="!m-0 !flex cursor-pointer items-start gap-3">
											<span
												className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-[#ede9fe] px-1.5 text-[13px] font-bold text-[#6d28d9]"
												aria-hidden
											>
												8
											</span>
											<FormTick checked={needEnclosures} />
											<input
												type="checkbox"
												checked={needEnclosures}
												onChange={(e) => {
													if (e.target.checked) setNeedEnclosures(true)
													else turnOffEnclosures()
												}}
												className="sr-only"
											/>
											<span className="min-w-0 pt-0.5">
												<span className="flex flex-wrap items-center gap-2 text-[15px] font-semibold text-slate-900">
													List of enclosures
													<span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
														Optional
													</span>
												</span>
												<span className="mt-1 block text-[12px] leading-relaxed text-slate-500">
													List the affidavits or documents accompanying this application.
												</span>
											</span>
										</label>
										{needEnclosures ? (
											<div className="sm:pl-9">
												<Field label="Documents enclosed" required>
													<InputShell className={textareaShellClass}>
														<textarea
															value={listOfEnclosures}
															onChange={(e) => setListOfEnclosures(e.target.value)}
															rows={2}
															required
															placeholder="Example: Copy of tenancy agreement; rent receipts…"
															className="h-full w-full resize-y border-0 bg-transparent px-3.5 py-2.5 text-[15px] text-[#151717] outline-none placeholder:text-slate-400"
														/>
													</InputShell>
												</Field>
											</div>
										) : null}
									</div>

									<LegalAdvicePartPicker
										options={requiredVerificationParas}
										selectedNumbers={legalAdviceParaNumbers}
										onToggle={toggleLegalAdvicePara}
									/>
								</div>
							</FormSection>

							<FormSection
								step={4}
								tone="signature"
								title="Declaration and signature"
								description="Accept the undertaking, then upload your signature if you have one."
							>
								<div className="form-iv-verify">
									<div className="flex flex-col gap-1.5">
										<div className="flex flex-row flex-wrap items-baseline gap-x-1.5 text-[14px] font-semibold text-[#151717]">
											<span>Undertaking</span>
											<span className="text-red-500">*</span>
										</div>
										<label
											className={`!m-0 !flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 transition ${
												verificationUndertakingAccepted
													? 'border-[#c4b5fd] bg-white'
													: 'border-slate-200 bg-white hover:border-[#c4b5fd]'
											}`}
										>
											<input
												type="checkbox"
												checked={verificationUndertakingAccepted}
												onChange={(e) => setVerificationUndertakingAccepted(e.target.checked)}
												required
												className="sr-only"
											/>
											<FormTick checked={verificationUndertakingAccepted} />
											<span className="min-w-0 text-sm leading-relaxed text-slate-800">
												I hereby declare that I have not suppressed any material facts.
											</span>
										</label>
									</div>

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
											</div>
										) : null}
									</Field>
								</div>
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
