import { lazy, Suspense, useEffect } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { getFormServiceMeta } from '../../data/tenantServices'
import { APPLICATION_TYPES } from '../../constants/application'
import WorkspaceRouteLoader from '../../workspace/components/WorkspaceRouteLoader'

const formPanelLoaders = {
	[APPLICATION_TYPES.RENT_REVISION]: () => import('../../components/FormIRentRevisionPanel'),
	[APPLICATION_TYPES.OTHER_CHARGES_REVISION]: () => import('../../components/FormIARentRevisionPanel'),
	[APPLICATION_TYPES.VALUER_APPOINTMENT]: () => import('../../components/FormIBValuerAppointmentPanel'),
	[APPLICATION_TYPES.RENT_COURT_POSSESSION]: () => import('../../components/Form4RentCourtPossessionPanel'),
	[APPLICATION_TYPES.RENT_COURT_FILING]: () => import('../../components/Form5RentCourtFilingPanel'),
	[APPLICATION_TYPES.RENT_AUTHORITY_FILING]: () => import('../../components/Form6RentAuthorityFilingPanel'),
	[APPLICATION_TYPES.RENT_COURT_APPEAL]: () => import('../../components/Form7RentCourtAppealPanel'),
	[APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL]: () => import('../../components/Form8RentTribunalAppealPanel'),
}

const formPanels = Object.fromEntries(
	Object.entries(formPanelLoaders).map(([type, loader]) => [type, lazy(loader)]),
)

/** Prefetch all service form chunks when the services catalog is open / hovered. */
export function prefetchServiceFormPanels() {
	Object.values(formPanelLoaders).forEach((loader) => {
		void loader()
	})
}

function FormPortal() {
	const { user } = useOutletContext()
	const { formType } = useParams()
	const navigate = useNavigate()
	const serviceMeta = getFormServiceMeta(formType)
	const onBack = () => navigate('/dashboard/services')
	const Panel = formPanels[formType]

	useEffect(() => {
		window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
	}, [formType])

	if (!Panel) {
		return <div className="ws-dashboard-loading">Form not found</div>
	}

	return (
		<Suspense fallback={<WorkspaceRouteLoader label="Opening form…" />}>
			<Panel user={user} serviceMeta={serviceMeta} onBack={onBack} />
		</Suspense>
	)
}

export default FormPortal
