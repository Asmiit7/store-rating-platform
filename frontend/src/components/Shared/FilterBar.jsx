import './FilterBar.css';

function FilterBar({ filters, values, onChange }) {
  return (
    <div className="filter-bar">
      {filters.map((filter) => (
        <div key={filter.key} className="filter-item">
          {filter.type === 'select' ? (
            <select
              id={`filter-${filter.key}`}
              value={values[filter.key] || ''}
              onChange={(e) => onChange(filter.key, e.target.value)}
              className="filter-select"
            >
              <option value="">{filter.placeholder}</option>
              {filter.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <input
              id={`filter-${filter.key}`}
              type="text"
              placeholder={filter.placeholder}
              value={values[filter.key] || ''}
              onChange={(e) => onChange(filter.key, e.target.value)}
              className="filter-input"
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default FilterBar;
