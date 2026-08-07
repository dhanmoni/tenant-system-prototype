import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/dashboard/Icons'

function AttentionItem({ icon, label, detail, count, to, tone = 'default' }) {
	const navigate = useNavigate()

	return (
		<li className={`ws-sa-attention-item ws-sa-attention-item--${tone}`}>
			<button type="button" className="ws-sa-attention-btn" onClick={() => navigate(to)}>
				<span className="ws-sa-attention-icon" aria-hidden>
					<Icon name={icon} />
				</span>
				<span className="ws-sa-attention-copy">
					<span className="ws-sa-attention-label">{label}</span>
					{detail ? <span className="ws-sa-attention-detail">{detail}</span> : null}
				</span>
				{count != null ? (
					<span className="ws-sa-attention-count">{count.toLocaleString('en-IN')}</span>
				) : null}
			</button>
		</li>
	)
}

function SuperAdminAttentionPanel({ stats }) {
	const s = stats || {}

	const items = useMemo(() => {
		const pending = s.pending_review ?? 0
		const inReview = s.in_review ?? 0
		const queue = pending + inReview

		return [
			{
				key: 'queue',
				icon: 'clock',
				label: 'Applications in queue',
				detail: queue > 0 ? `${pending} submitted · ${inReview} in review` : 'No backlog right now',
				count: queue,
				to: '/dashboard/admin/applications',
				tone: queue > 0 ? 'warning' : 'success',
			},
			{
				key: 'uin',
				icon: 'documentPlus',
				label: 'UIN / tenancy records',
				detail: 'Registration and certificate applications',
				count: s.tenancy_applications ?? 0,
				to: '/dashboard/admin/tenancy',
				tone: 'default',
			},
			{
				key: 'forms',
				icon: 'file',
				label: 'Service form applications',
				detail: 'Rent Authority, Court, Tribunal forms',
				count: s.service_applications ?? 0,
				to: '/dashboard/admin/applications',
				tone: 'default',
			},
			{
				key: 'users',
				icon: 'users',
				label: 'Portal accounts',
				detail: 'Staff and registered citizens',
				count: s.users_count ?? 0,
				to: '/dashboard/admin/users',
				tone: 'default',
			},
			{
				key: 'districts',
				icon: 'map',
				label: 'Active districts',
				detail: 'Geography and district setup',
				count: s.districts_count ?? 0,
				to: '/dashboard/admin/districts',
				tone: 'default',
			},
		]
	}, [s])

	return (
		<div className="ws-sa-panel">
			<h3 className="ws-sa-panel-title">Needs your review</h3>
			<p className="ws-sa-panel-desc">Jump to the areas super admins monitor most often.</p>
			<ul className="ws-sa-attention-list">
				{items.map(({ key, ...item }) => (
					<AttentionItem key={key} {...item} />
				))}
			</ul>
		</div>
	)
}

export default SuperAdminAttentionPanel
