import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { csrf } from '../../../api'
import DataTable from '../../../components/dashboard/DataTable'
import { Icon } from '../../../components/dashboard/Icons'
import { ROLES } from '../../../constants/roles'
import './ApplicationList.css'
import './DistrictManagement.css'

const PER_PAGE = 15

function DistrictManagement({ user }) {
	const navigate = useNavigate()
	const [districts, setDistricts] = useState([])
	const [districtName, setDistrictName] = useState('')
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [loading, setLoading] = useState(true)
	const [page, setPage] = useState(1)
	const [searchInput, setSearchInput] = useState('')
	const [search, setSearch] = useState('')
	const [adding, setAdding] = useState(false)
	const [showAddModal, setShowAddModal] = useState(false)

	useEffect(() => {
		if (user?.role !== ROLES.SUPER_ADMIN) {
			navigate('/dashboard')
			return
		}
		loadDistricts()
	}, [user?.role, navigate])

	useEffect(() => {
		const timer = setTimeout(() => {
			setSearch((prev) => {
				const trimmed = searchInput.trim()
				if (prev === trimmed) return prev
				setPage(1)
				return trimmed
			})
		}, 350)
		return () => clearTimeout(timer)
	}, [searchInput])

	const loadDistricts = async () => {
		setLoading(true)
		setError('')
		try {
			const { data } = await api.get('/api/districts', { params: { all: true } })
			setDistricts(Array.isArray(data) ? data : data.data || [])
		} catch {
			setError('Failed to load districts')
		} finally {
			setLoading(false)
		}
	}

	const filteredDistricts = useMemo(() => {
		let list = districts
		if (search) {
			const needle = search.toLowerCase()
			list = list.filter((d) => d.name?.toLowerCase().includes(needle))
		}
		return [...list].sort((a, b) =>
			(a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })
		)
	}, [districts, search])

	const paginatedDistricts = useMemo(() => {
		const start = (page - 1) * PER_PAGE
		return filteredDistricts.slice(start, start + PER_PAGE).map((district, index) => ({
			...district,
			serial_no: start + index + 1,
		}))
	}, [filteredDistricts, page])

	const totalPages = Math.max(1, Math.ceil(filteredDistricts.length / PER_PAGE))

	useEffect(() => {
		if (page > totalPages) setPage(totalPages)
	}, [page, totalPages])

	const handleAddDistrict = async (e) => {
		e.preventDefault()
		const trimmed = districtName.trim()
		if (!trimmed) return

		setError('')
		setSuccess('')
		setAdding(true)
		try {
			await csrf()
			await api.post('/api/districts', { name: trimmed })
			setDistrictName('')
			setShowAddModal(false)
			setSuccess(`District "${trimmed}" added`)
			await loadDistricts()
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to add district')
		} finally {
			setAdding(false)
		}
	}

	const handleDelete = async (district) => {
		if (!window.confirm(`Delete district "${district.name}"? This cannot be undone.`)) return
		setError('')
		setSuccess('')
		try {
			await api.delete(`/api/districts/${district.id}`)
			setSuccess(`District "${district.name}" deleted`)
			loadDistricts()
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to delete district')
		}
	}

	const clearSearch = () => {
		setSearchInput('')
		setSearch('')
		setPage(1)
	}

	const closeAddModal = () => {
		setShowAddModal(false)
		setDistrictName('')
	}

	const toolbar = (
		<div className="ws-status-section-toolbar admin-app-toolbar">
			<div className="ws-status-section-controls">
				<label className="ws-status-section-search admin-app-search">
					<span className="ws-status-search-label">Search districts</span>
					<div className="admin-app-search__field">
						<Icon name="search" className="admin-app-search__icon" />
						<input
							id="district-search"
							type="search"
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							placeholder="District name…"
							autoComplete="off"
						/>
					</div>
				</label>

				{search ? (
					<div className="admin-app-toolbar__clear">
						<button
							type="button"
							className="ws-btn ws-btn--outline ws-btn--sm"
							onClick={clearSearch}
						>
							Clear search
						</button>
					</div>
				) : null}

				<div className="admin-district-toolbar__add">
					<button
						type="button"
						className="ws-btn ws-btn--primary ws-btn--sm"
						onClick={() => setShowAddModal(true)}
					>
						Add district
					</button>
				</div>
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

			{showAddModal ? (
				<div className="modal-overlay" onClick={closeAddModal}>
					<div
						className="admin-district-modal"
						onClick={(e) => e.stopPropagation()}
						role="dialog"
						aria-labelledby="add-district-title"
						aria-modal="true"
					>
						<h3 id="add-district-title">Add new district</h3>
						<p className="admin-district-modal__hint">
							Enter the official district name as it should appear across the portal.
						</p>
						<form onSubmit={handleAddDistrict}>
							<div className="form-group">
								<label htmlFor="district-name">District name</label>
								<input
									id="district-name"
									type="text"
									value={districtName}
									onChange={(e) => setDistrictName(e.target.value)}
									placeholder="Enter district name"
									required
									autoFocus
								/>
							</div>
							<div className="nav-actions admin-district-modal__actions">
								<button
									type="submit"
									className="ws-btn ws-btn--primary"
									disabled={adding || !districtName.trim()}
								>
									{adding ? 'Adding…' : 'Add district'}
								</button>
								<button
									type="button"
									className="ws-btn ws-btn--outline"
									onClick={closeAddModal}
									disabled={adding}
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			) : null}

			<div className="admin-district-panel">
			<DataTable
				title="Districts"
				accent="default"
				loading={loading}
				data={paginatedDistricts}
				totalCount={filteredDistricts.length}
				toolbar={toolbar}
				columns={[
					{ key: 'serial_no', label: 'S.no.', mono: true, width: '72px' },
					{ key: 'name', label: 'District name' },
				]}
				actions={(district) => (
					<button
						type="button"
						className="ws-status-action-btn ws-status-action-btn--reject"
						title={`Delete ${district.name}`}
						onClick={() => handleDelete(district)}
					>
						<span>Delete</span>
					</button>
				)}
				emptyMessage={
					search ? 'No districts match your search.' : 'No districts found.'
				}
				pagination={
					filteredDistricts.length > PER_PAGE
						? {
								currentPage: page,
								totalPages,
								onPageChange: (newPage) => setPage(newPage),
							}
						: null
				}
			/>
			</div>
		</>
	)
}

export default DistrictManagement
