import { useOutletContext } from 'react-router-dom'
import WorkspacePageHeader from '../components/WorkspacePageHeader'

/** Wraps legacy form/status pages in the new workspace chrome. */
function WorkspaceLegacyFrame({ title, subtitle, breadcrumb = [], children }) {
	useOutletContext()
	const crumbs = [{ label: 'Dashboard', to: '/dashboard' }, ...breadcrumb, { label: title }]

	return (
		<div className="ws-page ws-legacy-page">
			<WorkspacePageHeader title={title} subtitle={subtitle} breadcrumb={crumbs} />
			{children}
		</div>
	)
}

export default WorkspaceLegacyFrame
