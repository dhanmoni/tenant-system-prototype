import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import api, { csrf } from '../../../api'
import DataTable from '../../../components/dashboard/DataTable'
import { Icon } from '../../../components/dashboard/Icons'
import SubmissionSuccessModal from '../../../components/dashboard/SubmissionSuccessModal'
import WorkflowConfirmModal from '../../../components/dashboard/WorkflowConfirmModal'
import { ROLES } from '../../../constants/roles'
import './DistrictManagement.css'

const PER_PAGE = 15

const STATUS_PILLS = [
	{ value: '', label: 'All' },
	{ value: 'active', label: 'Active' },
	{ value: 'inactive', label: 'Inactive' },
]

function DistrictManagement({ user }) {
	const navigate = useNavigate()
	const [districts, setDistricts] = useState([])
	const [districtName, setDistrictName] = useState('')
	const [error, setError] = useState('')
	const [formError, setFormError] = useState('')
	const [successModal, setSuccessModal] = useState(null)
	const [loading, setLoading] = useState(true)
	const [page, setPage] = useState(1)
	const [searchInput, setSearchInput] = useState('')
	const [filters, setFilters] = useState({ search: '', status: '' })
	const [adding, setAdding] = useState(false)
	const [showAddModal, setShowAddModal] = useState(false)
	const [statusModal, setStatusModal] = useState(null)
	const [statusReason, setStatusReason] = useState('')
	const [statusLoading, setStatusLoading] = useState(false)

	useEffect(() => {
		if (user?.role !== ROLES.SUPER_ADMIN) {
			navigate('/dashboard')
			return
		}
		loadDistricts()
	}, [user?.role, navigate])

	useEffect(() => {
		const timer = setTimeout(() => {
			const trimmed = searchInput.trim()
			setFilters((prev) => {
				if (prev.search === trimmed) return prev
				setPage(1)
				return { ...prev, search: trimmed }
			})
		}, 350)
		return () => clearTimeout(timer)
	}, [searchInput])

	useEffect(() => {
		if (!showAddModal) return undefined
		const onKey = (e) => {
			if (e.key === 'Escape') closeAddModal()
		}
		document.addEventListener('keydown', onKey)
		const prev = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.removeEventListener('keydown', onKey)
			document.body.style.overflow = prev
		}
	}, [showAddModal, adding])

	const closeAddModal = () => {
		if (adding) return
		setShowAddModal(false)
		setDistrictName('')
		setFormError('')
	}

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

	const handleFilterChange = (key, value) => {
		setFilters((prev) => ({ ...prev, [key]: value }))
		setPage(1)
	}

	const clearFilters = () => {
		setSearchInput('')
		setFilters({ search: '', status: '' })
		setPage(1)
	}

	const hasActiveFilters = Boolean(filters.search || filters.status)

	const filteredDistricts = useMemo(() => {
		let list = districts
		if (filters.search) {
			const needle = filters.search.toLowerCase()
			list = list.filter((d) => d.name?.toLowerCase().includes(needle))
		}
		if (filters.status === 'active') {
			list = list.filter((d) => d.is_active !== false)
		} else if (filters.status === 'inactive') {
			list = list.filter((d) => d.is_active === false)
		}
		return [...list].sort((a, b) =>
			String(a?.name || '').localeCompare(String(b?.name || ''), undefined, {
				sensitivity: 'base',
			})
		)
	}, [districts, filters])

	const totalPages = Math.max(1, Math.ceil(filteredDistricts.length / PER_PAGE))

	useEffect(() => {
		if (page > totalPages) setPage(totalPages)
	}, [page, totalPages])

	const paginatedDistricts = useMemo(() => {
		const start = (page - 1) * PER_PAGE
		return filteredDistricts.slice(start, start + PER_PAGE).map((district, index) => ({
			...district,
			serial_no: start + index + 1,
		}))
	}, [filteredDistricts, page])

	const handleAddDistrict = async (e) => {
		e.preventDefault()
		const trimmed = districtName.trim()
		if (!trimmed) {
			setFormError('Please enter a district name.')
			return
		}
		if (!/^[A-Za-z\s]+$/.test(trimmed)) {
			setFormError('District name may only contain letters and spaces.')
			return
		}

		setFormError('')
		setError('')
		setAdding(true)
		try {
			await csrf()
			await api.post('/api/districts', { name: trimmed })
			setDistrictName('')
			setShowAddModal(false)
			setSuccessModal({
				title: 'District added',
				message: `"${trimmed}" was added successfully and is now available across the portal.`,
			})
			await loadDistricts()
		} catch (err) {
			const apiErrors = err?.response?.data?.errors
			const firstFieldError = apiErrors
				? Object.values(apiErrors).flat().find(Boolean)
				: null
			setFormError(
				firstFieldError || err?.response?.data?.message || 'Failed to add district'
			)
		} finally {
			setAdding(false)
		}
	}

	const openStatusModal = (district) => {
		setStatusReason('')
		setStatusModal({ district, deactivating: district.is_active !== false })
	}

	const closeStatusModal = () => {
		setStatusModal(null)
		setStatusReason('')
	}

	const confirmToggleStatus = async () => {
		if (!statusModal) return
		const { district, deactivating } = statusModal
		const reason = statusReason.trim()
		if (deactivating && !reason) return
		setStatusLoading(true)
		setError('')
		try {
			await csrf()
			await api.post(
				`/api/districts/${district.id}/toggle-active`,
				deactivating ? { reason } : {}
			)
			closeStatusModal()
			setSuccessModal({
				title: deactivating ? 'District deactivated' : 'District activated',
				message: deactivating
					? `"${district.name}" has been deactivated and will be hidden from active use.${
							reason ? ` Reason: ${reason}` : ''
						}`
					: `"${district.name}" has been activated and is available again.`,
			})
			loadDistricts()
		} catch (err) {
			setError(
				err?.response?.data?.message ||
					`Failed to ${deactivating ? 'deactivate' : 'activate'} district`
			)
		} finally {
			setStatusLoading(false)
		}
	}

	const statusFilterLabel =
		STATUS_PILLS.find((pill) => pill.value === filters.status)?.label || 'All'

	const filterToolbar = (
		<div className="ws-district-toolbar">
			<div className="ws-district-toolbar__top">
				<label className="ws-district-toolbar__search">
					<span className="ws-district-toolbar__label">Search districts</span>
					<div className="ws-district-toolbar__search-field">
						<Icon name="search" className="ws-district-toolbar__search-icon" />
						<input
							id="district-search"
							className="ws-district-toolbar__input"
							type="search"
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							placeholder="District name…"
							autoComplete="off"
						/>
					</div>
				</label>

				<button
					type="button"
					className="ws-btn ws-btn--primary ws-btn--sm ws-district-toolbar__add"
					onClick={() => {
						setFormError('')
						setDistrictName('')
						setShowAddModal(true)
					}}
				>
					Add district
				</button>
			</div>

			<div className="ws-district-toolbar__filters">
				<div className="ws-district-toolbar__status" role="group" aria-label="Filter by status">
					<span className="ws-district-toolbar__label">Status</span>
					<div className="ws-district-toolbar__status-pills">
						{STATUS_PILLS.map((pill) => (
							<button
								key={pill.value || 'all'}
								type="button"
								className={`ws-district-pill${
									filters.status === pill.value ? ' is-active' : ''
								}${pill.value === 'active' ? ' ws-district-pill--active' : ''}${
									pill.value === 'inactive' ? ' ws-district-pill--inactive' : ''
								}`}
								onClick={() => handleFilterChange('status', pill.value)}
							>
								{pill.label}
							</button>
						))}
					</div>
				</div>
			</div>

			<div className="ws-district-toolbar__meta">
				<p className="ws-district-toolbar__summary">
					Showing <strong>{paginatedDistricts.length}</strong> of{' '}
					<strong>{filteredDistricts.length}</strong>
					{filteredDistricts.length === 1 ? ' district' : ' districts'}
					{filters.status ? (
						<>
							{' '}
							· Status: <strong>{statusFilterLabel}</strong>
						</>
					) : null}
				</p>

				{hasActiveFilters ? (
					<button
						type="button"
						className="ws-btn ws-btn--outline ws-btn--sm ws-district-toolbar__clear"
						onClick={clearFilters}
					>
						Clear filters
					</button>
				) : null}
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

			{showAddModal
				? createPortal(
						<div
							className="ws-district-modal-overlay"
							onClick={(e) => {
								if (e.target === e.currentTarget && !adding) closeAddModal()
							}}
						>
							<div
								className="ws-district-modal"
								role="dialog"
								aria-modal="true"
								aria-labelledby="add-district-title"
								onClick={(e) => e.stopPropagation()}
							>
								<header className="ws-district-modal__header">
									<div>
										<h3 id="add-district-title">Add new district</h3>
										<p className="ws-district-modal__hint">
											Enter the official district name as it should appear across the
											portal. Letters and spaces only.
										</p>
									</div>
									<button
										type="button"
										className="ws-district-modal__close"
										onClick={closeAddModal}
										disabled={adding}
										aria-label="Close"
									>
										×
									</button>
								</header>

								{formError ? (
									<div className="ws-district-modal__error" role="alert">
										{formError}
									</div>
								) : null}

								<form
									onSubmit={handleAddDistrict}
									className="ws-district-modal__form"
									noValidate
								>
									<div className="ws-district-modal__field">
										<label htmlFor="district-name">District name</label>
										<input
											id="district-name"
											type="text"
											value={districtName}
											onChange={(e) => {
												setDistrictName(e.target.value)
												if (formError) setFormError('')
											}}
											placeholder="e.g. Kamrup Metropolitan"
											required
											autoFocus
											disabled={adding}
											autoComplete="off"
										/>
									</div>
									<div className="ws-district-modal__actions">
										<button
											type="button"
											className="ws-btn ws-btn--outline"
											onClick={closeAddModal}
											disabled={adding}
										>
											Cancel
										</button>
										<button
											type="submit"
											className="ws-btn ws-btn--primary"
											disabled={adding || !districtName.trim()}
										>
											{adding ? 'Adding…' : 'Add district'}
										</button>
									</div>
								</form>
							</div>
						</div>,
						document.body
					)
				: null}

			<DataTable
				className="ws-district-table"
				title="Districts"
				accent="default"
				loading={loading}
				data={paginatedDistricts}
				totalCount={filteredDistricts.length}
				toolbar={filterToolbar}
				columns={[
					{ key: 'serial_no', label: 'S.no.', mono: true, width: '72px' },
					{
						key: 'name',
						label: 'District name',
						render: (val, row) => (
							<div className="ws-district-name">
								<span className="ws-district-name__text">{val}</span>
								{row.is_active === false && row.deactivation_reason ? (
									<span className="ws-district-name__reason" title={row.deactivation_reason}>
										{row.deactivation_reason}
									</span>
								) : null}
							</div>
						),
					},
					{
						key: 'is_active',
						label: 'Status',
						render: (val) => {
							const inactive = val === false
							return (
								<span
									className={`ws-district-status ${
										inactive
											? 'ws-district-status--inactive'
											: 'ws-district-status--active'
									}`}
								>
									{inactive ? 'Inactive' : 'Active'}
								</span>
							)
						},
					},
				]}
				actions={(district) => {
					const inactive = district.is_active === false
					return (
						<button
							type="button"
							className={`ws-status-action-btn ${
								inactive
									? 'ws-status-action-btn--join'
									: 'ws-status-action-btn--reject'
							}`}
							title={`${inactive ? 'Activate' : 'Deactivate'} ${district.name}`}
							onClick={() => openStatusModal(district)}
						>
							<Icon name={inactive ? 'check' : 'lock'} />
							<span>{inactive ? 'Activate' : 'Deactivate'}</span>
						</button>
					)
				}}
				emptyMessage={
					hasActiveFilters
						? 'No districts match your filters.'
						: 'No districts found.'
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

			<WorkflowConfirmModal
				open={Boolean(statusModal)}
				onClose={closeStatusModal}
				title={statusModal?.deactivating ? 'Deactivate district' : 'Activate district'}
				description={
					statusModal
						? statusModal.deactivating
							? `Deactivating "${statusModal.district.name}" will hide it from active use. Please provide a reason.`
							: `Reactivate "${statusModal.district.name}"?`
						: ''
				}
				primaryLabel={
					statusLoading
						? statusModal?.deactivating
							? 'Deactivating…'
							: 'Activating…'
						: statusModal?.deactivating
							? 'Deactivate district'
							: 'Activate district'
				}
				primaryVariant={statusModal?.deactivating ? 'danger' : 'primary'}
				onPrimary={confirmToggleStatus}
				primaryDisabled={
					statusLoading || (statusModal?.deactivating && !statusReason.trim())
				}
			>
				{statusModal?.deactivating ? (
					<label className="workflow-confirm-field">
						<span className="workflow-confirm-field__label">
							Reason for deactivation (required)
						</span>
						<textarea
							className="workflow-confirm-field__input"
							value={statusReason}
							onChange={(e) => setStatusReason(e.target.value)}
							placeholder="Explain why this district is being deactivated…"
							rows={4}
							required
						/>
					</label>
				) : null}
			</WorkflowConfirmModal>

			<SubmissionSuccessModal
				open={Boolean(successModal)}
				title={successModal?.title}
				message={successModal?.message}
				onClose={() => setSuccessModal(null)}
			/>
		</>
	)
}

export default DistrictManagement
