import { useOutletContext } from 'react-router-dom'
import WorkspacePageHeader from '../../components/WorkspacePageHeader'
import DistrictManagement from './DistrictManagement'

/** Workspace-native district master data (super admin). */
function WorkspaceDistricts() {
	const { user } = useOutletContext()

	return (
		<div className="ws-page ws-admin-page ws-districts">
			<WorkspacePageHeader
				title="Districts"
				subtitle="Manage district master data"
			/>
			<DistrictManagement user={user} />
		</div>
	)
}

export default WorkspaceDistricts
