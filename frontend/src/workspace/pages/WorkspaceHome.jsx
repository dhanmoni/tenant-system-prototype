import { useOutletContext } from 'react-router-dom'
import { ROLES } from '../../constants/roles'
import UserOverview from './user/UserOverview'
import OfficialOverview from './official/OfficialOverview'

function WorkspaceHome() {
	const { user } = useOutletContext()
	if (user?.role === ROLES.USER) {
		return <UserOverview />
	}
	return <OfficialOverview />
}

export default WorkspaceHome
