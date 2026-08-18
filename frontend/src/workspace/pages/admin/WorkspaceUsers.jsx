import { useOutletContext } from 'react-router-dom'
import WorkspacePageHeader from '../../components/WorkspacePageHeader'
import UserManagement from '../../../pages/dashboard/admin/UserManagement'
import { useLanguage } from '../../../i18n'

/** Workspace route entry for staff / user management. */
function WorkspaceUsers() {
	const { user } = useOutletContext()
	const { t } = useLanguage()

	return (
		<div className="ws-page ws-admin-page">
			<WorkspacePageHeader
				title={t('ws.users.pageTitle')}
				subtitle={t('ws.users.pageSubtitle')}
			/>
			<UserManagement user={user} />
		</div>
	)
}

export default WorkspaceUsers
