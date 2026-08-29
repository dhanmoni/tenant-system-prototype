import { useEffect, useState } from 'react'
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

const emptyForm = {
	notice_type: 'appearance',
	hearing_date: '',
	hearing_time: '',
	venue: '',
	remarks: '',
	additional_remarks: '',
}

export default function ProceedingModal({ open, onClose, onSubmit, isSubmitting }) {
	const [formData, setFormData] = useState(emptyForm)

	useEffect(() => {
		if (open) setFormData(emptyForm)
	}, [open])

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value })
	}

	const handleSubmit = () => {
		if (!formData.notice_type) return
		onSubmit(formData)
	}

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

				<div className="proceeding-modal__row">
					<div className="proceeding-modal__field">
						<label className="proceeding-modal__label" htmlFor="proceeding-hearing-date">
							Hearing date
						</label>
						<input
							id="proceeding-hearing-date"
							type="date"
							className="proceeding-modal__control"
							name="hearing_date"
							value={formData.hearing_date}
							onChange={handleChange}
						/>
					</div>

					<div className="proceeding-modal__field">
						<label className="proceeding-modal__label" htmlFor="proceeding-hearing-time">
							Hearing time
						</label>
						<input
							id="proceeding-hearing-time"
							type="time"
							className="proceeding-modal__control"
							name="hearing_time"
							value={formData.hearing_time}
							onChange={handleChange}
						/>
					</div>
				</div>

				<div className="proceeding-modal__field proceeding-modal__field--full">
					<label className="proceeding-modal__label" htmlFor="proceeding-venue">
						Venue
					</label>
					<input
						id="proceeding-venue"
						type="text"
						className="proceeding-modal__control"
						name="venue"
						placeholder="e.g. Office of the Rent Tribunal, District XYZ"
						value={formData.venue}
						onChange={handleChange}
						autoComplete="off"
					/>
				</div>

				<div className="proceeding-modal__field proceeding-modal__field--full">
					<label className="proceeding-modal__label" htmlFor="proceeding-remarks">
						{getRemarksLabel(formData.notice_type)}
					</label>
					<textarea
						id="proceeding-remarks"
						className="proceeding-modal__control proceeding-modal__control--textarea"
						name="remarks"
						rows={5}
						placeholder={getRemarksPlaceholder(formData.notice_type)}
						value={formData.remarks}
						onChange={handleChange}
					/>
				</div>

				{(formData.notice_type === 'proceeding_sheet' || formData.notice_type === 'ex_parte') && (
					<div className="proceeding-modal__field proceeding-modal__field--full">
						<label className="proceeding-modal__label" htmlFor="proceeding-additional-remarks">
							{getAdditionalRemarksLabel(formData.notice_type)}
						</label>
						<textarea
							id="proceeding-additional-remarks"
							className="proceeding-modal__control proceeding-modal__control--textarea"
							name="additional_remarks"
							rows={5}
							placeholder={getAdditionalRemarksPlaceholder(formData.notice_type)}
							value={formData.additional_remarks}
							onChange={handleChange}
						/>
					</div>
				)}
			</div>
		</WorkflowConfirmModal>
	)
}
