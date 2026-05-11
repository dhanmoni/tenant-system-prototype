import { useEffect, useState } from 'react'
import { useOutletContext, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../api'
import { Icon } from '../../components/dashboard/Icons'
import { formatDate } from '../../utils/formatters'

function ApplicationStatus() {
	const { user } = useOutletContext()
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()

	const [statusApplications, setStatusApplications] = useState([])
	const [statusLoading, setStatusLoading] = useState(false)
	const [statusPage, setStatusPage] = useState(1)
	const [statusTotalPages, setStatusTotalPages] = useState(1)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')
	const [copiedRefCode, setCopiedRefCode] = useState('')

	// Filtering and Sorting
	const [statusSearchAppNo, setStatusSearchAppNo] = useState(searchParams.get('app_no') || '')
	const [statusSearchUid, setStatusSearchUid] = useState('')
	const [statusSortBy, setStatusSortBy] = useState('created_at')
	const [statusSortOrder, setStatusSortOrder] = useState('desc')
	const [activeSearchColumn, setActiveSearchColumn] = useState(null)

	// Column Resizing
	const [columnWidths, setColumnWidths] = useState({})
	const [resizing, setResizing] = useState(null)

	useEffect(() => {
		loadStatusApplications(1)
	}, [statusSortBy, statusSortOrder])

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (activeSearchColumn && !event.target.closest('.header-search-popup') && !event.target.closest('.header-action-btn')) {
				setActiveSearchColumn(null)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [activeSearchColumn])

	const loadStatusApplications = async (page = 1, overrides = {}) => {
		setStatusLoading(true)
		setError('')
		try {
			const params = {
				page,
				application_no: overrides.application_no !== undefined ? overrides.application_no : (statusSearchAppNo || undefined),
				uid: overrides.uid !== undefined ? overrides.uid : (statusSearchUid || undefined),
				sort_by: overrides.sort_by || statusSortBy,
				sort_order: overrides.sort_order || statusSortOrder,
			}
			const endpoint = user?.role === 'user' ? '/api/tenant-forms/my' : '/api/tenancy-applications/my'
			const { data } = await api.get(endpoint, { params })
			const list = Array.isArray(data) ? data : (data?.data ?? [])
			setStatusApplications(list)
			setStatusPage(Number(data?.current_page) || 1)
			setStatusTotalPages(Number(data?.last_page) || 1)
		} catch (err) {
			setError(err?.response?.data?.message || 'Failed to load applications')
			setStatusApplications([])
		} finally {
			setStatusLoading(false)
		}
	}

	const handleStatusSort = (column) => {
		const newOrder = statusSortBy === column && statusSortOrder === 'asc' ? 'desc' : 'asc'
		setStatusSortBy(column)
		setStatusSortOrder(newOrder)
	}

	const startResizing = (id, e) => {
		e.preventDefault()
		const header = e.target.parentElement
		setResizing({
			id,
			startX: e.clientX,
			startWidth: columnWidths[id] || header.offsetWidth,
		})
	}

	useEffect(() => {
		if (!resizing) return
		const doResize = (e) => {
			const delta = e.clientX - resizing.startX
			setColumnWidths((prev) => ({
				...prev,
				[resizing.id]: Math.max(50, resizing.startWidth + delta),
			}))
		}
		const stopResizing = () => setResizing(null)
		document.addEventListener('mousemove', doResize)
		document.addEventListener('mouseup', stopResizing)
		return () => {
			document.removeEventListener('mousemove', doResize)
			document.removeEventListener('mouseup', stopResizing)
		}
	}, [resizing])

	const formatStatusText = (status, applicationType = '') => {
		const normalizedType = String(applicationType || '').toLowerCase()
		const normalizedStatus = String(status || '').trim().toLowerCase()
		if (normalizedStatus === 'submiited' || normalizedStatus === 'submitted') return 'Submitted'
		if (normalizedType.includes('tenancy certificate') && normalizedStatus === 'under process') return 'Submitted'
		return status || '-'
	}

	const copyToClipboard = (text, identifier) => {
		navigator.clipboard.writeText(text).then(() => {
			setCopiedRefCode(identifier)
			setTimeout(() => {
				setCopiedRefCode(prev => prev === identifier ? '' : prev)
			}, 2000)
		})
	}

	const StatusTableSortIcon = ({ column }) => {
		if (statusSortBy !== column) {
			return <Icon name="chevron" className="sort-icon-svg" />
		}
		return <Icon name="chevron" className={`sort-icon-svg active ${statusSortOrder === 'asc' ? 'rev' : ''}`} />
	}

	const getAwaitingPartyLabel = (initiatorRole) => {
		if (initiatorRole === 'LANDLORD') return 'Tenant'
		return 'Landlord'
	}

	const tenancyCertificateRows = statusApplications.filter((app) =>
		String(app.application_type || '').toLowerCase().includes('tenancy certificate')
	)

	const formRows = statusApplications.filter((app) =>
		!String(app.application_type || '').toLowerCase().includes('tenancy certificate')
	)

	const categories = [
		{ title: 'Tenancy Certificate', items: tenancyCertificateRows },
		{
			title: 'Revision (Form 1 / 1-A / 1-B)', items: formRows.filter(a => {
				const t = String(a.application_type || '').toLowerCase()
				return t.includes('form-i:') || t.includes('form-i-a:') || t.includes('form-i-b:')
			})
		},
		{
			title: 'Rent Court (Form 4 / 5)', items: formRows.filter(a => {
				const t = String(a.application_type || '').toLowerCase()
				return t.includes('form-iv:') || t.includes('form-v:')
			})
		},
		{
			title: 'Rent Authority (Form 6)', items: formRows.filter(a => {
				const t = String(a.application_type || '').toLowerCase()
				return t.includes('form-vi:')
			})
		},
		{
			title: 'Appeals (Form 7 / 8)', items: formRows.filter(a => {
				const t = String(a.application_type || '').toLowerCase()
				return t.includes('form-vii:') || t.includes('form-viii:')
			})
		},
	]

	const canJoin = (app) => {
		if (app.status !== 'PARTIAL') return false
		if (app.second_party_completed) return false
		if (!app.ref_code) return false

		const secondPartyRole = app.initiator_role === 'LANDLORD' ? 'TENANT' : 'LANDLORD'
		const expectedPhone = secondPartyRole === 'LANDLORD' ? app.landlord_phone : app.tenant_phone

		return user?.phone && user.phone === expectedPhone
	}

	return (
		<div className="auth-card dashboard-card">
			<h1>Application Status</h1>
			<p className="muted">Track the status of your submitted applications.</p>
			{error ? <div className="error">{error}</div> : null}
			{success ? <div className="admin-success">{success}</div> : null}

			<div className="admin-table-wrapper">
				{statusLoading ? (
					<div className="table-loader-container">
						<div className="loader-spinner"></div>
						<span className="table-loader-text">Loading applications...</span>
					</div>
				) : statusApplications.length === 0 ? (
					<div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
						No applications found.
					</div>
				) : (
					categories.map((cat, idx) => {
						const isTenancyType = cat.title === 'Tenancy Certificate'
						return cat.items.length > 0 && (
							<div key={idx} className="status-category-table">
								<div className="status-category-title">{cat.title}</div>
								<table className="admin-table status-table">
									<thead>
										<tr>
											<th style={{ width: columnWidths['status_app_no'] }}>
												<div className="th-content">
													<span>Application No</span>
													<button
														className={`header-action-btn ${statusSearchAppNo ? 'active' : ''}`}
														onClick={() => setActiveSearchColumn(activeSearchColumn === `cat-${idx}-application_no` ? null : `cat-${idx}-application_no`)}
													>
														<Icon name="search" className={`search-icon-svg ${activeSearchColumn === `cat-${idx}-application_no` ? 'active' : ''}`} />
													</button>
													{activeSearchColumn === `cat-${idx}-application_no` && (
														<div className="header-search-popup">
															<input
																type="text"
																value={statusSearchAppNo}
																onChange={(e) => setStatusSearchAppNo(e.target.value)}
																onKeyDown={(e) => e.key === 'Enter' && (loadStatusApplications(1), setActiveSearchColumn(null))}
																placeholder="Search App No..."
																autoFocus
															/>
															<div className="popup-actions">
																<button onClick={() => { loadStatusApplications(1); setActiveSearchColumn(null); }}>Find</button>
																<button className="btn-clear" onClick={() => { setStatusSearchAppNo(''); loadStatusApplications(1, { application_no: '' }); setActiveSearchColumn(null); }}>Clear</button>
															</div>
														</div>
													)}
												</div>
												<span className="resizer" onMouseDown={(e) => startResizing('status_app_no', e)} />
											</th>
											{isTenancyType && (
												<th style={{ width: columnWidths['status_uid'] }}>
													<div className="th-content">
														<span>UID</span>
														<button
															className={`header-action-btn ${statusSearchUid ? 'active' : ''}`}
															onClick={() => setActiveSearchColumn(activeSearchColumn === `cat-${idx}-uid` ? null : `cat-${idx}-uid`)}
														>
															<Icon name="search" className={`search-icon-svg ${activeSearchColumn === `cat-${idx}-uid` ? 'active' : ''}`} />
														</button>
														{activeSearchColumn === `cat-${idx}-uid` && (
															<div className="header-search-popup">
																<input
																	type="text"
																	value={statusSearchUid}
																	onChange={(e) => setStatusSearchUid(e.target.value)}
																	onKeyDown={(e) => e.key === 'Enter' && (loadStatusApplications(1), setActiveSearchColumn(null))}
																	placeholder="Search UID..."
																	autoFocus
																/>
																<div className="popup-actions">
																	<button onClick={() => { loadStatusApplications(1); setActiveSearchColumn(null); }}>Find</button>
																	<button className="btn-clear" onClick={() => { setStatusSearchUid(''); loadStatusApplications(1, { uid: '' }); setActiveSearchColumn(null); }}>Clear</button>
																</div>
															</div>
														)}
													</div>
													<span className="resizer" onMouseDown={(e) => startResizing('status_uid', e)} />
												</th>
											)}
											<th style={{ width: columnWidths['status_date'] }}>
												<div className="th-content sortable" onClick={() => handleStatusSort('created_at')}>
													<span>Application Date</span>
													<StatusTableSortIcon column="created_at" />
												</div>
												<span className="resizer" onMouseDown={(e) => startResizing('status_date', e)} />
											</th>
											<th style={{ width: columnWidths['status_status'] }}>
												<span>Status</span>
												<span className="resizer" onMouseDown={(e) => startResizing('status_status', e)} />
											</th>
											{isTenancyType && (
												<th style={{ width: columnWidths['status_completion'] }}>
													<span>Completion</span>
													<span className="resizer" onMouseDown={(e) => startResizing('status_completion', e)} />
												</th>
											)}
											<th className="table-actions-head">Actions</th>
										</tr>
									</thead>
									<tbody>
										{cat.items.map((app) => (
											<tr key={app.row_key || app.id}>
												<td>{app.application_no}</td>
												{isTenancyType && <td>{app.uid || '-'}</td>}
												<td>{formatDate(app.created_at)}</td>
												<td>{formatStatusText(app.status, app.application_type)}</td>
												{isTenancyType && (
													<td>
														{app.initiator_completed && app.second_party_completed ? (
															<span className="completion-badge completion-badge--done">Both Completed</span>
														) : (
															<span className="completion-badge completion-badge--partial">
																Awaiting {getAwaitingPartyLabel(app.initiator_role)}
															</span>
														)
														}
													</td>
												)}
												<td className="table-actions">
													<button
														type="button"
														className="secondary"
														title="View details"
														onClick={() => {
															const isTenancy = app.application_type?.toLowerCase().includes('tenancy certificate')
															const type = isTenancy ? 'tenancy' : (app.form_key || 'form')
															const identifier = app.application_no
															navigate(`/dashboard/status/${type}/${identifier}`)
														}}
													>
														View
													</button>
													{app.status === 'PARTIAL' && app.ref_code && (
														<>
															{canJoin(app) ? (
																<button
																	type="button"
																	className="secondary"
																	onClick={() => navigate(`/join?ref=${app.ref_code}`)}
																>
																	Join Now
																</button>
															) : (
																<button
																	type="button"
																	className="secondary"
																	onClick={() => copyToClipboard(`${window.location.origin}/join?ref=${app.ref_code}`, app.ref_code)}
																>
																	{copiedRefCode === app.ref_code ? '✓ Copied!' : 'Copy Invite Link'}
																</button>
															)}
														</>
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)
					})
				)}

				<div className="table-pagination">
					<button
						type="button"
						className="secondary"
						onClick={() => loadStatusApplications(statusPage - 1)}
						disabled={statusPage <= 1}
					>
						Previous
					</button>
					<span className="pagination-info">
						Page {statusPage} of {statusTotalPages}
					</span>
					<button
						type="button"
						className="secondary"
						onClick={() => loadStatusApplications(statusPage + 1)}
						disabled={statusPage >= statusTotalPages}
					>
						Next
					</button>
				</div>
			</div>
		</div>
	)
}

export default ApplicationStatus

