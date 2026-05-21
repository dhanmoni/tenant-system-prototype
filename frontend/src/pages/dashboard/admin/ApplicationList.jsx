import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import DataTable from '../../../components/dashboard/DataTable';
import StatusProgressViewButton from '../../../components/dashboard/StatusProgressViewButton';
import WorkflowConfirmModal from '../../../components/dashboard/WorkflowConfirmModal';
import { useEffect, useState } from 'react';
import { ROLES, ASSISTANT_ROLES, PRINCIPAL_ROLES, ADMIN_ROLES } from '../../../constants/roles';
import { STATUS_LABELS } from '../../../constants/status';
import { APPLICATION_LABELS, APPLICATION_TYPES } from '../../../constants/application';

const ApplicationList = ({ user }) => {
	const navigate = useNavigate();
	const [applications, setApplications] = useState([]);
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(null);
	const [rejectionMsg, setRejectionMsg] = useState('');
	const [showRejectModal, setShowRejectModal] = useState(null);
	const [showForwardModal, setShowForwardModal] = useState(null);
	const [successModal, setSuccessModal] = useState(null);

	const fetchApplications = async () => {
		try {
			let endpoint = '/api/admin/applications/all';
			if (ASSISTANT_ROLES.includes(user?.role)) {
				endpoint = '/api/admin/applications/inbox';
			} else if (PRINCIPAL_ROLES.includes(user?.role)) {
				endpoint = '/api/admin/applications/principal-inbox';
			}
			const { data } = await api.get(endpoint);
			setApplications(data.applications || []);
		} catch (error) {
			console.error('Error fetching applications:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchApplications();
	}, [user?.role]);

	const handleForward = async () => {
		if (!showForwardModal) return;
		const { type, id, application_no } = showForwardModal;
		setActionLoading(id);
		try {
			await api.post(`/api/admin/applications/${type}/${id}/forward`);
			setShowForwardModal(null);
			setSuccessModal({
				title: 'Application forwarded',
				description: `${application_no} has been sent to the principal officer for final review.`,
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

	if (loading) return <div>Loading applications...</div>;

	return (
		<>

			<DataTable
				title={ASSISTANT_ROLES.includes(user?.role) ? 'Pending Applications' : 'Applications In Review'}
				loading={loading}
				data={applications}
				columns={[
					{
						key: 'application_no',
						label: 'Application No',
						render: (val) => <span className="bold">{val}</span>
					},
					{
						key: 'form_type',
						label: 'Type',
						render: (val) => APPLICATION_LABELS[val] || val.replace(/-/g, ' ').toUpperCase()
					},
					{
						key: 'applicant_name',
						label: 'Applicant',
						render: (_, row) => {
							switch (row.form_type) {
								case APPLICATION_TYPES.RENT_REVISION:
								case APPLICATION_TYPES.OTHER_CHARGES_REVISION:
									return row.signed_by === 'landlord' ? row.landlord_name : row.tenant_name;
								case APPLICATION_TYPES.VALUER_APPOINTMENT:
								case APPLICATION_TYPES.RENT_COURT_POSSESSION:
								case APPLICATION_TYPES.RENT_COURT_FILING:
								case APPLICATION_TYPES.RENT_AUTHORITY_FILING:
									return row.applicant_name;
								case APPLICATION_TYPES.RENT_COURT_APPEAL:
								case APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL:
									return row.appellant_name;
								default:
									return row.user?.name || row.applicant_name || '-';
							}
						}
					},
					{
						key: 'district',
						label: 'District',
						render: (val) => val?.name || '-'
					},
					{
						key: 'status',
						label: 'Status',
						render: (val) => (
							<span className={`status-pill ${val.toLowerCase()}`}>
								{STATUS_LABELS[val] || val}
							</span>
						)
					},
					{
						key: 'created_at',
						label: 'Date',
						render: (val) => new Date(val).toLocaleDateString()
					}
				]}
				actions={(app) => (
					<div className="nav-actions table-row-actions">
						<StatusProgressViewButton
							application={app}
							variant="admin"
							viewerRole={user?.role}
						/>
						<button
							className="action-icon-btn info"
							onClick={() => navigate(`/dashboard/admin/applications/${app.application_no}`)}
						>
							View Info
						</button>
						{ASSISTANT_ROLES.includes(user?.role) && (
							<button
								className="action-icon-btn"
								onClick={() =>
									setShowForwardModal({
										type: app.form_type,
										id: app.id,
										application_no: app.application_no,
									})
								}
								disabled={actionLoading === app.id}
							>
								{actionLoading === app.id ? '...' : 'Forward'}
							</button>
						)}
						{PRINCIPAL_ROLES.includes(user?.role) && (
							<button
								className="action-icon-btn"
								onClick={() => handleApprove(app.form_type, app.id)}
								disabled={actionLoading === app.id}
							>
								{actionLoading === app.id ? '...' : 'Approve'}
							</button>
						)}
						{(ASSISTANT_ROLES.includes(user?.role) || PRINCIPAL_ROLES.includes(user?.role)) && (
							<button
								className="action-icon-btn secondary"
								onClick={() =>
									setShowRejectModal({
										type: app.form_type,
										id: app.id,
										application_no: app.application_no,
									})
								}
								disabled={actionLoading === app.id}
							>
								Reject
							</button>
						)}
					</div>
				)}
				emptyMessage="No applications found."
			/>

			<WorkflowConfirmModal
				open={Boolean(showForwardModal)}
				onClose={() => setShowForwardModal(null)}
				title="Forward application"
				description={
					showForwardModal
						? `Send ${showForwardModal.application_no} to the principal officer for final review?`
						: ''
				}
				primaryLabel={actionLoading ? 'Forwarding…' : 'Forward to principal'}
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
