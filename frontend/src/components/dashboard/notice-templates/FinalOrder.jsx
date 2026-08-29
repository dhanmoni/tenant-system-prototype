export default function FinalOrder({ data }) {
    return (
        <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem' }}>FINAL ORDER</div>
                <div style={{ borderBottom: '1px solid black', width: '100%', marginBottom: '1rem' }}></div>
                <h3 style={{ margin: 0, fontWeight: 'bold' }}>GOVERNMENT OF ASSAM</h3>
                <h3 style={{ margin: 0, fontWeight: 'bold' }}>OFFICE OF THE RENT AUTHORITY</h3>
                <div style={{ borderBottom: '1px solid black', marginTop: '1rem', width: '100%' }}></div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem' }}>FINAL ORDER</div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <div><strong>Case No. :</strong> {data.caseNo}</div>
                <div><strong>Date :</strong> {data.dateStr}</div>
            </div>

            <div style={{ fontWeight: 'bold', marginBottom: '1rem' }}>In the matter of:</div>
            <div style={{ marginBottom: '2rem' }}>
                <div><strong>{data.applicantName}</strong></div>
                <div>… Applicant/Petitioner</div>
                <div style={{ margin: '1rem 0' }}>-Versus-</div>
                <div><strong>{data.respondentName}</strong></div>
                <div>… Opposite Party/Respondent</div>
            </div>

            <div style={{ fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>ORDER</div>
            
            <p style={{ marginBottom: '1rem' }}>An application concerning a tenancy dispute in respect of the premises situated at {data.propertyAddress} was filed before the Rent Authority through the Assam Tenancy Portal under the Assam Tenancy Act, 2021 and the Rules made thereunder.</p>
            <p style={{ marginBottom: '1rem' }}>After the application was received, notice was issued to the parties and the matter was taken up for hearing/joint discussion on {data.hearing_date}. Both parties were given a reasonable opportunity to present their respective cases.</p>
            <p style={{ marginBottom: '1rem' }}>Both parties appeared before the Rent Authority and were given a reasonable opportunity to be heard.</p>
            <p style={{ marginBottom: '1rem' }}>During the proceedings, both parties expressed their willingness to resolve the dispute amicably and, after discussion, agreed to the following terms and conditions:</p>
            
            <div style={{ marginBottom: '1rem', whiteSpace: 'pre-wrap', marginLeft: '2rem' }}>{data.remarks || '1.\n2.\n3.'}</div>

            <p style={{ marginBottom: '1rem' }}>On consideration of the submissions and the terms placed on record, the Rent Authority finds that the settlement was entered into voluntarily and, on the face of the record, is not contrary to law.</p>
            <p style={{ marginBottom: '1rem' }}>Accordingly, within the scope of the jurisdiction conferred by the Assam Tenancy Act, 2021 and the Rules made thereunder, the dispute is disposed of in terms of the settlement recorded above.</p>
            <p style={{ marginBottom: '1rem' }}>Both parties shall comply with the agreed terms within the stipulated period, subject to their obligations under applicable law.</p>
            <p style={{ marginBottom: '1rem' }}>The case accordingly stands disposed of in the above terms.</p>
            <p style={{ marginBottom: '1rem' }}>Issued digitally through the Assam Tenancy Portal.</p>
            <p style={{ marginBottom: '2rem', fontWeight: 'bold' }}>Ordered accordingly.</p>

            <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold' }}>Rent Authority</div>
                <div>{data.districtName}</div>
                <div>Government of Assam</div>
            </div>
        </>
    )
}
