import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { csrf } from '../../../api'
import DataTable from '../../../components/dashboard/DataTable'
import { ROLES } from '../../../constants/roles'

function DistrictManagement({ user }) {
	const navigate = useNavigate()
	const [districts, setDistricts] = useState([])
	const [districtName, setDistrictName] = useState('')
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [loading, setLoading] = useState(true)
	const [page, setPage] = useState(1)
	const [paginationInfo, setPaginationInfo] = useState(null)

	useEffect(() => {
		if (user?.role !== ROLES.SUPER_ADMIN) {
			navigate('/dashboard')
			return
		}
		loadDistricts(page)
	}, [user?.role, page])

	const loadDistricts = async (pageNum = 1) => {
		setLoading(true)
		setError('')
		try {
			const { data } = await api.get('/api/districts', { params: { page: pageNum } })
			setDistricts(data.data || [])
			setPaginationInfo({
				current_page: data.current_page || 1,
				last_page: data.last_page || 1,
				per_page: data.per_page || 15,
				total: data.total || 0,
			})
		} catch {
			setError('Failed to load districts')
		} finally {
			setLoading(false)
		}
	}

	const handleAddDistrict = async (e) => {
		e.preventDefault()
		setError('')
		setSuccess('')
		try {
			await csrf()
			await api.post('/api/districts', { name: districtName.trim() })
			setDistrictName('')
			setSuccess('District added')
			loadDistricts(page)
		} catch {
			setError('Failed to add district')
		}
	}

	const handleDelete = async (district) => {
		if (!window.confirm(`Delete district "${district.name}"?`)) return
		setError('')
		setSuccess('')
		try {
			await api.delete(`/api/districts/${district.id}`)
			setSuccess('District deleted')
			loadDistricts(page)
		} catch {
			setError('Failed to delete district')
		}
	}

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

			<section className="ws-card ws-district-add-card">
				<div className="ws-card-header">
					<h2 className="ws-card-title">Add district</h2>
				</div>
				<div className="ws-card-body">
					<form onSubmit={handleAddDistrict} className="ws-district-add-form">
						<label className="ws-district-add-form__field">
							<span className="ws-district-add-form__label">District name</span>
							<input
								type="text"
								className="ws-district-add-form__input"
								value={districtName}
								onChange={(e) => setDistrictName(e.target.value)}
								placeholder="Enter district name"
								required
							/>
						</label>
						<button type="submit" className="ws-btn ws-btn--primary">
							Add district
						</button>
					</form>
				</div>
			</section>

			<DataTable
				title="Districts"
				accent="default"
				loading={loading}
				data={districts}
				columns={[
					{ key: 'id', label: 'ID', mono: true, width: '80px' },
					{ key: 'name', label: 'District name' },
				]}
				actions={(district) => (
					<button
						type="button"
						className="ws-status-action-btn ws-status-action-btn--reject"
						title="Delete district"
						onClick={() => handleDelete(district)}
					>
						<span>Delete</span>
					</button>
				)}
				emptyMessage="No districts found."
				pagination={
					paginationInfo
						? {
								currentPage: paginationInfo.current_page,
								totalPages: paginationInfo.last_page,
								onPageChange: (newPage) => setPage(newPage),
							}
						: null
				}
			/>
		</>
	)
}

export default DistrictManagement
