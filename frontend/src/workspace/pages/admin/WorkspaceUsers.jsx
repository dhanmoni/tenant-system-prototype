import { useOutletContext } from 'react-router-dom'
import WorkspacePageHeader from '../../components/WorkspacePageHeader'
import UserManagement from '../../../pages/dashboard/admin/UserManagement'

/** Workspace route entry for staff / user management. */
function WorkspaceUsers() {
	const { user } = useOutletContext()

	return (
		<div className="ws-page ws-legacy-page ws-admin-page">
			<WorkspacePageHeader title="Users" subtitle="Staff and user management" />
			<UserManagement user={user} />
		</div>
	)
}

export default WorkspaceUsers
