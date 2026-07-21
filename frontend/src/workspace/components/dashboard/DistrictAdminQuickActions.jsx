import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/dashboard/Icons'

const ACTIONS = [
	{
		key: 'users',
		title: 'Staff directory',
		desc: 'District staff and citizens',
		to: '/dashboard/admin/users',
		icon: 'users',
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
		key: 'applications',
		title: 'Service applications',
		desc: 'Assam Tenancy Act forms',
		to: '/dashboard/admin/applications',
		icon: 'file',
		badgeKey: 'service_applications',
	},
]

function DistrictAdminQuickActions({ stats }) {
	const navigate = useNavigate()
	const s = stats || {}

	return (
		<div className="ws-da-nav-grid">
			{ACTIONS.map((action) => {
				const count = action.badgeKey ? s[action.badgeKey] : null
				return (
					<button
						key={action.key}
						type="button"
						className="ws-da-nav-card"
						onClick={() => navigate(action.to)}
					>
						<span className="ws-da-nav-card-icon" aria-hidden>
							<Icon name={action.icon} />
						</span>
						<span className="ws-da-nav-card-body">
							<span className="ws-da-nav-card-title">{action.title}</span>
							<span className="ws-da-nav-card-desc">{action.desc}</span>
						</span>
						{count != null ? (
							<span className="ws-da-nav-card-count">{count.toLocaleString('en-IN')}</span>
						) : null}
						<span className="ws-da-nav-card-arrow" aria-hidden>
							→
						</span>
					</button>
				)
			})}
		</div>
	)
}

export default DistrictAdminQuickActions
