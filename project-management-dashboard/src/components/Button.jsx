import React from 'react';

export default function Button({ 
  children, 
  variant = 'primary', 
  icon,
  className = '',
  ...props 
}) {
  return (
    <button 
      className={`btn btn-${variant} ${className}`} 
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
