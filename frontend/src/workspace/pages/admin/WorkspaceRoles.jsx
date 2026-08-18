import { useOutletContext } from 'react-router-dom'
import WorkspacePageHeader from '../../components/WorkspacePageHeader'
import MasterNameCrud from './MasterNameCrud'

function WorkspaceRoles() {
	const { user } = useOutletContext()

	return (
		<div className="ws-page ws-admin-page">
			<WorkspacePageHeader
				title="Roles"
				subtitle="Staff role labels used on user records"
			/>
			<MasterNameCrud
				user={user}
				endpoint="/api/roles"
				itemLabel="Role"
				itemLabelPlural="Roles"
				title="Roles"
				hint="Letters and spaces only. This list is master data for staff profiles — login permissions still use system role keys."
				placeholder="e.g. Rent Authority"
			/>
		</div>
	)
}

export default WorkspaceRoles
