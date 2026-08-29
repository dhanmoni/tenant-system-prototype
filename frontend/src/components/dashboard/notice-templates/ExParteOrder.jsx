export default function ExParteOrder({ data }) {
    return (
        <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0, fontWeight: 'bold' }}>GOVERNMENT OF ASSAM</h3>
                <h3 style={{ margin: 0, fontWeight: 'bold' }}>OFFICE OF THE RENT AUTHORITY</h3>
                <div>{data.districtName}</div>
                <div style={{ borderBottom: '1px solid black', marginTop: '1rem', marginBottom: '1rem', width: '100%' }}></div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem' }}>EX-PARTE ORDER</div>
                <div style={{ fontStyle: 'italic', marginBottom: '1rem' }}>(If one party does not appear)</div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>EX-PARTE ORDER</div>
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

            <p style={{ marginBottom: '1rem' }}>Despite service of notice through the Assam Tenancy Portal and other available electronic means, the Opposite Party did not appear before the Rent Authority on the dates fixed for hearing.</p>
            <p style={{ marginBottom: '1rem' }}>After recording the absence of the Opposite Party, the matter was taken up ex-parte on the basis of the available records and the submissions and documents placed on record by the Applicant.</p>
            <p style={{ marginBottom: '1rem' }}>Having considered the records, documents and submissions available, the Rent Authority is satisfied, to the extent necessary for disposal of the proceeding, that:</p>
            
            <div style={{ marginBottom: '1rem', whiteSpace: 'pre-wrap', marginLeft: '2rem' }}>{data.remarks || '1.\n2.\n3.'}</div>

            <p style={{ marginBottom: '1rem' }}>Accordingly, and for the reasons recorded hereinabove, the following order is hereby passed:</p>
            
            <div style={{ marginBottom: '1rem', whiteSpace: 'pre-wrap', marginLeft: '2rem' }}>{data.additional_remarks || '1.\n2.\n3.'}</div>

            <p style={{ marginBottom: '1rem' }}>The case accordingly stands disposed of ex-parte, subject to any remedy available to the affected party under applicable law.</p>
            <p style={{ marginBottom: '2rem' }}>Issued digitally through Assam Tenancy Portal.</p>

            <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold' }}>Rent Authority</div>
            </div>
        </>
    )
}
