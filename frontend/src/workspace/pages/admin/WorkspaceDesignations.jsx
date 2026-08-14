import { useOutletContext } from 'react-router-dom'
import WorkspacePageHeader from '../../components/WorkspacePageHeader'
import MasterNameCrud from './MasterNameCrud'

function WorkspaceDesignations() {
	const { user } = useOutletContext()

	return (
		<div className="ws-page ws-admin-page">
			<WorkspacePageHeader
				title="Designations"
				subtitle="Official titles assigned to staff accounts"
			/>
			<MasterNameCrud
				user={user}
				endpoint="/api/designations"
				itemLabel="Designation"
				itemLabelPlural="Designations"
				title="Designations"
				hint="Enter the designation as it should appear on staff profiles. Letters and spaces only."
				placeholder="e.g. Assistant Director"
			/>
		</div>
	)
}

export default WorkspaceDesignations
