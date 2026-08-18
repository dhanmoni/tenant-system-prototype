import { useOutletContext } from 'react-router-dom'
import WorkspacePageHeader from '../../components/WorkspacePageHeader'
import TenancyRecords from '../../../pages/dashboard/admin/TenancyRecords'
import { useLanguage } from '../../../i18n'

/** Workspace route entry for UIN / tenancy application records. */
function WorkspaceTenancyRecords() {
	const { user } = useOutletContext()
	const { t } = useLanguage()

	return (
		<div className="ws-page ws-admin-page">
			<WorkspacePageHeader
				title={t('ws.adminTenancy.pageTitle')}
				subtitle={t('ws.adminTenancy.pageSubtitle')}
			/>
			<TenancyRecords user={user} />
		</div>
	)
}

export default WorkspaceTenancyRecords
