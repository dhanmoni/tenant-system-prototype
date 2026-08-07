import WorkspacePageHeader from '../components/WorkspacePageHeader'
import ApplicationDetails from '../../pages/dashboard/ApplicationDetails'

/** Workspace route entry for citizen/staff application detail view. */
function WorkspaceApplicationDetails() {
	return (
		<div className="ws-page ws-legacy-page ws-admin-page">
			<WorkspacePageHeader title="Application details" subtitle="View submission" />
			<ApplicationDetails />
		</div>
	)
}

export default WorkspaceApplicationDetails
