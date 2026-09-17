import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api'
import { Icon } from '../../components/dashboard/Icons'
import StatusProgressViewButton from '../../components/dashboard/StatusProgressViewButton'
import WorkflowConfirmModal from '../../components/dashboard/WorkflowConfirmModal'
import { formatDate } from '../../utils/formatters'
import { STATUS } from '../../constants/status'
import { APPLICATION_TYPES } from '../../constants/application'
import { getAllServiceForms, getServiceFormByKey, tenantServiceGroups } from '../../data/tenantServices'
import { useLanguage } from '../../i18n'
import { useToast } from '../../context/ToastContext'
import { useCitizenApplications } from '../../hooks/useCitizenApplications'

const TAB_TENANCY = 'tenancy'
const TAB_SERVICE = 'service'

function statusFromSearchParams(searchParams) {
	const value = String(searchParams.get('status') || '').toLowerCase()
	return value || 'all'
}

function buildTenancyStatusFilters(t) {
	return [
		{ key: 'all', label: t('ws.uinStatus.filter.all') },
		{ key: 'draft', label: t('ws.status.draft') },
		{ key: 'partial', label: t('ws.status.partial') },
		{ key: 'in_review', label: t('ws.status.inReview') },
		{ key: 'approved', label: t('ws.status.approved') },
		{ key: 'rejected', label: t('ws.status.rejected') },
		{ key: 'withdrawn', label: t('ws.status.withdrawn') },
		{ key: 'cancelled', label: t('ws.status.cancelled') },
	]
}

function buildServiceStatusFilters(t) {
	return [
		{ key: 'all', label: t('ws.uinStatus.filter.all') },
		{ key: 'pending', label: t('ws.status.pending') },
		{ key: 'submitted', label: t('ws.status.submitted') },
		{ key: 'in_review', label: t('ws.status.inReview') },
		{ key: 'approved', label: t('ws.status.approved') },
		{ key: 'rejected', label: t('ws.status.rejected') },
		{ key: 'withdrawn', label: t('ws.status.withdrawn') },
	]
}

function buildServiceGroups(t) {
	return [
		{ key: 'all', label: t('ws.uinStatus.filter.allServices') },
		{ key: 'rent-authority', label: t('ws.citizen.authority.rentAuthority') },
		{ key: 'rent-court', label: t('ws.citizen.authority.rentCourt') },
		{ key: 'rent-tribunal', label: t('ws.citizen.authority.rentTribunal') },
	]
}

function formatStatusText(status, applicationType = '', t) {
	const normalizedType = String(applicationType || '').toLowerCase()
	const normalizedStatus = String(status || '').trim().toUpperCase()

	const isTenancyType = normalizedType.includes(APPLICATION_TYPES.TENANCY_CERTIFICATE)

	if (isTenancyType && [STATUS.SUBMITTED, STATUS.IN_REVIEW, STATUS.UNDER_PROCESS].includes(normalizedStatus)) {
		return t('ws.status.inReview')
	}

	if (normalizedStatus === STATUS.SUBMITTED) return t('ws.status.submitted')
	if (normalizedStatus === STATUS.IN_REVIEW) return t('ws.status.inReview')
	if (normalizedStatus === STATUS.REJECTED) return t('ws.status.rejected')
	if (normalizedStatus === STATUS.DRAFT) return t('ws.status.draft')
	if (normalizedStatus === STATUS.PARTIAL) return t('ws.status.partial')
	if (normalizedStatus === STATUS.APPROVED) return t('ws.status.approved')
	if (normalizedStatus === STATUS.COMPLETED) return t('ws.status.approved')

	if (
		normalizedType.includes(APPLICATION_TYPES.TENANCY_CERTIFICATE) &&
		normalizedStatus === STATUS.UNDER_PROCESS
	) {
		return t('ws.status.submitted')
	}

	if (normalizedStatus === STATUS.UNDER_PROCESS) return t('ws.status.underProcess')
	if (normalizedStatus === STATUS.PENDING) return t('ws.status.pending')
	if (
		normalizedStatus === STATUS.VALUER_ASSIGNED ||
		normalizedStatus === STATUS.VALUER_REPORT_SUBMITTED
	) {
		return t('ws.status.inReview')
	}
	if (normalizedStatus === STATUS.WITHDRAWN) return t('ws.status.withdrawn')
	if (normalizedStatus === STATUS.CANCELLED) return t('ws.status.cancelled')

	return status || '—'
}

