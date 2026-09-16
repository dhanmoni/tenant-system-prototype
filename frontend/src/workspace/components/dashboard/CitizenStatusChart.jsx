import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/dashboard/Icons'
import { STATUS } from '../../../constants/status'
import { isTenancyApplication } from '../../../utils/applicationStatusProgress'
import { useLanguage } from '../../../i18n'

const CHART_LABEL_KEYS = {
	SUBMITTED: 'ws.status.submitted',
	IN_REVIEW: 'ws.status.inReview',
	REJECTED: 'ws.status.rejected',
	COMPLETED: 'ws.status.completed',
	OTHER: 'ws.status.other',
	DRAFT: 'ws.status.draft',
	PARTIAL: 'ws.status.partial',
}

const STATUS_ICONS = {
	SUBMITTED: 'file',
	IN_REVIEW: 'clock',
	COMPLETED: 'check',
	REJECTED: 'x',
	DRAFT: 'edit',
	PARTIAL: 'users',
	OTHER: 'list',
}

const SCOPES = ['all', 'uin', 'services']

/** Map raw DB statuses into buckets (shared with dashboard summary). */
export function bucketCitizenStatus(status, applicationType = '') {
	const s = String(status || '').trim().toUpperCase()
	const type = String(applicationType || '').toLowerCase()

	if ([STATUS.APPROVED, STATUS.COMPLETED].includes(s)) return 'COMPLETED'
	if (s === STATUS.REJECTED) return 'REJECTED'
	if (s === STATUS.DRAFT) return 'DRAFT'
	if (s === STATUS.PARTIAL) return 'PARTIAL'
	if (
		[STATUS.IN_REVIEW, STATUS.PENDING, STATUS.VALUER_ASSIGNED, STATUS.VALUER_REPORT_SUBMITTED].includes(s)
	) {
		return 'IN_REVIEW'
	}
	if (s === STATUS.SUBMITTED) return 'SUBMITTED'
	if (s === STATUS.UNDER_PROCESS) {
		return type.includes('tenancy') ? 'SUBMITTED' : 'IN_REVIEW'
	}
	return CHART_LABEL_KEYS[s] ? s : 'OTHER'
}

const ALWAYS_KEYS = ['SUBMITTED', 'IN_REVIEW', 'COMPLETED', 'REJECTED']
const EXTRA_KEYS = ['DRAFT', 'PARTIAL', 'OTHER']

function filterByScope(applications, scope) {
	if (scope === 'uin') return applications.filter((app) => isTenancyApplication(app))
	if (scope === 'services') return applications.filter((app) => !isTenancyApplication(app))
	return applications
}

function CitizenStatusChart({ applications = [] }) {
	const { t } = useLanguage()
	const navigate = useNavigate()
	const [scope, setScope] = useState('all')

	const scopedApps = useMemo(() => filterByScope(applications, scope), [applications, scope])

	const tabCounts = useMemo(
		() => ({
			all: applications.length,
			uin: applications.filter((app) => isTenancyApplication(app)).length,
			services: applications.filter((app) => !isTenancyApplication(app)).length,
		}),
		[applications],
	)

	const chart = useMemo(() => {
		const counts = Object.fromEntries([...ALWAYS_KEYS, ...EXTRA_KEYS].map((k) => [k, 0]))

		scopedApps.forEach((app) => {
			const key = bucketCitizenStatus(app.status, app.application_type)
			if (counts[key] !== undefined) counts[key] += 1
			else counts.OTHER += 1
		})

		const keys = [...ALWAYS_KEYS, ...EXTRA_KEYS.filter((k) => counts[k] > 0)]

		return {
			hasData: scopedApps.length > 0,
			rows: keys.map((k) => ({
				key: k,
				label: t(CHART_LABEL_KEYS[k] || 'ws.status.other'),
				count: counts[k],
				icon: STATUS_ICONS[k] || 'list',
			})),
		}
	}, [scopedApps, t])

	const emptyKey =
		scope === 'uin'
			? 'ws.citizen.chart.emptyUin'
			: scope === 'services'
				? 'ws.citizen.chart.emptyServices'
				: 'ws.citizen.chart.empty'

	const footerLabel =
		scope === 'services'
			? t('ws.citizen.chart.openServices')
			: scope === 'uin'
				? t('ws.citizen.chart.openStatus')
				: t('ws.citizen.chart.openAll')

	const footerTo = scope === 'services' ? '/dashboard/status?type=service' : '/dashboard/status'

	return (
		<>
			<div className="ws-citizen-status-tabs" role="tablist" aria-label={t('ws.citizen.chart.tabs.aria')}>
				{SCOPES.map((key) => (
					<button
						key={key}
						type="button"
						role="tab"
						className={`ws-citizen-status-tab${scope === key ? ' is-active' : ''}`}
						aria-selected={scope === key}
						onClick={() => setScope(key)}
					>
						<span>{t(`ws.citizen.chart.tab.${key}`)}</span>
						<span className="ws-citizen-status-tab__count">{tabCounts[key]}</span>
					</button>
				))}
			</div>
			{chart.hasData ? (
				<ul className="ws-citizen-status-list" aria-label={t('ws.citizen.chart.title')}>
					{chart.rows.map((row) => (
						<li
							key={row.key}
							className={`ws-citizen-status-item ws-citizen-status-item--${row.key.toLowerCase()}${row.count === 0 ? ' is-empty' : ''}`}
						>
							<span className="ws-citizen-status-item__icon" aria-hidden>
								<Icon name={row.icon} />
							</span>
							<span className="ws-citizen-status-item__label">{row.label}</span>
							<span className="ws-citizen-status-item__count">{row.count}</span>
						</li>
					))}
				</ul>
			) : (
				<div className="ws-citizen-status-empty">{t(emptyKey)}</div>
			)}
			<div className="ws-citizen-status-footer">
				<button
					type="button"
					className="ws-btn ws-btn--primary ws-citizen-status-link"
					onClick={() => navigate(footerTo)}
				>
					{footerLabel}
				</button>
			</div>
		</>
	)
}

export default CitizenStatusChart
