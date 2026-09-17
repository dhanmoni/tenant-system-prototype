import { useRef, useState } from 'react'
import WorkflowConfirmModal from './WorkflowConfirmModal'

const noticeTypes = [
	{ value: 'appearance', label: 'Notice for Appearance / Joint Discussion' },
	{ value: 'applicant_absent', label: 'Next Date Notice (Applicant Absent)' },
	{ value: 'respondent_absent', label: 'Next Date Notice (Opposite Party Absent)' },
	{ value: 'adjournment', label: 'Adjournment Order' },
	{ value: 'proceeding_sheet', label: 'Digital Proceeding Sheet' },
	{ value: 'final_order', label: 'Final Order / Judgement' },
	{ value: 'ex_parte', label: 'Ex-Parte Order' },
]

/**
 * The fields each notice prints, and so cannot be issued without.
 *
 * Mirrors NoticeDocument::REQUIRED_FIELDS on the server, which is the authority and refuses a
 * proceeding that leaves one of these blank. This copy only lets the form say so before sending.
 */
const REQUIRED_FIELDS = {
	appearance: ['hearing_date', 'hearing_time', 'venue'],
	applicant_absent: ['previous_hearing_date', 'hearing_date', 'hearing_time', 'venue'],
	respondent_absent: ['previous_hearing_date', 'hearing_date', 'hearing_time', 'venue'],
	adjournment: ['previous_hearing_date', 'hearing_date', 'hearing_time'],
	proceeding_sheet: ['hearing_date', 'remarks', 'additional_remarks'],
	final_order: ['hearing_date', 'remarks'],
	ex_parte: ['remarks', 'additional_remarks'],
}

const RESCHEDULING_NOTICES = ['applicant_absent', 'respondent_absent', 'adjournment']

const emptyForm = {
	notice_type: 'appearance',
	previous_hearing_date: '',
	hearing_date: '',
	hearing_time: '',
	venue: '',
	remarks: '',
	additional_remarks: '',
}

const fieldId = (name) => `proceeding-${name.replaceAll('_', '-')}`

/** Open the browser's date or time picker when the field is clicked, not only its icon. */
function openPicker(event) {
	try {
		event.currentTarget.showPicker?.()
	} catch {
		// Some contexts refuse showPicker (a cross-origin frame, for one); typing still works.
	}
}

