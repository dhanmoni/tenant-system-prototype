import { useOutletContext } from 'react-router-dom'
import WorkspacePageHeader from '../../components/WorkspacePageHeader'
import DistrictManagement from './DistrictManagement'
import { useLanguage } from '../../../i18n'

/** Workspace-native district master data (super admin). */
function WorkspaceDistricts() {
	const { user } = useOutletContext()
	const { t } = useLanguage()

	return (
		<div className="ws-page ws-admin-page ws-districts">
			<WorkspacePageHeader
				title={t('ws.districts.pageTitle')}
				subtitle={t('ws.districts.pageSubtitle')}
			/>
			<DistrictManagement user={user} />
		</div>
	)
}

export default WorkspaceDistricts
