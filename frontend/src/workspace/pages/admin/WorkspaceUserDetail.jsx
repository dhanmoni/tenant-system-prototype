import UserDetail from '../../../pages/UserDetail'
import WorkspacePageHeader from '../../components/WorkspacePageHeader'
import { useLanguage } from '../../../i18n'

function WorkspaceUserDetail() {
	const { t } = useLanguage()

	return (
		<div className="ws-page ws-admin-page">
			<WorkspacePageHeader
				title={t('ws.userDetail.pageTitle')}
				subtitle={t('ws.userDetail.pageSubtitle')}
			/>
			<UserDetail />
		</div>
	)
}

export default WorkspaceUserDetail