function statusBadgeClass(status, isTenancy = false) {
	const s = String(status || '').toUpperCase()
	if ([STATUS.APPROVED, STATUS.COMPLETED].includes(s)) {
		return 'ws-badge ws-badge--success'
	}
	if (s === STATUS.REJECTED || s === STATUS.CANCELLED) return 'ws-badge ws-badge--danger'
	if (isTenancy && [STATUS.SUBMITTED, STATUS.IN_REVIEW, STATUS.UNDER_PROCESS].includes(s)) {
		return 'ws-badge ws-badge--review'
	}
	if ([STATUS.IN_REVIEW, STATUS.VALUER_ASSIGNED, STATUS.VALUER_REPORT_SUBMITTED].includes(s)) {
		return 'ws-badge ws-badge--review'
	}
	if ([STATUS.WITHDRAWN].includes(s)) return 'ws-badge ws-badge--muted'
	if ([STATUS.PARTIAL, STATUS.PENDING, STATUS.DRAFT].includes(s)) return 'ws-badge ws-badge--warning'
	return 'ws-badge ws-badge--pending'
}

function getAwaitingPartyLabel(initiatorRole, t) {
	if (initiatorRole === 'LANDLORD') return t('ws.join.role.tenant')
	return t('ws.join.role.landlord')
}

function isTenancyApp(app) {
	return (
		app.source_type === 'tenancy' ||
		String(app.application_type || '')
			.toLowerCase()
			.includes(APPLICATION_TYPES.TENANCY_CERTIFICATE)
	)
}

function appMatchesFormKey(app, formKey) {
	if (formKey === 'all') return true
	if (app.form_key === formKey) return true
	const def = getAllServiceForms().find((f) => f.formKey === formKey)
	if (!def) return false
	const label = String(app.application_type || '').toLowerCase()
	return label.includes(def.formName.toLowerCase()) || label.includes(formKey.replace(/-/g, ' '))
}

function appInServiceGroup(app, groupId) {
	if (groupId === 'all') return true
	if (groupId === 'tenancy') return isTenancyApp(app)
	const keys = getAllServiceForms()
		.filter((f) => f.groupId === groupId)
		.map((f) => f.formKey)
	if (app.form_key && keys.includes(app.form_key)) return true
	return keys.some((key) => appMatchesFormKey(app, key))
}

function sortItems(items, sortBy, sortOrder) {
	const dir = sortOrder === 'asc' ? 1 : -1
	return [...items].sort((a, b) => {
		switch (sortBy) {
			case 'application_no':
				return dir * String(a.application_no || '').localeCompare(String(b.application_no || ''))
			case 'uid':
				return dir * String(a.uid || '').localeCompare(String(b.uid || ''))
			case 'status':
				return dir * String(a.status || '').localeCompare(String(b.status || ''))
			case 'form':
				return (
					dir *
					String(a.application_type || '').localeCompare(String(b.application_type || ''))
				)
			case 'created_at':
			default: {
				const ta = a.created_at ? new Date(a.created_at).getTime() : 0
				const tb = b.created_at ? new Date(b.created_at).getTime() : 0
				return dir * (ta - tb)
			}
		}
	})
}

function getServiceFormFilters(groupId, t) {
	if (groupId === 'all') {
		return [{ key: 'all', label: t('ws.uinStatus.filter.allForms') }]
	}
	const groupDef = tenantServiceGroups.find((g) => g.id === groupId)
	if (!groupDef) return [{ key: 'all', label: t('ws.uinStatus.filter.allForms') }]
	return [
		{ key: 'all', label: t('ws.uinStatus.filter.allForms') },
		...groupDef.forms.map((f) => ({ key: f.formKey, label: f.formName })),
	]
}

function canWithdrawApp(app) {
	return String(app.status || '').toUpperCase() === STATUS.SUBMITTED
}

function getWithdrawType(app) {
	if (isTenancyApp(app)) return APPLICATION_TYPES.TENANCY_CERTIFICATE
	return app.form_key || app.form_type || 'form'
}

function formatRowStatus(app, isTenancy, t) {
	const status = String(app?.status || '').trim().toUpperCase()
	if (isTenancy && status === STATUS.PARTIAL) {
		return t('ws.uinStatus.completion.awaiting', {
			party: getAwaitingPartyLabel(app.initiator_role, t),
		})
	}
	if (isTenancy && [STATUS.SUBMITTED, STATUS.IN_REVIEW, STATUS.UNDER_PROCESS].includes(status)) {
		return t('ws.status.inReview')
	}
	return formatStatusText(app.status, app.application_type, t)
}

