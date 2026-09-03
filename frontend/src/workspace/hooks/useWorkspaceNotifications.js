import { useCallback, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../api'
import { APPLICATION_LABELS, APPLICATION_TYPES } from '../../constants/application'
import { ASSISTANT_ROLES, PRINCIPAL_ROLES, ROLES } from '../../constants/roles'
import { STATUS_LABELS } from '../../constants/status'
import { parseTenantFormsResponse } from '../../utils/tenantFormsApi'

const READ_KEY = 'ws-notif-read-ids'
const MAX_ITEMS = 8

function readStoredIds() {
	try {
		const raw = sessionStorage.getItem(READ_KEY)
		const parsed = raw ? JSON.parse(raw) : []
		return new Set(Array.isArray(parsed) ? parsed.map(String) : [])
	} catch {
		return new Set()
	}
}

function writeStoredIds(ids) {
	try {
		sessionStorage.setItem(READ_KEY, JSON.stringify([...ids]))
	} catch {
		/* ignore */
	}
}

function relativeTime(value) {
	if (!value) return ''
	const date = new Date(typeof value === 'string' && value.includes(' ') && !value.includes('T')
		? value.replace(' ', 'T')
		: value)
	if (Number.isNaN(date.getTime())) return ''
	const diffMs = Date.now() - date.getTime()
	const mins = Math.round(diffMs / 60000)
	if (mins < 1) return 'Just now'
	if (mins < 60) return `${mins} min ago`
	const hours = Math.round(mins / 60)
	if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
	const days = Math.round(hours / 24)
	if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
	return date.toLocaleDateString('en-IN')
}

function formLabel(formType) {
	return APPLICATION_LABELS[formType] || formType || 'Application'
}

function statusLabel(status) {
	const key = String(status || '').toUpperCase()
	return STATUS_LABELS[key] || key || 'Updated'
}

function appHref(row, isCitizen) {
	const no = row.application_no
	if (!no) return '/dashboard'
	const type = row.form_type || row.application_type || ''
	if (isCitizen) {
		return `/dashboard/status/${encodeURIComponent(type || 'application')}/${encodeURIComponent(no)}`
	}
	if (type === APPLICATION_TYPES.TENANCY_CERTIFICATE || type === 'tenancy') {
		return `/dashboard/admin/tenancy/${encodeURIComponent(no)}`
	}
	return `/dashboard/admin/applications/${encodeURIComponent(no)}`
}

function mapRows(rows, isCitizen, readIds) {
	return (rows || [])
		.slice(0, MAX_ITEMS)
		.map((row, index) => {
			const id = String(row.id || row.application_no || index)
			const when = row.updated_at || row.created_at
			return {
				id,
				title: formLabel(row.form_type || row.application_type),
				body: `${row.application_no || 'Application'} — ${statusLabel(row.status)}`,
				time: relativeTime(when),
				unread: !readIds.has(id),
				to: appHref(row, isCitizen),
			}
		})
}

function staffInboxUrl(role) {
	if (ASSISTANT_ROLES.includes(role)) return '/api/admin/applications/inbox'
	if (PRINCIPAL_ROLES.includes(role)) return '/api/admin/applications/principal-inbox'
	if (role === ROLES.VALUER) return '/api/admin/applications/valuer-inbox'
	if (role === ROLES.SUPER_ADMIN || role === ROLES.DISTRICT_ADMIN) {
		return '/api/admin/applications/all'
	}
	return null
}

export function useWorkspaceNotifications(user) {
	const [notifications, setNotifications] = useState([])

	const { data: rawRows, isLoading: loading } = useQuery({
		queryKey: ['notifications', user?.id, user?.role],
		queryFn: async () => {
			if (!user?.id) return []
			const isCitizen = user.role === ROLES.USER
			if (isCitizen) {
				const { data } = await api.get('/api/tenant-forms/my', {
					params: { page: 1, per_page: MAX_ITEMS, sort_by: 'updated_at', sort_order: 'desc' },
				})
				return parseTenantFormsResponse(data).items
			} else {
				const url = staffInboxUrl(user.role)
				if (url) {
					const { data } = await api.get(url, { params: { page: 1, per_page: MAX_ITEMS } })
					return data.applications || data.data || []
				}
				return []
			}
		},
		enabled: !!user?.id,
		refetchInterval: 1000 * 60, // Poll every minute
	})

	useEffect(() => {
		if (!user?.id) {
			setNotifications([])
			return
		}
		const currentRows = rawRows || []
		const isCitizen = user.role === ROLES.USER
		const readIds = readStoredIds()
		setNotifications(mapRows(currentRows, isCitizen, readIds))
	}, [rawRows, user?.id, user?.role])

	const markAllRead = useCallback(() => {
		setNotifications((prev) => {
			const ids = new Set(readStoredIds())
			prev.forEach((item) => ids.add(String(item.id)))
			writeStoredIds(ids)
			return prev.map((item) => ({ ...item, unread: false }))
		})
	}, [])

	const markOneRead = useCallback((id) => {
		const key = String(id)
		const ids = readStoredIds()
		ids.add(key)
		writeStoredIds(ids)
		setNotifications((prev) =>
			prev.map((item) => (String(item.id) === key ? { ...item, unread: false } : item)),
		)
	}, [])

	return { notifications, loading, markAllRead, markOneRead }
}
