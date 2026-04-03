import React, { forwardRef } from 'react';

const Select = forwardRef(({ label, error, options = [], defaultOption = "Select an option", ...props }, ref) => {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <select ref={ref} className="form-input" style={{ appearance: 'auto', backgroundColor: '#ffffffff' }} {...props}>
        <option value="">{defaultOption}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
