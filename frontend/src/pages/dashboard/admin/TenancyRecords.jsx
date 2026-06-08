import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import DataTable from '../../../components/dashboard/DataTable';
import { Icon } from '../../../components/dashboard/Icons';
import { useCallback, useEffect, useState } from 'react';
import { formatDate } from '../../../utils/formatters';
import { ADMIN_ROLES, ROLES } from '../../../constants/roles';
import { STATUS_LABELS } from '../../../constants/status';
import { adminStatusBadgeClass, adminStatusLabel } from '../../../utils/adminStatusBadge';
import './ApplicationList.css';

const TenancyRecords = ({ user }) => {
	const navigate = useNavigate();
	const [records, setRecords] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [page, setPage] = useState(1);
	const [paginationInfo, setPaginationInfo] = useState(null);
	const [districts, setDistricts] = useState([]);
	const [filters, setFilters] = useState({
		search: '',
		status: '',
		district_id: '',
	});
	const [searchInput, setSearchInput] = useState('');

	useEffect(() => {
		if (!ADMIN_ROLES.includes(user?.role)) {
			navigate('/dashboard');
			return;
		}
	}, [user?.role, navigate]);

	useEffect(() => {
		if (user?.role === ROLES.SUPER_ADMIN) {
			api.get('/api/districts', { params: { all: true } })
				.then(({ data }) => setDistricts(Array.isArray(data) ? data : data.data || []))
				.catch(() => setDistricts([]));
		}
	}, [user?.role]);

	const fetchRecords = useCallback(async () => {
		setLoading(true);
		setError('');
		try {
			const params = { page, per_page: 15 };
			if (filters.search) params.search = filters.search;
			if (filters.status) params.status = filters.status;
			if (filters.district_id) params.district_id = filters.district_id;

			const { data } = await api.get('/api/admin/tenancy-records', { params });
			setRecords(data.records || []);
			setPaginationInfo(data.pagination || null);
		} catch {
			setError('Failed to load tenancy applications');
		} finally {
			setLoading(false);
		}
	}, [page, filters]);

	useEffect(() => {
		if (ADMIN_ROLES.includes(user?.role)) {
			fetchRecords();
		}
	}, [fetchRecords, user?.role]);

	useEffect(() => {
		const timer = setTimeout(() => {
			const trimmed = searchInput.trim();
			setFilters((prev) => {
				if (prev.search === trimmed) return prev;
				setPage(1);
				return { ...prev, search: trimmed };
			});
		}, 350);
		return () => clearTimeout(timer);
	}, [searchInput]);

	const handleFilterChange = (key, value) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
		setPage(1);
	};

	const clearFilters = () => {
		setSearchInput('');
		setFilters({ search: '', status: '', district_id: '' });
		setPage(1);
	};

	const hasActiveFilters = Boolean(filters.search || filters.status || filters.district_id);

	const openDetails = (record) => {
		navigate(`/dashboard/admin/applications/${record.application_no}`, {
			state: { from: 'tenancy' },
		});
	};

	const filterToolbar = (
		<div className="ws-status-section-toolbar admin-app-toolbar">
			<div className="ws-status-section-controls">
				<label className="ws-status-section-search admin-app-search">
					<span className="ws-status-search-label">Application number</span>
					<div className="admin-app-search__field">
						<Icon name="search" className="admin-app-search__icon" />
						<input
							id="tenancy-search"
							type="search"
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							placeholder="e.g. APP-TC-202603-000001"
							autoComplete="off"
							spellCheck={false}
						/>
					</div>
				</label>

				<label className="ws-status-section-sort">
					<span className="ws-status-search-label">Status</span>
					<select
						id="tenancy-status"
						value={filters.status}
						onChange={(e) => handleFilterChange('status', e.target.value)}
					>
						<option value="">All statuses</option>
						{Object.entries(STATUS_LABELS).map(([val, label]) => (
							<option key={val} value={val}>{label}</option>
						))}
					</select>
				</label>

				{user?.role === ROLES.SUPER_ADMIN ? (
					<label className="ws-status-section-sort">
						<span className="ws-status-search-label">District</span>
						<select
							id="tenancy-district"
							value={filters.district_id}
							onChange={(e) => handleFilterChange('district_id', e.target.value)}
						>
							<option value="">All districts</option>
							{districts.map((d) => (
								<option key={d.id} value={d.id}>{d.name}</option>
							))}
						</select>
					</label>
				) : null}

				{hasActiveFilters ? (
					<div className="admin-app-toolbar__clear">
						<button
							type="button"
							className="ws-btn ws-btn--outline ws-btn--sm"
							onClick={clearFilters}
						>
							Clear filters
						</button>
					</div>
				) : null}
			</div>
		</div>
	);

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
				totalCount={paginationInfo?.total}
				toolbar={filterToolbar}
				onRowClick={openDetails}
				columns={[
					{
						key: 'application_no',
						label: 'Application no.',
						mono: true,
					},
					{
						key: 'uid',
						label: 'UIN',
						mono: true,
						render: (val) => val || '—',
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
