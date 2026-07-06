import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../../../api'
import DataTable from '../../../components/dashboard/DataTable'
import { Icon } from '../../../components/dashboard/Icons'
import WorkflowConfirmModal from '../../../components/dashboard/WorkflowConfirmModal'
import { ROLES, ASSISTANT_ROLES, PRINCIPAL_ROLES } from '../../../constants/roles'
import { getRoleLabel } from '../../../constants/roleLabels'
import './ApplicationList.css'
import './UserManagement.css'

const STAFF_ROLE_OPTIONS = [
	ROLES.DISTRICT_ADMIN,
	...PRINCIPAL_ROLES,
	...ASSISTANT_ROLES,
	ROLES.VALUER,
]

function UserManagement({ user: currentUser }) {
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
	const [districts, setDistricts] = useState([])
	const [filters, setFilters] = useState({ search: '', role: '', district_id: '' })
	const [searchInput, setSearchInput] = useState('')
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

	useEffect(() => {
		if (currentUser?.role === ROLES.SUPER_ADMIN) {
			api.get('/api/districts', { params: { all: true } })
				.then(({ data }) => setDistricts(Array.isArray(data) ? data : data.data || []))
				.catch(() => setDistricts([]))
		}
	}, [currentUser?.role])

	const loadUsers = async () => {
		setLoading(true)
		setError('')
		try {
			const { data } = await api.get('/api/users')
			setUsers(data.users || [])
		} catch {
			setError('Failed to load users')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		const timer = setTimeout(() => {
			const trimmed = searchInput.trim()
			setFilters((prev) => {
				if (prev.search === trimmed) return prev
				return { ...prev, search: trimmed }
			})
		}, 350)
		return () => clearTimeout(timer)
	}, [searchInput])

	const handleFilterChange = (key, value) => {
		setFilters((prev) => ({ ...prev, [key]: value }))
	}

	const clearFilters = () => {
		setSearchInput('')
		setFilters({ search: '', role: '', district_id: '' })
	}

	const hasActiveFilters = Boolean(filters.search || filters.role || filters.district_id)

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
		return list
	}, [baseUsers, filters])

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
			setFormError('Name, email, phone, and role are required.')
			return
		}
		if (!/^\d{10}$/.test(payload.phone)) {
			setFormError('Phone number must be exactly 10 digits.')
			return
		}
		if (currentUser.role === ROLES.SUPER_ADMIN && !payload.district_id) {
			setFormError('Please select a district for this staff user.')
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
				title: 'Staff user created',
				description: `${payload.name} was added successfully. Default password is Test@123.`,
			})
			loadUsers()
		} catch (err) {
			const errors = err?.response?.data?.errors
			const fieldMsg = errors
				? Object.values(errors).flat().join(' ')
				: err?.response?.data?.message
			setFormError(fieldMsg || 'Failed to create user')
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
				title: deactivating ? 'User deactivated' : 'User activated',
				description: deactivating
					? `"${targetUser.name}" has been deactivated and can no longer log in.${reason ? ` Reason: ${reason}` : ''}`
					: `"${targetUser.name}" has been activated and can log in again.`,
			})
			loadUsers()
		} catch (err) {
			setError(
				err.response?.data?.message ||
					`Failed to ${deactivating ? 'deactivate' : 'activate'} user`
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
	const tableTitle = mode === 'tenant' ? 'Registered users' : 'Staff users'

	const filterToolbar = (
		<div className="ws-status-section-toolbar admin-app-toolbar admin-user-toolbar">
			<div className="ws-status-section-controls">
				<label className="ws-status-section-search admin-app-search">
					<span className="ws-status-search-label">
						{mode === 'tenant' ? 'Search users' : 'Search staff'}
					</span>
					<div className="admin-app-search__field">
						<Icon name="search" className="admin-app-search__icon" />
						<input
							id="user-search"
							type="search"
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							placeholder="Name or email…"
							autoComplete="off"
						/>
					</div>
				</label>

				{mode !== 'tenant' ? (
					<label className="ws-status-section-sort">
						<span className="ws-status-search-label">Role</span>
						<select
							id="user-role"
							value={filters.role}
							onChange={(e) => handleFilterChange('role', e.target.value)}
						>
							<option value="">All roles</option>
							{STAFF_ROLE_OPTIONS.map((role) => (
								<option key={role} value={role}>
									{getRoleLabel(role)}
								</option>
							))}
						</select>
					</label>
				) : null}

				{currentUser?.role === ROLES.SUPER_ADMIN ? (
					<label className="ws-status-section-sort">
						<span className="ws-status-search-label">District</span>
						<select
							id="user-district"
							value={filters.district_id}
							onChange={(e) => handleFilterChange('district_id', e.target.value)}
						>
							<option value="">All districts</option>
							{districts.map((d) => (
								<option key={d.id} value={d.id}>{d.name}</option>
							))}
						</select>
					</label>
				) : null}

				{hasActiveFilters ? (
					<div className="admin-app-toolbar__clear">
						<button
							type="button"
							className="ws-btn ws-btn--outline ws-btn--sm"
							onClick={clearFilters}
						>
							Clear filters
						</button>
					</div>
				) : null}

				{canAddStaff ? (
					<div className="admin-user-toolbar__add">
						<button
							type="button"
							className="ws-btn ws-btn--primary ws-btn--sm"
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
							Add staff user
						</button>
					</div>
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

			{showAddForm ? (
				<div className="modal-overlay">
					<div className="auth-card admin-user-modal">
						<h3>Create staff user</h3>
						{error ? (
							<div className="ws-profile-alert ws-profile-alert--error" role="alert" style={{ marginBottom: '1rem' }}>
								{error}
							</div>
						) : null}
						<form onSubmit={handleSubmit}>
							<div className="form-group">
								<label>Name</label>
								<input
									type="text"
									required
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								/>
							</div>
							<div className="form-group">
								<label>Email</label>
								<input
									type="email"
									required
									value={formData.email}
									onChange={(e) => setFormData({ ...formData, email: e.target.value })}
								/>
							</div>
							<div className="form-group">
								<label>Phone</label>
								<input 
									type="text" 
									value={formData.phone} 
									onChange={e => setFormData({ ...formData, phone: e.target.value })} 
								/>
							</div>
							<div className="form-group">
								<label>Role</label>
								<select
									required
									value={formData.role}
									onChange={(e) => setFormData({ ...formData, role: e.target.value })}
								>
									<option value="">Select role</option>
									{getAllowedRoles().map((r) => (
										<option key={r} value={r}>{getRoleLabel(r)}</option>
									))}
								</select>
							</div>
							{currentUser.role === ROLES.SUPER_ADMIN ? (
								<div className="form-group">
									<label>District</label>
									<select
										value={formData.district_id}
										onChange={(e) =>
											setFormData({ ...formData, district_id: e.target.value })
										}
									>
										×
									</button>
								</header>

								{formError ? (
									<div className="admin-user-modal__error" role="alert">
										{formError}
									</div>
								) : null}

								<form onSubmit={handleSubmit} className="admin-user-modal__form">
									<div className="form-group">
										<label htmlFor="staff-name">Name</label>
										<input
											id="staff-name"
											type="text"
											required
											autoFocus
											value={formData.name}
											onChange={(e) => setFormData({ ...formData, name: e.target.value })}
											placeholder="Full name"
											disabled={creating}
										/>
									</div>
									<div className="form-group">
										<label htmlFor="staff-email">Email</label>
										<input
											id="staff-email"
											type="email"
											required
											value={formData.email}
											onChange={(e) => setFormData({ ...formData, email: e.target.value })}
											placeholder="name@example.com"
											disabled={creating}
										/>
									</div>
									<div className="form-group">
										<label htmlFor="staff-phone">Phone</label>
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
											placeholder="10-digit mobile number"
											disabled={creating}
										/>
									</div>
									<div className="form-group">
										<label htmlFor="staff-role">Role</label>
										<select
											id="staff-role"
											required
											value={formData.role}
											onChange={(e) => setFormData({ ...formData, role: e.target.value })}
											disabled={creating}
										>
											<option value="">Select role</option>
											{getAllowedRoles().map((r) => (
												<option key={r} value={r}>
													{getRoleLabel(r)}
												</option>
											))}
										</select>
									</div>
									{currentUser.role === ROLES.SUPER_ADMIN ? (
										<div className="form-group">
											<label htmlFor="staff-district">District</label>
											<select
												id="staff-district"
												required
												value={formData.district_id}
												onChange={(e) =>
													setFormData({ ...formData, district_id: e.target.value })
												}
												disabled={creating}
											>
												<option value="">Select district</option>
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
											type="submit"
											className="ws-btn ws-btn--primary"
											disabled={creating}
										>
											{creating ? 'Creating…' : 'Create user'}
										</button>
										<button
											type="button"
											className="ws-btn ws-btn--outline"
											onClick={closeAddForm}
											disabled={creating}
										>
											Cancel
										</button>
									</div>
								</form>
							</div>
						</div>,
						document.body
					)
				: null}

			<DataTable
				title={tableTitle}
				accent="default"
				loading={loading}
				data={filteredUsers}
				totalCount={filteredUsers.length}
				toolbar={filterToolbar}
				columns={[
					{ key: 'name', label: 'Name' },
					{
						key: 'email',
						label: 'Email',
						cellClassName: 'ws-status-cell-mono',
					},
					{ key: 'phone', label: 'Phone' },
					{
						key: 'role',
						label: 'Role',
						render: (val) => (
							<span className="admin-user-role">{getRoleLabel(val)}</span>
						),
					},
					{
						key: 'district',
						label: 'District',
						render: (val) => val?.name || '—',
					},
					{
						key: 'is_blocked',
						label: 'Status',
						render: (val) => (
							<span
								className={`admin-user-status ${
									val ? 'admin-user-status--inactive' : 'admin-user-status--active'
								}`}
							>
								{val ? 'Inactive' : 'Active'}
							</span>
						),
					},
				]}
				actions={(u) =>
					canToggleStatus(u) ? (
						<button
							type="button"
							className={`ws-status-action-btn ${
								u.is_blocked
									? 'ws-status-action-btn--join'
									: 'ws-status-action-btn--reject'
							}`}
							title={`${u.is_blocked ? 'Activate' : 'Deactivate'} ${u.name}`}
							onClick={() => openStatusModal(u)}
						>
							<Icon name={u.is_blocked ? 'check' : 'lock'} />
							<span>{u.is_blocked ? 'Activate' : 'Deactivate'}</span>
						</button>
					) : null
				}
				emptyMessage={mode === 'tenant' ? 'No registered users found.' : 'No staff users found.'}
			/>

			<WorkflowConfirmModal
				open={Boolean(statusModal)}
				onClose={closeStatusModal}
				title={statusModal?.deactivating ? 'Deactivate user' : 'Activate user'}
				description={
					statusModal
						? statusModal.deactivating
							? `Deactivating "${statusModal.user.name}" will immediately block them from logging in. Please provide a reason.`
							: `Reactivate "${statusModal.user.name}"? They will be able to log in again.`
						: ''
				}
				primaryLabel={
					statusLoading
						? statusModal?.deactivating
							? 'Deactivating…'
							: 'Activating…'
						: statusModal?.deactivating
							? 'Deactivate user'
							: 'Activate user'
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
							Reason for deactivation (required)
						</span>
						<textarea
							className="workflow-confirm-field__input"
							value={statusReason}
							onChange={(e) => setStatusReason(e.target.value)}
							placeholder="Explain why this account is being deactivated…"
							rows={4}
							required
						/>
					</label>
				) : null}
			</WorkflowConfirmModal>

			<WorkflowConfirmModal
				open={Boolean(successModal)}
				onClose={() => setSuccessModal(null)}
				title={successModal?.title || 'Done'}
				description={successModal?.description}
				primaryLabel="OK"
				secondaryLabel="Close"
				onPrimary={() => setSuccessModal(null)}
			/>
		</>
	)
}

export default UserManagement
