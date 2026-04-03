import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, error, ...props }, ref) => {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <input 
        ref={ref} 
        className="form-input" 
        {...props} 
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
