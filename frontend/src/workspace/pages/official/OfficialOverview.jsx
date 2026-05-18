import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import api from '../../../api'
import { Icon } from '../../../components/dashboard/Icons'
import { formatDisplayEmail, formatDisplayName } from '../../../utils/formatters'
import { getRoleLabel } from '../../../constants/roleLabels'
import {
	ROLES,
	ADMIN_ROLES,
	ASSISTANT_ROLES,
	PRINCIPAL_ROLES,
} from '../../../constants/roles'
import StatusBarChart from '../../components/dashboard/StatusBarChart'
import CategoryDoughnutChart from '../../components/dashboard/CategoryDoughnutChart'
import DistrictCoverageMap from '../../components/dashboard/DistrictCoverageMap'
import StatesOverviewTable from '../../components/dashboard/StatesOverviewTable'
import FormTypeTable from '../../components/dashboard/FormTypeTable'
import RecentApplicationsTable from '../../components/dashboard/RecentApplicationsTable'
import RoleActionCards from '../../components/dashboard/RoleActionCards'
import ActivityFeed from '../../components/dashboard/ActivityFeed'

function OfficialOverview() {
	const { user } = useOutletContext()
	const [stats, setStats] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN
	const isDistrictAdmin = user?.role === ROLES.DISTRICT_ADMIN
	const displayName = formatDisplayName(user?.name)
	const displayEmail = formatDisplayEmail(user?.email)
	const roleLabel = getRoleLabel(user?.role)

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

	const statCards = useMemo(() => {
		const s = stats || {}
		if (isSuperAdmin) {
			return [
				{ label: 'States', value: s.states_count, hint: 'Registered states / UTs' },
				{ label: 'Districts', value: s.districts_count, hint: 'Across Assam' },
				{ label: 'Offices', value: s.offices_count, hint: 'Circle offices' },
				{ label: 'Users', value: s.users_count, hint: 'All accounts' },
				{ label: 'UIN applications', value: s.tenancy_applications, hint: 'Tenancy certificates' },
				{ label: 'Form applications', value: s.service_applications, hint: 'Assam Tenancy Act forms' },
				{ label: 'Pending review', value: s.pending_review, hint: 'Submitted', highlight: true },
				{ label: 'In review', value: s.in_review, hint: 'With principals' },
			]
		}

		const cards = [
			{
				label: 'District',
				value: s.district_name || user?.district?.name || '—',
				isText: true,
				hint: 'Your assignment',
			},
			{ label: 'Users', value: s.users_count, hint: 'In district' },
			{ label: 'Form applications', value: s.service_applications, hint: 'In your scope' },
		]

		if (ADMIN_ROLES.includes(user?.role)) {
			cards.push({
				label: 'UIN applications',
				value: s.tenancy_applications,
				hint: 'Tenancy certificates',
			})
		}
		if (ASSISTANT_ROLES.includes(user?.role)) {
			cards.push({
				label: 'Awaiting verification',
				value: s.pending_review,
				hint: 'Inbox queue',
				highlight: true,
			})
		}
		if (PRINCIPAL_ROLES.includes(user?.role)) {
			cards.push({
				label: 'Awaiting decision',
				value: s.in_review,
				hint: 'Forwarded to you',
				highlight: true,
			})
		}
		if (isDistrictAdmin) {
			cards.push(
				{ label: 'Pending (submitted)', value: s.pending_review, hint: 'District-wide' },
				{ label: 'In review', value: s.in_review, hint: 'District-wide' }
			)
		}

		return cards
	}, [stats, isSuperAdmin, isDistrictAdmin, user])

	const showStatesTable = isSuperAdmin || isDistrictAdmin
	const showDistrictMap = (stats?.district_breakdown?.length ?? 0) > 0
	const showFormBreakdown = (stats?.form_type_breakdown?.length ?? 0) > 0

	return (
		<div className="ws-page ws-official-dashboard">
			{error ? <div className="ws-alert ws-alert--error">{error}</div> : null}

			<section className="ws-profile-strip ws-dashboard-welcome">
				<div className="ws-profile-strip-main">
					<span className="ws-profile-strip-avatar-fallback" aria-hidden>
						<Icon name="dashboard" />
					</span>
					<div className="ws-profile-strip-info">
						<h2 className="ws-profile-strip-name">Welcome, {displayName}</h2>
						<p className="ws-profile-strip-email">{displayEmail}</p>
						<div className="ws-profile-strip-meta">
							<div className="ws-profile-meta-item">
								<span className="ws-profile-meta-label">Role</span>
								<span className="ws-profile-meta-value">{roleLabel}</span>
							</div>
							<div className="ws-profile-meta-item">
								<span className="ws-profile-meta-label">District</span>
								<span className="ws-profile-meta-value">
									{user?.district?.name || stats?.district_name || '—'}
								</span>
							</div>
						</div>
						<p className="ws-dashboard-welcome-desc">
							{isSuperAdmin
								? 'Statewide overview of districts, users, and applications across Assam.'
								: `District-scoped analytics for ${stats?.district_name || user?.district?.name || 'your office'}.`}
						</p>
					</div>
				</div>
			</section>

			{loading ? (
				<div className="ws-dashboard-loading">Loading dashboard…</div>
			) : (
				<>
					<div className="ws-stats-grid ws-stats-grid--dashboard">
						{statCards.map((card) => (
							<div
								key={card.label}
								className={`ws-stat-card${card.highlight ? ' ws-stat-card--highlight' : ''}`}
							>
								<div className="ws-stat-card-label">{card.label}</div>
								<div
									className={`ws-stat-card-value${card.isText ? ' ws-stat-card-value--text' : ''}`}
								>
									{card.value ?? '—'}
								</div>
								{card.hint ? (
									<div className="ws-stat-card-hint">{card.hint}</div>
								) : null}
							</div>
						))}
					</div>

					<RoleActionCards user={user} stats={stats} />

					<div className="ws-dashboard-charts">
						<section className="ws-card ws-chart-card">
							<div className="ws-card-header">
								<h2 className="ws-card-title">Applications by status</h2>
							</div>
							<div className="ws-card-body">
								<p className="ws-dashboard-hint">
									{isSuperAdmin
										? 'All Assam Tenancy Act form submissions (statewide).'
										: 'Applications in your district for your authority.'}
								</p>
								<StatusBarChart breakdown={stats?.applications_by_status} />
							</div>
						</section>

						<section className="ws-card ws-chart-card">
							<div className="ws-card-header">
								<h2 className="ws-card-title">Application mix</h2>
							</div>
							<div className="ws-card-body">
								<p className="ws-dashboard-hint">UIN / Tenancy vs Assam Tenancy Act forms.</p>
								<CategoryDoughnutChart categories={stats?.applications_by_category} />
							</div>
						</section>
					</div>

					{showDistrictMap ? (
						<section className="ws-card">
							<div className="ws-card-header">
								<h2 className="ws-card-title">
									{isSuperAdmin ? 'District coverage map' : 'Your district snapshot'}
								</h2>
							</div>
							<div className="ws-card-body">
								<DistrictCoverageMap
									districts={stats.district_breakdown}
									hint={
										isSuperAdmin
											? 'Click a district to view counts. Colour intensity reflects total applications.'
											: 'Application volume for your assigned district.'
									}
								/>
							</div>
						</section>
					) : null}

					<div className="ws-dashboard-split">
						{showStatesTable ? (
							<section className="ws-card">
								<div className="ws-card-header">
									<h2 className="ws-card-title">States overview</h2>
								</div>
								<div className="ws-card-body">
									<p className="ws-dashboard-hint">
										Registered states and union territories with district and application
										counts.
									</p>
									<StatesOverviewTable states={stats?.states_overview} />
								</div>
							</section>
						) : null}

						{showFormBreakdown ? (
							<section className="ws-card">
								<div className="ws-card-header">
									<h2 className="ws-card-title">Forms in your scope</h2>
								</div>
								<div className="ws-card-body">
									<FormTypeTable forms={stats?.form_type_breakdown} />
								</div>
							</section>
						) : null}
					</div>

					<section className="ws-card">
						<div className="ws-card-header">
							<h2 className="ws-card-title">Recent applications</h2>
						</div>
						<div className="ws-card-body">
							<RecentApplicationsTable applications={stats?.recent_applications} />
						</div>
					</section>

					{isSuperAdmin ? (
						<section className="ws-card">
							<div className="ws-card-header">
								<h2 className="ws-card-title">Recent activity</h2>
							</div>
							<div className="ws-card-body">
								<ActivityFeed />
							</div>
						</section>
					) : null}
				</>
			)}
		</div>
	)
}

export default OfficialOverview
