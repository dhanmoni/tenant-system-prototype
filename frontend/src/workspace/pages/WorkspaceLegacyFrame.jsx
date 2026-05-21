import { useOutletContext } from 'react-router-dom'
import WorkspacePageHeader from '../components/WorkspacePageHeader'

/** Wraps legacy form/status pages in the new workspace chrome. */
function WorkspaceLegacyFrame({
	title,
	subtitle,
	breadcrumb = [],
	compact = false,
	children,
}) {
	useOutletContext()
	const crumbs = [
		{ label: 'Dashboard', to: '/dashboard' },
		...breadcrumb,
		...(title ? [{ label: title }] : []),
	]

	return (
		<div className="ws-page ws-legacy-page ws-admin-page">
			<WorkspacePageHeader
				title={compact ? null : title}
				subtitle={compact ? null : subtitle}
				breadcrumb={crumbs}
			/>
			{children}
		</div>
	)
}

export default WorkspaceLegacyFrame
