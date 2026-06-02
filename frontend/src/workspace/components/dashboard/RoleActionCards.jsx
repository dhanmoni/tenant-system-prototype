import { useNavigate } from 'react-router-dom'
import { ROLES, ADMIN_ROLES, ASSISTANT_ROLES, PRINCIPAL_ROLES } from '../../../constants/roles'

function RoleActionCards({ user, stats }) {
	const navigate = useNavigate()
	const s = stats || {}

	const cards = []

	if (ASSISTANT_ROLES.includes(user?.role)) {
		cards.push({
			key: 'inbox',
			kicker: 'Action required',
			title: 'Application inbox',
			desc: 'Verify submissions and forward to the head officer.',
			badge: s.pending_review > 0 ? `${s.pending_review} pending` : null,
			to: '/dashboard/admin/inbox',
			primary: true,
		})
	}

	if (PRINCIPAL_ROLES.includes(user?.role)) {
		cards.push({
			key: 'review',
			kicker: 'Decision queue',
			title: 'Applications in review',
			desc: 'Approve or reject applications forwarded by your assistant.',
			badge: s.in_review > 0 ? `${s.in_review} in review` : null,
			to: '/dashboard/admin/applications',
			primary: true,
		})
	}

	if (ADMIN_ROLES.includes(user?.role)) {
		cards.push({
			key: 'users',
			kicker: 'Management',
			title: 'User management',
			desc: 'Staff accounts, district assignments, and citizens.',
			to: '/dashboard/admin/users',
		})
		if (user?.role === ROLES.SUPER_ADMIN) {
			cards.push({
				key: 'districts',
				kicker: 'Master data',
				title: 'Districts & states',
				desc: 'Configure districts and statewide structure.',
				to: '/dashboard/admin/districts',
			})
		}
		if (user?.role === ROLES.DISTRICT_ADMIN) {
			cards.push({
				key: 'tenancy',
				kicker: 'Records',
				title: 'Tenancy applications',
				desc: 'UIN applications in your district.',
				to: '/dashboard/admin/tenancy',
			})
		}
	}

	if (user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.DISTRICT_ADMIN) {
		cards.push({
			key: 'apps',
			kicker: 'Tracking',
			title: 'Service applications',
			desc: 'Rent Authority, Court, and Tribunal form applications.',
			to: '/dashboard/admin/applications',
		})
	}

	if (!cards.length) return null

	return (
		<div className="ws-action-cards">
			{cards.map((card) => (
				<div key={card.key} className="ws-action-card">
					<p className="ws-action-card-kicker">{card.kicker}</p>
					<h3 className="ws-action-card-title">{card.title}</h3>
					<p className="ws-action-card-desc">{card.desc}</p>
					{card.badge ? <span className="ws-action-card-badge">{card.badge}</span> : null}
					<button
						type="button"
						className={`ws-btn ${card.primary ? 'ws-btn--primary' : 'ws-btn--outline'}`}
						onClick={() => navigate(card.to)}
					>
						Open
					</button>
				</div>
			))}
		</div>
	)
}

export default RoleActionCards
