import { useEffect, useState } from 'react'
import api, { csrf } from '../../../api'

function RoleManagement() {
	const [roles, setRoles] = useState([])
	const [page, setPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)
	const [name, setName] = useState('')
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	useEffect(() => {
		loadRoles(1)
	}, [])

	const loadRoles = async (p = 1) => {
		try {
			const { data } = await api.get('/api/roles', { params: { page: p } })
			setRoles(data.data || [])
			setPage(data.current_page || 1)
			setTotalPages(data.last_page || 1)
		} catch (err) { setError('Failed to load roles') }
	}

	const handleAdd = async (e) => {
		e.preventDefault()
		try {
			await csrf()
			await api.post('/api/roles', { name })
			setName(''); setSuccess('Role added'); loadRoles(page)
		} catch (err) { setError('Failed to add role') }
	}

	return (
		<div className="auth-card dashboard-card">
			<h1>Role Management</h1>
			{error ? <div className="error">{error}</div> : null}
			{success ? <div className="admin-success">{success}</div> : null}

			<form onSubmit={handleAdd} className="admin-form-inline">
				<input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Role Name" required />
				<button type="submit">Add Role</button>
			</form>

			<div className="admin-table-wrapper">
				<table className="admin-table">
					<thead><tr><th>ID</th><th>Name</th><th>Actions</th></tr></thead>
					<tbody>
						{roles.map(r => (
							<tr key={r.id}>
								<td>{r.id}</td>
								<td>{r.name}</td>
								<td><button className="danger" onClick={async () => { if(window.confirm('Sure?')) { await api.delete(`/api/roles/${r.id}`); loadRoles(page); } }}>Delete</button></td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default RoleManagement
