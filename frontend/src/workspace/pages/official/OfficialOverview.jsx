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
import { useDashboardStats } from '../../../hooks/useDashboardStats'

function OfficialOverview() {
	const { user } = useOutletContext()
	const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN
	const isDistrictAdmin = user?.role === ROLES.DISTRICT_ADMIN
	const isAssistant = isAssistantOfficeRole(user?.role)
	const isPrincipal = isPrincipalOfficeRole(user?.role)
	const isValuer = isValuerRole(user?.role)

	const url = isSuperAdmin ? '/api/dashboard-stats' : '/api/staff-dashboard-stats'
	const { data: stats, isLoading: loading, isError } = useDashboardStats(url)
	const error = isError ? 'Failed to load dashboard' : ''

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
