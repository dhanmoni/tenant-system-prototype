import { useEffect, useState } from 'react'
import api, { csrf } from '../../../api'

function DistrictManagement() {
	const [districts, setDistricts] = useState([])
	const [districtName, setDistrictName] = useState('')
	const [districtEditId, setDistrictEditId] = useState(null)
	const [districtEditName, setDistrictEditName] = useState('')
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	useEffect(() => {
		loadDistricts(1)
	}, [])

	const loadDistricts = async (page = 1) => {
		try {
			const { data } = await api.get('/api/districts', { params: { page } })
			setDistricts(data.data || [])
			setDistrictPage(data.current_page || 1)
			setDistrictTotalPages(data.last_page || 1)
		} catch (err) { setError('Failed to load districts') }
	}



	const handleAddDistrict = async (e) => {
		e.preventDefault()
		try {
			await csrf()
			await api.post('/api/districts', { name: districtName })
			setDistrictName(''); setSuccess('District added'); loadDistricts(districtPage)
		} catch (err) { setError('Failed to add district') }
	}

	return (
		<div className="auth-card dashboard-card">
			<h1>District Management</h1>
			{error ? <div className="error">{error}</div> : null}
			{success ? <div className="admin-success">{success}</div> : null}

			<form onSubmit={handleAddDistrict} className="admin-form-inline">
				<input type="text" value={districtName} onChange={e => setDistrictName(e.target.value)} placeholder="District Name" required />
				<button type="submit">Add District</button>
			</form>

			<div className="admin-table-wrapper">
				<table className="admin-table">
					<thead>
						<tr><th>ID</th><th>Name</th><th>Actions</th></tr>
					</thead>
					<tbody>
						{districts.map(d => (
							<tr key={d.id}>
								<td>{d.id}</td>
								<td>{d.name}</td>
								<td><button className="danger" onClick={async () => { if(window.confirm('Sure?')) { await api.delete(`/api/districts/${d.id}`); loadDistricts(districtPage); } }}>Delete</button></td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default DistrictManagement
