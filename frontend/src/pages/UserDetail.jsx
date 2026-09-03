import { useEffect, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import api, { csrf } from '../api'
import { PRINCIPAL_ROLES, ROLES } from '../constants/roles'
import { getRoleLabel } from '../constants/roleLabels'
import { formatDateTime } from '../utils/formatters'
import { useToast } from '../context/ToastContext'
import WorkflowConfirmModal from '../components/dashboard/WorkflowConfirmModal'
import { useLanguage } from '../i18n'
import { useUserDetail } from '../hooks/useUserDetail'
import { useMasterData } from '../hooks/useMasterData'
import { useQueryClient } from '@tanstack/react-query'

function isCitizenRole(role) {
	return String(role || '').toLowerCase().trim() === ROLES.USER
}

function canToggleStatus(currentUser, target) {
	if (!currentUser || !target) return false
	if (target.id === currentUser.id) return false
	if (currentUser.role === ROLES.SUPER_ADMIN) return true
	if (target.role === ROLES.SUPER_ADMIN) return false
	return [ROLES.DISTRICT_ADMIN, ...PRINCIPAL_ROLES].includes(currentUser.role)
}

function UserDetail({ user: currentUserProp }) {
	const { user: outletUser } = useOutletContext() || {}
	const currentUser = currentUserProp || outletUser
	const { id } = useParams()
	const { showToast } = useToast()
	const { t } = useLanguage()
	const { data: userDetail, isLoading, isError } = useUserDetail(id)
	const queryClient = useQueryClient()

	const { data: officesData } = useMasterData('offices')
	const { data: designationsData } = useMasterData('designations')
	const { data: rolesData } = useMasterData('roles')

	const offices = officesData || []
	const designations = designationsData || []
	const roles = rolesData || []

	const user = userDetail || null

	const [editMode, setEditMode] = useState(false)
	const [form, setForm] = useState({
		name: '',
		email: '',
		phone: '',
		office_id: '',
		designation_id: '',
		role: '',
	})
	const [error, setError] = useState('')
	const [saving, setSaving] = useState(false)
	const [statusModal, setStatusModal] = useState(null)
	const [statusReason, setStatusReason] = useState('')
	const [statusLoading, setStatusLoading] = useState(false)

	useEffect(() => {
		if (user && !editMode) {
			setForm({
				name: user.name || '',
				email: user.email || '',
				phone: user.phone || '',
				office_id: user.office_id ? String(user.office_id) : '',
				designation_id: user.designation_id ? String(user.designation_id) : '',
				role: user.role || '',
			})
		}
	}, [user, editMode])

	useEffect(() => {
		if (isError) {
			setError(t('ws.userDetail.error.load'))
		}
	}, [isError, t])

	const listPath = isCitizenRole(user?.role)
		? '/dashboard/admin/users?mode=tenant'
		: '/dashboard/admin/users?mode=office'

	const updateMutation = useMutation({
		mutationFn: async (payload) => {
			await csrf()
			const { data } = await api.put(`/api/users/${id}`, payload)
			return data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user-detail', id] })
			queryClient.invalidateQueries({ queryKey: ['users'] })
		}
	})

	const handleUpdate = async () => {
		setError('')
		setSaving(true)
		try {
			await updateMutation.mutateAsync({
				name: form.name,
				email: form.email,
				phone: form.phone || null,
				office_id: form.office_id || null,
				designation_id: form.designation_id || null,
				role: form.role,
			})
			setEditMode(false)
			showToast(t('ws.userDetail.toast.updated'), 'success')
		} catch (err) {
			setError(err?.response?.data?.message || t('ws.userDetail.error.update'))
		} finally {
			setSaving(false)
		}
	}

	const approveMutation = useMutation({
		mutationFn: async () => {
			await csrf()
			const { data } = await api.post(`/api/users/${id}/approve`)
			return data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user-detail', id] })
			queryClient.invalidateQueries({ queryKey: ['users'] })
		}
	})

	const handleApprove = async () => {
		setError('')
		try {
			await approveMutation.mutateAsync()
			showToast(t('ws.userDetail.toast.approved'), 'success')
		} catch (err) {
			setError(err?.response?.data?.message || t('ws.userDetail.error.approve'))
		}
	}

	const openStatusModal = (deactivating) => {
		setError('')
		setStatusReason('')
		setStatusModal({ deactivating })
	}

	const closeStatusModal = () => {
		setStatusModal(null)
		setStatusReason('')
	}

	const toggleBlockMutation = useMutation({
		mutationFn: async (payload) => {
			await csrf()
			const { data } = await api.post(`/api/users/${user.id}/toggle-block`, payload)
			return data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['user-detail', id] })
			queryClient.invalidateQueries({ queryKey: ['users'] })
		}
	})

	const handleToggleBlock = async () => {
		if (!user || !statusModal) return
		const deactivating = statusModal.deactivating
		const reason = statusReason.trim()
		if (deactivating && !reason) return
		setError('')
		setStatusLoading(true)
		try {
			await toggleBlockMutation.mutateAsync(deactivating ? { reason } : {})
			showToast(
				t('ws.userDetail.toast.statusUpdate', {
					action: deactivating ? t('ws.userDetail.suspended') : t('ws.userDetail.activated'),
				}),
				'success'
			)
			setStatusModal(null)
			setStatusReason('')
		} catch (err) {
			setError(err?.response?.data?.message || t('ws.userDetail.error.statusUpdate'))
		} finally {
			setStatusLoading(false)
		}
	}

	if (!user) {
		return (
			<div className="ws-user-detail">
				{error ? <p className="ws-user-detail__alert" role="alert">{error}</p> : null}
				<p className="ws-muted">{t('ws.userDetail.loading')}</p>
			</div>
		)
	}

	const citizen = isCitizenRole(user.role)
	const statusLabel = user.is_blocked
		? t('ws.userDetail.status.blocked')
		: user.approved_at
			? t('ws.userDetail.status.approved')
			: t('ws.userDetail.status.pending')

	return (
		<div className="ws-user-detail">
			<p className="ws-breadcrumb">
				<Link to={listPath}>{t('ws.userDetail.breadcrumb')}</Link>
				<span className="ws-breadcrumb-sep" aria-hidden>
					/
				</span>
				<span>{user.name || t('ws.userDetail.fallbackName')}</span>
			</p>

			{error ? <p className="ws-user-detail__alert" role="alert">{error}</p> : null}

			<div className="ws-user-detail__grid">
				<div className="ws-user-detail__field">
					<label className="ws-user-detail__label" htmlFor="user-detail-name">
						{t('ws.userDetail.name')}
					</label>
					{editMode ? (
						<input
							id="user-detail-name"
							className="ws-user-detail__control"
							type="text"
							value={form.name}
							onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
						/>
					) : (
						<p className="ws-user-detail__value">{user.name || '—'}</p>
					)}
				</div>

				<div className="ws-user-detail__field">
					<label className="ws-user-detail__label" htmlFor="user-detail-email">
						{t('ws.userDetail.email')}
					</label>
					{editMode ? (
						<input
							id="user-detail-email"
							className="ws-user-detail__control"
							type="email"
							value={form.email}
							onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
						/>
					) : (
						<p className="ws-user-detail__value">{user.email || '—'}</p>
					)}
				</div>

				<div className="ws-user-detail__field">
					<label className="ws-user-detail__label" htmlFor="user-detail-phone">
						{t('ws.userDetail.phone')}
					</label>
					{editMode ? (
						<input
							id="user-detail-phone"
							className="ws-user-detail__control"
							type="text"
							value={form.phone}
							onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
						/>
					) : (
						<p className="ws-user-detail__value">{user.phone || '—'}</p>
					)}
				</div>

				{citizen ? null : (
					<>
						<div className="ws-user-detail__field">
							<label className="ws-user-detail__label" htmlFor="user-detail-office">
								{t('ws.userDetail.office')}
							</label>
							{editMode ? (
								<select
									id="user-detail-office"
									className="ws-user-detail__control"
									value={form.office_id}
									onChange={(e) =>
										setForm((prev) => ({ ...prev, office_id: e.target.value }))
									}
								>
									<option value="">{t('ws.userDetail.selectOffice')}</option>
									{offices.map((office) => (
										<option key={office.id} value={office.id}>
											{office.name}
										</option>
									))}
								</select>
							) : (
								<p className="ws-user-detail__value">{user.office?.name || t('ws.userDetail.unassigned')}</p>
							)}
						</div>
						<div className="ws-user-detail__field">
							<label className="ws-user-detail__label" htmlFor="user-detail-designation">
								{t('ws.userDetail.designation')}
							</label>
							{editMode ? (
								<select
									id="user-detail-designation"
									className="ws-user-detail__control"
									value={form.designation_id}
									onChange={(e) =>
										setForm((prev) => ({ ...prev, designation_id: e.target.value }))
									}
								>
									<option value="">{t('ws.userDetail.selectDesignation')}</option>
									{designations.map((designation) => (
										<option key={designation.id} value={designation.id}>
											{designation.name}
										</option>
									))}
								</select>
							) : (
								<p className="ws-user-detail__value">
									{user.designation?.name || t('ws.userDetail.unassigned')}
								</p>
							)}
						</div>
						<div className="ws-user-detail__field">
							<label className="ws-user-detail__label" htmlFor="user-detail-role">
								{t('ws.userDetail.role')}
							</label>
							{editMode ? (
								<select
									id="user-detail-role"
									className="ws-user-detail__control"
									value={form.role}
									onChange={(e) =>
										setForm((prev) => ({ ...prev, role: e.target.value }))
									}
								>
									<option value="">{t('ws.userDetail.selectRole')}</option>
									{roles.map((role) => (
										<option key={role.id} value={role.name}>
											{getRoleLabel(role.name, t)}
										</option>
									))}
								</select>
							) : (
								<p className="ws-user-detail__value">{getRoleLabel(user.role, t)}</p>
							)}
						</div>
					</>
				)}

				<div className="ws-user-detail__field">
					<span className="ws-user-detail__label">{t('ws.userDetail.status')}</span>
					<p className="ws-user-detail__value">{statusLabel}</p>
				</div>
				<div className="ws-user-detail__field">
					<span className="ws-user-detail__label">{t('ws.userDetail.created')}</span>
					<p className="ws-user-detail__value">{formatDateTime(user.created_at)}</p>
				</div>
				{user.is_blocked && user.block_reason ? (
					<div className="ws-user-detail__field">
						<span className="ws-user-detail__label">{t('ws.userDetail.blockReason')}</span>
						<p className="ws-user-detail__value">{user.block_reason}</p>
					</div>
				) : null}
			</div>

			<div className="ws-user-detail__actions">
				{!citizen && editMode ? (
					<>
						<button
							type="button"
							className="ws-btn ws-btn--primary"
							onClick={handleUpdate}
							disabled={saving}
						>
							{saving ? t('ws.userDetail.saving') : t('ws.userDetail.save')}
						</button>
						<button
							type="button"
							className="ws-btn ws-btn--outline"
							onClick={() => setEditMode(false)}
							disabled={saving}
						>
							{t('ws.userDetail.cancel')}
						</button>
					</>
				) : (
					<>
						{citizen ? null : (
							<button
								type="button"
								className="ws-btn ws-btn--primary"
								onClick={() => setEditMode(true)}
							>
								{t('ws.userDetail.edit')}
							</button>
						)}
						{currentUser?.role === ROLES.SUPER_ADMIN && !user.approved_at ? (
							<button type="button" className="ws-btn ws-btn--outline" onClick={handleApprove}>
								{t('ws.userDetail.approve')}
							</button>
						) : null}
						{canToggleStatus(currentUser, user) ? (
							<button
								type="button"
								className={`ws-btn ${user.is_blocked ? 'ws-btn--primary' : 'ws-btn--danger'}`}
								onClick={() => openStatusModal(!user.is_blocked)}
							>
								{user.is_blocked ? t('ws.userDetail.activate') : t('ws.userDetail.deactivate')}
							</button>
						) : null}
					</>
				)}
				<Link to={listPath} className="ws-btn ws-btn--outline">
					{t('ws.userDetail.back')}
				</Link>
			</div>

			<WorkflowConfirmModal
				open={Boolean(statusModal)}
				onClose={() => {
					if (!statusLoading) closeStatusModal()
				}}
				title={
					statusModal?.deactivating
						? t('ws.users.modal.deactivateTitle')
						: t('ws.users.modal.activateTitle')
				}
				description={
					statusModal?.deactivating
						? t('ws.users.modal.deactivateDesc', { name: user.name })
						: t('ws.users.modal.activateDesc', { name: user.name })
				}
				primaryLabel={
					statusLoading
						? statusModal?.deactivating
							? t('ws.users.modal.deactivating')
							: t('ws.users.modal.activating')
						: statusModal?.deactivating
							? t('ws.users.modal.deactivate')
							: t('ws.users.modal.activate')
				}
				primaryVariant={statusModal?.deactivating ? 'danger' : 'primary'}
				onPrimary={handleToggleBlock}
				primaryDisabled={
					statusLoading || (Boolean(statusModal?.deactivating) && !statusReason.trim())
				}
			>
				{statusModal?.deactivating ? (
					<label className="workflow-confirm-field">
						<span className="workflow-confirm-field__label">
							{t('ws.users.modal.reason')}
						</span>
						<textarea
							className="workflow-confirm-field__input"
							value={statusReason}
							onChange={(e) => setStatusReason(e.target.value)}
							placeholder={t('ws.users.modal.reasonPh')}
							rows={4}
							required
						/>
					</label>
				) : null}
			</WorkflowConfirmModal>
		</div>
	)
}

export default UserDetail
