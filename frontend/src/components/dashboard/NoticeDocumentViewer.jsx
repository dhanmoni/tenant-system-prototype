import React from 'react'
import WorkflowConfirmModal from './WorkflowConfirmModal'

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

    const { notice_type, hearing_date, hearing_time, venue, remarks } = proceeding

    const applicantName = application.appellant_name || application.user?.name || 'Applicant'
    const applicantAddress = application.appellant_residential_address || 'Address'
    
    const respondentName = application.respondent_name || 'Respondent'
    const respondentAddress = application.respondent_residential_address || 'Address'
    
    const propertyAddress = application.rent_tribunal_at || application.district?.name || 'Assam'
    const districtName = application.district?.name || ''
    
    const caseNo = application.application_no
    const dateStr = new Date(proceeding.created_at).toLocaleDateString()

    const renderHeader = (title) => (
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h3 style={{ margin: 0, fontWeight: 'bold' }}>GOVERNMENT OF ASSAM</h3>
            <h3 style={{ margin: 0, fontWeight: 'bold' }}>OFFICE OF THE RENT AUTHORITY</h3>
            {title && (
                <div style={{ fontWeight: 'bold', marginTop: '1rem', textDecoration: 'underline', fontSize: '1.1rem' }}>
                    {title}
                </div>
            )}
        </div>
    )

    const renderParties = () => (
        <div style={{ marginBottom: '2rem' }}>
            <div><strong>Case No. :</strong> {caseNo}</div>
            <div><strong>Date :</strong> {dateStr}</div>
            
            <div style={{ marginTop: '1rem' }}>
                <div><strong>Applicant / Complainant :</strong> {applicantName}</div>
                <div>Address: {applicantAddress}</div>
                <div style={{ marginLeft: '2rem', margin: '0.5rem 0' }}>-Versus-</div>
                <div><strong>Opposite Party / Respondent :</strong> {respondentName}</div>
                <div>Address: {respondentAddress}</div>
            </div>
        </div>
    )

    const renderSignature = () => (
        <div style={{ marginTop: '3rem', textAlign: 'right' }}>
            <div>Issued digitally through the Assam Tenancy Portal.</div>
            <div style={{ marginTop: '1rem', fontWeight: 'bold' }}>Rent Authority</div>
            <div>{districtName}</div>
            <div>Government of Assam</div>
        </div>
    )

    const renderContent = () => {
        switch (notice_type) {
            case 'appearance':
                return (
                    <>
                        {renderHeader('NOTICE FOR APPEARANCE / JOINT DISCUSSION')}
                        {renderParties()}
                        <p style={{ marginBottom: '1rem' }}><strong>Subject:</strong> Notice for joint discussion/hearing in connection with tenancy dispute relating to premises situated at: <strong>{propertyAddress}</strong></p>
                        <p style={{ marginBottom: '1rem' }}>Whereas, an application/petition has been received through the Assam Tenancy Portal regarding dispute between the above-mentioned parties under the provisions of the Assam Tenancy Act, 2021 and Rules framed thereunder;</p>
                        <p style={{ marginBottom: '1rem' }}>And whereas, the undersigned Rent Authority considers it necessary to provide opportunity of hearing and facilitate discussion between both parties for settlement/disposal of the dispute;</p>
                        <p style={{ marginBottom: '1rem' }}>Therefore, both parties are hereby directed to appear before the Rent Authority on:</p>
                        <div style={{ marginLeft: '2rem' }}><strong>Date:</strong> {hearing_date}</div>
                        <div style={{ marginLeft: '2rem' }}><strong>Time:</strong> {hearing_time}</div>
                        <div style={{ marginLeft: '2rem', marginBottom: '1rem' }}><strong>Venue:</strong> {venue}</div>
                        <p style={{ marginBottom: '0.5rem' }}>The parties shall produce all relevant records/documents including:</p>
                        <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
                            <li>Registered Tenancy Agreement</li>
                            <li>Rent payment proof</li>
                            <li>Identity proof</li>
                            <li>Supporting documents relating to dispute</li>
                        </ul>
                        <p style={{ marginTop: '1rem' }}>Non-appearance of either party on the scheduled date may result in ex-parte proceeding/disposal based on available records.</p>
                        {renderSignature()}
                    </>
                )
            case 'applicant_absent':
                return (
                    <>
                        {renderHeader('ORDER')}
                        {renderParties()}
                        <p style={{ marginBottom: '1rem' }}>The matter was fixed for hearing on {hearing_date}.</p>
                        <p style={{ marginBottom: '1rem' }}>The Opposite Party appeared before the Rent Authority; however, the Applicant/Petitioner remained absent without intimation.</p>
                        <p style={{ marginBottom: '1rem' }}>Considering the interest of justice, the matter is adjourned and re-fixed for hearing on:</p>
                        <div style={{ marginLeft: '2rem' }}><strong>Date:</strong> {hearing_date}</div>
                        <div style={{ marginLeft: '2rem' }}><strong>Time:</strong> {hearing_time}</div>
                        <div style={{ marginLeft: '2rem', marginBottom: '1rem' }}><strong>Venue:</strong> {venue}</div>
                        <p style={{ marginBottom: '1rem' }}>The Applicant is directed to appear positively on the next date along with necessary documents and submissions.</p>
                        <p style={{ marginBottom: '1rem' }}>Failure to appear may lead to dismissal/disposal of the petition on available records.</p>
                        {renderSignature()}
                    </>
                )
            case 'respondent_absent':
                return (
                    <>
                        {renderHeader('ORDER FOR RE-FIXING HEARING')}
                        {renderParties()}
                        <p style={{ marginBottom: '1rem' }}>The case was called on for hearing.</p>
                        <p style={{ marginBottom: '1rem' }}>The Applicant/Petitioner appeared physically/online. However, the Opposite Party/Respondent remained absent despite service of notice through the Assam Tenancy Portal/e-mail/SMS.</p>
                        <p style={{ marginBottom: '1rem' }}>Considering the interest of justice, one final opportunity is granted to the Opposite Party to appear and submit response.</p>
                        <p style={{ marginBottom: '1rem' }}>Accordingly, the matter is re-fixed on:</p>
                        <div style={{ marginLeft: '2rem' }}><strong>Date:</strong> {hearing_date}</div>
                        <div style={{ marginLeft: '2rem' }}><strong>Time:</strong> {hearing_time}</div>
                        <div style={{ marginLeft: '2rem', marginBottom: '1rem' }}><strong>Venue:</strong> {venue}</div>
                        <p style={{ marginBottom: '1rem' }}>The Opposite Party is hereby directed to appear positively on the next date failing which the matter may proceed ex-parte.</p>
                        {renderSignature()}
                    </>
                )
            case 'adjournment':
                return (
                    <>
                        {renderHeader('ADJOURNMENT ORDER')}
                        {renderParties()}
                        <p style={{ marginBottom: '1rem' }}>During the course of hearing, both parties sought additional time for submission of documents/further mutual settlement discussion.</p>
                        {remarks && <p style={{ marginBottom: '1rem' }}><strong>Remarks:</strong> {remarks}</p>}
                        <p style={{ marginBottom: '1rem' }}>Considering the submission made by both parties, the matter stands adjourned and re-fixed on:</p>
                        <div style={{ marginLeft: '2rem' }}><strong>Date:</strong> {hearing_date}</div>
                        <div style={{ marginLeft: '2rem' }}><strong>Time:</strong> {hearing_time}</div>
                        <div style={{ marginLeft: '2rem', marginBottom: '1rem' }}><strong>Venue:</strong> {venue}</div>
                        <p style={{ marginBottom: '1rem' }}>Both parties are directed to submit all relevant records/documents before the next date of hearing.</p>
                        <p style={{ marginBottom: '1rem' }}>No further unnecessary adjournment shall ordinarily be granted.</p>
                        {renderSignature()}
                    </>
                )
            case 'proceeding_sheet':
                return (
                    <>
                        {renderHeader('RECORD OF PROCEEDING')}
                        {renderParties()}
                        <p style={{ marginBottom: '1rem' }}>The matter was taken up for hearing/joint discussion before the undersigned Rent Authority.</p>
                        <p style={{ marginBottom: '1rem' }}>Both parties were heard in detail.</p>
                        <p style={{ marginBottom: '1rem' }}>Upon discussion and mediation, the following facts emerged:</p>
                        <div style={{ marginBottom: '1rem', whiteSpace: 'pre-wrap', marginLeft: '2rem' }}>{remarks || 'No remarks provided.'}</div>
                        <p style={{ marginBottom: '1rem' }}>Hence, the matter is placed for final disposal/order.</p>
                        {renderSignature()}
                    </>
                )
            case 'final_order':
                return (
                    <>
                        {renderHeader('FINAL ORDER')}
                        {renderParties()}
                        <p style={{ marginBottom: '1rem' }}>An application relating to tenancy dispute concerning premises situated at {propertyAddress} was filed before this Rent Authority through the Assam Tenancy Portal under the provisions of the Assam Tenancy Act, 2021 and the Rules framed thereunder.</p>
                        <p style={{ marginBottom: '1rem' }}>Upon receipt of the application, notices were issued to both parties and the matter was taken up for hearing/joint discussion.</p>
                        <p style={{ marginBottom: '1rem' }}>Both parties appeared before the Rent Authority physically and were heard.</p>
                        <p style={{ marginBottom: '1rem' }}>During the proceeding, both parties expressed willingness to settle the dispute amicably and mutually agreed upon the following terms and conditions:</p>
                        <div style={{ marginBottom: '1rem', whiteSpace: 'pre-wrap', marginLeft: '2rem' }}>{remarks || 'Terms not provided.'}</div>
                        <p style={{ marginBottom: '1rem' }}>The settlement terms appear lawful, voluntary and acceptable.</p>
                        <p style={{ marginBottom: '1rem' }}>Therefore, in exercise of powers conferred upon the Rent Authority under the Assam Tenancy Act, 2021 and Rules framed thereunder, the dispute stands disposed of in terms of the settlement conditions mentioned above.</p>
                        <p style={{ marginBottom: '1rem' }}>Both parties are directed to comply with the aforesaid terms within the stipulated period.</p>
                        <p style={{ marginBottom: '1rem' }}>Accordingly, the case is disposed of.</p>
                        {renderSignature()}
                    </>
                )
            case 'ex_parte':
                return (
                    <>
                        {renderHeader('EX-PARTE ORDER')}
                        {renderParties()}
                        <p style={{ marginBottom: '1rem' }}>Despite issuance of notice through the Assam Tenancy Portal and other electronic means, the Opposite Party failed to appear before the Rent Authority on the scheduled dates.</p>
                        <p style={{ marginBottom: '1rem' }}>The matter was therefore heard ex-parte on the basis of available records and submissions of the Applicant.</p>
                        <p style={{ marginBottom: '1rem' }}>Upon examination of records and documents, the Rent Authority is satisfied that:</p>
                        <div style={{ marginBottom: '1rem', whiteSpace: 'pre-wrap', marginLeft: '2rem' }}>{remarks || 'Findings not provided.'}</div>
                        <p style={{ marginBottom: '1rem' }}>Accordingly, the following order is passed:</p>
                        <p style={{ marginBottom: '1rem' }}>The case stands disposed of ex-parte.</p>
                        {renderSignature()}
                    </>
                )
            default:
                return <p>Unknown notice type.</p>
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
