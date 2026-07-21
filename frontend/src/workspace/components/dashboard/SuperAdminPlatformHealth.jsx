function HealthRow({ label, value, hint }) {
	return (
		<div className="ws-sa-health-row">
			<div className="ws-sa-health-copy">
				<span className="ws-sa-health-label">{label}</span>
				{hint ? <span className="ws-sa-health-hint">{hint}</span> : null}
			</div>
			<span className="ws-sa-health-value">{value ?? '—'}</span>
		</div>
	)
}

function SuperAdminPlatformHealth({ stats }) {
	const s = stats || {}

	return (
		<div className="ws-sa-panel">
			<h3 className="ws-sa-panel-title">Platform snapshot</h3>
			<p className="ws-sa-panel-desc">Master data and account totals statewide.</p>
			<div className="ws-sa-health-list">
				<HealthRow label="States / UTs" value={s.states_count} hint="Registered" />
				<HealthRow label="Districts" value={s.districts_count} hint="Across Assam" />
				<HealthRow label="Offices" value={s.offices_count} hint="Circle offices" />
				<HealthRow label="Roles" value={s.roles_count} hint="System roles" />
				<HealthRow label="Designations" value={s.designations_count} hint="Staff titles" />
				<HealthRow label="Users" value={s.users_count} hint="All accounts" />
			</div>
			<p className="ws-sa-health-note">
				Office, role, and designation screens are API-ready but not yet in the menu — use
				Districts and User management for day-to-day setup.
			</p>
		</div>
	)
}

export default SuperAdminPlatformHealth
