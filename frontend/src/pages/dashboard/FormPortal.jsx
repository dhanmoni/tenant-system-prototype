import { useEffect } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import FormIRentRevisionPanel from '../../components/FormIRentRevisionPanel'
import FormIARentRevisionPanel from '../../components/FormIARentRevisionPanel'
import FormIBValuerAppointmentPanel from '../../components/FormIBValuerAppointmentPanel'
import Form4RentCourtPossessionPanel from '../../components/Form4RentCourtPossessionPanel'
import Form5RentCourtFilingPanel from '../../components/Form5RentCourtFilingPanel'
import Form6RentAuthorityFilingPanel from '../../components/Form6RentAuthorityFilingPanel'
import Form7RentCourtAppealPanel from '../../components/Form7RentCourtAppealPanel'
import Form8RentTribunalAppealPanel from '../../components/Form8RentTribunalAppealPanel'
import { getFormServiceMeta } from '../../data/tenantServices'
import { APPLICATION_TYPES } from '../../constants/application'


function FormPortal() {
	const { user } = useOutletContext()
	const { formType } = useParams()
	const navigate = useNavigate()
	const serviceMeta = getFormServiceMeta(formType)
	const onBack = () => navigate('/dashboard/services')

	useEffect(() => {
		window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
	}, [formType])

	const renderForm = () => {
		switch (formType) {
			case APPLICATION_TYPES.RENT_REVISION:
				return <FormIRentRevisionPanel user={user} serviceMeta={serviceMeta} onBack={onBack} />
			case APPLICATION_TYPES.OTHER_CHARGES_REVISION:
				return <FormIARentRevisionPanel user={user} serviceMeta={serviceMeta} onBack={onBack} />
			case APPLICATION_TYPES.VALUER_APPOINTMENT:
				return <FormIBValuerAppointmentPanel user={user} serviceMeta={serviceMeta} onBack={onBack} />
			case APPLICATION_TYPES.RENT_COURT_POSSESSION:
				return <Form4RentCourtPossessionPanel user={user} serviceMeta={serviceMeta} onBack={onBack} />
			case APPLICATION_TYPES.RENT_COURT_FILING:
				return <Form5RentCourtFilingPanel user={user} serviceMeta={serviceMeta} onBack={onBack} />
			case APPLICATION_TYPES.RENT_AUTHORITY_FILING:
				return <Form6RentAuthorityFilingPanel user={user} serviceMeta={serviceMeta} onBack={onBack} />
			case APPLICATION_TYPES.RENT_COURT_APPEAL:
				return <Form7RentCourtAppealPanel user={user} serviceMeta={serviceMeta} onBack={onBack} />
			case APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL:
				return <Form8RentTribunalAppealPanel user={user} serviceMeta={serviceMeta} onBack={onBack} />
			default:
				return <div>Form not found</div>
		}
	}

	return renderForm()
}

export default FormPortal
