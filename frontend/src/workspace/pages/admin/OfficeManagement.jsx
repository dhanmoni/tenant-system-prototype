import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import api, { csrf } from '../../../api'
import { useMasterData } from '../../../hooks/useMasterData'
import DataTable from '../../../components/dashboard/DataTable'
import { Icon } from '../../../components/dashboard/Icons'
import SubmissionSuccessModal from '../../../components/dashboard/SubmissionSuccessModal'
import WorkflowConfirmModal from '../../../components/dashboard/WorkflowConfirmModal'
import { ROLES } from '../../../constants/roles'
import './DistrictManagement.css'
import './MasterData.css'

const PER_PAGE = 15
const EMPTY_FORM = { name: '', address: '', district_id: '' }



function fieldError(err, fallback) {
	const apiErrors = err?.response?.data?.errors
	const first = apiErrors ? Object.values(apiErrors).flat().find(Boolean) : null
	return first || err?.response?.data?.message || fallback
}

function OfficeManagement({ user }) {
	const navigate = useNavigate()
	const { data: offices = [], isLoading: officesLoading, isError: officesError, refetch: loadOffices } = useMasterData(user?.role === ROLES.SUPER_ADMIN ? '/api/offices' : null)
	const { data: districts = [], isLoading: districtsLoading, isError: districtsError } = useMasterData(user?.role === ROLES.SUPER_ADMIN ? '/api/districts' : null)
	const [form, setForm] = useState(EMPTY_FORM)
	const error = (officesError || districtsError) ? 'Failed to load offices' : ''
	const loading = officesLoading || districtsLoading
	const [formError, setFormError] = useState('')
	const [successModal, setSuccessModal] = useState(null)
	const [page, setPage] = useState(1)
	const [searchInput, setSearchInput] = useState('')
	const [search, setSearch] = useState('')
	const [saving, setSaving] = useState(false)
	const [modal, setModal] = useState(null)
	const [deleteTarget, setDeleteTarget] = useState(null)
	const [deleting, setDeleting] = useState(false)

	useEffect(() => {
		if (user?.role !== ROLES.SUPER_ADMIN) {
			navigate('/dashboard')
		}
	}, [user?.role, navigate])

	useEffect(() => {
		const timer = setTimeout(() => {
			const trimmed = searchInput.trim()
			setSearch((prev) => {
				if (prev === trimmed) return prev
				setPage(1)
				return trimmed
			})
		}, 350)
		return () => clearTimeout(timer)
	}, [searchInput])

	useEffect(() => {
		if (!modal) return undefined
		const onKey = (e) => {
			if (e.key === 'Escape' && !saving) closeModal()
		}
		document.addEventListener('keydown', onKey)
		const prev = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.removeEventListener('keydown', onKey)
			document.body.style.overflow = prev
		}
	}, [modal, saving])

	const closeModal = () => {
		if (saving) return
		setModal(null)
		setForm(EMPTY_FORM)
		setFormError('')
	}



	const filtered = useMemo(() => {
		let list = offices
		if (search) {
			const needle = search.toLowerCase()
			list = list.filter((row) => {
				const hay = [row.name, row.address, row.district?.name, row.state?.name]
					.filter(Boolean)
					.join(' ')
					.toLowerCase()
				return hay.includes(needle)
			})
		}
		return [...list].sort((a, b) =>
			String(a?.name || '').localeCompare(String(b?.name || ''), undefined, {
				sensitivity: 'base',
			}),
		)
	}, [offices, search])

	const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))

	useEffect(() => {
		if (page > totalPages) setPage(totalPages)
	}, [page, totalPages])

	const paginated = useMemo(() => {
		const start = (page - 1) * PER_PAGE
		return filtered.slice(start, start + PER_PAGE).map((row, index) => ({
			...row,
			serial_no: start + index + 1,
		}))
	}, [filtered, page])

	const openAdd = () => {
		setFormError('')
		setForm(EMPTY_FORM)
		setModal({ mode: 'add' })
	}

	const openEdit = (row) => {
		setFormError('')
		setForm({
			name: row.name || '',
			address: row.address || '',
			district_id: String(row.district_id || row.district?.id || ''),
		})
		setModal({ mode: 'edit', row })
	}

	const handleSave = async (e) => {
		e.preventDefault()
		const name = form.name.trim()
		const address = form.address.trim()
		const districtId = Number(form.district_id)
		if (!name || !address || !districtId) {
			setFormError('Name, district, and address are required.')
			return
		}

		const district = districts.find((d) => Number(d.id) === districtId)
		const payload = {
			name,
			address,
			district_id: districtId,
			state_id: district?.state_id || district?.state?.id || null,
		}

		setFormError('')
		setError('')
		setSaving(true)
		try {
			await csrf()
			if (modal?.mode === 'edit' && modal.row?.id) {
				await api.put(`/api/offices/${modal.row.id}`, payload)
				setSuccessModal({ title: 'Office updated', message: `"${name}" was saved.` })
			} else {
				await api.post('/api/offices', payload)
				setSuccessModal({
					title: 'Office added',
					message: `"${name}" is now available across the portal.`,
				})
			}
			setModal(null)
			setForm(EMPTY_FORM)
			await loadOffices()
		} catch (err) {
			setFormError(fieldError(err, 'Failed to save office'))
		} finally {
			setSaving(false)
		}
	}

	const confirmDelete = async () => {
		if (!deleteTarget?.id) return
		setDeleting(true)
		setError('')
		try {
			await csrf()
			await api.delete(`/api/offices/${deleteTarget.id}`)
			setSuccessModal({
				title: 'Office removed',
				message: `"${deleteTarget.name}" was deleted.`,
			})
			setDeleteTarget(null)
			await loadOffices()
		} catch (err) {
			setError(fieldError(err, 'Failed to delete office'))
			setDeleteTarget(null)
		} finally {
			setDeleting(false)
		}
	}

	const toolbar = (
		<div className="ws-district-toolbar">
			<div className="ws-district-toolbar__top">
				<label className="ws-district-toolbar__search">
					<span className="ws-district-toolbar__label">Search offices</span>
					<div className="ws-district-toolbar__search-field">
						<Icon name="search" className="ws-district-toolbar__search-icon" />
						<input
							className="ws-district-toolbar__input"
							type="search"
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							placeholder="Office, district, or address…"
							autoComplete="off"
						/>
					</div>
				</label>
				<button
					type="button"
					className="ws-btn ws-btn--primary ws-btn--sm ws-district-toolbar__add"
					onClick={openAdd}
				>
					Add office
				</button>
			</div>
			<div className="ws-district-toolbar__meta">
				<p className="ws-district-toolbar__summary">
					Showing <strong>{paginated.length}</strong> of <strong>{filtered.length}</strong>{' '}
					{filtered.length === 1 ? 'office' : 'offices'}
				</p>
				{search ? (
					<button
						type="button"
						className="ws-btn ws-btn--outline ws-btn--sm"
						onClick={() => {
							setSearchInput('')
							setSearch('')
							setPage(1)
						}}
					>
						Clear search
					</button>
				) : null}
			</div>
		</div>
	)

	return (
		<div className="ws-districts ws-master">
			{error ? (
				<div className="ws-profile-alert ws-profile-alert--error" role="alert">
					{error}
				</div>
			) : null}

			{modal
				? createPortal(
						<div
							className="ws-district-modal-overlay"
							onClick={(e) => {
								if (e.target === e.currentTarget && !saving) closeModal()
							}}
						>
							<div
								className="ws-district-modal ws-master-modal--wide"
								role="dialog"
								aria-modal="true"
								aria-labelledby="office-modal-title"
								onClick={(e) => e.stopPropagation()}
							>
								<header className="ws-district-modal__header">
									<div>
										<h3 id="office-modal-title">
											{modal.mode === 'edit' ? 'Edit office' : 'Add office'}
										</h3>
										<p className="ws-district-modal__hint">
											Circle / office name, district, and postal address as they should
											appear on applications.
										</p>
									</div>
									<button
										type="button"
										className="ws-district-modal__close"
										onClick={closeModal}
										disabled={saving}
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
								<form onSubmit={handleSave} className="ws-district-modal__form" noValidate>
									<div className="ws-district-modal__field">
										<label htmlFor="office-name">Office name</label>
										<input
											id="office-name"
											type="text"
											value={form.name}
											onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
											placeholder="e.g. Dispur Circle Office"
											required
											autoFocus
											disabled={saving}
											autoComplete="off"
										/>
									</div>
									<div className="ws-district-modal__field">
										<label htmlFor="office-district">District</label>
										<select
											id="office-district"
											className="ws-master-select"
											value={form.district_id}
											onChange={(e) =>
												setForm((prev) => ({ ...prev, district_id: e.target.value }))
											}
											required
											disabled={saving}
										>
											<option value="">Select district</option>
											{districts
												.filter((d) => d.is_active !== false)
												.map((d) => (
													<option key={d.id} value={d.id}>
														{d.name}
													</option>
												))}
										</select>
									</div>
									<div className="ws-district-modal__field">
										<label htmlFor="office-address">Address</label>
										<textarea
											id="office-address"
											className="ws-master-textarea"
											value={form.address}
											onChange={(e) =>
												setForm((prev) => ({ ...prev, address: e.target.value }))
											}
											placeholder="Street, circle, district"
											rows={3}
											required
											disabled={saving}
										/>
									</div>
									<div className="ws-district-modal__actions">
										<button
											type="button"
											className="ws-btn ws-btn--outline"
											onClick={closeModal}
											disabled={saving}
										>
											Cancel
										</button>
										<button type="submit" className="ws-btn ws-btn--primary" disabled={saving}>
											{saving ? 'Saving…' : modal.mode === 'edit' ? 'Save changes' : 'Add office'}
										</button>
									</div>
								</form>
							</div>
						</div>,
						document.body,
					)
				: null}

			<DataTable
				className="ws-district-table"
				title="Offices"
				accent="default"
				loading={loading}
				data={paginated}
				totalCount={filtered.length}
				toolbar={toolbar}
				columns={[
					{ key: 'serial_no', label: 'S.no.', mono: true, width: '72px' },
					{
						key: 'name',
						label: 'Office',
						render: (val) => <span className="ws-district-name__text">{val}</span>,
					},
					{
						key: 'district',
						label: 'District',
						render: (_val, row) => row.district?.name || '—',
					},
					{
						key: 'state',
						label: 'State',
						render: (_val, row) => row.state?.name || '—',
					},
					{
						key: 'address',
						label: 'Address',
						render: (val) => <span className="ws-master-muted">{val || '—'}</span>,
					},
				]}
				actions={(row) => (
					<div className="ws-master-actions">
						<button
							type="button"
							className="ws-status-action-btn ws-status-action-btn--join"
							title={`Edit ${row.name}`}
							onClick={() => openEdit(row)}
						>
							<Icon name="edit" />
							<span>Edit</span>
						</button>
						<button
							type="button"
							className="ws-status-action-btn ws-status-action-btn--reject"
							title={`Delete ${row.name}`}
							onClick={() => setDeleteTarget(row)}
						>
							<Icon name="trash" />
							<span>Delete</span>
						</button>
					</div>
				)}
				emptyMessage={search ? 'No offices match your search.' : 'No offices found.'}
				pagination={
					filtered.length > PER_PAGE
						? {
								currentPage: page,
								totalPages,
								onPageChange: (newPage) => setPage(newPage),
							}
						: null
				}
			/>

			<WorkflowConfirmModal
				open={Boolean(deleteTarget)}
				onClose={() => !deleting && setDeleteTarget(null)}
				title="Delete office"
				description={
					deleteTarget
						? `Delete "${deleteTarget.name}"? Applications already linked to this office will keep the old id until they are reassigned.`
						: ''
				}
				primaryLabel={deleting ? 'Deleting…' : 'Delete office'}
				primaryVariant="danger"
				onPrimary={confirmDelete}
				primaryDisabled={deleting}
			/>

			<SubmissionSuccessModal
				open={Boolean(successModal)}
				title={successModal?.title}
				message={successModal?.message}
				onClose={() => setSuccessModal(null)}
			/>
		</div>
	)
}

export default OfficeManagement
