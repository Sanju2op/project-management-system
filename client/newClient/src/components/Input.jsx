// @ts-nocheck
import React from 'react';

const Input = (props) => {
  const { id, label, type = 'text', placeholder, value, onChange, options = [], className = '', ...rest } = props;
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-white text-sm font-medium mb-2">
          {label}
        </label>
      )}
      {type === 'select' && options.length > 0 ? (
        <select
          id={id}
          {...(value !== undefined ? { value } : {})}
          {...(onChange ? { onChange } : {})}
          className={`w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition duration-200 placeholder-white/60 ${className}`}
          {...rest}
        >
          <option value="">{placeholder || 'Select an option'}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          id={id}
          placeholder={placeholder}
          {...(value !== undefined ? { value } : {})}
          {...(onChange ? { onChange } : {})}
          className={`w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition duration-200 placeholder-white/60 ${className}`}
          {...rest}
        />
      )}
    </div>
  );
};

export default Input;
