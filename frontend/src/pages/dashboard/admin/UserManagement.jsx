import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api, { csrf } from '../../../api'

function UserManagement() {
	const [searchParams] = useSearchParams()
	const mode = searchParams.get('mode') || 'office'
	const [users, setUsers] = useState([])
	const [offices, setOffices] = useState([])
	const [roles, setRoles] = useState([])
	const [designations, setDesignations] = useState([])
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	useEffect(() => {
		loadUsers()
		loadMetadata()
	}, [mode])

	const loadUsers = async () => {
		try {
			const { data } = await api.get('/api/users')
			setUsers(data.users || [])
		} catch (err) { setError('Failed to load users') }
	}

	const loadMetadata = async () => {
		try {
			const [o, r, d] = await Promise.all([
				api.get('/api/offices', { params: { all: true } }),
				api.get('/api/roles', { params: { all: true } }),
				api.get('/api/designations', { params: { all: true } })
			])
			setOffices(o.data?.data || o.data || [])
			setRoles(r.data?.data || r.data || [])
			setDesignations(d.data?.data || d.data || [])
		} catch (err) { }
	}

	const filteredUsers = users.filter(u => mode === 'tenant' ? u.role === 'user' : u.role !== 'user')

	return (
		<div className="auth-card dashboard-card">
			<h1>User Management {mode === 'tenant' ? '' : '(Staff)'}</h1>
			{error ? <div className="error">{error}</div> : null}
			{success ? <div className="admin-success">{success}</div> : null}

			<div className="admin-table-wrapper">
				<table className="admin-table">
					<thead>
						<tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>
					</thead>
					<tbody>
						{filteredUsers.map(u => (
							<tr key={u.id}>
								<td>{u.id}</td>
								<td>{u.name}</td>
								<td>{u.email}</td>
								<td>{u.role}</td>
								<td><button className="danger">Delete</button></td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default UserManagement

