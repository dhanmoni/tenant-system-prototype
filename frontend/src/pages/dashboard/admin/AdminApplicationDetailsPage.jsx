import { useLocation } from 'react-router-dom'
import { WorkspaceLegacyFrame } from '../../../workspace'
import AdminApplicationDetails from './AdminApplicationDetails'

function AdminApplicationDetailsPage() {
	const location = useLocation()
	const fromTenancy = location.state?.from === 'tenancy'

	const parentCrumb = fromTenancy
		? { label: 'Tenancy applications', to: '/dashboard/admin/tenancy' }
		: { label: 'Service applications', to: '/dashboard/admin/applications' }

	return (
		<WorkspaceLegacyFrame compact breadcrumb={[parentCrumb]}>
			<AdminApplicationDetails />
		</WorkspaceLegacyFrame>
	)
}

export default AdminApplicationDetailsPage
