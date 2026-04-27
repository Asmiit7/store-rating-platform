import { useState } from 'react';
import './DataTable.css';

function DataTable({ columns, data, onSort, sortBy, sortOrder }) {
  const handleSort = (key) => {
    if (!onSort) return;
    const newOrder = sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(key, newOrder);
  };

  if (!data || data.length === 0) {
    return (
      <div className="table-empty">
        <span className="table-empty-icon">📭</span>
        <p>No data found</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.sortable ? 'sortable' : ''}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className="th-content">
                  <span>{col.label}</span>
                  {col.sortable && (
                    <span className="sort-icons">
                      <span className={`sort-arrow ${sortBy === col.key && sortOrder === 'asc' ? 'active' : ''}`}>▲</span>
                      <span className={`sort-arrow ${sortBy === col.key && sortOrder === 'desc' ? 'active' : ''}`}>▼</span>
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.id || idx}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
