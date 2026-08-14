import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { csrf } from '../../../api'
import { fetchDistricts, createDistrict, toggleDistrictActive } from '../../../services/districts'
import { getApiErrorMessage } from '../../../services/errors'
import { useLanguage } from '../../../i18n'
import DataTable from '../../../components/dashboard/DataTable'
import { Icon } from '../../../components/dashboard/Icons'
import SubmissionSuccessModal from '../../../components/dashboard/SubmissionSuccessModal'
import WorkflowConfirmModal from '../../../components/dashboard/WorkflowConfirmModal'
import { ROLES } from '../../../constants/roles'
import './DistrictManagement.css'

const PER_PAGE = 15

const STATUS_PILLS = [
	{ value: '', labelKey: 'ws.districts.statusAll' },
	{ value: 'active', labelKey: 'ws.districts.statusActive' },
	{ value: 'inactive', labelKey: 'ws.districts.statusInactive' },
]

function DistrictManagement({ user }) {
	const { t } = useLanguage()
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
			const list = await fetchDistricts()
			setDistricts(list)
		} catch {
			setError(t('ws.districts.loadError'))
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
			setFormError(t('ws.districts.nameRequired'))
			return
		}
		if (!/^[A-Za-z\s]+$/.test(trimmed)) {
			setFormError(t('ws.districts.namePattern'))
			return
		}

		setFormError('')
		setError('')
		setAdding(true)
		try {
			await csrf()
			await createDistrict({ name: trimmed })
			setDistrictName('')
			setShowAddModal(false)
			setSuccessModal({
				title: t('ws.districts.addedTitle'),
				message: t('ws.districts.addedBody', { name: trimmed }),
			})
			await loadDistricts()
		} catch (err) {
			setFormError(getApiErrorMessage(err, t('ws.districts.addError')))
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
			await toggleDistrictActive(district.id, deactivating ? { reason } : {})
			closeStatusModal()
			setSuccessModal({
				title: deactivating
					? t('ws.districts.deactivatedTitle')
					: t('ws.districts.activatedTitle'),
				message: deactivating
					? t('ws.districts.deactivateDesc', { name: district.name })
					: t('ws.districts.activateDesc', { name: district.name }),
			})
			loadDistricts()
		} catch (err) {
			setError(
				getApiErrorMessage(
					err,
					t('ws.districts.toggleError', {
						action: deactivating ? t('ws.districts.deactivate') : t('ws.districts.activate'),
					}),
				),
			)
		} finally {
			setStatusLoading(false)
		}
	}

	const statusFilterLabel =
		STATUS_PILLS.find((pill) => pill.value === filters.status)?.labelKey
			? t(STATUS_PILLS.find((pill) => pill.value === filters.status).labelKey)
			: t('ws.districts.statusAll')

	const filterToolbar = (
		<div className="ws-district-toolbar">
			<div className="ws-district-toolbar__top">
				<label className="ws-district-toolbar__search">
					<span className="ws-district-toolbar__label">{t('ws.districts.search')}</span>
					<div className="ws-district-toolbar__search-field">
						<Icon name="search" className="ws-district-toolbar__search-icon" />
						<input
							id="district-search"
							className="ws-district-toolbar__input"
							type="search"
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							placeholder={t('ws.districts.searchPh')}
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
					{t('ws.districts.add')}
				</button>
			</div>

			<div className="ws-district-toolbar__filters">
				<div className="ws-district-toolbar__status" role="group" aria-label={t('ws.districts.status')}>
					<span className="ws-district-toolbar__label">{t('ws.districts.status')}</span>
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
								{t(pill.labelKey)}
							</button>
						))}
					</div>
				</div>
			</div>

			<div className="ws-district-toolbar__meta">
				<p className="ws-district-toolbar__summary">
					{t('ws.districts.showing', {
						shown: paginatedDistricts.length,
						total: filteredDistricts.length,
					})}{' '}
					{filteredDistricts.length === 1
						? t('ws.districts.one')
						: t('ws.districts.many')}
					{filters.status ? (
						<>
							{' '}
							· {t('ws.districts.status')}: <strong>{statusFilterLabel}</strong>
						</>
					) : null}
				</p>

				{hasActiveFilters ? (
					<button
						type="button"
						className="ws-btn ws-btn--outline ws-btn--sm ws-district-toolbar__clear"
						onClick={clearFilters}
					>
						{t('ws.districts.clear')}
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
										<h3 id="add-district-title">{t('ws.districts.modalTitle')}</h3>
										<p className="ws-district-modal__hint">{t('ws.districts.modalHint')}</p>
									</div>
									<button
										type="button"
										className="ws-district-modal__close"
										onClick={closeAddModal}
										disabled={adding}
										aria-label={t('ws.districts.close')}
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
										<label htmlFor="district-name">{t('ws.districts.fieldName')}</label>
										<input
											id="district-name"
											type="text"
											value={districtName}
											onChange={(e) => {
												setDistrictName(e.target.value)
												if (formError) setFormError('')
											}}
											placeholder={t('ws.districts.placeholder')}
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
											{t('ws.districts.cancel')}
										</button>
										<button
											type="submit"
											className="ws-btn ws-btn--primary"
											disabled={adding || !districtName.trim()}
										>
											{adding ? t('ws.districts.adding') : t('ws.districts.add')}
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
				title={t('ws.districts.tableTitle')}
				accent="default"
				loading={loading}
				data={paginatedDistricts}
				totalCount={filteredDistricts.length}
				toolbar={filterToolbar}
				columns={[
					{ key: 'serial_no', label: t('ws.districts.col.sno'), mono: true, width: '72px' },
					{
						key: 'name',
						label: t('ws.districts.col.name'),
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
						label: t('ws.districts.col.status'),
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
									{inactive ? t('ws.districts.statusInactive') : t('ws.districts.statusActive')}
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
							title={`${inactive ? t('ws.districts.activate') : t('ws.districts.deactivate')} ${district.name}`}
							onClick={() => openStatusModal(district)}
						>
							<Icon name={inactive ? 'check' : 'lock'} />
							<span>{inactive ? t('ws.districts.activate') : t('ws.districts.deactivate')}</span>
						</button>
					)
				}}
				emptyMessage={
					hasActiveFilters
						? t('ws.districts.emptyFiltered')
						: t('ws.districts.empty')
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
				title={
					statusModal?.deactivating
						? t('ws.districts.deactivateTitle')
						: t('ws.districts.activateTitle')
				}
				description={
					statusModal
						? statusModal.deactivating
							? t('ws.districts.deactivateDesc', { name: statusModal.district.name })
							: t('ws.districts.activateDesc', { name: statusModal.district.name })
						: ''
				}
				primaryLabel={
					statusLoading
						? statusModal?.deactivating
							? t('ws.districts.deactivating')
							: t('ws.districts.activating')
						: statusModal?.deactivating
							? t('ws.districts.deactivateTitle')
							: t('ws.districts.activateTitle')
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
							{t('ws.districts.reason')}
						</span>
						<textarea
							className="workflow-confirm-field__input"
							value={statusReason}
							onChange={(e) => setStatusReason(e.target.value)}
							placeholder={t('ws.districts.reasonPh')}
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
