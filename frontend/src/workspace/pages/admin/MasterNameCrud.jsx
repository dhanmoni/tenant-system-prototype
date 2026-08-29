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
const NAME_PATTERN = /^[A-Za-z\s]+$/



function fieldError(err, fallback) {
	const apiErrors = err?.response?.data?.errors
	const first = apiErrors ? Object.values(apiErrors).flat().find(Boolean) : null
	return first || err?.response?.data?.message || fallback
}

function MasterNameCrud({
	user,
	endpoint,
	itemLabel,
	itemLabelPlural,
	title,
	hint,
	placeholder,
}) {
	const navigate = useNavigate()
	const { data: rows = [], isLoading: loading, isError, refetch: loadRows } = useMasterData(user?.role === ROLES.SUPER_ADMIN ? endpoint : null)
	const [name, setName] = useState('')
	const error = isError ? `Failed to load ${itemLabelPlural?.toLowerCase()}` : ''
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
			if (e.key === 'Escape') closeModal()
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
		setName('')
		setFormError('')
	}



	const filtered = useMemo(() => {
		let list = rows
		if (search) {
			const needle = search.toLowerCase()
			list = list.filter((row) => row.name?.toLowerCase().includes(needle))
		}
		return [...list].sort((a, b) =>
			String(a?.name || '').localeCompare(String(b?.name || ''), undefined, {
				sensitivity: 'base',
			}),
		)
	}, [rows, search])

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
		setName('')
		setModal({ mode: 'add' })
	}

	const openEdit = (row) => {
		setFormError('')
		setName(row.name || '')
		setModal({ mode: 'edit', row })
	}

	const handleSave = async (e) => {
		e.preventDefault()
		const trimmed = name.trim()
		if (!trimmed) {
			setFormError(`Please enter a ${itemLabel.toLowerCase()} name.`)
			return
		}
		if (!NAME_PATTERN.test(trimmed)) {
			setFormError(`${itemLabel} name may only contain letters and spaces.`)
			return
		}

		setFormError('')
		setError('')
		setSaving(true)
		try {
			await csrf()
			if (modal?.mode === 'edit' && modal.row?.id) {
				await api.put(`${endpoint}/${modal.row.id}`, { name: trimmed })
				setSuccessModal({
					title: `${itemLabel} updated`,
					message: `"${trimmed}" was saved.`,
				})
			} else {
				await api.post(endpoint, { name: trimmed })
				setSuccessModal({
					title: `${itemLabel} added`,
					message: `"${trimmed}" is now available across the portal.`,
				})
			}
			setName('')
			setModal(null)
			await loadRows()
		} catch (err) {
			setFormError(fieldError(err, `Failed to save ${itemLabel.toLowerCase()}`))
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
			await api.delete(`${endpoint}/${deleteTarget.id}`)
			setDeleteTarget(null)
			setSuccessModal({
				title: `${itemLabel} removed`,
				message: `"${deleteTarget.name}" was deleted.`,
			})
			await loadRows()
		} catch (err) {
			setError(fieldError(err, `Failed to delete ${itemLabel.toLowerCase()}`))
			setDeleteTarget(null)
		} finally {
			setDeleting(false)
		}
	}

	const toolbar = (
		<div className="ws-district-toolbar">
			<div className="ws-district-toolbar__top">
				<label className="ws-district-toolbar__search">
					<span className="ws-district-toolbar__label">Search {itemLabelPlural.toLowerCase()}</span>
					<div className="ws-district-toolbar__search-field">
						<Icon name="search" className="ws-district-toolbar__search-icon" />
						<input
							className="ws-district-toolbar__input"
							type="search"
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							placeholder={`${itemLabel} name…`}
							autoComplete="off"
						/>
					</div>
				</label>
				<button
					type="button"
					className="ws-btn ws-btn--primary ws-btn--sm ws-district-toolbar__add"
					onClick={openAdd}
				>
					Add {itemLabel.toLowerCase()}
				</button>
			</div>
			<div className="ws-district-toolbar__meta">
				<p className="ws-district-toolbar__summary">
					Showing <strong>{paginated.length}</strong> of <strong>{filtered.length}</strong>{' '}
					{filtered.length === 1 ? itemLabel.toLowerCase() : itemLabelPlural.toLowerCase()}
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
								className="ws-district-modal"
								role="dialog"
								aria-modal="true"
								aria-labelledby="master-name-title"
								onClick={(e) => e.stopPropagation()}
							>
								<header className="ws-district-modal__header">
									<div>
										<h3 id="master-name-title">
											{modal.mode === 'edit' ? `Edit ${itemLabel.toLowerCase()}` : `Add ${itemLabel.toLowerCase()}`}
										</h3>
										<p className="ws-district-modal__hint">{hint}</p>
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
										<label htmlFor="master-name">{itemLabel} name</label>
										<input
											id="master-name"
											type="text"
											value={name}
											onChange={(e) => {
												setName(e.target.value)
												if (formError) setFormError('')
											}}
											placeholder={placeholder}
											required
											autoFocus
											disabled={saving}
											autoComplete="off"
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
										<button
											type="submit"
											className="ws-btn ws-btn--primary"
											disabled={saving || !name.trim()}
										>
											{saving ? 'Saving…' : modal.mode === 'edit' ? 'Save changes' : `Add ${itemLabel.toLowerCase()}`}
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
				title={title}
				accent="default"
				loading={loading}
				data={paginated}
				totalCount={filtered.length}
				toolbar={toolbar}
				columns={[
					{ key: 'serial_no', label: 'S.no.', mono: true, width: '72px' },
					{
						key: 'name',
						label: `${itemLabel} name`,
						render: (val) => <span className="ws-district-name__text">{val}</span>,
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
				emptyMessage={search ? `No ${itemLabelPlural.toLowerCase()} match your search.` : `No ${itemLabelPlural.toLowerCase()} found.`}
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
				title={`Delete ${itemLabel.toLowerCase()}`}
				description={
					deleteTarget
						? `Delete "${deleteTarget.name}"? Records that still use this ${itemLabel.toLowerCase()} may fail until they are reassigned.`
						: ''
				}
				primaryLabel={deleting ? 'Deleting…' : `Delete ${itemLabel.toLowerCase()}`}
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

export default MasterNameCrud
