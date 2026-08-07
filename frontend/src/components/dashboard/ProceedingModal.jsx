import { useState } from 'react'
import WorkflowConfirmModal from './WorkflowConfirmModal'

const noticeTypes = [
    { value: 'appearance', label: 'Notice for Appearance / Joint Discussion' },
    { value: 'applicant_absent', label: 'Next Date Notice (Applicant Absent)' },
    { value: 'respondent_absent', label: 'Next Date Notice (Opposite Party Absent)' },
    { value: 'adjournment', label: 'Adjournment Order' },
    { value: 'proceeding_sheet', label: 'Digital Proceeding Sheet' },
    { value: 'final_order', label: 'Final Order / Judgement' },
    { value: 'ex_parte', label: 'Ex-Parte Order' }
]

export default function ProceedingModal({ open, onClose, onSubmit, isSubmitting }) {
    const [formData, setFormData] = useState({
        notice_type: 'appearance',
        hearing_date: '',
        hearing_time: '',
        venue: '',
        remarks: ''
    })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = () => {
        if (!formData.notice_type) return
        onSubmit(formData)
    }

    return (
        <WorkflowConfirmModal
            open={open}
            onClose={onClose}
            title="Add Proceeding / Notice"
            primaryLabel={isSubmitting ? 'Saving...' : 'Save Proceeding'}
            primaryDisabled={isSubmitting}
            onPrimary={handleSubmit}
        >
            <div className="admin-app-details__grid">
                <div className="admin-app-details__field" style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Notice Type *</label>
                    <select
                        className="ws-input"
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

                <div className="admin-app-details__field">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Hearing Date</label>
                    <input
                        type="date"
                        className="ws-input"
                        name="hearing_date"
                        value={formData.hearing_date}
                        onChange={handleChange}
                    />
                </div>

                <div className="admin-app-details__field">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Hearing Time</label>
                    <input
                        type="time"
                        className="ws-input"
                        name="hearing_time"
                        value={formData.hearing_time}
                        onChange={handleChange}
                    />
                </div>

                <div className="admin-app-details__field" style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Venue</label>
                    <input
                        type="text"
                        className="ws-input"
                        name="venue"
                        placeholder="e.g. Office of the Rent Tribunal, District XYZ"
                        value={formData.venue}
                        onChange={handleChange}
                    />
                </div>

                <div className="admin-app-details__field" style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Remarks / Settlement Terms</label>
                    <textarea
                        className="ws-input"
                        name="remarks"
                        rows={4}
                        placeholder="Enter any additional details required for the notice/order..."
                        value={formData.remarks}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </WorkflowConfirmModal>
    )
}
