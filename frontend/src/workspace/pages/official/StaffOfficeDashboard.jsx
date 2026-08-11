import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/dashboard/Icons'
import { formatDisplayEmail, formatDisplayName } from '../../../utils/formatters'
import { getRoleLabel } from '../../../constants/roleLabels'
import { APPLICATION_LABELS } from '../../../constants/application'
import { getOfficeProfileForRole } from '../../config/officeProfiles'
import NexusStatCard from '../../components/dashboard/NexusStatCard'
import PipelineSummary from '../../components/dashboard/PipelineSummary'
import FormTypeTable from '../../components/dashboard/FormTypeTable'
import RecentApplicationsTable from '../../components/dashboard/RecentApplicationsTable'
import DistrictCoverageMap from '../../components/dashboard/DistrictCoverageMap'

function StaffOfficeDashboard({ user, stats, loading, error }) {
	const navigate = useNavigate()
	const s = stats || {}
	const office = getOfficeProfileForRole(user?.role)
	const displayName = formatDisplayName(user?.name)
	const displayEmail = formatDisplayEmail(user?.email)
	const roleLabel = getRoleLabel(user?.role)
	const districtName = s.district_name || user?.district?.name || 'Your district'

	const queueCount = office?.isPrincipal ? (s.in_review ?? 0) : (s.pending_review ?? 0)
	const queueLabel = office?.isPrincipal
		? office.queuePrincipalLabel
		: office?.queueAssistantLabel
	const completed = s.applications_by_status?.COMPLETED ?? 0
	const showFormBreakdown = (s.form_type_breakdown?.length ?? 0) > 0
	const showDistrictMap = (s.district_breakdown?.length ?? 0) > 0

	const kpiCards = useMemo(() => {
		if (!office) return []
		return [
			{
				label: 'District',
				value: districtName,
				isText: true,
				hint: 'Your assigned district',
				icon: 'building',
				tone: 'default',
			},
			{
				label: 'Forms in your scope',
				value: s.service_applications ?? 0,
				hint: office.scopeBlurb,
				icon: 'file',
				tone: 'accent',
			},
			{
				label: queueLabel,
				value: queueCount,
				hint: office.isPrincipal ? 'Forwarded for your decision' : 'In your verification inbox',
				icon: 'clock',
				tone: queueCount > 0 ? 'warning' : 'success',
			},
			{
				label: 'Completed',
				value: completed,
				hint: 'Closed in your office scope',
				icon: 'check',
				tone: 'success',
			},
		]
	}, [office, districtName, s.service_applications, queueLabel, queueCount, completed])

	const primaryAction = useMemo(() => {
		if (!office) return null
		return {
			title: 'Applications in review',
			desc: office.principalHint,
			badge: queueCount > 0 ? `${queueCount} in review` : null,
			to: '/dashboard/admin/applications',
			cta: 'Open queue',
		}
	}, [office, queueCount])

	const secondaryActions = useMemo(() => {
		if (!office) return []
		return [
			{
				title: 'Manage assistants',
				desc: `Staff under ${office.title} in ${districtName}`,
				to: '/dashboard/admin/users',
				cta: 'Open directory',
			},
		]
	}, [office, districtName])

	if (!office || !office.isPrincipal) {
		return (
			<div className="ws-page ws-official-dashboard">
				<div className="ws-alert ws-alert--error">Unsupported principal role for this dashboard.</div>
			</div>
		)
	}

	return (
		<div
			className={`ws-page ws-official-dashboard ws-staff-office-dashboard ws-staff-office-dashboard--${office.tone}`}
		>
			{error ? <div className="ws-alert ws-alert--error">{error}</div> : null}

			<header className="ws-staff-command">
				<div className="ws-staff-command-main">
					<span className="ws-staff-command-badge">{office.badge}</span>
					<h1 className="ws-staff-command-title">{office.title} dashboard</h1>
					<p className="ws-staff-command-meta">
						{displayName} · {displayEmail} · <strong>{roleLabel}</strong>
						{' · '}
						{districtName}
					</p>
					<p className="ws-staff-command-scope">{office.scopeBlurb}</p>
				</div>
				<div className="ws-staff-command-actions">
					<button
						type="button"
						className="ws-btn ws-btn--outline ws-staff-command-btn"
						onClick={() => navigate('/dashboard/admin/users')}
					>
						<Icon name="users" />
						Assistants
					</button>
					<button
						type="button"
						className="ws-btn ws-btn--primary ws-staff-command-btn"
						onClick={() => navigate('/dashboard/admin/applications')}
					>
						<Icon name="file" />
						Review queue
					</button>
				</div>
			</header>

			{loading ? (
				<div className="ws-dashboard-loading">Loading dashboard…</div>
			) : (
				<>
					<div className="ws-staff-kpi-row" aria-label="Office metrics">
						{kpiCards.map((card) => (
							<NexusStatCard key={card.label} {...card} compact />
						))}
					</div>

					<div className="ws-staff-layout">
						<div className="ws-staff-main">
							<section className="ws-staff-block" aria-labelledby="ws-staff-actions-heading">
								<div className="ws-staff-block-head">
									<h2 id="ws-staff-actions-heading" className="ws-staff-block-title">
										Your work
									</h2>
									<p className="ws-staff-block-desc">
										Only {office.title} tasks — no other office queues
									</p>
								</div>
								<div className="ws-staff-action-grid">
									{primaryAction ? (
										<article className="ws-staff-action-card ws-staff-action-card--primary">
											<p className="ws-staff-action-kicker">Primary</p>
											<h3 className="ws-staff-action-title">{primaryAction.title}</h3>
											<p className="ws-staff-action-desc">{primaryAction.desc}</p>
											{primaryAction.badge ? (
												<span className="ws-staff-action-badge">{primaryAction.badge}</span>
											) : null}
											<button
												type="button"
												className="ws-btn ws-btn--primary"
												onClick={() => navigate(primaryAction.to)}
											>
												{primaryAction.cta}
											</button>
										</article>
									) : null}
									{secondaryActions.map((action) => (
										<article key={action.title} className="ws-staff-action-card">
											<p className="ws-staff-action-kicker">Office</p>
											<h3 className="ws-staff-action-title">{action.title}</h3>
											<p className="ws-staff-action-desc">{action.desc}</p>
											<button
												type="button"
												className="ws-btn ws-btn--outline"
												onClick={() => navigate(action.to)}
											>
												{action.cta}
											</button>
										</article>
									))}
								</div>
							</section>

							<section className="ws-staff-block" aria-labelledby="ws-staff-forms-heading">
								<div className="ws-staff-block-head">
									<h2 id="ws-staff-forms-heading" className="ws-staff-block-title">
										Forms this office handles
									</h2>
									<p className="ws-staff-block-desc">{office.scopeBlurb}</p>
								</div>
								<ul className="ws-staff-form-list">
									{office.forms.map((type) => {
										const row = (s.form_type_breakdown || []).find(
											(f) => f.form_key === type || f.application_type === type
										)
										const count = row?.count ?? null
										return (
											<li key={type} className="ws-staff-form-item">
												<span className="ws-staff-form-name">
													{APPLICATION_LABELS[type] || row?.label || type}
												</span>
												<span className="ws-staff-form-count">
													{count != null ? count.toLocaleString('en-IN') : '0'}
												</span>
											</li>
										)
									})}
								</ul>
							</section>

							<section
								className="ws-staff-block ws-staff-block--pipeline"
								aria-labelledby="ws-staff-pipeline-heading"
							>
								<div className="ws-staff-block-head">
									<h2 id="ws-staff-pipeline-heading" className="ws-staff-block-title">
										Status pipeline
									</h2>
									<p className="ws-staff-block-desc">
										Only {office.title} form applications in {districtName}
									</p>
								</div>
								<PipelineSummary
									breakdown={s.applications_by_status}
									totalLabel={`${office.title.toLowerCase()} applications in your district`}
								/>
							</section>

							<section className="ws-staff-block" aria-labelledby="ws-staff-recent-heading">
								<div className="ws-staff-block-head">
									<h2 id="ws-staff-recent-heading" className="ws-staff-block-title">
										Recent in your scope
									</h2>
									<p className="ws-staff-block-desc">
										Latest {office.title} applications for this district
									</p>
								</div>
								<RecentApplicationsTable
									applications={s.recent_applications}
									showProgress
									viewerRole={user?.role}
								/>
							</section>

							{showFormBreakdown ? (
								<section className="ws-staff-block" aria-labelledby="ws-staff-breakdown-heading">
									<div className="ws-staff-block-head">
										<h2 id="ws-staff-breakdown-heading" className="ws-staff-block-title">
											Volume by form
										</h2>
										<p className="ws-staff-block-desc">Counts limited to your office forms</p>
									</div>
									<FormTypeTable forms={s.form_type_breakdown} />
								</section>
							) : null}
						</div>

						<aside className="ws-staff-aside" aria-label="Office context">
							<div className="ws-staff-panel">
								<h3 className="ws-staff-panel-title">Office snapshot</h3>
								<dl className="ws-staff-summary-list">
									<div>
										<dt>Office</dt>
										<dd>{office.title}</dd>
									</div>
									<div>
										<dt>Your role</dt>
										<dd>{roleLabel}</dd>
									</div>
									<div>
										<dt>District</dt>
										<dd>{districtName}</dd>
									</div>
									<div>
										<dt>Forms in scope</dt>
										<dd>{office.forms.length}</dd>
									</div>
									<div>
										<dt>{queueLabel}</dt>
										<dd>{queueCount.toLocaleString('en-IN')}</dd>
									</div>
								</dl>
							</div>

							{showDistrictMap ? (
								<div className="ws-staff-panel ws-staff-panel--map">
									<h3 className="ws-staff-panel-title">Your district</h3>
									<p className="ws-staff-panel-desc">
										Boundary for {districtName} only
									</p>
									<DistrictCoverageMap
										districts={s.district_breakdown}
										focusDistrictName={districtName}
										lockToDistrict
									/>
								</div>
							) : null}
						</aside>
					</div>
				</>
			)}
		</div>
	)
}

export default StaffOfficeDashboard
