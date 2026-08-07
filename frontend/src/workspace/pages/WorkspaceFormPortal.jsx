import WorkspacePageHeader from '../components/WorkspacePageHeader'
import FormPortal from '../../pages/dashboard/FormPortal'

/** Workspace route entry for Form I–VIII service applications. */
function WorkspaceFormPortal() {
	return (
		<div className="ws-page ws-legacy-page ws-admin-page">
			<WorkspacePageHeader title="Application form" subtitle="Complete and submit" />
			<FormPortal />
		</div>
	)
}

export default WorkspaceFormPortal
