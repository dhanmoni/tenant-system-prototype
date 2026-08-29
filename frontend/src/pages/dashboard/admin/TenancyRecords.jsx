import { useNavigate } from 'react-router-dom'
import api from '../../../api'
import DataTable from '../../../components/dashboard/DataTable'
import { Icon } from '../../../components/dashboard/Icons'
import { useEffect, useState, useMemo } from 'react'
import { useDistricts } from '../../../hooks/useDistricts'
import { useTenancyRecords } from '../../../hooks/useTenancyRecords'
import { formatDate } from '../../../utils/formatters'
import { APPLICATION_TYPES } from '../../../constants/application'
import { ROLES, TENANCY_STAFF_ROLES } from '../../../constants/roles'
import { STATUS } from '../../../constants/status'
import { adminStatusBadgeClass, adminStatusLabel } from '../../../utils/adminStatusBadge'
import { useLanguage } from '../../../i18n'
import './TenancyRecords.css'

function buildStatusPills(t) {
	return [
		{ value: '', label: t('ws.users.filter.all') },
		{ value: STATUS.APPROVED, label: t('ws.status.approved') },
		{ value: STATUS.REJECTED, label: t('ws.status.rejected') },
		{ value: STATUS.IN_REVIEW, label: t('ws.status.inReview') },
	]
}

function buildSortOptions(t) {
	return [
		{ key: 'created_at', label: t('ws.adminApps.col.date') },
		{ key: 'application_no', label: t('ws.adminApps.col.appNo') },
		{ key: 'uid', label: t('ws.adminTenancy.col.uin') },
		{ key: 'applicant', label: t('ws.adminApps.col.applicant') },
		{ key: 'district', label: t('ws.users.col.district') },
		{ key: 'status', label: t('ws.users.col.status') },
	]
}

const TenancyRecords = ({ user }) => {
	const { t } = useLanguage()
	const navigate = useNavigate()
	const [page, setPage] = useState(1)
	
	const shouldFetchDistricts = user?.role === ROLES.SUPER_ADMIN
	const { districts } = useDistricts(shouldFetchDistricts)
	
	const [filters, setFilters] = useState({
		search: '',
		status: '',
		district_id: '',
	})
	const [searchInput, setSearchInput] = useState('')
	const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' })
	const { data, isLoading: loading, isError, refetch } = useTenancyRecords({
		page,
		filters,
		enabled: TENANCY_STAFF_ROLES.includes(user?.role)
	})
	
	const records = data?.records || []
	const paginationInfo = data?.paginationInfo || null
	const error = isError ? t('ws.adminTenancy.error') : ''

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

	const statusPills = useMemo(() => buildStatusPills(t), [t])
	const sortOptions = useMemo(() => buildSortOptions(t), [t])

	const statusFilterLabel = filters.status
		? adminStatusLabel(filters.status, t)
		: t('ws.users.filter.all')

	const filterToolbar = (
		<div className="admin-tenancy-panel">
			<div className="admin-tenancy-panel__top">
				<label className="admin-tenancy-panel__search">
					<span className="admin-tenancy-panel__label">{t('ws.adminTenancy.search')}</span>
					<div className="admin-tenancy-panel__search-field">
						<Icon name="search" className="admin-tenancy-panel__search-icon" />
						<input
							id="tenancy-search"
							className="admin-tenancy-panel__input"
							type="search"
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							placeholder={t('ws.adminTenancy.searchPh')}
							autoComplete="off"
							spellCheck={false}
						/>
					</div>
				</label>
			</div>

			<div className="admin-tenancy-panel__filters">
				<div className="admin-tenancy-panel__status" role="group" aria-label={t('ws.adminTenancy.filter.statusAria')}>
					<span className="admin-tenancy-panel__label">{t('ws.users.filter.status')}</span>
					<div className="admin-tenancy-panel__status-pills">
						{statusPills.map((pill) => (
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
						<span className="admin-tenancy-panel__label">{t('ws.users.filter.district')}</span>
						<select
							id="tenancy-district"
							className="admin-tenancy-panel__select"
							value={filters.district_id}
							onChange={(e) => handleFilterChange('district_id', e.target.value)}
						>
							<option value="">{t('ws.users.filter.allDistricts')}</option>
							{districts.map((d) => (
								<option key={d.id} value={d.id}>
									{d.name}
								</option>
							))}
						</select>
					</label>
				) : null}

				<label className="admin-tenancy-panel__field">
						<span className="admin-tenancy-panel__label">{t('ws.users.sort.label')}</span>
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
						{sortOptions.map((opt) => (
							<option key={opt.key} value={opt.key}>
								{opt.label}
							</option>
						))}
					</select>
				</label>
			</div>

			<div className="admin-tenancy-panel__meta">
				<p className="admin-tenancy-panel__summary">
					{t(
						sortedRecords.length === 1
							? 'ws.adminTenancy.summaryOne'
							: 'ws.adminTenancy.summary',
						{ shown: sortedRecords.length },
					)}
					{filters.status ? (
						<>
							{' '}
							· {t('ws.adminApps.summaryStatus', { status: statusFilterLabel })}
						</>
					) : null}
					<span className="admin-tenancy-panel__note">
						{' '}
						· {t('ws.adminTenancy.note')}
					</span>
				</p>

				{hasActiveFilters ? (
					<button
						type="button"
						className="ws-btn ws-btn--outline ws-btn--sm admin-tenancy-panel__clear"
						onClick={clearFilters}
					>
						{t('ws.users.clearFilters')}
					</button>
				) : null}
			</div>
		</div>
	)

	return (
		<>
			{error ? (
				<div className="ws-profile-alert ws-profile-alert--error" role="alert">
					<span>{error}</span>
					<button
						type="button"
						className="ws-btn ws-btn--outline ws-btn--sm"
						onClick={() => refetch()}
					>
						{t('ws.adminTenancy.retry')}
					</button>
				</div>
			) : null}

			<DataTable
				title={t('ws.adminTenancy.tableTitle')}
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
						label: t('ws.adminApps.col.appNo'),
						mono: true,
						sortable: true,
					},
					{
						key: 'uid',
						label: t('ws.adminTenancy.col.uin'),
						mono: true,
						sortable: true,
						render: (val) => val || '—',
					},
					{
						key: 'applicant',
						label: t('ws.adminApps.col.applicant'),
						sortable: true,
						render: (_, row) => row.landlord_name || row.tenant_name || '—',
					},
					{
						key: 'district',
						label: t('ws.users.col.district'),
						sortable: true,
						render: (val) => val?.name || '—',
					},
					{
						key: 'status',
						label: t('ws.users.col.status'),
						sortable: true,
						render: (val) => (
							<span className={adminStatusBadgeClass(val)}>
								{adminStatusLabel(val, t)}
							</span>
						),
					},
					{
						key: 'created_at',
						label: t('ws.adminApps.col.date'),
						sortable: true,
						render: (val) => formatDate(val),
					},
				]}
				actions={(record) => (
					<button
						type="button"
						className="ws-status-action-btn ws-status-action-btn--view"
						title={t('ws.adminApps.viewTitle')}
						aria-label={t('ws.adminApps.viewAria', {
							appNo: record.application_no || t('ws.adminTenancy.col.uin'),
						})}
						onClick={(e) => {
							e.preventDefault()
							e.stopPropagation()
							openDetails(record)
						}}
					>
						<Icon name="eye" />
						<span>{t('ws.users.action.view')}</span>
					</button>
				)}
				emptyMessage={t('ws.adminTenancy.empty')}
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
