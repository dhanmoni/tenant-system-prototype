import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import api from '../../api'
import { Icon } from '../../components/dashboard/Icons'
import StatusProgressViewButton from '../../components/dashboard/StatusProgressViewButton'
import WorkflowConfirmModal from '../../components/dashboard/WorkflowConfirmModal'
import { formatDate } from '../../utils/formatters'
import { STATUS } from '../../constants/status'
import { APPLICATION_TYPES } from '../../constants/application'
import { getAllServiceForms, tenantServiceGroups } from '../../data/tenantServices'
import { useLanguage } from '../../i18n'
import { useToast } from '../../context/ToastContext'

const TAB_TENANCY = 'tenancy'
const TAB_SERVICE = 'service'

function buildTenancyStatusFilters(t) {
	return [
		{ key: 'all', label: t('ws.uinStatus.filter.all') },
		{ key: 'draft', label: t('ws.status.draft') },
		{ key: 'partial', label: t('ws.status.partial') },
		{ key: 'submitted', label: t('ws.status.submitted') },
		{ key: 'in_review', label: t('ws.status.inReview') },
		{ key: 'approved', label: t('ws.status.approved') },
		{ key: 'rejected', label: t('ws.status.rejected') },
		{ key: 'withdrawn', label: t('ws.status.withdrawn') },
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

	if (normalizedStatus === STATUS.SUBMITTED) return t('ws.status.submitted')
	if (normalizedStatus === STATUS.IN_REVIEW) return t('ws.status.inReview')
	if (normalizedStatus === STATUS.REJECTED) return t('ws.status.rejected')
	if (normalizedStatus === STATUS.DRAFT) return t('ws.status.draft')
	if (normalizedStatus === STATUS.PARTIAL) return t('ws.status.partial')
	if (normalizedStatus === STATUS.APPROVED) return t('ws.status.approved')
	if (normalizedStatus === STATUS.COMPLETED) return t('ws.status.completed')

	if (
		normalizedType.includes(APPLICATION_TYPES.TENANCY_CERTIFICATE) &&
		normalizedStatus === STATUS.UNDER_PROCESS
	) {
		return t('ws.status.submitted')
	}

	if (normalizedStatus === STATUS.UNDER_PROCESS) return t('ws.status.underProcess')
	if (normalizedStatus === STATUS.PENDING) return t('ws.status.pending')
	if (normalizedStatus === STATUS.VALUER_ASSIGNED) return t('ws.status.valuerAssigned')
	if (normalizedStatus === STATUS.VALUER_REPORT_SUBMITTED) return t('ws.status.valuerReport')
	if (normalizedStatus === STATUS.WITHDRAWN) return t('ws.status.withdrawn')

	return status || '—'
}

function statusBadgeClass(status) {
	const s = String(status || '').toUpperCase()
	if ([STATUS.APPROVED, STATUS.COMPLETED, STATUS.SUBMITTED].includes(s)) {
		return 'ws-badge ws-badge--success'
	}
	if ([STATUS.REJECTED].includes(s)) return 'ws-badge ws-badge--danger'
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
	t,
}) {
	const [sortBy, setSortBy] = useState('created_at')
	const [sortOrder, setSortOrder] = useState('desc')

	const sortedItems = useMemo(
		() => sortItems(items, sortBy, sortOrder),
		[items, sortBy, sortOrder]
	)

	const handleSortColumn = (column) => {
		if (sortBy === column) {
			setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
		} else {
			setSortBy(column)
			setSortOrder('desc')
		}
	}

	const SortIndicator = ({ column }) => (
		<span
			className={`ws-status-sort${sortBy === column ? ' is-active' : ''}${
				sortBy === column && sortOrder === 'asc' ? ' is-asc' : ''
			}`}
			aria-hidden
		>
			↕
		</span>
	)

	if (sortedItems.length === 0) {
		return <div className="ws-empty ws-empty--compact">{emptyMessage}</div>
	}

	return (
		<div className="ws-status-table-wrap">
			<table className="ws-table ws-status-table">
				<thead>
					<tr>
						<th>
							<button
								type="button"
								className="ws-status-th-sort"
								onClick={() => handleSortColumn('application_no')}
							>
								{t('ws.uinStatus.col.appNo')} <SortIndicator column="application_no" />
							</button>
						</th>
						<th>
							<button
								type="button"
								className="ws-status-th-sort"
								onClick={() => handleSortColumn('uid')}
							>
								{t('ws.uinStatus.col.uin')} <SortIndicator column="uid" />
							</button>
						</th>
						{!isTenancy ? <th>{t('ws.uinStatus.col.form')}</th> : null}
						<th>
							<button
								type="button"
								className="ws-status-th-sort"
								onClick={() => handleSortColumn('created_at')}
							>
								{t('ws.uinStatus.col.date')} <SortIndicator column="created_at" />
							</button>
						</th>
						<th>
							<button
								type="button"
								className="ws-status-th-sort"
								onClick={() => handleSortColumn('status')}
							>
								{t('ws.uinStatus.col.status')} <SortIndicator column="status" />
							</button>
						</th>
						{isTenancy ? <th>{t('ws.uinStatus.col.completion')}</th> : null}
						<th className="ws-status-th-actions">{t('ws.uinStatus.col.actions')}</th>
					</tr>
				</thead>
				<tbody>
					{sortedItems.map((app) => {
						const isDraft =
							String(app.status || '').toUpperCase() === STATUS.DRAFT && isTenancy
						return (
							<tr
								key={app.row_key || app.id}
								className="ws-status-row"
								onClick={() => (isDraft ? onResumeDraft?.(app) : onOpenDetails(app))}
							>
								<td className="ws-status-cell-mono">{app.application_no}</td>
								<td className="ws-status-cell-uin" onClick={(e) => e.stopPropagation()}>
									{app.uid && app.uid !== '-' ? (
										<span className="ws-copyable-value">
											<span className="ws-copyable-value-text ws-status-cell-mono">
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
										'—'
									)}
								</td>
								{!isTenancy ? (
									<td className="ws-status-cell-form">{app.application_type || '—'}</td>
								) : null}
								<td>{formatDate(app.created_at)}</td>
								<td>
									<span className={statusBadgeClass(app.status)}>
										{formatStatusText(app.status, app.application_type, t)}
									</span>
								</td>
								{isTenancy ? (
									<td>
										{String(app.status).toUpperCase() === 'DRAFT' ? (
											<span className="ws-text-muted">—</span>
										) : app.initiator_completed && app.second_party_completed ? (
											<span className="ws-badge ws-badge--success">
												{t('ws.uinStatus.completion.both')}
											</span>
										) : (
											<span className="ws-badge ws-badge--warning">
												{t('ws.uinStatus.completion.awaiting', {
													party: getAwaitingPartyLabel(app.initiator_role, t),
												})}
											</span>
										)}
									</td>
								) : null}
								<td className="ws-status-actions" onClick={(e) => e.stopPropagation()}>
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
								</td>
							</tr>
						)
					})}
				</tbody>
			</table>
		</div>
	)
}

