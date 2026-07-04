import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../../../api'
import DataTable from '../../../components/dashboard/DataTable'
import { ROLES, ASSISTANT_ROLES, PRINCIPAL_ROLES } from '../../../constants/roles'

function UserManagement({ user: currentUser }) {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const mode = searchParams.get('mode') || 'office'
	const [users, setUsers] = useState([])
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [showUserForm, setShowUserForm] = useState(false)
	const [editingUser, setEditingUser] = useState(null)
	const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '', district_id: currentUser?.district_id || '' })

	useEffect(() => {
		if (ASSISTANT_ROLES.includes(currentUser.role)) {
			navigate('/dashboard')
			return
		}
		loadUsers()
	}, [mode, currentUser.role])

	const loadUsers = async () => {
		try {
			const { data } = await api.get('/api/users')
			setUsers(data.users || [])
		} catch (err) { setError('Failed to load users') }
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		setError('')
		setSuccess('')
		try {
			if (editingUser) {
				await api.put(`/api/users/${editingUser.id}`, formData)
				setSuccess('User updated successfully')
			} else {
				await api.post('/api/users', formData)
				setSuccess('User created successfully')
			}
			setShowUserForm(false)
			setEditingUser(null)
			loadUsers()
		} catch (err) {
			setError(err.response?.data?.message || `Failed to ${editingUser ? 'update' : 'create'} user`)
		}
	}

	const handleDelete = async (u) => {
		if (!window.confirm(`Are you sure you want to delete ${u.name}?`)) return
		setError('')
		setSuccess('')
		try {
			await api.delete(`/api/users/${u.id}`)
			setSuccess('User deleted successfully')
			loadUsers()
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to delete user')
		}
	}

	const filteredUsers = users.filter(u => mode === 'tenant' ? u.role === ROLES.USER : u.role !== ROLES.USER)

	// Roles allowed to be created based on current user role
	const getAllowedRoles = () => {
		if (currentUser.role === ROLES.SUPER_ADMIN) {
			return [ROLES.DISTRICT_ADMIN, ...PRINCIPAL_ROLES, ...ASSISTANT_ROLES]
		}
		if (currentUser.role === ROLES.DISTRICT_ADMIN) {
			return [...PRINCIPAL_ROLES, ...ASSISTANT_ROLES]
		}
		if (currentUser.role === ROLES.RENT_AUTHORITY) return [ROLES.RA_ASSISTANT]
		if (currentUser.role === ROLES.RENT_COURT) return [ROLES.RC_ASSISTANT]
		if (currentUser.role === ROLES.RENT_TRIBUNAL) return [ROLES.RT_ASSISTANT]
		return []
	}

	return (
		<>
			{mode !== 'tenant' && getAllowedRoles().length > 0 ? (
				<section className="ws-card ws-district-add-card">
					<div className="ws-card-header">
						<h2 className="ws-card-title">Staff users</h2>
						<button
							type="button"
							className="ws-btn ws-btn--primary ws-btn--sm"
							onClick={() => {
								setEditingUser(null)
								setFormData({ name: '', email: '', password: '', role: '', district_id: currentUser?.district_id || '' })
								setShowUserForm(true)
							}}
						>
							Add staff user
						</button>
					</div>
				</section>
			) : null}

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

			{showUserForm && (
				<div className="modal-overlay">
					<div className="auth-card" style={{ maxWidth: '500px' }}>
						<h3>{editingUser ? 'Edit Staff User' : 'Create New Staff User'}</h3>
						<form onSubmit={handleSubmit}>
							<div className="form-group">
								<label>Name</label>
								<input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
							</div>
							<div className="form-group">
								<label>Email</label>
								<input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
							</div>
							{!editingUser && (
								<div className="form-group">
									<label>Password</label>
									<input type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
								</div>
							)}
							<div className="form-group">
								<label>Role</label>
								<select required value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
									<option value="">Select Role</option>
									{getAllowedRoles().map(r => <option key={r} value={r}>{r.replace(/_/g, ' ').toUpperCase()}</option>)}
								</select>
							</div>
							<div className="nav-actions">
								<button type="submit">{editingUser ? 'Update User' : 'Create User'}</button>
								<button type="button" className="secondary" onClick={() => { setShowUserForm(false); setEditingUser(null); }}>Cancel</button>
							</div>
						</form>
					</div>
				</div>
			)}

			<DataTable
				title={mode === 'tenant' ? 'Registered users' : 'Staff users'}
				accent="default"
				loading={false}
				data={filteredUsers}
				columns={[
					{ key: 'name', label: 'Name' },
					{ key: 'email', label: 'Email' },
					{
						key: 'role',
						label: 'Role',
						render: (val) => val.replace(/_/g, ' ').toUpperCase()
					},
					{
						key: 'district',
						label: 'District',
						render: (val) => val?.name || 'Global'
					}
				]}
				actions={(u) => {
					const canEdit = currentUser.role === ROLES.SUPER_ADMIN || 
									(currentUser.role === ROLES.DISTRICT_ADMIN && u.district_id === currentUser.district_id && u.role !== ROLES.DISTRICT_ADMIN && u.role !== ROLES.SUPER_ADMIN) || 
									(PRINCIPAL_ROLES.includes(currentUser.role) && ASSISTANT_ROLES.includes(u.role) && u.district_id === currentUser.district_id);
					return (
						<>
							{canEdit && (
								<>
									<button className="action-icon-btn primary" style={{ marginRight: '8px' }} onClick={() => { setEditingUser(u); setFormData({ name: u.name, email: u.email, role: u.role, district_id: u.district_id }); setShowUserForm(true); }}>Edit</button>
									<button className="action-icon-btn secondary" style={{ color: 'red' }} onClick={() => handleDelete(u)}>Delete</button>
								</>
							)}
						</>
					)
				}}
				emptyMessage="No users found."
			/>
		</>
	)
}

export default UserManagement

