import { useEffect, useState } from 'react'
import api, { csrf } from '../../../api'

function StateManagement() {
	const [states, setStates] = useState([])
	const [statePage, setStatePage] = useState(1)
	const [stateTotalPages, setStateTotalPages] = useState(1)
	const [stateName, setStateName] = useState('')
	const [stateEditId, setStateEditId] = useState(null)
	const [stateEditName, setStateEditName] = useState('')
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		loadStates(1)
	}, [])

	const loadStates = async (page = 1) => {
		setLoading(true)
		try {
			const { data } = await api.get('/api/states', { params: { page } })
			setStates(data.data || [])
			setStatePage(data.current_page || 1)
			setStateTotalPages(data.last_page || 1)
		} catch (err) {
			setError('Failed to load states')
		} finally {
			setLoading(false)
		}
	}

	const handleAddState = async (e) => {
		e.preventDefault()
		setError('')
		setSuccess('')
		try {
			await csrf()
			await api.post('/api/states', { name: stateName })
			setStateName('')
			setSuccess('State added successfully')
			loadStates(statePage)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to add state')
		}
	}

	const handleUpdateState = async (e) => {
		e.preventDefault()
		setError('')
		setSuccess('')
		try {
			await csrf()
			await api.put(`/api/states/${stateEditId}`, { name: stateEditName })
			setStateEditId(null)
			setSuccess('State updated successfully')
			loadStates(statePage)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to update state')
		}
	}

	const handleDeleteState = async (id) => {
		if (!window.confirm('Are you sure?')) return
		setError('')
		setSuccess('')
		try {
			await csrf()
			await api.delete(`/api/states/${id}`)
			setSuccess('State deleted successfully')
			loadStates(statePage)
		} catch (err) {
			setError('Failed to delete state')
		}
	}

	return (
		<div className="auth-card dashboard-card">
			<h1>State Management</h1>
			{error ? <div className="error">{error}</div> : null}
			{success ? <div className="admin-success">{success}</div> : null}

			<form onSubmit={handleAddState} className="admin-form-inline">
				<input type="text" value={stateName} onChange={e => setStateName(e.target.value)} placeholder="New State Name" required />
				<button type="submit">Add State</button>
			</form>

			<div className="admin-table-wrapper">
				<table className="admin-table">
					<thead>
						<tr>
							<th>ID</th>
							<th>Name</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{states.map(s => (
							<tr key={s.id}>
								<td>{s.id}</td>
								<td>
									{stateEditId === s.id ? (
										<input type="text" value={stateEditName} onChange={e => setStateEditName(e.target.value)} />
									) : (
										s.name
									)}
								</td>
								<td className="table-actions">
									{stateEditId === s.id ? (
										<>
											<button onClick={handleUpdateState}>Save</button>
											<button className="secondary" onClick={() => setStateEditId(null)}>Cancel</button>
										</>
									) : (
										<>
											<button onClick={() => { setStateEditId(s.id); setStateEditName(s.name); }}>Edit</button>
											<button className="danger" onClick={() => handleDeleteState(s.id)}>Delete</button>
										</>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
				<div className="table-pagination">
					<button disabled={statePage <= 1} onClick={() => loadStates(statePage - 1)}>Prev</button>
					<span>{statePage} / {stateTotalPages}</span>
					<button disabled={statePage >= stateTotalPages} onClick={() => loadStates(statePage + 1)}>Next</button>
				</div>
			</div>
		</div>
	)
}

export default StateManagement
