import React from 'react'
import WorkflowConfirmModal from './WorkflowConfirmModal'
import AppearanceNotice from './notice-templates/AppearanceNotice'
import ApplicantAbsentNotice from './notice-templates/ApplicantAbsentNotice'
import RespondentAbsentNotice from './notice-templates/RespondentAbsentNotice'
import AdjournmentOrder from './notice-templates/AdjournmentOrder'
import ProceedingSheet from './notice-templates/ProceedingSheet'
import FinalOrder from './notice-templates/FinalOrder'
import ExParteOrder from './notice-templates/ExParteOrder'

export default function NoticeDocumentViewer({ open, onClose, proceeding, application }) {
    if (!proceeding || !application) return null

    const handlePrint = () => {
        const printContent = document.getElementById('notice-print-area')
        const originalContent = document.body.innerHTML

        document.body.innerHTML = printContent.innerHTML
        window.print()
        document.body.innerHTML = originalContent
        window.location.reload() // Quick way to restore React bindings after print
    }

    const { notice_type, hearing_date, hearing_time, venue, remarks, additional_remarks } = proceeding

    const applicantName = application.appellant_name || application.user?.name || 'Applicant'
    const applicantAddress = application.appellant_residential_address || 'Address'
    
    const respondentName = application.respondent_name || 'Respondent'
    const respondentAddress = application.respondent_residential_address || 'Address'
    
    const propertyAddress = application.rent_tribunal_at || application.district?.name || 'Assam'
    const districtName = application.district?.name || ''
    
    const caseNo = application.application_no
    const dateStr = new Date(proceeding.created_at).toLocaleDateString()

    const data = {
        applicantName, applicantAddress, respondentName, respondentAddress, 
        propertyAddress, districtName, caseNo, dateStr,
        hearing_date, hearing_time, venue, remarks, additional_remarks
    }

    const renderContent = () => {
        switch (notice_type) {
            case 'appearance': return <AppearanceNotice data={data} />
            case 'applicant_absent': return <ApplicantAbsentNotice data={data} />
            case 'respondent_absent': return <RespondentAbsentNotice data={data} />
            case 'adjournment': return <AdjournmentOrder data={data} />
            case 'proceeding_sheet': return <ProceedingSheet data={data} />
            case 'final_order': return <FinalOrder data={data} />
            case 'ex_parte': return <ExParteOrder data={data} />
            default: return <p>Unknown notice type.</p>
        }
    }

    return (
        <WorkflowConfirmModal
            open={open}
            onClose={onClose}
            title="View Notice Document"
            primaryLabel="Print / Save PDF"
            onPrimary={handlePrint}
            size="wide"
            bodyClassName="notice-doc-modal"
        >
            <div
                id="notice-print-area"
                className="notice-doc-modal__paper"
            >
                {renderContent()}
            </div>
        </WorkflowConfirmModal>
    )
}