export default function ProceedingModal({ open, onClose, onSubmit, isSubmitting }) {
	const [formData, setFormData] = useState(emptyForm)
	const [missing, setMissing] = useState([])
	const [wasOpen, setWasOpen] = useState(open)
	const fieldRefs = useRef({})

	// Start clean each time the modal opens. Done while rendering rather than in an effect, so the
	// first frame of the reopened modal never shows the last proceeding's values.
	if (open !== wasOpen) {
		setWasOpen(open)
		if (open) {
			setFormData(emptyForm)
			setMissing([])
		}
	}

	const required = REQUIRED_FIELDS[formData.notice_type] || []
	const isRequired = (name) => required.includes(name)
	// A field left blank under one notice type is not an error once the type no longer needs it.
	const hasError = (name) => isRequired(name) && missing.includes(name)

	const handleChange = (e) => {
		const { name, value } = e.target
		setFormData({ ...formData, [name]: value })
		if (missing.includes(name)) setMissing(missing.filter((field) => field !== name))
	}

	const handleSubmit = () => {
		if (!formData.notice_type) return

		const blank = required.filter((name) => !String(formData[name] ?? '').trim())
		setMissing(blank)
		if (blank.length) {
			fieldRefs.current[blank[0]]?.focus()
			return
		}

		onSubmit(formData)
	}

	const fieldProps = (name) => ({
		id: fieldId(name),
		name,
		value: formData[name],
		onChange: handleChange,
		ref: (el) => {
			fieldRefs.current[name] = el
		},
		required: isRequired(name),
		'aria-invalid': hasError(name) || undefined,
		'aria-describedby': hasError(name) ? `${fieldId(name)}-error` : undefined,
	})

	const renderLabel = (name, text) => (
		<label className="proceeding-modal__label" htmlFor={fieldId(name)}>
			{text}
			{isRequired(name) && (
				<>
					{' '}
					<span className="proceeding-modal__required">*</span>
				</>
			)}
		</label>
	)

	const renderError = (name) =>
		hasError(name) ? (
			<p className="proceeding-modal__error" id={`${fieldId(name)}-error`}>
				This is required for this notice.
			</p>
		) : null

	const getRemarksLabel = (type) => {
		switch (type) {
			case 'proceeding_sheet':
				return 'Facts emerged'
			case 'final_order':
				return 'Agreed terms and conditions'
			case 'ex_parte':
				return 'Findings / Reasons for ex-parte order'
			case 'adjournment':
				return 'Reasons for adjournment / Remarks'
			default:
				return 'Remarks / Additional details'
		}
	}

	const getRemarksPlaceholder = (type) => {
		switch (type) {
			case 'proceeding_sheet':
				return 'Enter the facts emerged during discussion...\n1.\n2.\n3.'
			case 'final_order':
				return 'Enter the terms and conditions agreed upon by both parties...\n1.\n2.\n3.'
			case 'ex_parte':
				return 'Enter the findings and reasons for the ex-parte disposal...\n1.\n2.\n3.'
			case 'adjournment':
				return 'Enter the reasons for adjournment...'
			default:
				return 'Enter any additional details required for the notice or order…'
		}
	}

	const getAdditionalRemarksLabel = (type) => {
		switch (type) {
			case 'proceeding_sheet':
				return 'Terms of settlement'
			case 'ex_parte':
				return 'Orders passed'
			default:
				return 'Additional Remarks'
		}
	}

	const getAdditionalRemarksPlaceholder = (type) => {
		switch (type) {
			case 'proceeding_sheet':
				return 'Enter the terms of settlement agreed upon...\n1.\n2.\n3.'
			case 'ex_parte':
				return 'Enter the orders passed...\n1.\n2.\n3.'
			default:
				return 'Enter any additional remarks…'
		}
	}

	const reschedules = RESCHEDULING_NOTICES.includes(formData.notice_type)

	return (
		<WorkflowConfirmModal
			open={open}
			onClose={onClose}
			title="Add Proceeding / Notice"
			description="Record a notice, hearing, or order against this application. Fields marked * are required."
			primaryLabel={isSubmitting ? 'Saving…' : 'Save Proceeding'}
			primaryDisabled={isSubmitting}
			onPrimary={handleSubmit}
			size="wide"
			bodyClassName="proceeding-modal"
		>
			<div className="proceeding-modal__form">
				<div className="proceeding-modal__field proceeding-modal__field--full">
					<label className="proceeding-modal__label" htmlFor="proceeding-notice-type">
						Notice type <span className="proceeding-modal__required">*</span>
					</label>
					<select
						id="proceeding-notice-type"
						className="proceeding-modal__control"
						name="notice_type"
						value={formData.notice_type}
						onChange={handleChange}
						required
					>
						{noticeTypes.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>

				{reschedules && (
					<div className="proceeding-modal__field proceeding-modal__field--full">
						{renderLabel('previous_hearing_date', 'Previous Hearing date')}
						<input
							type="date"
							className="proceeding-modal__control"
							onClick={openPicker}
							{...fieldProps('previous_hearing_date')}
						/>
						{renderError('previous_hearing_date')}
					</div>
				)}

				<div className="proceeding-modal__row">
					<div className="proceeding-modal__field">
						{renderLabel('hearing_date', reschedules ? 'Next Hearing date' : 'Hearing date')}
						<input
							type="date"
							className="proceeding-modal__control"
							onClick={openPicker}
							{...fieldProps('hearing_date')}
						/>
						{renderError('hearing_date')}
					</div>

					<div className="proceeding-modal__field">
						{renderLabel('hearing_time', 'Hearing time')}
						<input
							type="time"
							className="proceeding-modal__control"
							onClick={openPicker}
							{...fieldProps('hearing_time')}
						/>
						{renderError('hearing_time')}
					</div>
				</div>

				<div className="proceeding-modal__field proceeding-modal__field--full">
					{renderLabel('venue', 'Venue')}
					<input
						type="text"
						className="proceeding-modal__control"
						placeholder="e.g. Office of the Rent Tribunal, District XYZ"
						autoComplete="off"
						{...fieldProps('venue')}
					/>
					{renderError('venue')}
				</div>

				<div className="proceeding-modal__field proceeding-modal__field--full">
					{renderLabel('remarks', getRemarksLabel(formData.notice_type))}
					<textarea
						className="proceeding-modal__control proceeding-modal__control--textarea"
						rows={5}
						placeholder={getRemarksPlaceholder(formData.notice_type)}
						{...fieldProps('remarks')}
					/>
					{renderError('remarks')}
				</div>

				{(formData.notice_type === 'proceeding_sheet' || formData.notice_type === 'ex_parte') && (
					<div className="proceeding-modal__field proceeding-modal__field--full">
						{renderLabel('additional_remarks', getAdditionalRemarksLabel(formData.notice_type))}
						<textarea
							className="proceeding-modal__control proceeding-modal__control--textarea"
							rows={5}
							placeholder={getAdditionalRemarksPlaceholder(formData.notice_type)}
							{...fieldProps('additional_remarks')}
						/>
						{renderError('additional_remarks')}
					</div>
				)}
			</div>
		</WorkflowConfirmModal>
	)
}
