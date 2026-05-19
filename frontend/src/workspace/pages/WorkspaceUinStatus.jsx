import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom'
import api from '../../api'
import { Icon } from '../../components/dashboard/Icons'
import { formatDate } from '../../utils/formatters'
import { STATUS, STATUS_LABELS } from '../../constants/status'
import { APPLICATION_TYPES } from '../../constants/application'
import { getAllServiceForms, tenantServiceGroups } from '../../data/tenantServices'

const GROUP_ACCENTS = {
	tenancy: 'uin',
	'rent-authority': 'rent-authority',
	'rent-court': 'rent-court',
	'rent-tribunal': 'rent-tribunal',
}

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
	if (groupId === 'tenancy') return isTenancyApp(app)
	const keys = getAllServiceForms()
		.filter((f) => f.groupId === groupId)
		.map((f) => f.formKey)
	if (app.form_key && keys.includes(app.form_key)) return true
	return keys.some((key) => appMatchesFormKey(app, key))
}

function buildCategories(applications) {
	const categories = []

	const tenancyItems = applications.filter(isTenancyApp)
	if (tenancyItems.length > 0) {
		categories.push({
			id: 'tenancy',
			title: 'Tenancy Certificate',
			groupId: 'tenancy',
			isTenancy: true,
			items: tenancyItems,
			formFilters: null,
		})
	}

	const serviceGroups = [
		{
			id: 'rent-authority',
			title: 'Rent Authority (Form I / I-A / I-B / IV)',
		},
		{
			id: 'rent-court',
			title: 'Rent Court (Form II / III / V)',
		},
		{
			id: 'rent-tribunal',
			title: 'Rent Tribunal (Form VI)',
		},
	]

	for (const sg of serviceGroups) {
		const items = applications.filter(
			(app) => !isTenancyApp(app) && appInServiceGroup(app, sg.id)
		)
		if (items.length === 0) continue

		const groupDef = tenantServiceGroups.find((g) => g.id === sg.id)
		const formFilters = [
			{ key: 'all', label: 'All forms' },
			...(groupDef?.forms.map((f) => ({
				key: f.formKey,
				label: f.formName,
			})) || []),
		]

		categories.push({
			id: sg.id,
			title: sg.title,
			groupId: sg.id,
			isTenancy: false,
			items,
			formFilters,
		})
	}

	return categories
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

function StatusCategorySection({
	category,
	copiedRefCode,
	onCopyRef,
	onOpenDetails,
	onDownloadAck,
	onJoin,
	canJoinApp,
}) {
	const [formFilter, setFormFilter] = useState('all')
	const [sortBy, setSortBy] = useState('created_at')
	const [sortOrder, setSortOrder] = useState('desc')
	const [localSearch, setLocalSearch] = useState('')

	const filteredItems = useMemo(() => {
		let rows = category.items
		if (category.formFilters && formFilter !== 'all') {
			rows = rows.filter((app) => appMatchesFormKey(app, formFilter))
		}
		const q = localSearch.trim().toLowerCase()
		if (q) {
			rows = rows.filter(
				(app) =>
					String(app.application_no || '').toLowerCase().includes(q) ||
					String(app.uid || '').toLowerCase().includes(q) ||
					String(app.application_type || '').toLowerCase().includes(q)
			)
		}
		return sortItems(rows, sortBy, sortOrder)
	}, [category.items, category.formFilters, formFilter, localSearch, sortBy, sortOrder])

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

	return (
		<section
			className={`ws-card ws-status-category ws-status-category--${
				GROUP_ACCENTS[category.groupId] || 'default'
			}`}
		>
			<div className="ws-card-header ws-status-category-header">
				<h2 className="ws-card-title">{category.title}</h2>
				<span className="ws-status-category-count">
					{filteredItems.length} of {category.items.length} shown
				</span>
			</div>

			<div className="ws-status-section-toolbar">
				{category.formFilters ? (
					<div
						className="ws-status-form-filters"
						role="tablist"
						aria-label={`Filter forms in ${category.title}`}
					>
						{category.formFilters.map((ff) => (
							<button
								key={ff.key}
								type="button"
								role="tab"
								className={`ws-status-form-filter${
									formFilter === ff.key ? ' is-active' : ''
								}`}
								aria-selected={formFilter === ff.key}
								onClick={() => setFormFilter(ff.key)}
							>
								{ff.label}
							</button>
						))}
					</div>
				) : null}

				<div className="ws-status-section-controls">
					<label className="ws-status-section-search">
						<span className="ws-status-search-label">Filter rows</span>
						<input
							type="search"
							value={localSearch}
							onChange={(e) => setLocalSearch(e.target.value)}
							placeholder="App no., UIN, or type…"
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
							<option value="created_at:desc">Date (newest)</option>
							<option value="created_at:asc">Date (oldest)</option>
							<option value="application_no:asc">Application no. (A–Z)</option>
							<option value="application_no:desc">Application no. (Z–A)</option>
							<option value="status:asc">Status (A–Z)</option>
							{!category.isTenancy ? (
								<option value="form:asc">Form type (A–Z)</option>
							) : null}
						</select>
					</label>
				</div>
			</div>

			<div className="ws-card-body ws-status-table-wrap">
				{filteredItems.length === 0 ? (
					<div className="ws-empty ws-empty--compact">No matching records in this section.</div>
				) : (
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
								{!category.isTenancy ? <th>Form</th> : null}
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
								{category.isTenancy ? <th>Completion</th> : null}
								<th className="ws-status-th-actions">Actions</th>
							</tr>
						</thead>
						<tbody>
							{filteredItems.map((app) => (
								<tr
									key={app.row_key || app.id}
									className="ws-status-row"
									onClick={() => onOpenDetails(app)}
								>
									<td className="ws-status-cell-mono">{app.application_no}</td>
									<td
										className="ws-status-cell-uin"
										onClick={(e) => e.stopPropagation()}
									>
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
															? 'Copied!'
															: 'Copy UIN'
													}
													aria-label={
														copiedRefCode === `uid:${app.uid}`
															? 'UIN copied to clipboard'
															: `Copy UIN ${app.uid}`
													}
													onClick={() => onCopyRef(app.uid, `uid:${app.uid}`)}
												>
													<Icon
														name={
															copiedRefCode === `uid:${app.uid}` ? 'check' : 'copy'
														}
													/>
												</button>
											</span>
										) : (
											'—'
										)}
									</td>
									{!category.isTenancy ? (
										<td className="ws-status-cell-form">
											{app.application_type || '—'}
										</td>
									) : null}
									<td>{formatDate(app.created_at)}</td>
									<td>
										<span className={statusBadgeClass(app.status)}>
											{formatStatusText(app.status, app.application_type)}
										</span>
									</td>
									{category.isTenancy ? (
										<td>
											{app.initiator_completed && app.second_party_completed ? (
												<span className="ws-badge ws-badge--success">
													Both completed
												</span>
											) : (
												<span className="ws-badge ws-badge--warning">
													Awaiting {getAwaitingPartyLabel(app.initiator_role)}
												</span>
											)}
										</td>
									) : null}
									<td
										className="ws-status-actions"
										onClick={(e) => e.stopPropagation()}
									>
										{app.status === STATUS.DRAFT && category.isTenancy ? (
											<button
												type="button"
												className="ws-status-action-btn ws-status-action-btn--primary"
												title="Resume draft application"
												onClick={() =>
													navigate(
														`/dashboard/tenancy-certificate?draft=${app.application_no}`
													)
												}
											>
												<Icon name="documentPlus" />
												<span>Resume</span>
											</button>
										) : (
											<button
												type="button"
												className="ws-status-action-btn"
												title="View details"
												onClick={() => onOpenDetails(app)}
											>
												<Icon name="eye" />
												<span>View</span>
											</button>
										)}
										{category.isTenancy ? (
											<button
												type="button"
												className="ws-status-action-btn"
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
													className="ws-status-action-btn ws-status-action-btn--primary"
													title="Join application"
													onClick={() => onJoin(app.ref_code)}
												>
													<Icon name="check" />
													<span>Join</span>
												</button>
											) : (
												<button
													type="button"
													className="ws-status-action-btn"
													title={
														copiedRefCode === app.ref_code
															? 'Copied!'
															: 'Copy invite link'
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
														{copiedRefCode === app.ref_code ? 'Copied' : 'Invite'}
													</span>
												</button>
											)
										) : null}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</section>
	)
}

function WorkspaceUinStatus() {
	const { user } = useOutletContext()
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	const [applications, setApplications] = useState([])
	const [loading, setLoading] = useState(false)
	const [page, setPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)
	const [error, setError] = useState('')
	const [copiedRefCode, setCopiedRefCode] = useState('')

	const [searchAppNo, setSearchAppNo] = useState(searchParams.get('app_no') || '')
	const [searchUid, setSearchUid] = useState('')
	const [sortBy, setSortBy] = useState('created_at')
	const [sortOrder, setSortOrder] = useState('desc')

	useEffect(() => {
		loadApplications(1)
	}, [sortBy, sortOrder])

	const loadApplications = async (pageNum = 1, overrides = {}) => {
		setLoading(true)
		setError('')
		try {
			const params = {
				page: pageNum,
				application_no:
					overrides.application_no !== undefined
						? overrides.application_no
						: searchAppNo || undefined,
				uid: overrides.uid !== undefined ? overrides.uid : searchUid || undefined,
				sort_by: overrides.sort_by || sortBy,
				sort_order: overrides.sort_order || sortOrder,
			}
			const endpoint =
				user?.role === 'user' ? '/api/tenant-forms/my' : '/api/tenancy-applications/my'
			const { data } = await api.get(endpoint, { params })
			const list = Array.isArray(data) ? data : data?.data ?? []
			setApplications(list)
			setPage(Number(data?.current_page) || 1)
			setTotalPages(Number(data?.last_page) || 1)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load applications')
			setApplications([])
		} finally {
			setLoading(false)
		}
	}

	const categories = useMemo(() => buildCategories(applications), [applications])

	const handleSearch = (e) => {
		e.preventDefault()
		loadApplications(1)
	}

	const handleClearSearch = () => {
		setSearchAppNo('')
		setSearchUid('')
		loadApplications(1, { application_no: '', uid: '' })
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

	return (
		<div className="ws-page ws-status-page">
			<nav className="ws-breadcrumb" aria-label="Breadcrumb">
				<Link to="/dashboard">Dashboard</Link>
				<span className="ws-breadcrumb-sep">/</span>
				<span>UIN status</span>
			</nav>

			<div className="ws-status-intro">
				<div className="ws-status-intro-icon" aria-hidden>
					<Icon name="status" />
				</div>
				<div className="ws-status-intro-body">
					<h1 className="ws-status-title">UIN &amp; application status</h1>
					<p className="ws-status-lead">
						Applications are grouped by service. Use the filters on each table to
						show a specific form, search rows, or change sort order.
					</p>
					<div className="ws-status-meta">
						<span className="ws-status-meta-pill">
							{loading ? '…' : applications.length} on this page
						</span>
						<span className="ws-status-meta-pill">
							Page {page} of {totalPages}
						</span>
					</div>
				</div>
			</div>

			{error ? (
				<div className="ws-profile-alert ws-profile-alert--error" role="alert">
					{error}
				</div>
			) : null}

			<form className="ws-status-toolbar" onSubmit={handleSearch}>
				<label className="ws-status-search">
					<span className="ws-status-search-label">Application no.</span>
					<input
						type="search"
						value={searchAppNo}
						onChange={(e) => setSearchAppNo(e.target.value)}
						placeholder="e.g. APP-TC-202603-000001"
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
				<label className="ws-status-section-sort">
					<span className="ws-status-search-label">Page sort</span>
					<select
						value={`${sortBy}:${sortOrder}`}
						onChange={(e) => {
							const [col, ord] = e.target.value.split(':')
							setSortBy(col)
							setSortOrder(ord)
						}}
					>
						<option value="created_at:desc">Date (newest)</option>
						<option value="created_at:asc">Date (oldest)</option>
						<option value="application_no:asc">Application no. (A–Z)</option>
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
						Clear
					</button>
				</div>
			</form>

			{loading ? (
				<div className="ws-empty">Loading applications…</div>
			) : applications.length === 0 ? (
				<div className="ws-card">
					<div className="ws-empty">No applications found.</div>
				</div>
			) : (
				categories.map((cat) => (
					<StatusCategorySection
						key={cat.id}
						category={cat}
						copiedRefCode={copiedRefCode}
						onCopyRef={copyToClipboard}
						onOpenDetails={openDetails}
						onDownloadAck={downloadAcknowledgement}
						onJoin={(ref) => navigate(`/join?ref=${ref}`)}
						canJoinApp={canJoin}
					/>
				))
			)}

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
