import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import api from '../../../api'
import { ROLES } from '../../../constants/roles'
import {
	isAssistantOfficeRole,
	isPrincipalOfficeRole,
	isValuerRole,
} from '../../config/officeProfiles'
import SuperAdminDashboard from './SuperAdminDashboard'
import DistrictAdminDashboard from './DistrictAdminDashboard'
import StaffOfficeDashboard from './StaffOfficeDashboard'
import AssistantOfficeDashboard from './AssistantOfficeDashboard'
import ValuerDashboard from './ValuerDashboard'

function OfficialOverview() {
	const { user } = useOutletContext()
	const [stats, setStats] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN
	const isDistrictAdmin = user?.role === ROLES.DISTRICT_ADMIN
	const isAssistant = isAssistantOfficeRole(user?.role)
	const isPrincipal = isPrincipalOfficeRole(user?.role)
	const isValuer = isValuerRole(user?.role)

	useEffect(() => {
		loadStats()
	}, [user?.role])

	const loadStats = async () => {
		setLoading(true)
		setError('')
		try {
			const url = isSuperAdmin ? '/api/dashboard-stats' : '/api/staff-dashboard-stats'
			const { data } = await api.get(url)
			setStats(data || {})
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load dashboard')
		} finally {
			setLoading(false)
		}
	}

	if (isSuperAdmin) {
		return (
			<SuperAdminDashboard user={user} stats={stats} loading={loading} error={error} />
		)
	}

	if (isDistrictAdmin) {
		return (
			<DistrictAdminDashboard user={user} stats={stats} loading={loading} error={error} />
		)
	}

	if (isValuer) {
		return <ValuerDashboard user={user} stats={stats} loading={loading} error={error} />
	}

	if (isAssistant) {
		return (
			<AssistantOfficeDashboard user={user} stats={stats} loading={loading} error={error} />
		)
	}

	if (isPrincipal) {
		return (
			<StaffOfficeDashboard user={user} stats={stats} loading={loading} error={error} />
		)
	}

	return (
		<div className="ws-page ws-official-dashboard">
			<div className="ws-alert ws-alert--error">
				No dashboard is configured for this role.
			</div>
		</div>
	)
}

export default OfficialOverview
