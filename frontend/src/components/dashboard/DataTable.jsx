import React, { useState, useEffect } from 'react';
import { Icon } from './Icons';

/**
 * DataTable - A shared component for admin/dashboard tables
 * matches the NIC blue-header theme.
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
    emptyMessage = "No records found."
}) => {
    const [activeSearch, setActiveSearch] = useState(null);
    const [searchValues, setSearchValues] = useState({});

    // Close search popup on click outside
    useEffect(() => {
        const handleClick = (e) => {
            if (activeSearch && !e.target.closest('.header-search-popup') && !e.target.closest('.header-action-btn')) {
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
        setSearchValues(prev => ({ ...prev, [key]: '' }));
        if (onSearch) {
            onSearch(key, '');
        }
        setActiveSearch(null);
    };

    return (
        <div className="status-category-table">
            {title && <div className="status-category-title">{title}</div>}
            
            <div className="admin-table-container">
                <table className="admin-table status-table">
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th 
                                    key={col.key} 
                                    style={{ width: col.width }}
                                    className={col.sortable ? 'sortable-header' : ''}
                                >
                                    <div className="th-content">
                                        <span 
                                            className={col.sortable ? 'sortable-trigger' : ''}
                                            onClick={() => col.sortable && onSort && onSort(col.key)}
                                        >
                                            {col.label}
                                            {col.sortable && <Icon name="chevron" className="sort-icon-svg" />}
                                        </span>

                                        {col.searchable && (
                                            <div className="header-actions">
                                                <button
                                                    className={`header-action-btn ${searchValues[col.key] ? 'active' : ''}`}
                                                    onClick={() => setActiveSearch(activeSearch === col.key ? null : col.key)}
                                                >
                                                    <Icon name="search" className="search-icon-svg" />
                                                </button>

                                                {activeSearch === col.key && (
                                                    <div className="header-search-popup">
                                                        <input
                                                            type="text"
                                                            value={searchValues[col.key] || ''}
                                                            onChange={(e) => setSearchValues({ ...searchValues, [col.key]: e.target.value })}
                                                            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(col.key)}
                                                            placeholder={`Search ${col.label}...`}
                                                            autoFocus
                                                        />
                                                        <div className="popup-actions">
                                                            <button onClick={() => handleSearchSubmit(col.key)}>Find</button>
                                                            <button className="btn-clear" onClick={() => handleClearSearch(col.key)}>Clear</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </th>
                            ))}
                            {actions && <th className="table-actions-head">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} style={{ textAlign: 'center', padding: '40px' }}>
                                    <div className="loader-spinner" style={{ margin: '0 auto' }}></div>
                                    <p className="muted" style={{ marginTop: '10px' }}>Loading data...</p>
                                </td>
                            </tr>
                        ) : data.length > 0 ? (
                            data.map((row, rowIndex) => (
                                <tr key={row.id || rowIndex}>
                                    {columns.map((col) => (
                                        <td key={col.key}>
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="table-actions">
                                            {actions(row)}
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} style={{ textAlign: 'center', padding: '32px' }}>
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && (
                <div className="table-pagination">
                    <button
                        type="button"
                        className="secondary"
                        onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage <= 1}
                    >
                        Previous
                    </button>
                    <span className="pagination-info">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                        type="button"
                        className="secondary"
                        onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage >= pagination.totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default DataTable;
