import { STATUS, STATUS_LABELS } from '../constants/status'

export function adminStatusBadgeClass(status) {
	const s = String(status || '').toUpperCase()
	if ([STATUS.APPROVED, STATUS.COMPLETED, STATUS.SUBMITTED].includes(s)) {
		return 'ws-badge ws-badge--success'
	}
	if (s === STATUS.REJECTED) return 'ws-badge ws-badge--danger'
	if ([STATUS.DRAFT, STATUS.PARTIAL, STATUS.PENDING].includes(s)) {
		return 'ws-badge ws-badge--warning'
	}
	if ([STATUS.WITHDRAWN, STATUS.CANCELLED].includes(s)) {
		return 'ws-badge ws-badge--muted'
	}
	return 'ws-badge ws-badge--pending'
}

const STATUS_I18N_KEYS = {
	[STATUS.SUBMITTED]: 'ws.status.submitted',
	[STATUS.IN_REVIEW]: 'ws.status.inReview',
	[STATUS.REJECTED]: 'ws.status.rejected',
	[STATUS.APPROVED]: 'ws.status.approved',
	[STATUS.COMPLETED]: 'ws.status.completed',
	[STATUS.DRAFT]: 'ws.status.draft',
	[STATUS.PARTIAL]: 'ws.status.partial',
	[STATUS.PENDING]: 'ws.status.pending',
	[STATUS.UNDER_PROCESS]: 'ws.status.underProcess',
	[STATUS.WITHDRAWN]: 'ws.status.withdrawn',
	[STATUS.CANCELLED]: 'ws.status.cancelled',
	[STATUS.VALUER_ASSIGNED]: 'ws.status.valuerAssigned',
	[STATUS.VALUER_REPORT_SUBMITTED]: 'ws.status.valuerReport',
}

export function adminStatusLabel(status, t) {
	const normalized = String(status || '').toUpperCase()
	const key = STATUS_I18N_KEYS[normalized]
	if (key && typeof t === 'function') {
		const translated = t(key)
		if (translated && translated !== key) return translated
	}
	return STATUS_LABELS[status] || STATUS_LABELS[normalized] || status || '—'
}
