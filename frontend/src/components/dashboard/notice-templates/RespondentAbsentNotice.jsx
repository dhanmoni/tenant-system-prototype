export default function RespondentAbsentNotice({ data }) {
    return (
        <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>NEXT DATE NOTICE</div>
                <div style={{ fontStyle: 'italic', marginBottom: '1rem' }}>(When Opposite Party absent)</div>
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

            <div style={{ fontWeight: 'bold', marginBottom: '1rem' }}>ORDER RE-FIXING THE HEARING</div>
            <p style={{ marginBottom: '1rem' }}>The case was taken up for hearing on {data.previous_hearing_date || data.dateStr}.</p>
            <p style={{ marginBottom: '1rem' }}>The Applicant/Petitioner appeared physically/online. The Opposite Party/Respondent, however, remained absent despite service of notice through the Assam Tenancy Portal/e-mail/SMS, as recorded on the portal.</p>
            <p style={{ marginBottom: '1rem' }}>In the interest of justice, and subject to law, the Opposite Party/Respondent is given one further opportunity to appear and place its/his/her response on record.</p>
            <p style={{ marginBottom: '1rem' }}>Accordingly, the matter is re-fixed for hearing on:</p>
            
            <div style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
                <div><strong>Date:</strong> {data.hearing_date}</div>
                <div><strong>Time:</strong> {data.hearing_time}</div>
                <div><strong>Venue:</strong> {data.venue}</div>
            </div>

            <p style={{ marginBottom: '2rem' }}>The Opposite Party/Respondent shall appear on the next date and place its/his/her response and supporting documents on record. If the party fails to do so, the matter may proceed ex-parte and may be disposed of on the basis of the available record.</p>

            <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold' }}>Rent Authority</div>
                <div>{data.districtName}</div>
            </div>
        </>
    )
}
