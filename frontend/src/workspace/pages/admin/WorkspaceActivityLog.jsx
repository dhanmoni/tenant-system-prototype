import { useOutletContext } from 'react-router-dom'
import WorkspacePageHeader from '../../components/WorkspacePageHeader'
import ActivityLog from './ActivityLog'

function WorkspaceActivityLog() {
	const { user } = useOutletContext()

	return (
		<div className="ws-page ws-admin-page">
			<WorkspacePageHeader
				title="Activity log"
				subtitle="Staff actions recorded on this portal"
			/>
			<ActivityLog user={user} />
		</div>
	)
}

export default WorkspaceActivityLog
