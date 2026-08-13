import { useEffect, useState, useMemo } from 'react'
import { useDistricts } from '../../../hooks/useDistricts'
import { createPortal } from 'react-dom'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../../../api'
import DataTable from '../../../components/dashboard/DataTable'
import { Icon } from '../../../components/dashboard/Icons'
import WorkflowConfirmModal from '../../../components/dashboard/WorkflowConfirmModal'
import { ROLES, ASSISTANT_ROLES, PRINCIPAL_ROLES } from '../../../constants/roles'
import { getRoleLabel, getRoleBadgeClass } from '../../../constants/roleLabels'
import { useLanguage } from '../../../i18n'
import './UserManagement.css'

const STAFF_ROLE_OPTIONS = [
	ROLES.DISTRICT_ADMIN,
	...PRINCIPAL_ROLES,
	...ASSISTANT_ROLES,
	ROLES.VALUER,
]

function buildSortOptions(t) {
	return [
		{ key: 'name', label: t('ws.users.col.name') },
		{ key: 'email', label: t('ws.users.col.email') },
		{ key: 'phone', label: t('ws.users.col.phone') },
		{ key: 'role', label: t('ws.users.col.role') },
		{ key: 'district', label: t('ws.users.col.district') },
		{ key: 'is_blocked', label: t('ws.users.col.status') },
	]
}

