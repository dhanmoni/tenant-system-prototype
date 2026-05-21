import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import DataTable from '../../../components/dashboard/DataTable';
import { Icon } from '../../../components/dashboard/Icons';
import StatusProgressViewButton from '../../../components/dashboard/StatusProgressViewButton';
import WorkflowConfirmModal from '../../../components/dashboard/WorkflowConfirmModal';
import { useEffect, useState } from 'react';
import { ASSISTANT_ROLES, PRINCIPAL_ROLES, ROLES } from '../../../constants/roles';
import { APPLICATION_LABELS, APPLICATION_TYPES } from '../../../constants/application';
import { formatDate } from '../../../utils/formatters';
import { getAdminTableAccent } from '../../../utils/adminTableAccent';
import { adminStatusBadgeClass, adminStatusLabel } from '../../../utils/adminStatusBadge';
import { getAssistantForwardOfficeLabel } from '../../../utils/applicationStatusProgress';

const ApplicationList = ({ user }) => {
	const forwardOffice = getAssistantForwardOfficeLabel(user?.role);
	const navigate = useNavigate();
	const [applications, setApplications] = useState([]);
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(null);
	const [rejectionMsg, setRejectionMsg] = useState('');
	const [showRejectModal, setShowRejectModal] = useState(null);
	const [showForwardModal, setShowForwardModal] = useState(null);
	const [successModal, setSuccessModal] = useState(null);
	const [page, setPage] = useState(1);
	const [paginationInfo, setPaginationInfo] = useState(null);

	const fetchApplications = async () => {
		setLoading(true);
		try {
			let endpoint = '/api/admin/applications/all';
			if (ASSISTANT_ROLES.includes(user?.role)) {
				endpoint = '/api/admin/applications/inbox';
			} else if (PRINCIPAL_ROLES.includes(user?.role)) {
				endpoint = '/api/admin/applications/principal-inbox';
			}
			const { data } = await api.get(`${endpoint}?page=${page}&per_page=15`);
			setApplications(data.applications || []);
			setPaginationInfo(data.pagination || null);
		} catch (error) {
			console.error('Error fetching applications:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchApplications();
	}, [user?.role, page]);

	const handleForward = async () => {
		if (!showForwardModal) return;
		const { type, id, application_no } = showForwardModal;
		setActionLoading(id);
		try {
			await api.post(`/api/admin/applications/${type}/${id}/forward`);
			setShowForwardModal(null);
			setSuccessModal({
				title: 'Application forwarded',
				description: `${application_no} has been sent to ${forwardOffice} for final review.`,
			});
			fetchApplications();
		} catch (error) {
			alert('Failed to forward application');
		} finally {
			setActionLoading(null);
		}
	};

	const handleApprove = async (type, id) => {
		if (!window.confirm('Are you sure you want to APPROVE this application?')) return;
		setActionLoading(id);
		try {
			await api.post(`/api/admin/applications/${type}/${id}/approve`);
			fetchApplications();
		} catch (error) {
			alert('Failed to approve application');
		} finally {
			setActionLoading(null);
		}
	};

	const handleReject = async () => {
		const trimmed = rejectionMsg.trim();
		if (!trimmed) return;
		const { type, id, application_no } = showRejectModal;
		setActionLoading(id);
		try {
			await api.post(`/api/admin/applications/${type}/${id}/reject`, { message: trimmed });
			setShowRejectModal(null);
			setRejectionMsg('');
			setSuccessModal({
				title: 'Application rejected',
				description: `${application_no} was rejected. Reason recorded: "${trimmed}"`,
			});
			fetchApplications();
		} catch (error) {
			alert('Failed to reject application');
		} finally {
			setActionLoading(null);
		}
	};

	const openDetails = (app) => {
		navigate(`/dashboard/admin/applications/${app.application_no}`);
	};

	const tableTitle = (() => {
		if (ASSISTANT_ROLES.includes(user?.role)) return 'Pending applications';
		if (PRINCIPAL_ROLES.includes(user?.role)) return 'Applications in review';
		if (user?.role === ROLES.SUPER_ADMIN) return 'Service applications';
		if (user?.role === ROLES.DISTRICT_ADMIN) return 'Service applications';
		return 'Applications';
	})();

	return (
		<>
			<DataTable
				title={tableTitle}
				accent={getAdminTableAccent(user)}
				loading={loading}
				data={applications}
				onRowClick={openDetails}
				columns={[
					{
						key: 'application_no',
						label: 'Application no.',
						mono: true,
					},
					{
						key: 'form_type',
						label: 'Type',
						cellClassName: 'ws-status-cell-form',
						render: (val) =>
							APPLICATION_LABELS[val] ||
							val?.replace(/-/g, ' ').toUpperCase() ||
							'—',
					},
					{
						key: 'applicant_name',
						label: 'Applicant',
						render: (_, row) => {
							switch (row.form_type) {
								case APPLICATION_TYPES.RENT_REVISION:
								case APPLICATION_TYPES.OTHER_CHARGES_REVISION:
									return row.signed_by === 'landlord'
										? row.landlord_name
										: row.tenant_name;
								case APPLICATION_TYPES.VALUER_APPOINTMENT:
								case APPLICATION_TYPES.RENT_COURT_POSSESSION:
								case APPLICATION_TYPES.RENT_COURT_FILING:
								case APPLICATION_TYPES.RENT_AUTHORITY_FILING:
									return row.applicant_name;
								case APPLICATION_TYPES.RENT_COURT_APPEAL:
								case APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL:
									return row.appellant_name;
								default:
									return row.user?.name || row.applicant_name || '—';
							}
						},
					},
					{
						key: 'district',
						label: 'District',
						render: (val) => val?.name || '—',
					},
					{
						key: 'status',
						label: 'Status',
						render: (val) => (
							<span className={adminStatusBadgeClass(val)}>
								{adminStatusLabel(val)}
							</span>
						),
					},
					{
						key: 'created_at',
						label: 'Date',
						render: (val) => formatDate(val),
					},
				]}
				actions={(app) => (
					<>
						<StatusProgressViewButton
							application={app}
							variant="admin"
							viewerRole={user?.role}
						/>
						<button
							type="button"
							className="ws-status-action-btn ws-status-action-btn--view"
							title="View details"
							onClick={() => openDetails(app)}
						>
							<Icon name="eye" />
							<span>View</span>
						</button>
						{ASSISTANT_ROLES.includes(user?.role) ? (
							<button
								type="button"
								className="ws-status-action-btn ws-status-action-btn--primary"
								title={`Forward to ${forwardOffice}`}
								onClick={() =>
									setShowForwardModal({
										type: app.form_type,
										id: app.id,
										application_no: app.application_no,
									})
								}
								disabled={actionLoading === app.id}
							>
								<span>{actionLoading === app.id ? '…' : 'Forward'}</span>
							</button>
						) : null}
						{PRINCIPAL_ROLES.includes(user?.role) ? (
							<button
								type="button"
								className="ws-status-action-btn ws-status-action-btn--join"
								title="Approve application"
								onClick={() => handleApprove(app.form_type, app.id)}
								disabled={actionLoading === app.id}
							>
								<Icon name="check" />
								<span>{actionLoading === app.id ? '…' : 'Approve'}</span>
							</button>
						) : null}
						{ASSISTANT_ROLES.includes(user?.role) ||
						PRINCIPAL_ROLES.includes(user?.role) ? (
							<button
								type="button"
								className="ws-status-action-btn ws-status-action-btn--reject"
								title="Reject application"
								onClick={() =>
									setShowRejectModal({
										type: app.form_type,
										id: app.id,
										application_no: app.application_no,
									})
								}
								disabled={actionLoading === app.id}
							>
								<span>Reject</span>
							</button>
						) : null}
					</>
				)}
				emptyMessage="No service applications found."
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

			<WorkflowConfirmModal
				open={Boolean(showForwardModal)}
				onClose={() => setShowForwardModal(null)}
				title="Forward application"
				description={
					showForwardModal
						? `Send ${showForwardModal.application_no} to ${forwardOffice} for final review?`
						: ''
				}
				primaryLabel={actionLoading ? 'Forwarding…' : `Forward to ${forwardOffice}`}
				onPrimary={handleForward}
				primaryDisabled={Boolean(actionLoading)}
			/>

			<WorkflowConfirmModal
				open={Boolean(showRejectModal)}
				onClose={() => {
					setShowRejectModal(null);
					setRejectionMsg('');
				}}
				title="Reject application"
				description={
					showRejectModal
						? `Provide a reason for rejecting ${showRejectModal.application_no}. This will be shown to the applicant and in the progress timeline.`
						: ''
				}
				primaryLabel={actionLoading ? 'Rejecting…' : 'Confirm rejection'}
				primaryVariant="danger"
				onPrimary={handleReject}
				primaryDisabled={Boolean(actionLoading) || !rejectionMsg.trim()}
			>
				<label className="workflow-confirm-field">
					<span className="workflow-confirm-field__label">Rejection reason (required)</span>
					<textarea
						className="workflow-confirm-field__input"
						value={rejectionMsg}
						onChange={(e) => setRejectionMsg(e.target.value)}
						placeholder="Explain why this application is rejected…"
						rows={4}
						required
					/>
				</label>
			</WorkflowConfirmModal>

			<WorkflowConfirmModal
				open={Boolean(successModal)}
				onClose={() => setSuccessModal(null)}
				title={successModal?.title || 'Done'}
				description={successModal?.description}
				primaryLabel="OK"
				secondaryLabel="Close"
				onPrimary={() => setSuccessModal(null)}
			/>
		</>
	);
};

export default ApplicationList;
