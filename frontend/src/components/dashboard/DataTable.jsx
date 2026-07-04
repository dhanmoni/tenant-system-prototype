import React, { useState, useEffect } from 'react';
import { Icon } from './Icons';

/**
 * DataTable — workspace-styled table (matches UIN status tables).
 */
const DataTable = ({
	title,
	columns,
	data,
	loading,
	onSort,
	onSearch,
	pagination,
	actions,
	emptyMessage = 'No records found.',
	accent = 'default',
	onRowClick,
	toolbar,
	totalCount,
}) => {
	const [activeSearch, setActiveSearch] = useState(null);
	const [searchValues, setSearchValues] = useState({});

	useEffect(() => {
		const handleClick = (e) => {
			if (
				activeSearch &&
				!e.target.closest('.header-search-popup') &&
				!e.target.closest('.header-action-btn')
			) {
				setActiveSearch(null);
			}
		};
		document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, [activeSearch]);

	const handleSearchSubmit = (key) => {
		if (onSearch) {
			onSearch(key, searchValues[key] || '');
		}
		setActiveSearch(null);
	};

	const handleClearSearch = (key) => {
		setSearchValues((prev) => ({ ...prev, [key]: '' }));
		if (onSearch) {
			onSearch(key, '');
		}
		setActiveSearch(null);
	};

	const colSpan = columns.length + (actions ? 1 : 0);

	return (
		<section
			className={`ws-card ws-status-category ws-status-category--${accent}`}
		>
			{title ? (
				<div className="ws-card-header ws-status-category-header">
					<h2 className="ws-card-title">{title}</h2>
					<span className="ws-status-category-count">
						{loading
							? '…'
							: totalCount != null
								? `${totalCount} total`
								: `${data.length} shown`}
					</span>
				</div>
			) : null}

			{toolbar}

			<div className="ws-card-body ws-status-table-wrap">
				<table className="ws-table ws-status-table">
					<thead>
						<tr>
							{columns.map((col) => (
								<th
									key={col.key}
									style={{ width: col.width }}
									className={col.key === 'actions' ? 'ws-status-th-actions' : ''}
								>
									{col.sortable && onSort ? (
										<button
											type="button"
											className="ws-status-th-sort"
											onClick={() => onSort(col.key)}
										>
											{col.label}
											<span className="ws-status-sort" aria-hidden>
												↕
											</span>
										</button>
									) : (
										<div className="th-content">
											<span>{col.label}</span>
											{col.searchable ? (
												<div className="header-actions">
													<button
														type="button"
														className={`header-action-btn ${
															searchValues[col.key] ? 'active' : ''
														}`}
														onClick={() =>
															setActiveSearch(
																activeSearch === col.key ? null : col.key
															)
														}
													>
														<Icon name="search" className="search-icon-svg" />
													</button>
													{activeSearch === col.key ? (
														<div className="header-search-popup">
															<input
																type="text"
																value={searchValues[col.key] || ''}
																onChange={(e) =>
																	setSearchValues({
																		...searchValues,
																		[col.key]: e.target.value,
																	})
																}
																onKeyDown={(e) =>
																	e.key === 'Enter' &&
																	handleSearchSubmit(col.key)
																}
																placeholder={`Search ${col.label}…`}
																autoFocus
															/>
															<div className="popup-actions">
																<button
																	type="button"
																	className="btn-find"
																	onClick={() => handleSearchSubmit(col.key)}
																>
																	Find
																</button>
																<button
																	type="button"
																	className="btn-clear"
																	onClick={() => handleClearSearch(col.key)}
																>
																	Clear
																</button>
															</div>
														</div>
													) : null}
												</div>
											) : null}
										</div>
									)}
								</th>
							))}
							{actions ? (
								<th className="ws-status-th-actions">Actions</th>
							) : null}
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr>
								<td colSpan={colSpan}>
									<div className="ws-empty ws-empty--compact">
										Loading data…
									</div>
								</td>
							</tr>
						) : data.length > 0 ? (
							data.map((row, rowIndex) => (
								<tr
									key={row.application_no || row.uid || row.id || rowIndex}
									className={
										onRowClick ? 'ws-status-row ws-table-row-clickable' : 'ws-status-row'
									}
									onClick={
										onRowClick ? () => onRowClick(row) : undefined
									}
								>
									{columns.map((col) => (
										<td
											key={col.key}
											className={
												col.mono
													? 'ws-status-cell-mono'
													: col.cellClassName || ''
											}
										>
											{col.render
												? col.render(row[col.key], row)
												: row[col.key] ?? '—'}
										</td>
									))}
									{actions ? (
										<td
											className="ws-status-actions"
											onClick={(e) => e.stopPropagation()}
										>
											{actions(row)}
										</td>
									) : null}
								</tr>
							))
						) : (
							<tr>
								<td colSpan={colSpan}>
									<div className="ws-empty ws-empty--compact">
										{emptyMessage}
									</div>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{pagination ? (
				<nav className="ws-status-pagination" aria-label="Table pagination">
					<button
						type="button"
						className="ws-btn ws-btn--outline"
						onClick={() =>
							pagination.onPageChange(pagination.currentPage - 1)
						}
						disabled={pagination.currentPage <= 1}
					>
						Previous
					</button>
					<span className="ws-status-pagination-info">
						Page {pagination.currentPage} of {pagination.totalPages}
					</span>
					<button
						type="button"
						className="ws-btn ws-btn--outline"
						onClick={() =>
							pagination.onPageChange(pagination.currentPage + 1)
						}
						disabled={pagination.currentPage >= pagination.totalPages}
					>
						Next
					</button>
				</nav>
			) : null}
		</section>
	);
};

export default DataTable;
