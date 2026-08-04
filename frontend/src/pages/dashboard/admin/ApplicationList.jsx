import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import DataTable from '../../../components/dashboard/DataTable';
import { Icon } from '../../../components/dashboard/Icons';
import StatusProgressViewButton from '../../../components/dashboard/StatusProgressViewButton';
import { useEffect, useState, useCallback } from 'react';
import { ASSISTANT_ROLES, PRINCIPAL_ROLES, ROLES, ADMIN_ROLES } from '../../../constants/roles';
import { APPLICATION_LABELS, APPLICATION_TYPES, SERVICE_APPLICATION_TYPES } from '../../../constants/application';
import { STATUS_LABELS } from '../../../constants/status';
import { formatDate } from '../../../utils/formatters';
import { getAdminTableAccent } from '../../../utils/adminTableAccent';
import { adminStatusBadgeClass, adminStatusLabel } from '../../../utils/adminStatusBadge';
import './ApplicationList.css';

const ApplicationList = ({ user }) => {
	const navigate = useNavigate();
	const [applications, setApplications] = useState([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [paginationInfo, setPaginationInfo] = useState(null);
	const [districts, setDistricts] = useState([]);
	const [filters, setFilters] = useState({
		search: '',
		status: '',
		form_type: '',
		district_id: '',
	});
	const [searchInput, setSearchInput] = useState('');

	const showFilters = ADMIN_ROLES.includes(user?.role);
	const isQueueRole =
		ASSISTANT_ROLES.includes(user?.role) || PRINCIPAL_ROLES.includes(user?.role) || user?.role === ROLES.VALUER;

	useEffect(() => {
		if (user?.role === ROLES.SUPER_ADMIN) {
			api.get('/api/districts', { params: { all: true } })
				.then(({ data }) => setDistricts(Array.isArray(data) ? data : data.data || []))
				.catch(() => setDistricts([]));
		}
	}, [user?.role]);

	const fetchApplications = useCallback(async () => {
		setLoading(true);
		try {
			let endpoint = '/api/admin/applications/all';
			if (ASSISTANT_ROLES.includes(user?.role)) {
				endpoint = '/api/admin/applications/inbox';
			} else if (PRINCIPAL_ROLES.includes(user?.role)) {
				endpoint = '/api/admin/applications/principal-inbox';
			} else if (user?.role === ROLES.VALUER) {
				endpoint = '/api/admin/applications/valuer-inbox';
			}

			const params = { page, per_page: 15 };
			if (showFilters) {
				if (filters.search) params.search = filters.search;
				if (filters.status) params.status = filters.status;
				if (filters.form_type) params.form_type = filters.form_type;
				if (filters.district_id) params.district_id = filters.district_id;
			}

			const { data } = await api.get(endpoint, { params });
			setApplications(data.applications || []);
			setPaginationInfo(data.pagination || null);
		} catch (error) {
			console.error('Error fetching applications:', error);
		} finally {
			setLoading(false);
		}
	}, [user?.role, page, filters, showFilters]);

	useEffect(() => {
		fetchApplications();
	}, [fetchApplications]);

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
		setFilters({ search: '', status: '', form_type: '', district_id: '' });
		setPage(1);
	};

	const hasActiveFilters = Boolean(
		filters.search || filters.status || filters.form_type || filters.district_id
	);

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

	const filterToolbar = showFilters ? (
		<div className="ws-status-section-toolbar admin-app-toolbar">
			<div className="ws-status-section-controls">
				<label className="ws-status-section-search admin-app-search">
					<span className="ws-status-search-label">Application number</span>
					<div className="admin-app-search__field">
						<Icon name="search" className="admin-app-search__icon" />
						<input
							id="app-search"
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
						id="app-status"
						value={filters.status}
						onChange={(e) => handleFilterChange('status', e.target.value)}
					>
						<option value="">All statuses</option>
						{Object.entries(STATUS_LABELS).map(([val, label]) => (
							<option key={val} value={val}>{label}</option>
						))}
					</select>
				</label>

				<label className="ws-status-section-sort">
					<span className="ws-status-search-label">Form type</span>
					<select
						id="app-type"
						value={filters.form_type}
						onChange={(e) => handleFilterChange('form_type', e.target.value)}
					>
						<option value="">All types</option>
						{SERVICE_APPLICATION_TYPES.map((type) => (
							<option key={type} value={type}>
								{APPLICATION_LABELS[type] || type}
							</option>
						))}
					</select>
				</label>

				{user?.role === ROLES.SUPER_ADMIN ? (
					<label className="ws-status-section-sort">
						<span className="ws-status-search-label">District</span>
						<select
							id="app-district"
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
	) : null;

	const enableFifo = import.meta.env.VITE_ENABLE_FIFO === 'true';
	const queueNotice = (isQueueRole && enableFifo) ? (
		<div className="app-queue-notice">
			<Icon name="lock" className="app-queue-notice__icon" />
			<span>
				Applications are handled oldest-first. Open an application to review,
				then approve or reject from the view page.
			</span>
		</div>
	) : null;

	return (
		<DataTable
			title={tableTitle}
			accent={getAdminTableAccent(user)}
			loading={loading}
			data={applications}
			totalCount={paginationInfo?.total}
			toolbar={filterToolbar || queueNotice}
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
							case APPLICATION_TYPES.TENANCY_CERTIFICATE:
								return row.landlord_name && row.tenant_name
									? `${row.landlord_name} / ${row.tenant_name}`
									: row.landlord_name || row.tenant_name || row.user?.name || '—';
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
	);
};

export default ApplicationList;
