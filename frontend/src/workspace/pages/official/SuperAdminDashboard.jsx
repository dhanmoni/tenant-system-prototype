import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/dashboard/Icons'
import { formatDisplayEmail, formatDisplayName } from '../../../utils/formatters'
import { getRoleLabel } from '../../../constants/roleLabels'
import DashboardSection from '../../components/dashboard/DashboardSection'
import InsightHighlights from '../../components/dashboard/InsightHighlights'
import PipelineSummary from '../../components/dashboard/PipelineSummary'
import StatGroup from '../../components/dashboard/StatGroup'
import SuperAdminQuickActions from '../../components/dashboard/SuperAdminQuickActions'
import StatusBarChart from '../../components/dashboard/StatusBarChart'
import CategoryDoughnutChart from '../../components/dashboard/CategoryDoughnutChart'
import DistrictCoverageMap from '../../components/dashboard/DistrictCoverageMap'
import StatesOverviewTable from '../../components/dashboard/StatesOverviewTable'
import FormTypeTable from '../../components/dashboard/FormTypeTable'
import RecentApplicationsTable from '../../components/dashboard/RecentApplicationsTable'
import ActivityFeed from '../../components/dashboard/ActivityFeed'

function SuperAdminDashboard({ user, stats, loading, error }) {
	const navigate = useNavigate()
	const s = stats || {}
	const displayName = formatDisplayName(user?.name)
	const displayEmail = formatDisplayEmail(user?.email)
	const roleLabel = getRoleLabel(user?.role)

	const statGroups = useMemo(
		() => [
			{
				title: 'Geography',
				stats: [
					{ label: 'States / UTs', value: s.states_count, hint: 'Registered' },
					{ label: 'Districts', value: s.districts_count, hint: 'Across Assam' },
					{ label: 'Offices', value: s.offices_count, hint: 'Circle offices' },
				],
			},
			{
				title: 'Organization',
				stats: [
					{ label: 'Roles', value: s.roles_count, hint: 'System roles' },
					{ label: 'Designations', value: s.designations_count, hint: 'Staff titles' },
				],
			},
			{
				title: 'Accounts & applications',
				stats: [
					{ label: 'Users', value: s.users_count, hint: 'All portal accounts' },
					{
						label: 'UIN applications',
						value: s.tenancy_applications,
						hint: 'Tenancy records',
					},
					{
						label: 'Form applications',
						value: s.service_applications,
						hint: 'Assam Tenancy Act',
					},
					{
						label: 'Pending review',
						value: s.pending_review,
						hint: 'Awaiting verification',
						highlight: (s.pending_review ?? 0) > 0,
					},
					{
						label: 'In review',
						value: s.in_review,
						hint: 'With principals',
						highlight: (s.in_review ?? 0) > 0,
					},
				],
			},
		],
		[s]
	)

	const showDistrictMap = (s.district_breakdown?.length ?? 0) > 0
	const showFormBreakdown = (s.form_type_breakdown?.length ?? 0) > 0
	const queueTotal = (s.pending_review ?? 0) + (s.in_review ?? 0)

	return (
		<div className="ws-page ws-official-dashboard ws-super-admin-dashboard">
			{error ? <div className="ws-alert ws-alert--error">{error}</div> : null}

			<section className="ws-profile-strip ws-dashboard-welcome ws-sa-welcome">
				<div className="ws-profile-strip-main">
					<span className="ws-profile-strip-avatar-fallback" aria-hidden>
						<Icon name="dashboard" />
					</span>
					<div className="ws-profile-strip-info">
						<h2 className="ws-profile-strip-name">System overview</h2>
						<p className="ws-profile-strip-email">
							{displayName} · {displayEmail}
						</p>
						<div className="ws-profile-strip-meta">
							<div className="ws-profile-meta-item">
								<span className="ws-profile-meta-label">Role</span>
								<span className="ws-profile-meta-value">{roleLabel}</span>
							</div>
							<div className="ws-profile-meta-item">
								<span className="ws-profile-meta-label">Scope</span>
								<span className="ws-profile-meta-value">Statewide (Assam)</span>
							</div>
						</div>
						<p className="ws-dashboard-welcome-desc">
							Monitor platform health, application pipelines, and district-level activity
							across the tenancy portal.
						</p>
					</div>
				</div>
				{queueTotal > 0 ? (
					<div className="ws-sa-queue-banner" role="status">
						<strong>{queueTotal}</strong>
						<span>
							application{queueTotal === 1 ? '' : 's'} in the processing queue
						</span>
						<button
							type="button"
							className="ws-btn ws-btn--sm ws-btn--primary"
							onClick={() => navigate('/dashboard/admin/applications')}
						>
							Review queue
						</button>
					</div>
				) : null}
			</section>

			{loading ? (
				<div className="ws-dashboard-loading">Loading dashboard…</div>
			) : (
				<>
					<DashboardSection
						title="At a glance"
						description="High-level signals derived from live portal data."
						className="ws-sa-section--insights"
					>
						<InsightHighlights stats={stats} />
					</DashboardSection>

					<DashboardSection
						title="Platform configuration"
						description="Master data and account counts for the statewide deployment."
					>
						<div className="ws-sa-stat-groups">
							{statGroups.map((group) => (
								<StatGroup key={group.title} title={group.title} stats={group.stats} />
							))}
						</div>
					</DashboardSection>

					<DashboardSection
						title="Management shortcuts"
						description="Jump to common super administrator tasks."
					>
						<SuperAdminQuickActions stats={stats} />
					</DashboardSection>

					<DashboardSection
						title="Application pipeline"
						description="Statewide status distribution for Assam Tenancy Act form submissions."
					>
						<PipelineSummary
							breakdown={s.applications_by_status}
							totalLabel="form applications"
						/>
					</DashboardSection>

					<div className="ws-dashboard-charts ws-sa-charts">
						<section className="ws-card ws-chart-card">
							<div className="ws-card-header">
								<h3 className="ws-card-title">Applications by status</h3>
							</div>
							<div className="ws-card-body">
								<p className="ws-dashboard-hint">
									Bar chart of submitted, in-review, completed, and rejected forms.
								</p>
								<StatusBarChart breakdown={s.applications_by_status} />
							</div>
						</section>

						<section className="ws-card ws-chart-card">
							<div className="ws-card-header">
								<h3 className="ws-card-title">Application mix</h3>
							</div>
							<div className="ws-card-body">
								<p className="ws-dashboard-hint">UIN / Tenancy vs Assam Tenancy Act forms.</p>
								<CategoryDoughnutChart categories={s.applications_by_category} />
							</div>
						</section>
					</div>

					{showDistrictMap ? (
						<DashboardSection
							title="District coverage"
							description="Application volume and user counts by district. Select a tile for details."
						>
							<section className="ws-card">
								<div className="ws-card-body ws-card-body--pad">
									<DistrictCoverageMap
										districts={s.district_breakdown}
										hint="Colour intensity reflects total applications. Click a district for UIN, form, and user counts."
									/>
								</div>
							</section>
						</DashboardSection>
					) : null}

					<div className="ws-dashboard-split ws-sa-split">
						<DashboardSection
							title="States overview"
							description="Registered states and union territories with aggregated counts."
							className="ws-sa-split-section"
						>
							<section className="ws-card">
								<div className="ws-card-body ws-card-body--pad">
									<StatesOverviewTable states={s.states_overview} />
								</div>
							</section>
						</DashboardSection>

						{showFormBreakdown ? (
							<DashboardSection
								title="Forms breakdown"
								description="Volume by Assam Tenancy Act form type (statewide)."
								className="ws-sa-split-section"
							>
								<section className="ws-card">
									<div className="ws-card-body ws-card-body--pad">
										<FormTypeTable forms={s.form_type_breakdown} />
									</div>
								</section>
							</DashboardSection>
						) : null}
					</div>

					<div className="ws-dashboard-split ws-sa-split ws-sa-split--ops">
						<DashboardSection
							title="Recent applications"
							description="Latest UIN and form submissions across the state."
							action={
								<button
									type="button"
									className="ws-btn ws-btn--sm ws-btn--outline"
									onClick={() => navigate('/dashboard/admin/applications')}
								>
									View all
								</button>
							}
							className="ws-sa-split-section"
						>
							<section className="ws-card">
								<div className="ws-card-body ws-card-body--pad ws-card-body--table">
									<RecentApplicationsTable applications={s.recent_applications} />
								</div>
							</section>
						</DashboardSection>

						<DashboardSection
							title="Recent activity"
							description="Audit trail of sign-ins and administrative actions."
							className="ws-sa-split-section"
						>
							<section className="ws-card">
								<div className="ws-card-body ws-card-body--pad">
									<ActivityFeed />
								</div>
							</section>
						</DashboardSection>
					</div>
				</>
			)}
		</div>
	)
}

export default SuperAdminDashboard
