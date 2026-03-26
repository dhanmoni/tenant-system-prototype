import { useEffect, useState } from 'react'
import api, { csrf } from '../../../api'

function DesignationManagement() {
	const [designations, setDesignations] = useState([])
	const [page, setPage] = useState(1)
	const [totalPages, setTotalPages] = useState(1)
	const [name, setName] = useState('')
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	useEffect(() => {
		loadDesignations(1)
	}, [])

	const loadDesignations = async (p = 1) => {
		try {
			const { data } = await api.get('/api/designations', { params: { page: p } })
			setDesignations(data.data || [])
			setPage(data.current_page || 1)
			setTotalPages(data.last_page || 1)
		} catch (err) { setError('Failed to load designations') }
	}

	const handleAdd = async (e) => {
		e.preventDefault()
		try {
			await csrf()
			await api.post('/api/designations', { name })
			setName(''); setSuccess('Designation added'); loadDesignations(page)
		} catch (err) { setError('Failed to add designation') }
	}

	return (
		<div className="auth-card dashboard-card">
			<h1>Designation Management</h1>
			{error ? <div className="error">{error}</div> : null}
			{success ? <div className="admin-success">{success}</div> : null}

			<form onSubmit={handleAdd} className="admin-form-inline">
				<input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Designation Name" required />
				<button type="submit">Add Designation</button>
			</form>

			<div className="admin-table-wrapper">
				<table className="admin-table">
					<thead><tr><th>ID</th><th>Name</th><th>Actions</th></tr></thead>
					<tbody>
						{designations.map(d => (
							<tr key={d.id}>
								<td>{d.id}</td>
								<td>{d.name}</td>
								<td><button className="danger" onClick={async () => { if(window.confirm('Sure?')) { await api.delete(`/api/designations/${d.id}`); loadDesignations(page); } }}>Delete</button></td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default DesignationManagement
