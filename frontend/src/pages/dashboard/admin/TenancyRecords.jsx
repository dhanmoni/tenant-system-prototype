import { useNavigate } from 'react-router-dom'
import api from '../../../api'
import DataTable from '../../../components/dashboard/DataTable'
import { Icon } from '../../../components/dashboard/Icons'
import { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import { useDistricts } from '../../../hooks/useDistricts'
import { formatDate } from '../../../utils/formatters'
import { APPLICATION_TYPES } from '../../../constants/application'
import { ADMIN_ROLES, ROLES } from '../../../constants/roles'
import { STATUS, STATUS_LABELS } from '../../../constants/status'
import { adminStatusBadgeClass, adminStatusLabel } from '../../../utils/adminStatusBadge'
import './TenancyRecords.css'

const STATUS_PILLS = [
	{ value: '', label: 'All' },
	{ value: STATUS.APPROVED, label: 'Approved' },
	{ value: STATUS.REJECTED, label: 'Rejected' },
	{ value: STATUS.IN_REVIEW, label: 'In review' },
]

const SORT_OPTIONS = [
	{ key: 'created_at', label: 'Date' },
	{ key: 'application_no', label: 'Application no.' },
	{ key: 'uid', label: 'UIN' },
	{ key: 'applicant', label: 'Applicant' },
	{ key: 'district', label: 'District' },
	{ key: 'status', label: 'Status' },
]

const TenancyRecords = ({ user }) => {
	const navigate = useNavigate()
	const [records, setRecords] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [page, setPage] = useState(1)
	const [paginationInfo, setPaginationInfo] = useState(null)
	
	const shouldFetchDistricts = user?.role === ROLES.SUPER_ADMIN
	const { districts } = useDistricts(shouldFetchDistricts)
	
	const [filters, setFilters] = useState({
		search: '',
		status: '',
		district_id: '',
	})
	const [searchInput, setSearchInput] = useState('')
	const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' })
	const recordsRefHasData = useRef(false)

	useEffect(() => {
		if (![...ADMIN_ROLES, ROLES.RENT_AUTHORITY, ROLES.RA_ASSISTANT].includes(user?.role)) {
			navigate('/dashboard')
		}
	}, [user?.role, navigate])



	const fetchRecords = useCallback(async () => {
		setLoading((prev) => (recordsRefHasData.current ? prev : true))
		setError('')
		try {
			const params = { page, per_page: 15 }
			if (filters.search) params.search = filters.search
			if (filters.status) params.status = filters.status
			if (filters.district_id) params.district_id = filters.district_id

			const { data } = await api.get('/api/admin/tenancy-records', { params })
			// Tenancy / UIN page — never show service form applications
			const uinOnly = (data.records || [])
				.map((row) => ({
					...row,
					form_type: row.form_type || APPLICATION_TYPES.TENANCY_CERTIFICATE,
				}))
				.filter((row) => row.form_type === APPLICATION_TYPES.TENANCY_CERTIFICATE)
			setRecords(uinOnly)
			recordsRefHasData.current = true
			setPaginationInfo(data.pagination || null)
		} catch {
			setError('Failed to load tenancy applications')
		} finally {
			setLoading(false)
		}
	}, [page, filters])

	useEffect(() => {
		if ([...ADMIN_ROLES, ROLES.RENT_AUTHORITY, ROLES.RA_ASSISTANT].includes(user?.role)) {
			fetchRecords()
		}
	}, [fetchRecords, user?.role])

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
		setFilters({ search: '', status: '', district_id: '' })
		setPage(1)
	}

	const hasActiveFilters = Boolean(filters.search || filters.status || filters.district_id)

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

	const sortedRecords = useMemo(() => {
		const { key, direction } = sortConfig
		const dir = direction === 'desc' ? -1 : 1
		const list = [...records]

		const getValue = (row) => {
			switch (key) {
				case 'district':
					return row?.district?.name || ''
				case 'applicant':
					return row?.landlord_name || row?.tenant_name || ''
				case 'uid':
					return row?.uid || ''
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
					{ sensitivity: 'base' },
				)
			}
			return cmp * dir
		})

		return list
	}, [records, sortConfig])

	const openDetails = (record) => {
		navigate(`/dashboard/admin/tenancy/${encodeURIComponent(record.application_no)}`, {
			state: { from: 'tenancy' },
		})
	}

	const statusFilterLabel = filters.status
		? STATUS_LABELS[filters.status] || filters.status
		: 'All'

	const filterToolbar = (
		<div className="admin-tenancy-panel">
			<div className="admin-tenancy-panel__top">
				<label className="admin-tenancy-panel__search">
					<span className="admin-tenancy-panel__label">Search UIN applications</span>
					<div className="admin-tenancy-panel__search-field">
						<Icon name="search" className="admin-tenancy-panel__search-icon" />
						<input
							id="tenancy-search"
							className="admin-tenancy-panel__input"
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

			<div className="admin-tenancy-panel__filters">
				<div className="admin-tenancy-panel__status" role="group" aria-label="Filter by status">
					<span className="admin-tenancy-panel__label">Status</span>
					<div className="admin-tenancy-panel__status-pills">
						{STATUS_PILLS.map((pill) => (
							<button
								key={pill.value || 'all'}
								type="button"
								className={`ws-admin-tenancy-pill${
									filters.status === pill.value ? ' is-active' : ''
								}${pill.value === STATUS.APPROVED ? ' ws-admin-tenancy-pill--ok' : ''}${
									pill.value === STATUS.REJECTED ? ' ws-admin-tenancy-pill--bad' : ''
								}${pill.value === STATUS.IN_REVIEW ? ' ws-admin-tenancy-pill--review' : ''}`}
								onClick={() => handleFilterChange('status', pill.value)}
							>
								{pill.label}
							</button>
						))}
					</div>
				</div>

				{user?.role === ROLES.SUPER_ADMIN ? (
					<label className="admin-tenancy-panel__field">
						<span className="admin-tenancy-panel__label">District</span>
						<select
							id="tenancy-district"
							className="admin-tenancy-panel__select"
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

				<label className="admin-tenancy-panel__field">
					<span className="admin-tenancy-panel__label">Sort by</span>
					<select
						id="tenancy-sort-by"
						className="admin-tenancy-panel__select"
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

			<div className="admin-tenancy-panel__meta">
				<p className="admin-tenancy-panel__summary">
					Showing <strong>{sortedRecords.length}</strong> UIN application
					{sortedRecords.length === 1 ? '' : 's'}
					{filters.status ? (
						<>
							{' '}
							· Status: <strong>{statusFilterLabel}</strong>
						</>
					) : null}
					<span className="admin-tenancy-panel__note"> · Service forms are listed separately</span>
				</p>

				{hasActiveFilters ? (
					<button
						type="button"
						className="ws-btn ws-btn--outline ws-btn--sm admin-tenancy-panel__clear"
						onClick={clearFilters}
					>
						Clear filters
					</button>
				) : null}
			</div>
		</div>
	)

	return (
		<>
			{error ? (
				<div className="ws-profile-alert ws-profile-alert--error" role="alert">
					{error}
				</div>
			) : null}

			<DataTable
				title="Tenancy applications (UIN)"
				accent="uin"
				loading={loading}
				data={sortedRecords}
				totalCount={paginationInfo?.total}
				toolbar={filterToolbar}
				className="admin-tenancy-table"
				onRowClick={openDetails}
				onSort={handleSort}
				sortKey={sortConfig.key}
				sortDirection={sortConfig.direction}
				columns={[
					{
						key: 'application_no',
						label: 'Application no.',
						mono: true,
						sortable: true,
					},
					{
						key: 'uid',
						label: 'UIN',
						mono: true,
						sortable: true,
						render: (val) => val || '—',
					},
					{
						key: 'applicant',
						label: 'Applicant',
						sortable: true,
						render: (_, row) => row.landlord_name || row.tenant_name || '—',
					},
					{
						key: 'district',
						label: 'District',
						sortable: true,
						render: (val) => val?.name || '—',
					},
					{
						key: 'status',
						label: 'Status',
						sortable: true,
						render: (val) => (
							<span className={adminStatusBadgeClass(val)}>
								{adminStatusLabel(val)}
							</span>
						),
					},
					{
						key: 'created_at',
						label: 'Date',
						sortable: true,
						render: (val) => formatDate(val),
					},
				]}
				actions={(record) => (
					<button
						type="button"
						className="ws-status-action-btn ws-status-action-btn--view"
						title="View details"
						aria-label={`View ${record.application_no || 'application'}`}
						onClick={(e) => {
							e.preventDefault()
							e.stopPropagation()
							openDetails(record)
						}}
					>
						<Icon name="eye" />
						<span>View</span>
					</button>
				)}
				emptyMessage="No UIN tenancy applications found."
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
		</>
	)
}

export default TenancyRecords
