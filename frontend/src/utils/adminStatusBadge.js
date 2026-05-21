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
	return 'ws-badge ws-badge--pending'
}

export function adminStatusLabel(status) {
	return STATUS_LABELS[status] || status || '—'
}
