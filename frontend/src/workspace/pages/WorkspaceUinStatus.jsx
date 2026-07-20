import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import api from '../../api'
import { Icon } from '../../components/dashboard/Icons'
import StatusProgressViewButton from '../../components/dashboard/StatusProgressViewButton'
import { formatDate } from '../../utils/formatters'
import { STATUS, STATUS_LABELS } from '../../constants/status'
import { APPLICATION_TYPES } from '../../constants/application'
import { getAllServiceForms, tenantServiceGroups } from '../../data/tenantServices'

const TAB_TENANCY = 'tenancy'
const TAB_SERVICE = 'service'

const TENANCY_STATUS_FILTERS = [
	{ key: 'all', label: 'All' },
	{ key: 'draft', label: 'Draft' },
	{ key: 'partial', label: 'Awaiting party' },
	{ key: 'submitted', label: 'Submitted' },
	{ key: 'in_review', label: 'In review' },
	{ key: 'approved', label: 'Approved' },
	{ key: 'rejected', label: 'Rejected' },
]

const SERVICE_STATUS_FILTERS = [
	{ key: 'all', label: 'All' },
	{ key: 'pending', label: 'Pending' },
	{ key: 'submitted', label: 'Submitted' },
	{ key: 'in_review', label: 'In review' },
	{ key: 'approved', label: 'Approved' },
	{ key: 'rejected', label: 'Rejected' },
]

const SERVICE_GROUPS = [
	{ key: 'all', label: 'All services' },
	{ key: 'rent-authority', label: 'Rent Authority' },
	{ key: 'rent-court', label: 'Rent Court' },
	{ key: 'rent-tribunal', label: 'Rent Tribunal' },
]

function formatStatusText(status, applicationType = '') {
	const normalizedType = String(applicationType || '').toLowerCase()
	const normalizedStatus = String(status || '').trim().toUpperCase()

	if (normalizedStatus === STATUS.SUBMITTED) return STATUS_LABELS[STATUS.SUBMITTED]
	if (normalizedStatus === STATUS.IN_REVIEW) return STATUS_LABELS[STATUS.IN_REVIEW]
	if (normalizedStatus === STATUS.REJECTED) return STATUS_LABELS[STATUS.REJECTED]
	if (normalizedStatus === STATUS.DRAFT) return STATUS_LABELS[STATUS.DRAFT]
	if (normalizedStatus === STATUS.PARTIAL) return STATUS_LABELS[STATUS.PARTIAL]

	if (
		normalizedType.includes(APPLICATION_TYPES.TENANCY_CERTIFICATE) &&
		normalizedStatus === STATUS.UNDER_PROCESS
	) {
		return STATUS_LABELS[STATUS.SUBMITTED]
	}

	return STATUS_LABELS[normalizedStatus] || status || '—'
}

function statusBadgeClass(status) {
	const s = String(status || '').toUpperCase()
	if ([STATUS.APPROVED, STATUS.COMPLETED, STATUS.SUBMITTED].includes(s)) {
		return 'ws-badge ws-badge--success'
	}
	if ([STATUS.REJECTED].includes(s)) return 'ws-badge ws-badge--danger'
	if ([STATUS.PARTIAL, STATUS.PENDING, STATUS.DRAFT].includes(s)) return 'ws-badge ws-badge--warning'
	return 'ws-badge ws-badge--pending'
}

