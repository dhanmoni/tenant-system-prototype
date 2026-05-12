import { NavLink, Navigate, useOutletContext } from 'react-router-dom'
import { Icon } from '../../components/dashboard/Icons'
import { tenantServiceGroups } from '../../data/tenantServices'

function TenantServices() {
	const { user } = useOutletContext()

	if (user?.role !== 'user') {
		return <Navigate to="/dashboard" replace />
	}

	return (
		<div className="tenant-services-page">
			<div className="tenant-services-page-intro auth-card dashboard-card">
				<div className="tenant-services-page-intro-inner">
					<Icon name="services" className="tenant-services-page-intro-icon" aria-hidden />
					<div>
						<h1 className="tenant-services-page-title">Services</h1>
						<p className="tenant-services-page-lead muted">
							Choose a service category below, then select a form to apply. Assam Tenancy Act forms and
							filings.
						</p>
					</div>
				</div>
			</div>

			<div className="tenant-services-tiles-grid">
				{tenantServiceGroups.map((group) => (
					<section
						key={group.id}
						className={`tenant-service-tile tenant-service-tile--${group.id} auth-card dashboard-card`}
					>
						<h2 className="tenant-service-tile-title">{group.title}</h2>
						<p className="tenant-service-tile-desc muted">{group.description}</p>
						<ul className="tenant-service-tile-forms">
							{group.forms.map((f) => (
								<li key={f.to}>
									<NavLink
										to={f.to}
										className={({ isActive }) =>
											`tenant-service-form-link${isActive ? ' tenant-service-form-link--active' : ''}`
										}
									>
										<span className="tenant-service-form-link-label">{f.label}</span>
										<span className="tenant-service-form-link-action">Apply</span>
									</NavLink>
								</li>
							))}
						</ul>
					</section>
				))}
			</div>
		</div>
	)
}

export default TenantServices
