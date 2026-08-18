import { Navigate, useParams } from 'react-router-dom'
import { SERVICE_APPLICATION_TYPES } from '../../constants/application'
import WorkspaceNotFound from './WorkspaceNotFound'

const FORM_SLUGS = new Set(SERVICE_APPLICATION_TYPES)

/** Old `/dashboard/:formType` bookmarks → `/dashboard/forms/:formType`. */
function LegacyFormRedirect() {
	const { formType } = useParams()
	if (FORM_SLUGS.has(formType)) {
		return <Navigate to={`/dashboard/forms/${formType}`} replace />
	}
	return <WorkspaceNotFound />
}

export default LegacyFormRedirect