function getAwaitingPartyLabel(initiatorRole) {
	if (initiatorRole === 'LANDLORD') return 'Tenant'
	return 'Landlord'
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

function getServiceFormFilters(groupId) {
	if (groupId === 'all') {
		return [{ key: 'all', label: 'All forms' }]
	}
	const groupDef = tenantServiceGroups.find((g) => g.id === groupId)
	if (!groupDef) return [{ key: 'all', label: 'All forms' }]
	return [
		{ key: 'all', label: 'All forms' },
		...groupDef.forms.map((f) => ({ key: f.formKey, label: f.formName })),
	]
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
	canJoinApp,
	emptyMessage,
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
								Application no. <SortIndicator column="application_no" />
							</button>
						</th>
						<th>
							<button
								type="button"
								className="ws-status-th-sort"
								onClick={() => handleSortColumn('uid')}
							>
								Tenancy UIN <SortIndicator column="uid" />
							</button>
						</th>
						{!isTenancy ? <th>Form</th> : null}
						<th>
							<button
								type="button"
								className="ws-status-th-sort"
								onClick={() => handleSortColumn('created_at')}
							>
								Date <SortIndicator column="created_at" />
							</button>
						</th>
						<th>
							<button
								type="button"
								className="ws-status-th-sort"
								onClick={() => handleSortColumn('status')}
							>
								Status <SortIndicator column="status" />
							</button>
						</th>
						{isTenancy ? <th>Completion</th> : null}
						<th className="ws-status-th-actions">Actions</th>
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
													copiedRefCode === `uid:${app.uid}` ? 'Copied!' : 'Copy UIN'
												}
												aria-label={
													copiedRefCode === `uid:${app.uid}`
														? 'UIN copied to clipboard'
														: `Copy UIN ${app.uid}`
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
										{formatStatusText(app.status, app.application_type)}
									</span>
								</td>
								{isTenancy ? (
									<td>
										{String(app.status).toUpperCase() === 'DRAFT' ? (
											<span className="ws-text-muted">—</span>
										) : app.initiator_completed && app.second_party_completed ? (
											<span className="ws-badge ws-badge--success">Both completed</span>
										) : (
											<span className="ws-badge ws-badge--warning">
												Awaiting {getAwaitingPartyLabel(app.initiator_role)}
											</span>
										)}
									</td>
								) : null}
								<td className="ws-status-actions" onClick={(e) => e.stopPropagation()}>
									{isDraft ? (
										<button
											type="button"
											className="ws-status-action-btn ws-status-action-btn--resume"
											title="Resume draft application"
											onClick={(e) => {
												e.preventDefault()
												e.stopPropagation()
												onResumeDraft?.(app)
											}}
										>
											<Icon name="documentPlus" />
											<span>Resume</span>
										</button>
									) : (
										<>
											{!isTenancy ? (
												<StatusProgressViewButton
													application={app}
													variant="workspace"
													title="View status progress"
												/>
											) : null}
											<button
												type="button"
												className="ws-status-action-btn ws-status-action-btn--view"
												title="View details"
												onClick={() => onOpenDetails(app)}
											>
												<Icon name="eye" />
												<span>View</span>
											</button>
										</>
									)}
									{isTenancy && !isDraft ? (
										<button
											type="button"
											className="ws-status-action-btn ws-status-action-btn--receipt"
											title="Download acknowledgement"
											onClick={() => onDownloadAck(app.application_no)}
										>
											<Icon name="download" />
											<span>Receipt</span>
										</button>
									) : null}
									{app.status === 'PARTIAL' && app.ref_code ? (
										canJoinApp(app) ? (
											<button
												type="button"
												className="ws-status-action-btn ws-status-action-btn--join"
												title="Join application"
												onClick={() => onJoin(app.ref_code)}
											>
												<Icon name="check" />
												<span>Join</span>
											</button>
										) : (
											<button
												type="button"
												className="ws-status-action-btn ws-status-action-btn--invite"
												title={
													copiedRefCode === app.ref_code ? 'Copied!' : 'Copy invite link'
												}
												onClick={() =>
													onCopyRef(
														`${window.location.origin}/join?ref=${app.ref_code}`,
														app.ref_code
													)
												}
											>
												<Icon name="logout" />
												<span>{copiedRefCode === app.ref_code ? 'Copied' : 'Invite'}</span>
											</button>
										)
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

	const [applications, setApplications] = useState([])
	const [tabCounts, setTabCounts] = useState({ tenancy: 0, service: 0, all: 0 })
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
				if (data?.counts) {
					setTabCounts({
						tenancy: Number(data.counts.tenancy) || 0,
						service: Number(data.counts.service) || 0,
						all: Number(data.counts.all) || 0,
					})
				}
			} catch (err) {
				setError(err?.response?.data?.message || 'Failed to load applications')
				setApplications([])
			} finally {
				setLoading(false)
			}
		},
		[activeTab, searchAppNo, searchUid, sortBy, sortOrder, statusFilter, user?.role]
	)

	useEffect(() => {
		loadApplications(1)
	}, [activeTab, statusFilter, sortBy, sortOrder])

	const serviceFormFilters = useMemo(
		() => getServiceFormFilters(serviceGroup),
		[serviceGroup]
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
					formatStatusText(app.status, app.application_type).toLowerCase().includes(q)
			)
		}
		return rows
	}, [applications, activeTab, serviceGroup, formFilter, searchKeyword])

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
			setError(err?.response?.data?.message || 'Failed to open acknowledgement')
		}
	}

	const isTenancyTab = activeTab === TAB_TENANCY
	const statusFilters = isTenancyTab ? TENANCY_STATUS_FILTERS : SERVICE_STATUS_FILTERS

	return (
		<div className="ws-page ws-status-page">
			<header className="ws-status-page-head">
				<h1 className="ws-status-title">UIN &amp; application status</h1>
				<p className="ws-status-lead">
					Track tenancy and service applications — filter by status, search, and resume drafts.
				</p>
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
				<div className="ws-status-tabs" role="tablist" aria-label="Application type">
					<button
						type="button"
						role="tab"
						className={`ws-status-tab ws-status-tab--tenancy${
							activeTab === TAB_TENANCY ? ' is-active' : ''
						}`}
						aria-selected={activeTab === TAB_TENANCY}
						onClick={() => handleTabChange(TAB_TENANCY)}
					>
						<span>Tenancy certificates</span>
						<span className="ws-status-tab-count">{tabCounts.tenancy}</span>
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
						<span>Service applications</span>
						<span className="ws-status-tab-count">{tabCounts.service}</span>
					</button>
				</div>

				<div className="ws-status-control-body">
					<div className="ws-status-filter-group">
						<span className="ws-status-filter-label">Status</span>
						<div
							className="ws-status-filter-chips"
							role="group"
							aria-label="Filter by status"
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
								<span className="ws-status-filter-label">Service</span>
								<div
									className="ws-status-filter-chips"
									role="group"
									aria-label="Filter by service group"
								>
									{SERVICE_GROUPS.map((sg) => (
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
									<span className="ws-status-filter-label">Form</span>
									<div
										className="ws-status-filter-chips"
										role="group"
										aria-label="Filter by form type"
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
							<span className="ws-status-search-label">Application no.</span>
							<input
								type="search"
								value={searchAppNo}
								onChange={(e) => setSearchAppNo(e.target.value)}
								placeholder="e.g. APP-202607-000001"
							/>
						</label>
						<label className="ws-status-search">
							<span className="ws-status-search-label">Tenancy UIN</span>
							<input
								type="search"
								value={searchUid}
								onChange={(e) => setSearchUid(e.target.value)}
								placeholder="Search UIN"
							/>
						</label>
						<label className="ws-status-search">
							<span className="ws-status-search-label">
								{isTenancyTab ? 'Find in list' : 'Form or keyword'}
							</span>
							<input
								type="search"
								value={searchKeyword}
								onChange={(e) => setSearchKeyword(e.target.value)}
								placeholder={
									isTenancyTab
										? 'Status or keyword…'
										: 'Form name, status…'
								}
							/>
						</label>
						<label className="ws-status-section-sort">
							<span className="ws-status-search-label">Sort by</span>
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
										<option value="created_at:desc">Date (newest)</option>
										<option value="created_at:asc">Date (oldest)</option>
										<option value="application_no:asc">Application no. (A–Z)</option>
										<option value="application_no:desc">Application no. (Z–A)</option>
										<option value="uid:asc">UIN (A–Z)</option>
										<option value="status:asc">Status (A–Z)</option>
									</>
								) : (
									<>
										<option value="created_at:desc">Date (newest)</option>
										<option value="created_at:asc">Date (oldest)</option>
										<option value="application_no:asc">Application no. (A–Z)</option>
										<option value="form:asc">Form type (A–Z)</option>
										<option value="status:asc">Status (A–Z)</option>
									</>
								)}
							</select>
						</label>
						<div className="ws-status-toolbar-actions">
							<button type="submit" className="ws-btn ws-btn--primary" disabled={loading}>
								Search
							</button>
							<button
								type="button"
								className="ws-btn ws-btn--outline"
								onClick={handleClearSearch}
								disabled={loading}
							>
								Clear all
							</button>
						</div>
					</form>

					<div className="ws-status-results">
						<div className="ws-status-results-head">
							<span className="ws-status-results-label">
								{isTenancyTab ? 'Results' : 'Service results'}
							</span>
							<span className="ws-status-panel-count">
								{loading ? '…' : `${displayedItems.length} of ${totalResults} matching`}
							</span>
						</div>
						{loading ? (
							<div className="ws-empty ws-empty--compact">Loading applications…</div>
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
								canJoinApp={canJoin}
								emptyMessage={
									applications.length === 0
										? 'No applications found. Try adjusting your search or filters.'
										: 'No records match the current filters on this page.'
								}
							/>
						)}
					</div>
				</div>
			</div>

			{!loading && applications.length > 0 ? (
				<nav className="ws-status-pagination" aria-label="Application list pagination">
					<button
						type="button"
						className="ws-btn ws-btn--outline"
						onClick={() => loadApplications(page - 1)}
						disabled={page <= 1 || loading}
					>
						Previous
					</button>
					<span className="ws-status-pagination-info">
						Page {page} of {totalPages}
					</span>
					<button
						type="button"
						className="ws-btn ws-btn--outline"
						onClick={() => loadApplications(page + 1)}
						disabled={page >= totalPages || loading}
					>
						Next
					</button>
				</nav>
			) : null}
		</div>
	)
}

export default WorkspaceUinStatus