const FORM_COPY_KEYS = {
	[APPLICATION_TYPES.RENT_REVISION]: {
		name: 'ws.services.form.i.name',
		matter: 'ws.services.form.i.matter',
	},
	[APPLICATION_TYPES.OTHER_CHARGES_REVISION]: {
		name: 'ws.services.form.ia.name',
		matter: 'ws.services.form.ia.matter',
	},
	[APPLICATION_TYPES.VALUER_APPOINTMENT]: {
		name: 'ws.services.form.ib.name',
		matter: 'ws.services.form.ib.matter',
	},
	[APPLICATION_TYPES.RENT_AUTHORITY_FILING]: {
		name: 'ws.services.form.iv.name',
		matter: 'ws.services.form.iv.matter',
	},
	[APPLICATION_TYPES.RENT_COURT_POSSESSION]: {
		name: 'ws.services.form.ii.name',
		matter: 'ws.services.form.ii.matter',
	},
	[APPLICATION_TYPES.RENT_COURT_FILING]: {
		name: 'ws.services.form.iii.name',
		matter: 'ws.services.form.iii.matter',
	},
	[APPLICATION_TYPES.RENT_COURT_APPEAL]: {
		name: 'ws.services.form.v.name',
		matter: 'ws.services.form.v.matter',
	},
	[APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL]: {
		name: 'ws.services.form.vi.name',
		matter: 'ws.services.form.vi.matter',
	},
}

function serviceFormCopy(app, t) {
	const key = app?.form_key || app?.form_type
	const i18n = FORM_COPY_KEYS[key]
	const def = getServiceFormByKey(key)
	return {
		name: i18n ? t(i18n.name) : def?.formName || app?.application_type || '—',
		matter: i18n ? t(i18n.matter) : def?.matter || '',
	}
}

function ariaSortValue(sortBy, sortOrder, column) {
	if (sortBy !== column) return 'none'
	return sortOrder === 'asc' ? 'ascending' : 'descending'
}

