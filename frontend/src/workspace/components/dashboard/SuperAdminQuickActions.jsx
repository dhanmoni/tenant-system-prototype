import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/dashboard/Icons'

const ACTIONS = [
	{
		key: 'users',
		title: 'User management',
		desc: 'Staff accounts and citizens',
		to: '/dashboard/admin/users',
		icon: 'users',
	},
	{
		key: 'applications',
		title: 'Service applications',
		desc: 'All Assam Tenancy Act forms',
		to: '/dashboard/admin/applications',
		icon: 'file',
		badgeKey: 'service_applications',
	},
	{
		key: 'tenancy',
		title: 'UIN / Tenancy',
		desc: 'Registration records',
		to: '/dashboard/admin/tenancy',
		icon: 'documentPlus',
		badgeKey: 'tenancy_applications',
	},
	{
		key: 'districts',
		title: 'Districts',
		desc: 'Add and manage districts',
		to: '/dashboard/admin/districts',
		icon: 'map',
		badgeKey: 'districts_count',
	},
	{
		key: 'offices',
		title: 'Offices',
		desc: 'Circle and district offices',
		to: '/dashboard/admin/offices',
		icon: 'building',
		badgeKey: 'offices_count',
	},
	{
		key: 'activity',
		title: 'Activity log',
		desc: 'Staff actions on this portal',
		to: '/dashboard/admin/activity-log',
		icon: 'activity',
	},
]

function SuperAdminQuickActions({ stats }) {
	const navigate = useNavigate()
	const s = stats || {}

	return (
		<div className="ws-sa-nav-grid">
			{ACTIONS.map((action) => {
				const count = action.badgeKey ? s[action.badgeKey] : null
				return (
					<button
						key={action.key}
						type="button"
						className="ws-sa-nav-card"
						onClick={() => navigate(action.to)}
					>
						<span className="ws-sa-nav-card-icon" aria-hidden>
							<Icon name={action.icon} />
						</span>
						<span className="ws-sa-nav-card-body">
							<span className="ws-sa-nav-card-title">{action.title}</span>
							<span className="ws-sa-nav-card-desc">{action.desc}</span>
						</span>
						{count != null ? (
							<span className="ws-sa-nav-card-count">{count.toLocaleString('en-IN')}</span>
						) : null}
						<span className="ws-sa-nav-card-arrow" aria-hidden>
							→
						</span>
					</button>
				)
			})}
		</div>
	)
}

export default SuperAdminQuickActions
