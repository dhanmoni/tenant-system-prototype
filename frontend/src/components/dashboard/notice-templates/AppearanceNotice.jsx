export default function AppearanceNotice({ data }) {
    return (
        <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0, fontWeight: 'bold' }}>GOVERNMENT OF ASSAM</h3>
                <h3 style={{ margin: 0, fontWeight: 'bold' }}>OFFICE OF THE RENT AUTHORITY</h3>
                <div>[{data.districtName}]</div>
                <div style={{ borderBottom: '1px solid black', marginTop: '1rem', marginBottom: '1rem', width: '100%' }}></div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    NOTICE FOR APPEARANCE, JOINT DISCUSSION AND HEARING
                </div>
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
                <div><strong>Case No. :</strong> {data.caseNo}</div>
                <div><strong>Date :</strong> {data.dateStr}</div>
            </div>

            <p style={{ marginBottom: '1rem' }}>In the matter of a tenancy dispute arising from a tenancy agreement registered through the Assam Tenancy Portal and governed by the Assam Tenancy Act, 2021 and the Rules made thereunder.</p>

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

            <p style={{ marginBottom: '1rem' }}><strong>Subject:</strong></p>
            <p style={{ marginBottom: '1rem' }}>Notice for joint discussion/hearing in connection with tenancy dispute relating to premises situated at:</p>
            <p style={{ marginBottom: '1rem' }}><strong>Property Address:</strong><br />{data.propertyAddress}</p>

            <p style={{ marginBottom: '1rem' }}>Whereas an application/petition has been received through the Assam Tenancy Portal in relation to a tenancy dispute between the above-named parties under the Assam Tenancy Act, 2021 and the Rules made thereunder;</p>
            <p style={{ marginBottom: '1rem' }}>And whereas, having regard to the nature of the dispute, the undersigned Rent Authority considers it appropriate to give both parties a fair and reasonable opportunity to be heard and, where possible, to facilitate a mutually acceptable settlement;</p>
            <p style={{ marginBottom: '1rem' }}>Accordingly, both parties are required to appear before the Rent Authority on the date, at the time and at the venue specified below:</p>

            <ul style={{ marginBottom: '1rem', listStyleType: 'disc', marginLeft: '2rem' }}>
                <li><strong>Date:</strong> {data.hearing_date}</li>
                <li><strong>Time:</strong> {data.hearing_time}</li>
                <li><strong>Venue:</strong> {data.venue}</li>
            </ul>

            <p style={{ marginBottom: '1rem' }}>Both parties are requested to bring all relevant records and documents in their possession or control, including the following:</p>

            <ol style={{ marginBottom: '1rem', marginLeft: '2rem' }}>
                <li>Registered Tenancy Agreement</li>
                <li>Rent payment proof</li>
                <li>Identity proof</li>
                <li>Supporting documents relating to dispute</li>
            </ol>

            <p style={{ marginBottom: '1rem' }}>If either party fails to appear on the date fixed without sufficient cause, the Rent Authority may proceed with the matter in accordance with law, including by taking up the matter ex-parte, and may decide the case on the basis of the records and materials available.</p>
            <p style={{ marginBottom: '2rem' }}>This notice has been generated digitally through the Assam Tenancy Portal and, accordingly, does not require a physical signature.</p>

            <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold' }}>Rent Authority</div>
                <div>{data.districtName}</div>
                <div>Government of Assam</div>
            </div>
        </>
    )
}
