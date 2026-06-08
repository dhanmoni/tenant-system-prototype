import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../../../api'
import DataTable from '../../../components/dashboard/DataTable'
import { Icon } from '../../../components/dashboard/Icons'
import { ROLES, ASSISTANT_ROLES, PRINCIPAL_ROLES } from '../../../constants/roles'
import { getRoleLabel } from '../../../constants/roleLabels'
import './ApplicationList.css'
import './UserManagement.css'

const STAFF_ROLE_OPTIONS = [
	ROLES.DISTRICT_ADMIN,
	...PRINCIPAL_ROLES,
	...ASSISTANT_ROLES,
]

function UserManagement({ user: currentUser }) {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const mode = searchParams.get('mode') || 'office'
	const [users, setUsers] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [showAddForm, setShowAddForm] = useState(false)
	const [districts, setDistricts] = useState([])
	const [filters, setFilters] = useState({ search: '', role: '', district_id: '' })
	const [searchInput, setSearchInput] = useState('')
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		role: '',
		district_id: currentUser?.district_id || '',
	})

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
		setError('')
		setSuccess('')
		try {
			await api.post('/api/users', formData)
			setSuccess('User created successfully')
			setShowAddForm(false)
			setFormData({
				name: '',
				email: '',
				password: '',
				role: '',
				district_id: currentUser?.district_id || '',
			})
			loadUsers()
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to create user')
		}
	}

	const handleDelete = async (targetUser) => {
		if (!window.confirm(`Delete user "${targetUser.name}"? This cannot be undone.`)) return
		setError('')
		setSuccess('')
		try {
			await api.delete(`/api/users/${targetUser.id}`)
			setSuccess(`${targetUser.name} was deleted`)
			loadUsers()
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to delete user')
		}
	}

	const getAllowedRoles = () => {
		if (currentUser.role === ROLES.SUPER_ADMIN) {
			return [ROLES.DISTRICT_ADMIN, ...PRINCIPAL_ROLES]
		}
		if (currentUser.role === ROLES.DISTRICT_ADMIN) return []
		if (currentUser.role === ROLES.RENT_AUTHORITY) return [ROLES.RA_ASSISTANT]
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
							onClick={() => setShowAddForm(true)}
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
			{success ? (
				<div className="ws-profile-alert ws-profile-alert--success" role="status">
					{success}
				</div>
			) : null}

			{showAddForm ? (
				<div className="modal-overlay">
					<div className="auth-card admin-user-modal">
						<h3>Create staff user</h3>
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
								<label>Password</label>
								<input
									type="password"
									required
									value={formData.password}
									onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
										<option value="">Select district</option>
										{districts.map((d) => (
											<option key={d.id} value={d.id}>{d.name}</option>
										))}
									</select>
								</div>
							) : null}
							<div className="nav-actions admin-user-modal__actions">
								<button type="submit" className="ws-btn ws-btn--primary">
									Create user
								</button>
								<button
									type="button"
									className="ws-btn ws-btn--outline"
									onClick={() => setShowAddForm(false)}
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			) : null}

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
				]}
				actions={(u) =>
					currentUser.role === ROLES.SUPER_ADMIN && u.id !== currentUser.id ? (
						<button
							type="button"
							className="ws-status-action-btn ws-status-action-btn--reject"
							title={`Delete ${u.name}`}
							onClick={() => handleDelete(u)}
						>
							<span>Delete</span>
						</button>
					) : null
				}
				emptyMessage={mode === 'tenant' ? 'No registered users found.' : 'No staff users found.'}
			/>
		</>
	)
}

export default UserManagement
