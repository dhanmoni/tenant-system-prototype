import { useLocation, useOutletContext } from 'react-router-dom'
import WorkspacePageHeader from '../../components/WorkspacePageHeader'
import ApplicationList from '../../../pages/dashboard/admin/ApplicationList'
import { useLanguage } from '../../../i18n'

function WorkspaceServiceApplications() {
	const { user } = useOutletContext()
	const { t } = useLanguage()
	const location = useLocation()
	const isInbox = location.pathname.includes('/admin/inbox')
	const isValuer = user?.role === 'valuer'

	const title = isInbox
		? isValuer
			? t('ws.adminApps.valuerTitle')
			: t('ws.adminApps.inboxTitle')
		: t('ws.adminApps.pageTitle')
	const subtitle = isInbox
		? isValuer
			? t('ws.adminApps.valuerSubtitle')
			: t('ws.adminApps.inboxSubtitle')
		: t('ws.adminApps.pageSubtitle')

	return (
		<div className="ws-page ws-admin-page">
			<WorkspacePageHeader title={title} subtitle={subtitle} />
			<ApplicationList user={user} />
		</div>
	)
}

export default WorkspaceServiceApplications