function WorkspaceUinStatus() {
	const { user } = useOutletContext()
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const { t } = useLanguage()
	const { showToast } = useToast()

	const [applications, setApplications] = useState([])
	const [withdrawApp, setWithdrawApp] = useState(null)
	const [withdrawing, setWithdrawing] = useState(false)

	const [loading, setLoading] = useState(false)
	const [page, setPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)
	const [totalResults, setTotalResults] = useState(0)
	const [error, setError] = useState('')
	const [copiedRefCode, setCopiedRefCode] = useState('')

	const [activeTab, setActiveTab] = useState(TAB_TENANCY)
	const [statusFilter, setStatusFilter] = useState('all')
	const [serviceGroup, setServiceGroup] = useState('all')
	const [formFilter, setFormFilter] = useState('all')

	const [searchAppNo, setSearchAppNo] = useState(searchParams.get('app_no') || '')
	const [searchUid, setSearchUid] = useState('')
	const [searchKeyword, setSearchKeyword] = useState('')
	const [sortBy, setSortBy] = useState('created_at')
	const [sortOrder, setSortOrder] = useState('desc')

	const tenancyStatusFilters = useMemo(() => buildTenancyStatusFilters(t), [t])
	const serviceStatusFilters = useMemo(() => buildServiceStatusFilters(t), [t])
	const serviceGroups = useMemo(() => buildServiceGroups(t), [t])

	const loadApplications = useCallback(
		async (pageNum = 1, overrides = {}) => {
			setLoading(true)
			setError('')
			try {
				const tab = overrides.tab ?? activeTab
				const params = {
					page: pageNum,
					application_no:
						overrides.application_no !== undefined
							? overrides.application_no
							: searchAppNo || undefined,
					uid: overrides.uid !== undefined ? overrides.uid : searchUid || undefined,
					sort_by: overrides.sort_by || sortBy,
					sort_order: overrides.sort_order || sortOrder,
					type: tab,
					status_filter:
						overrides.status_filter !== undefined
							? overrides.status_filter
							: statusFilter,
				}
				const endpoint =
					user?.role === 'user' ? '/api/tenant-forms/my' : '/api/tenancy-applications/my'
				const { data } = await api.get(endpoint, { params })
				const list = Array.isArray(data) ? data : data?.data ?? []
				setApplications(list)
				setPage(Number(data?.current_page) || 1)
				setTotalPages(Number(data?.last_page) || 1)
				setTotalResults(Number(data?.total) || list.length)
			} catch (err) {
				setError(err?.response?.data?.message || t('ws.uinStatus.error.load'))
				setApplications([])
			} finally {
				setLoading(false)
			}
		},
		[activeTab, searchAppNo, searchUid, sortBy, sortOrder, statusFilter, user?.role, t]
	)

	useEffect(() => {
		loadApplications(1)
	}, [activeTab, statusFilter, sortBy, sortOrder])

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
		const q = searchKeyword.trim().toLowerCase()
		if (q) {
			rows = rows.filter(
				(app) =>
					String(app.application_no || '').toLowerCase().includes(q) ||
					String(app.uid || '').toLowerCase().includes(q) ||
					String(app.application_type || '').toLowerCase().includes(q) ||
					formatStatusText(app.status, app.application_type, t).toLowerCase().includes(q)
			)
		}
		return rows
	}, [applications, activeTab, serviceGroup, formFilter, searchKeyword, t])

	const handleSearch = (e) => {
		e.preventDefault()
		loadApplications(1)
	}

	const handleClearSearch = () => {
		setSearchAppNo('')
		setSearchUid('')
		setSearchKeyword('')
		setStatusFilter('all')
		setServiceGroup('all')
		setFormFilter('all')
		loadApplications(1, {
			application_no: '',
			uid: '',
			status_filter: 'all',
		})
	}

	const handleTabChange = (tab) => {
		setActiveTab(tab)
		setStatusFilter('all')
		setServiceGroup('all')
		setFormFilter('all')
		setSearchKeyword('')
		if (tab === TAB_TENANCY && sortBy === 'form') {
			setSortBy('created_at')
			setSortOrder('desc')
		}
		setPage(1)
	}

	const handleStatusFilter = (key) => {
		setStatusFilter(key)
		setPage(1)
	}

	const handleServiceGroupChange = (key) => {
		setServiceGroup(key)
		setFormFilter('all')
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
			setError(err?.response?.data?.message || t('ws.uinStatus.error.ack'))
		}
	}

	const confirmWithdraw = async () => {
		if (!withdrawApp) return
		setWithdrawing(true)
		try {
			const type = getWithdrawType(withdrawApp)
			await api.post(`/api/tenant-forms/${type}/${withdrawApp.id}/withdraw`)
			showToast(t('ws.withdraw.success'), 'success')
			setWithdrawApp(null)
			await loadApplications(page)
		} catch (err) {
			showToast(err?.response?.data?.message || t('ws.withdraw.error'), 'error')
		} finally {
			setWithdrawing(false)
		}
	}

	const isTenancyTab = activeTab === TAB_TENANCY
	const statusFilters = isTenancyTab ? tenancyStatusFilters : serviceStatusFilters

	return (
		<div className="ws-page ws-status-page">
			<header className="ws-status-page-head">
				<h1 className="ws-status-title">{t('ws.uinStatus.title')}</h1>
				<p className="ws-status-lead">{t('ws.uinStatus.lead')}</p>
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
				<div className="ws-status-tabs" role="tablist" aria-label={t('ws.uinStatus.tabs.aria')}>
					<button
						type="button"
						role="tab"
						className={`ws-status-tab ws-status-tab--tenancy${
							activeTab === TAB_TENANCY ? ' is-active' : ''
						}`}
						aria-selected={activeTab === TAB_TENANCY}
						onClick={() => handleTabChange(TAB_TENANCY)}
					>
						<span>{t('ws.uinStatus.tab.tenancy')}</span>

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
						<span>{t('ws.uinStatus.tab.service')}</span>

					</button>
				</div>

				<div className="ws-status-control-body">
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
						<>
							<div className="ws-status-filter-group">
								<span className="ws-status-filter-label">
									{t('ws.uinStatus.filter.service')}
								</span>
								<div
									className="ws-status-filter-chips"
									role="group"
									aria-label={t('ws.uinStatus.filter.serviceAria')}
								>
									{serviceGroups.map((sg) => (
										<button
											key={sg.key}
											type="button"
											className={`ws-status-filter-chip ws-status-filter-chip--service${
												serviceGroup === sg.key ? ' is-active' : ''
											}`}
											aria-pressed={serviceGroup === sg.key}
											onClick={() => handleServiceGroupChange(sg.key)}
										>
											{sg.label}
										</button>
									))}
								</div>
							</div>

							{serviceFormFilters.length > 1 ? (
								<div className="ws-status-filter-group">
									<span className="ws-status-filter-label">
										{t('ws.uinStatus.filter.form')}
									</span>
									<div
										className="ws-status-filter-chips"
										role="group"
										aria-label={t('ws.uinStatus.filter.formAria')}
									>
										{serviceFormFilters.map((ff) => (
											<button
												key={ff.key}
												type="button"
												className={`ws-status-filter-chip ws-status-filter-chip--form${
													formFilter === ff.key ? ' is-active' : ''
												}`}
												aria-pressed={formFilter === ff.key}
												onClick={() => setFormFilter(ff.key)}
											>
												{ff.label}
											</button>
										))}
									</div>
								</div>
							) : null}
						</>
					) : null}

					<form className="ws-status-toolbar ws-status-toolbar--inline" onSubmit={handleSearch}>
						<label className="ws-status-search">
							<span className="ws-status-search-label">{t('ws.uinStatus.search.appNo')}</span>
							<input
								type="search"
								value={searchAppNo}
								onChange={(e) => setSearchAppNo(e.target.value)}
								placeholder={t('ws.uinStatus.search.appNoPh')}
							/>
						</label>
						<label className="ws-status-search">
							<span className="ws-status-search-label">{t('ws.uinStatus.search.uin')}</span>
							<input
								type="search"
								value={searchUid}
								onChange={(e) => setSearchUid(e.target.value)}
								placeholder={t('ws.uinStatus.search.uinPh')}
							/>
						</label>
						<label className="ws-status-search">
							<span className="ws-status-search-label">
								{isTenancyTab
									? t('ws.uinStatus.search.findInList')
									: t('ws.uinStatus.search.formKeyword')}
							</span>
							<input
								type="search"
								value={searchKeyword}
								onChange={(e) => setSearchKeyword(e.target.value)}
								placeholder={
									isTenancyTab
										? t('ws.uinStatus.search.findPh')
										: t('ws.uinStatus.search.formPh')
								}
							/>
						</label>
						<label className="ws-status-section-sort">
							<span className="ws-status-search-label">{t('ws.uinStatus.sort.label')}</span>
							<select
								value={`${sortBy}:${sortOrder}`}
								onChange={(e) => {
									const [col, ord] = e.target.value.split(':')
									setSortBy(col)
									setSortOrder(ord)
								}}
							>
								{isTenancyTab ? (
									<>
										<option value="created_at:desc">{t('ws.uinStatus.sort.dateNewest')}</option>
										<option value="created_at:asc">{t('ws.uinStatus.sort.dateOldest')}</option>
										<option value="application_no:asc">{t('ws.uinStatus.sort.appAsc')}</option>
										<option value="application_no:desc">{t('ws.uinStatus.sort.appDesc')}</option>
										<option value="uid:asc">{t('ws.uinStatus.sort.uinAsc')}</option>
										<option value="status:asc">{t('ws.uinStatus.sort.statusAsc')}</option>
									</>
								) : (
									<>
										<option value="created_at:desc">{t('ws.uinStatus.sort.dateNewest')}</option>
										<option value="created_at:asc">{t('ws.uinStatus.sort.dateOldest')}</option>
										<option value="application_no:asc">{t('ws.uinStatus.sort.appAsc')}</option>
										<option value="form:asc">{t('ws.uinStatus.sort.formAsc')}</option>
										<option value="status:asc">{t('ws.uinStatus.sort.statusAsc')}</option>
									</>
								)}
							</select>
						</label>
						<div className="ws-status-toolbar-actions">
							<button type="submit" className="ws-btn ws-btn--primary" disabled={loading}>
								{t('ws.uinStatus.search')}
							</button>
							<button
								type="button"
								className="ws-btn ws-btn--outline"
								onClick={handleClearSearch}
								disabled={loading}
							>
								{t('ws.uinStatus.clear')}
							</button>
						</div>
					</form>

					<div className="ws-status-results">
						<div className="ws-status-results-head">
							<span className="ws-status-results-label">
								{isTenancyTab ? t('ws.uinStatus.results') : t('ws.uinStatus.serviceResults')}
							</span>
							<span className="ws-status-panel-count">
								{loading
									? '…'
									: t('ws.uinStatus.matching', {
											shown: displayedItems.length,
											total: totalResults,
										})}
							</span>
						</div>
						{loading ? (
							<div className="ws-empty ws-empty--compact">{t('ws.uinStatus.loading')}</div>
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
						onClick={() => loadApplications(page - 1)}
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
						onClick={() => loadApplications(page + 1)}
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

export default WorkspaceUinStatus
