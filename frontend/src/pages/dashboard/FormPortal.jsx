import { lazy, Suspense, useEffect } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { getFormServiceMeta } from '../../data/tenantServices'
import { APPLICATION_TYPES } from '../../constants/application'
import ServiceFormShell from '../../components/forms/ServiceFormShell'
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
		return (
			<div className="service-form-page">
				<p className="ws-breadcrumb">
					<Link to="/dashboard/services">All services</Link>
					<span className="ws-breadcrumb-sep" aria-hidden>
						/
					</span>
					<span>Unavailable</span>
				</p>
				<p className="ws-muted">This form is not available.</p>
				<Link to="/dashboard/services" className="ws-btn ws-btn--outline">
					Back to services
				</Link>
			</div>
		)
	}

	return (
		<ServiceFormShell serviceMeta={serviceMeta}>
			<Suspense fallback={<WorkspaceRouteLoader label="Opening form…" />}>
				<Panel user={user} serviceMeta={serviceMeta} onBack={onBack} />
			</Suspense>
		</ServiceFormShell>
	)
}

export default FormPortal
