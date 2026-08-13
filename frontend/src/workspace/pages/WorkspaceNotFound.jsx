import { Link } from 'react-router-dom'
import WorkspacePageHeader from '../components/WorkspacePageHeader'

function WorkspaceNotFound() {
	return (
		<div className="ws-page">
			<WorkspacePageHeader
				title="Page not found"
				subtitle="This dashboard address is not a valid screen."
			/>
			<p className="ws-muted" style={{ marginTop: 0 }}>
				Check the link, or return to a known page.
			</p>
			<p>
				<Link to="/dashboard">Back to dashboard</Link>
				{' · '}
				<Link to="/dashboard/services">Services</Link>
			</p>
		</div>
	)
}

export default WorkspaceNotFound
