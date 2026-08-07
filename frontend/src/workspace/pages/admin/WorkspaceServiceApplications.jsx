import { useOutletContext } from 'react-router-dom'
import WorkspacePageHeader from '../../components/WorkspacePageHeader'
import ApplicationList from '../../../pages/dashboard/admin/ApplicationList'

/**
 * Workspace route entry for service application lists (inbox / all applications).
 * Titles differ by route; body is still the shared ApplicationList until rewritten.
 */
function WorkspaceServiceApplications({
	title = 'Service applications',
	subtitle = 'Rent Authority, Court, and Tribunal forms',
}) {
	const { user } = useOutletContext()

	return (
		<div className="ws-page ws-legacy-page ws-admin-page">
			<WorkspacePageHeader title={title} subtitle={subtitle} />
			<ApplicationList user={user} />
		</div>
	)
}

export default WorkspaceServiceApplications
