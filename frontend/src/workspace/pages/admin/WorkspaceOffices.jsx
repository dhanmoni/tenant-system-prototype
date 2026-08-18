import { useOutletContext } from 'react-router-dom'
import WorkspacePageHeader from '../../components/WorkspacePageHeader'
import OfficeManagement from './OfficeManagement'

function WorkspaceOffices() {
	const { user } = useOutletContext()

	return (
		<div className="ws-page ws-admin-page">
			<WorkspacePageHeader
				title="Offices"
				subtitle="Circle and district offices used on applications"
			/>
			<OfficeManagement user={user} />
		</div>
	)
}

export default WorkspaceOffices
