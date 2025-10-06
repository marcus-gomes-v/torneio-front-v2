import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={props.id} className="block text-sm/6 font-medium text-gray-900 dark:text-white">
            {label}
          </label>
        )}
        <div className={label ? 'mt-2' : ''}>
          <input
            ref={ref}
            className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500 ${
              error ? 'outline-red-600 focus:outline-red-600' : ''
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
        {helperText && !error && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
