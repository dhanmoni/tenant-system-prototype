import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import DataTable from '../../../components/dashboard/DataTable';
import { useEffect, useState } from 'react';
import { formatDate } from '../../../utils/formatters';
import { ADMIN_ROLES } from '../../../constants/roles';

import { STATUS_LABELS } from '../../../constants/status';

const TenancyRecords = ({ user }) => {
	const navigate = useNavigate();
	const [records, setRecords] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		if (!ADMIN_ROLES.includes(user?.role)) {
			navigate('/dashboard');
			return;
		}
		fetchRecords();
	}, [user?.role]);

	const fetchRecords = async () => {
		try {
			const { data } = await api.get('/api/admin/tenancy-records');
			setRecords(data.records || []);
		} catch (err) {
			setError('Failed to load tenancy records');
		} finally {
			setLoading(false);
		}
	};

	if (loading) return <div>Loading tenancy records...</div>;

	return (
		<DataTable
			title="Tenancy Records (UIN Applications)"
			loading={loading}
			data={records}
			columns={[
				{ key: 'application_no', label: 'Application No' },
				{ key: 'applicant_name', label: 'Applicant' },
				{
					key: 'district',
					label: 'District',
					render: (val) => val?.name || 'Global'
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
					render: (val) => formatDate(val)
				}
			]}
			actions={(record) => (
				<button
					className="action-icon-btn info"
					onClick={() => navigate(`/dashboard/admin/applications/${record.application_no}`)}
				>
					View Info
				</button>
			)}
			emptyMessage="No tenancy records found."
		/>
	);
};

export default TenancyRecords;
