import { useNavigate, useLocation } from 'react-router-dom'
import api from '../../../api'
import DataTable from '../../../components/dashboard/DataTable'
import { Icon } from '../../../components/dashboard/Icons'
import StatusProgressViewButton from '../../../components/dashboard/StatusProgressViewButton'
import { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import { useDistricts } from '../../../hooks/useDistricts'
import { ASSISTANT_ROLES, PRINCIPAL_ROLES, ROLES, ADMIN_ROLES } from '../../../constants/roles'
import { APPLICATION_TYPES, SERVICE_APPLICATION_TYPES, getApplicationLabel } from '../../../constants/application'
import { STATUS } from '../../../constants/status'
import { formatDate } from '../../../utils/formatters'
import { getAdminTableAccent } from '../../../utils/adminTableAccent'
import { adminStatusBadgeClass, adminStatusLabel } from '../../../utils/adminStatusBadge'
import { useLanguage } from '../../../i18n'
import './ApplicationList.css'

function buildStatusPills(t) {
	return [
		{ value: '', label: t('ws.users.filter.all') },
		{ value: STATUS.SUBMITTED, label: t('ws.status.submitted') },
		{ value: STATUS.IN_REVIEW, label: t('ws.status.inReview') },
		{ value: STATUS.APPROVED, label: t('ws.status.approved') },
		{ value: STATUS.REJECTED, label: t('ws.status.rejected') },
	]
}

function buildSortOptions(t) {
	return [
		{ key: 'created_at', label: t('ws.adminApps.col.date') },
		{ key: 'application_no', label: t('ws.adminApps.col.appNo') },
		{ key: 'form_type', label: t('ws.adminApps.col.type') },
		{ key: 'applicant', label: t('ws.adminApps.col.applicant') },
		{ key: 'district', label: t('ws.users.col.district') },
		{ key: 'status', label: t('ws.users.col.status') },
	]
}

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
	const { t } = useLanguage()
	const navigate = useNavigate()
	const [applications, setApplications] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [reloadKey, setReloadKey] = useState(0)
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
		setError('')
		try {
			let endpoint = '/api/admin/applications/all'
			if (user?.role === ROLES.VALUER) {
				endpoint = '/api/admin/applications/valuer-inbox'
			} else if (isInboxPage) {
				if (ASSISTANT_ROLES.includes(user?.role)) {
					endpoint = '/api/admin/applications/inbox'
				} else if (PRINCIPAL_ROLES.includes(user?.role)) {
					endpoint = '/api/admin/applications/principal-inbox'
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
		} catch {
			setError(t('ws.adminApps.error'))
		} finally {
			setLoading(false)
		}
	}, [user?.role, page, filters, showFilters, isInboxPage, reloadKey, t])

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
					return getApplicationLabel(row?.form_type, t) || row?.form_type || ''
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
	}, [applications, sortConfig, t])

	const openDetails = (app) => {
		if (!app?.application_no) return
		navigate(`/dashboard/admin/applications/${encodeURIComponent(app.application_no)}`, {
			state: { from: isInboxPage ? 'inbox' : 'applications' },
		})
	}

	const statusPills = useMemo(() => buildStatusPills(t), [t])
	const sortOptions = useMemo(() => buildSortOptions(t), [t])

	const tableTitle = (() => {
		if (isInboxPage && user?.role === ROLES.VALUER) return t('ws.adminApps.table.valuer')
		if (isInboxPage && PRINCIPAL_ROLES.includes(user?.role)) return t('ws.adminApps.table.review')
		return t('ws.adminApps.table.inbox')
	})()

	const statusFilterLabel = filters.status
		? adminStatusLabel(filters.status, t)
		: t('ws.users.filter.all')

	const formTypeLabel = filters.form_type
		? getApplicationLabel(filters.form_type, t)
		: null

	const filterToolbar = showFilters ? (
		<div className="admin-service-panel">
			<div className="admin-service-panel__top">
				<label className="admin-service-panel__search">
					<span className="admin-service-panel__label">{t('ws.adminApps.search')}</span>
					<div className="admin-service-panel__search-field">
						<Icon name="search" className="admin-service-panel__search-icon" />
						<input
							id="app-search"
							className="admin-service-panel__input"
							type="search"
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							placeholder={t('ws.adminApps.searchPh')}
							autoComplete="off"
							spellCheck={false}
						/>
					</div>
				</label>
			</div>

			<div className="admin-service-panel__filters">
				<div className="admin-service-panel__status" role="group" aria-label={t('ws.adminApps.filter.statusAria')}>
					<span className="admin-service-panel__label">{t('ws.users.filter.status')}</span>
					<div className="admin-service-panel__status-pills">
						{statusPills.map((pill) => (
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
					<span className="admin-service-panel__label">{t('ws.adminApps.filter.formType')}</span>
					<select
						id="app-type"
						className="admin-service-panel__select"
						value={filters.form_type}
						onChange={(e) => handleFilterChange('form_type', e.target.value)}
					>
						<option value="">{t('ws.adminApps.filter.allTypes')}</option>
						{SERVICE_APPLICATION_TYPES.map((type) => (
							<option key={type} value={type}>
								{getApplicationLabel(type, t)}
							</option>
						))}
					</select>
				</label>

				{user?.role === ROLES.SUPER_ADMIN ? (
					<label className="admin-service-panel__field">
						<span className="admin-service-panel__label">{t('ws.users.filter.district')}</span>
						<select
							id="app-district"
							className="admin-service-panel__select"
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

				<label className="admin-service-panel__field">
					<span className="admin-service-panel__label">{t('ws.users.sort.label')}</span>
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
						{sortOptions.map((opt) => (
							<option key={opt.key} value={opt.key}>
								{opt.label}
							</option>
						))}
					</select>
				</label>
			</div>

			<div className="admin-service-panel__meta">
				<p className="admin-service-panel__summary">
					{t(
						sortedApplications.length === 1
							? 'ws.adminApps.summaryOne'
							: 'ws.adminApps.summary',
						{ shown: sortedApplications.length },
					)}
					{filters.status ? (
						<>
							{' '}
							· {t('ws.adminApps.summaryStatus', { status: statusFilterLabel })}
						</>
					) : null}
					{formTypeLabel ? (
						<>
							{' '}
							· {t('ws.adminApps.summaryType', { type: formTypeLabel })}
						</>
					) : null}
					<span className="admin-service-panel__note">
						{' '}
						· {t('ws.adminApps.note')}
					</span>
				</p>

				{hasActiveFilters ? (
					<button
						type="button"
						className="ws-btn ws-btn--outline ws-btn--sm admin-service-panel__clear"
						onClick={clearFilters}
					>
						{t('ws.users.clearFilters')}
					</button>
				) : null}
			</div>
		</div>
	) : null

	const enableFifo = import.meta.env.VITE_ENABLE_FIFO === 'true';
	const queueNotice = (isQueueRole && enableFifo) ? (
		<div className="app-queue-notice">
			<Icon name="lock" className="app-queue-notice__icon" />
			<span>{t('ws.adminApps.queueNotice')}</span>
		</div>
	) : null

	return (
		<>
			{error ? (
				<div className="ws-profile-alert ws-profile-alert--error admin-service-error" role="alert">
					<span>{error}</span>
					<button
						type="button"
						className="ws-btn ws-btn--outline ws-btn--sm"
						onClick={() => setReloadKey((key) => key + 1)}
					>
						{t('ws.adminApps.retry')}
					</button>
				</div>
			) : null}

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
					label: t('ws.adminApps.col.appNo'),
					mono: true,
					sortable: showFilters,
				},
				{
					key: 'form_type',
					label: t('ws.adminApps.col.type'),
					cellClassName: 'ws-status-cell-form',
					sortable: showFilters,
					render: (val) => getApplicationLabel(val, t) || '—',
				},
				{
					key: 'applicant',
					label: t('ws.adminApps.col.applicant'),
					sortable: showFilters,
					render: (_, row) => getApplicantName(row) || '—',
				},
				{
					key: 'district',
					label: t('ws.users.col.district'),
					sortable: showFilters,
					render: (val) => val?.name || '—',
				},
				{
					key: 'status',
					label: t('ws.users.col.status'),
					sortable: showFilters,
					render: (val) => (
						<span className={adminStatusBadgeClass(val)}>
							{adminStatusLabel(val, t)}
						</span>
					),
				},
				{
					key: 'created_at',
					label: t('ws.adminApps.col.date'),
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
							title={t('ws.adminApps.progressTitle')}
						/>
						<button
							type="button"
							className="ws-status-action-btn ws-status-action-btn--view"
							title={t('ws.adminApps.viewTitle')}
							aria-label={t('ws.adminApps.viewAria', {
								appNo: app.application_no || t('ws.adminApps.col.applicant'),
							})}
							onClick={(e) => {
								e.preventDefault()
								e.stopPropagation()
								openDetails(app)
							}}
						>
							<Icon name="eye" />
							<span>{t('ws.users.action.view')}</span>
						</button>
					</>
				)}
				emptyMessage={t('ws.adminApps.empty')}
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

export default ApplicationList
