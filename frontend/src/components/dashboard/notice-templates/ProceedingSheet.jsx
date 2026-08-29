export default function ProceedingSheet({ data }) {
    return (
        <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem' }}>PROCEEDING SHEET / MINUTES OF JOINT DISCUSSION</div>
                <div style={{ borderBottom: '1px solid black', width: '100%', marginBottom: '1rem' }}></div>
                <h3 style={{ margin: 0, fontWeight: 'bold' }}>GOVERNMENT OF ASSAM</h3>
                <h3 style={{ margin: 0, fontWeight: 'bold' }}>OFFICE OF THE RENT AUTHORITY</h3>
                <div style={{ borderBottom: '1px solid black', marginTop: '1rem', width: '100%' }}></div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <div><strong>Case No. :</strong> {data.caseNo}</div>
                <div><strong>Date :</strong> {data.dateStr}</div>
            </div>

            <div style={{ fontWeight: 'bold', marginBottom: '1rem' }}>RECORD OF PROCEEDING</div>
            <p style={{ marginBottom: '1rem' }}>The tenancy dispute between the following parties was taken up for hearing/joint discussion:</p>

            <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontWeight: 'bold' }}>Applicant/Petitioner</div>
                <div>{data.applicantName}</div>
                <div style={{ margin: '1rem 0' }}>-Versus-</div>
                <div style={{ fontWeight: 'bold' }}>Respondent/Opposite Party</div>
                <div>{data.respondentName}</div>
            </div>

            <p style={{ marginBottom: '1rem' }}>before the undersigned Rent Authority on {data.hearing_date}.</p>
            <p style={{ marginBottom: '1rem' }}>The following persons appeared:</p>
            
            <table style={{ width: '100%', marginBottom: '1rem', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>Sl. No.</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Mode of Appearance</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td>{data.applicantName}</td>
                        <td>Applicant</td>
                        <td>Physical</td>
                    </tr>
                    <tr>
                        <td>2</td>
                        <td>{data.respondentName}</td>
                        <td>Respondent</td>
                        <td>Physical</td>
                    </tr>
                </tbody>
            </table>

            <p style={{ marginBottom: '1rem' }}>Both parties were given an opportunity to be heard, and their respective submissions were heard and taken on record.</p>
            <p style={{ marginBottom: '1rem' }}>During the hearing and joint discussion/mediation, the following facts and circumstances emerged from the records and submissions:</p>
            
            <div style={{ marginBottom: '1rem', whiteSpace: 'pre-wrap', marginLeft: '2rem' }}>{data.remarks || '1.\n2.\n3.'}</div>

            <p style={{ marginBottom: '1rem' }}>Following the discussion, the parties voluntarily agreed to the following terms of settlement:</p>
            
            <div style={{ marginBottom: '1rem', whiteSpace: 'pre-wrap', marginLeft: '2rem' }}>{data.additional_remarks || '1.\n2.\n3.'}</div>

            <p style={{ marginBottom: '1rem' }}>The parties stated and confirmed that the settlement was reached voluntarily, of their own free will, and without coercion, undue influence, misrepresentation or pressure.</p>
            <p style={{ marginBottom: '2rem' }}>The matter is accordingly placed before the Rent Authority for consideration and for passing an appropriate order in accordance with law.</p>

            <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold' }}>Rent Authority</div>
                <div>{data.districtName}</div>
            </div>
        </>
    )
}
