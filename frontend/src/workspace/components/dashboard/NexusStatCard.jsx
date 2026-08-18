import { Icon } from '../../../components/dashboard/Icons'

const LABEL_ICONS = {
	'District': 'building',
	'Districts': 'building',
	'District activity': 'map',
	'Users': 'users',
	'Form applications': 'file',
	'UIN applications': 'documentPlus',
	'Awaiting verification': 'clock',
	'Awaiting decision': 'status',
	'Pending (submitted)': 'clock',
	'Pending review': 'clock',
	'In review': 'timeline',
	'States / UTs': 'map',
	'Offices': 'building',
	'Roles': 'lock',
	'Designations': 'user',
	'Total applications': 'list',
	'Active queue': 'clock',
	'Form completion rate': 'check',
}

/**
 * Nexus SaaS KPI tile — pastel icon + label row, large value (matches reference dashboards).
 * @param {'default'|'warning'|'success'|'accent'|'violet'|'teal'|'highlight'} tone
 */
function NexusStatCard({
	label,
	value,
	hint,
	icon,
	tone = 'default',
	isText = false,
	compact = false,
	className = '',
}) {
	const resolvedIcon = icon || LABEL_ICONS[label] || 'chart'
	const resolvedTone = tone === 'highlight' ? 'warning' : tone

	return (
		<article
			className={[
				'ws-nexus-stat',
				`ws-nexus-stat--${resolvedTone}`,
				compact ? 'ws-nexus-stat--compact' : '',
				isText ? 'ws-nexus-stat--text' : '',
				className,
			]
				.filter(Boolean)
				.join(' ')}
		>
			<div className="ws-nexus-stat-top">
				<span className="ws-nexus-stat-icon" aria-hidden>
					<Icon name={resolvedIcon} />
				</span>
				<span className="ws-nexus-stat-label">{label}</span>
			</div>
			<span className="ws-nexus-stat-value">{value ?? '—'}</span>
			{hint ? <span className="ws-nexus-stat-hint">{hint}</span> : null}
		</article>
	)
}

export default NexusStatCard
