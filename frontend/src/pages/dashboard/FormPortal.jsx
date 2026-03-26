import { useOutletContext, useParams } from 'react-router-dom'
import FormIRentRevisionPanel from '../../components/FormIRentRevisionPanel'
import FormIARentRevisionPanel from '../../components/FormIARentRevisionPanel'
import FormIBValuerAppointmentPanel from '../../components/FormIBValuerAppointmentPanel'
import Form4RentCourtPossessionPanel from '../../components/Form4RentCourtPossessionPanel'
import Form5RentCourtFilingPanel from '../../components/Form5RentCourtFilingPanel'
import Form6RentAuthorityFilingPanel from '../../components/Form6RentAuthorityFilingPanel'
import Form7RentCourtAppealPanel from '../../components/Form7RentCourtAppealPanel'
import Form8RentTribunalAppealPanel from '../../components/Form8RentTribunalAppealPanel'

function FormPortal() {
	const { user } = useOutletContext()
	const { formType } = useParams()

	const renderForm = () => {
		switch (formType) {
			case 'form-i-rent-revision':
				return <FormIRentRevisionPanel user={user} />
			case 'form-i-a-other-charges-revision':
				return <FormIARentRevisionPanel user={user} />
			case 'form-i-b-valuer-appointment':
				return <FormIBValuerAppointmentPanel user={user} />
			case 'form-4-rent-court-possession':
				return <Form4RentCourtPossessionPanel user={user} />
			case 'form-5-rent-court-filing':
				return <Form5RentCourtFilingPanel user={user} />
			case 'form-6-rent-authority-filing':
				return <Form6RentAuthorityFilingPanel user={user} />
			case 'form-7-rent-court-appeal':
				return <Form7RentCourtAppealPanel user={user} />
			case 'form-8-rent-tribunal-appeal':
				return <Form8RentTribunalAppealPanel user={user} />
			default:
				return <div>Form not found</div>
		}
	}

	return (
		<div className="auth-card dashboard-card">
			{renderForm()}
		</div>
	)
}

export default FormPortal
