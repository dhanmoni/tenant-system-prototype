import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import DataTable from '../../../components/dashboard/DataTable';
import { Icon } from '../../../components/dashboard/Icons';
import { useEffect, useState } from 'react';
import { formatDate } from '../../../utils/formatters';
import { ADMIN_ROLES } from '../../../constants/roles';
import { adminStatusBadgeClass, adminStatusLabel } from '../../../utils/adminStatusBadge';

const TenancyRecords = ({ user }) => {
	const navigate = useNavigate();
	const [records, setRecords] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [page, setPage] = useState(1);
	const [paginationInfo, setPaginationInfo] = useState(null);

	useEffect(() => {
		if (!ADMIN_ROLES.includes(user?.role)) {
			navigate('/dashboard');
			return;
		}
		fetchRecords();
	}, [user?.role, page]);

	const fetchRecords = async () => {
		setLoading(true);
		setError('');
		try {
			const { data } = await api.get(`/api/admin/tenancy-records?page=${page}&per_page=15`);
			setRecords(data.records || []);
			setPaginationInfo(data.pagination || null);
		} catch (err) {
			setError('Failed to load tenancy applications');
		} finally {
			setLoading(false);
		}
	};

	const openDetails = (record) => {
		navigate(`/dashboard/admin/applications/${record.application_no}`);
	};

	return (
		<>
			{error ? (
				<div className="ws-profile-alert ws-profile-alert--error" role="alert">
					{error}
				</div>
			) : null}

			<DataTable
				title="Tenancy applications (UIN)"
				accent="uin"
				loading={loading}
				data={records}
				onRowClick={openDetails}
				columns={[
					{
						key: 'application_no',
						label: 'Application no.',
						mono: true,
					},
					{
						key: 'landlord_name',
						label: 'Applicant',
						render: (_, row) =>
							row.landlord_name || row.tenant_name || '—',
					},
					{
						key: 'district',
						label: 'District',
						render: (val) => val?.name || 'Global',
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
				actions={(record) => (
					<button
						type="button"
						className="ws-status-action-btn ws-status-action-btn--view"
						title="View details"
						onClick={() => openDetails(record)}
					>
						<Icon name="eye" />
						<span>View</span>
					</button>
				)}
				emptyMessage="No tenancy applications found."
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
	);
};

export default TenancyRecords;
