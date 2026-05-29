import { useNavigate } from 'react-router-dom'

const ACTIONS = [
	{
		key: 'users',
		title: 'User management',
		desc: 'Staff, district assignments, and registered citizens.',
		to: '/dashboard/admin/users',
		kicker: 'Accounts',
	},
	{
		key: 'applications',
		title: 'Service applications',
		desc: 'Rent Authority, Court, and Tribunal form submissions.',
		to: '/dashboard/admin/applications',
		kicker: 'Applications',
		badgeKey: 'service_applications',
	},
	{
		key: 'tenancy',
		title: 'UIN / Tenancy',
		desc: 'Tenancy applications and UIN issuance records.',
		to: '/dashboard/admin/tenancy',
		kicker: 'Records',
		badgeKey: 'tenancy_applications',
	},
	{
		key: 'districts',
		title: 'Districts & states',
		desc: 'Geography, offices, roles, and designations.',
		to: '/dashboard/admin/districts',
		kicker: 'Master data',
	},
]

function SuperAdminQuickActions({ stats }) {
	const navigate = useNavigate()
	const s = stats || {}

	return (
		<div className="ws-sa-quick-actions">
			{ACTIONS.map((action) => {
				const count = action.badgeKey ? s[action.badgeKey] : null
				return (
					<button
						key={action.key}
						type="button"
						className="ws-sa-quick-action"
						onClick={() => navigate(action.to)}
					>
						<span className="ws-action-card-kicker">{action.kicker}</span>
						<span className="ws-sa-quick-action-title">{action.title}</span>
						<span className="ws-sa-quick-action-desc">{action.desc}</span>
						{count != null && count > 0 ? (
							<span className="ws-sa-quick-action-count">{count} total</span>
						) : null}
					</button>
				)
			})}
		</div>
	)
}

export default SuperAdminQuickActions
