import { useOutletContext } from 'react-router-dom'
import WorkspacePageHeader from '../../components/WorkspacePageHeader'
import TenancyRecords from '../../../pages/dashboard/admin/TenancyRecords'

/** Workspace route entry for UIN / tenancy application records. */
function WorkspaceTenancyRecords() {
	const { user } = useOutletContext()

	return (
		<div className="ws-page ws-legacy-page ws-admin-page">
			<WorkspacePageHeader
				title="Tenancy applications"
				subtitle="UIN applications"
			/>
			<TenancyRecords user={user} />
		</div>
	)
}

export default WorkspaceTenancyRecords
