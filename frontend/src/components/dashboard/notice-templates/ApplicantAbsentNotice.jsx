export default function ApplicantAbsentNotice({ data }) {
    return (
        <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>NEXT DATE NOTICE</div>
                <div style={{ fontStyle: 'italic', marginBottom: '1rem' }}>(When Applicant absent)</div>
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

            <div style={{ fontWeight: 'bold', marginBottom: '1rem' }}>ORDER</div>
            <p style={{ marginBottom: '1rem' }}>The matter was fixed for hearing on {data.dateStr} and was called on that date. The Opposite Party appeared before the Rent Authority. However, the Applicant/Petitioner was absent, and no intimation or sufficient cause for the absence was placed on record.</p>
            <p style={{ marginBottom: '1rem' }}>In the interest of justice, and to give the Applicant/Petitioner a further opportunity to be heard, the matter is adjourned and re-fixed for hearing on:</p>
            <div style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
                <div><strong>Date:</strong> {data.hearing_date}</div>
                <div><strong>Time:</strong> {data.hearing_time}</div>
                <div><strong>Venue:</strong> {data.venue}</div>
            </div>

            <p style={{ marginBottom: '1rem' }}>The Applicant/Petitioner shall appear on the next date of hearing, either personally or through an authorised representative, as permitted by law, and shall place on record the relevant documents and submissions.</p>
            <p style={{ marginBottom: '2rem' }}>If the Applicant/Petitioner does not appear on the next date without sufficient cause, the petition may be dealt with or disposed of in accordance with law on the basis of the materials available on record.</p>

            <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold' }}>Rent Authority</div>
                <div>{data.districtName}</div>
            </div>
        </>
    )
}
