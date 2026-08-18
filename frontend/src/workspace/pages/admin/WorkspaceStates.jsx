import { useOutletContext } from 'react-router-dom'
import WorkspacePageHeader from '../../components/WorkspacePageHeader'
import MasterNameCrud from './MasterNameCrud'

function WorkspaceStates() {
	const { user } = useOutletContext()

	return (
		<div className="ws-page ws-admin-page">
			<WorkspacePageHeader
				title="States"
				subtitle="Manage state master data used by districts and offices"
			/>
			<MasterNameCrud
				user={user}
				endpoint="/api/states"
				itemLabel="State"
				itemLabelPlural="States"
				title="States"
				hint="Enter the official state name. Letters and spaces only."
				placeholder="e.g. Assam"
			/>
		</div>
	)
}

export default WorkspaceStates
