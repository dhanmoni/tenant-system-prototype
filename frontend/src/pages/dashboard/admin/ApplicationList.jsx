import { useNavigate, useLocation } from 'react-router-dom'
import api from '../../../api'
import DataTable from '../../../components/dashboard/DataTable'
import { Icon } from '../../../components/dashboard/Icons'
import StatusProgressViewButton from '../../../components/dashboard/StatusProgressViewButton'
import { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import { useDistricts } from '../../../hooks/useDistricts'
import { ASSISTANT_ROLES, PRINCIPAL_ROLES, ROLES, ADMIN_ROLES } from '../../../constants/roles'
import { APPLICATION_LABELS, APPLICATION_TYPES, SERVICE_APPLICATION_TYPES } from '../../../constants/application'
import { STATUS, STATUS_LABELS } from '../../../constants/status'
import { formatDate } from '../../../utils/formatters'
import { getAdminTableAccent } from '../../../utils/adminTableAccent'
import { adminStatusBadgeClass, adminStatusLabel } from '../../../utils/adminStatusBadge'
import './ApplicationList.css'

const STATUS_PILLS = [
	{ value: '', label: 'All' },
	{ value: STATUS.SUBMITTED, label: 'Submitted' },
	{ value: STATUS.IN_REVIEW, label: 'In review' },
	{ value: STATUS.APPROVED, label: 'Approved' },
	{ value: STATUS.REJECTED, label: 'Rejected' },
]

const SORT_OPTIONS = [
	{ key: 'created_at', label: 'Date' },
	{ key: 'application_no', label: 'Application no.' },
	{ key: 'form_type', label: 'Type' },
	{ key: 'applicant', label: 'Applicant' },
	{ key: 'district', label: 'District' },
	{ key: 'status', label: 'Status' },
]

function getApplicantName(row) {
	switch (row.form_type) {
		case APPLICATION_TYPES.RENT_REVISION:
		case APPLICATION_TYPES.OTHER_CHARGES_REVISION:
			return row.signed_by === 'landlord' ? row.landlord_name : row.tenant_name
		case APPLICATION_TYPES.VALUER_APPOINTMENT:
		case APPLICATION_TYPES.RENT_COURT_POSSESSION:
		case APPLICATION_TYPES.RENT_COURT_FILING:
		case APPLICATION_TYPES.RENT_AUTHORITY_FILING:
			return row.applicant_name
		case APPLICATION_TYPES.RENT_COURT_APPEAL:
		case APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL:
			return row.appellant_name
		default:
			return row.user?.name || row.applicant_name || ''
	}
}

const ApplicationList = ({ user }) => {
	const navigate = useNavigate()
	const [applications, setApplications] = useState([])
	const [loading, setLoading] = useState(true)
	const [page, setPage] = useState(1)
	const [paginationInfo, setPaginationInfo] = useState(null)
	
	const shouldFetchDistricts = user?.role === ROLES.SUPER_ADMIN
	const { districts, loading: districtsLoading } = useDistricts(shouldFetchDistricts)
	
	const [filters, setFilters] = useState({
		search: '',
		status: '',
		form_type: '',
		district_id: '',
	})
	const [searchInput, setSearchInput] = useState('')
	const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' })
	const applicationsRefHasData = useRef(false)

	const location = useLocation()
	const isInboxPage = location.pathname.includes('/admin/inbox')

	const showFilters = ADMIN_ROLES.includes(user?.role) || (!isInboxPage && ASSISTANT_ROLES.includes(user?.role))
	const isQueueRole =
		isInboxPage && (
			ASSISTANT_ROLES.includes(user?.role) ||
			PRINCIPAL_ROLES.includes(user?.role) ||
			user?.role === ROLES.VALUER
		)



	const fetchApplications = useCallback(async () => {
		setLoading((prev) => (applicationsRefHasData.current ? prev : true))
		try {
			let endpoint = '/api/admin/applications/all'
			if (isInboxPage) {
				if (ASSISTANT_ROLES.includes(user?.role)) {
					endpoint = '/api/admin/applications/inbox'
				} else if (PRINCIPAL_ROLES.includes(user?.role)) {
					endpoint = '/api/admin/applications/principal-inbox'
				} else if (user?.role === ROLES.VALUER) {
					endpoint = '/api/admin/applications/valuer-inbox'
				}
			}

			const params = { page, per_page: 15 }
			if (showFilters) {
				if (filters.search) params.search = filters.search
				if (filters.status) params.status = filters.status
				if (filters.form_type) params.form_type = filters.form_type
				if (filters.district_id) params.district_id = filters.district_id
			}

			const { data } = await api.get(endpoint, { params })
			// Service applications page — never show UIN / tenancy certificate rows
			const serviceOnly = (data.applications || []).filter((row) =>
				SERVICE_APPLICATION_TYPES.includes(row?.form_type)
			)
			setApplications(serviceOnly)
			applicationsRefHasData.current = true
			setPaginationInfo(data.pagination || null)
		} catch (error) {
			console.error('Error fetching applications:', error)
		} finally {
			setLoading(false)
		}
	}, [user?.role, page, filters, showFilters, isInboxPage])

	useEffect(() => {
		fetchApplications()
	}, [fetchApplications])

	useEffect(() => {
		const timer = setTimeout(() => {
			const trimmed = searchInput.trim()
			setFilters((prev) => {
				if (prev.search === trimmed) return prev
				setPage(1)
				return { ...prev, search: trimmed }
			})
		}, 350)
		return () => clearTimeout(timer)
	}, [searchInput])

	const handleFilterChange = (key, value) => {
		setFilters((prev) => ({ ...prev, [key]: value }))
		setPage(1)
	}

	const clearFilters = () => {
		setSearchInput('')
		setFilters({ search: '', status: '', form_type: '', district_id: '' })
		setPage(1)
	}

	const hasActiveFilters = Boolean(
		filters.search || filters.status || filters.form_type || filters.district_id
	)

	const handleSort = (key) => {
		setSortConfig((prev) => {
			if (prev.key === key) {
				return {
					key,
					direction: prev.direction === 'asc' ? 'desc' : 'asc',
				}
			}
			return {
				key,
				direction: key === 'created_at' ? 'desc' : 'asc',
			}
		})
	}

	const sortedApplications = useMemo(() => {
		const { key, direction } = sortConfig
		const dir = direction === 'desc' ? -1 : 1
		const list = [...applications]

		const getValue = (row) => {
			switch (key) {
				case 'district':
					return row?.district?.name || ''
				case 'applicant':
					return getApplicantName(row) || ''
				case 'form_type':
					return APPLICATION_LABELS[row?.form_type] || row?.form_type || ''
				case 'created_at':
					return row?.created_at ? new Date(row.created_at).getTime() : 0
				default:
					return row?.[key] ?? ''
			}
		}

		list.sort((a, b) => {
			const av = getValue(a)
			const bv = getValue(b)
			let cmp = 0
			if (typeof av === 'number' && typeof bv === 'number') {
				cmp = av - bv
			} else {
				cmp = String(av).localeCompare(String(bv), undefined, {
					numeric: true,
					sensitivity: 'base',
				})
			}
			if (cmp === 0) {
				cmp = String(a?.application_no || '').localeCompare(
					String(b?.application_no || ''),
					undefined,
					{ sensitivity: 'base' }
				)
			}
			return cmp * dir
		})

		return list
	}, [applications, sortConfig])

	const openDetails = (app) => {
		navigate(`/dashboard/admin/applications/${app.application_no}`)
	}

	const tableTitle = (() => {
		if (isInboxPage && user?.role === ROLES.VALUER) return 'Valuation inbox'
		if (isInboxPage && ASSISTANT_ROLES.includes(user?.role)) return 'Service Applications'
		if (isInboxPage && PRINCIPAL_ROLES.includes(user?.role)) return 'Applications in review'
		if (user?.role === ROLES.SUPER_ADMIN) return 'Service Applications'
		if (user?.role === ROLES.DISTRICT_ADMIN) return 'Service Applications'
		return 'Service Applications'
	})()

	const statusFilterLabel = filters.status
		? STATUS_LABELS[filters.status] || filters.status
		: 'All'

	const formTypeLabel = filters.form_type
		? APPLICATION_LABELS[filters.form_type] || filters.form_type
		: null

	const filterToolbar = showFilters ? (
		<div className="admin-service-panel">
			<div className="admin-service-panel__top">
				<label className="admin-service-panel__search">
					<span className="admin-service-panel__label">Search service applications</span>
					<div className="admin-service-panel__search-field">
						<Icon name="search" className="admin-service-panel__search-icon" />
						<input
							id="app-search"
							className="admin-service-panel__input"
							type="search"
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							placeholder="Application number, e.g. APP-…"
							autoComplete="off"
							spellCheck={false}
						/>
					</div>
				</label>
			</div>

			<div className="admin-service-panel__filters">
				<div className="admin-service-panel__status" role="group" aria-label="Filter by status">
					<span className="admin-service-panel__label">Status</span>
					<div className="admin-service-panel__status-pills">
						{STATUS_PILLS.map((pill) => (
							<button
								key={pill.value || 'all'}
								type="button"
								className={`ws-admin-service-pill${
									filters.status === pill.value ? ' is-active' : ''
								}${pill.value === STATUS.SUBMITTED ? ' ws-admin-service-pill--submitted' : ''}${
									pill.value === STATUS.IN_REVIEW ? ' ws-admin-service-pill--review' : ''
								}${pill.value === STATUS.APPROVED ? ' ws-admin-service-pill--ok' : ''}${
									pill.value === STATUS.REJECTED ? ' ws-admin-service-pill--bad' : ''
								}`}
								onClick={() => handleFilterChange('status', pill.value)}
							>
								{pill.label}
							</button>
						))}
					</div>
				</div>

				<label className="admin-service-panel__field">
					<span className="admin-service-panel__label">Form type</span>
					<select
						id="app-type"
						className="admin-service-panel__select"
						value={filters.form_type}
						onChange={(e) => handleFilterChange('form_type', e.target.value)}
					>
						<option value="">All types</option>
						{SERVICE_APPLICATION_TYPES.map((type) => (
							<option key={type} value={type}>
								{APPLICATION_LABELS[type] || type}
							</option>
						))}
					</select>
				</label>

				{user?.role === ROLES.SUPER_ADMIN ? (
					<label className="admin-service-panel__field">
						<span className="admin-service-panel__label">District</span>
						<select
							id="app-district"
							className="admin-service-panel__select"
							value={filters.district_id}
							onChange={(e) => handleFilterChange('district_id', e.target.value)}
						>
							<option value="">All districts</option>
							{districts.map((d) => (
								<option key={d.id} value={d.id}>
									{d.name}
								</option>
							))}
						</select>
					</label>
				) : null}

				<label className="admin-service-panel__field">
					<span className="admin-service-panel__label">Sort by</span>
					<select
						id="app-sort-by"
						className="admin-service-panel__select"
						value={sortConfig.key}
						onChange={(e) =>
							setSortConfig((prev) => ({
								...prev,
								key: e.target.value,
								direction: e.target.value === 'created_at' ? 'desc' : 'asc',
							}))
						}
					>
						{SORT_OPTIONS.map((opt) => (
							<option key={opt.key} value={opt.key}>
								{opt.label}
							</option>
						))}
					</select>
				</label>
			</div>

			<div className="admin-service-panel__meta">
				<p className="admin-service-panel__summary">
					Showing <strong>{sortedApplications.length}</strong> service application
					{sortedApplications.length === 1 ? '' : 's'}
					{filters.status ? (
						<>
							{' '}
							· Status: <strong>{statusFilterLabel}</strong>
						</>
					) : null}
					{formTypeLabel ? (
						<>
							{' '}
							· Type: <strong>{formTypeLabel}</strong>
						</>
					) : null}
					<span className="admin-service-panel__note">
						{' '}
						· UIN applications are listed separately
					</span>
				</p>

				{hasActiveFilters ? (
					<button
						type="button"
						className="ws-btn ws-btn--outline ws-btn--sm admin-service-panel__clear"
						onClick={clearFilters}
					>
						Clear filters
					</button>
				) : null}
			</div>
		</div>
	) : null

	const enableFifo = import.meta.env.VITE_ENABLE_FIFO === 'true';
	const queueNotice = (isQueueRole && enableFifo) ? (
		<div className="app-queue-notice">
			<Icon name="lock" className="app-queue-notice__icon" />
			<span>
				Applications are handled oldest-first. Open an application to review, then approve
				or reject from the view page.
			</span>
		</div>
	) : null

	return (
		<DataTable
			title={tableTitle}
			accent={getAdminTableAccent(user)}
			loading={loading}
			data={sortedApplications}
			totalCount={paginationInfo?.total}
			toolbar={filterToolbar || queueNotice}
			className="admin-service-table"
			onRowClick={openDetails}
			onSort={showFilters ? handleSort : undefined}
			sortKey={showFilters ? sortConfig.key : undefined}
			sortDirection={showFilters ? sortConfig.direction : undefined}
			columns={[
				{
					key: 'application_no',
					label: 'Application no.',
					mono: true,
					sortable: showFilters,
				},
				{
					key: 'form_type',
					label: 'Type',
					cellClassName: 'ws-status-cell-form',
					sortable: showFilters,
					render: (val) =>
						APPLICATION_LABELS[val] ||
						val?.replace(/-/g, ' ').toUpperCase() ||
						'—',
				},
				{
					key: 'applicant',
					label: 'Applicant',
					sortable: showFilters,
					render: (_, row) => getApplicantName(row) || '—',
				},
				{
					key: 'district',
					label: 'District',
					sortable: showFilters,
					render: (val) => val?.name || '—',
				},
				{
					key: 'status',
					label: 'Status',
					sortable: showFilters,
					render: (val) => (
						<span className={adminStatusBadgeClass(val)}>
							{adminStatusLabel(val)}
						</span>
					),
				},
				{
					key: 'created_at',
					label: 'Date',
					sortable: showFilters,
					render: (val) => formatDate(val),
				},
			]}
			actions={(app) => (
				<>
					<StatusProgressViewButton
						application={app}
						variant="admin"
						viewerRole={user?.role}
						title="View status progress"
					/>
					<button
						type="button"
						className="ws-status-action-btn ws-status-action-btn--view"
						title="View details"
						aria-label={`View ${app.application_no || 'application'}`}
						onClick={(e) => {
							e.preventDefault()
							e.stopPropagation()
							openDetails(app)
						}}
					>
						<Icon name="eye" />
						<span>View</span>
					</button>
				</>
			)}
			emptyMessage="No service applications found."
			pagination={
				paginationInfo
					? {
							currentPage: paginationInfo.current_page,
							totalPages: paginationInfo.last_page,
							onPageChange: (newPage) => setPage(newPage),
						}
					: null
			}
		/>
	)
}

export default ApplicationList