function UserManagement({ user: currentUser }) {
	const { t } = useLanguage()
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const mode = searchParams.get('mode') || 'office'
	const [users, setUsers] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [showAddForm, setShowAddForm] = useState(false)
	const [formError, setFormError] = useState('')
	const [creating, setCreating] = useState(false)
	const [statusModal, setStatusModal] = useState(null)
	const [successModal, setSuccessModal] = useState(null)
	const [statusReason, setStatusReason] = useState('')
	const [statusLoading, setStatusLoading] = useState(false)
	
	const shouldFetchDistricts = currentUser?.role === ROLES.SUPER_ADMIN
	const { districts } = useDistricts(shouldFetchDistricts)
	
	const [filters, setFilters] = useState({ search: '', role: '', district_id: '', status: '' })
	const [searchInput, setSearchInput] = useState('')
	const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' })
	const [page, setPage] = useState(1)
	const PAGE_SIZE = 15
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		phone: '',
		role: '',
		district_id: currentUser?.district_id || '',
	})

	const closeAddForm = () => {
		if (creating) return
		setShowAddForm(false)
		setFormError('')
		setFormData({
			name: '',
			email: '',
			phone: '',
			role: '',
			district_id: currentUser?.district_id || '',
		})
	}

	useEffect(() => {
		if (!showAddForm) return undefined
		const onKey = (e) => {
			if (e.key === 'Escape') closeAddForm()
		}
		document.addEventListener('keydown', onKey)
		const prev = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.removeEventListener('keydown', onKey)
			document.body.style.overflow = prev
		}
	}, [showAddForm, creating])

	useEffect(() => {
		if (ASSISTANT_ROLES.includes(currentUser.role)) {
			navigate('/dashboard')
			return
		}
		loadUsers()
	}, [mode, currentUser.role, navigate])



	const loadUsers = async () => {
		setLoading(true)
		setError('')
		try {
			const { data } = await api.get('/api/users')
			setUsers(data.users || [])
		} catch {
			setError(t('ws.users.error.load'))
		} finally {
			setLoading(false)
		}
	}

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

	useEffect(() => {
		setPage(1)
	}, [mode])

	const handleFilterChange = (key, value) => {
		setFilters((prev) => ({ ...prev, [key]: value }))
		setPage(1)
	}

	const clearFilters = () => {
		setSearchInput('')
		setFilters({ search: '', role: '', district_id: '', status: '' })
		setPage(1)
	}

	const hasActiveFilters = Boolean(
		filters.search || filters.role || filters.district_id || filters.status
	)

	const baseUsers = useMemo(
		() => users.filter((u) => (mode === 'tenant' ? u.role === ROLES.USER : u.role !== ROLES.USER)),
		[users, mode]
	)

	const filteredUsers = useMemo(() => {
		let list = baseUsers
		if (filters.search) {
			const needle = filters.search.toLowerCase()
			list = list.filter(
				(u) =>
					u.name?.toLowerCase().includes(needle) ||
					u.email?.toLowerCase().includes(needle)
			)
		}
		if (filters.role) {
			list = list.filter((u) => u.role === filters.role)
		}
		if (filters.district_id) {
			list = list.filter((u) => String(u.district_id) === String(filters.district_id))
		}
		if (filters.status === 'active') {
			list = list.filter((u) => !u.is_blocked)
		} else if (filters.status === 'inactive') {
			list = list.filter((u) => Boolean(u.is_blocked))
		}
		return list
	}, [baseUsers, filters])

	const sortedUsers = useMemo(() => {
		const { key, direction } = sortConfig
		const dir = direction === 'desc' ? -1 : 1
		const list = [...filteredUsers]
		const roleRank = STAFF_ROLE_OPTIONS.reduce((acc, role, idx) => {
			acc[role] = idx + 1
			return acc
		}, { [ROLES.SUPER_ADMIN]: 0, [ROLES.USER]: 99 })
		const getValue = (user) => {
			switch (key) {
				case 'district':
					return user?.district?.name || ''
				case 'is_blocked':
					return user?.is_blocked ? 'inactive' : 'active'
				case 'role':
					return roleRank[user?.role] ?? 999
				default:
					return user?.[key] ?? ''
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

			// Stable tie-break arrangement.
			if (cmp === 0) {
				cmp = String(a?.name || '').localeCompare(String(b?.name || ''), undefined, {
					sensitivity: 'base',
				})
			}
			if (cmp === 0) {
				cmp = String(a?.email || '').localeCompare(String(b?.email || ''), undefined, {
					sensitivity: 'base',
				})
			}

			return cmp * dir
		})

		return list
	}, [filteredUsers, sortConfig])

	const totalPages = Math.max(1, Math.ceil(sortedUsers.length / PAGE_SIZE))

	useEffect(() => {
		if (page > totalPages) setPage(totalPages)
	}, [page, totalPages])

	const pagedUsers = useMemo(() => {
		const start = (page - 1) * PAGE_SIZE
		return sortedUsers.slice(start, start + PAGE_SIZE)
	}, [sortedUsers, page])

	const handleSort = (key) => {
		setPage(1)
		setSortConfig((prev) => {
			if (prev.key === key) {
				return {
					key,
					direction: prev.direction === 'asc' ? 'desc' : 'asc',
				}
			}
			return { key, direction: 'asc' }
		})
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		setFormError('')
		setError('')

		const payload = {
			name: formData.name.trim(),
			email: formData.email.trim(),
			phone: formData.phone.trim(),
			role: formData.role,
			district_id: formData.district_id || currentUser?.district_id || null,
		}

		if (!payload.name || !payload.email || !payload.phone || !payload.role) {
			setFormError(t('ws.users.create.required'))
			return
		}
		if (!/^\d{10}$/.test(payload.phone)) {
			setFormError(t('ws.users.create.phoneDigits'))
			return
		}
		if (currentUser.role === ROLES.SUPER_ADMIN && !payload.district_id) {
			setFormError(t('ws.users.create.districtRequired'))
			return
		}

		setCreating(true)
		try {
			await api.post('/api/users', payload)
			setShowAddForm(false)
			setFormError('')
			setFormData({
				name: '',
				email: '',
				phone: '',
				role: '',
				district_id: currentUser?.district_id || '',
			})
			setSuccessModal({
				title: t('ws.users.create.successTitle'),
				description: t('ws.users.create.successDesc', { name: payload.name }),
			})
			loadUsers()
		} catch (err) {
			const errors = err?.response?.data?.errors
			const fieldMsg = errors
				? Object.values(errors).flat().join(' ')
				: err?.response?.data?.message
			setFormError(fieldMsg || t('ws.users.create.fail'))
		} finally {
			setCreating(false)
		}
	}

	const openStatusModal = (targetUser) => {
		setStatusReason('')
		setStatusModal({ user: targetUser, deactivating: !targetUser.is_blocked })
	}

	const closeStatusModal = () => {
		setStatusModal(null)
		setStatusReason('')
	}

	const confirmToggleStatus = async () => {
		if (!statusModal) return
		const { user: targetUser, deactivating } = statusModal
		const reason = statusReason.trim()
		if (deactivating && !reason) return
		setStatusLoading(true)
		setError('')
		try {
			await api.post(
				`/api/users/${targetUser.id}/toggle-block`,
				deactivating ? { reason } : {}
			)
			closeStatusModal()
			setSuccessModal({
				title: deactivating
					? t('ws.users.toast.deactivatedTitle')
					: t('ws.users.toast.activatedTitle'),
				description: deactivating
					? reason
						? t('ws.users.toast.deactivatedDescReason', {
								name: targetUser.name,
								reason,
							})
						: t('ws.users.toast.deactivatedDesc', { name: targetUser.name })
					: t('ws.users.toast.activatedDesc', { name: targetUser.name }),
			})
			loadUsers()
		} catch (err) {
			setError(
				err.response?.data?.message ||
					(deactivating ? t('ws.users.error.deactivate') : t('ws.users.error.activate'))
			)
		} finally {
			setStatusLoading(false)
		}
	}

	const canToggleStatus = (u) => {
		if (u.id === currentUser.id) return false
		if (currentUser.role === ROLES.SUPER_ADMIN) return true
		if (u.role === ROLES.SUPER_ADMIN) return false
		return [ROLES.DISTRICT_ADMIN, ...PRINCIPAL_ROLES].includes(currentUser.role)
	}

	const getAllowedRoles = () => {
		if (currentUser.role === ROLES.SUPER_ADMIN) {
			return [ROLES.DISTRICT_ADMIN, ...PRINCIPAL_ROLES, ...ASSISTANT_ROLES]
		}
		if (currentUser.role === ROLES.DISTRICT_ADMIN) {
			return [...PRINCIPAL_ROLES, ...ASSISTANT_ROLES, ROLES.VALUER]
		}
		if (currentUser.role === ROLES.RENT_AUTHORITY) return [ROLES.RA_ASSISTANT, ROLES.VALUER]
		if (currentUser.role === ROLES.RENT_COURT) return [ROLES.RC_ASSISTANT]
		if (currentUser.role === ROLES.RENT_TRIBUNAL) return [ROLES.RT_ASSISTANT]
		return []
	}

	const canAddStaff = mode !== 'tenant' && getAllowedRoles().length > 0
	const sortOptions = useMemo(() => buildSortOptions(t), [t])
	const tableTitle =
		mode === 'tenant' ? t('ws.users.title.tenants') : t('ws.users.title.staff')
	const statusFilterLabel =
		filters.status === 'active'
			? t('ws.users.filter.active')
			: filters.status === 'inactive'
				? t('ws.users.filter.inactive')
				: t('ws.users.filter.all')

	const filterToolbar = (
		<div className="admin-user-panel">
			<div className="admin-user-panel__top">
				<label className="admin-user-panel__search">
					<span className="admin-user-panel__label">
						{mode === 'tenant' ? t('ws.users.search.users') : t('ws.users.search.staff')}
					</span>
					<div className="admin-user-panel__search-field">
						<Icon name="search" className="admin-user-panel__search-icon" />
						<input
							id="user-search"
							className="admin-user-panel__input"
							type="search"
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							placeholder={
								mode === 'tenant'
									? t('ws.users.search.usersPh')
									: t('ws.users.search.staffPh')
							}
							autoComplete="off"
						/>
					</div>
				</label>

				{canAddStaff ? (
					<button
						type="button"
						className="ws-btn ws-btn--primary ws-btn--sm admin-user-panel__add"
						onClick={() => {
							setFormError('')
							setFormData({
								name: '',
								email: '',
								phone: '',
								role: '',
								district_id: currentUser?.district_id || '',
							})
							setShowAddForm(true)
						}}
					>
						{t('ws.users.addStaff')}
					</button>
				) : null}
			</div>

			<div className="admin-user-panel__filters">
				<div className="admin-user-panel__status" role="group" aria-label={t('ws.users.filter.statusAria')}>
					<span className="admin-user-panel__label">{t('ws.users.filter.status')}</span>
					<div className="admin-user-panel__status-pills">
						<button
							type="button"
							className={`ws-admin-user-pill${!filters.status ? ' is-active' : ''}`}
							onClick={() => handleFilterChange('status', '')}
						>
							{t('ws.users.filter.all')}
						</button>
						<button
							type="button"
							className={`ws-admin-user-pill ws-admin-user-pill--active${
								filters.status === 'active' ? ' is-active' : ''
							}`}
							onClick={() => handleFilterChange('status', 'active')}
						>
							{t('ws.users.filter.active')}
						</button>
						<button
							type="button"
							className={`ws-admin-user-pill ws-admin-user-pill--inactive${
								filters.status === 'inactive' ? ' is-active' : ''
							}`}
							onClick={() => handleFilterChange('status', 'inactive')}
						>
							{t('ws.users.filter.inactive')}
						</button>
					</div>
				</div>

				{mode !== 'tenant' ? (
					<label className="admin-user-panel__field">
						<span className="admin-user-panel__label">{t('ws.users.filter.role')}</span>
						<select
							id="user-role"
							className="admin-user-panel__select"
							value={filters.role}
							onChange={(e) => handleFilterChange('role', e.target.value)}
						>
							<option value="">{t('ws.users.filter.allRoles')}</option>
							{STAFF_ROLE_OPTIONS.map((role) => (
								<option key={role} value={role}>
									{getRoleLabel(role, t)}
								</option>
							))}
						</select>
					</label>
				) : null}

				{currentUser?.role === ROLES.SUPER_ADMIN ? (
					<label className="admin-user-panel__field">
						<span className="admin-user-panel__label">{t('ws.users.filter.district')}</span>
						<select
							id="user-district"
							className="admin-user-panel__select"
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

				<label className="admin-user-panel__field">
						<span className="admin-user-panel__label">{t('ws.users.sort.label')}</span>
					<select
						id="user-sort-by"
						className="admin-user-panel__select"
						value={sortConfig.key}
						onChange={(e) =>
							setSortConfig((prev) => ({ ...prev, key: e.target.value, direction: 'asc' }))
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

			<div className="admin-user-panel__meta">
				<p className="admin-user-panel__summary">
					{t(sortedUsers.length === 1 ? 'ws.users.summaryOne' : 'ws.users.summary', {
						shown: pagedUsers.length,
						total: sortedUsers.length,
					})}
					{filters.status ? (
						<>
							{' '}
							· {t('ws.users.summaryStatus', { status: statusFilterLabel })}
						</>
					) : null}
					{filters.role ? (
						<>
							{' '}
							· {t('ws.users.summaryRole', { role: getRoleLabel(filters.role, t) })}
						</>
					) : null}
				</p>

				{hasActiveFilters ? (
					<button
						type="button"
						className="ws-btn ws-btn--outline ws-btn--sm admin-user-panel__clear"
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
					{error}
				</div>
			) : null}

			{showAddForm
				? createPortal(
						<div
							className="modal-overlay admin-user-modal-overlay"
							onClick={(e) => {
								if (e.target === e.currentTarget && !creating) closeAddForm()
							}}
						>
							<div
								className="admin-user-modal"
								role="dialog"
								aria-modal="true"
								aria-labelledby="admin-user-modal-title"
							>
								<header className="admin-user-modal__header">
									<div>
										<h3 id="admin-user-modal-title">{t('ws.users.create.title')}</h3>
										<p className="admin-user-modal__hint">
											{t('ws.users.create.hint')}
										</p>
									</div>
									<button
										type="button"
										className="admin-user-modal__close"
										onClick={closeAddForm}
										disabled={creating}
										aria-label={t('ws.users.create.close')}
									>
										×
									</button>
								</header>

								{formError ? (
									<div className="admin-user-modal__error" role="alert">
										{formError}
									</div>
								) : null}

								<form onSubmit={handleSubmit} className="admin-user-modal__form" noValidate>
									<div className="admin-user-modal__field">
										<label htmlFor="staff-name">{t('ws.users.create.name')}</label>
										<input
											id="staff-name"
											type="text"
											required
											autoFocus
											value={formData.name}
											onChange={(e) => setFormData({ ...formData, name: e.target.value })}
											placeholder={t('ws.users.create.namePh')}
											disabled={creating}
										/>
									</div>
									<div className="admin-user-modal__field">
										<label htmlFor="staff-email">{t('ws.users.create.email')}</label>
										<input
											id="staff-email"
											type="email"
											required
											value={formData.email}
											onChange={(e) => setFormData({ ...formData, email: e.target.value })}
											placeholder={t('ws.users.create.emailPh')}
											disabled={creating}
										/>
									</div>
									<div className="admin-user-modal__field">
										<label htmlFor="staff-phone">{t('ws.users.create.phone')}</label>
										<input
											id="staff-phone"
											type="tel"
											required
											inputMode="numeric"
											pattern="[0-9]{10}"
											minLength={10}
											maxLength={10}
											value={formData.phone}
											onChange={(e) =>
												setFormData({
													...formData,
													phone: e.target.value.replace(/\D/g, '').slice(0, 10),
												})
											}
											placeholder={t('ws.users.create.phonePh')}
											disabled={creating}
										/>
									</div>
									<div className="admin-user-modal__field">
										<label htmlFor="staff-role">{t('ws.users.create.role')}</label>
										<select
											id="staff-role"
											required
											value={formData.role}
											onChange={(e) => setFormData({ ...formData, role: e.target.value })}
											disabled={creating}
										>
											<option value="">{t('ws.users.create.selectRole')}</option>
											{getAllowedRoles().map((r) => (
												<option key={r} value={r}>
													{getRoleLabel(r, t)}
												</option>
											))}
										</select>
									</div>
									{currentUser.role === ROLES.SUPER_ADMIN ? (
										<div className="admin-user-modal__field">
											<label htmlFor="staff-district">{t('ws.users.create.district')}</label>
											<select
												id="staff-district"
												required
												value={formData.district_id}
												onChange={(e) =>
													setFormData({ ...formData, district_id: e.target.value })
												}
												disabled={creating}
											>
												<option value="">{t('ws.users.create.selectDistrict')}</option>
												{districts.map((d) => (
													<option key={d.id} value={d.id}>
														{d.name}
													</option>
												))}
											</select>
										</div>
									) : null}
									<div className="admin-user-modal__actions">
										<button
											type="button"
											className="ws-btn ws-btn--outline"
											onClick={closeAddForm}
											disabled={creating}
										>
											{t('ws.users.create.cancel')}
										</button>
										<button
											type="submit"
											className="ws-btn ws-btn--primary"
											disabled={creating}
										>
											{creating ? t('ws.users.create.working') : t('ws.users.create.submit')}
										</button>
									</div>
								</form>
							</div>
						</div>,
						document.body,
					)
				: null}

			<DataTable
				title={tableTitle}
				accent="default"
				loading={loading}
				data={pagedUsers}
				totalCount={sortedUsers.length}
				toolbar={filterToolbar}
				className="admin-user-table"
				onRowClick={(u) => navigate(`/dashboard/admin/users/${u.id}`)}
				onSort={handleSort}
				sortKey={sortConfig.key}
				sortDirection={sortConfig.direction}
				columns={[
					{ key: 'name', label: t('ws.users.col.name'), sortable: true },
					{
						key: 'email',
						label: t('ws.users.col.email'),
						sortable: true,
						cellClassName: 'ws-status-cell-mono',
					},
					{ key: 'phone', label: t('ws.users.col.phone'), sortable: true },
					{
						key: 'role',
						label: t('ws.users.col.role'),
						sortable: true,
						render: (val) => (
							<span className={getRoleBadgeClass(val)}>{getRoleLabel(val, t)}</span>
						),
					},
					{
						key: 'district',
						label: t('ws.users.col.district'),
						sortable: true,
						render: (val) => val?.name || '—',
					},
					{
						key: 'is_blocked',
						label: t('ws.users.col.status'),
						sortable: true,
						render: (val) => (
							<span
								className={`admin-user-status ${
									val ? 'admin-user-status--inactive' : 'admin-user-status--active'
								}`}
							>
								{val ? t('ws.users.status.inactive') : t('ws.users.status.active')}
							</span>
						),
					},
				]}
				actions={(u) => (
					<>
						<button
							type="button"
							className="ws-status-action-btn ws-status-action-btn--view"
							title={t('ws.users.action.viewTitle', { name: u.name })}
							onClick={() => navigate(`/dashboard/admin/users/${u.id}`)}
						>
							<Icon name="eye" />
							<span>{t('ws.users.action.view')}</span>
						</button>
						{canToggleStatus(u) ? (
							<button
								type="button"
								className={`ws-status-action-btn ${
									u.is_blocked
										? 'ws-status-action-btn--join'
										: 'ws-status-action-btn--reject'
								}`}
								title={
									u.is_blocked
										? t('ws.users.action.activateTitle', { name: u.name })
										: t('ws.users.action.deactivateTitle', { name: u.name })
								}
								onClick={() => openStatusModal(u)}
							>
								<Icon name={u.is_blocked ? 'check' : 'lock'} />
								<span>
									{u.is_blocked
										? t('ws.users.action.activate')
										: t('ws.users.action.deactivate')}
								</span>
							</button>
						) : null}
					</>
				)}
				emptyMessage={
					mode === 'tenant' ? t('ws.users.empty.tenants') : t('ws.users.empty.staff')
				}
				pagination={{
					currentPage: page,
					totalPages,
					onPageChange: setPage,
				}}
			/>

			<WorkflowConfirmModal
				open={Boolean(statusModal)}
				onClose={closeStatusModal}
				title={
					statusModal?.deactivating
						? t('ws.users.modal.deactivateTitle')
						: t('ws.users.modal.activateTitle')
				}
				description={
					statusModal
						? statusModal.deactivating
							? t('ws.users.modal.deactivateDesc', { name: statusModal.user.name })
							: t('ws.users.modal.activateDesc', { name: statusModal.user.name })
						: ''
				}
				primaryLabel={
					statusLoading
						? statusModal?.deactivating
							? t('ws.users.modal.deactivating')
							: t('ws.users.modal.activating')
						: statusModal?.deactivating
							? t('ws.users.modal.deactivate')
							: t('ws.users.modal.activate')
				}
				primaryVariant={statusModal?.deactivating ? 'danger' : 'primary'}
				onPrimary={confirmToggleStatus}
				primaryDisabled={
					statusLoading ||
					(statusModal?.deactivating && !statusReason.trim())
				}
			>
				{statusModal?.deactivating ? (
					<label className="workflow-confirm-field">
						<span className="workflow-confirm-field__label">
							{t('ws.users.modal.reason')}
						</span>
						<textarea
							className="workflow-confirm-field__input"
							value={statusReason}
							onChange={(e) => setStatusReason(e.target.value)}
							placeholder={t('ws.users.modal.reasonPh')}
							rows={4}
							required
						/>
					</label>
				) : null}
			</WorkflowConfirmModal>

			<WorkflowConfirmModal
				open={Boolean(successModal)}
				onClose={() => setSuccessModal(null)}
				title={successModal?.title || t('ws.users.modal.done')}
				description={successModal?.description}
				primaryLabel={t('ws.users.modal.ok')}
				secondaryLabel={t('ws.users.modal.close')}
				onPrimary={() => setSuccessModal(null)}
			/>
		</>
	)
}

export default UserManagement