function ApplicationsTableSkeleton({ isTenancy, t, rows = 8 }) {
	return (
		<div
			className="ws-status-table-wrap ws-status-table-wrap--loading"
			role="status"
			aria-live="polite"
			aria-busy="true"
			aria-label={t('ws.uinStatus.loading')}
		>
			<div className="ws-status-loading-banner">
				<span className="ws-route-spinner ws-route-spinner--sm" aria-hidden />
				<span>{t('ws.uinStatus.loading')}</span>
			</div>
			<table className={`ws-table ws-status-table${isTenancy ? '' : ' ws-status-table--service'}`}>
				<thead>
					<tr>
						<th scope="col" className="ws-status-col-app">
							{t('ws.uinStatus.col.appNo')}
						</th>
						<th scope="col" className="ws-status-col-uin">
							{t('ws.uinStatus.col.uin')}
						</th>
						{!isTenancy ? (
							<th scope="col" className="ws-status-col-form">
								{t('ws.uinStatus.col.form')}
							</th>
						) : null}
						<th scope="col" className="ws-status-col-date">
							{t('ws.uinStatus.col.date')}
						</th>
						<th scope="col" className="ws-status-col-status">
							{t('ws.uinStatus.col.status')}
						</th>
						<th scope="col" className="ws-status-th-actions">
							{t('ws.uinStatus.col.actions')}
						</th>
					</tr>
				</thead>
				<tbody>
					{Array.from({ length: rows }, (_, index) => (
						<tr key={index} className="ws-status-row ws-status-row--skel">
							<td className="ws-status-col-app">
								<span className="ws-skel ws-skel--appno" />
							</td>
							<td className="ws-status-col-uin">
								<span className="ws-skel ws-skel--date" />
							</td>
							{!isTenancy ? (
								<td className="ws-status-col-form">
									<span className="ws-skel ws-skel--type" />
								</td>
							) : null}
							<td className="ws-status-col-date">
								<span className="ws-skel ws-skel--date" />
							</td>
							<td className="ws-status-col-status">
								<span className="ws-skel ws-skel--badge" />
							</td>
							<td className="ws-status-actions">
								<div className="ws-status-actions-inner" aria-hidden>
									<span className="ws-skel ws-skel--action" />
									<span className="ws-skel ws-skel--action" />
									<span className="ws-skel ws-skel--action" />
									<span className="ws-skel ws-skel--action" />
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

function ApplicationsTable({
	items,
	isTenancy,
	copiedRefCode,
	onCopyRef,
	onOpenDetails,
	onDownloadAck,
	onJoin,
	onResumeDraft,
	onWithdraw,
	allowWithdraw,
	withdrawingId,
	canJoinApp,
	emptyMessage,
	sortBy,
	sortOrder,
	onSortColumn,
	t,
}) {
	const sortedItems = useMemo(
		() => sortItems(items, sortBy, sortOrder),
		[items, sortBy, sortOrder]
	)

	const handleSortColumn = (column) => {
		if (sortBy === column) {
			onSortColumn?.(column, sortOrder === 'asc' ? 'desc' : 'asc')
		} else {
			onSortColumn?.(column, column === 'created_at' ? 'desc' : 'asc')
		}
	}

	const SortIndicator = ({ column }) => (
		<span
			className={`ws-status-sort${sortBy === column ? ' is-active' : ''}${
				sortBy === column && sortOrder === 'asc' ? ' is-asc' : ''
			}`}
			aria-hidden
		/>
	)

	if (sortedItems.length === 0) {
		return <div className="ws-empty ws-empty--compact">{emptyMessage}</div>
	}

	const openRow = (app, isDraft) => {
		if (isDraft) onResumeDraft?.(app)
		else onOpenDetails(app)
	}

	return (
		<div className="ws-status-table-wrap">
			<table className={`ws-table ws-status-table${isTenancy ? '' : ' ws-status-table--service'}`}>
				<thead>
					<tr>
						<th
							scope="col"
							className="ws-status-col-app"
							aria-sort={ariaSortValue(sortBy, sortOrder, 'application_no')}
						>
							<button
								type="button"
								className="ws-status-th-sort"
								onClick={() => handleSortColumn('application_no')}
							>
								{t('ws.uinStatus.col.appNo')} <SortIndicator column="application_no" />
							</button>
						</th>
						<th
							scope="col"
							className="ws-status-col-uin"
							aria-sort={ariaSortValue(sortBy, sortOrder, 'uid')}
						>
							<button
								type="button"
								className="ws-status-th-sort"
								onClick={() => handleSortColumn('uid')}
							>
								{t('ws.uinStatus.col.uin')} <SortIndicator column="uid" />
							</button>
						</th>
						{!isTenancy ? (
							<th
								scope="col"
								className="ws-status-col-form"
								aria-sort={ariaSortValue(sortBy, sortOrder, 'form')}
							>
								<button
									type="button"
									className="ws-status-th-sort"
									onClick={() => handleSortColumn('form')}
								>
									{t('ws.uinStatus.col.form')} <SortIndicator column="form" />
								</button>
							</th>
						) : null}
						<th
							scope="col"
							className="ws-status-col-date"
							aria-sort={ariaSortValue(sortBy, sortOrder, 'created_at')}
						>
							<button
								type="button"
								className="ws-status-th-sort"
								onClick={() => handleSortColumn('created_at')}
							>
								{t('ws.uinStatus.col.date')} <SortIndicator column="created_at" />
							</button>
						</th>
						<th
							scope="col"
							className="ws-status-col-status"
							aria-sort={ariaSortValue(sortBy, sortOrder, 'status')}
						>
							<button
								type="button"
								className="ws-status-th-sort"
								onClick={() => handleSortColumn('status')}
							>
								{t('ws.uinStatus.col.status')} <SortIndicator column="status" />
							</button>
						</th>
						<th scope="col" className="ws-status-th-actions">
							{t('ws.uinStatus.col.actions')}
						</th>
					</tr>
				</thead>
				<tbody>
					{sortedItems.map((app) => {
						const isDraft =
							String(app.status || '').toUpperCase() === STATUS.DRAFT && isTenancy
						const formCopy = !isTenancy ? serviceFormCopy(app, t) : null
						return (
							<tr
								key={app.row_key || app.id}
								className="ws-status-row"
								tabIndex={0}
								onClick={() => openRow(app, isDraft)}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault()
										openRow(app, isDraft)
									}
								}}
							>
								<td className="ws-status-col-app" data-label={t('ws.uinStatus.col.appNo')}>
									<span className="ws-status-appno">
										{app.application_no || (
											<span className="ws-status-empty">—</span>
										)}
									</span>
								</td>
								<td
									className="ws-status-col-uin"
									data-label={t('ws.uinStatus.col.uin')}
									onClick={(e) => e.stopPropagation()}
								>
									{app.uid && app.uid !== '-' ? (
										<span className="ws-copyable-value">
											<span className="ws-copyable-value-text">
												{app.uid}
											</span>
											<button
												type="button"
												className="ws-copy-btn"
												title={
													copiedRefCode === `uid:${app.uid}`
														? t('ws.uinStatus.copy.copied')
														: t('ws.uinStatus.copy.uin')
												}
												aria-label={
													copiedRefCode === `uid:${app.uid}`
														? t('ws.uinStatus.copy.uinCopied')
														: t('ws.uinStatus.copy.copyUinAria', { uin: app.uid })
												}
												onClick={() => onCopyRef(app.uid, `uid:${app.uid}`)}
											>
												<Icon
													name={copiedRefCode === `uid:${app.uid}` ? 'check' : 'copy'}
												/>
											</button>
										</span>
									) : (
										<span className="ws-status-empty">—</span>
									)}
								</td>
								{!isTenancy ? (
									<td className="ws-status-col-form" data-label={t('ws.uinStatus.col.form')}>
										<span className="ws-status-form">
											<span className="ws-status-form-name">{formCopy.name}</span>
											{formCopy.matter ? (
												<span className="ws-status-form-matter">{formCopy.matter}</span>
											) : null}
										</span>
									</td>
								) : null}
								<td className="ws-status-col-date" data-label={t('ws.uinStatus.col.date')}>
									{app.created_at ? (
										<time dateTime={String(app.created_at).replace(' ', 'T')}>
											{formatDate(app.created_at)}
										</time>
									) : (
										<span className="ws-status-empty">—</span>
									)}
								</td>
								<td className="ws-status-col-status" data-label={t('ws.uinStatus.col.status')}>
									<span className={statusBadgeClass(app.status, isTenancy)}>
										{formatRowStatus(app, isTenancy, t)}
									</span>
								</td>
								<td
									className="ws-status-actions"
									data-label={t('ws.uinStatus.col.actions')}
									onClick={(e) => e.stopPropagation()}
								>
									<div className="ws-status-actions-inner">
									{isDraft ? (
										<button
											type="button"
											className="ws-status-action-btn ws-status-action-btn--resume"
											title={t('ws.uinStatus.action.resumeTitle')}
											onClick={(e) => {
												e.preventDefault()
												e.stopPropagation()
												onResumeDraft?.(app)
											}}
										>
											<Icon name="documentPlus" />
											<span>{t('ws.uinStatus.action.resume')}</span>
										</button>
									) : (
										<>
											<StatusProgressViewButton
												application={app}
												variant="workspace"
												title={t('ws.uinStatus.action.progressTitle')}
											/>
											<button
												type="button"
												className="ws-status-action-btn ws-status-action-btn--view"
												title={t('ws.uinStatus.action.viewTitle')}
												onClick={() => onOpenDetails(app)}
											>
												<Icon name="eye" />
												<span>{t('ws.uinStatus.action.view')}</span>
											</button>
										</>
									)}
									{isTenancy && !isDraft ? (
										<button
											type="button"
											className="ws-status-action-btn ws-status-action-btn--receipt"
											title={t('ws.uinStatus.action.receiptTitle')}
											onClick={() => onDownloadAck(app.application_no)}
										>
											<Icon name="download" />
											<span>{t('ws.uinStatus.action.receipt')}</span>
										</button>
									) : null}
									{app.status === 'PARTIAL' && app.ref_code ? (
										canJoinApp(app) ? (
											<button
												type="button"
												className="ws-status-action-btn ws-status-action-btn--join"
												title={t('ws.uinStatus.action.joinTitle')}
												onClick={() => onJoin(app.ref_code)}
											>
												<Icon name="check" />
												<span>{t('ws.uinStatus.action.join')}</span>
											</button>
										) : (
											<button
												type="button"
												className="ws-status-action-btn ws-status-action-btn--invite"
												title={
													copiedRefCode === app.ref_code
														? t('ws.uinStatus.action.inviteCopiedTitle')
														: t('ws.uinStatus.action.inviteTitle')
												}
												onClick={() =>
													onCopyRef(
														`${window.location.origin}/join?ref=${app.ref_code}`,
														app.ref_code
													)
												}
											>
												<Icon name="logout" />
												<span>
													{copiedRefCode === app.ref_code
														? t('ws.uinStatus.action.inviteCopied')
														: t('ws.uinStatus.action.invite')}
												</span>
											</button>
										)
									) : null}
									{allowWithdraw && canWithdrawApp(app) ? (
										<button
											type="button"
											className="ws-status-action-btn ws-status-action-btn--reject"
											title={t('ws.uinStatus.action.withdrawTitle')}
											disabled={withdrawingId === app.id}
											onClick={() => onWithdraw?.(app)}
										>
											<Icon name="x" />
											<span>{t('ws.uinStatus.action.withdraw')}</span>
										</button>
									) : null}
									</div>
								</td>
							</tr>
						)
					})}
				</tbody>
			</table>
		</div>
	)
}

export default function WorkspaceUinStatus() {
	const queryClient = useQueryClient()
	const { user } = useOutletContext()
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams()
	const { t } = useLanguage()
	const { showToast } = useToast()

	const [withdrawApp, setWithdrawApp] = useState(null)
	const [withdrawing, setWithdrawing] = useState(false)

	const [page, setPage] = useState(1)
	const [copiedRefCode, setCopiedRefCode] = useState('')

	const [activeTab, setActiveTab] = useState(() =>
		searchParams.get('type') === TAB_SERVICE ? TAB_SERVICE : TAB_TENANCY,
	)
	const [statusFilter, setStatusFilter] = useState(() => statusFromSearchParams(searchParams))
	const [serviceGroup, setServiceGroup] = useState('all')
	const [formFilter, setFormFilter] = useState('all')

	const [searchQuery, setSearchQuery] = useState(
		() => searchParams.get('app_no') || searchParams.get('q') || '',
	)
	const [submittedQuery, setSubmittedQuery] = useState(
		() => searchParams.get('app_no') || searchParams.get('q') || '',
	)
	const [sortBy, setSortBy] = useState('created_at')
	const [sortOrder, setSortOrder] = useState('desc')

	useEffect(() => {
		const raw = searchParams.get('type')
		if (raw === TAB_SERVICE || raw === TAB_TENANCY) {
			setActiveTab(raw)
		}
	}, [searchParams])

	const endpoint = user?.role === 'user' ? '/api/tenant-forms/my' : '/api/tenancy-applications/my'
	const queryParams = {
		page,
		q: submittedQuery.trim() || undefined,
		sort_by: sortBy,
		sort_order: sortOrder,
		type: activeTab,
		status_filter: statusFilter,
	}

	const { data, isLoading, isFetching, isError, refetch } = useCitizenApplications(endpoint, queryParams)
	const loading = isLoading || (isFetching && !data)
	const refreshing = isFetching && Boolean(data)
	const error = isError ? t('ws.uinStatus.error.load') : ''
	const applications = useMemo(() => {
		if (!data) return []
		return Array.isArray(data) ? data : data?.data ?? []
	}, [data])
	const totalPages = Number(data?.last_page) || 1
	const totalResults = Number(data?.total) || applications.length

	const tenancyStatusFilters = useMemo(() => buildTenancyStatusFilters(t), [t])
	const serviceStatusFilters = useMemo(() => buildServiceStatusFilters(t), [t])
	const serviceGroups = useMemo(() => buildServiceGroups(t), [t])

	const serviceFormFilters = useMemo(
		() => getServiceFormFilters(serviceGroup, t),
		[serviceGroup, t]
	)

	const displayedItems = useMemo(() => {
		let rows = applications
		if (activeTab === TAB_SERVICE) {
			rows = rows.filter((app) => appInServiceGroup(app, serviceGroup))
			if (formFilter !== 'all') {
				rows = rows.filter((app) => appMatchesFormKey(app, formFilter))
			}
		}
		return rows
	}, [applications, activeTab, serviceGroup, formFilter])

	const handleSearch = (e) => {
		e.preventDefault()
		setSubmittedQuery(searchQuery.trim())
		setPage(1)
	}

	const handleClearSearch = () => {
		setSearchQuery('')
		setSubmittedQuery('')
		setStatusFilter('all')
		setServiceGroup('all')
		setFormFilter('all')
		setPage(1)
	}

	const handleTabChange = (tab) => {
		setActiveTab(tab)
		setStatusFilter('all')
		setServiceGroup('all')
		setFormFilter('all')
		if (tab === TAB_TENANCY && sortBy === 'form') {
			setSortBy('created_at')
			setSortOrder('desc')
		}
		setPage(1)
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev)
				next.set('type', tab)
				return next
			},
			{ replace: true },
		)
	}

	const handleStatusFilter = (key) => {
		setStatusFilter(key)
		setPage(1)
	}

	const handleSort = (column, order) => {
		setSortBy(column)
		setSortOrder(order)
		setPage(1)
	}

	const handleServiceGroupChange = (key) => {
		setServiceGroup(key)
		setFormFilter('all')
		setPage(1)
	}

	const copyToClipboard = (text, identifier) => {
		navigator.clipboard.writeText(text).then(() => {
			setCopiedRefCode(identifier)
			setTimeout(() => {
				setCopiedRefCode((prev) => (prev === identifier ? '' : prev))
			}, 2000)
		})
	}

	const canJoin = (app) => {
		if (app.status !== 'PARTIAL') return false
		if (app.second_party_completed) return false
		if (!app.ref_code) return false
		const secondPartyRole = app.initiator_role === 'LANDLORD' ? 'TENANT' : 'LANDLORD'
		const expectedPhone =
			secondPartyRole === 'LANDLORD' ? app.landlord_phone : app.tenant_phone
		return user?.phone && user.phone === expectedPhone
	}

	const openDetails = (app) => {
		const isTenancy = app.application_type?.toLowerCase().includes('tenancy certificate')
		const type = isTenancy ? 'tenancy' : app.form_key || 'form'
		navigate(`/dashboard/status/${type}/${app.application_no}`)
	}

	const resumeDraft = (app) => {
		if (!app?.application_no) return
		navigate(
			`/dashboard/tenancy-certificate?draft=${encodeURIComponent(app.application_no)}`
		)
	}

	const downloadAcknowledgement = async (applicationNo) => {
		try {
			const response = await api.get(
				`/api/tenancy-applications/${applicationNo}/acknowledgement?print=1`
			)
			const printWindow = window.open('', '_blank')
			printWindow.document.write(response.data)
			printWindow.document.close()
		} catch (err) {
			showToast(err?.response?.data?.message || t('ws.uinStatus.error.ack'), 'error')
		}
	}

	const withdrawMutation = useMutation({
		mutationFn: async ({ type, id }) => {
			const { data } = await api.post(`/api/tenant-forms/${type}/${id}/withdraw`)
			return data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['citizen-applications'] })
			queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
		}
	})

	const confirmWithdraw = async () => {
		if (!withdrawApp) return
		setWithdrawing(true)
		try {
			const type = getWithdrawType(withdrawApp)
			await withdrawMutation.mutateAsync({ type, id: withdrawApp.id })
			showToast(t('ws.withdraw.success'), 'success')
			setWithdrawApp(null)
			refetch()
		} catch (err) {
			showToast(err?.response?.data?.message || t('ws.withdraw.error'), 'error')
		} finally {
			setWithdrawing(false)
		}
	}

	const isTenancyTab = activeTab === TAB_TENANCY
	const statusFilters = isTenancyTab ? tenancyStatusFilters : serviceStatusFilters
	const filtersActive =
		statusFilter !== 'all' ||
		serviceGroup !== 'all' ||
		formFilter !== 'all' ||
		searchQuery.trim() !== '' ||
		submittedQuery.trim() !== ''

	useEffect(() => {
		if (isTenancyTab && statusFilter === 'submitted') {
			setStatusFilter('in_review')
			return
		}
		if (statusFilters.some((sf) => sf.key === statusFilter)) return
		setStatusFilter('all')
	}, [statusFilters, statusFilter, isTenancyTab])

	return (
		<div className="ws-page ws-status-page" aria-busy={loading || refreshing}>
			<header className="ws-status-page-head">
				<h1 className="ws-status-title">{t('ws.uinStatus.title')}</h1>
				<p className="ws-status-lead">{t('ws.uinStatus.lead')}</p>
				<div
					className={`ws-status-tabs ws-status-tabs--${isTenancyTab ? 'tenancy' : 'service'}`}
					role="tablist"
					aria-label={t('ws.uinStatus.tabs.aria')}
				>
					<button
						type="button"
						role="tab"
						className={`ws-status-tab ws-status-tab--tenancy${
							activeTab === TAB_TENANCY ? ' is-active' : ''
						}`}
						aria-selected={activeTab === TAB_TENANCY}
						onClick={() => handleTabChange(TAB_TENANCY)}
					>
						{t('ws.uinStatus.tab.tenancy')}
					</button>
					<button
						type="button"
						role="tab"
						className={`ws-status-tab ws-status-tab--service${
							activeTab === TAB_SERVICE ? ' is-active' : ''
						}`}
						aria-selected={activeTab === TAB_SERVICE}
						onClick={() => handleTabChange(TAB_SERVICE)}
					>
						{t('ws.uinStatus.tab.service')}
					</button>
				</div>
			</header>

			{error ? (
				<div className="ws-profile-alert ws-profile-alert--error" role="alert">
					{error}
				</div>
			) : null}

			<div
				className={`ws-status-control-panel ws-status-control-panel--${
					isTenancyTab ? 'tenancy' : 'service'
				}`}
			>
				<div className="ws-status-control-body">
					<form className="ws-status-toolbar ws-status-toolbar--inline" onSubmit={handleSearch}>
						<label className="ws-status-search ws-status-search--wide">
							<span className="sr-only">{t('ws.uinStatus.search.label')}</span>
							<span className="ws-status-search-field">
								<Icon name="search" />
								<input
									type="search"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder={t('ws.uinStatus.search.placeholder')}
									autoComplete="off"
								/>
							</span>
						</label>
						<div className="ws-status-toolbar-actions">
							<button type="submit" className="ws-btn ws-btn--primary" disabled={loading}>
								{t('ws.uinStatus.search')}
							</button>
							{filtersActive ? (
								<button
									type="button"
									className="ws-btn ws-btn--outline"
									onClick={handleClearSearch}
									disabled={loading}
								>
									{t('ws.uinStatus.clear')}
								</button>
							) : null}
						</div>
					</form>

					<div className="ws-status-filter-row">
						<div className="ws-status-filter-group">
							<span className="ws-status-filter-label">{t('ws.uinStatus.filter.status')}</span>
							<div
								className="ws-status-filter-chips"
								role="group"
								aria-label={t('ws.uinStatus.filter.statusAria')}
							>
								{statusFilters.map((sf) => (
									<button
										key={sf.key}
										type="button"
										className={`ws-status-filter-chip${statusFilter === sf.key ? ' is-active' : ''}`}
										aria-pressed={statusFilter === sf.key}
										onClick={() => handleStatusFilter(sf.key)}
									>
										{sf.label}
									</button>
								))}
							</div>
						</div>

						{!isTenancyTab ? (
							<div className="ws-status-filter-selects">
								<label className="ws-status-filter-select">
									<span className="ws-status-filter-label">
										{t('ws.uinStatus.filter.service')}
									</span>
									<select
										value={serviceGroup}
										aria-label={t('ws.uinStatus.filter.serviceAria')}
										onChange={(e) => handleServiceGroupChange(e.target.value)}
									>
										{serviceGroups.map((sg) => (
											<option key={sg.key} value={sg.key}>
												{sg.label}
											</option>
										))}
									</select>
								</label>
								{serviceFormFilters.length > 1 ? (
									<label className="ws-status-filter-select">
										<span className="ws-status-filter-label">
											{t('ws.uinStatus.filter.form')}
										</span>
										<select
											value={formFilter}
											aria-label={t('ws.uinStatus.filter.formAria')}
											onChange={(e) => {
												setFormFilter(e.target.value)
												setPage(1)
											}}
										>
											{serviceFormFilters.map((ff) => (
												<option key={ff.key} value={ff.key}>
													{ff.label}
												</option>
											))}
										</select>
									</label>
								) : null}
							</div>
						) : null}
					</div>

					<div className={`ws-status-results${refreshing ? ' is-fetching' : ''}`}>
						<div className="ws-status-results-head">
							<span className="ws-status-results-label">
								{isTenancyTab ? t('ws.uinStatus.results') : t('ws.uinStatus.serviceResults')}
							</span>
							<span className="ws-status-panel-count">
								{loading || refreshing
									? t('ws.uinStatus.loading')
									: t('ws.uinStatus.matching', {
											shown: displayedItems.length,
											total: totalResults,
										})}
							</span>
						</div>
						{refreshing ? (
							<div className="ws-status-loading-banner" role="status" aria-live="polite">
								<span className="ws-route-spinner ws-route-spinner--sm" aria-hidden />
								<span>{t('ws.uinStatus.loading')}</span>
							</div>
						) : null}
						{loading ? (
							<ApplicationsTableSkeleton isTenancy={isTenancyTab} t={t} />
						) : (
							<ApplicationsTable
								items={displayedItems}
								isTenancy={isTenancyTab}
								copiedRefCode={copiedRefCode}
								onCopyRef={copyToClipboard}
								onOpenDetails={openDetails}
								onDownloadAck={downloadAcknowledgement}
								onJoin={(ref) => navigate(`/join?ref=${ref}`)}
								onResumeDraft={resumeDraft}
								onWithdraw={setWithdrawApp}
								allowWithdraw={user?.role === 'user'}
								withdrawingId={withdrawing ? withdrawApp?.id : null}
								canJoinApp={canJoin}
								emptyMessage={
									applications.length === 0
										? t('ws.uinStatus.empty.none')
										: t('ws.uinStatus.empty.filtered')
								}
								sortBy={sortBy}
								sortOrder={sortOrder}
								onSortColumn={handleSort}
								t={t}
							/>
						)}
					</div>
				</div>
			</div>

			{!loading && applications.length > 0 ? (
				<nav
					className="ws-status-pagination"
					aria-label={t('ws.uinStatus.pagination.aria')}
				>
					<button
						type="button"
						className="ws-btn ws-btn--outline"
						onClick={() => setPage(page - 1)}
						disabled={page <= 1 || loading}
					>
						{t('ws.uinStatus.pagination.prev')}
					</button>
					<span className="ws-status-pagination-info">
						{t('ws.uinStatus.pagination.page', { page, total: totalPages })}
					</span>
					<button
						type="button"
						className="ws-btn ws-btn--outline"
						onClick={() => setPage(page + 1)}
						disabled={page >= totalPages || loading}
					>
						{t('ws.uinStatus.pagination.next')}
					</button>
				</nav>
			) : null}

			<WorkflowConfirmModal
				open={Boolean(withdrawApp)}
				onClose={() => {
					if (!withdrawing) setWithdrawApp(null)
				}}
				title={t('ws.withdraw.title')}
				description={t('ws.withdraw.description', {
					appNo: withdrawApp?.application_no || '',
				})}
				primaryLabel={withdrawing ? t('ws.withdraw.working') : t('ws.withdraw.confirm')}
				primaryVariant="danger"
				primaryDisabled={withdrawing}
				onPrimary={confirmWithdraw}
			/>
		</div>
	)
}
