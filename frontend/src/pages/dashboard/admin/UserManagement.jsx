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
	const [showAddForm, setShowAddForm] = useState(false)
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
			await api.post('/api/users', formData)
			setSuccess('User created successfully')
			setShowAddForm(false)
			loadUsers()
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to create user')
		}
	}

	const filteredUsers = users.filter(u => mode === 'tenant' ? u.role === ROLES.USER : u.role !== ROLES.USER)

	// Roles allowed to be created based on current user role
	const getAllowedRoles = () => {
		if (currentUser.role === ROLES.SUPER_ADMIN) {
			return [ROLES.DISTRICT_ADMIN, ...PRINCIPAL_ROLES]
		}
		// District Admin can only VIEW staff, not add (per requirement)
		if (currentUser.role === ROLES.DISTRICT_ADMIN) {
			return []
		}
		if (currentUser.role === ROLES.RENT_AUTHORITY) return [ROLES.RA_ASSISTANT]
		if (currentUser.role === ROLES.RENT_COURT) return [ROLES.RC_ASSISTANT]
		if (currentUser.role === ROLES.RENT_TRIBUNAL) return [ROLES.RT_ASSISTANT]
		return []
	}

	return (
		<div className="admin-users">
			<header className="section-header">
				<h2>User Management {mode === 'tenant' ? '' : '(Staff)'}</h2>
				{mode !== 'tenant' && getAllowedRoles().length > 0 && (
					<button onClick={() => setShowAddForm(true)}>Add Staff User</button>
				)}
			</header>

			{error ? <div className="error">{error}</div> : null}
			{success ? <div className="admin-success">{success}</div> : null}

			{showAddForm && (
				<div className="modal-overlay">
					<div className="auth-card" style={{ maxWidth: '500px' }}>
						<h3>Create New Staff User</h3>
						<form onSubmit={handleSubmit}>
							<div className="form-group">
								<label>Name</label>
								<input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
							</div>
							<div className="form-group">
								<label>Email</label>
								<input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
							</div>
							<div className="form-group">
								<label>Password</label>
								<input type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
							</div>
							<div className="form-group">
								<label>Role</label>
								<select required value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
									<option value="">Select Role</option>
									{getAllowedRoles().map(r => <option key={r} value={r}>{r.replace(/_/g, ' ').toUpperCase()}</option>)}
								</select>
							</div>
							<div className="nav-actions">
								<button type="submit">Create User</button>
								<button type="button" className="secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
							</div>
						</form>
					</div>
				</div>
			)}

			<DataTable
				title={mode === 'tenant' ? 'Registered Users' : 'Staff Users'}
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
				actions={(u) => (
					<>
						{currentUser.role === ROLES.SUPER_ADMIN && (
							<button className="action-icon-btn secondary" style={{ color: 'red' }}>Delete</button>
						)}
					</>
				)}
				emptyMessage="No users found."
			/>
		</div>
	)
}

export default UserManagement

