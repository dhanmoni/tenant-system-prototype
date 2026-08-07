import WorkspacePageHeader from '../../components/WorkspacePageHeader'
import AdminApplicationDetails from '../../../pages/dashboard/admin/AdminApplicationDetails'

/** Workspace route entry for admin application detail (compact header). */
function WorkspaceAdminApplicationDetails() {
	return (
		<div className="ws-page ws-legacy-page ws-admin-page">
			<WorkspacePageHeader title={null} subtitle={null} />
			<AdminApplicationDetails />
		</div>
	)
}

export default WorkspaceAdminApplicationDetails
