import { useEffect, useState } from 'react'
import api, { csrf } from '../../../api'

function OfficeManagement() {
	const [offices, setOffices] = useState([])
	const [states, setStates] = useState([])
	const [districts, setDistricts] = useState([])
	const [officePage, setOfficePage] = useState(1)
	const [officeTotalPages, setOfficeTotalPages] = useState(1)
	
	const [officeName, setOfficeName] = useState('')
	const [officeAddress, setOfficeAddress] = useState('')
	const [officeStateId, setOfficeStateId] = useState('')
	const [officeDistrictId, setOfficeDistrictId] = useState('')
	
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	useEffect(() => {
		loadOffices(1)
		loadMetadata()
	}, [])

	const loadOffices = async (page = 1) => {
		try {
			const { data } = await api.get('/api/offices', { params: { page } })
			setOffices(data.data || [])
			setOfficePage(data.current_page || 1)
			setOfficeTotalPages(data.last_page || 1)
		} catch (err) { setError('Failed to load offices') }
	}

	const loadMetadata = async () => {
		try {
			const [s, d] = await Promise.all([
				api.get('/api/states', { params: { all: true } }),
				api.get('/api/districts', { params: { all: true } })
			])
			setStates(s.data?.data || s.data || [])
			setDistricts(d.data?.data || d.data || [])
		} catch (err) { }
	}

	const handleAddOffice = async (e) => {
		e.preventDefault()
		try {
			await csrf()
			await api.post('/api/offices', {
				name: officeName,
				address: officeAddress,
				state_id: officeStateId,
				district_id: officeDistrictId
			})
			setOfficeName(''); setOfficeAddress(''); setSuccess('Office added'); loadOffices(officePage)
		} catch (err) { setError('Failed to add office') }
	}

	const filteredDistricts = districts.filter(d => String(d.state_id) === String(officeStateId))

	return (
		<div className="auth-card dashboard-card">
			<h1>Office Management</h1>
			{error ? <div className="error">{error}</div> : null}
			{success ? <div className="admin-success">{success}</div> : null}

			<form onSubmit={handleAddOffice} className="admin-form-inline">
				<input type="text" value={officeName} onChange={e => setOfficeName(e.target.value)} placeholder="Office Name" required />
				<input type="text" value={officeAddress} onChange={e => setOfficeAddress(e.target.value)} placeholder="Address" required />
				<select value={officeStateId} onChange={e => setOfficeStateId(e.target.value)} required>
					<option value="">State</option>
					{states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
				</select>
				<select value={officeDistrictId} onChange={e => setOfficeDistrictId(e.target.value)} required disabled={!officeStateId}>
					<option value="">District</option>
					{filteredDistricts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
				</select>
				<button type="submit">Add Office</button>
			</form>

			<div className="admin-table-wrapper">
				<table className="admin-table">
					<thead>
						<tr><th>ID</th><th>Name</th><th>Address</th><th>District</th><th>Actions</th></tr>
					</thead>
					<tbody>
						{offices.map(o => (
							<tr key={o.id}>
								<td>{o.id}</td>
								<td>{o.name}</td>
								<td>{o.address}</td>
								<td>{o.district?.name || o.district_id}</td>
								<td><button className="danger" onClick={async () => { if(window.confirm('Sure?')) { await api.delete(`/api/offices/${o.id}`); loadOffices(officePage); } }}>Delete</button></td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}

export default OfficeManagement
