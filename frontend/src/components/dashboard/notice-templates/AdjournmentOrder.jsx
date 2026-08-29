export default function AdjournmentOrder({ data }) {
    return (
        <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>ADJOURNMENT ORDER</div>
                <div style={{ fontStyle: 'italic', marginBottom: '1rem' }}>(For further document submission / settlement discussion)</div>
                <div style={{ borderBottom: '1px solid black', width: '100%', marginBottom: '1rem' }}></div>
                <h3 style={{ margin: 0, fontWeight: 'bold' }}>GOVERNMENT OF ASSAM</h3>
                <h3 style={{ margin: 0, fontWeight: 'bold' }}>OFFICE OF THE RENT AUTHORITY</h3>
                <div style={{ borderBottom: '1px solid black', marginTop: '1rem', width: '100%' }}></div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <div><strong>Case No. :</strong> {data.caseNo}</div>
                <div><strong>Date :</strong> {data.dateStr}</div>
            </div>

            <div style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Parties</div>
            <div style={{ marginBottom: '2rem' }}>
                <div><strong>Applicant / Complainant:</strong></div>
                <div>{data.applicantName}</div>
                <div>Address: {data.applicantAddress}</div>
                <div style={{ margin: '1rem 0' }}>-Versus-</div>
                <div><strong>Opposite Party / Respondent:</strong></div>
                <div>{data.respondentName}</div>
                <div>Address: {data.respondentAddress}</div>
            </div>

            <div style={{ fontWeight: 'bold', marginBottom: '1rem' }}>ADJOURNMENT ORDER</div>
            <p style={{ marginBottom: '1rem' }}>During the hearing held on {data.previous_hearing_date || data.dateStr}, both parties requested additional time to place further documents on record and/or to continue their settlement discussions.</p>
            <p style={{ marginBottom: '1rem' }}>Having considered the submissions of both parties, and to allow them a reasonable opportunity to place the relevant material on record and, if possible, resolve the dispute, the matter is adjourned and re-fixed on:</p>
            
            <div style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
                <div><strong>Date:</strong> {data.hearing_date}</div>
                <div><strong>Time:</strong> {data.hearing_time}</div>
            </div>

            <p style={{ marginBottom: '1rem' }}>Both parties shall place all relevant records and documents on record before the next date of hearing.</p>
            <p style={{ marginBottom: '2rem' }}>No further adjournment will ordinarily be granted unless sufficient cause is shown and the request is found justified in the circumstances of the case.</p>

            <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold' }}>Rent Authority</div>
                <div>{data.districtName}</div>
            </div>
        </>
    )
}
