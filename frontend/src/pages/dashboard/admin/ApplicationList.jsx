import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import DataTable from '../../../components/dashboard/DataTable';
import StatusProgressViewButton from '../../../components/dashboard/StatusProgressViewButton';
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
	const [page, setPage] = useState(1);
	const [paginationInfo, setPaginationInfo] = useState(null);

	const fetchApplications = async () => {
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

	const handleForward = async (type, id) => {
		if (!window.confirm('Are you sure you want to FORWARD this application?')) return;
		setActionLoading(id);
		try {
			await api.post(`/api/admin/applications/${type}/${id}/forward`);
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
		if (!rejectionMsg) return alert('Please provide a rejection reason');
		const { type, id } = showRejectModal;
		setActionLoading(id);
		try {
			await api.post(`/api/admin/applications/${type}/${id}/reject`, { message: rejectionMsg });
			setShowRejectModal(null);
			setRejectionMsg('');
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
						<StatusProgressViewButton application={app} variant="admin" />
						<button
							className="action-icon-btn info"
							onClick={() => navigate(`/dashboard/admin/applications/${app.application_no}`)}
						>
							View Info
						</button>
						{ASSISTANT_ROLES.includes(user?.role) && (
							<button
								className="action-icon-btn"
								onClick={() => handleForward(app.form_type, app.id)}
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
								onClick={() => setShowRejectModal({ type: app.form_type, id: app.id })}
								disabled={actionLoading === app.id}
							>
								Reject
							</button>
						)}
					</div>
				)}
				emptyMessage="No applications found."
				pagination={paginationInfo ? {
					currentPage: paginationInfo.current_page,
					totalPages: paginationInfo.last_page,
					onPageChange: (newPage) => setPage(newPage)
				} : null}
			/>

			{showRejectModal && (
				<div className="modal-overlay">
					<div className="auth-card" style={{ maxWidth: '400px' }}>
						<h3>Reject Application</h3>
						<p>Provide a reason for rejection. This will be visible to the applicant.</p>
						<textarea
							value={rejectionMsg}
							onChange={(e) => setRejectionMsg(e.target.value)}
							placeholder="Enter rejection message..."
							rows="4"
							style={{ width: '100%', marginBottom: '16px', padding: '8px' }}
						/>
						<div className="nav-actions">
							<button onClick={handleReject} disabled={actionLoading}>Confirm Rejection</button>
							<button className="secondary" onClick={() => setShowRejectModal(null)}>Cancel</button>
						</div>
					</div>
				</div>
			)}
		</>

	);
};

export default ApplicationList;
