import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/dashboard/Icons'

function AttentionItem({ icon, label, detail, count, to, tone = 'default' }) {
	const navigate = useNavigate()

	return (
		<li className={`ws-da-attention-item ws-da-attention-item--${tone}`}>
			<button type="button" className="ws-da-attention-btn" onClick={() => navigate(to)}>
				<span className="ws-da-attention-icon" aria-hidden>
					<Icon name={icon} />
				</span>
				<span className="ws-da-attention-copy">
					<span className="ws-da-attention-label">{label}</span>
					{detail ? <span className="ws-da-attention-detail">{detail}</span> : null}
				</span>
				{count != null ? (
					<span className="ws-da-attention-count">{count.toLocaleString('en-IN')}</span>
				) : null}
			</button>
		</li>
	)
}

function DistrictAdminAttentionPanel({ stats }) {
	const s = stats || {}

	const items = useMemo(() => {
		const pending = s.pending_review ?? 0
		const inReview = s.in_review ?? 0
		const queue = pending + inReview
		const today = s.submitted_today ?? 0

		return [
			{
				key: 'today',
				icon: 'timeline',
				label: 'Submitted today',
				detail: 'New UIN and form applications',
				count: today,
				to: '/dashboard/admin/applications',
				tone: today > 0 ? 'accent' : 'default',
			},
			{
				key: 'queue',
				icon: 'clock',
				label: 'Processing queue',
				detail: `${pending} submitted · ${inReview} in review`,
				count: queue,
				to: '/dashboard/admin/applications',
				tone: queue > 0 ? 'warning' : 'success',
			},
			{
				key: 'uin',
				icon: 'documentPlus',
				label: 'UIN applications',
				detail: 'Tenancy registrations in district',
				count: s.tenancy_applications ?? 0,
				to: '/dashboard/admin/tenancy',
				tone: 'default',
			},
			{
				key: 'staff',
				icon: 'users',
				label: 'District accounts',
				detail: 'Staff and registered citizens',
				count: s.users_count ?? 0,
				to: '/dashboard/admin/users',
				tone: 'default',
			},
		]
	}, [s])

	return (
		<div className="ws-da-panel">
			<h3 className="ws-da-panel-title">District priorities</h3>
			<p className="ws-da-panel-desc">What the district admin should review first.</p>
			<ul className="ws-da-attention-list">
				{items.map((item) => (
					<AttentionItem key={item.key} {...item} />
				))}
			</ul>
		</div>
	)
}

export default DistrictAdminAttentionPanel
